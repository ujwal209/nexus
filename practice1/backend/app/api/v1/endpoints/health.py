from datetime import datetime
from fastapi import APIRouter
from app.core.config import settings
from app.core.database import db_manager

router = APIRouter()

@router.get("/health", summary="Health Check")
async def health_check():
    """Health check endpoint validating MongoDB Atlas status."""
    try:
        if db_manager.client:
            await db_manager.client.admin.command("ping")
            mongo_status = "connected"
        else:
            mongo_status = "not_initialized"
    except Exception as e:
        mongo_status = f"error: {str(e)}"

    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "database": settings.DATABASE_NAME,
        "mongo_status": mongo_status,
        "timestamp": datetime.utcnow().isoformat()
    }
