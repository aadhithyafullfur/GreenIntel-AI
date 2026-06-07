import os
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

try:
    from backend.utils.pdf_extractor import extract_text_from_pdf
    from backend.utils.classifier import classify_text
    from backend.services.information_extractor import extract_information
except ImportError:
    from utils.pdf_extractor import extract_text_from_pdf
    from utils.classifier import classify_text
    from services.information_extractor import extract_information

router = APIRouter()

# Schema for classification & extraction results
class ClassificationResponse(BaseModel):
    filename: str
    document_type: str
    confidence: float
    extracted_data: Optional[Dict[str, Any]] = None

# Ensure uploads folder exists
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ClassificationResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a single PDF, extract its text, predict its document type using DistilBERT,
    extract structured fields using Groq (Llama-3.3-70b-versatile),
    and return the classification & extraction results.
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
        try:
            text = extract_text_from_pdf(file_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Text extraction failed for '{file.filename}': {str(e)}"
            )
        
        # Predict document type and confidence
        try:
            doc_type, confidence = classify_text(text)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Classification failed for '{file.filename}': {str(e)}"
            )
        
        # Extract structured information using Groq (Llama 3.3 70B)
        try:
            extracted_data = extract_information(doc_type, text)
        except Exception as extractor_err:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Information extraction failed for '{file.filename}': {str(extractor_err)}"
            )
        
        return ClassificationResponse(
            filename=file.filename,
            document_type=doc_type,
            confidence=round(confidence, 4),
            extracted_data=extracted_data
        )
        
    except HTTPException as he:
        # Re-raise HTTPExceptions directly to client
        raise he
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
    extract structured fields using Groq, and return a list of results.
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
            try:
                text = extract_text_from_pdf(file_path)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Text extraction failed for '{file.filename}': {str(e)}"
                )
            
            # Predict document type and confidence
            try:
                doc_type, confidence = classify_text(text)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Classification failed for '{file.filename}': {str(e)}"
                )
            
            # Extract structured information using Groq (Llama 3.3 70B)
            try:
                extracted_data = extract_information(doc_type, text)
            except Exception as extractor_err:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Information extraction failed for '{file.filename}': {str(extractor_err)}"
                )
            
            results.append(
                ClassificationResponse(
                    filename=file.filename,
                    document_type=doc_type,
                    confidence=round(confidence, 4),
                    extracted_data=extracted_data
                )
            )
            
        except HTTPException as he:
            raise he
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

