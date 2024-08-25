import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from 'openai'

function getUrlFromResponse(text){
  
  const urlFromResponse =  /https:\/\/www\.ratemyprofessors\.com\/professor\/\d+/g;
  // returns an array of matches or an empty array if no match is found, returns an array because of the global flag which means there could be more than one url in the text
  return text.match(urlFromResponse) || []; 
}

function urlToText(text, processed_data, urls) {
  console.log("here");
  for(let i = 0; i < urls.length; i++){
    text = text.replace(
      urls[i], 
      processed_data[i].id + " with " + processed_data[i].metadata["rating"] + " star rating in " + processed_data[i].metadata["department"]
    );
  }
  return text;
}

const axios = require('axios');
const cheerio = require('cheerio');

async function webScraping(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    const name = $('div.NameTitle__Name-dowf0z-0 span').first().text().trim();
    const lastName = $('div.NameTitle__Name-dowf0z-0 span.NameTitle__LastNameWrapper-dowf0z-2').first().text().trim();
    const fullName = `${name} ${lastName}`;
    const ratingText = $('div.RatingValue__Numerator-qw8sqy-2').text().trim();
    const comments = $('div.Comments__StyledComments-dzzyvm-0').text().trim();
    const departmentName = $('a.TeacherDepartment__StyledDepartmentLink-fl79e8-0').text().trim();

    const review = {
      name: fullName,
      rating: ratingText,
      review: comments,
      department: departmentName,
    };
    return review;
  } catch (error) {
    console.error(`Failed to retrieve the webpage. Error: ${error}`);
    return null;
  }
}


// I take my pinecone database, i extract all urls from user response, i send those urls to scrape data from the function, i take the json format, i create embeddings and push it to the processed data. I take the processed data and push it to the pinecone database.
async function putDataInPC(openai, index, text) {
  const urls = getUrlFromResponse(text);
  const processedData = [];

  for (const url of urls) {
    const scrapedData = await webScraping(url);
    if (scrapedData) { 
      try {
        const response = await openai.embeddings.create({ 
          input: scrapedData.review, 
          model: "text-embedding-3-small",
        });
        const embedding = response.data[0].embedding;
        processedData.push({
          values: embedding,
          id: scrapedData.name,
          metadata: {
            department: scrapedData.department,
            rating: scrapedData.rating,
            review: scrapedData.review,
          }
        });
      } catch (error) {
        console.error('Error creating embedding:', error);
      }
    }
  }
  try {
      await index.upsert(processedData);
      console.log('Data successfully upserted to Pinecone');
      console.log("here1");
      return urlToText(text, processedData, urls);
    
  } catch (error) {
    console.error('Error upserting data:', error);
    return null;
  }
}

const systemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed. If user doesn't give any information about a professor, don't randomly give user information about a professor, only give when user asks for one. 
If user doesn't put any professor related information, just ask for it. Don't tell the user that they provided information about professors because the information is from a database.
`
function filteredResponse(text) {
  // Remove standalone asterisks
  text = text.replace(/\*\*/g, '');
  
  // Remove asterisks around words
  text = text.replace(/\*\*(\w+)\*\*/g, '$1');
  
  return text;
}

export async function POST(req) {   
    const data = await req.json()


    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    })
    const index = pc.index('rmp-rag-chatbot').namespace('ns1')
    const openai = new OpenAI()

    let text = data[data.length - 1].content

    if (getUrlFromResponse(text).length > 0) {
      text = await putDataInPC(openai, index, text);
    }
    const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',

    })
    const results = await index.query({
        topK: 5,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
    })

    let resultString = ''
    results.matches.forEach((match) => {
        resultString += `
    Returned Results:
    Professor: ${match.id}
    Review: ${match.metadata.review}
    Department: ${match.metadata.department}
    Rating: ${match.metadata.rating}
    Would Take Again: ${match.metadata.wouldTakeAgain}
    Course: ${match.metadata.course}
    Difficulty: ${match.metadata.difficulty}
    textbookUse: ${match.metadata.textbookUse}
    Attendance: ${match.metadata.attendance}
    Grade: ${match.metadata.grade}
    Review: ${match.metadata.review}
    Date: ${match.metadata.date}
  \n\n`
    })
    const lastMessage = data[data.length - 1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1)

    const completion = await openai.chat.completions.create({
        messages: [
          {role: 'system', content: systemPrompt},
          ...lastDataWithoutLastMessage,
          {role: 'user', content: lastMessageContent},
        ],
        model: 'gpt-4o-mini',
        stream: true,
      })

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content
              if (content) {
                const text = encoder.encode(filteredResponse(content))
                controller.enqueue(text)
              }
            }
          } catch (err) {
            controller.error(err)
          } finally {
            controller.close()
          }
        },
      })
      return new NextResponse(stream)
}