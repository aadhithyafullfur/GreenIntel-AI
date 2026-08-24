import re
import logging
from typing import Dict, Any, List, Tuple, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("compliance_checker")

def parse_numeric_value(val: Any) -> Optional[float]:
    """
    Safely extract the first numeric value from a string (e.g., '25%', '85/100', '12 tons').
    Returns None if no number is found.
    """
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
        
    val_str = str(val).strip()
    match = re.search(r"(\d+(?:\.\d+)?)", val_str)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    return None

def interpolate_score(value: float, min_val: float, max_val: float, min_score: float, max_score: float) -> float:
    if max_val == min_val:
        return min_score
    factor = (value - min_val) / (max_val - min_val)
    score = min_score + factor * (max_score - min_score)
    return max(min(min_score, max_score), min(max(min_score, max_score), score))

def find_evidence_in_pages(pages: Optional[List[Dict[str, Any]]], keywords: List[str], val_str: Optional[str] = None) -> Tuple[Optional[int], str]:
    """
    Locates exact page number and text evidence from PDF page list.
    """
    if not pages:
        return None, "Page information unavailable"

    if val_str and len(str(val_str).strip()) > 1:
        v = str(val_str).strip().lower()
        for p in pages:
            text = p.get("text", "")
            if v in text.lower():
                for line in text.split("\n"):
                    if v in line.lower():
                        return p["page"], line.strip()
                return p["page"], text[:180].replace("\n", " ").strip()

    for p in pages:
        text = p.get("text", "")
        for kw in keywords:
            if kw.lower() in text.lower():
                for line in text.split("\n"):
                    if kw.lower() in line.lower():
                        return p["page"], line.strip()
                return p["page"], text[:180].replace("\n", " ").strip()

    return None, "Page information unavailable"

