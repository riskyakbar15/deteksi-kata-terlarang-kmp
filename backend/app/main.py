from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.routers import auth, chat, forbidden_words, statistics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
    yield
    # Shutdown
    print("👋 Application shutting down")


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
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
