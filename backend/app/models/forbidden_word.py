from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from datetime import datetime
from app.database import Base
import enum


class WordCategory(str, enum.Enum):
    """Category enum for forbidden words"""
    PROFANITY = "profanity"
    HATE_SPEECH = "hate_speech"
    SPAM = "spam"
    INAPPROPRIATE = "inappropriate"


class ForbiddenWord(Base):
    """Forbidden word model for storing banned words"""
    __tablename__ = "forbidden_words"
    
    id = Column(Integer, primary_key=True, index=True)
    word = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), default=WordCategory.PROFANITY.value)
    severity = Column(Integer, default=1)  # 1-5 scale
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ForbiddenWord(id={self.id}, word='{self.word}', category='{self.category}')>"
