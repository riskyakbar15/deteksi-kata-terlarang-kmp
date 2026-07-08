from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class ChatMessage(Base):
    """Chat message model for storing messages"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text, nullable=False)
    filtered_text = Column(Text, nullable=True)
    sender_name = Column(String(100), default="Anonymous")
    has_violation = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=_utcnow, index=True)
    
    # Relationship to violations
    violations = relationship("ViolationLog", back_populates="message", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ChatMessage(id={self.id}, sender='{self.sender_name}', has_violation={self.has_violation})>"
