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
## 🏗️ System Architecture

```mermaid
graph TD

A["👤 User"]
B["💻 React + Vite Frontend"]
C["⚡ FastAPI Backend"]
D["🤖 Groq API<br/>Llama 3.3 70B"]
E["🗄 PostgreSQL Database"]
F["📄 Resume Parser"]
G["📑 PDF Report Generator"]
H["📊 Analytics Dashboard"]

A -->|Uses| B
B -->|REST API| C
C -->|Generate Questions| D
C -->|Store Data| E
C -->|Parse Resume| F
C -->|Generate Reports| G
C -->|Statistics| H
```

## 🔄 Application Workflow

```mermaid
flowchart LR

A["👤 User Login"]
B["🎯 Select Job Role"]
C["📄 Upload Resume (Optional)"]
D["🤖 AI Generates Questions"]
E["🎤 Answer Interview Questions"]
F["🧠 AI Evaluates Answers"]
G["📊 Performance Dashboard"]
H["📄 Download PDF Report"]
I["🚀 Career Recommendations"]

A --> B
B --> C
C --> D
D --> E
E --> F
F --> G
G --> H
H --> I
```

## 🔐 Authentication Flow

```mermaid
sequenceDiagram

participant User
participant Frontend
participant Backend
participant Database

User->>Frontend: Login
Frontend->>Backend: POST /login
Backend->>Database: Verify Credentials
Database-->>Backend: User Found
Backend-->>Frontend: JWT Token
Frontend-->>User: Login Successful

User->>Frontend: Open Dashboard
Frontend->>Backend: Send JWT
Backend-->>Frontend: Dashboard Data
Frontend-->>User: Show Dashboard
```

## 🤖 AI Interview Pipeline

```mermaid
flowchart TD

A["👤 Candidate"]

B["📄 Resume Upload"]

C["📑 Resume Parsing"]

D["🧠 Skill Extraction"]

E["🤖 Groq AI"]

F["❓ Personalized Questions"]

G["🎙 Candidate Answers"]

H["📊 AI Evaluation"]

I["📈 Performance Report"]

J["🚀 Career Suggestions"]

A --> B
B --> C
C --> D
D --> E
E --> F
F --> G
G --> H
H --> I
I --> J
```

## 🏛 Backend Architecture

```mermaid
graph TD

Client["🌐 React Frontend"]

API["⚡ FastAPI"]

Auth["🔐 JWT Authentication"]

Interview["🎤 Interview Service"]

Resume["📄 Resume Service"]

Groq["🤖 Groq AI"]

Database["🗄 PostgreSQL"]

PDF["📑 Report Generator"]

Client --> API

API --> Auth

API --> Interview

API --> Resume

Interview --> Groq

Interview --> Database

Resume --> Groq

Resume --> Database

Interview --> PDF
```

## 🗄 Database Design

```mermaid
erDiagram

USER {

int id

string name

string email

string password

}

INTERVIEW {

int id

string role

string difficulty

datetime created_at

}

QUESTION {

int id

string question

}

ANSWER {

int id

string answer

int score

}

REPORT {

int id

float overall_score

string feedback

}

USER ||--o{ INTERVIEW : creates

INTERVIEW ||--o{ QUESTION : contains

QUESTION ||--|| ANSWER : answered_by

INTERVIEW ||--|| REPORT : generates
```


## 📡 API Request Flow

```mermaid
graph LR

User["👤 User"]

Frontend["💻 React"]

API["⚡ FastAPI"]

Auth["🔐 Auth API"]

Interview["🎤 Interview API"]

Resume["📄 Resume API"]

Analytics["📊 Analytics API"]

Groq["🤖 Groq"]

Database["🗄 PostgreSQL"]

User --> Frontend

Frontend --> Auth

Frontend --> Interview

Frontend --> Resume

Frontend --> Analytics

Auth --> API

Interview --> API

Resume --> API

Analytics --> API

API --> Groq

API --> Database
```

## 🧠 AI Answer Evaluation

```mermaid
flowchart LR

A["Candidate Answer"]

B["Groq AI"]

C["Technical Score"]

D["Communication"]

E["Problem Solving"]

F["Confidence"]

G["Final Score"]

A --> B

B --> C

B --> D

B --> E

B --> F

C --> G

D --> G

E --> G

F --> G
```


## 📈 User Journey

```mermaid
journey

title InterviewIQ User Journey

section Registration

Create Account: 5: User

Login: 5: User

section Preparation

Choose Role: 5: User

Upload Resume: 4: User

Generate Questions: 5: AI

section Interview

Answer Questions: 5: User

AI Evaluation: 5: AI

section Completion

Dashboard: 5: User

Download Report: 5: User

Career Suggestions: 5: AI
```
## 🛠 Technology Stack

```mermaid
graph TD

A[InterviewIQ AI]

A --> B[Frontend]
B --> B1[React]
B --> B2[Vite]
B --> B3[Tailwind CSS]
B --> B4[Framer Motion]
B --> B5[Recharts]

A --> C[Backend]
C --> C1[FastAPI]
C --> C2[SQLAlchemy]
C --> C3[Pydantic]

A --> D[Authentication]
D --> D1[JWT]
D --> D2[bcrypt]

A --> E[Database]
E --> E1[PostgreSQL]

A --> F[AI]
F --> F1[Groq API]
F --> F2[Llama 3.3 70B]

A --> G[Deployment]
G --> G1[Docker]
G --> G2[Render]
G --> G3[GitHub]
```

## 🚀 Deployment Architecture

```mermaid
graph TD

Developer["👨‍💻 Developer"]

GitHub["📂 GitHub Repository"]

Render["☁ Render"]

Frontend["🌐 Frontend"]

Backend["⚡ Backend"]

Postgres["🗄 PostgreSQL"]

Groq["🤖 Groq AI"]

Users["👥 End Users"]

Developer --> GitHub

GitHub --> Render

Render --> Frontend

Render --> Backend

Backend --> Postgres

Backend --> Groq

Users --> Frontend
```

<div align="center">

# 🚀 Live Demo

<a href="https://interview-ai-2-odxg.onrender.com/" target="_blank">

<img src="https://img.shields.io/badge/🚀%20Launch%20InterviewIQ%20AI-Live%20Demo-success?style=for-the-badge"/>

</a>

### ⭐ Experience AI-Powered Interview Preparation in Real Time

</div>
