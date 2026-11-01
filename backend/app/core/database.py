import os
import logging
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("nexora.database")

# Normalize database URL
db_url = settings.DATABASE_URL.strip() if settings.DATABASE_URL else "sqlite:///./nexora.db"

# If postgresql+asyncpg is provided in sync engine, normalize to standard postgresql driver
if "+asyncpg" in db_url:
    db_url = db_url.replace("+asyncpg", "")

def create_configured_engine(url: str):
    """Create an engine with appropriate connection parameters."""
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        return create_engine(url, connect_args=connect_args, echo=False)
    else:
        # PostgreSQL / MySQL
        return create_engine(url, pool_pre_ping=True, echo=False)

# Attempt to initialize engine with resilience
try:
    engine = create_configured_engine(db_url)
    # Probe non-sqlite connection to verify server is reachable
    if not db_url.startswith("sqlite"):
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(f"Connected successfully to primary database at {db_url.split('@')[-1] if '@' in db_url else db_url}")
except Exception as exc:
    logger.warning(
        f"[NEXORA DB NOTICE] Primary database connection failed ({exc}). "
        f"Falling back smoothly to local SQLite database ('sqlite:///./nexora.db') for zero downtime."
    )
    db_url = "sqlite:///./nexora.db"
    engine = create_configured_engine(db_url)

# Enable SQLite foreign key enforcement if using SQLite
if db_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that yields a database session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
