import os
import json
import logging
from typing import Dict, Any, Optional
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("information_extractor")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize client
client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {e}")
else:
    logger.warning("GROQ_API_KEY is not set in environment variables.")

# Model name as requested
MODEL_NAME = "llama-3.3-70b-versatile"

# Extraction schemas for each document type
SCHEMAS: Dict[str, Dict[str, str]] = {
    "Energy Report": {
        "annual_energy_consumption": "The annual energy consumption of the building/facility (e.g., '50000 kWh', '200 MWh').",
        "renewable_energy_percentage": "The percentage of energy obtained from renewable sources (e.g., '25%').",
        "renewable_energy_generated": "The amount of renewable energy generated onsite (e.g., '12500 kWh').",
        "carbon_emissions": "The annual greenhouse gas or carbon emissions (e.g., '12 tons').",
        "electricity_consumption": "The annual electricity consumption (e.g., '45000 kWh').",
        "fuel_consumption": "The fuel consumed (diesel, gas, etc.) annually (e.g., '500 liters').",
        "building_area": "The total built-up area of the building (e.g., '10000 sq ft', '929 sq m').",
        "energy_intensity": "The energy consumption per unit area per year (e.g., '50 kWh/sq m/year')."
    },
    "Water Report": {
        "total_water_consumption": "The total annual or monthly water consumption (e.g., '1000 kL', '50000 liters').",
        "fresh_water_usage": "The quantity of fresh or municipal water used (e.g., '800 kL').",
        "recycled_water_usage": "The quantity of recycled or treated water used (e.g., '200 kL').",
        "water_recycling_percentage": "The percentage of total water that is recycled/reused (e.g., '40%').",
        "rainwater_harvesting_capacity": "The capacity of rainwater harvesting tanks or systems (e.g., '20000 liters').",
        "water_savings": "The estimated or actual water saved through conservation measures (e.g., '150 kL')."
    },
    "Waste Report": {
        "total_waste_generated": "The total quantity of waste generated (e.g., '5 tons', '2500 kg').",
        "waste_recycled": "The quantity of waste sent for recycling (e.g., '3.5 tons').",
        "recycling_percentage": "The percentage of waste recycled out of total waste (e.g., '70%').",
        "hazardous_waste": "The amount of hazardous waste generated (e.g., '100 kg').",
        "non_hazardous_waste": "The amount of non-hazardous waste generated (e.g., '4.9 tons').",
        "waste_diverted_from_landfill": "The amount or percentage of waste diverted from landfills (e.g., '80%')."
    },
    "Compliance Document": {
        "regulation_name": "The name of the regulation, standard, code, or permit being complied with (e.g., 'ECBC 2017', 'EIA Clearance').",
        "compliance_status": "The compliance status (e.g., 'Compliant', 'Non-Compliant', 'Conditional').",
        "certificate_number": "The number of the compliance certificate, permit, or NOC (e.g., 'CERT-12345').",
        "issue_date": "The date when the certificate or permit was issued (e.g., '2025-01-15').",
        "expiry_date": "The date when the certificate or permit expires (e.g., '2030-01-14').",
        "authority_name": "The issuing authority, agency, or municipal body (e.g., 'State Pollution Control Board')."
    },
    "Audit Report": {
        "audit_date": "The date when the audit was conducted (e.g., '2025-03-22').",
        "auditor_name": "The name of the auditor, firm, or agency that conducted the audit.",
        "audit_score": "The score, rating, or level achieved in the audit (e.g., '85/100', 'Gold', 'A+').",
        "findings": "Key findings or issues identified during the audit.",
        "recommendations": "Key recommendations or corrective actions suggested by the auditor.",
        "risk_level": "The risk level assessed (e.g., 'Low', 'Medium', 'High')."
    }
}

def get_default_extracted_data(document_type: str) -> Dict[str, Any]:
    """
    Returns a dictionary for the given document type with all schema fields set to None.
    """
    schema = SCHEMAS.get(document_type, {})
    if not schema:
        # Fallback empty structure
        return {}
    return {field: None for field in schema.keys()}

