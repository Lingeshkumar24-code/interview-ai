from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base


class Question(Base):
    __tablename__ = 'questions'

    id = Column(Integer, primary_key=True)
    interview_id = Column(Integer, ForeignKey('interviews.id'), nullable=False)
    question_text = Column(String, nullable=False)
    order_index = Column(Integer, default=0)

    interview = relationship('Interview', back_populates='questions')
    answer = relationship('Answer', back_populates='question', uselist=False)
