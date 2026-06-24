from sqlalchemy import Column, Integer, Float, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.database import Base


class Evaluation(Base):
    __tablename__ = 'evaluations'

    id = Column(Integer, primary_key=True)
    answer_id = Column(Integer, ForeignKey('answers.id'), nullable=False)
    technical_accuracy = Column(Float, default=0.0)
    concept_clarity = Column(Float, default=0.0)
    depth = Column(Float, default=0.0)
    communication = Column(Float, default=0.0)
    problem_solving = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    strengths = Column(Text, default='[]')       # JSON string
    weaknesses = Column(Text, default='[]')      # JSON string
    improvements = Column(Text, default='[]')    # JSON string
    ideal_answer = Column(Text, default='')
    feedback = Column(Text, default='')

    answer = relationship('Answer', back_populates='evaluation')
