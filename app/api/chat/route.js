import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from 'openai'

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

    const text = data[data.length - 1].content
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
  Department: ${match.metadata.department}
  Course: ${match.metadata.course}
  Rating: ${match.metadata.rating}
  Difficulty: ${match.metadata.difficulty}
  Would Take Again: ${match.metadata.wouldTakeAgain}
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