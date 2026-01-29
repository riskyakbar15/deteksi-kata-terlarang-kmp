"""
Database seeding script.
Run this script to populate the database with initial data.

Usage:
    cd backend
    python -m app.seeds.seed
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.forbidden_word import ForbiddenWord
from app.utils.security import get_password_hash
from app.seeds.data import FORBIDDEN_WORDS_DATA


def seed_database():
    """Seed the database with initial data"""
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # ==================== Seed Admin User ====================
        print("\n👤 Seeding admin user...")
        
        existing_admin = db.query(User).filter(User.username == "admin").first()
        
        if not existing_admin:
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                is_admin=True,
                is_active=True,
                must_change_password=True  # Force password change on first login
            )
            db.add(admin_user)
            db.commit()
            print("   ✅ Admin user created (username: admin, password: admin123)")
            print("   ⚠️  Password change required on first login!")
        else:
            print("   ℹ️  Admin user already exists, skipping...")
        
        # ==================== Seed Forbidden Words ====================
        print("\n📝 Seeding forbidden words...")
        
        added_count = 0
        skipped_count = 0
        
        for word_data in FORBIDDEN_WORDS_DATA:
            existing_word = db.query(ForbiddenWord).filter(
                ForbiddenWord.word == word_data["word"].lower()
            ).first()
            
            if not existing_word:
                forbidden_word = ForbiddenWord(
                    word=word_data["word"].lower(),
                    category=word_data["category"],
                    severity=word_data["severity"],
                    is_active=True
                )
                db.add(forbidden_word)
                added_count += 1
            else:
                skipped_count += 1
        
        db.commit()
        
        print(f"   ✅ Added {added_count} new forbidden words")
        print(f"   ℹ️  Skipped {skipped_count} existing words")
        
        # ==================== Summary ====================
        total_words = db.query(ForbiddenWord).count()
        total_users = db.query(User).count()
        
        print("\n" + "=" * 50)
        print("📊 Database Seeding Summary:")
        print(f"   - Total Users: {total_users}")
        print(f"   - Total Forbidden Words: {total_words}")
        print("=" * 50)
        
        # Show categories breakdown
        print("\n📋 Forbidden Words by Category:")
        categories = ["profanity", "hate_speech", "spam", "inappropriate"]
        for cat in categories:
            count = db.query(ForbiddenWord).filter(ForbiddenWord.category == cat).count()
            print(f"   - {cat}: {count} words")
        
        print("\n✅ Database seeding completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
