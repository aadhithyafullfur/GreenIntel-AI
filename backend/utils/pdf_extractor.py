import fitz  # PyMuPDF
from typing import List, Dict, Any, Tuple

def extract_pdf_pages(file_path: str) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Extracts all text from a PDF file using PyMuPDF (fitz).
    Returns a tuple of (full_text, pages_list) where pages_list is:
    [{"page": 1, "text": "..."}, ...]
    """
    full_text = ""
    pages = []
    try:
        doc = fitz.open(file_path)
        for i, page in enumerate(doc):
            p_text = page.get_text() or ""
            full_text += p_text + "\n"
            pages.append({
                "page": i + 1,
                "text": p_text.strip()
            })
        doc.close()
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    return full_text.strip(), pages

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts all text from a PDF file using PyMuPDF (fitz).
    """
    full_text, _ = extract_pdf_pages(file_path)
    return full_text

