import os
import asyncio
from contextlib import asynccontextmanager
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.v1.router import api_router

async def keep_alive_ping():
    # Wait 30 seconds after startup to ensure server is fully ready
    await asyncio.sleep(30)
    
    self_url = os.getenv("SELF_PUBLIC_URL")
    if not self_url:
        print("[Keep-Alive] SELF_PUBLIC_URL environment variable is not set. Self-pings are disabled.")
        return
        
    print(f"[Keep-Alive] Initializing self-pings to keep Render service awake: {self_url}")
    async with httpx.AsyncClient() as client:
        while True:
            try:
                # Trigger an inbound HTTP request through Render's load balancer/router
                res = await client.get(self_url, timeout=15.0)
                print(f"[Keep-Alive] Self-ping status: {res.status_code}")
            except Exception as e:
                print(f"[Keep-Alive] Ping failed: {e}")
            
            # Ping every 10 minutes (600 seconds) to prevent Render's 15-minute sleep trigger
            await asyncio.sleep(600)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB Atlas
    await connect_to_mongo()
    
    # Start the keep-alive task in the background
    ping_task = asyncio.create_task(keep_alive_ping())
    
    yield
    
    # Shutdown: Cancel keep-alive task and close database connections
    ping_task.cancel()
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Scalable, Modular FastAPI Backend Engine for NEXUS AI Studio",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 Master API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }
