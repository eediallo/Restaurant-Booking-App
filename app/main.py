"""
Restaurant Booking Mock API Server.

A complete FastAPI-based mock server that simulates a restaurant booking system.
This server provides realistic endpoints for availability checking, booking creation,
booking management, and cancellation operations.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import availability, booking, auth, user, restaurant, advanced_booking, reviews
from app.database import engine
from app.models import Base
import app.init_db as init_db
import os

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Restaurant Booking Mock API",
    description=(
        "A complete mock restaurant booking management system built with FastAPI "
        "and SQLite. Provides realistic endpoints for testing applications."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for the React frontend
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    print(f"Static files mounted from: {static_dir}")
else:
    print(f"Static directory not found: {static_dir}")

# Include API routers
app.include_router(availability.router)
app.include_router(booking.router)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(restaurant.router)
app.include_router(advanced_booking.router)
app.include_router(reviews.router)


@app.on_event("startup")
async def startup_event() -> None:
    """
    Initialize database with sample data on application startup.

    This function is called once when the FastAPI application starts.
    It ensures the database contains sample restaurant data and availability slots.
    """
    init_db.init_sample_data()


@app.get("/api", summary="API Information", tags=["API Info"])
@app.get("/api/info", summary="API Information", tags=["API Info"])
async def api_info() -> dict:
    """
    Get API information and available endpoints.

    Returns:
        dict: API metadata including version and available endpoint URLs.
    """
    return {
        "message": "Restaurant Booking Mock API",
        "version": "1.0.0",
        "description": "Mock restaurant booking system for testing applications",
        "endpoints": {
            "availability_search": (
                "/api/ConsumerApi/v1/Restaurant/{restaurant_name}/"
                "AvailabilitySearch"
            ),
            "create_booking": (
                "/api/ConsumerApi/v1/Restaurant/{restaurant_name}/"
                "BookingWithStripeToken"
            ),
            "cancel_booking": (
                "/api/ConsumerApi/v1/Restaurant/{restaurant_name}/Booking/"
                "{booking_reference}/Cancel"
            ),
            "get_booking": (
                "/api/ConsumerApi/v1/Restaurant/{restaurant_name}/Booking/"
                "{booking_reference}"
            ),
            "update_booking": (
                "/api/ConsumerApi/v1/Restaurant/{restaurant_name}/Booking/"
                "{booking_reference}"
            ),
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for deployment platforms."""
    return {"status": "healthy", "message": "Restaurant Booking API is running"}


@app.get("/", include_in_schema=False)
async def serve_frontend():
    """Serve the React frontend at the root URL."""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
    index_path = os.path.join(static_dir, "index.html")
    
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return {"message": "Frontend not available", "static_dir": static_dir}


# Serve React app for all other non-API routes (this should be last)
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    """
    Serve React Single Page Application for all non-API routes.
    This catch-all route handles client-side routing.
    """
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
    
    # Try to serve the specific file first (for assets like CSS, JS, images)
    if full_path and full_path != "":
        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
    
    # Default to index.html for SPA routing
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return {"message": "Frontend not available", "static_dir": static_dir, "index_exists": os.path.exists(index_path)}
