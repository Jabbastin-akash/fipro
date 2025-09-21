"""
Fact Checker Backend - Main FastAPI Application

This is the main entry point for the Fact Checker backend API.
It provides endpoints for fact-checking claims and retrieving history.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
from datetime import datetime

# Import our custom modules
from models.memory_store import memory_store
from models.schemas import ClaimRequest, ClaimResponse, HistoryResponse
from services.fact_checker import FactCheckerService

# Initialize FastAPI app
app = FastAPI(
    title="Fact Checker API",
    description="AI-powered fact checking using Pathway and Ollama",
    version="1.0.0"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize fact checker service
fact_checker_service = FactCheckerService()

@app.on_event("startup")
async def startup_event():
    """Initialize the API"""
    print("🚀 Fact Checker API is ready!")

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Fact Checker API is running!",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "memory_store": "initialized",
            "pathway": "available",
            "ollama": "configured"
        }
    }

@app.post("/check", response_model=ClaimResponse)
async def check_claim(
    claim_request: ClaimRequest
):
    """
    Main endpoint to fact-check a claim
    
    Args:
        claim_request: The claim to be fact-checked
    
    Returns:
        ClaimResponse: Verdict, confidence score, and explanation
    """
    try:
        # Use the fact checker service to process the claim
        result = await fact_checker_service.check_fact(
            claim=claim_request.claim,
            session_id=claim_request.session_id
        )
        
        return ClaimResponse(
            id=result["id"],
            claim=result["claim"],
            verdict=result["verdict"],
            confidence_score=result["confidence_score"],
            explanation=result["explanation"],
            timestamp=result["timestamp"],
            processing_time_ms=result["processing_time_ms"]
        )
        
    except Exception as e:
        print(f"❌ Error processing claim: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process claim: {str(e)}"
        )

@app.get("/history", response_model=List[HistoryResponse])
async def get_history(
    limit: Optional[int] = 50,
    offset: Optional[int] = 0
):
    """
    Get fact-check history
    
    Args:
        limit: Maximum number of results to return
        offset: Number of results to skip
    
    Returns:
        List of historical fact-check results
    """
    try:
        results = memory_store.get_all(limit=limit, offset=offset)
        
        return [
            HistoryResponse(
                id=result["id"],
                claim=result["claim"],
                verdict=result["verdict"],
                confidence_score=result["confidence_score"],
                explanation=result["explanation"][:200] + "..." if len(result["explanation"]) > 200 else result["explanation"],
                timestamp=result["timestamp"]
            )
            for result in results
        ]
        
    except Exception as e:
        print(f"❌ Error retrieving history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve history: {str(e)}"
        )

@app.get("/stats")
async def get_stats():
    """
    Get statistics about fact-checks
    
    Returns:
        Dict with statistics about fact-check results
    """
    try:
        return memory_store.get_stats()
    except Exception as e:
        print(f"❌ Error retrieving stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve stats: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload during development
        log_level="info"
    )