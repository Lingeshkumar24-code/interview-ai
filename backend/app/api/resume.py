from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import pdfplumber
import io

from app.database.database import get_db
from app.models.user import User
from app.models.interview import Interview
from app.models.question import Question
from app.utils.jwt import get_current_user
from app.services.groq_service import analyze_resume_and_generate_questions

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    question_count: int = Query(default=10, ge=5, le=15),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()

    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    try:
        questions = analyze_resume_and_generate_questions(text, question_count)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Question generation failed: {str(e)}"
        )

    interview = Interview(
        user_id=current_user.id,
        role="Resume-Based Interview",
        experience="As per Resume",
        difficulty="Adaptive",
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    saved_questions = []
    for i, q in enumerate(questions):
        question = Question(
            interview_id=interview.id,
            question_text=q.get("question", ""),
            order_index=i,
        )
        db.add(question)
        db.commit()
        db.refresh(question)
        saved_questions.append(
            {"id": question.id, "question_text": question.question_text}
        )

    return {
        "interview_id": interview.id,
        "resume_preview": text[:500] + "..." if len(text) > 500 else text,
        "questions": saved_questions,
    }
