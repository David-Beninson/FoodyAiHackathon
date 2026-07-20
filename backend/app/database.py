import pymongo
from beanie import init_beanie
import logging
from app.config import settings
from app.models import ALL_MODELS

logger = logging.getLogger("uvicorn")

async def init_db():
    logger.info("Initializing database connection using PyMongo AsyncMongoClient...")
    client = pymongo.AsyncMongoClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=ALL_MODELS
    )
    logger.info("Database and Beanie models initialized successfully.")
