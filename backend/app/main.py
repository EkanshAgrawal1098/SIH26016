from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router
from app.api.websockets import router as ws_router
import app.models # Register all models

# Automatically create tables if using SQLite or fresh database
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Notice: Table creation skipped or pending migrations: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real-Time National Land Acquisition & Management System Backend API for SIH 2026",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Real-Time National Land Acquisition & Management System API",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
