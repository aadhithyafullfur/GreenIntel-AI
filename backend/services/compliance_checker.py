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
    # Pattern to match numbers (including decimals)
    match = re.search(r"(\d+(?:\.\d+)?)", val_str)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    return None

def interpolate_score(value: float, min_val: float, max_val: float, min_score: float, max_score: float) -> float:
    """
    Linearly interpolate a score between a minimum and maximum score.
    Clamps the result between min_score and max_score.
    """
    if max_val == min_val:
        return min_score
    factor = (value - min_val) / (max_val - min_val)
    score = min_score + factor * (max_score - min_score)
    return max(min(min_score, max_score), min(max(min_score, max_score), score))

def evaluate_energy_report(extracted_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Evaluates compliance for Energy Reports.
    Primary Metric: renewable_energy_percentage
    Secondary Metrics: energy_intensity, carbon_emissions
    """
    checks = []
    recommendations = []
    
    # Check 1: Renewable Energy Percentage
    rep_val = extracted_data.get("renewable_energy_percentage")
    rep_num = parse_numeric_value(rep_val)
    
    if rep_num is None:
        checks.append({
            "metric": "renewable_energy_percentage",
            "value": rep_val or "Not Provided",
            "status": "Non-Compliant",
            "score": 30,
            "reason": "Renewable energy percentage is missing or could not be parsed."
        })
        recommendations.append("Ensure renewable energy percentage is explicitly specified in the Energy Report.")
        recommendations.append("Increase renewable energy generation through solar installations.")
    else:
        # Rules:
        # < 10% = Non-Compliant
        # 10-20% = Partially Compliant
        # 20-30% = Compliant
        # > 30% = Excellent
        if rep_num < 10.0:
            status = "Non-Compliant"
            # Interpolate between 30 and 59
            score = interpolate_score(rep_num, 0.0, 10.0, 30.0, 59.0)
            reason = f"Renewable energy percentage ({rep_val}) is below the minimum 10% threshold."
            recommendations.append("Increase renewable energy generation through solar installations.")
        elif rep_num < 20.0:
            status = "Partially Compliant"
            # Interpolate between 60 and 79
            score = interpolate_score(rep_num, 10.0, 20.0, 60.0, 79.0)
            reason = f"Renewable energy percentage ({rep_val}) is in the 10-20% range. Meets baseline but requires improvement."
            recommendations.append("Increase renewable energy generation through solar installations.")
            recommendations.append("Install energy-efficient heat pumps and LED fixtures to reduce overall base load.")
        elif rep_num <= 30.0:
            status = "Compliant"
            # Interpolate between 80 and 89 (Exactly 22% yields 82, matching the example!)
            score = interpolate_score(rep_num, 20.0, 30.0, 80.0, 89.0)
            reason = f"Renewable energy percentage ({rep_val}) meets the compliance range of 20-30%."
            recommendations.append("Consider upgrading renewable energy integration to exceed 30% for an Excellent rating.")
        else:
            status = "Excellent"
            # Interpolate between 90 and 100
            score = interpolate_score(rep_num, 30.0, 100.0, 90.0, 100.0)
            reason = f"Renewable energy percentage ({rep_val}) exceeds the 30% threshold for exemplary performance."
            recommendations.append("Maintain excellent renewable energy share. Evaluate energy storage options to maximize utility.")
            
        checks.append({
            "metric": "renewable_energy_percentage",
            "value": rep_val,
            "status": status,
            "score": round(score),
            "reason": reason
        })

    # Check 2: Energy Intensity Check
    intensity_val = extracted_data.get("energy_intensity")
    intensity_num = parse_numeric_value(intensity_val)
    if intensity_num is not None:
        # Typical EPI guidelines: < 80 is Excellent, 80-120 Compliant, 120-150 Partial, > 150 Non-Compliant
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
            reason = f"Energy intensity ({intensity_val}) is elevated. Plan for energy conservation measures."
            recommendations.append("Optimize HVAC operations and thermal insulation to lower the Energy Performance Index (EPI).")
        else:
            status = "Non-Compliant"
            score = 45
            reason = f"Energy intensity ({intensity_val}) exceeds acceptable building standards."
            recommendations.append("Conduct a deep-dive energy audit to identify waste sources and implement automated building controls (BMS).")
            
        checks.append({
            "metric": "energy_intensity",
            "value": intensity_val,
            "status": status,
            "score": score,
            "reason": reason
        })

    # Check 3: Carbon Footprint Disclosure Check
    carbon_val = extracted_data.get("carbon_emissions")
    if carbon_val:
        checks.append({
            "metric": "carbon_emissions_disclosure",
            "value": carbon_val,
            "status": "Compliant",
            "score": 90,
            "reason": f"Carbon emissions are tracked and reported at {carbon_val}."
        })
    else:
        checks.append({
            "metric": "carbon_emissions_disclosure",
            "value": "Not Disclosed",
            "status": "Partially Compliant",
            "score": 65,
            "reason": "Carbon emissions data is not explicitly declared."
        })
        recommendations.append("Establish greenhouse gas accounting guidelines to track Scope 1 and Scope 2 emissions.")
        
    # Check 4: Data Completeness Check
    core_fields = ["annual_energy_consumption", "building_area"]
    missing_fields = [f for f in core_fields if not extracted_data.get(f)]
    if not missing_fields:
        checks.append({
            "metric": "data_completeness",
            "value": "Complete",
            "status": "Compliant",
            "score": 100,
            "reason": "All critical energy performance parameters are fully documented."
        })
    else:
        checks.append({
            "metric": "data_completeness",
            "value": f"Missing {len(missing_fields)} core field(s)",
            "status": "Partially Compliant",
            "score": 70,
            "reason": f"Key field(s) {', '.join(missing_fields)} are missing."
        })
        recommendations.append("Provide building area and total consumption figures to compute accurate efficiency baselines.")

    return checks, recommendations

def evaluate_water_report(extracted_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Evaluates compliance for Water Reports.
    Primary Metric: water_recycling_percentage
    Secondary Metrics: rainwater_harvesting_capacity, total_water_consumption
    """
    checks = []
    recommendations = []
    
    # Check 1: Water Recycling Percentage
    wrp_val = extracted_data.get("water_recycling_percentage")
    wrp_num = parse_numeric_value(wrp_val)
    
    if wrp_num is None:
        checks.append({
            "metric": "water_recycling_percentage",
            "value": wrp_val or "Not Provided",
            "status": "Non-Compliant",
            "score": 30,
            "reason": "Water recycling percentage is missing or could not be parsed."
        })
        recommendations.append("Provide water recycling/re-use metrics to satisfy municipal and IGBC regulations.")
        recommendations.append("Implement local greywater recycling and optimize water consumption.")
    else:
        # Rules:
        # < 20% = Non-Compliant
        # 20-40% = Partially Compliant
        # 40-60% = Compliant
        # > 60% = Excellent
        if wrp_num < 20.0:
            status = "Non-Compliant"
            score = interpolate_score(wrp_num, 0.0, 20.0, 30.0, 59.0)
            reason = f"Water recycling percentage ({wrp_val}) is below the minimum 20% standard."
            recommendations.append("Implement local greywater recycling and optimize water consumption.")
        elif wrp_num < 40.0:
            status = "Partially Compliant"
            score = interpolate_score(wrp_num, 20.0, 40.0, 60.0, 79.0)
            reason = f"Water recycling percentage ({wrp_val}) is in the 20-40% range. Meets minimum standards but leaves room for improvement."
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
            "metric": "water_recycling_percentage",
            "value": wrp_val,
            "status": status,
            "score": round(score),
            "reason": reason
        })

    # Check 2: Rainwater Harvesting Capacity Check
    rwh_val = extracted_data.get("rainwater_harvesting_capacity")
    if rwh_val:
        checks.append({
            "metric": "rainwater_harvesting",
            "value": rwh_val,
            "status": "Compliant",
            "score": 90,
            "reason": f"Rainwater harvesting systems are integrated with a capacity of {rwh_val}."
        })
    else:
        checks.append({
            "metric": "rainwater_harvesting",
            "value": "Not Found",
            "status": "Partially Compliant",
            "score": 60,
            "reason": "Rainwater harvesting capacity is not reported in the document."
        })
        recommendations.append("Incorporate rainwater harvesting pits to collect and recharge groundwater aquifers.")

    # Check 3: Water Consumption Disclosure Check
    water_cons = extracted_data.get("total_water_consumption")
    if water_cons:
        checks.append({
            "metric": "water_consumption_disclosure",
            "value": water_cons,
            "status": "Compliant",
            "score": 90,
            "reason": f"Total water footprint is actively tracked at {water_cons}."
        })
    else:
        checks.append({
            "metric": "water_consumption_disclosure",
            "value": "Not Found",
            "status": "Partially Compliant",
            "score": 70,
            "reason": "Total water consumption is not declared."
        })
        recommendations.append("Install smart water flow meters at primary intake points to log consumption trends.")

    return checks, recommendations

