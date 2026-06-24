from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import json
import io

from app.database.database import get_db
from app.models.user import User
from app.models.interview import Interview
from app.models.question import Question
from app.models.answer import Answer
from app.models.evaluation import Evaluation
from app.schemas.interview import InterviewCreate, AnswerSubmit
from app.utils.jwt import get_current_user
from app.services.groq_service import (
    generate_questions,
    evaluate_answer,
    generate_interview_summary,
    generate_career_recommendations,
    generate_skill_gap_analysis,
)
from app.services.pdf_service import generate_interview_report_pdf

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.get("/stats/dashboard", response_model=dict)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interviews = (
        db.query(Interview)
        .filter(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.desc())
        .all()
    )

    if not interviews:
        return {
            "total_interviews": 0,
            "average_score": 0,
            "highest_score": 0,
            "interview_readiness": "Beginner",
            "recent_interviews": [],
            "score_history": [],
        }

    scores = [iv.overall_score for iv in interviews]
    avg_score = sum(scores) / len(scores)
    highest = max(scores)

    if avg_score >= 90:
        readiness = "Excellent"
    elif avg_score >= 75:
        readiness = "Ready"
    elif avg_score >= 60:
        readiness = "Needs Improvement"
    else:
        readiness = "Beginner"

    recent = [
        {
            "id": iv.id,
            "role": iv.role,
            "difficulty": iv.difficulty,
            "overall_score": iv.overall_score,
            "created_at": iv.created_at.isoformat(),
        }
        for iv in interviews[:5]
    ]

    score_history = [
        {
            "date": iv.created_at.strftime("%m/%d"),
            "score": iv.overall_score,
            "role": iv.role,
        }
        for iv in reversed(interviews[-10:])
    ]

    return {
        "total_interviews": len(interviews),
        "average_score": round(avg_score, 1),
        "highest_score": highest,
        "interview_readiness": readiness,
        "recent_interviews": recent,
        "score_history": score_history,
    }


