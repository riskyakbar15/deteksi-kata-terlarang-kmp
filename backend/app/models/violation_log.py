from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class ViolationLog(Base):
    """Violation log model for tracking detected forbidden words"""
    __tablename__ = "violation_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=False)
    forbidden_word_id = Column(Integer, ForeignKey("forbidden_words.id"), nullable=True)
    detected_word = Column(String(100), nullable=False)
    position_start = Column(Integer, nullable=False)
    position_end = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    message = relationship("ChatMessage", back_populates="violations")
    forbidden_word = relationship("ForbiddenWord")
    
    def __repr__(self):
        return f"<ViolationLog(id={self.id}, word='{self.detected_word}', pos={self.position_start}-{self.position_end})>"
