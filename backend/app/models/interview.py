from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base


class Interview(Base):
    __tablename__ = 'interviews'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    role = Column(String, nullable=False)
    experience = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    overall_score = Column(Float, default=0.0)
    ai_summary = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='interviews')
    questions = relationship('Question', back_populates='interview')