@router.post("/", response_model=dict)
def create_interview(
    data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = Interview(
        user_id=current_user.id,
        role=data.role,
        experience=data.experience,
        difficulty=data.difficulty,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    try:
        questions_data = generate_questions(
            data.role, data.experience, data.difficulty, data.question_count
        )
    except Exception as e:
        db.delete(interview)
        db.commit()
        raise HTTPException(
            status_code=500, detail=f"Failed to generate questions: {str(e)}"
        )

    questions = []
    for i, q in enumerate(questions_data):
        question = Question(
            interview_id=interview.id,
            question_text=q.get("question", ""),
            order_index=i,
        )
        db.add(question)
        db.commit()
        db.refresh(question)
        questions.append(
            {
                "id": question.id,
                "question_text": question.question_text,
                "order_index": question.order_index,
            }
        )

    return {
        "interview_id": interview.id,
        "role": interview.role,
        "experience": interview.experience,
        "difficulty": interview.difficulty,
        "questions": questions,
    }


@router.get("/", response_model=List[dict])
def list_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interviews = (
        db.query(Interview)
        .filter(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.desc())
        .all()
    )

    result = []
    for iv in interviews:
        q_count = (
            db.query(Question).filter(Question.interview_id == iv.id).count()
        )
        result.append(
            {
                "id": iv.id,
                "role": iv.role,
                "experience": iv.experience,
                "difficulty": iv.difficulty,
                "overall_score": iv.overall_score,
                "question_count": q_count,
                "ai_summary": iv.ai_summary,
                "created_at": iv.created_at.isoformat(),
            }
        )
    return result


@router.get("/{interview_id}", response_model=dict)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = (
        db.query(Question)
        .filter(Question.interview_id == interview_id)
        .order_by(Question.order_index)
        .all()
    )

    questions_data = []
    for q in questions:
        q_data = {
            "id": q.id,
            "question_text": q.question_text,
            "order_index": q.order_index,
        }
        if q.answer:
            q_data["answer"] = q.answer.answer_text
            if q.answer.evaluation:
                ev = q.answer.evaluation
                q_data["evaluation"] = {
                    "technical_accuracy": ev.technical_accuracy,
                    "concept_clarity": ev.concept_clarity,
                    "depth": ev.depth,
                    "communication": ev.communication,
                    "problem_solving": ev.problem_solving,
                    "overall_score": ev.overall_score,
                    "strengths": json.loads(ev.strengths) if ev.strengths else [],
                    "weaknesses": json.loads(ev.weaknesses) if ev.weaknesses else [],
                    "improvements": json.loads(ev.improvements) if ev.improvements else [],
                    "ideal_answer": ev.ideal_answer,
                    "feedback": ev.feedback,
                }
        questions_data.append(q_data)

    return {
        "id": interview.id,
        "role": interview.role,
        "experience": interview.experience,
        "difficulty": interview.difficulty,
        "overall_score": interview.overall_score,
        "ai_summary": interview.ai_summary,
        "created_at": interview.created_at.isoformat(),
        "questions": questions_data,
    }


@router.post("/{interview_id}/submit-answer", response_model=dict)
def submit_answer(
    interview_id: int,
    data: AnswerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    question = (
        db.query(Question)
        .filter(
            Question.id == data.question_id,
            Question.interview_id == interview_id,
        )
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    existing_answer = (
        db.query(Answer).filter(Answer.question_id == data.question_id).first()
    )
    if existing_answer:
        answer = existing_answer
        answer.answer_text = data.answer_text
        if answer.evaluation:
            db.delete(answer.evaluation)
            db.commit()
    else:
        answer = Answer(
            question_id=data.question_id, answer_text=data.answer_text
        )
        db.add(answer)

    db.commit()
    db.refresh(answer)

    try:
        eval_data = evaluate_answer(
            interview.role, question.question_text, data.answer_text
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Evaluation failed: {str(e)}"
        )

    evaluation = Evaluation(
        answer_id=answer.id,
        technical_accuracy=eval_data.get("technical_accuracy", 0),
        concept_clarity=eval_data.get("concept_clarity", 0),
        depth=eval_data.get("depth", 0),
        communication=eval_data.get("communication", 0),
        problem_solving=eval_data.get("problem_solving", 0),
        overall_score=eval_data.get("overall_score", 0),
        strengths=json.dumps(eval_data.get("strengths", [])),
        weaknesses=json.dumps(eval_data.get("weaknesses", [])),
        improvements=json.dumps(eval_data.get("improvements", [])),
        ideal_answer=eval_data.get("ideal_answer", ""),
        feedback=eval_data.get("feedback", ""),
    )
    db.add(evaluation)
    db.commit()

    return {"question_id": data.question_id, "evaluation": eval_data}


@router.post("/{interview_id}/complete", response_model=dict)
def complete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = (
        db.query(Question)
        .filter(Question.interview_id == interview_id)
        .all()
    )

    evaluations_data = []
    total_score = 0
    count = 0

    for q in questions:
        if q.answer and q.answer.evaluation:
            ev = q.answer.evaluation
            eval_dict = {
                "question": q.question_text,
                "answer": q.answer.answer_text,
                "technical_accuracy": ev.technical_accuracy,
                "concept_clarity": ev.concept_clarity,
                "depth": ev.depth,
                "communication": ev.communication,
                "problem_solving": ev.problem_solving,
                "overall_score": ev.overall_score,
                "strengths": json.loads(ev.strengths) if ev.strengths else [],
                "weaknesses": json.loads(ev.weaknesses) if ev.weaknesses else [],
            }
            evaluations_data.append(eval_dict)
            total_score += ev.overall_score
            count += 1

    avg_score = total_score / count if count > 0 else 0

    try:
        ai_summary = generate_interview_summary(interview.role, evaluations_data)
    except Exception:
        ai_summary = f"Interview completed for {interview.role} position with an overall score of {avg_score:.1f}/100."

    interview.overall_score = avg_score
    interview.ai_summary = ai_summary
    db.commit()

    if avg_score >= 90:
        readiness = "Excellent"
    elif avg_score >= 75:
        readiness = "Ready"
    elif avg_score >= 60:
        readiness = "Needs Improvement"
    else:
        readiness = "Beginner"

    return {
        "interview_id": interview_id,
        "overall_score": avg_score,
        "readiness": readiness,
        "ai_summary": ai_summary,
        "evaluated_count": count,
        "total_questions": len(questions),
    }


@router.get("/{interview_id}/report", response_model=dict)
def get_report(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = (
        db.query(Question)
        .filter(Question.interview_id == interview_id)
        .order_by(Question.order_index)
        .all()
    )

    questions_answers = []
    tech_scores, comm_scores, ps_scores = [], [], []

    for q in questions:
        qa = {"question": q.question_text, "answer": None, "evaluation": None}
        if q.answer:
            qa["answer"] = q.answer.answer_text
            if q.answer.evaluation:
                ev = q.answer.evaluation
                qa["evaluation"] = {
                    "technical_accuracy": ev.technical_accuracy,
                    "concept_clarity": ev.concept_clarity,
                    "depth": ev.depth,
                    "communication": ev.communication,
                    "problem_solving": ev.problem_solving,
                    "overall_score": ev.overall_score,
                    "strengths": json.loads(ev.strengths) if ev.strengths else [],
                    "weaknesses": json.loads(ev.weaknesses) if ev.weaknesses else [],
                    "improvements": json.loads(ev.improvements) if ev.improvements else [],
                    "ideal_answer": ev.ideal_answer,
                    "feedback": ev.feedback,
                }
                tech_scores.append(ev.technical_accuracy)
                comm_scores.append(ev.communication)
                ps_scores.append(ev.problem_solving)
        questions_answers.append(qa)

    avg_tech = sum(tech_scores) / len(tech_scores) if tech_scores else 0
    avg_comm = sum(comm_scores) / len(comm_scores) if comm_scores else 0
    avg_ps = sum(ps_scores) / len(ps_scores) if ps_scores else 0
    overall = interview.overall_score

    if overall >= 90:
        readiness = "Excellent"
    elif overall >= 75:
        readiness = "Ready"
    elif overall >= 60:
        readiness = "Needs Improvement"
    else:
        readiness = "Beginner"

    evaluations_list = [
        qa["evaluation"] for qa in questions_answers if qa["evaluation"]
    ]
    skill_gap = {}
    try:
        skill_gap = generate_skill_gap_analysis(interview.role, evaluations_list)
    except Exception:
        skill_gap = {
            "strong_areas": [],
            "weak_areas": [],
            "missing_skills": [],
            "learning_resources": [],
        }

    return {
        "interview": {
            "id": interview.id,
            "role": interview.role,
            "experience": interview.experience,
            "difficulty": interview.difficulty,
            "created_at": interview.created_at.isoformat(),
        },
        "candidate": {"name": current_user.name, "email": current_user.email},
        "scores": {
            "overall": overall,
            "technical": avg_tech,
            "communication": avg_comm,
            "problem_solving": avg_ps,
            "readiness": readiness,
        },
        "ai_summary": interview.ai_summary,
        "questions_answers": questions_answers,
        "skill_gap": skill_gap,
    }


@router.get("/{interview_id}/pdf")
def download_pdf(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = (
        db.query(Question)
        .filter(Question.interview_id == interview_id)
        .order_by(Question.order_index)
        .all()
    )

    questions_answers = []
    tech_scores, comm_scores, ps_scores = [], [], []

    for q in questions:
        qa = {
            "question": q.question_text,
            "answer": "No answer provided",
            "evaluation": None,
        }
        if q.answer:
            qa["answer"] = q.answer.answer_text or "No answer provided"
            if q.answer.evaluation:
                ev = q.answer.evaluation
                qa["evaluation"] = {
                    "technical_accuracy": ev.technical_accuracy,
                    "concept_clarity": ev.concept_clarity,
                    "depth": ev.depth,
                    "communication": ev.communication,
                    "problem_solving": ev.problem_solving,
                    "overall_score": ev.overall_score,
                    "feedback": ev.feedback,
                }
                tech_scores.append(ev.technical_accuracy)
                comm_scores.append(ev.communication)
                ps_scores.append(ev.problem_solving)
        questions_answers.append(qa)

    report_data = {
        "candidate_name": current_user.name,
        "role": interview.role,
        "experience": interview.experience,
        "difficulty": interview.difficulty,
        "total_questions": len(questions),
        "overall_score": interview.overall_score,
        "technical_score": sum(tech_scores) / len(tech_scores) if tech_scores else 0,
        "communication_score": sum(comm_scores) / len(comm_scores) if comm_scores else 0,
        "problem_solving_score": sum(ps_scores) / len(ps_scores) if ps_scores else 0,
        "ai_summary": interview.ai_summary,
        "questions_answers": questions_answers,
    }

    pdf_bytes = generate_interview_report_pdf(report_data)
    token = current_user.id  # just to confirm auth was checked

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=interview_report_{interview_id}.pdf"
        },
    )


@router.get("/{interview_id}/career")
def get_career_recommendations(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = (
        db.query(Question).filter(Question.interview_id == interview_id).all()
    )
    evaluations_list = []
    for q in questions:
        if q.answer and q.answer.evaluation:
            ev = q.answer.evaluation
            evaluations_list.append(
                {
                    "technical_accuracy": ev.technical_accuracy,
                    "concept_clarity": ev.concept_clarity,
                    "depth": ev.depth,
                    "communication": ev.communication,
                    "problem_solving": ev.problem_solving,
                    "overall_score": ev.overall_score,
                }
            )

    try:
        recommendations = generate_career_recommendations(
            interview.role, interview.overall_score, evaluations_list
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}",
        )

    return recommendations
