"""
Pydantic Schemas for Request/Response Models

This module defines the data validation schemas used for API requests
and responses in the Fact Checker application.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class VerdictEnum(str, Enum):
    """Enumeration for possible fact-check verdicts"""
    TRUE = "True"
    FALSE = "False"
    PARTIALLY_TRUE = "Partially True"
    REQUIRES_INVESTIGATION = "Requires Investigation"
    REQUIRES_CONTEXT = "Requires Context"
    UNVERIFIED = "Unverified"


class ClaimRequest(BaseModel):
    """
    Request model for submitting a claim to be fact-checked
    """
    claim: str = Field(
        ..., 
        min_length=5, 
        max_length=1000,
        description="The claim to be fact-checked",
        example="The Eiffel Tower is taller than 400 meters"
    )
    
    session_id: Optional[str] = Field(
        None,
        description="Optional session identifier for tracking user requests"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "claim": "The Eiffel Tower is taller than 400 meters",
                "session_id": "user_session_123"
            }
        }


class ClaimResponse(BaseModel):
    """
    Response model for fact-check results
    """
    id: int = Field(
        ...,
        description="Unique identifier for this fact-check result"
    )
    
    claim: str = Field(
        ...,
        description="The original claim that was fact-checked"
    )
    
    verdict: VerdictEnum = Field(
        ...,
        description="The fact-check verdict: True, False, or Unverified"
    )
    
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Confidence score from 0 to 100"
    )
    
    explanation: str = Field(
        ...,
        description="Detailed explanation of the fact-check result"
    )
    
    timestamp: datetime = Field(
        ...,
        description="When the fact-check was performed"
    )
    
    processing_time_ms: Optional[int] = Field(
        None,
        description="Time taken to process the claim in milliseconds"
    )
    
    sources: Optional[List[str]] = Field(
        None,
        description="List of source URLs used for verification"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "claim": "The Eiffel Tower is taller than 400 meters",
                "verdict": "False",
                "confidence_score": 92.5,
                "explanation": "The Eiffel Tower is 330 meters tall to the top of its structure, which is less than 400 meters. Including the antenna, it reaches 324 meters.",
                "timestamp": "2024-01-15T10:30:00Z",
                "processing_time_ms": 1250,
                "sources": ["https://en.wikipedia.org/wiki/Eiffel_Tower"]
            }
        }


class HistoryResponse(BaseModel):
    """
    Response model for historical fact-check results (simplified)
    """
    id: int = Field(
        ...,
        description="Unique identifier for this fact-check result"
    )
    
    claim: str = Field(
        ...,
        description="The original claim that was fact-checked"
    )
    
    verdict: VerdictEnum = Field(
        ...,
        description="The fact-check verdict: True, False, or Unverified"
    )
    
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Confidence score from 0 to 100"
    )
    
    explanation: str = Field(
        ...,
        description="Shortened explanation of the fact-check result"
    )
    
    timestamp: datetime = Field(
        ...,
        description="When the fact-check was performed"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "claim": "The Eiffel Tower is taller than 400 meters",
                "verdict": "False",
                "confidence_score": 92.5,
                "explanation": "The Eiffel Tower is 330 meters tall to the top of its structure...",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class StatsResponse(BaseModel):
    """
    Response model for fact-checking statistics
    """
    total_claims: int = Field(
        ...,
        description="Total number of claims fact-checked"
    )
    
    true_claims: int = Field(
        ...,
        description="Number of claims verified as true"
    )
    
    false_claims: int = Field(
        ...,
        description="Number of claims verified as false"
    )
    
    unverified_claims: int = Field(
        ...,
        description="Number of claims that could not be verified"
    )
    
    average_confidence: float = Field(
        ...,
        description="Average confidence score across all fact-checks"
    )
    
    average_processing_time_ms: Optional[float] = Field(
        None,
        description="Average processing time in milliseconds"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "total_claims": 150,
                "true_claims": 60,
                "false_claims": 70,
                "unverified_claims": 20,
                "average_confidence": 87.3,
                "average_processing_time_ms": 1450.5
            }
        }


class ErrorResponse(BaseModel):
    """
    Response model for error cases
    """
    detail: str = Field(
        ...,
        description="Error message describing what went wrong"
    )
    
    error_code: Optional[str] = Field(
        None,
        description="Optional error code for programmatic handling"
    )
    
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the error occurred"
    )