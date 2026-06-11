from fastapi import APIRouter, Depends, HTTPException, status, Request
from bson import ObjectId
from datetime import datetime
try:
    from backend.database.mongodb import get_database, check_connection, DatabaseOfflineException
except ImportError:
    from database.mongodb import get_database, check_connection, DatabaseOfflineException
from routes.auth_routes import get_current_user
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

try:
    from backend.utils.jwt_handler import verify_access_token
except ImportError:
    from utils.jwt_handler import verify_access_token

router = APIRouter(prefix="/api", tags=["evaluations-reports"])

# Pydantic schemas
class ReportCreate(BaseModel):
    title: str
    filename: str
    score: int
    metrics: str
    evaluation_id: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    title: str
    filename: str
    score: int
    metrics: str
    date_saved: str

class EvaluationResponse(BaseModel):
    id: str
    filename: str
    type: str
    score: int
    status: str
    date: str
    checksPassed: str

class StatsResponse(BaseModel):
    documents_processed: int
    compliance_evaluations: int
    reports_generated: int
    classification_accuracy: float
    top_score: int

def verify_db_connected():
    if not check_connection():
        raise DatabaseOfflineException()

@router.get("/evaluations/stats", response_model=StatsResponse)
async def get_stats(request: Request):
    """
    Computes analytics directly from the MongoDB Atlas databases.
    Supports optional bearer authentication to return user-specific statistics,
    or falls back to system-wide global statistics if anonymous.
    """
    verify_db_connected()
    db = get_database()
    
    # Determine optional authenticated user
    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = verify_access_token(token)
            if payload:
                user_id = payload.get("sub")
        except Exception:
            pass

    # Build match filter
    match_filter = {}
    if user_id:
        match_filter["user_id"] = user_id
        
    # 1. Total Documents Processed
    documents_processed = await db.evaluations.count_documents(match_filter)
    
    # 2. Compliance Evaluations
    compliance_match = dict(match_filter)
    compliance_match["compliance_score"] = {"$ne": None}
    compliance_evaluations = await db.evaluations.count_documents(compliance_match)
    
    # 3. Total Saved Reports
    reports_match = {}
    if user_id:
        reports_match["user_id"] = user_id
    reports_generated = await db.reports.count_documents(reports_match)
    
    # 4. Average Classification Accuracy / Confidence
    pipeline = []
    if match_filter:
        pipeline.append({"$match": match_filter})
    pipeline.append({"$group": {"_id": None, "avg_confidence": {"$avg": "$confidence"}}})
    
    cursor = db.evaluations.aggregate(pipeline)
    avg_confidence = 0.0
    async for doc in cursor:
        avg_confidence = doc.get("avg_confidence") or 0.0

    # 5. Top Score
    top_score = 0
    top_pipeline = []
    if match_filter:
        top_pipeline.append({"$match": match_filter})
    top_pipeline.append({"$group": {"_id": None, "max_score": {"$max": "$compliance_score"}}})
    
    cursor = db.evaluations.aggregate(top_pipeline)
    async for doc in cursor:
        top_score = doc.get("max_score") or 0
        
    return StatsResponse(
        documents_processed=documents_processed,
        compliance_evaluations=compliance_evaluations,
        reports_generated=reports_generated,
        classification_accuracy=round(avg_confidence, 4),
        top_score=top_score
    )

@router.get("/evaluations/history", response_model=List[EvaluationResponse])
async def get_history(current_user: dict = Depends(get_current_user)):
    """
    Fetches actual evaluation history logs for the logged-in user from MongoDB.
    """
    verify_db_connected()
    db = get_database()
    
    # Filter by user ID
    user_id = str(current_user["_id"])
    cursor = db.evaluations.find({"user_id": user_id}).sort("created_at", -1)
    
    history = []
    async for doc in cursor:
        passed = doc.get("passed_checks") or 0
        total = (doc.get("passed_checks") or 0) + (doc.get("failed_checks") or 0) + (doc.get("partial_checks") or 0)
        
        # Parse date
        date_str = doc.get("created_at")[:10] if doc.get("created_at") else datetime.utcnow().strftime("%Y-%m-%d")
        
        history.append(EvaluationResponse(
            id=str(doc["_id"]),
            filename=doc.get("filename", "Unknown File"),
            type=doc.get("document_type", "Unknown Type"),
            score=doc.get("compliance_score") or 0,
            status=doc.get("overall_status") or "Compliant",
            date=date_str,
            checksPassed=f"{passed}/{total} checks"
        ))
    return history

@router.post("/evaluations/clear-logs")
async def clear_logs(current_user: dict = Depends(get_current_user)):
    """
    Deletes all user evaluation records from the database.
    """
    verify_db_connected()
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Clear evaluations matching this user
    result = await db.evaluations.delete_many({"user_id": user_id})
    return {"detail": "Logs cleared successfully.", "deleted_count": result.deleted_count}

@router.delete("/evaluations/{evaluation_id}")
async def delete_evaluation(evaluation_id: str, current_user: dict = Depends(get_current_user)):
    """
    Deletes a specific user evaluation record.
    """
    verify_db_connected()
    db = get_database()
    user_id = str(current_user["_id"])
    try:
        result = await db.evaluations.delete_one({"_id": ObjectId(evaluation_id), "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evaluation log not found."
            )
        return {"detail": "Evaluation log deleted successfully."}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid evaluation ID format: {str(e)}"
        )

@router.get("/reports", response_model=List[ReportResponse])
async def get_reports(current_user: dict = Depends(get_current_user)):
    """
    Retrieves user saved reports from MongoDB.
    """
    verify_db_connected()
    db = get_database()
    user_id = str(current_user["_id"])
    
    cursor = db.reports.find({"user_id": user_id}).sort("created_at", -1)
    reports = []
    async for doc in cursor:
        reports.append(ReportResponse(
            id=str(doc["_id"]),
            title=doc.get("title"),
            filename=doc.get("filename"),
            score=doc.get("score"),
            metrics=doc.get("metrics"),
            date_saved=doc.get("date_saved", datetime.utcnow().strftime("%B %d, %Y"))
        ))
    return reports

@router.post("/reports", response_model=ReportResponse)
async def save_report(report_data: ReportCreate, current_user: dict = Depends(get_current_user)):
    """
    Saves a report to MongoDB Atlas.
    """
    verify_db_connected()
    db = get_database()
    user_id = str(current_user["_id"])
    
    report_doc = {
        "user_id": user_id,
        "title": report_data.title,
        "filename": report_data.filename,
        "score": report_data.score,
        "metrics": report_data.metrics,
        "evaluation_id": report_data.evaluation_id,
        "date_saved": datetime.utcnow().strftime("%B %d, %Y"),
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db.reports.insert_one(report_doc)
    report_doc["id"] = str(result.inserted_id)
    return report_doc

@router.delete("/reports/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """
    Removes a report from the database.
    """
    verify_db_connected()
    db = get_database()
    user_id = str(current_user["_id"])
    
    try:
        result = await db.reports.delete_one({"_id": ObjectId(report_id), "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found or not owned by user."
            )
        return {"detail": "Report deleted successfully."}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid report ID format: {str(e)}"
        )
