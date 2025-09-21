"""
Simplified Fact Checker Backend for Demo

This is a simplified version that works without complex dependencies
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import time
from datetime import datetime
import random

# Data models
class ClaimRequest(BaseModel):
    claim: str

class ClaimResponse(BaseModel):
    claim: str
    verdict: str
    confidence: float
    explanation: str
    sources: List[str] = []
    timestamp: str

class HistoryItem(BaseModel):
    id: str
    claim: str
    verdict: str
    confidence: float
    timestamp: str

# Initialize FastAPI app
app = FastAPI(
    title="Fact Checker API",
    description="AI-powered fact checking demo",
    version="1.0.0"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo
claim_history = []

# Simple fact-checking logic for demo
def simple_fact_check(claim: str) -> dict:
    """Simple demo fact-checking logic"""
    claim_lower = claim.lower()
    
    # Simple pattern matching for demo
    if any(word in claim_lower for word in ["earth is flat", "flat earth"]):
        return {
            "verdict": "FALSE",
            "confidence": 0.95,
            "explanation": "Scientific consensus and overwhelming evidence show that the Earth is spherical, not flat. Satellite imagery, physics of gravity, and observations from space all confirm Earth's spherical shape."
        }
    elif any(word in claim_lower for word in ["2+2", "2 + 2"]):
        if "4" in claim_lower:
            return {
                "verdict": "TRUE", 
                "confidence": 1.0,
                "explanation": "This is a basic mathematical fact. In standard arithmetic, 2 + 2 = 4."
            }
        else:
            return {
                "verdict": "FALSE",
                "confidence": 1.0,
                "explanation": "In standard arithmetic, 2 + 2 equals 4, not the value claimed."
            }
    elif any(word in claim_lower for word in ["sun", "bigger", "earth"]):
        return {
            "verdict": "TRUE",
            "confidence": 0.92,
            "explanation": "The Sun is approximately 109 times wider than Earth and has a volume about 1.3 million times greater than Earth."
        }
    elif any(word in claim_lower for word in ["water", "boils", "100", "celsius"]):
        return {
            "verdict": "TRUE",
            "confidence": 0.98,
            "explanation": "At standard atmospheric pressure (1 atm), water boils at 100°C (212°F)."
        }
    else:
        # Random verdict for demo purposes
        verdicts = ["TRUE", "FALSE", "PARTIALLY_TRUE"]
        verdict = random.choice(verdicts)
        confidence = round(random.uniform(0.6, 0.95), 2)
        
        explanations = {
            "TRUE": f"Based on available evidence and sources, this claim appears to be accurate. Confidence: {confidence}",
            "FALSE": f"The available evidence contradicts this claim. Multiple reliable sources dispute this statement. Confidence: {confidence}",
            "PARTIALLY_TRUE": f"This claim contains some accurate elements but also some inaccuracies or oversimplifications. Confidence: {confidence}"
        }
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "explanation": explanations[verdict]
        }

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
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/check", response_model=ClaimResponse)
async def check_claim(claim_request: ClaimRequest):
    """
    Main endpoint to fact-check a claim
    """
    try:
        # Simulate processing time
        time.sleep(random.uniform(1, 3))
        
        # Get fact-check result
        result = simple_fact_check(claim_request.claim)
        
        # Create response
        response = ClaimResponse(
            claim=claim_request.claim,
            verdict=result["verdict"],
            confidence=result["confidence"],
            explanation=result["explanation"],
            sources=["Demo Source 1", "Demo Source 2"],
            timestamp=datetime.now().isoformat()
        )
        
        # Store in history
        history_item = HistoryItem(
            id=str(len(claim_history) + 1),
            claim=claim_request.claim,
            verdict=result["verdict"],
            confidence=result["confidence"],
            timestamp=datetime.now().isoformat()
        )
        claim_history.append(history_item)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing claim: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get statistics about fact-checking"""
    if not claim_history:
        return {
            "total_claims": 0,
            "verdicts": {"TRUE": 0, "FALSE": 0, "PARTIALLY_TRUE": 0},
            "average_confidence": 0
        }
    
    verdicts = {"TRUE": 0, "FALSE": 0, "PARTIALLY_TRUE": 0}
    total_confidence = 0
    
    for item in claim_history:
        verdicts[item.verdict] = verdicts.get(item.verdict, 0) + 1
        total_confidence += item.confidence
    
    return {
        "total_claims": len(claim_history),
        "verdicts": verdicts,
        "average_confidence": round(total_confidence / len(claim_history), 2) if claim_history else 0
    }

@app.get("/history")
async def get_history():
    """Get claim checking history"""
    return {
        "history": sorted(claim_history, key=lambda x: x.timestamp, reverse=True)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)