def evaluate_energy_report(extracted_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    checks = []
    recommendations = []
    section = "Energy Performance"
    
    # Check 1: Renewable Energy Percentage
    rep_val = extracted_data.get("renewable_energy_percentage")
    rep_num = parse_numeric_value(rep_val)
    requirement = "≥ 30% Renewable Energy Share"
    
    if rep_num is None:
        checks.append({
            "metric": "Renewable Energy Percentage",
            "key": "renewable_energy_percentage",
            "value": rep_val or "Not Provided",
            "requirement": requirement,
            "status": "Non-Compliant",
            "score": 30,
            "reason": "Renewable energy percentage is missing or could not be parsed.",
            "section": section,
            "keywords": ["renewable", "solar", "percentage", "clean energy"]
        })
        recommendations.append("Ensure renewable energy percentage is explicitly specified in the Energy Report.")
        recommendations.append("Increase renewable energy generation through solar installations.")
    else:
        if rep_num < 10.0:
            status = "Non-Compliant"
            score = interpolate_score(rep_num, 0.0, 10.0, 30.0, 59.0)
            reason = f"Renewable energy percentage ({rep_val}) is below the minimum 10% baseline threshold."
            recommendations.append("Increase renewable energy generation through solar rooftop systems.")
        elif rep_num < 20.0:
            status = "Partially Compliant"
            score = interpolate_score(rep_num, 10.0, 20.0, 60.0, 79.0)
            reason = f"Renewable energy percentage ({rep_val}) is in the 10-20% range. Baseline met but needs upgrade."
            recommendations.append("Increase renewable energy generation through solar rooftop systems.")
            recommendations.append("Install energy-efficient heat pumps and LED fixtures to reduce overall base load.")
        elif rep_num <= 30.0:
            status = "Compliant"
            score = interpolate_score(rep_num, 20.0, 30.0, 80.0, 89.0)
            reason = f"Renewable energy percentage ({rep_val}) meets the standard compliance target (20-30%)."
            recommendations.append("Consider upgrading renewable energy integration to exceed 30% for an Excellent rating.")
        else:
            status = "Excellent"
            score = interpolate_score(rep_num, 30.0, 100.0, 90.0, 100.0)
            reason = f"Renewable energy percentage ({rep_val}) exceeds the 30% target for exemplary performance."
            recommendations.append("Maintain excellent renewable energy share. Evaluate energy storage options to maximize utility.")
            
        checks.append({
            "metric": "Renewable Energy Percentage",
            "key": "renewable_energy_percentage",
            "value": str(rep_val),
            "requirement": requirement,
            "status": status,
            "score": round(score),
            "reason": reason,
            "section": section,
            "keywords": ["renewable", "solar", "%", "clean energy"]
        })

    # Check 2: Energy Intensity Check
    intensity_val = extracted_data.get("energy_intensity")
    intensity_num = parse_numeric_value(intensity_val)
    requirement_epi = "≤ 90 kWh/sq.m/year EPI"
    if intensity_num is not None:
        if intensity_num < 60.0:
            status = "Excellent"
            score = 95
            reason = f"Energy intensity ({intensity_val}) indicates highly efficient operations (< 60 kWh/sq m/year)."
        elif intensity_num < 90.0:
            status = "Compliant"
            score = 85
            reason = f"Energy intensity ({intensity_val}) meets standard green building benchmarks (< 90 kWh/sq m/year)."
        elif intensity_num < 140.0:
            status = "Partially Compliant"
            score = 70
            reason = f"Energy intensity ({intensity_val}) is elevated (> 90 kWh/sq m/year). Plan energy conservation measures."
            recommendations.append("Optimize HVAC operations and thermal insulation to lower the Energy Performance Index (EPI).")
        else:
            status = "Non-Compliant"
            score = 45
            reason = f"Energy intensity ({intensity_val}) exceeds acceptable building standards."
            recommendations.append("Conduct a deep-dive energy audit to identify waste sources and implement automated building controls (BMS).")
            
        checks.append({
            "metric": "Energy Intensity",
            "key": "energy_intensity",
            "value": str(intensity_val),
            "requirement": requirement_epi,
            "status": status,
            "score": score,
            "reason": reason,
            "section": section,
            "keywords": ["intensity", "kwh/sq", "epi", "consumption"]
        })

    # Check 3: Carbon Footprint Disclosure Check
    carbon_val = extracted_data.get("carbon_emissions")
    req_carbon = "Complete Carbon Footprint Disclosure"
    if carbon_val:
        checks.append({
            "metric": "Carbon Emissions Disclosure",
            "key": "carbon_emissions",
            "value": str(carbon_val),
            "requirement": req_carbon,
            "status": "Compliant",
            "score": 90,
            "reason": f"Carbon emissions are tracked and reported at {carbon_val}.",
            "section": section,
            "keywords": ["carbon", "emissions", "tco2", "ghg"]
        })
    else:
        checks.append({
            "metric": "Carbon Emissions Disclosure",
            "key": "carbon_emissions",
            "value": "Not Disclosed",
            "requirement": req_carbon,
            "status": "Partially Compliant",
            "score": 65,
            "reason": "Carbon emissions data is not explicitly declared.",
            "section": section,
            "keywords": ["carbon", "emissions", "ghg"]
        })
        recommendations.append("Establish greenhouse gas accounting guidelines to track Scope 1 and Scope 2 emissions.")
        
    # Check 4: Data Completeness Check
    core_fields = ["annual_energy_consumption", "building_area"]
    missing_fields = [f for f in core_fields if not extracted_data.get(f)]
    req_comp = "Complete Base Parameter Documentation"
    if not missing_fields:
        checks.append({
            "metric": "Core Energy Parameters",
            "key": "data_completeness",
            "value": "Complete",
            "requirement": req_comp,
            "status": "Compliant",
            "score": 100,
            "reason": "All critical energy performance parameters are fully documented.",
            "section": section,
            "keywords": ["annual", "area", "sq.m", "kwh"]
        })
    else:
        checks.append({
            "metric": "Core Energy Parameters",
            "key": "data_completeness",
            "value": f"Missing {len(missing_fields)} core field(s)",
            "requirement": req_comp,
            "status": "Partially Compliant",
            "score": 70,
            "reason": f"Key parameter(s) {', '.join(missing_fields)} are missing.",
            "section": section,
            "keywords": ["consumption", "building area"]
        })
        recommendations.append("Provide building area and total consumption figures to compute accurate efficiency baselines.")

    return checks, recommendations

def evaluate_water_report(extracted_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    checks = []
    recommendations = []
    section = "Water Stewardship"
    
    # Check 1: Water Recycling Percentage
    wrp_val = extracted_data.get("water_recycling_percentage")
    wrp_num = parse_numeric_value(wrp_val)
    req_wrp = "≥ 40% Recycled Water Reuse"
    
    if wrp_num is None:
        checks.append({
            "metric": "Water Recycling Percentage",
            "key": "water_recycling_percentage",
            "value": wrp_val or "Not Provided",
            "requirement": req_wrp,
            "status": "Non-Compliant",
            "score": 30,
            "reason": "Water recycling percentage is missing or could not be parsed.",
            "section": section,
            "keywords": ["recycling", "reused", "stp", "greywater"]
        })
        recommendations.append("Provide water recycling/re-use metrics to satisfy municipal and IGBC regulations.")
        recommendations.append("Implement local greywater recycling and optimize water consumption.")
    else:
        if wrp_num < 20.0:
            status = "Non-Compliant"
            score = interpolate_score(wrp_num, 0.0, 20.0, 30.0, 59.0)
            reason = f"Water recycling percentage ({wrp_val}) is below the minimum 20% standard."
            recommendations.append("Implement local greywater recycling and optimize water consumption.")
        elif wrp_num < 40.0:
            status = "Partially Compliant"
            score = interpolate_score(wrp_num, 20.0, 40.0, 60.0, 79.0)
            reason = f"Water recycling percentage ({wrp_val}) is in the 20-40% range. Meets minimum standards but needs upgrade."
            recommendations.append("Increase wastewater treatment plant (STP) capacity to boost recycled water utilization.")
        elif wrp_num <= 60.0:
            status = "Compliant"
            score = interpolate_score(wrp_num, 40.0, 60.0, 80.0, 89.0)
            reason = f"Water recycling percentage ({wrp_val}) is in the compliant 40-60% range."
            recommendations.append("Consider installing dual-plumbing lines to expand recycled water usage for flushing and cooling.")
        else:
            status = "Excellent"
            score = interpolate_score(wrp_num, 60.0, 100.0, 90.0, 100.0)
            reason = f"Water recycling percentage ({wrp_val}) exceeds 60%, showing exceptional resource stewardship."
            recommendations.append("Maintain high recycling rates. Audit sewage treatment plant efficiency periodically.")
            
        checks.append({
            "metric": "Water Recycling Percentage",
            "key": "water_recycling_percentage",
            "value": str(wrp_val),
            "requirement": req_wrp,
            "status": status,
            "score": round(score),
            "reason": reason,
            "section": section,
            "keywords": ["recycled", "reuse", "water %", "stp"]
        })

    # Check 2: Rainwater Harvesting Capacity Check
    rwh_val = extracted_data.get("rainwater_harvesting_capacity")
    req_rwh = "Rainwater Harvesting System Installed"
    if rwh_val:
        checks.append({
            "metric": "Rainwater Harvesting Capacity",
            "key": "rainwater_harvesting_capacity",
            "value": str(rwh_val),
            "requirement": req_rwh,
            "status": "Compliant",
            "score": 90,
            "reason": f"Rainwater harvesting systems are integrated with a capacity of {rwh_val}.",
            "section": section,
            "keywords": ["rainwater", "harvesting", "recharge", "pit"]
        })
    else:
        checks.append({
            "metric": "Rainwater Harvesting Capacity",
            "key": "rainwater_harvesting_capacity",
            "value": "Not Found",
            "requirement": req_rwh,
            "status": "Partially Compliant",
            "score": 60,
            "reason": "Rainwater harvesting capacity is not reported in the document.",
            "section": section,
            "keywords": ["rainwater", "harvesting"]
        })
        recommendations.append("Incorporate rainwater harvesting pits to collect and recharge groundwater aquifers.")

    # Check 3: Water Consumption Disclosure Check
    water_cons = extracted_data.get("total_water_consumption")
    req_cons = "Total Water Footprint Tracking"
    if water_cons:
        checks.append({
            "metric": "Total Water Footprint",
            "key": "total_water_consumption",
            "value": str(water_cons),
            "requirement": req_cons,
            "status": "Compliant",
            "score": 90,
            "reason": f"Total water footprint is actively tracked at {water_cons}.",
            "section": section,
            "keywords": ["consumption", "water footprint", "kl", "liters"]
        })
    else:
        checks.append({
            "metric": "Total Water Footprint",
            "key": "total_water_consumption",
            "value": "Not Found",
            "requirement": req_cons,
            "status": "Partially Compliant",
            "score": 70,
            "reason": "Total water consumption is not declared.",
            "section": section,
            "keywords": ["water", "consumption"]
        })
        recommendations.append("Install smart water flow meters at primary intake points to log consumption trends.")

    return checks, recommendations

def evaluate_waste_report(extracted_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    checks = []
    recommendations = []
    section = "Waste Management"
    
    # Check 1: Recycling Percentage
    rp_val = extracted_data.get("recycling_percentage")
    rp_num = parse_numeric_value(rp_val)
    req_rp = "≥ 50% Waste Recycling Rate"
    
    if rp_num is None:
        checks.append({
            "metric": "Waste Recycling Percentage",
            "key": "recycling_percentage",
            "value": rp_val or "Not Provided",
            "requirement": req_rp,
            "status": "Non-Compliant",
            "score": 30,
            "reason": "Recycling percentage is missing or could not be parsed.",
            "section": section,
            "keywords": ["recycling", "recycled", "waste %", "diverted"]
        })
        recommendations.append("Document the recycling percentages for paper, plastic, and organic waste.")
        recommendations.append("Establish a comprehensive dry waste recycling program and partner with local recycling agencies.")
    else:
        if rp_num < 50.0:
            status = "Non-Compliant"
            score = interpolate_score(rp_num, 0.0, 50.0, 30.0, 79.0)
            reason = f"Waste recycling percentage ({rp_val}) is below the required 50% threshold."
            recommendations.append("Establish a comprehensive dry waste recycling program and partner with local recycling agencies.")
        elif rp_num <= 75.0:
            status = "Compliant"
            score = interpolate_score(rp_num, 50.0, 75.0, 80.0, 89.0)
            reason = f"Waste recycling percentage ({rp_val}) meets compliant standards (50-75%)."
            recommendations.append("Improve source-segregation procedures to push recycling rates above 75%.")
        else:
            status = "Excellent"
            score = interpolate_score(rp_num, 75.0, 100.0, 90.0, 100.0)
            reason = f"Waste recycling percentage ({rp_val}) is excellent (>75%)."
            recommendations.append("Maintain excellent recycling levels. Establish a community-level zero-waste initiative.")
            
        checks.append({
            "metric": "Waste Recycling Percentage",
            "key": "recycling_percentage",
            "value": str(rp_val),
            "requirement": req_rp,
            "status": status,
            "score": round(score),
            "reason": reason,
            "section": section,
            "keywords": ["recycling", "waste", "%"]
        })

    # Check 2: Landfill Diversion Check
    diverted_val = extracted_data.get("waste_diverted_from_landfill")
    diverted_num = parse_numeric_value(diverted_val)
    req_div = "≥ 50% Landfill Diversion Rate"
    if diverted_num is not None:
        if diverted_num >= 80.0:
            status = "Excellent"
            score = 95
            reason = f"Landfill diversion rate ({diverted_val}) is outstanding."
        elif diverted_num >= 50.0:
            status = "Compliant"
            score = 85
            reason = f"Landfill diversion rate ({diverted_val}) meets green building targets."
        else:
            status = "Non-Compliant"
            score = 50
            reason = f"Landfill diversion rate ({diverted_val}) is low (< 50%), indicating high landfill reliance."
            recommendations.append("Audit construction/operational waste flows to re-route recyclable goods away from landfills.")
            
        checks.append({
            "metric": "Landfill Diversion Rate",
            "key": "waste_diverted_from_landfill",
            "value": str(diverted_val),
            "requirement": req_div,
            "status": status,
            "score": score,
            "reason": reason,
            "section": section,
            "keywords": ["diverted", "landfill", "diversion"]
        })

    # Check 3: Hazardous Waste Handling Check
    haz_val = extracted_data.get("hazardous_waste")
    req_haz = "Hazardous Waste Segregation & Tracking"
    if haz_val:
        checks.append({
            "metric": "Hazardous Waste Reporting",
            "key": "hazardous_waste",
            "value": str(haz_val),
            "requirement": req_haz,
            "status": "Compliant",
            "score": 90,
            "reason": f"Hazardous waste tracking is active ({haz_val}).",
            "section": section,
            "keywords": ["hazardous", "e-waste", "toxic", "disposal"]
        })
    else:
        checks.append({
            "metric": "Hazardous Waste Reporting",
            "key": "hazardous_waste",
            "value": "Not Declared",
            "requirement": req_haz,
            "status": "Partially Compliant",
            "score": 70,
            "reason": "Hazardous waste flows are not reported.",
            "section": section,
            "keywords": ["hazardous", "e-waste"]
        })
        recommendations.append("Develop separate handling, storage, and disposal protocols for hazardous and electronic waste.")

    return checks, recommendations

def evaluate_compliance_document(extracted_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    checks = []
    recommendations = []
    section = "Regulatory Compliance"
    
    # Check 1: Compliance Status
    status_raw = extracted_data.get("compliance_status")
    status_clean = str(status_raw).strip().lower() if status_raw else ""
    req_stat = "Valid Active Regulatory Clearance"
    
    if "valid" in status_clean or "compliant" in status_clean:
        status = "Compliant"
        score = 95
        reason = "The regulatory compliance certificate is active and valid."
    elif "pending" in status_clean or "conditional" in status_clean:
        status = "Partially Compliant"
        score = 70
        reason = "Compliance is conditional or pending final administrative sign-off."
        recommendations.append("Follow up on the pending compliance application to ensure continuous certification.")
    elif "expired" in status_clean or "non-compliant" in status_clean or "non_compliant" in status_clean:
        status = "Non-Compliant"
        score = 30
        reason = "The regulatory certificate has expired or is flagged as non-compliant."
        recommendations.append("Initiate the renewal process for the expired document with the relevant statutory authority immediately.")
    else:
        status = "Non-Compliant"
        score = 40
        reason = f"Compliance status is missing or undetermined ({status_raw or 'Not Found'})."
        recommendations.append("Verify the authorization status of the environmental clearance documents.")
        
    checks.append({
        "metric": "Clearance Status",
        "key": "compliance_status",
        "value": str(status_raw or "Not Found"),
        "requirement": req_stat,
        "status": status,
        "score": score,
        "reason": reason,
        "section": section,
        "keywords": ["clearance", "certificate", "valid", "status"]
    })

    # Check 2: Expiry Date validation
    expiry_val = extracted_data.get("expiry_date")
    req_exp = "Valid Unexpired Validity Period"
    if expiry_val:
        checks.append({
            "metric": "Certificate Validity Period",
            "key": "expiry_date",
            "value": str(expiry_val),
            "requirement": req_exp,
            "status": "Compliant",
            "score": 90,
            "reason": f"Document expiry date is declared: {expiry_val}.",
            "section": section,
            "keywords": ["expiry", "valid until", "date"]
        })
    else:
        checks.append({
            "metric": "Certificate Validity Period",
            "key": "expiry_date",
            "value": "Missing",
            "requirement": req_exp,
            "status": "Partially Compliant",
            "score": 60,
            "reason": "No explicit expiry date is specified on the certificate record.",
            "section": section,
            "keywords": ["expiry", "validity"]
        })
        recommendations.append("Check the certificate terms to ensure validity period is captured in the database.")

    # Check 3: Reference Integrity
    cert_no = extracted_data.get("certificate_number")
    req_no = "Verifiable Registration Number"
    if cert_no:
        checks.append({
            "metric": "Certificate Registration Number",
            "key": "certificate_number",
            "value": str(cert_no),
            "requirement": req_no,
            "status": "Compliant",
            "score": 100,
            "reason": f"Certificate registration reference is verified: {cert_no}.",
            "section": section,
            "keywords": ["certificate", "registration", "number", "ref"]
        })
    else:
        checks.append({
            "metric": "Certificate Registration Number",
            "key": "certificate_number",
            "value": "Missing",
            "requirement": req_no,
            "status": "Partially Compliant",
            "score": 60,
            "reason": "Certificate number is not explicitly recorded.",
            "section": section,
            "keywords": ["certificate", "ref"]
        })

    return checks, recommendations

def evaluate_audit_report(extracted_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    checks = []
    recommendations = []
    section = "Audit Verification"
    
    score_raw = extracted_data.get("audit_score")
    score_num = parse_numeric_value(score_raw)
    req_aud = "≥ 80 Audit Performance Score"
    
    if score_num is None:
        checks.append({
            "metric": "Audit Performance Score",
            "key": "audit_score",
            "value": score_raw or "Not Reported",
            "requirement": req_aud,
            "status": "Non-Compliant",
            "score": 40,
            "reason": "Audit score is not reported or could not be parsed.",
            "section": section,
            "keywords": ["audit", "score", "grade"]
        })
        recommendations.append("Ensure official audit summary contains quantified compliance scores.")
    else:
        if score_num < 60.0:
            status = "Non-Compliant"
            score = interpolate_score(score_num, 0.0, 60.0, 30.0, 59.0)
            reason = f"Audit score ({score_raw}) is below the required 60 passing score."
            recommendations.append("Conduct comprehensive corrective actions to address non-compliant audit findings.")
        elif score_num < 80.0:
            status = "Partially Compliant"
            score = interpolate_score(score_num, 60.0, 80.0, 60.0, 79.0)
            reason = f"Audit score ({score_raw}) is in the 60-80 range, showing room for improvement."
            recommendations.append("Address high-priority audit findings and prepare a corrective action plan.")
        elif score_num <= 90.0:
            status = "Compliant"
            score = interpolate_score(score_num, 80.0, 90.0, 80.0, 89.0)
            reason = f"Audit score ({score_raw}) meets the standard compliant criteria."
            recommendations.append("Implement suggested audit recommendations to move towards excellent score (>90).")
        else:
            status = "Excellent"
            score = interpolate_score(score_num, 90.0, 100.0, 90.0, 100.0)
            reason = f"Audit score ({score_raw}) is exceptional (>90)."
            recommendations.append("Maintain excellent standard operating protocols.")
            
        checks.append({
            "metric": "Audit Performance Score",
            "key": "audit_score",
            "value": str(score_raw),
            "requirement": req_aud,
            "status": status,
            "score": round(score),
            "reason": reason,
            "section": section,
            "keywords": ["audit score", "score", "performance"]
        })

    # Check 2: Risk Level Check
    risk_raw = extracted_data.get("risk_level")
    req_risk = "Low Operational Risk Assessment"
    if risk_raw:
        risk_clean = str(risk_raw).strip().lower()
        if "low" in risk_clean:
            status = "Excellent"
            score = 95
            reason = "Audit reports a low-risk rating for operational compliance."
        elif "medium" in risk_clean:
            status = "Compliant"
            score = 80
            reason = "Audit reports a moderate risk level. Minor actions required."
        elif "high" in risk_clean:
            status = "Non-Compliant"
            score = 45
            reason = "Audit reports a high risk level. Urgent attention needed."
            recommendations.append("Schedule emergency corrective maintenance to resolve high-risk audit findings.")
        else:
            status = "Compliant"
            score = 80
            reason = f"Assessed risk level is logged as: {risk_raw}."
            
        checks.append({
            "metric": "Audit Risk Rating",
            "key": "risk_level",
            "value": str(risk_raw),
            "requirement": req_risk,
            "status": status,
            "score": score,
            "reason": reason,
            "section": section,
            "keywords": ["risk", "level", "assessment"]
        })
    else:
        checks.append({
            "metric": "Audit Risk Rating",
            "key": "risk_level",
            "value": "Not Declared",
            "requirement": req_risk,
            "status": "Partially Compliant",
            "score": 60,
            "reason": "Risk assessment level is not explicitly declared.",
            "section": section,
            "keywords": ["risk"]
        })
        recommendations.append("Include risk categorization matrix in future audits.")

    return checks, recommendations

def evaluate_compliance(document_type: str, extracted_data: Dict[str, Any], pages: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Main entry point for evaluating compliance rules.
    Takes document type, extracted data, and optional PDF pages.
    Runs rule engine, attaches evidence quotes & page numbers, and builds structured issues.
    """
    logger.info(f"Evaluating compliance for document type: '{document_type}'")
    
    checks = []
    recommendations = []
    
    if document_type == "Energy Report":
        checks, recommendations = evaluate_energy_report(extracted_data)
    elif document_type == "Water Report":
        checks, recommendations = evaluate_water_report(extracted_data)
    elif document_type == "Waste Report":
        checks, recommendations = evaluate_waste_report(extracted_data)
    elif document_type == "Compliance Document":
        checks, recommendations = evaluate_compliance_document(extracted_data)
    elif document_type == "Audit Report":
        checks, recommendations = evaluate_audit_report(extracted_data)
    else:
        return {
            "document_type": document_type,
            "compliance_score": 0,
            "overall_status": "Non-Compliant",
            "checks": [],
            "issues": [],
            "recommendations": ["Ensure document type matches standard IGBC reporting categories."],
            "passed_checks": 0,
            "failed_checks": 0,
            "partial_checks": 0,
            "issues_count": 0,
            "critical_issues": 0,
            "high_issues": 0,
            "medium_issues": 0,
            "low_issues": 0
        }
        
    passed_count = 0
    failed_count = 0
    partial_count = 0
    total_score_sum = 0
    
    issues = []
    issue_idx = 1
    
    # Process each check with page evidence lookup and issue detection
    for check in checks:
        status = check["status"]
        score = check.get("score", 0)
        total_score_sum += score
        
        # Evidence & Page lookup
        keywords = check.get("keywords", [check["metric"]])
        val_str = check.get("value")
        page_num, quote = find_evidence_in_pages(pages, keywords, val_str)
        
        check["page_number"] = page_num
        check["evidence_quote"] = quote
        
        if status in ["Compliant", "Excellent"]:
            passed_count += 1
        elif status == "Partially Compliant":
            partial_count += 1
            # Create Medium Issue
            issue_id = f"ISSUE-{issue_idx:02d}"
            issue_idx += 1
            issues.append({
                "issue_id": issue_id,
                "metric": check["metric"],
                "current_value": str(check["value"]),
                "expected_value": check["requirement"],
                "severity": "MEDIUM",
                "explanation": check["reason"],
                "recommended_action": f"Upgrade {check['metric']} parameter to achieve full IGBC compliance threshold.",
                "section": check["section"],
                "page_number": page_num,
                "evidence_quote": quote
            })
        elif status == "Non-Compliant":
            failed_count += 1
            # Create Critical or High Issue
            severity = "CRITICAL" if score < 50 else "HIGH"
            issue_id = f"ISSUE-{issue_idx:02d}"
            issue_idx += 1
            issues.append({
                "issue_id": issue_id,
                "metric": check["metric"],
                "current_value": str(check["value"]),
                "expected_value": check["requirement"],
                "severity": severity,
                "explanation": check["reason"],
                "recommended_action": f"Immediate correction required: {check['reason']}",
                "section": check["section"],
                "page_number": page_num,
                "evidence_quote": quote
            })

    num_checks = len(checks)
    overall_score = round(total_score_sum / num_checks) if num_checks > 0 else 0
    
    if overall_score < 60:
        overall_status = "Non-Compliant"
    elif overall_score < 80:
        overall_status = "Partially Compliant"
    elif overall_score < 90:
        overall_status = "Compliant"
    else:
        overall_status = "Excellent"
        
    seen = set()
    unique_recs = []
    for r in recommendations:
        if r not in seen:
            seen.add(r)
            unique_recs.append(r)
            
    return {
        "document_type": document_type,
        "compliance_score": overall_score,
        "overall_status": overall_status,
        "checks": checks,
        "issues": issues,
        "recommendations": unique_recs,
        "passed_checks": passed_count,
        "failed_checks": failed_count,
        "partial_checks": partial_count,
        "issues_count": len(issues),
        "critical_issues": sum(1 for i in issues if i["severity"] == "CRITICAL"),
        "high_issues": sum(1 for i in issues if i["severity"] == "HIGH"),
        "medium_issues": sum(1 for i in issues if i["severity"] == "MEDIUM"),
        "low_issues": sum(1 for i in issues if i["severity"] == "LOW")
    }
