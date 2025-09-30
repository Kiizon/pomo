from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import auth, sessions

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pomo API",
    description="FastAPI backend for Pomodoro productivity tracker",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(sessions.router)

@app.get("/")
async def root():
    return {"message": "Pomo API - FastAPI Backend", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
