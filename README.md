# 🎓 AI Rate My Professor

<div align="center">

*An AI chatbot that provides insights on professor reviews.*

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://ai-rate-my-professor-red.vercel.app/)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=flat&logo=Next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=flat&logo=material-ui&logoColor=white)](https://mui.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-4285F4?style=flat&logo=openai&logoColor=white)](https://openai.com/)
[![LangChain](https://img.shields.io/badge/LangChain-FF9900?style=flat&logo=langchain&logoColor=white)](https://langchain.com/)

[Features](#-key-features) • [Installation](#-installation-and-setup) • [Usage](#-usage-guide) • [Challenges](#-challenges-and-learnings) • [Future Improvements](#-future-improvements)

<img src="/public/screenshot1.png" alt="View" width="400"/>
<img src="/public/screenshot2.png" alt="Query View" width="400"/>
</div>

## 🌟 Project Overview

**AI Rate My Professor** is an AI chatbot that helps users evaluate professors based on reviews scraped from the Rate My Professor website. Users can provide a link, and the chatbot responds to queries about the professor's quality and recommends the best professors for specific subjects or conditions.

### 🎯 Key Features

- 💬 **AI-Powered Insights**: Provides evaluations based on professor reviews.
- 📊 **Data Scraping**: Scrapes data from Rate My Professor for accurate information.
- 🤖 **Personalized Recommendations**: Suggests the best professors based on user queries.
- 🌐 **Web-based Interface**: User-friendly chat interface accessible through any web browser.

## 🛠 Technologies Used

### Frontend
- ⚛️ Next.js & React
- 🎨 Material-UI
- 🤖 OpenAI API
- 🔗 LangChain
- 🗄️ Pinecone DB

## 💻 Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Ahmedayaz1210/AI-rate-my-professor.git
   cd customer-support-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Material-UI:
   ```bash
   npm install @mui/material @emotion/react @emotion/styled
   ```

4. Install Google Generative AI:
   ```bash
   npm i @google/generative-ai
   ```

5. Environment Setup:
   Create a `.env.local` file in the root directory and add:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📘 Usage Guide

1. Visit the [live demo](https://ai-rate-my-professor-red.vercel.app/)
2. Provide a link from the Rate My Professor website in the chat interface.
3. Ask the chatbot if the professor is good or request recommendations for other professors.
4. Engage in conversation for more insights or specific queries.

## 💡 Challenges and Learnings

1. Faced challenges with data scraping from URLs, which was a new experience.
2. Learned to efficiently index professors based on the scraped data for better user interaction.

## 🚀 Future Improvements

1. 📈 Enhance scraping techniques for more reliable data extraction.
2. 🌍 Expand the chatbot's capabilities to cover additional educational platforms.
3. 🔍 Implement analytics to improve response accuracy based on user queries.
4. 🗣️ Add support for user reviews to enrich the recommendation process.

## 🤝 Contributing

Contributions to enhance AI Rate My Professor are welcome! Feel free to fork the repository, make improvements, and submit pull requests. Together, we can improve this AI chatbot for students everywhere.

Happy Coding!🚀
---

