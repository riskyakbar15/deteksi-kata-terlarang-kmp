import logging

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy import text
from sqlalchemy.orm import Session
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.config import settings
from app.database import engine, Base, get_db
from app.routers import auth, chat, forbidden_words, statistics
from app.utils.rate_limit import limiter

# Configure application logging.
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured (create_all)")
    yield
    # Shutdown
    logger.info("Application shutting down")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Deteksi Kata Terlarang API
    
    Aplikasi untuk mendeteksi kata-kata terlarang pada chat menggunakan 
    **Algoritma Knuth-Morris-Pratt (KMP)**.
    
    ### Fitur:
    - 🔍 Deteksi kata terlarang dengan algoritma KMP (O(n+m) complexity)
    - 🚫 Penyensoran otomatis kata terlarang
    - 📊 Statistik pelanggaran
    - 👤 Admin panel untuk mengelola kata terlarang
    - 🔐 Autentikasi JWT
    """,
    lifespan=lifespan
)

# Register rate limiter (per-IP) and its error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(forbidden_words.router)
app.include_router(statistics.router)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Selamat datang di API Deteksi Kata Terlarang",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "algorithm": "Knuth-Morris-Pratt (KMP)"
    }


@app.get("/health", tags=["Health"])
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint that verifies database connectivity."""
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Health check failed: database is unreachable")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected"},
        )
    return {"status": "healthy", "database": "connected"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
