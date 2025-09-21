"""
In-Memory Storage for Fact Checker

This module provides a simple in-memory storage solution for the
Fact Checker application, eliminating the need for a database.
"""

from datetime import datetime
from typing import Dict, List, Optional
import json

class MemoryStore:
    """
    In-memory storage class for fact-check results
    
    This class provides a simple dictionary-based storage solution
    for storing and retrieving fact-check results without a database.
    """
    
    def __init__(self):
        """Initialize the memory store with an empty dictionary"""
        self._store = []
        self._counter = 1  # For generating IDs
        print("📊 In-Memory Store initialized")
    
    def add_result(self, 
                  claim: str, 
                  verdict: str, 
                  confidence_score: float, 
                  explanation: str,
                  processing_time_ms: Optional[int] = None,
                  sources: Optional[str] = None,
                  session_id: Optional[str] = None) -> Dict:
        """
        Add a new fact-check result to the store
        
        Args:
            claim: The claim that was fact-checked
            verdict: The verdict (True/False/Unverified)
            confidence_score: Confidence score (0-100)
            explanation: Detailed explanation
            processing_time_ms: Processing time in milliseconds
            sources: Optional JSON string of source URLs
            session_id: Optional user session identifier
            
        Returns:
            Dict: The stored result with a generated ID
        """
        result = {
            "id": self._counter,
            "claim": claim,
            "verdict": verdict,
            "confidence_score": confidence_score,
            "explanation": explanation,
            "processing_time_ms": processing_time_ms,
            "timestamp": datetime.utcnow().isoformat(),
            "sources": sources,
            "session_id": session_id
        }
        
        self._store.append(result)
        self._counter += 1
        
        return result
    
    def get_all(self, limit: Optional[int] = None, offset: Optional[int] = 0) -> List[Dict]:
        """
        Get all stored results with optional pagination
        
        Args:
            limit: Maximum number of results to return
            offset: Number of results to skip
            
        Returns:
            List[Dict]: List of stored results
        """
        results = sorted(self._store, key=lambda x: x["id"], reverse=True)
        
        if offset:
            results = results[offset:]
            
        if limit:
            results = results[:limit]
            
        return results
    
    def get_by_id(self, result_id: int) -> Optional[Dict]:
        """
        Get a specific result by ID
        
        Args:
            result_id: The ID of the result to retrieve
            
        Returns:
            Optional[Dict]: The result if found, None otherwise
        """
        for result in self._store:
            if result["id"] == result_id:
                return result
        return None
    
    def get_stats(self) -> Dict:
        """
        Get statistics about the stored results
        
        Returns:
            Dict: Statistics about verdicts, average confidence, etc.
        """
        if not self._store:
            return {
                "total": 0,
                "verdicts": {"True": 0, "False": 0, "Unverified": 0},
                "average_confidence": 0,
                "average_processing_time_ms": 0
            }
        
        # Count verdicts
        verdicts = {"True": 0, "False": 0, "Unverified": 0}
        for result in self._store:
            if result["verdict"] in verdicts:
                verdicts[result["verdict"]] += 1
            else:
                verdicts[result["verdict"]] = 1
        
        # Calculate averages
        total_confidence = sum(result["confidence_score"] for result in self._store)
        
        processing_times = [
            result["processing_time_ms"] for result in self._store 
            if result["processing_time_ms"] is not None
        ]
        avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
        
        return {
            "total": len(self._store),
            "verdicts": verdicts,
            "average_confidence": total_confidence / len(self._store) if self._store else 0,
            "average_processing_time_ms": avg_processing_time
        }
    
    def clear(self):
        """Clear all stored results"""
        self._store = []
        print("🧹 In-Memory Store cleared")

# Create a singleton instance
memory_store = MemoryStore()