import os
import logging
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Setup custom logging for app
logger = logging.getLogger("greenintel.app")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - [%(name)s] - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.propagate = False

try:
    from backend.routes.document_routes import router as document_router
    from backend.utils.classifier import initialize_model_if_missing
    from backend.database.mongodb import connect_to_mongo, close_mongo_connection, check_connection, DatabaseOfflineException
    from backend.routes.auth_routes import router as auth_router
    from backend.routes.evaluation_routes import router as evaluation_router
    from backend.routes.google_auth_routes import router as google_auth_router
except ImportError:
    from routes.document_routes import router as document_router
    from utils.classifier import initialize_model_if_missing
    from database.mongodb import connect_to_mongo, close_mongo_connection, check_connection, DatabaseOfflineException
    from routes.auth_routes import router as auth_router
    from routes.evaluation_routes import router as evaluation_router
    from routes.google_auth_routes import router as google_auth_router


from fastapi.responses import JSONResponse

app = FastAPI(
    title="IGBC Document Evaluation API",
    description="Backend API for classifying IGBC documents and compliance evaluation",
    version="1.0.0"
)

@app.exception_handler(DatabaseOfflineException)
async def database_offline_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": exc.message
        }
    )

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to authorized origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads and models directory exist
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "models", "document_classifier"))

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

# Include routes
app.include_router(document_router, tags=["document-evaluation"])
app.include_router(auth_router)
app.include_router(evaluation_router)
app.include_router(google_auth_router)


@app.on_event("startup")
async def startup_event():
    """
    Runs on application startup:
    1. Displays startup banner
    2. Establishes MongoDB connection
    3. Initializes DistilBERT classifier model
    4. Displays ready status
    """
    print("🚀 Starting GreenIntel AI Server...")
    logger.info("🚀 Starting GreenIntel AI Server...")
    
    # Establish MongoDB Atlas Connection
    db_success = await connect_to_mongo()
    
    # Initialize Document Classifier
    logger.info("Checking for document classifier model...")
    try:
        initialize_model_if_missing()
        logger.info("Document classifier ready.")
    except Exception as e:
        logger.error(f"Error during startup model initialization: {e}")
        
    if db_success:
        print("✅ Server Ready")
        logger.info("✅ Server Ready")
    else:
        logger.warning("Server startup completed with disconnected MongoDB Atlas status.")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Runs on application shutdown to close active database connections.
    """
    await close_mongo_connection()

@app.get("/health")
async def health_check():
    """
    Health Check API to verify service status and MongoDB connection.
    """
    is_db_connected = check_connection()
    return {
        "server": "running",
        "mongodb": "connected" if is_db_connected else "disconnected"
    }

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "IGBC Document Evaluation System API",
        "version": "1.0.0"
    }
