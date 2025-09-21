"""
Pathway Integration Service

This module handles data preprocessing and pipeline operations using Pathway
for the fact-checking system. Pathway is used to preprocess claims and 
structure data for the LLaMA model.
"""

import pathway as pw
from typing import Dict, List, Optional, Any
import json
import re
from datetime import datetime


class PathwayProcessor:
    """
    Pathway-based data processor for fact-checking claims
    
    This class uses Pathway to preprocess claims, extract entities,
    and prepare structured data for the LLaMA reasoning engine.
    """
    
    def __init__(self):
        """Initialize the Pathway processor"""
        self.context_sources = []
        self.entity_patterns = {
            'numbers': r'\b\d+(?:\.\d+)?\b',
            'dates': r'\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b|\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b',
            'places': r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b',  # Simple place detection
            'measurements': r'\b\d+(?:\.\d+)?\s*(?:meters?|feet|km|miles?|kg|pounds?|celsius|fahrenheit)\b'
        }
        
    def preprocess_claim(self, claim: str) -> Dict[str, Any]:
        """
        Preprocess a claim using Pathway
        
        Args:
            claim: The raw claim text
            
        Returns:
            Dict containing processed claim data
        """
        try:
            # Create a Pathway table with the claim
            claim_data = pw.Table.empty(
                claim_text=pw.column_definition(dtype=str),
                timestamp=pw.column_definition(dtype=float)
            )
            
            # Extract entities and structure from the claim
            processed_data = {
                'original_claim': claim.strip(),
                'normalized_claim': self._normalize_text(claim),
                'entities': self._extract_entities(claim),
                'claim_type': self._classify_claim_type(claim),
                'key_terms': self._extract_key_terms(claim),
                'structure': self._analyze_claim_structure(claim),
                'search_queries': self._generate_search_queries(claim),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return processed_data
            
        except Exception as e:
            print(f"⚠️ Pathway preprocessing error: {str(e)}")
            # Return basic preprocessing if Pathway fails
            return self._basic_preprocessing(claim)
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for consistent processing"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Standardize punctuation
        text = re.sub(r'["""''`]', '"', text)
        text = re.sub(r'[–—]', '-', text)
        
        return text
    
    def _extract_entities(self, claim: str) -> Dict[str, List[str]]:
        """Extract key entities from the claim"""
        entities = {}
        
        for entity_type, pattern in self.entity_patterns.items():
            matches = re.findall(pattern, claim, re.IGNORECASE)
            entities[entity_type] = list(set(matches))  # Remove duplicates
            
        return entities
    
    def _classify_claim_type(self, claim: str) -> str:
        """Classify the type of claim for targeted fact-checking"""
        claim_lower = claim.lower()
        
        # Classification patterns
        if any(word in claim_lower for word in ['taller', 'shorter', 'bigger', 'smaller', 'meters', 'feet', 'height']):
            return 'measurement'
        elif any(word in claim_lower for word in ['when', 'year', 'date', 'happened', 'occurred']):
            return 'temporal'
        elif any(word in claim_lower for word in ['where', 'located', 'city', 'country', 'place']):
            return 'geographical'
        elif any(word in claim_lower for word in ['who', 'person', 'people', 'president', 'ceo']):
            return 'biographical'
        elif any(word in claim_lower for word in ['what', 'is', 'definition', 'means']):
            return 'definitional'
        elif any(word in claim_lower for word in ['more', 'less', 'than', 'compared', 'versus']):
            return 'comparative'
        else:
            return 'general'
    
    def _extract_key_terms(self, claim: str) -> List[str]:
        """Extract key terms for search and verification"""
        # Remove common stop words
        stop_words = {
            'the', 'is', 'are', 'was', 'were', 'a', 'an', 'and', 'or', 'but', 
            'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'that', 'this',
            'than', 'more', 'less', 'taller', 'shorter'
        }
        
        # Extract words (remove punctuation and convert to lowercase)
        words = re.findall(r'\b[a-zA-Z]+\b', claim.lower())
        key_terms = [word for word in words if word not in stop_words and len(word) > 2]
        
        return list(set(key_terms))  # Remove duplicates
    
    def _analyze_claim_structure(self, claim: str) -> Dict[str, Any]:
        """Analyze the grammatical and logical structure of the claim"""
        structure = {
            'is_question': claim.strip().endswith('?'),
            'is_comparative': any(word in claim.lower() for word in ['than', 'compared', 'versus', 'more', 'less']),
            'has_negation': any(word in claim.lower() for word in ['not', 'never', 'no', "n't", 'false']),
            'has_quantifier': bool(re.search(r'\b\d+', claim)),
            'sentence_length': len(claim.split()),
            'complexity_score': self._calculate_complexity(claim)
        }
        
        return structure
    
    def _calculate_complexity(self, claim: str) -> float:
        """Calculate a complexity score for the claim"""
        score = 0.0
        
        # Length factor
        word_count = len(claim.split())
        score += min(word_count / 10, 1.0)  # Max 1.0 for length
        
        # Subordinate clauses
        subordinate_words = ['that', 'which', 'who', 'where', 'when', 'because', 'since', 'although']
        score += sum(0.2 for word in subordinate_words if word in claim.lower())
        
        # Numbers and measurements (harder to verify)
        score += len(re.findall(r'\b\d+', claim)) * 0.3
        
        return min(score, 5.0)  # Cap at 5.0
    
    def _generate_search_queries(self, claim: str) -> List[str]:
        """Generate search queries for external verification"""
        key_terms = self._extract_key_terms(claim)
        entities = self._extract_entities(claim)
        
        queries = [claim]  # Original claim as primary query
        
        # Generate focused queries based on entities
        if entities.get('places'):
            for place in entities['places'][:2]:  # Limit to 2 places
                queries.append(f"{place} facts information")
        
        if entities.get('numbers'):
            # Combine numbers with key terms
            for number in entities['numbers'][:2]:
                queries.append(f"{number} {' '.join(key_terms[:3])}")
        
        # Generate query from key terms
        if len(key_terms) >= 3:
            queries.append(' '.join(key_terms[:5]))
        
        return queries[:5]  # Limit to 5 queries
    
    def _basic_preprocessing(self, claim: str) -> Dict[str, Any]:
        """Basic preprocessing fallback when Pathway is not available"""
        return {
            'original_claim': claim.strip(),
            'normalized_claim': self._normalize_text(claim),
            'entities': self._extract_entities(claim),
            'claim_type': self._classify_claim_type(claim),
            'key_terms': self._extract_key_terms(claim),
            'structure': self._analyze_claim_structure(claim),
            'search_queries': self._generate_search_queries(claim),
            'timestamp': datetime.utcnow().isoformat(),
            'preprocessing_method': 'basic'
        }
    
    def create_verification_context(self, processed_claim: Dict[str, Any], external_data: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """
        Create structured context for LLaMA reasoning
        
        Args:
            processed_claim: Output from preprocess_claim
            external_data: Optional external search results
            
        Returns:
            Structured context for fact-checking
        """
        context = {
            'claim_analysis': processed_claim,
            'verification_strategy': self._determine_verification_strategy(processed_claim),
            'external_evidence': external_data or [],
            'confidence_factors': self._identify_confidence_factors(processed_claim),
            'potential_issues': self._identify_potential_issues(processed_claim)
        }
        
        return context
    
    def _determine_verification_strategy(self, processed_claim: Dict[str, Any]) -> str:
        """Determine the best strategy for verifying this type of claim"""
        claim_type = processed_claim.get('claim_type', 'general')
        
        strategies = {
            'measurement': 'Compare against authoritative measurement databases',
            'temporal': 'Verify dates against historical records',
            'geographical': 'Cross-reference with geographical databases',
            'biographical': 'Verify against biographical sources',
            'definitional': 'Check against authoritative definitions',
            'comparative': 'Gather data for both subjects and compare',
            'general': 'Multi-source verification with credible sources'
        }
        
        return strategies.get(claim_type, strategies['general'])
    
    def _identify_confidence_factors(self, processed_claim: Dict[str, Any]) -> List[str]:
        """Identify factors that affect confidence in verification"""
        factors = []
        
        structure = processed_claim.get('structure', {})
        
        if structure.get('has_quantifier'):
            factors.append('Contains specific numbers - verifiable')
        
        if structure.get('is_comparative'):
            factors.append('Comparative claim - requires multiple data points')
        
        if structure.get('complexity_score', 0) > 3:
            factors.append('High complexity - may be difficult to verify')
        
        entities = processed_claim.get('entities', {})
        if entities.get('places'):
            factors.append('Contains geographical references - verifiable')
        
        if entities.get('dates'):
            factors.append('Contains dates - historically verifiable')
        
        return factors
    
    def _identify_potential_issues(self, processed_claim: Dict[str, Any]) -> List[str]:
        """Identify potential issues that might affect verification"""
        issues = []
        
        structure = processed_claim.get('structure', {})
        
        if structure.get('is_question'):
            issues.append('Claim is phrased as a question')
        
        if structure.get('has_negation'):
            issues.append('Contains negation - verify the positive statement')
        
        if len(processed_claim.get('key_terms', [])) < 2:
            issues.append('Very few key terms - may be too vague')
        
        if structure.get('complexity_score', 0) > 4:
            issues.append('High complexity - break down into sub-claims')
        
        return issues


# Global processor instance
pathway_processor = PathwayProcessor()