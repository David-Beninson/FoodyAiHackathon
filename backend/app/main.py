from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging

from app.config import settings
from app.database import init_db
from app.routers import user, plan, ai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB and initialize Beanie ODM
    try:
        await init_db()
    except Exception as e:
        logger.critical(f"Failed to connect to MongoDB during startup: {e}")
        logger.critical("Make sure MongoDB is running and settings.MONGODB_URL is correct.")
    yield
    # Shutdown: Clean up resources if needed
    logger.info("Shutting down backend server...")

app = FastAPI(
    title="FoodyAI API",
    description="Backend API for FoodyAI - AI Food Adviser and Weekly Meal Organizer",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
# Allows requests from the React/Vite development server (usually http://localhost:5173 or similar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # During development, we allow all origins. Can be restricted to specific hosts.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(user.router, prefix="/api")
app.include_router(plan.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/", status_code=status.HTTP_200_OK)
async def root():
    """
    Root status check endpoint.
    """
    return {
        "status": "online",
        "message": "Welcome to the FoodyAI Backend API!",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
