from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil

from app.database import get_db
from app.models.forbidden_word import ForbiddenWord
from app.models.user import User
from app.schemas.forbidden_word import (
    ForbiddenWordCreate, ForbiddenWordUpdate, 
    ForbiddenWordResponse, ForbiddenWordList
)
from app.utils.security import get_current_admin_user

router = APIRouter(prefix="/api/admin/words", tags=["Forbidden Words"])


@router.get("", response_model=ForbiddenWordList)
async def get_forbidden_words(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get list of forbidden words with pagination and filtering.
    """
    query = db.query(ForbiddenWord)
    
    # Apply filters
    if search:
        query = query.filter(ForbiddenWord.word.ilike(f"%{search}%"))
    if category:
        query = query.filter(ForbiddenWord.category == category)
    if is_active is not None:
        query = query.filter(ForbiddenWord.is_active == is_active)
    
    # Get total count
    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 1
    
    # Apply pagination
    offset = (page - 1) * page_size
    words = query.order_by(ForbiddenWord.created_at.desc()).offset(offset).limit(page_size).all()
    
    return ForbiddenWordList(
        items=[ForbiddenWordResponse.model_validate(w) for w in words],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/all", response_model=list[ForbiddenWordResponse])
async def get_all_forbidden_words(
    db: Session = Depends(get_db)
):
    """
    Get all active forbidden words (for detection service).
    This endpoint is public for the chat detection feature.
    """
    words = db.query(ForbiddenWord).filter(ForbiddenWord.is_active == True).all()
    return [ForbiddenWordResponse.model_validate(w) for w in words]


@router.get("/{word_id}", response_model=ForbiddenWordResponse)
async def get_forbidden_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific forbidden word by ID"""
    word = db.query(ForbiddenWord).filter(ForbiddenWord.id == word_id).first()
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Forbidden word not found"
        )
    return word


@router.post("", response_model=ForbiddenWordResponse, status_code=status.HTTP_201_CREATED)
async def create_forbidden_word(
    word_data: ForbiddenWordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new forbidden word"""
    # Check if word already exists
    existing = db.query(ForbiddenWord).filter(
        ForbiddenWord.word.ilike(word_data.word)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This word already exists in the forbidden list"
        )
    
    new_word = ForbiddenWord(
        word=word_data.word.lower().strip(),
        category=word_data.category.value,
        severity=word_data.severity,
        is_active=True
    )
    
    db.add(new_word)
    db.commit()
    db.refresh(new_word)
    
    return new_word


@router.put("/{word_id}", response_model=ForbiddenWordResponse)
async def update_forbidden_word(
    word_id: int,
    word_data: ForbiddenWordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a forbidden word"""
    word = db.query(ForbiddenWord).filter(ForbiddenWord.id == word_id).first()
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Forbidden word not found"
        )
    
    # Check if new word already exists (if word is being changed)
    if word_data.word and word_data.word.lower() != word.word.lower():
        existing = db.query(ForbiddenWord).filter(
            ForbiddenWord.word.ilike(word_data.word),
            ForbiddenWord.id != word_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This word already exists in the forbidden list"
            )
    
    # Update fields
    if word_data.word is not None:
        word.word = word_data.word.lower().strip()
    if word_data.category is not None:
        word.category = word_data.category.value
    if word_data.severity is not None:
        word.severity = word_data.severity
    if word_data.is_active is not None:
        word.is_active = word_data.is_active
    
    db.commit()
    db.refresh(word)
    
    return word


@router.delete("/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_forbidden_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a forbidden word"""
    word = db.query(ForbiddenWord).filter(ForbiddenWord.id == word_id).first()
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Forbidden word not found"
        )
    
    db.delete(word)
    db.commit()
    
    return None
