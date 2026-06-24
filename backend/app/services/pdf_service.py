import io
import json
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)


def generate_interview_report_pdf(interview_data: dict) -> bytes:
    """Generate a professional PDF interview report and return raw bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Custom paragraph styles ────────────────────────────────────────────────
    title_style = ParagraphStyle(
        'IQTitle', parent=styles['Title'],
        fontSize=24, textColor=colors.HexColor('#2563EB'),
        alignment=TA_CENTER, spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'IQSubtitle', parent=styles['Normal'],
        fontSize=14, textColor=colors.HexColor('#06B6D4'),
        alignment=TA_CENTER, spaceAfter=4
    )
    heading_style = ParagraphStyle(
        'IQHeading', parent=styles['Heading1'],
        fontSize=14, textColor=colors.HexColor('#1E293B'),
        spaceBefore=12, spaceAfter=6
    )
    body_style = ParagraphStyle(
        'IQBody', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#374151'),
        spaceAfter=4
    )
    label_style = ParagraphStyle(
        'IQLabel', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#6B7280'),
        spaceAfter=2
    )
    question_style = ParagraphStyle(
        'IQQuestion', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#2563EB'),
        fontName='Helvetica-Bold', spaceAfter=3
    )
    footer_style = ParagraphStyle(
        'IQFooter', parent=styles['Normal'],
        fontSize=8, textColor=colors.HexColor('#9CA3AF'),
        alignment=TA_CENTER
    )

    # ── Header ─────────────────────────────────────────────────────────────────
    story.append(Paragraph('InterviewIQ AI', title_style))
    story.append(Paragraph('Interview Performance Report', subtitle_style))
    story.append(Spacer(1, 0.2 * inch))
    story.append(HRFlowable(width='100%', thickness=2, color=colors.HexColor('#2563EB')))
    story.append(Spacer(1, 0.2 * inch))

    # ── Candidate Information ──────────────────────────────────────────────────
    story.append(Paragraph('Candidate Information', heading_style))
    info_data = [
        ['Candidate:', interview_data.get('candidate_name', 'N/A'),
         'Date:', datetime.now().strftime('%B %d, %Y')],
        ['Role:', interview_data.get('role', 'N/A'),
         'Experience:', interview_data.get('experience', 'N/A')],
        ['Difficulty:', interview_data.get('difficulty', 'N/A'),
         'Questions:', str(interview_data.get('total_questions', 0))],
    ]

    info_table = Table(info_data, colWidths=[1.2 * inch, 2.3 * inch, 1.2 * inch, 2.3 * inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#111827')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1),
         [colors.HexColor('#F9FAFB'), colors.HexColor('#F3F4F6')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.2 * inch))

    # ── Performance Summary ────────────────────────────────────────────────────
    story.append(Paragraph('Performance Summary', heading_style))
    overall_score = interview_data.get('overall_score', 0)

    if overall_score >= 90:
        readiness = 'Excellent'
    elif overall_score >= 75:
        readiness = 'Ready'
    elif overall_score >= 60:
        readiness = 'Needs Improvement'
    else:
        readiness = 'Beginner'

    score_data = [
        ['Metric', 'Score', 'Status'],
        ['Overall Score', f"{overall_score:.1f}/100", readiness],
        ['Technical Accuracy', f"{interview_data.get('technical_score', 0):.1f}/10", ''],
        ['Communication Skills', f"{interview_data.get('communication_score', 0):.1f}/10", ''],
        ['Problem Solving', f"{interview_data.get('problem_solving_score', 0):.1f}/10", ''],
    ]

    score_table = Table(score_data, colWidths=[3 * inch, 2 * inch, 2 * inch])
    score_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563EB')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1),
         [colors.HexColor('#F9FAFB'), colors.HexColor('#EFF6FF')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('ALIGN', (1, 0), (2, -1), 'CENTER'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 0.2 * inch))

    # ── AI Summary ─────────────────────────────────────────────────────────────
    ai_summary = interview_data.get('ai_summary')
    if ai_summary:
        story.append(Paragraph('AI Assessment Summary', heading_style))
        story.append(Paragraph(ai_summary, body_style))
        story.append(Spacer(1, 0.15 * inch))

    # ── Questions & Answers ────────────────────────────────────────────────────
    story.append(Paragraph('Interview Questions &amp; Answers', heading_style))

    for i, qa in enumerate(interview_data.get('questions_answers', []), 1):
        # Question
        question_text = qa.get('question', '')
        story.append(Paragraph(f'Q{i}: {question_text}', question_style))

        # Answer
        raw_answer = qa.get('answer', 'No answer provided') or 'No answer provided'
        truncated = (raw_answer[:500] + '… (truncated)') if len(raw_answer) > 500 else raw_answer
        story.append(Paragraph(f'<b>Answer:</b> {truncated}', body_style))

        # Evaluation scores & feedback
        ev = qa.get('evaluation')
        if ev:
            score_line = (
                f"Score: {ev.get('overall_score', 0):.1f}/100 | "
                f"Technical: {ev.get('technical_accuracy', 0)}/10 | "
                f"Clarity: {ev.get('concept_clarity', 0)}/10 | "
                f"Communication: {ev.get('communication', 0)}/10"
            )
            story.append(Paragraph(score_line, label_style))
            feedback = ev.get('feedback', '')
            if feedback:
                story.append(Paragraph(f'<i>Feedback: {feedback[:300]}</i>', label_style))

        story.append(Spacer(1, 0.1 * inch))
        story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#E5E7EB')))
        story.append(Spacer(1, 0.1 * inch))

    # ── Footer ─────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.3 * inch))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#2563EB')))
    story.append(Paragraph(
        'Generated by InterviewIQ AI – Smart Interview Coach',
        footer_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
