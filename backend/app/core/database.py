import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

def init_db_engine():
    if "sqlite" in db_url:
        return create_engine(db_url, connect_args={"check_same_thread": False})
    try:
        eng = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args={"connect_timeout": 3}
        )
        # Test connection
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[Database] Successfully connected to PostgreSQL!")
        return eng
    except Exception as e:
        print(f"[Database] PostgreSQL connection failed ({e}).\n[Database] Using local SQLite database (sqlite:///./land_acquisition.db).")
        return create_engine("sqlite:///./land_acquisition.db", connect_args={"check_same_thread": False})

engine = init_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
