import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.routes.document_routes import router as document_router
    from backend.utils.classifier import initialize_model_if_missing
except ImportError:
    from routes.document_routes import router as document_router
    from utils.classifier import initialize_model_if_missing

app = FastAPI(
    title="IGBC Document Evaluation API",
    description="Backend API for classifying IGBC documents using DistilBERT",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to authorized origins (e.g., frontend host)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure folders exist
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "models", "document_classifier"))

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

# Include routes
app.include_router(document_router, tags=["document-evaluation"])

@app.on_event("startup")
def startup_event():
    """
    Runs on startup to ensure the local DistilBERT model files
    are loaded or initialized correctly.
    """
    print("Initializing server and checking for document classifier model...")
    try:
        initialize_model_if_missing()
        print("Document classifier ready.")
    except Exception as e:
        print(f"Error during startup model initialization: {e}")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "IGBC Document Evaluation System API",
        "version": "1.0.0"
    }
