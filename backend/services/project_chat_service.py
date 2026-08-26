import os
import json
import logging
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("greenintel.project_chat")
logger.setLevel(logging.INFO)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PRIMARY_MODEL = os.getenv("GROQ_MODEL", "groq/compound-mini")

# Candidate models for fallback
FALLBACK_MODELS = [
    PRIMARY_MODEL,
    "groq/compound-mini",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b"
]

print(f"Groq API key configured: {bool(GROQ_API_KEY)}")
print(f"Groq Model configured: {PRIMARY_MODEL}")
logger.info(f"Groq API key configured: {bool(GROQ_API_KEY)}")
logger.info(f"Groq Model configured: {PRIMARY_MODEL}")

client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Groq client for project chat: {e}")
else:
    logger.warning("GROQ_API_KEY is not set for project chat service.")


def search_relevant_pages(documents: List[Dict[str, Any]], query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieves the most relevant document page chunks matching query terms.
    Returns page snippets with source document filename, document type, and page number.
    """
    query_words = [w.lower() for w in re.findall(r'\w+', query) if len(w) > 2]
    if not query_words:
        return []

    scored_chunks = []
    for doc in documents:
        filename = doc.get("filename", "Document")
        doc_type = doc.get("document_type", "Report")
        pages = doc.get("pages", [])

        if pages and isinstance(pages, list):
            for p in pages:
                p_num = p.get("page")
                p_text = p.get("text", "")
                if not p_text:
                    continue
                p_text_lower = p_text.lower()
                
                score = sum(1 for w in query_words if w in p_text_lower)
                if score > 0:
                    scored_chunks.append({
                        "filename": filename,
                        "document_type": doc_type,
                        "page": p_num,
                        "score": score,
                        "snippet": p_text[:1000]
                    })
        elif doc.get("raw_text"):
            raw_text = doc.get("raw_text", "")
            raw_lower = raw_text.lower()
            score = sum(1 for w in query_words if w in raw_lower)
            if score > 0:
                scored_chunks.append({
                    "filename": filename,
                    "document_type": doc_type,
                    "page": None,
                    "score": score,
                    "snippet": raw_text[:1000]
                })

    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:top_k]


def build_project_context(project: Dict[str, Any], documents: List[Dict[str, Any]], relevant_snippets: List[Dict[str, Any]]) -> str:
    """
    Builds a grounded text context describing the current project,
    its uploaded documents, extracted metrics, compliance checks, issues, recommendations, and text snippets.
    """
    proj_name = project.get("name", "Unnamed Project")
    proj_type = project.get("project_type", "N/A")
    location = project.get("location") or project.get("city") or "N/A"
    building_area = project.get("building_area", "N/A")
    health_score = project.get("health_score", "N/A")
    health_badge = project.get("health_badge", "N/A")
    overall_comp = project.get("overall_compliance_score", "N/A")

    context_lines = []
    context_lines.append(f"PROJECT OVERVIEW:")
    context_lines.append(f"- Project ID: {project.get('project_id')}")
    context_lines.append(f"- Project Name: {proj_name}")
    context_lines.append(f"- Project Type: {proj_type}")
    context_lines.append(f"- Location: {location}")
    context_lines.append(f"- Building Area: {building_area}")
    context_lines.append(f"- Health Score: {health_score}/100 ({health_badge})")
    context_lines.append(f"- Overall Compliance Score: {overall_comp}%")
    context_lines.append(f"- Total Uploaded Documents: {len(documents)}")
    context_lines.append("")

    if not documents:
        context_lines.append("NO DOCUMENTS HAVE BEEN UPLOADED TO THIS PROJECT YET.")
        return "\n".join(context_lines)

    context_lines.append("UPLOADED PROJECT DOCUMENTS & DETAILED ANALYSIS:")

    for idx, doc in enumerate(documents, start=1):
        fname = doc.get("filename", f"Doc_{idx}")
        dtype = doc.get("document_type", "Unknown")
        score = doc.get("compliance_score", "N/A")
        status = doc.get("overall_status", "Completed")
        confidence = doc.get("confidence", 1.0)
        passed = doc.get("passed_checks", 0)
        failed = doc.get("failed_checks", 0)
        partial = doc.get("partial_checks", 0)

        context_lines.append(f"\n--- DOCUMENT #{idx}: {fname} ---")
        context_lines.append(f"  Document Type: {dtype} (Classification Confidence: {int(confidence*100) if isinstance(confidence, float) else confidence}%)")
        context_lines.append(f"  Compliance Score: {score}%")
        context_lines.append(f"  Status: {status}")
        context_lines.append(f"  Checks: {passed} Passed, {partial} Partial, {failed} Failed")

        # Extracted Data Metrics
        ext_data = doc.get("extracted_data") or {}
        non_null_data = {k: v for k, v in ext_data.items() if v is not None and str(v).strip() != ""}
        if non_null_data:
            context_lines.append(f"  Extracted Metrics & Data:")
            for k, v in non_null_data.items():
                k_clean = k.replace("_", " ").title()
                context_lines.append(f"    - {k_clean}: {v}")

        # Issues
        doc_issues = doc.get("issues") or []
        if doc_issues:
            context_lines.append(f"  Identified Issues ({len(doc_issues)}):")
            for issue in doc_issues:
                sev = issue.get("severity", "Medium")
                desc = issue.get("description") or issue.get("message") or issue.get("requirement") or "Issue identified"
                req = issue.get("requirement", "")
                check_name = issue.get("check_name", "Check")
                context_lines.append(f"    - [{sev.upper()}] {check_name}: {desc} (Req: {req})")

        # Recommendations
        recs = doc.get("recommendations") or []
        if recs:
            context_lines.append(f"  Recommendations:")
            for r in recs:
                context_lines.append(f"    - {r}")

        # Checks breakdown
        checks = doc.get("checks") or []
        failed_or_partial_checks = [c for c in checks if c.get("status") in ["Failed", "Partial"]]
        if failed_or_partial_checks:
            context_lines.append(f"  Failed / Partial Check Rules:")
            for fc in failed_or_partial_checks:
                c_status = fc.get("status")
                c_name = fc.get("name") or fc.get("rule_name") or fc.get("parameter") or "Rule"
                c_val = fc.get("extracted_value") or fc.get("value") or "N/A"
                c_req = fc.get("required_value") or fc.get("target") or "N/A"
                context_lines.append(f"    - [{c_status.upper()}] {c_name} | Value: {c_val} | Target/Req: {c_req}")

    if relevant_snippets:
        context_lines.append("\nRELEVANT DOCUMENT TEXT SNIPPETS (RAG EVIDENCE):")
        for snip in relevant_snippets:
            p_str = f"Page {snip['page']}" if snip.get("page") else "Full Doc"
            context_lines.append(f"--- Source: {snip['filename']} ({snip['document_type']}) | {p_str} ---")
            context_lines.append(snip["snippet"])
            context_lines.append("---")

    return "\n".join(context_lines)


def strip_thinking_tags(text: str) -> str:
    """Strips <think>...</think> tags if included by reasoning LLM models."""
    cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    return cleaned.strip()


async def generate_project_chat_response(
    project: Dict[str, Any],
    documents: List[Dict[str, Any]],
    user_message: str,
    chat_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Generates a grounded, document-aware assistant response for the specific project.
    Uses fallback model iteration if primary model encounters error.
    """
    if not client:
        return {
            "success": False,
            "error": "GROQ_API_KEY_MISSING",
            "answer": "The AI Chatbot service is temporarily unavailable because the GROQ_API_KEY environment variable is missing.",
            "sources": [],
            "documents": [d.get("filename") for d in documents],
            "metadata": {"error": "Missing GROQ_API_KEY"}
        }

    # Safe logging of project metadata
    p_id = project.get("project_id")
    relevant_snippets = search_relevant_pages(documents, user_message, top_k=4)
    project_context = build_project_context(project, documents, relevant_snippets)
    
    print(f"Project: {p_id} | Documents: {len(documents)} | RAG Snippets: {len(relevant_snippets)} | Context Length: {len(project_context)}")

    system_prompt = (
        "You are the official GreenIntel AI Project Assistant, a senior green building document analysis & compliance intelligence expert.\n"
        "Your role is to assist the user by answering questions specifically about their current uploaded project documents and processed evaluation data.\n\n"
        "CRITICAL RULES & GROUNDING CONSTRAINTS:\n"
        "1. Answer ONLY using the information present in the PROJECT OVERVIEW, UPLOADED PROJECT DOCUMENTS & DETAILED ANALYSIS, and RELEVANT DOCUMENT TEXT SNIPPETS provided below.\n"
        "2. DO NOT invent, fabricate, or guess any scores, metrics, document names, issues, severity levels, dates, compliance results, or recommendations.\n"
        "3. If the user's question cannot be answered using the provided project data or uploaded documents, respond explicitly with:\n"
        "   \"I don't have enough information from the uploaded project documents to answer that.\"\n"
        "4. DO NOT mix information from any external projects or general assumptions.\n"
        "5. Distinguish clearly between FACT (exact extracted metrics, scores, checks) and RECOMMENDATION (suggested fixes).\n"
        "6. Provide structured, clean Markdown formatting:\n"
        "   - Use bold headers, bullet lists, pass/fail indicators (✓, ⚠, ✕), and Markdown tables for comparisons or project summaries.\n"
        "   - For document status summaries, show:\n"
        "     ✓ Document Name — Score% — Compliant\n"
        "     ⚠ Document Name — Score% — Partial\n"
        "     ✕ Document Name — Score% — Non-Compliant\n"
        "   - For issue prioritization questions (\"What should I fix first?\"), group issues by priority level (PRIORITY 1: Critical/High, PRIORITY 2: Medium, etc.) showing Document Name, Severity, Issue Description, and Recommended Action.\n"
        "   - For comparison questions, build a clean Markdown table comparing metrics, scores, issues, and status.\n"
        "   - Always cite the exact source document filename (and Page number if available) when presenting document evidence.\n"
        "     Example format:\n"
        "     Source: Energy_Report.pdf\n"
        "     Section: Energy Performance\n"
        "     Page: 14 (only include page if page number is present in context snippet)\n\n"
        f"CURRENT PROJECT CONTEXT:\n"
        f"{project_context}"
    )

    messages = [{"role": "system", "content": system_prompt}]

    if chat_history:
        for msg in chat_history[-6:]:
            role = "user" if msg.get("role") in ["user", "human"] else "assistant"
            content = msg.get("content", "")
            if content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_message})

    # Try models with fallback logic
    last_err = None
    successful_answer = None
    used_model = None

    # Deduplicate fallback models while preserving order
    models_to_try = []
    for m in FALLBACK_MODELS:
        if m not in models_to_try:
            models_to_try.append(m)

    for model_candidate in models_to_try:
        try:
            logger.info(f"Attempting Groq completion using model: '{model_candidate}'...")
            completion = client.chat.completions.create(
                model=model_candidate,
                messages=messages,
                temperature=0.2,
                max_tokens=2048
            )
            raw_content = completion.choices[0].message.content.strip()
            successful_answer = strip_thinking_tags(raw_content)
            used_model = model_candidate
            logger.info(f"Groq completion succeeded using model: '{model_candidate}'")
            break
        except Exception as ex:
            last_err = str(ex)
            logger.warning(f"Groq completion failed with model '{model_candidate}': {ex}. Trying fallback...")

    if not successful_answer:
        logger.error(f"All Groq models failed. Last error: {last_err}")
        return {
            "success": False,
            "error": "AI_PROVIDER_ERROR",
            "message": f"AI service error: {last_err or 'Failed to generate answer from Groq.'}",
            "answer": f"Unable to analyze the project right now: {last_err or 'AI Provider error'}",
            "sources": [],
            "documents": [d.get("filename") for d in documents],
            "metadata": {"error": last_err}
        }

    # Build active sources list
    sources = []
    for snip in relevant_snippets:
        sources.append({
            "filename": snip["filename"],
            "document_type": snip["document_type"],
            "page": snip.get("page"),
            "snippet": snip["snippet"][:250] + "..." if len(snip["snippet"]) > 250 else snip["snippet"]
        })

    # Available reference documents
    doc_refs = []
    for d in documents:
        doc_refs.append({
            "_id": str(d.get("_id", "")),
            "filename": d.get("filename", ""),
            "document_type": d.get("document_type", ""),
            "compliance_score": d.get("compliance_score"),
            "overall_status": d.get("overall_status")
        })

    return {
        "success": True,
        "answer": successful_answer,
        "sources": sources,
        "documents": doc_refs,
        "metadata": {
            "project_id": project.get("project_id"),
            "total_documents": len(documents),
            "model_used": used_model,
            "timestamp": datetime.utcnow().isoformat()
        }
    }
