import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.seed.seed_data import run_seed

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.recruiter import router as recruiter_router
from app.api.v1.talent import router as talent_router
from app.api.v1.ai import router as ai_router
from app.api.v1.documents import router as documents_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.admin import router as admin_router
from app.api.v1.teams import router as teams_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NEXORA AI-Powered Developer Recruitment, Talent Discovery & Portfolio Platform API"
)

# CORS configuration
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: create tables and seed demonstration data
@app.on_event("startup")
def on_startup():
    print("[NEXORA] Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    # Safe migration for new Team fields on existing databases
    with engine.connect() as conn:
        from sqlalchemy import text
        for col_name, col_type in [
            ("logo_url", "VARCHAR(500)"),
            ("domain", "VARCHAR(100) DEFAULT 'Full-Stack Web'"),
            ("project_goals", "TEXT"),
            ("required_skills", "JSON DEFAULT '[]'"),
            ("visibility", "VARCHAR(50) DEFAULT 'public'"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE teams ADD COLUMN {col_name} {col_type}"))
                conn.commit()
            except Exception:
                pass

        # Safe migration for new Resume columns
        for col_name, col_type in [
            ("user_id", "INTEGER DEFAULT 1"),
            ("file_size", "INTEGER DEFAULT 0"),
            ("mime_type", "VARCHAR(100) DEFAULT 'application/pdf'"),
            ("version", "INTEGER DEFAULT 1"),
            ("is_active", "BOOLEAN DEFAULT 1"),
            ("visibility", "VARCHAR(50) DEFAULT 'verified_recruiters'"),
            ("status", "VARCHAR(50) DEFAULT 'uploaded'"),
            ("error_message", "TEXT"),
            ("ocr_applied", "BOOLEAN DEFAULT 0"),
            ("ai_provider_used", "VARCHAR(50)"),
            ("updated_at", "DATETIME")
        ]:
            try:
                conn.execute(text(f"ALTER TABLE resumes ADD COLUMN {col_name} {col_type}"))
                conn.commit()
            except Exception:
                pass

        # Safe migration for Identity & Branding columns
        for col_name, col_type in [
            ("cover_image_url", "VARCHAR(500)"),
            ("identity_status", "VARCHAR(50) DEFAULT 'not_started'"),
            ("identity_verified", "BOOLEAN DEFAULT 0"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE talent_profiles ADD COLUMN {col_name} {col_type}"))
                conn.commit()
            except Exception:
                pass

        try:
            conn.execute(text("ALTER TABLE teams ADD COLUMN cover_image_url VARCHAR(500)"))
            conn.commit()
        except Exception:
            pass

        try:
            conn.execute(text("ALTER TABLE jobs ADD COLUMN identity_requirement VARCHAR(50) DEFAULT 'none'"))
            conn.commit()
        except Exception:
            pass

    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()
    print("[NEXORA] Backend successfully initialized and ready.")

# Active WebSocket connections manager for real-time notifications
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

ws_manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo ping/pong heartbeat
            await websocket.send_json({"type": "pong", "client_data": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)

# Static storage mount
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
for subdir in ["avatars", "covers", "teams", "evidence", "resumes"]:
    os.makedirs(os.path.join(settings.STORAGE_DIR, subdir), exist_ok=True)
app.mount("/storage/uploads", StaticFiles(directory=settings.STORAGE_DIR), name="storage_uploads")

# Include API v1 routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(recruiter_router, prefix=settings.API_V1_STR)
app.include_router(talent_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(teams_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": "NEXORA",
        "tagline": "Where Technical Talent Meets the Right Opportunity.",
        "version": settings.VERSION,
        "status": "online",
        "ai_provider": settings.AI_PROVIDER,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
