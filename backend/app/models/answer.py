from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base


class Answer(Base):
    __tablename__ = 'answers'

    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey('questions.id'), nullable=False)
    answer_text = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship('Question', back_populates='answer')
    evaluation = relationship('Evaluation', back_populates='answer', uselist=False)
