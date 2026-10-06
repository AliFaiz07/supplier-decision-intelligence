"""
Main FastAPI Application Entry Point for SAP Supplier Decision Intelligence Platform.
"""

import sys
import os

# Add backend and project root to sys.path
CURRENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
for path in [CURRENT_DIR, PROJECT_ROOT]:
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.core.data_validator import check_data_health
from app.api.endpoints import (
    overview,
    requirements,
    eligibility,
    decision,
    suppliers,
    scenarios,
    history,
    explorer,
    system,
    assistant,
    analytics
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SDI-Backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Validate mock data
    logger.info("Initializing SAP Supplier Decision Intelligence Platform...")
    health = check_data_health()
    logger.info(f"Data Health Status: {health['status']} ({health['loaded_datasets']}/{health['total_datasets']} datasets loaded)")
    if health["errors"]:
        logger.error(f"Critical Mock Data Errors: {health['errors']}")
    yield
    logger.info("Shutting down Supplier Decision Intelligence Platform...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise POC Decision Support Layer for SAP Procurement Decisions.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local POC testing across 5173/3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
api_prefix = settings.API_V1_STR
app.include_router(overview.router, prefix=f"{api_prefix}/overview", tags=["Overview"])
app.include_router(requirements.router, prefix=f"{api_prefix}/requirements", tags=["Requirements"])
app.include_router(eligibility.router, prefix=f"{api_prefix}/eligibility", tags=["Eligibility"])
app.include_router(decision.router, prefix=f"{api_prefix}/decision", tags=["Decision Engine"])
app.include_router(suppliers.router, prefix=f"{api_prefix}/suppliers", tags=["Suppliers"])
app.include_router(scenarios.router, prefix=f"{api_prefix}/scenarios", tags=["Scenarios"])
app.include_router(history.router, prefix=f"{api_prefix}/history", tags=["Decision History"])
app.include_router(explorer.router, prefix=f"{api_prefix}/explorer", tags=["Data Explorer"])
app.include_router(system.router, prefix=f"{api_prefix}/system", tags=["System & Health"])
app.include_router(assistant.router, prefix=f"{api_prefix}/assistant", tags=["AI Assistant"])
app.include_router(analytics.router, prefix=f"{api_prefix}/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "mode": "Enterprise POC (Deterministic Decision Engine + Synthetic SAP Master Data)",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
