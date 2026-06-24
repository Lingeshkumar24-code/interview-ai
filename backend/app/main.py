from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database.database import engine, Base
import app.models  # registers all models


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="InterviewIQ AI API",
    description="AI-powered Interview Coaching Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import auth, interviews, resume

app.include_router(auth.router)
app.include_router(interviews.router)
app.include_router(resume.router)


@app.get("/")
def root():
    return {"message": "InterviewIQ AI API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
