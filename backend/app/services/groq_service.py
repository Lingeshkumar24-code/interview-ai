import json
import re
from groq import Groq
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


def clean_json_response(text: str) -> str:
    """Extract JSON from markdown code blocks or raw text."""
    # Try to find JSON inside ```json ... ``` or ``` ... ``` blocks
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
    if match:
        return match.group(1).strip()

    # Fallback: strip to first { or [ and last } or ]
    text = text.strip()
    brace_start = text.find('{')
    bracket_start = text.find('[')

    if brace_start == -1 and bracket_start == -1:
        return text

    if brace_start == -1:
        start = bracket_start
    elif bracket_start == -1:
        start = brace_start
    else:
        start = min(brace_start, bracket_start)

    brace_end = text.rfind('}')
    bracket_end = text.rfind(']')
    end = max(brace_end, bracket_end) + 1

    if start < end:
        return text[start:end]
    return text


def generate_questions(role: str, experience: str, difficulty: str, count: int) -> list:
    """Generate interview questions using Groq API."""
    prompt = f"""You are an expert technical interviewer. Generate exactly {count} interview questions.

Role: {role}
Experience Level: {experience}
Difficulty: {difficulty}

Cover these areas:
- Core Concepts and fundamentals
- Problem Solving scenarios
- Scenario Based Questions
- Practical Industry Questions
- Best Practices

Return ONLY valid JSON, no explanation:
{{
  "questions": [
    {{"id": 1, "question": "Your question here?"}},
    {{"id": 2, "question": "Your question here?"}}
  ]
}}

Generate exactly {count} questions for {role} at {difficulty} difficulty."""

    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=2000
    )

    raw = response.choices[0].message.content
    cleaned = clean_json_response(raw)
    data = json.loads(cleaned)
    return data.get('questions', [])


def evaluate_answer(role: str, question: str, answer: str) -> dict:
    """Evaluate a candidate's answer using Groq API."""
    if not answer or answer.strip() == '':
        return {
            "technical_accuracy": 0,
            "concept_clarity": 0,
            "depth": 0,
            "communication": 0,
            "problem_solving": 0,
            "overall_score": 0,
            "strengths": [],
            "weaknesses": ["No answer provided"],
            "improvements": ["Please attempt to answer the question"],
            "ideal_answer": "A comprehensive answer covering the key concepts would be expected here.",
            "feedback": "No answer was provided for this question."
        }

    prompt = f"""You are a Senior Technical Interviewer evaluating a candidate for {role} position.

Question: {question}

Candidate's Answer: {answer}

Evaluate the answer on these 5 criteria (each out of 10):
1. Technical Accuracy (correctness of technical facts)
2. Concept Clarity (how clearly concepts are explained)
3. Depth of Knowledge (depth and completeness)
4. Communication Skills (how well the answer is articulated)
5. Problem Solving (analytical and problem-solving approach)

Return ONLY valid JSON:
{{
  "technical_accuracy": <number 0-10>,
  "concept_clarity": <number 0-10>,
  "depth": <number 0-10>,
  "communication": <number 0-10>,
  "problem_solving": <number 0-10>,
  "overall_score": <average of 5 scores multiplied by 2, so 0-100 scale>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "improvements": ["specific improvement suggestion 1", "suggestion 2"],
  "ideal_answer": "A comprehensive ideal answer for this question covering all key points...",
  "feedback": "Overall personalized feedback for the candidate"
}}"""

    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1500
    )

    raw = response.choices[0].message.content
    cleaned = clean_json_response(raw)
    return json.loads(cleaned)


def generate_interview_summary(role: str, evaluations: list) -> str:
    """Generate an AI narrative summary for the interview report."""
    eval_text = json.dumps(evaluations, indent=2)
    prompt = f"""You are a senior HR professional. Based on these interview evaluations for a {role} position, \
write a professional 3-4 sentence summary of the candidate's performance.

Evaluations: {eval_text}

Write a professional, encouraging yet honest summary. Mention specific strengths and areas for improvement."""

    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=400
    )
    return response.choices[0].message.content


def analyze_resume_and_generate_questions(resume_text: str, count: int = 10) -> list:
    """Analyze a resume and generate targeted interview questions."""
    prompt = f"""Analyze this resume and generate exactly {count} interview questions based on the \
candidate's actual experience, projects, and skills.

Resume:
{resume_text[:3000]}

Generate targeted questions about:
- Their specific projects mentioned
- Technologies they've listed
- Their work experience
- Skills they claim to have
- Gaps or interesting points in their background

Return ONLY valid JSON:
{{
  "questions": [
    {{"id": 1, "question": "Specific question about their resume"}}
  ]
}}"""

    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
        max_tokens=2000
    )

    raw = response.choices[0].message.content
    cleaned = clean_json_response(raw)
    data = json.loads(cleaned)
    return data.get('questions', [])


def generate_career_recommendations(role: str, overall_score: float, evaluations: list) -> dict:
    """Generate personalised career recommendations based on interview performance."""
    eval_summary = json.dumps(evaluations, indent=2)
    prompt = f"""Based on this candidate's interview performance for {role} with overall score \
{overall_score}/100, provide career recommendations.

Evaluations summary:
{eval_summary[:1500]}

Return ONLY valid JSON:
{{
  "recommended_role": "Best matching role title",
  "readiness_percentage": <number 0-100>,
  "career_path": ["Step 1", "Step 2", "Step 3"],
  "strong_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2", "skill3"],
  "recommended_courses": [
    {{"course": "Course Name", "platform": "Coursera/Udemy/etc", "reason": "Why this course"}}
  ],
  "salary_range": "$X - $Y per year",
  "job_readiness": "Ready/Almost Ready/Needs Improvement/Beginner",
  "message": "Motivational personalized message for the candidate"
}}"""

    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=1000
    )

    raw = response.choices[0].message.content
    cleaned = clean_json_response(raw)
    return json.loads(cleaned)


def generate_skill_gap_analysis(role: str, evaluations: list) -> dict:
    """Generate a detailed skill gap analysis from interview evaluations."""
    eval_text = json.dumps(evaluations, indent=2)
    prompt = f"""Analyze this interview performance for {role} and provide a comprehensive skill gap analysis.

Evaluations:
{eval_text[:1500]}

Return ONLY valid JSON:
{{
  "strong_areas": ["area1", "area2"],
  "weak_areas": ["area1", "area2"],
  "missing_skills": ["skill1", "skill2", "skill3"],
  "learning_resources": [
    {{"skill": "Skill Name", "resource": "Resource name", "url": "https://example.com", "duration": "2 weeks"}}
  ],
  "priority_focus": "Most important area to focus on",
  "estimated_ready_in": "X months with consistent practice"
}}"""

    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=800
    )

    raw = response.choices[0].message.content
    cleaned = clean_json_response(raw)
    return json.loads(cleaned)
