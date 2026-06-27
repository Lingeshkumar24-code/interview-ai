<div align="center">

# 🧠 InterviewIQ AI
### AI-Powered Interview Coach

<p>
An intelligent interview preparation platform powered by <b>Groq AI + Llama 3.3 70B</b>.
Generate realistic interview questions, receive AI feedback, analyze resumes, and improve your interview performance.
</p>

<p>

<a href="https://interview-ai-2-odxg.onrender.com">
<img src="https://img.shields.io/badge/🚀_Live_Demo-Try_Now-success?style=for-the-badge">
</a>

<a href="YOUR_GITHUB_REPO">
<img src="https://img.shields.io/github/stars/USERNAME/REPO?style=for-the-badge">
</a>

<a href="YOUR_GITHUB_REPO/issues">
<img src="https://img.shields.io/github/issues/USERNAME/REPO?style=for-the-badge">
</a>

</p>

</div>  
## 🚀 Live Demo

### 👉 **Try InterviewIQ AI**

<p align="center">

<a href="https://interview-ai-2-odxg.onrender.com">
<img src="https://img.shields.io/badge/OPEN-LIVE_DEMO-brightgreen?style=for-the-badge">
</a>

</p>

> ⚡ Experience AI-powered interview simulations instantly.
flowchart LR

A[User Login]
B[Choose Role]
C[Generate Questions]
D[AI Interview]
E[Evaluate Answers]
F[Performance Report]
G[Career Suggestions]

A --> B
B --> C
C --> D
D --> E
E --> F
F --> G 

graph TD

User[👤 User]

Frontend[React + Vite]

Backend[FastAPI]

Groq[Groq API
Llama 3.3 70B]

DB[(PostgreSQL)]

PDF[PDF Generator]

Resume[Resume Parser]

User --> Frontend

Frontend --> Backend

Backend --> DB

Backend --> Groq

Backend --> Resume

Backend --> PDF



graph LR

Resume --> AI

AI --> Questions

Questions --> Candidate

Candidate --> Answers

Answers --> LLM

LLM --> Score

Score --> Report

flowchart TD

PDF --> Text

Text --> SkillExtraction

SkillExtraction --> AIQuestions

AIQuestions --> Interview
