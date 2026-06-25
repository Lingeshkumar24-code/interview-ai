import os
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

# Allow origins from env var (comma-separated) or fall back to defaults
_cors_env = os.getenv("CORS_ORIGINS", "")
_extra_origins = [o.strip() for o in _cors_env.split(",") if o.strip()]

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
] + _extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",  # covers all onrender.com subdomains
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