def parse_json_response(raw_response: str) -> Dict[str, Any]:
    """
    Extracts and parses JSON from the raw LLM response.
    Handles potential markdown wrappers and JSON structure issues.
    """
    cleaned = raw_response.strip()
    
    # Strip markdown code block wrapper if present (e.g., ```json ... ```)
    if cleaned.startswith("```"):
        # Remove starting ```json or ```
        first_nl = cleaned.find("\n")
        if first_nl != -1:
            cleaned = cleaned[first_nl:].strip()
        else:
            cleaned = cleaned[3:].strip()
            
        # Remove ending ```
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3].strip()
            
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"JSON decoding failed: {e}. Raw content was: {raw_response}")
        raise ValueError(f"Invalid JSON returned from model: {str(e)}")

def normalize_extracted_data(document_type: str, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensures that the output contains exactly the schema fields for the document type.
    Fills in missing fields with None, maps empty/invalid placeholders to None.
    """
    schema = SCHEMAS.get(document_type, {})
    if not schema:
        return parsed_data
        
    normalized = {}
    placeholders = {"na", "n/a", "none", "null", "undefined", "not available", "not mentioned", "not specified", "<not mentioned>", ""}
    
    for field in schema.keys():
        val = parsed_data.get(field, None)
        
        # Check if the value is a placeholder representing a missing value
        if val is not None:
            val_str = str(val).strip().lower()
            if val_str in placeholders:
                val = None
                
        normalized[field] = val
        
    return normalized

def extract_information(document_type: str, text: str) -> Dict[str, Any]:
    """
    Main extraction function. Calls Groq API to extract fields dynamically
    based on the document type, parses the JSON response, handles missing values,
    and returns a structured dict conforming to the schema.
    """
    logger.info(f"Starting information extraction for document type: '{document_type}'")
    
    # Check if document type is supported
    if document_type not in SCHEMAS:
        logger.warning(f"Document type '{document_type}' does not have a defined extraction schema. Returning empty dict.")
        return {}
        
    # Check client availability
    if not client:
        logger.error("Groq client is not initialized due to missing GROQ_API_KEY.")
        raise ValueError("Groq API key is missing. Please set the GROQ_API_KEY environment variable.")
        
    # Truncate text to fit context comfortably (e.g. first 50,000 characters)
    # Llama 3.3 70B has 128k context window, but truncating is faster and sufficient.
    truncated_text = text[:50000]
    
    # Generate schema description for the prompt
    schema = SCHEMAS[document_type]
    schema_json_format = json.dumps({field: f"<{desc}>" for field, desc in schema.items()}, indent=2)
    
    system_prompt = (
        "You are an expert green building compliance engine. Your task is to extract structural metrics "
        "from the provided green building report or document. You must return a valid JSON object ONLY.\n\n"
        "Rules:\n"
        "1. Do not include any introductory or concluding conversational text, explanations, or analysis.\n"
        "2. Do not wrap the JSON output in markdown blocks (e.g., do not use ```json ... ```).\n"
        "3. Use ONLY the keys defined in the requested schema.\n"
        "4. Extract actual, exact values including units where possible (e.g., '50000 kWh' or '25%').\n"
        "5. If a field's value is not mentioned or cannot be inferred from the text, set its value to null.\n"
        "6. Do not fabricate or guess any values."
    )
    
    user_prompt = (
        f"Document Type: {document_type}\n\n"
        f"Schema to extract:\n{schema_json_format}\n\n"
        f"Document Text:\n{truncated_text}\n\n"
        f"Extract the requested fields. Concat findings/recommendations into clean sentences if scattered. "
        f"Return the response in valid, flat JSON."
    )
    
    try:
        # Call Groq API with JSON mode enabled
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.0,
            max_tokens=2048
        )
        
        raw_content = response.choices[0].message.content
        logger.debug(f"Raw response from Groq: {raw_content}")
        
        # Parse the JSON response
        parsed_data = parse_json_response(raw_content)
        
        # Normalize and fill missing values with None (null)
        extracted_data = normalize_extracted_data(document_type, parsed_data)
        
        logger.info(f"Successfully extracted {len(extracted_data)} fields for document type: '{document_type}'")
        return extracted_data
        
    except Exception as e:
        logger.error(f"Error during information extraction using Groq: {str(e)}", exc_info=True)
        # Raise detailed exception so route can handle it
        raise RuntimeError(f"Information extraction failed: {str(e)}")
