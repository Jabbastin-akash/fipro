"""
Main Fact Checker Service

This service orchestrates the entire fact-checking pipeline by combining
Pathway preprocessing with LLaMA reasoning to analyze claims.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from models.memory_store import memory_store
from models.database import ClaimResult
from .pathway_service import pathway_processor
from .llama_service import llama_service


class FactCheckerService:
    """
    Main service class that orchestrates the complete fact-checking pipeline
    
    This service combines Pathway preprocessing with LLaMA analysis to provide
    comprehensive fact-checking results.
    """
    
    def __init__(self):
        """Initialize the fact checker service"""
        self.pathway_processor = pathway_processor
        self.llama_service = llama_service
        print("🔍 Fact Checker Service initialized")
    
    async def check_fact(self, claim: str, session_id: Optional[str] = None) -> Dict:
        """
        Complete fact-checking pipeline for a given claim
        
        Args:
            claim: The claim to fact-check
            session_id: Optional user session identifier
            
        Returns:
            Dict: The fact-check result
        """
        start_time = datetime.utcnow()
        
        try:
            print(f"🔍 Starting fact-check for: {claim[:50]}...")
            
            # Step 1: Preprocess the claim using Pathway
            print("📊 Preprocessing claim with Pathway...")
            processed_claim = self.pathway_processor.preprocess_claim(claim)
            
            # Step 2: Create verification context
            print("🔗 Creating verification context...")
            verification_context = self.pathway_processor.create_verification_context(processed_claim)
            
            # Step 3: Analyze with LLaMA
            print("🦙 Analyzing with LLaMA...")
            analysis_result = await self.llama_service.analyze_claim(verification_context)
            
            # Step 4: Calculate total processing time
            end_time = datetime.utcnow()
            total_processing_time = int((end_time - start_time).total_seconds() * 1000)
            
            # Step 5: Create and save result to memory store
            print("💾 Saving result to memory store...")
            result = memory_store.add_result(
                claim=claim.strip(),
                verdict=analysis_result.get('verdict', 'Unverified'),
                confidence_score=analysis_result.get('confidence_score', 0.0),
                explanation=self._format_explanation(analysis_result),
                processing_time_ms=total_processing_time,
                sources=self._format_sources(analysis_result),
                session_id=session_id
            )
            
            print(f"✅ Fact-check completed: {result['verdict']} ({result['confidence_score']}%)")
            return result
            
        except Exception as e:
            print(f"❌ Fact-check failed: {str(e)}")
            
            # Create error result
            end_time = datetime.utcnow()
            processing_time = int((end_time - start_time).total_seconds() * 1000)
            
            error_result = memory_store.add_result(
                claim=claim.strip(),
                verdict='Unverified',
                confidence_score=0.0,
                explanation=f"Fact-checking failed due to technical error: {str(e)}. Please try again later.",
                processing_time_ms=processing_time,
                session_id=session_id
            )
            
            return error_result
    
    def _format_explanation(self, analysis_result: Dict[str, Any]) -> str:
        """Format the analysis result into a comprehensive explanation"""
        explanation = analysis_result.get('explanation', 'No explanation provided.')
        
        # Add key evidence if available
        key_evidence = analysis_result.get('key_evidence', [])
        if key_evidence:
            explanation += "\n\nKey Evidence:\n"
            for i, evidence in enumerate(key_evidence[:3], 1):  # Limit to 3 pieces of evidence
                explanation += f"{i}. {evidence}\n"
        
        # Add reasoning steps if available
        reasoning_steps = analysis_result.get('reasoning_steps', [])
        if reasoning_steps:
            explanation += "\nReasoning Process:\n"
            for i, step in enumerate(reasoning_steps[:3], 1):  # Limit to 3 steps
                explanation += f"{i}. {step}\n"
        
        # Add caveats if available
        caveats = analysis_result.get('caveats', [])
        if caveats:
            explanation += "\nImportant Notes:\n"
            for caveat in caveats[:2]:  # Limit to 2 caveats
                explanation += f"• {caveat}\n"
        
        return explanation.strip()
    
    def _format_sources(self, analysis_result: Dict[str, Any]) -> Optional[str]:
        """Format sources information as JSON string"""
        sources_needed = analysis_result.get('sources_needed', [])
        if sources_needed:
            import json
            return json.dumps({
                'sources_needed': sources_needed,
                'model_used': analysis_result.get('model_used', 'unknown')
            })
        return None
    
    async def test_services(self) -> Dict[str, Any]:
        """
        Test all components of the fact-checking service
        
        Returns:
            Dictionary with test results for each component
        """
        results = {
            'timestamp': datetime.utcnow().isoformat(),
            'pathway_service': {'status': 'unknown'},
            'llama_service': {'status': 'unknown'},
            'overall_status': 'unknown'
        }
        
        # Test Pathway preprocessing
        try:
            test_claim = "This is a test claim for service verification."
            processed = self.pathway_processor.preprocess_claim(test_claim)
            results['pathway_service'] = {
                'status': 'working',
                'test_claim': test_claim,
                'entities_found': len(processed.get('entities', {})),
                'claim_type': processed.get('claim_type', 'unknown')
            }
        except Exception as e:
            results['pathway_service'] = {
                'status': 'error',
                'error': str(e)
            }
        
        # Test LLaMA service
        try:
            test_context = {
                'claim_analysis': {
                    'original_claim': 'Test claim for API check',
                    'entities': {},
                    'claim_type': 'test'
                },
                'verification_strategy': 'testing'
            }
            response = await self.llama_service._call_llama_api("Hello, this is a test")
            results['llama_service'] = {
                'status': 'connected' if response else 'error',
                'api_url': self.llama_service.api_url,
                'model': self.llama_service.model_name
            }
        except Exception as e:
            results['llama_service'] = {
                'status': 'error',
                'error': str(e)
            }
        
        # Determine overall status
        pathway_ok = results['pathway_service']['status'] == 'working'
        llama_ok = results['llama_service']['status'] == 'connected'
        
        if pathway_ok and llama_ok:
            results['overall_status'] = 'healthy'
        elif pathway_ok or llama_ok:
            results['overall_status'] = 'partial'
        else:
            results['overall_status'] = 'error'
        
        return results

from typing import Dict, List, Optional, Any
from datetime import datetime

from models.memory_store import memory_store
from .pathway_service import pathway_processor
from .llama_service import llama_service


class FactCheckerService:
    """
    Main service class that orchestrates the complete fact-checking pipeline
    
    This service combines Pathway preprocessing with LLaMA analysis to provide
    comprehensive fact-checking results.
    """
    
    def __init__(self):
        """Initialize the fact checker service"""
        self.pathway_processor = pathway_processor
        self.llama_service = llama_service
        print("🔍 Fact Checker Service initialized")
    
    async def check_fact(self, claim: str, session_id: Optional[str] = None) -> Dict:
        """
        Complete fact-checking pipeline for a given claim
        
        Args:
            claim: The claim to fact-check
            session_id: Optional user session identifier
            
        Returns:
            Dict: The fact-check result
        """
        start_time = datetime.utcnow()
        
        try:
            print(f"🔍 Starting fact-check for: {claim[:50]}...")
            
            # Step 1: Preprocess the claim using Pathway
            print("📊 Preprocessing claim with Pathway...")
            processed_claim = self.pathway_processor.preprocess_claim(claim)
            
            # Step 2: Create verification context
            print("🔗 Creating verification context...")
            verification_context = self.pathway_processor.create_verification_context(processed_claim)
            
            # Step 3: Analyze with LLaMA
            print("🦙 Analyzing with LLaMA...")
            analysis_result = await self.llama_service.analyze_claim(verification_context)
            
            
            # Step 4: Calculate total processing time
            end_time = datetime.utcnow()
            total_processing_time = int((end_time - start_time).total_seconds() * 1000)
            
            # Step 5: Create and save result to memory store
            print("💾 Saving result to memory store...")
            result = memory_store.add_result(
                claim=claim.strip(),
                verdict=analysis_result.get('verdict', 'Unverified'),
                confidence_score=analysis_result.get('confidence_score', 0.0),
                explanation=self._format_explanation(analysis_result),
                processing_time_ms=total_processing_time,
                sources=self._format_sources(analysis_result),
                session_id=session_id
            )
            
            print(f"✅ Fact-check completed: {result['verdict']} ({result['confidence_score']}%)")
            return result
            
        except Exception as e:
            print(f"❌ Fact-check failed: {str(e)}")
            
            # Create error result
            end_time = datetime.utcnow()
            processing_time = int((end_time - start_time).total_seconds() * 1000)
            
            error_result = memory_store.add_result(
                claim=claim.strip(),
                verdict='Unverified',
                confidence_score=0.0,
                explanation=f"Fact-checking failed due to technical error: {str(e)}. Please try again later.",
                processing_time_ms=processing_time,
                session_id=session_id
            )
            
            return error_result
    
    def _format_explanation(self, analysis_result: Dict[str, Any]) -> str:
        """Format the analysis result into a comprehensive explanation"""
        explanation = analysis_result.get('explanation', 'No explanation provided.')
        
        # Add key evidence if available
        key_evidence = analysis_result.get('key_evidence', [])
        if key_evidence:
            explanation += "\n\nKey Evidence:\n"
            for i, evidence in enumerate(key_evidence[:3], 1):  # Limit to 3 pieces of evidence
                explanation += f"{i}. {evidence}\n"
        
        # Add reasoning steps if available
        reasoning_steps = analysis_result.get('reasoning_steps', [])
        if reasoning_steps:
            explanation += "\nReasoning Process:\n"
            for i, step in enumerate(reasoning_steps[:3], 1):  # Limit to 3 steps
                explanation += f"{i}. {step}\n"
        
        # Add caveats if available
        caveats = analysis_result.get('caveats', [])
        if caveats:
            explanation += "\nImportant Notes:\n"
            for caveat in caveats[:2]:  # Limit to 2 caveats
                explanation += f"• {caveat}\n"
        
        return explanation.strip()
    
    def _format_sources(self, analysis_result: Dict[str, Any]) -> Optional[str]:
        """Format sources information as JSON string"""
        sources_needed = analysis_result.get('sources_needed', [])
        if sources_needed:
            import json
            return json.dumps({
                'sources_needed': sources_needed,
                'model_used': analysis_result.get('model_used', 'unknown')
            })
        return None
    
    def get_statistics(self, db: Session) -> Dict[str, Any]:
        """
        Get fact-checking statistics
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with statistics
        """
        try:
            # Total claims
            total_claims = db.query(ClaimResult).count()
            
            # Verdicts breakdown
            true_claims = db.query(ClaimResult).filter(ClaimResult.verdict == 'True').count()
            false_claims = db.query(ClaimResult).filter(ClaimResult.verdict == 'False').count()
            unverified_claims = db.query(ClaimResult).filter(ClaimResult.verdict == 'Unverified').count()
            
            # Average confidence score
            avg_confidence = db.query(func.avg(ClaimResult.confidence_score)).scalar() or 0.0
            
            # Average processing time
            avg_processing_time = db.query(func.avg(ClaimResult.processing_time_ms)).scalar()
            
            # Recent activity (last 24 hours)
            from datetime import timedelta
            yesterday = datetime.utcnow() - timedelta(days=1)
            recent_claims = db.query(ClaimResult)\
                            .filter(ClaimResult.timestamp >= yesterday)\
                            .count()
            
            return {
                'total_claims': total_claims,
                'true_claims': true_claims,
                'false_claims': false_claims,
                'unverified_claims': unverified_claims,
                'average_confidence': round(avg_confidence, 2),
                'average_processing_time_ms': round(avg_processing_time, 2) if avg_processing_time else None,
                'recent_claims_24h': recent_claims,
                'success_rate': round((true_claims + false_claims) / total_claims * 100, 2) if total_claims > 0 else 0.0
            }
            
        except Exception as e:
            print(f"❌ Error calculating statistics: {str(e)}")
            return {
                'total_claims': 0,
                'true_claims': 0,
                'false_claims': 0,
                'unverified_claims': 0,
                'average_confidence': 0.0,
                'average_processing_time_ms': None,
                'recent_claims_24h': 0,
                'success_rate': 0.0,
                'error': str(e)
            }
    
    def search_claims(self, db: Session, query: str, limit: int = 20) -> List[ClaimResult]:
        """
        Search for claims containing specific text
        
        Args:
            db: Database session
            query: Search query
            limit: Maximum number of results
            
        Returns:
            List of matching ClaimResult objects
        """
        try:
            results = db.query(ClaimResult)\
                       .filter(ClaimResult.claim.contains(query))\
                       .order_by(desc(ClaimResult.timestamp))\
                       .limit(limit)\
                       .all()
            
            return results
            
        except Exception as e:
            print(f"❌ Error searching claims: {str(e)}")
            return []
    
    async def test_services(self) -> Dict[str, Any]:
        """
        Test all components of the fact-checking service
        
        Returns:
            Dictionary with test results for each component
        """
        results = {
            'timestamp': datetime.utcnow().isoformat(),
            'pathway_service': {'status': 'unknown'},
            'llama_service': {'status': 'unknown'},
            'overall_status': 'unknown'
        }
        
        # Test Pathway preprocessing
        try:
            test_claim = "This is a test claim for service verification."
            processed = self.pathway_processor.preprocess_claim(test_claim)
            results['pathway_service'] = {
                'status': 'working',
                'test_claim': test_claim,
                'entities_found': len(processed.get('entities', {})),
                'claim_type': processed.get('claim_type', 'unknown')
            }
        except Exception as e:
            results['pathway_service'] = {
                'status': 'error',
                'error': str(e)
            }
        
        # Test LLaMA service
        try:
            llama_test = await self.llama_service.test_connection()
            results['llama_service'] = llama_test
        except Exception as e:
            results['llama_service'] = {
                'status': 'error',
                'error': str(e)
            }
        
        # Determine overall status
        pathway_ok = results['pathway_service']['status'] == 'working'
        llama_ok = results['llama_service']['status'] in ['connected', 'working']
        
        if pathway_ok and llama_ok:
            results['overall_status'] = 'healthy'
        elif pathway_ok or llama_ok:
            results['overall_status'] = 'partial'
        else:
            results['overall_status'] = 'error'
        
        return results