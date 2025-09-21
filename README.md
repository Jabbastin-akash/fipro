# Fact Checker Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
   - [Docker Setup](#docker-setup)
4. [API Documentation](#api-documentation)
5. [Development Guidelines](#development-guidelines)
6. [Troubleshooting](#troubleshooting)

## Project Overview

The Fact Checker is an AI-powered web application that uses Pathway and LLaMA to analyze and verify factual claims. Users can submit claims, and the system will:

1. Process the claim using Pathway for linguistic analysis
2. Use LLaMA to reason about the claim's factuality
3. Return a verdict (True/False/Unverified) with confidence score and explanation
4. Store results in a SQLite database for future reference

## Architecture

### Project Structure

```
fact-checker/
├── backend/          # Python FastAPI backend
│   ├── main.py      # FastAPI app and endpoints
│   ├── models/      # Database models (Claim, Result)
│   ├── services/    # Pathway + LLaMA integration
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/  # InputForm, ResultCard
│   │   └── services/    # API client
│   ├── index.html
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Backend
- **FastAPI**: Provides API endpoints for claim submission and history retrieval
- **Pathway**: Processes claims through natural language analysis
- **LLaMA**: AI reasoning engine for fact verification
- **SQLAlchemy**: ORM for database interactions
- **SQLite**: Lightweight database for storing claim history

### Frontend
- **React**: Component-based UI library
- **Vite**: Build tool and development server
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: For client-side routing
- **Axios**: For API requests

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- NPM or Yarn
- Docker & Docker Compose (optional)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd fact-checker/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables (optional):
   ```bash
   # Create .env file
   echo "LLAMA_API_KEY=your_api_key" > .env
   echo "DATABASE_URL=sqlite:///./fact_checker.db" >> .env
   ```

5. Run the server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

6. Access the API documentation at http://localhost:8000/docs

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd fact-checker/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file (optional):
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:8000" > .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at http://localhost:3000

### Docker Setup

To run the entire application using Docker:

1. Navigate to the project root:
   ```bash
   cd fact-checker
   ```

2. Create an `.env` file in the project root:
   ```bash
   LLAMA_API_KEY=your_api_key
   ```

3. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

4. Access the application at http://localhost:3000 and API at http://localhost:8000

## API Documentation

### Endpoints

#### `POST /check`
Submit a claim for fact-checking.

**Request Body:**
```json
{
  "claim": "The Eiffel Tower is taller than 400 meters",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "id": 1,
  "claim": "The Eiffel Tower is taller than 400 meters",
  "verdict": "False",
  "confidence_score": 92.5,
  "explanation": "The Eiffel Tower is 330 meters tall...",
  "timestamp": "2023-01-15T10:30:00Z",
  "processing_time_ms": 1250
}
```

#### `GET /history`
Retrieve fact-check history.

**Query Parameters:**
- `limit` (optional): Maximum number of results (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "claim": "The Eiffel Tower is taller than 400 meters",
    "verdict": "False",
    "confidence_score": 92.5,
    "explanation": "The Eiffel Tower is 330 meters tall...",
    "timestamp": "2023-01-15T10:30:00Z"
  },
  ...
]
```

#### `GET /stats`
Get fact-checking statistics.

**Response:**
```json
{
  "total_claims": 150,
  "true_claims": 60,
  "false_claims": 70,
  "unverified_claims": 20,
  "average_confidence": 87.3,
  "average_processing_time_ms": 1450.5,
  "recent_claims_24h": 15,
  "success_rate": 86.7
}
```

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "pathway": "available",
    "llama": "configured"
  }
}
```

## Development Guidelines

### Adding New Features

1. **Backend**:
   - Add new endpoints in `main.py`
   - Create/update models in `models/`
   - Add business logic in `services/`

2. **Frontend**:
   - Create new components in `src/components/`
   - Add API integration in `src/services/api.js`
   - Update routes in `App.jsx`

### Code Style

- **Python**: Follow PEP 8 guidelines
- **JavaScript/React**: Use ESLint with recommended settings
- **Git**: Use semantic commit messages

## Troubleshooting

### Common Issues

#### Backend Errors

- **Database connection issues**:
  - Ensure SQLite file is writable
  - Check database path in environment variables

- **Pathway errors**:
  - Verify Pathway installation
  - Check for compatible versions

- **LLaMA integration**:
  - Verify API key is set correctly
  - Check network connectivity to LLaMA API

#### Frontend Errors

- **API connection issues**:
  - Verify backend is running
  - Check CORS configuration
  - Ensure API URL is correct in `.env`

- **Build errors**:
  - Clear node_modules and reinstall
  - Check for compatible package versions

### Getting Help

If you encounter issues not covered here, please:
1. Check the existing issues on GitHub
2. Create a new issue with detailed reproduction steps
3. Include relevant logs and environment information# newpro
# fipro
