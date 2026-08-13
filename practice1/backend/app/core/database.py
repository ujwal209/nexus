import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("nexus.database")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_manager = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB Atlas...")
    db_manager.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_manager.db = db_manager.client[settings.DATABASE_NAME]
    try:
        await db_manager.client.admin.command("ping")
        logger.info(f"Successfully connected to MongoDB Atlas database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB Atlas: {e}")

async def close_mongo_connection():
    logger.info("Closing MongoDB Atlas connection...")
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB Atlas connection closed.")

def get_database():
    return db_manager.db
