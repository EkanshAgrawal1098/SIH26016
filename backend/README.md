# Real-Time National Land Acquisition & Management System - Backend API

Production-grade FastAPI backend developed for Smart India Hackathon (SIH 2026).

## Tech Stack
- **API Framework**: FastAPI + Pydantic v2 + Uvicorn
- **Database & ORM**: SQLAlchemy 2.0 + PostgreSQL / PostGIS (with SQLite resilient fallback)
- **Authentication**: JWT Bearer + Role-Based Access Control (RBAC) + Multi-jurisdiction scopes
- **Real-Time**: WebSockets event streaming (`/ws/events`)
- **Interoperability**: State-specific schema normalization adapters (Jharkhand, Maharashtra, West Bengal, UP)
- **Intelligence**: Explainable risk engine & automated corridor bottleneck detection

## Folder Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── parcels.py
│   │   │   │   ├── acquisition.py
│   │   │   │   ├── analytics.py
│   │   │   │   ├── documents.py
│   │   │   │   ├── interoperability.py
│   │   │   │   ├── grievances.py
│   │   │   │   └── reference.py
│   │   │   └── api.py
│   │   └── websockets.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   ├── schemas/
│   ├── services/
│   │   ├── risk_engine.py
│   │   ├── bottleneck_analyzer.py
│   │   ├── state_adapters.py
│   │   └── audit_service.py
│   ├── main.py
│   └── seed.py
├── .env
├── requirements.txt
└── README.md
```

## Quickstart

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Database
Edit `backend/.env` with your PostgreSQL database URL or connection pooler string:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=sih-2026-super-secret-land-acquisition-jwt-key
```

### 3. Seed Database
```bash
python -m app.seed
```

### 4. Start Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation available at: **`http://127.0.0.1:8000/api/v1/docs`**