def evaluate_waste_report(extracted_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Evaluates compliance for Waste Reports.
    Primary Metric: recycling_percentage
    Secondary Metrics: hazardous_waste, waste_diverted_from_landfill
    """
    checks = []
    recommendations = []
    
    # Check 1: Recycling Percentage
    rp_val = extracted_data.get("recycling_percentage")
    rp_num = parse_numeric_value(rp_val)
    
    if rp_num is None:
        checks.append({
            "metric": "recycling_percentage",
            "value": rp_val or "Not Provided",
            "status": "Non-Compliant",
            "score": 30,
            "reason": "Recycling percentage is missing or could not be parsed."
        })
        recommendations.append("Document the recycling percentages for paper, plastic, and organic waste.")
        recommendations.append("Establish a comprehensive dry waste recycling program and partner with local recycling agencies.")
    else:
        # Rules:
        # < 50% = Non-Compliant
        # 50-75% = Compliant
        # > 75% = Excellent
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
            "metric": "recycling_percentage",
            "value": rp_val,
            "status": status,
            "score": round(score),
            "reason": reason
        })

    # Check 2: Landfill Diversion Check
    diverted_val = extracted_data.get("waste_diverted_from_landfill")
    diverted_num = parse_numeric_value(diverted_val)
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
            reason = f"Landfill diversion rate ({diverted_val}) is low, indicating high landfill reliance."
            recommendations.append("Audit construction/operational waste flows to re-route recyclable goods away from landfills.")
            
        checks.append({
            "metric": "waste_diverted_from_landfill",
            "value": diverted_val,
            "status": status,
            "score": score,
            "reason": reason
        })

    # Check 3: Hazardous Waste Handling Check
    haz_val = extracted_data.get("hazardous_waste")
    if haz_val:
        checks.append({
            "metric": "hazardous_waste_reporting",
            "value": haz_val,
            "status": "Compliant",
            "score": 90,
            "reason": f"Hazardous waste tracking is active ({haz_val})."
        })
    else:
        checks.append({
            "metric": "hazardous_waste_reporting",
            "value": "Not Declared",
            "status": "Partially Compliant",
            "score": 70,
            "reason": "Hazardous waste flows are not reported."
        })
        recommendations.append("Develop separate handling, storage, and disposal protocols for hazardous and electronic waste.")

    return checks, recommendations

def evaluate_compliance_document(extracted_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Evaluates compliance for statutory Compliance Documents.
    Primary Metric: compliance_status
    Secondary Metrics: certificate_number, expiry_date
    """
    checks = []
    recommendations = []
    
    # Check 1: Compliance Status
    status_raw = extracted_data.get("compliance_status")
    status_clean = str(status_raw).strip().lower() if status_raw else ""
    
    # Rules:
    # Valid = Compliant
    # Expired = Non-Compliant
    # Pending = Partially Compliant
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
        "metric": "compliance_status",
        "value": status_raw or "Not Found",
        "status": status,
        "score": score,
        "reason": reason
    })

    # Check 2: Expiry Date validation if present
    expiry_val = extracted_data.get("expiry_date")
    if expiry_val:
        checks.append({
            "metric": "expiry_date_integrity",
            "value": expiry_val,
            "status": "Compliant",
            "score": 90,
            "reason": f"Document expiry date is declared: {expiry_val}."
        })
    else:
        checks.append({
            "metric": "expiry_date_integrity",
            "value": "Missing",
            "status": "Partially Compliant",
            "score": 60,
            "reason": "No explicit expiry date is specified on the certificate record."
        })
        recommendations.append("Check the certificate terms to ensure validity period is captured in the database.")

    # Check 3: Reference Integrity
    cert_no = extracted_data.get("certificate_number")
    if cert_no:
        checks.append({
            "metric": "certificate_number",
            "value": cert_no,
            "status": "Compliant",
            "score": 100,
            "reason": f"Unique certificate serial number verified: {cert_no}."
        })
    else:
        checks.append({
            "metric": "certificate_number",
            "value": "Missing",
            "status": "Partially Compliant",
            "score": 70,
            "reason": "Certificate number is not documented, which may delay third-party auditing."
        })
        recommendations.append("Add the formal NOC or certificate serial number to the record header.")

    return checks, recommendations

