from fastapi import APIRouter
from app.api.v1.endpoints import health, workflows, executions, auth
from app.api.v1.websockets import execution_ws

api_router = APIRouter()

# REST ROUTERS
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(workflows.router, tags=["Workflows"])
api_router.include_router(executions.router, tags=["Executions"])

# WEBSOCKET ROUTERS
api_router.include_router(execution_ws.router, tags=["Realtime WebSocket Engine"])
