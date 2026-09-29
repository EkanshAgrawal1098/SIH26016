from typing import List, Dict, Any, Optional
from app.models.parcel import LandParcel
from app.models.project import Project

def generate_parcel_prescriptive_suggestions(parcel: LandParcel) -> List[Dict[str, Any]]:
    """
    Generates actionable, statutory AI suggestions for resolving parcel-level deadlocks.
    Grounded in RFCTLARR Act 2013 and national infrastructure best practices.
    """
    suggestions = []

    has_open_dispute = parcel.objections and any(obj.status in ["OPEN", "IN_HEARING"] for obj in parcel.objections)
    has_conflicts = parcel.conflicts and any(not c.resolved for c in parcel.conflicts)
    comp_pending = parcel.financials and parcel.financials.status != "DISBURSED" and parcel.stage in ["AWARD", "COMPENSATION", "POSSESSION"]

    # 1. Title dispute / Multi-heir litigation -> RFCTLARR Section 77(2) Deposit
    if has_open_dispute or parcel.risk == "HIGH":
        suggestions.append({
            "id": "SUGG-SEC77-LARRA",
            "title": "Deposit Compensation into LARRA Authority (RFCTLARR Sec 77(2))",
            "statutory_reference": "Right to Fair Compensation & Transparency Act, 2013 § 77(2)",
            "urgency": "HIGH",
            "summary": "Where ownership is in dispute or multiple claimants raise title objections, the Collector is legally empowered to deposit the compensation into the Land Acquisition, Rehabilitation and Resettlement Authority (LARRA).",
            "strategic_benefit": "Enables the Competent Authority to take lawful physical possession under Section 38 without waiting for civil court litigation to conclude.",
            "estimated_days_saved": 210,
            "cost_delta_cr": 0.0,
            "success_probability": 94.0,
            "action_cta": "Prepare Sec 77(2) Reference Order"
        })

        # Fast-track Lok Adalat option
        suggestions.append({
            "id": "SUGG-LOK-ADALAT",
            "title": "Refer Title Dispute to Special Land Lok Adalat",
            "statutory_reference": "Legal Services Authorities Act, 1987 § 19",
            "urgency": "MEDIUM",
            "summary": "Schedule a pre-litigation settlement hearing before the District Legal Services Authority (DLSA) Lok Adalat bench for joint mutual partition agreement.",
            "strategic_benefit": "Final and non-appealable award order with consensual owner sign-off.",
            "estimated_days_saved": 120,
            "cost_delta_cr": 0.05,
            "success_probability": 78.5,
            "action_cta": "Schedule Lok Adalat Hearing"
        })

    # 2. Compensation delay -> Direct Benefit Transfer Fast-track + Consent Solatium
    if comp_pending:
        suggestions.append({
            "id": "SUGG-CONSENT-SOLATIUM",
            "title": "Authorize 100% Solatium & Consent Award Incentive",
            "statutory_reference": "RFCTLARR Act 2013 First Schedule (Solatium @ 100%)",
            "urgency": "HIGH",
            "summary": "Offer expedited settlement bonus of 12% additional interest per annum from notification date under Section 30(3) upon instant possession handover.",
            "strategic_benefit": "Disincentivizes court challenges by landowners and secures immediate voluntary possession within 14 days.",
            "estimated_days_saved": 90,
            "cost_delta_cr": 0.25,
            "success_probability": 88.0,
            "action_cta": "Issue Consent Award Notice"
        })

    # 3. Cadastral Boundary discrepancy -> Drone LiDAR Joint Rectification
    if has_conflicts:
        suggestions.append({
            "id": "SUGG-DRONE-RECTIFY",
            "title": "Joint Digital Boundary Rectification (DGPS + Drone)",
            "statutory_reference": "Digital India Land Records Modernization Programme (DILRMP) Guidelines",
            "urgency": "MEDIUM",
            "summary": "Conduct a 48-hour differential GPS (DGPS) resurvey with Circle Inspector and Revenue Karamchari to reconcile Jamabandi registry mismatch.",
            "strategic_benefit": "Eliminates area dispute risk before Section 19 declaration.",
            "estimated_days_saved": 45,
            "cost_delta_cr": 0.02,
            "success_probability": 96.0,
            "action_cta": "Dispatch Joint Survey Team"
        })

    # 4. Critical corridor severing -> AI Bypass Diversion Option
    if parcel.risk == "HIGH":
        suggestions.append({
            "id": "SUGG-CORRIDOR-BYPASS",
            "title": "Simulate AI Corridor Bypass / Route Diversion",
            "statutory_reference": "NHAI Technical Guidelines / IRC:73 Alignment Optimization",
            "urgency": "MEDIUM",
            "summary": "If title litigation cannot be resolved within SLA, simulate shifting corridor alignment by 350m onto adjacent revenue/panchayat land.",
            "strategic_benefit": "De-links civil contract milestones from litigated parcel, preserving overall project completion date.",
            "estimated_days_saved": 280,
            "cost_delta_cr": 14.2,
            "success_probability": 90.0,
            "action_cta": "Launch Route Diversion Studio"
        })

    return suggestions

def generate_project_strategic_suggestions(project: Project, parcels: List[LandParcel]) -> List[Dict[str, Any]]:
    """
    Generates macro-level strategic suggestions for the Project Director.
    """
    high_risk_parcels = [p for p in parcels if p.risk == "HIGH"]
    total = len(parcels) or 1
    high_risk_ratio = len(high_risk_parcels) / total

    suggestions = []

    if high_risk_parcels:
        suggestions.append({
            "id": "PROJ-SUGG-CORRIDOR-BYPASS",
            "title": "Evaluate Corridor Bypass Alignment on Critical Chainage",
            "category": "ENGINEERING_REALIGNMENT",
            "urgency": "CRITICAL" if high_risk_ratio > 0.2 else "HIGH",
            "summary": f"{len(high_risk_parcels)} parcel(s) pose critical corridor obstruction risks. AI diversion analysis indicates viable bypass options saving up to 280 construction days.",
            "recommended_action": "Open AI Alignment Studio to inspect Northern Bypass and Viaduct options.",
            "estimated_savings_cr": 24.5,
            "days_saved": 280,
            "action_type": "DIVERSIION_STUDIO"
        })

        suggestions.append({
            "id": "PROJ-SUGG-BULK-SEC77",
            "title": "En-Bloc Section 77(2) LARRA Judicial Deposits",
            "category": "STATUTORY_LEGAL",
            "urgency": "HIGH",
            "summary": f"Direct District Land Acquisition Officer (DLAO) to prepare judicial deposit orders for {len(high_risk_parcels)} disputed parcels, enabling Section 38 immediate possession.",
            "recommended_action": "Issue administrative sanction for judicial escrow deposit.",
            "estimated_savings_cr": 18.0,
            "days_saved": 180,
            "action_type": "LEGAL_SANCTION"
        })

    suggestions.append({
        "id": "PROJ-SUGG-DIRECT-PURCHASE",
        "category": "FINANCIAL_INCENTIVE",
        "title": "Constitute District Direct Purchase Committee (Private Negotiation)",
        "urgency": "MEDIUM",
        "summary": "State Land Acquisition policies permit direct negotiated purchase up to 1.5x circle rate without prolonged statutory inquiry.",
        "recommended_action": "Convene DLAO negotiation camp in Namkum / Ormanjhi.",
        "estimated_savings_cr": 8.0,
        "days_saved": 90,
        "action_type": "NEGOTIATION_CAMP"
    })

    return suggestions