def evaluate_audit_report(extracted_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Evaluates compliance for third-party Audit Reports.
    Primary Metric: audit_score
    Secondary Metrics: risk_level, findings
    """
    checks = []
    recommendations = []
    
    # Check 1: Audit Score
    score_raw = extracted_data.get("audit_score")
    score_num = parse_numeric_value(score_raw)
    
    if score_num is None:
        checks.append({
            "metric": "audit_score",
            "value": score_raw or "Not Provided",
            "status": "Non-Compliant",
            "score": 30,
            "reason": "Audit performance score is missing or could not be parsed."
        })
        recommendations.append("Provide a clear quantitative audit score/rating to verify compliance level.")
        recommendations.append("Address critical audit findings and schedule a re-audit to improve the compliance score.")
    else:
        # Rules:
        # < 60 = Non-Compliant
        # 60-80 = Partially Compliant
        # 80-90 = Compliant
        # > 90 = Excellent
        if score_num < 60.0:
            status = "Non-Compliant"
            score = interpolate_score(score_num, 0.0, 60.0, 30.0, 59.0)
            reason = f"Audit performance score ({score_raw}) is below the minimum compliance threshold of 60."
            recommendations.append("Address critical audit findings and schedule a re-audit to improve the compliance score.")
        elif score_num < 80.0:
            status = "Partially Compliant"
            score = interpolate_score(score_num, 60.0, 80.0, 60.0, 79.0)
            reason = f"Audit performance score ({score_raw}) is in the 60-80 range, showing major room for improvement."
            recommendations.append("Address high-priority audit findings and prepare a corrective action plan.")
        elif score_num <= 90.0:
            status = "Compliant"
            score = interpolate_score(score_num, 80.0, 90.0, 80.0, 89.0)
            reason = f"Audit performance score ({score_raw}) meets the standard compliant criteria."
            recommendations.append("Implement suggested audit recommendations to move towards excellent score (>90).")
        else:
            status = "Excellent"
            score = interpolate_score(score_num, 90.0, 100.0, 90.0, 100.0)
            reason = f"Audit performance score ({score_raw}) is exceptional (>90)."
            recommendations.append("Maintain excellent standard operating protocols and share best practices.")
            
        checks.append({
            "metric": "audit_score",
            "value": score_raw,
            "status": status,
            "score": round(score),
            "reason": reason
        })

    # Check 2: Risk Level Check
    risk_raw = extracted_data.get("risk_level")
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
            reason = "Audit reports a high risk level. Urgent attention is needed."
            recommendations.append("Schedule emergency corrective maintenance to resolve high-risk audit findings.")
        else:
            status = "Compliant"
            score = 80
            reason = f"Assessed risk level is logged as: {risk_raw}."
            
        checks.append({
            "metric": "risk_level",
            "value": risk_raw,
            "status": status,
            "score": score,
            "reason": reason
        })
    else:
        checks.append({
            "metric": "risk_level",
            "value": "Not Declared",
            "status": "Partially Compliant",
            "score": 60,
            "reason": "Risk assessment level is not explicitly declared."
        })
        recommendations.append("Include risk categorization matrix in future audits.")

    # Check 3: Findings Audit
    findings = extracted_data.get("findings")
    if findings:
        checks.append({
            "metric": "audit_findings_actionability",
            "value": "Reported",
            "status": "Compliant",
            "score": 90,
            "reason": "Audit findings and anomalies are well-documented."
        })
    else:
        checks.append({
            "metric": "audit_findings_actionability",
            "value": "Missing",
            "status": "Partially Compliant",
            "score": 70,
            "reason": "Audit findings details are not listed in the structured fields."
        })

    return checks, recommendations

def evaluate_compliance(document_type: str, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point for evaluating compliance rules.
    Takes document type and extracted data, runs the rule engine,
    computes scores, counts passed/failed/partial checks, and generates recommendations.
    """
    logger.info(f"Evaluating compliance for document type: '{document_type}'")
    
    # Defaults in case document type is not supported
    checks = []
    recommendations = []
    
    # Route based on document type
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
        logger.warning(f"Unrecognized document type '{document_type}'. Skipping evaluation.")
        return {
            "document_type": document_type,
            "compliance_score": 0,
            "overall_status": "Non-Compliant",
            "checks": [],
            "recommendations": ["Ensure document type matches standard IGBC reporting categories."],
            "passed_checks": 0,
            "failed_checks": 0,
            "partial_checks": 0
        }
        
    # Calculate overall score and counts
    passed_count = 0
    failed_count = 0
    partial_count = 0
    total_score_sum = 0
    
    for check in checks:
        status = check["status"]
        score = check.get("score", 0)
        total_score_sum += score
        
        if status in ["Compliant", "Excellent"]:
            passed_count += 1
        elif status == "Partially Compliant":
            partial_count += 1
        elif status == "Non-Compliant":
            failed_count += 1
            
    # Calculate overall score
    num_checks = len(checks)
    overall_score = round(total_score_sum / num_checks) if num_checks > 0 else 0
    
    # Determine overall status based on score
    # < 60 = Non-Compliant
    # 60-80 = Partially Compliant (exclusive of 80)
    # 80-90 = Compliant (exclusive of 90)
    # >= 90 = Excellent (if all are excellent or overall is >90)
    if overall_score < 60:
        overall_status = "Non-Compliant"
    elif overall_score < 80:
        overall_status = "Partially Compliant"
    elif overall_score < 90:
        overall_status = "Compliant"
    else:
        overall_status = "Excellent"
        
    # Ensure recommendation list is unique but keeps order
    seen = set()
    unique_recs = []
    for r in recommendations:
        if r not in seen:
            seen.add(r)
            unique_recs.append(r)
            
    # Return formatted result
    return {
        "document_type": document_type,
        "compliance_score": overall_score,
        "overall_status": overall_status,
        "checks": checks,
        "recommendations": unique_recs,
        "passed_checks": passed_count,
        "failed_checks": failed_count,
        "partial_checks": partial_count
    }
