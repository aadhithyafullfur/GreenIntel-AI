import os
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from typing import List
from pydantic import BaseModel

try:
    from backend.utils.pdf_extractor import extract_text_from_pdf
    from backend.utils.classifier import classify_text
except ImportError:
    from utils.pdf_extractor import extract_text_from_pdf
    from utils.classifier import classify_text

router = APIRouter()

# Schema for classification results
class ClassificationResponse(BaseModel):
    filename: str
    document_type: str
    confidence: float

# Ensure uploads folder exists
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ClassificationResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a single PDF, extract its text, predict its document type using DistilBERT,
    and return the classification result.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{file.filename}' is not a PDF. Only PDF files are supported."
        )

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        # Save file to uploads folder
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract text from the PDF
        text = extract_text_from_pdf(file_path)
        
        # Predict document type and confidence
        doc_type, confidence = classify_text(text)
        
        return ClassificationResponse(
            filename=file.filename,
            document_type=doc_type,
            confidence=round(confidence, 4)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process '{file.filename}': {str(e)}"
        )
    finally:
        # Clean up temporary uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

@router.post("/upload-multiple", response_model=List[ClassificationResponse])
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """
    Upload multiple PDFs, extract text from each, predict document types,
    and return list of classification results.
    """
    results = []
    
    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file.filename}' is not a PDF. Only PDF files are supported."
            )
            
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        
        try:
            # Save file to uploads folder
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            # Extract text
            text = extract_text_from_pdf(file_path)
            
            # Predict document type and confidence
            doc_type, confidence = classify_text(text)
            
            results.append(
                ClassificationResponse(
                    filename=file.filename,
                    document_type=doc_type,
                    confidence=round(confidence, 4)
                )
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process '{file.filename}': {str(e)}"
            )
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass
                    
    return results
