from typing import List, Dict, Any
from app.models.parcel import LandParcel

def analyze_project_bottlenecks(parcels: List[LandParcel]) -> List[Dict[str, Any]]:
    """
    Identifies top project bottlenecks, groups impacted parcels,
    and estimates critical path schedule and financial delay impact.
    """
    dispute_parcels = []
    comp_parcels = []
    survey_parcels = []
    conflict_parcels = []
    sla_breach_parcels = []

    for p in parcels:
        # Dispute detection
        if p.objections and any(obj.status in ["OPEN", "IN_HEARING"] for obj in p.objections):
            dispute_parcels.append(p)
        # Compensation pending
        if p.stage in ["AWARD", "COMPENSATION", "POSSESSION"] and p.financials and p.financials.status != "DISBURSED":
            comp_parcels.append(p)
        # Survey pending
        if p.stage == "SURVEY":
            survey_parcels.append(p)
        # Conflict detection
        if p.conflicts and any(not c.resolved for c in p.conflicts):
            conflict_parcels.append(p)
        # SLA breach detection
        if p.risk == "HIGH" and p.stage in ["OBJECTION", "HEARING", "VALUATION"]:
            sla_breach_parcels.append(p)

    bottlenecks = []

    if dispute_parcels:
        count = len(dispute_parcels)
        cost_overrun = round(count * 3.8, 1)  # ~3.8 Cr per disputed corridor zone
        bottlenecks.append({
            "type": "OWNERSHIP_DISPUTE",
            "title": "Title Objection / Multiple Claimant Deadlock",
            "count": count,
            "severity": "CRITICAL",
            "affected_parcels": [p.id for p in dispute_parcels],
            "projected_delay_months": 8,
            "financial_idle_cost_cr": cost_overrun,
            "is_corridor_severing": True,
            "recommended_action": "Invoke RFCTLARR Act 2013 Section 77(2) deposit into LARRA Authority; take possession under Sec 38.",
            "statutory_playbook": "SECTION_77_LARRA_DEPOSIT"
        })

    if comp_parcels:
        count = len(comp_parcels)
        cost_overrun = round(count * 1.5, 1)
        bottlenecks.append({
            "type": "COMPENSATION_PENDING",
            "title": "Award Compensation Disbursement Lag",
            "count": count,
            "severity": "HIGH",
            "affected_parcels": [p.id for p in comp_parcels],
            "projected_delay_months": 3,
            "financial_idle_cost_cr": cost_overrun,
            "is_corridor_severing": False,
            "recommended_action": "Sanction batch DBT direct credit to verified PFMS/Aadhaar-linked accounts and dispatch camp teams.",
            "statutory_playbook": "EXPEDITED_DBT_DISBURSEMENT"
        })

    if conflict_parcels:
        count = len(conflict_parcels)
        bottlenecks.append({
            "type": "DATA_DISCREPANCY",
            "title": "Cadastral RoR vs DGPS Survey Boundary Conflict",
            "count": count,
            "severity": "MEDIUM",
            "affected_parcels": [p.id for p in conflict_parcels],
            "projected_delay_months": 2,
            "financial_idle_cost_cr": round(count * 0.6, 1),
            "is_corridor_severing": False,
            "recommended_action": "Deploy Joint Verification Team (Circle Officer + Survey Surveyor) for digital boundary rectification.",
            "statutory_playbook": "JOINT_SURVEY_VERIFICATION"
        })

    if survey_parcels:
        count = len(survey_parcels)
        bottlenecks.append({
            "type": "SURVEY_PENDING",
            "title": "Preliminary Cadastral DGPS Survey Incomplete",
            "count": count,
            "severity": "MEDIUM",
            "affected_parcels": [p.id for p in survey_parcels],
            "projected_delay_months": 1,
            "financial_idle_cost_cr": round(count * 0.4, 1),
            "is_corridor_severing": False,
            "recommended_action": "Commission drone-based LiDAR/DGPS orthophoto mapping under Section 4 preliminary survey mandate.",
            "statutory_playbook": "DRONE_LIDAR_SURVEY"
        })

    return bottlenecks
