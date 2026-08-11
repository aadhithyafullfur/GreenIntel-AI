import os
import shutil
import uuid
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, status, Depends, Request
from pydantic import BaseModel, Field
from bson import ObjectId

try:
    from backend.database.mongodb import check_connection, get_database, DatabaseOfflineException
    from backend.routes.auth_routes import get_current_user
    from backend.utils.pdf_extractor import extract_text_from_pdf
    from backend.utils.classifier import classify_text
    from backend.services.information_extractor import extract_information
    from backend.services.compliance_checker import evaluate_compliance
except ImportError:
    from database.mongodb import check_connection, get_database, DatabaseOfflineException
    from routes.auth_routes import get_current_user
    from utils.pdf_extractor import extract_text_from_pdf
    from utils.classifier import classify_text
    from services.information_extractor import extract_information
    from services.compliance_checker import evaluate_compliance

router = APIRouter(prefix="/api/projects", tags=["projects"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

def verify_db_connected():
    if not check_connection():
        raise DatabaseOfflineException()

# Input Pydantic Schemas
class ProjectCreateInput(BaseModel):
    name: str = Field(..., description="Project Name")
    project_type: str = Field(..., description="Project Type e.g., Commercial Office, Residential")
    client_organization: Optional[str] = ""
    building_name: Optional[str] = ""
    location: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    country: Optional[str] = "India"
    
    building_area: Optional[str] = ""
    building_type: Optional[str] = ""
    number_of_floors: Optional[str] = ""
    occupancy_type: Optional[str] = ""
    description: Optional[str] = ""
    
    tags: Optional[List[str]] = []
    logo_url: Optional[str] = ""
    reference_number: Optional[str] = ""

class ProjectUpdateInput(BaseModel):
    name: Optional[str] = None
    project_type: Optional[str] = None
    client_organization: Optional[str] = None
    building_name: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    building_area: Optional[str] = None
    building_type: Optional[str] = None
    number_of_floors: Optional[str] = None
    occupancy_type: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None

# Helper to format project ID
def generate_project_id() -> str:
    suffix = uuid.uuid4().hex[:6].upper()
    return f"PRJ-{datetime.utcnow().year}-{suffix}"

# Helper to compute transparent project health score
def calculate_project_health(documents: List[dict]) -> dict:
    if not documents:
        return {
            "score": 0,
            "badge": "No Data",
            "overall_compliance": 0,
            "breakdown": {
                "energy_performance": 0,
                "water_performance": 0,
                "waste_performance": 0,
                "compliance_performance": 0,
                "document_completeness": 0
            }
        }

    # Completeness: Check which key report types exist
    required_types = ["Energy Report", "Water Report", "Waste Report", "Audit Report", "Compliance Document"]
    found_types = set(d.get("document_type") for d in documents if d.get("document_type"))
    completeness_score = round((len(found_types.intersection(required_types)) / len(required_types)) * 100, 1)

    # Compliance Scores by Category
    scores_by_cat = {t: [] for t in required_types}
    for d in documents:
        dt = d.get("document_type")
        sc = d.get("compliance_score")
        if dt in scores_by_cat and sc is not None:
            scores_by_cat[dt].append(sc)

    def avg_score(cat_name):
        arr = scores_by_cat.get(cat_name, [])
        return round(sum(arr) / len(arr), 1) if arr else None

    energy_sc = avg_score("Energy Report")
    water_sc = avg_score("Water Report")
    waste_sc = avg_score("Waste Report")
    comp_sc = avg_score("Compliance Document")

    # Calculate overall weighted score from available components
    avail_scores = []
    if energy_sc is not None: avail_scores.append(energy_sc)
    if water_sc is not None: avail_scores.append(water_sc)
    if waste_sc is not None: avail_scores.append(waste_sc)
    if comp_sc is not None: avail_scores.append(comp_sc)

    overall_comp = round(sum(avail_scores) / len(avail_scores), 1) if avail_scores else 0.0

    # Project Health = 70% Overall Compliance + 30% Document Completeness
    health_score = round((overall_comp * 0.7) + (completeness_score * 0.3), 1)

    if health_score >= 85:
        badge = "Excellent"
    elif health_score >= 70:
        badge = "Good"
    elif health_score >= 50:
        badge = "Needs Improvement"
    else:
        badge = "At Risk"

    return {
        "score": health_score,
        "badge": badge,
        "overall_compliance": overall_comp,
        "breakdown": {
            "energy_performance": energy_sc if energy_sc is not None else 0,
            "water_performance": water_sc if water_sc is not None else 0,
            "waste_performance": waste_sc if waste_sc is not None else 0,
            "compliance_performance": comp_sc if comp_sc is not None else 0,
            "document_completeness": completeness_score
        }
    }

# ----------------------------------------------------
# 1. CREATE NEW PROJECT
# ----------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_project(
    project_input: ProjectCreateInput,
    current_user: dict = Depends(get_current_user)
):
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    # Validate required fields
    if not project_input.name or not project_input.name.strip():
        raise HTTPException(status_code=400, detail="Project Name is required.")
    if not project_input.project_type or not project_input.project_type.strip():
        raise HTTPException(status_code=400, detail="Project Type is required.")

    project_id = generate_project_id()
    now_iso = datetime.utcnow().isoformat()

    project_doc = {
        "project_id": project_id,
        "owner_id": owner_id,
        "owner_email": current_user.get("email"),
        "name": project_input.name.strip(),
        "project_type": project_input.project_type.strip(),
        "client_organization": project_input.client_organization.strip() if project_input.client_organization else "",
        "building_name": project_input.building_name.strip() if project_input.building_name else "",
        "location": project_input.location.strip() if project_input.location else "",
        "city": project_input.city.strip() if project_input.city else "",
        "state": project_input.state.strip() if project_input.state else "",
        "country": project_input.country.strip() if project_input.country else "India",
        
        "building_area": project_input.building_area.strip() if project_input.building_area else "",
        "building_type": project_input.building_type.strip() if project_input.building_type else "",
        "number_of_floors": project_input.number_of_floors.strip() if project_input.number_of_floors else "",
        "occupancy_type": project_input.occupancy_type.strip() if project_input.occupancy_type else "",
        "description": project_input.description.strip() if project_input.description else "",
        
        "tags": project_input.tags or [],
        "logo_url": project_input.logo_url or "",
        "reference_number": project_input.reference_number or "",
        
        "status": "Active",
        "created_at": now_iso,
        "updated_at": now_iso,
        "last_analyzed_at": None,
        
        # Initial stats
        "documents_count": 0,
        "overall_compliance_score": None,
        "health_score": None,
        "health_badge": "No Documents"
    }

    # Insert into MongoDB
    res = await db.projects.insert_one(project_doc)
    project_doc["_id"] = str(res.inserted_id)

    # Record Timeline Event
    timeline_event = {
        "project_id": project_id,
        "owner_id": owner_id,
        "event_type": "PROJECT_CREATED",
        "title": "Project Created",
        "detail": f"Project '{project_input.name}' was created.",
        "timestamp": now_iso
    }
    await db.project_timelines.insert_one(timeline_event)

    return {"success": True, "project": project_doc}

# ----------------------------------------------------
# 2. GET ALL USER PROJECTS (PROJECTS HUB)
# ----------------------------------------------------
@router.get("")
@router.get("/")
async def get_user_projects(current_user: dict = Depends(get_current_user)):
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    projects_cursor = db.projects.find({"owner_id": owner_id}).sort("updated_at", -1)
    projects = await projects_cursor.to_list(length=1000)

    # Hydrate each project with live document counts and computed metrics
    hydrated_projects = []
    for proj in projects:
        proj_id = proj["project_id"]
        
        # Fetch all documents belonging to project
        docs = await db.evaluations.find({"project_id": proj_id, "user_id": owner_id}).to_list(length=1000)
        
        doc_count = len(docs)
        completed_count = sum(1 for d in docs if d.get("overall_status") != "Processing")
        
        health_info = calculate_project_health(docs)

        proj["_id"] = str(proj["_id"])
        proj["documents_count"] = doc_count
        proj["completed_documents_count"] = completed_count
        proj["overall_compliance_score"] = health_info["overall_compliance"]
        proj["health_score"] = health_info["score"]
        proj["health_badge"] = health_info["badge"]
        
        hydrated_projects.append(proj)

    return {"success": True, "projects": hydrated_projects}

# ----------------------------------------------------
# 3. GET SINGLE PROJECT DETAILS
# ----------------------------------------------------
@router.get("/{project_id}")
async def get_project_details(project_id: str, current_user: dict = Depends(get_current_user)):
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    project = await db.projects.find_one({"project_id": project_id, "owner_id": owner_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized access.")

    project["_id"] = str(project["_id"])
    
    # Hydrate live documents & health
    docs = await db.evaluations.find({"project_id": project_id, "user_id": owner_id}).to_list(length=1000)
    health_info = calculate_project_health(docs)

    project["documents_count"] = len(docs)
    project["completed_documents_count"] = sum(1 for d in docs if d.get("overall_status") != "Processing")
    project["overall_compliance_score"] = health_info["overall_compliance"]
    project["health_score"] = health_info["score"]
    project["health_badge"] = health_info["badge"]
    project["health_breakdown"] = health_info["breakdown"]

    return {"success": True, "project": project}

# ----------------------------------------------------
# 4. UPDATE PROJECT
# ----------------------------------------------------
@router.put("/{project_id}")
async def update_project(
    project_id: str,
    update_data: ProjectUpdateInput,
    current_user: dict = Depends(get_current_user)
):
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    existing = await db.projects.find_one({"project_id": project_id, "owner_id": owner_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized access.")

    fields_to_update = {k: v for k, v in update_data.dict().items() if v is not None}
    if not fields_to_update:
        return {"success": True, "message": "No fields to update."}

    fields_to_update["updated_at"] = datetime.utcnow().isoformat()

    await db.projects.update_one(
        {"project_id": project_id, "owner_id": owner_id},
        {"$set": fields_to_update}
    )

    return {"success": True, "message": "Project updated successfully."}

# ----------------------------------------------------
# 5. DELETE PROJECT
# ----------------------------------------------------
@router.delete("/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    res = await db.projects.delete_one({"project_id": project_id, "owner_id": owner_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized access.")

    # Delete all documents and timelines for this project
    await db.evaluations.delete_many({"project_id": project_id, "user_id": owner_id})
    await db.project_timelines.delete_many({"project_id": project_id, "owner_id": owner_id})

    return {"success": True, "message": "Project and associated documents deleted."}

# ----------------------------------------------------
# 6. UPLOAD DOCUMENTS TO PROJECT WORKSPACE
# ----------------------------------------------------
@router.post("/{project_id}/documents")
async def upload_project_documents(
    project_id: str,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    # Verify project ownership
    project = await db.projects.find_one({"project_id": project_id, "owner_id": owner_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized access.")

    processed_results = []
    now_iso = datetime.utcnow().isoformat()

    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file.filename}' is not a PDF. Only PDF files are supported."
            )

        file_path = os.path.join(UPLOAD_DIR, file.filename)

        try:
            # Save file temporarily
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # 1. Text Extraction
            try:
                text = extract_text_from_pdf(file_path)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Text extraction failed for '{file.filename}': {str(e)}"
                )

            # 2. Document Classification
            try:
                doc_type, confidence = classify_text(text)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Classification failed for '{file.filename}': {str(e)}"
                )

            # 3. Information Extraction (Groq Llama 3.3 70B)
            try:
                extracted_data = extract_information(doc_type, text)
            except Exception as extractor_err:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Information extraction failed for '{file.filename}': {str(extractor_err)}"
                )

            # 4. Compliance Evaluation
            comp_res = evaluate_compliance(doc_type, extracted_data or {})

            # Document Record linked to project_id and owner_id
            eval_doc = {
                "project_id": project_id,
                "user_id": owner_id,
                "filename": file.filename,
                "document_type": doc_type,
                "confidence": float(confidence),
                "extracted_data": extracted_data or {},
                "compliance_score": comp_res.get("compliance_score"),
                "overall_status": comp_res.get("overall_status") or "Completed",
                "passed_checks": comp_res.get("passed_checks") or 0,
                "failed_checks": comp_res.get("failed_checks") or 0,
                "partial_checks": comp_res.get("partial_checks") or 0,
                "checks": comp_res.get("checks") or [],
                "recommendations": comp_res.get("recommendations") or [],
                "processing_stage": "Completed",
                "created_at": datetime.utcnow().isoformat()
            }

            res = await db.evaluations.insert_one(eval_doc)
            eval_doc["_id"] = str(res.inserted_id)

            # Insert Upload Timeline Event
            timeline_event = {
                "project_id": project_id,
                "owner_id": owner_id,
                "event_type": "DOCUMENT_UPLOADED",
                "title": f"Uploaded '{file.filename}'",
                "detail": f"Classified as '{doc_type}' with compliance score {comp_res.get('compliance_score')}/100.",
                "timestamp": datetime.utcnow().isoformat()
            }
            await db.project_timelines.insert_one(timeline_event)

            processed_results.append(eval_doc)

        finally:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass

    # Update project updated_at timestamp
    await db.projects.update_one(
        {"project_id": project_id, "owner_id": owner_id},
        {"$set": {"updated_at": now_iso}}
    )

    return {"success": True, "documents": processed_results}

# ----------------------------------------------------
# 7. GET PROJECT DOCUMENTS
# ----------------------------------------------------
@router.get("/{project_id}/documents")
async def get_project_documents(project_id: str, current_user: dict = Depends(get_current_user)):
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    docs_cursor = db.evaluations.find({"project_id": project_id, "user_id": owner_id}).sort("created_at", -1)
    docs = await docs_cursor.to_list(length=1000)

    for d in docs:
        d["_id"] = str(d["_id"])

    return {"success": True, "documents": docs}

# ----------------------------------------------------
# 8. DELETE DOCUMENT FROM PROJECT
# ----------------------------------------------------
@router.delete("/{project_id}/documents/{document_id}")
async def delete_project_document(project_id: str, document_id: str, current_user: dict = Depends(get_current_user)):
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    try:
        res = await db.evaluations.delete_one({"_id": ObjectId(document_id), "project_id": project_id, "user_id": owner_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Document not found or unauthorized.")
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=400, detail="Invalid Document ID format.")

    # Update project updated_at
    await db.projects.update_one(
        {"project_id": project_id, "owner_id": owner_id},
        {"$set": {"updated_at": datetime.utcnow().isoformat()}}
    )

    return {"success": True, "message": "Document deleted from project."}

# ----------------------------------------------------
# 9. TRIGGER PROJECT-LEVEL ANALYSIS ("ANALYZE PROJECT")
# ----------------------------------------------------
@router.post("/{project_id}/analyze")
async def analyze_project(project_id: str, current_user: dict = Depends(get_current_user)):
    """
    Analyzes ALL COMPLETED documents belonging to the specified project.
    Generates unified project intelligence and project health score.
    """
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    project = await db.projects.find_one({"project_id": project_id, "owner_id": owner_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized access.")

    docs = await db.evaluations.find({"project_id": project_id, "user_id": owner_id}).to_list(length=1000)

    if not docs:
        raise HTTPException(status_code=400, detail="No documents uploaded in this project to analyze.")

    now_iso = datetime.utcnow().isoformat()
    health_info = calculate_project_health(docs)

    # Aggregated Rule Statistics
    total_passed = sum(d.get("passed_checks") or 0 for d in docs)
    total_failed = sum(d.get("failed_checks") or 0 for d in docs)
    total_partial = sum(d.get("partial_checks") or 0 for d in docs)
    total_rules = total_passed + total_failed + total_partial

    # Generate Project Insights based strictly on actual documents
    doc_types = [d.get("document_type") for d in docs if d.get("document_type")]
    insights = []

    # Strongest area
    highest_doc = max(docs, key=lambda x: x.get("compliance_score") or 0)
    insights.append({
        "type": "positive",
        "category": highest_doc.get("document_type", "General"),
        "title": "Strongest Sustainability Category",
        "description": f"'{highest_doc.get('filename')}' achieved the highest compliance score of {highest_doc.get('compliance_score')}/100.",
        "action": "Maintain protocols established in this documentation."
    })

    # Weakest area
    lowest_doc = min(docs, key=lambda x: x.get("compliance_score") or 100)
    if lowest_doc != highest_doc:
        insights.append({
            "type": "warning",
            "category": lowest_doc.get("document_type", "General"),
            "title": "Weakest Compliance Area",
            "description": f"'{lowest_doc.get('filename')}' requires improvement with a compliance score of {lowest_doc.get('compliance_score')}/100.",
            "action": "Review corrective actions outlined in the report."
        })

    # Missing documentation check
    required_types = ["Energy Report", "Water Report", "Waste Report", "Audit Report", "Compliance Document"]
    missing_types = [t for t in required_types if t not in doc_types]
    if missing_types:
        insights.append({
            "type": "recommendation",
            "category": "Documentation Completeness",
            "title": "Missing Sustainability Documentation",
            "description": f"Project is missing: {', '.join(missing_types)}. Uploading these will increase the overall Health Score.",
            "action": "Upload missing report types."
        })

    # Save update to project
    await db.projects.update_one(
        {"project_id": project_id, "owner_id": owner_id},
        {"$set": {
            "last_analyzed_at": now_iso,
            "updated_at": now_iso,
            "overall_compliance_score": health_info["overall_compliance"],
            "health_score": health_info["score"],
            "health_badge": health_info["badge"],
            "total_rules": total_rules,
            "passed_rules": total_passed,
            "failed_rules": total_failed,
            "partial_rules": total_partial
        }}
    )

    # Insert Timeline Event
    timeline_event = {
        "project_id": project_id,
        "owner_id": owner_id,
        "event_type": "PROJECT_ANALYZED",
        "title": "Project Analysis Completed",
        "detail": f"Analyzed {len(docs)} documents. Overall Health Score: {health_info['score']}/100 ({health_info['badge']}).",
        "timestamp": now_iso
    }
    await db.project_timelines.insert_one(timeline_event)

    return {
        "success": True,
        "health_score": health_info["score"],
        "health_badge": health_info["badge"],
        "overall_compliance": health_info["overall_compliance"],
        "analyzed_documents_count": len(docs),
        "insights": insights
    }

# ----------------------------------------------------
# 10. GET PROJECT REAL ANALYTICS (NO DUMMY DATA!)
# ----------------------------------------------------
@router.get("/{project_id}/analytics")
async def get_project_analytics(project_id: str, current_user: dict = Depends(get_current_user)):
    """
    Returns REAL project analytics aggregated exclusively from the project's documents in MongoDB.
    No dummy data. If a report is not uploaded, values are returned as null/None or marked missing.
    """
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    project = await db.projects.find_one({"project_id": project_id, "owner_id": owner_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized access.")

    docs = await db.evaluations.find({"project_id": project_id, "user_id": owner_id}).to_list(length=1000)

    total_docs = len(docs)
    completed_docs = sum(1 for d in docs if d.get("overall_status") != "Processing")
    pending_docs = total_docs - completed_docs

    # Compliance Scores
    scores = [d.get("compliance_score") for d in docs if d.get("compliance_score") is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    highest_score = max(scores) if scores else 0
    lowest_score = min(scores) if scores else 0

    confidences = [d.get("confidence") for d in docs if d.get("confidence") is not None]
    avg_confidence = round(sum(confidences) / len(confidences), 4) if confidences else 0.0

    passed_rules = sum(d.get("passed_checks") or 0 for d in docs)
    failed_rules = sum(d.get("failed_checks") or 0 for d in docs)
    partial_rules = sum(d.get("partial_checks") or 0 for d in docs)
    total_rules = passed_rules + failed_rules + partial_rules

    # Document Type Distribution (Actual Counts)
    doc_type_counts = {
        "Energy Report": sum(1 for d in docs if d.get("document_type") == "Energy Report"),
        "Water Report": sum(1 for d in docs if d.get("document_type") == "Water Report"),
        "Waste Report": sum(1 for d in docs if d.get("document_type") == "Waste Report"),
        "Audit Report": sum(1 for d in docs if d.get("document_type") == "Audit Report"),
        "Compliance Document": sum(1 for d in docs if d.get("document_type") == "Compliance Document")
    }

    # Compliance Bracket Distribution
    compliance_brackets = {
        "Excellent (85-100)": sum(1 for s in scores if s >= 85),
        "Compliant (70-84)": sum(1 for s in scores if 70 <= s < 85),
        "Partially Compliant (50-69)": sum(1 for s in scores if 50 <= s < 70),
        "Non-Compliant (<50)": sum(1 for s in scores if s < 50)
    }

    # Sustainability Metrics Extracted across project documents (Real Data Only!)
    extracted_sustainability = {
        "energy": None,
        "water": None,
        "waste": None,
        "audit": None,
        "compliance": None
    }

    for d in docs:
        dt = d.get("document_type")
        data = d.get("extracted_data") or {}
        if dt == "Energy Report" and data:
            extracted_sustainability["energy"] = {
                "filename": d.get("filename"),
                "annual_energy_consumption": data.get("annual_energy_consumption"),
                "renewable_energy_percentage": data.get("renewable_energy_percentage"),
                "renewable_energy_generated": data.get("renewable_energy_generated"),
                "carbon_emissions": data.get("carbon_emissions"),
                "electricity_consumption": data.get("electricity_consumption"),
                "fuel_consumption": data.get("fuel_consumption"),
                "building_area": data.get("building_area"),
                "energy_intensity": data.get("energy_intensity")
            }
        elif dt == "Water Report" and data:
            extracted_sustainability["water"] = {
                "filename": d.get("filename"),
                "total_water_consumption": data.get("total_water_consumption"),
                "fresh_water_usage": data.get("fresh_water_usage"),
                "recycled_water_usage": data.get("recycled_water_usage"),
                "water_recycling_percentage": data.get("water_recycling_percentage"),
                "rainwater_harvesting_capacity": data.get("rainwater_harvesting_capacity"),
                "water_savings": data.get("water_savings")
            }
        elif dt == "Waste Report" and data:
            extracted_sustainability["waste"] = {
                "filename": d.get("filename"),
                "total_waste_generated": data.get("total_waste_generated"),
                "waste_recycled": data.get("waste_recycled"),
                "recycling_percentage": data.get("recycling_percentage"),
                "hazardous_waste": data.get("hazardous_waste"),
                "non_hazardous_waste": data.get("non_hazardous_waste"),
                "waste_diverted_from_landfill": data.get("waste_diverted_from_landfill")
            }

    health_info = calculate_project_health(docs)

    return {
        "success": True,
        "kpis": {
            "total_documents": total_docs,
            "completed_documents": completed_docs,
            "pending_documents": pending_docs,
            "overall_compliance_score": health_info["overall_compliance"],
            "average_compliance_score": avg_score,
            "highest_score": highest_score,
            "lowest_score": lowest_score,
            "average_confidence": avg_confidence,
            "total_compliance_rules": total_rules,
            "passed_rules": passed_rules,
            "failed_rules": failed_rules,
            "partial_rules": partial_rules
        },
        "document_distribution": doc_type_counts,
        "compliance_distribution": compliance_brackets,
        "health": health_info,
        "sustainability_metrics": extracted_sustainability
    }

# ----------------------------------------------------
# 11. GET PROJECT TIMELINE
# ----------------------------------------------------
@router.get("/{project_id}/timeline")
async def get_project_timeline(project_id: str, current_user: dict = Depends(get_current_user)):
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    events_cursor = db.project_timelines.find({"project_id": project_id, "owner_id": owner_id}).sort("timestamp", -1)
    events = await events_cursor.to_list(length=1000)

    for e in events:
        e["_id"] = str(e["_id"])

    return {"success": True, "timeline": events}

# ----------------------------------------------------
# 12. GET PROJECT AI INSIGHTS
# ----------------------------------------------------
@router.get("/{project_id}/insights")
async def get_project_insights(project_id: str, current_user: dict = Depends(get_current_user)):
    verify_db_connected()
    db = get_database()
    owner_id = str(current_user["_id"])

    docs = await db.evaluations.find({"project_id": project_id, "user_id": owner_id}).to_list(length=1000)

    if not docs:
        return {"success": True, "insights": []}

    insights = []

    # 1. Document Coverage Insight
    doc_types = set(d.get("document_type") for d in docs if d.get("document_type"))
    all_required = {"Energy Report", "Water Report", "Waste Report", "Audit Report", "Compliance Document"}
    missing = all_required - doc_types

    if not missing:
        insights.append({
            "id": "ins_complete",
            "type": "positive",
            "category": "Completeness",
            "title": "Comprehensive Documentation Achieved",
            "description": "All 5 core IGBC sustainability report types have been uploaded and evaluated.",
            "impact": "High Compliance Readiness",
            "action": "Proceed with official IGBC certification submission package."
        })
    else:
        insights.append({
            "id": "ins_missing",
            "type": "warning",
            "category": "Completeness",
            "title": f"Missing {len(missing)} Report Type(s)",
            "description": f"Project lacks: {', '.join(missing)}.",
            "impact": "Incomplete Rating",
            "action": f"Upload remaining required files to achieve a complete IGBC audit score."
        })

    # 2. Rule Compliance Failures
    failing_docs = [d for d in docs if (d.get("failed_checks") or 0) > 0]
    if failing_docs:
        most_failed = max(failing_docs, key=lambda x: x.get("failed_checks") or 0)
        insights.append({
            "id": "ins_failure",
            "type": "negative",
            "category": most_failed.get("document_type", "Compliance"),
            "title": "Compliance Vulnerability Identified",
            "description": f"'{most_failed.get('filename')}' triggered {most_failed.get('failed_checks')} failed rule check(s).",
            "impact": "Action Required",
            "action": "Open document details to review recommended corrective measures."
        })

    # 3. Recommendations list
    all_recs = []
    for d in docs:
        all_recs.extend(d.get("recommendations") or [])

    if all_recs:
        insights.append({
            "id": "ins_recs",
            "type": "trend",
            "category": "AI Recommendations",
            "title": f"Aggregated {len(all_recs)} Actionable AI Recommendations",
            "description": f"Key recommendation: {all_recs[0]}",
            "impact": "Optimization Potential",
            "action": "Implement priority recommendations to boost sustainability score."
        })

    return {"success": True, "insights": insights}
