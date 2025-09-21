"""
Models Package Initialization

This file makes the models directory a Python package and
provides convenient imports for database models and schemas.
"""

from .database import ClaimResult, get_db, create_tables, init_database
from .schemas import (
    ClaimRequest, 
    ClaimResponse, 
    HistoryResponse, 
    StatsResponse, 
    ErrorResponse,
    VerdictEnum
)

__all__ = [
    # Database models
    "ClaimResult",
    "get_db", 
    "create_tables",
    "init_database",
    
    # Pydantic schemas
    "ClaimRequest",
    "ClaimResponse", 
    "HistoryResponse",
    "StatsResponse",
    "ErrorResponse",
    "VerdictEnum"
]