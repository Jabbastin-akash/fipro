"""
Database Configuration and Connection

This module sets up the SQLAlchemy database connection and session management
for the Fact Checker application using SQLite.
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os

# Database URL - using SQLite for simplicity
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fact_checker.db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for declarative models
Base = declarative_base()

# Database Models
class ClaimResult(Base):
    """
    Database model for storing fact-check results
    
    Represents a fact-checked claim with its verdict, confidence score,
    and explanation from the AI system.
    """
    __tablename__ = "claim_results"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # The original claim text submitted by user
    claim = Column(Text, nullable=False, index=True)
    
    # Verdict: "True", "False", or "Unverified"
    verdict = Column(String(20), nullable=False, index=True)
    
    # Confidence score from 0 to 100
    confidence_score = Column(Float, nullable=False)
    
    # Detailed explanation from AI system
    explanation = Column(Text, nullable=False)
    
    # Processing time in milliseconds
    processing_time_ms = Column(Integer, nullable=True)
    
    # Timestamp when the fact-check was performed
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Optional: Source URLs used for verification
    sources = Column(Text, nullable=True)  # JSON string of source URLs
    
    # Optional: User session identifier
    session_id = Column(String(100), nullable=True, index=True)

    def __repr__(self):
        return f"<ClaimResult(id={self.id}, verdict={self.verdict}, confidence={self.confidence_score})>"

    def to_dict(self):
        """Convert model to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "claim": self.claim,
            "verdict": self.verdict,
            "confidence_score": self.confidence_score,
            "explanation": self.explanation,
            "processing_time_ms": self.processing_time_ms,
            "timestamp": self.timestamp.isoformat(),
            "sources": self.sources,
            "session_id": self.session_id
        }


def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    print("📊 Database tables created successfully")


def get_db() -> Session:
    """
    Dependency function to get database session
    
    This function is used as a FastAPI dependency to provide
    database sessions to API endpoints.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_database():
    """Initialize the database with tables"""
    try:
        create_tables()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        raise


if __name__ == "__main__":
    # Test database connection
    init_database()
    
    # Test creating a sample record
    db = SessionLocal()
    try:
        sample_result = ClaimResult(
            claim="Test claim for database connection",
            verdict="True",
            confidence_score=95.0,
            explanation="This is a test explanation",
            processing_time_ms=150
        )
        db.add(sample_result)
        db.commit()
        print("✅ Test record created successfully")
        
        # Query the record
        result = db.query(ClaimResult).first()
        print(f"📄 Retrieved record: {result}")
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        db.rollback()
    finally:
        db.close()