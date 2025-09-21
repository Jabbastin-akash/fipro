version: "1.1"


# Fact Checker AI Agent Instructions
# This file guides AI coding agents for immediate productivity in this codebase.

## Project Overview

The Fact Checker app verifies factual claims using a Python/FastAPI backend and a React frontend. It integrates Pathway for linguistic analysis and LLaMA for AI reasoning. The backend and frontend communicate via REST API.

## Architecture & Data Flow


- **Backend** (`backend/`):
  - Layered structure:
    - API layer (`main.py`): FastAPI endpoints, app setup
    - Models (`models/`): SQLAlchemy DB models, Pydantic schemas
    - Services (`services/`): Stateless business logic, orchestrates claim verification
  - Claim verification pipeline:
    1. Store claim in DB
    2. Preprocess with Pathway (`pathway_service.py`)
    3. Analyze with LLaMA (`llama_service.py`)
    4. Return verdict, confidence, explanation
  - All services are stateless singletons

- **Frontend** (`frontend/`):
  - React component-based structure
  - Centralized API client (`src/services/api.js`)
  - Main UI flow:
    - User submits claim via `InputForm.jsx`
    - Result displayed in `ResultCard.jsx` (color-coded by verdict)
    - History and stats in `HistoryPage.jsx` and `StatsPage.jsx`
  - TailwindCSS for styling


## Developer Workflows


- **Backend**:
  - Run: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload`
  - Test endpoints: FastAPI Swagger UI at `/docs`
  - Logs: `backend.log` for runtime info

- **Frontend**:
  - Run: `cd frontend && npm install && npm run dev`
  - Build: `npm run build`
  - Logs: `frontend.log`

- **Docker Compose**:
  - Use `docker-compose.yml` for full-stack deployment
  - Backend connects to SQLite volume
  - Frontend served via nginx


## Conventions & Patterns


- **API responses**: Always include `verdict`, `confidence_score`, `explanation`
- **Verdicts**: Only "True", "False", "Unverified"
- **Error handling**: Use try/except, return specific error responses
- **Component props**: Validate with PropTypes
- **Database**: SQLAlchemy models, explicit relationships
- **Styling**: TailwindCSS with custom utility classes


## Integration Points

- **Pathway**: Used for entity extraction and claim structuring
- **LLaMA**: Used for AI reasoning and verdict generation
- **Frontend/Backend**: Communicate via REST API defined in `main.py` and consumed in `api.js`

## Key Files & Directories

- `backend/main.py`: API endpoints
- `backend/models/`: DB models & schemas
- `backend/services/`: Fact checking, Pathway, LLaMA logic
- `frontend/src/components/`: UI components
- `frontend/src/services/api.js`: API client
- `docker-compose.yml`: Deployment config

## Example Workflow

1. User submits claim in frontend
2. API request sent to backend
3. Backend processes claim, returns result
4. Frontend displays verdict card

---

For unclear or missing sections, please provide feedback to improve these instructions.