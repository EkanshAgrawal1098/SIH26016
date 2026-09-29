import os
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.project import Project, ProjectParcel
from app.models.parcel import LandParcel
from app.models.dispute import Objection
from app.models.finance import FinancialRecord
from app.models.rr import AffectedFamily
from app.services.route_diversion_engine import analyze_corridor_contiguity, generate_diverted_routes
from app.services.ai_suggestions_engine import generate_parcel_prescriptive_suggestions, generate_project_strategic_suggestions

QUICK_PROMPTS = [
    {
        "id": "qp-bottlenecks",
        "title": "Corridor Bottlenecks",
        "prompt": "What are the most critical bottlenecks in NH-143 Ranchi-Kolkata corridor?"
    },
    {
        "id": "qp-reroute",
        "title": "Simulate Diverted Route",
        "prompt": "How can we divert the road alignment around high-risk delayed parcels in PRJ-HW-01?"
    },
    {
        "id": "qp-parcel-risk",
        "title": "Explain Parcel Risk",
        "prompt": "Why is parcel IN-JH-RAN-0012 flagged as High Risk, and what statutory remedies apply?"
    },
    {
        "id": "qp-sec77",
        "title": "Section 77 Statutory Guide",
        "prompt": "How can RFCTLARR Section 77(2) help us take possession despite court disputes?"
    },
    {
        "id": "qp-rr-status",
        "title": "R&R Rehabilitation Progress",
        "prompt": "What is the rehabilitation and compensation disbursement status across affected families?"
    }
]

def parse_user_intent(message: str) -> Dict[str, Any]:
    text = message.lower()
    intent = "GENERAL_INQUIRY"
    
    if any(k in text for k in ["divert", "reroute", "bypass", "alternative route", "avoid parcel", "alignment", "road if here comes delay"]):
        intent = "ROUTE_DIVERSION"
    elif any(k in text for k in ["bottleneck", "delay", "choke", "stuck", "critical path", "contiguity", "sever"]):
        intent = "BOTTLENECK_DETECTION"
    elif any(k in text for k in ["risk", "score", "factor", "why high", "why red", "flagged"]):
        intent = "RISK_ANALYSIS"
    elif any(k in text for k in ["section 77", "sec 77", "section 40", "sec 40", "solatium", "law", "statutory", "rfctlarr", "larra", "legal remedy"]):
        intent = "STATUTORY_GUIDANCE"
    elif any(k in text for k in ["r&r", "rehabilitation", "resettlement", "displaced", "families", "tribal", "sc/st"]):
        intent = "RR_ANALYSIS"
    elif any(k in text for k in ["compensation", "payout", "dbt", "valuation", "award", "disburse", "money", "crore"]):
        intent = "FINANCE_ANALYSIS"
    elif any(k in text for k in ["parcel", "khesra", "survey no", "plot"]):
        intent = "PARCEL_QUERY"

    # Extract target project
    project_id = None
    if "hw-01" in text or "nh-143" in text or "ranchi" in text or "highway" in text:
        project_id = "PRJ-HW-01"
    elif "rl-01" in text or "rail" in text or "freight" in text or "east coast" in text:
        project_id = "PRJ-RL-01"

    # Extract target parcel
    parcel_id = None
    m = re.search(r'(in-jh-[\w-]+|nlams-[\w-]+|jh-ran-\d+|wb-pur-\d+|od-myb-\d+)', text)
    if m:
        parcel_id = m.group(1).upper()
    elif "0012" in text or "0001" in text:
        parcel_id = "IN-JH-RAN-0012" if "0012" in text else "NLAMS-JH-RAN-0001"

    return {
        "intent": intent,
        "project_id": project_id,
        "parcel_id": parcel_id,
        "raw_text": message
    }

def process_copilot_query(
    message: str,
    db: Session,
    context_project_id: Optional[str] = None,
    context_parcel_id: Optional[str] = None
) -> Dict[str, Any]:
    parsed = parse_user_intent(message)
    intent = parsed["intent"]
    proj_id = parsed["project_id"] or context_project_id or "PRJ-HW-01"
    parc_id = parsed["parcel_id"] or context_parcel_id

    # Fetch context project
    project = db.query(Project).filter(Project.id == proj_id).first()
    if not project:
        project = db.query(Project).first()
        proj_id = project.id if project else "PRJ-HW-01"

    # Fetch context parcels
    pp_rows = db.query(ProjectParcel).filter(ProjectParcel.project_id == proj_id).all() if project else []
    p_ids = [pp.parcel_id for pp in pp_rows]
    parcels = db.query(LandParcel).filter(LandParcel.id.in_(p_ids)).all() if p_ids else []

    target_parcel = None
    if parc_id:
        target_parcel = db.query(LandParcel).filter(LandParcel.id.ilike(f"%{parc_id}%")).first()

    # Route-specific response generators
    if intent == "ROUTE_DIVERSION":
        contiguity = analyze_corridor_contiguity(project, db) if project else {}
        diverted = generate_diverted_routes(project, [parc_id] if parc_id else None, db) if project else {}
        
        opt_a = diverted.get("diversion_options", [{}])[0]
        opt_b = diverted.get("diversion_options", [{}])[1] if len(diverted.get("diversion_options", [])) > 1 else {}

        content = (
            f"### 🛣️ AI Corridor Diversion & Bypass Recommendation\n\n"
            f"When critical delay or intractable legal disputes occur on **{project.name}**, the AI Route Engine computes alternative alignments to bypass blocked cadastral clusters without halting the wider project:\n\n"
            f"1. **Option A: Northern Cadastral Bypass (Recommended)**\n"
            f"   - **Detour Length:** +{opt_a.get('metrics', {}).get('length_delta_km', 1.2)} km\n"
            f"   - **Days Saved:** ~{opt_a.get('metrics', {}).get('schedule_days_saved', 280)} days (avoids 14-month court battle)\n"
            f"   - **Feasibility Score:** {opt_a.get('metrics', {}).get('feasibility_score', 89.5)}/100\n"
            f"   - **Land vs Civil Cost:** ₹{opt_a.get('metrics', {}).get('estimated_land_cost_cr', 18.5)} Cr land + ₹{opt_a.get('metrics', {}).get('additional_civil_cost_cr', 14.2)} Cr civil\n"
            f"   - **Displaced Families:** 0 (Follows village common grazing corridor)\n\n"
            f"2. **Option B: Southern Peripheral Valley Corridor**\n"
            f"   - **Detour Length:** +{opt_b.get('metrics', {}).get('length_delta_km', 3.4)} km\n"
            f"   - **Days Saved:** ~{opt_b.get('metrics', {}).get('schedule_days_saved', 340)} days\n"
            f"   - **Land Classification:** 100% barren state revenue land (inter-departmental transfer, zero private litigation)\n\n"
            f"3. **Option C: Structural Elevated Viaduct**\n"
            f"   - Avoids ground acquisition by taking aerial easement on central piers (zero land delay, ₹48 Cr civil capex).\n\n"
            f"You can launch the **AI Alignment Studio** below to view these alternative routes layered live on the Leaflet map and compare the multi-criteria trade-off matrix."
        )

        actions = [
            {
                "type": "OPEN_DIVERSION_STUDIO",
                "label": "Open AI Alignment Studio",
                "payload": {"project_id": proj_id, "parcel_ids": [p["id"] for p in diverted.get("blocked_parcels", [])]}
            },
            {
                "type": "VIEW_PROJECT",
                "label": f"View {project.name}",
                "payload": {"project_id": proj_id}
            }
        ]

        return {
            "reply": content,
            "actions": actions,
            "sources": ["Shapely GIS Alignment Engine", "NHAI Geometric Design Guidelines IRC:73", "Project PostGIS Corridor Layer"]
        }

    elif intent == "BOTTLENECK_DETECTION":
        contiguity = analyze_corridor_contiguity(project, db) if project else {}
        choke_pts = contiguity.get("choke_points", [])
        
        choke_text = ""
        for cp in choke_pts[:3]:
            choke_text += f"- **{cp['parcel_id']}** (KM {cp['chainage_km']}): {cp['primary_issue']} — *Est. Delay: {cp['estimated_delay_months']} mos, Idle Cost: ₹{cp['financial_idle_cost_cr']} Cr*\n"

        content = (
            f"### ⚠️ Critical Path Bottleneck Report: {project.name}\n\n"
            f"**Right-of-Way (RoW) Contiguity Index:** `{contiguity.get('contiguity_percentage', 82.5)}%` ({contiguity.get('status', 'ATTENTION_REQUIRED')})\n\n"
            f"The AI Engine has detected **{len(choke_pts)} critical choke point(s)** severing corridor continuity:\n\n"
            f"{choke_text or 'No active corridor-severing choke points found.'}\n\n"
            f"**Impact Summary:** Unmitigated bottlenecks threaten a cumulative delay of **6–14 months** and an estimated **₹45.0 Cr** in contractor idle machinery claims and interest during construction (IDC).\n\n"
            f"**Prescriptive AI Remedies:**\n"
            f"1. Invoke **RFCTLARR Section 77(2)** to deposit disputed funds into LARRA and take possession.\n"
            f"2. Or simulate a **Bypass Route Diversion** around the blocked segment."
        )

        actions = [
            {
                "type": "OPEN_DIVERSION_STUDIO",
                "label": "Simulate Bypass Rerouting",
                "payload": {"project_id": proj_id}
            },
            {
                "type": "VIEW_PROJECT",
                "label": "Inspect Project 360°",
                "payload": {"project_id": proj_id}
            }
        ]

        return {
            "reply": content,
            "actions": actions,
            "sources": ["Critical Path Bottleneck Analyzer", "RFCTLARR SLA Engine", "PostGIS Contiguity Model"]
        }

    elif intent == "STATUTORY_GUIDANCE":
        content = (
            f"### ⚖️ RFCTLARR Act 2013 Statutory Playbook: Section 77(2) & Urgent Possession\n\n"
            f"When land acquisition encounters intractable title disputes, injunctions, or conflicting inheritance claims, the project does **not** need to stall for civil court disposal:\n\n"
            f"#### 1. Section 77(2) Judicial Escrow\n"
            f"- **Statutory Provision:** If there is any dispute as to the title to receive the compensation or as to the apportionment of it, the Collector shall deposit the amount of compensation in the **Land Acquisition, Rehabilitation and Resettlement Authority (LARRA)**.\n"
            f"- **Executive Power:** Once deposited in judicial escrow, the statutory obligation of the State towards compensation is deemed discharged for possession purposes.\n\n"
            f"#### 2. Taking Lawful Possession under Section 38\n"
            f"- The Collector may enforce surrender of possession under Section 38. If opposed, the Collector may apply to the Executive Magistrate for police assistance to take over the corridor.\n\n"
            f"#### 3. Section 40 Urgency Clause\n"
            f"- In cases of national defense, emergency, or vital national infrastructure corridors (notified by Central Government), preliminary inquiry and Section 15 hearings can be restricted to fast-track possession within 30 days.\n\n"
            f"**Recommended Action for Project Director:** Issue reference letter under Section 77(2) to the District Collector and deposit compensation in the LARRA registry account."
        )

        actions = [
            {
                "type": "DRAFT_NOTICE",
                "label": "Generate Section 77(2) Notice Draft",
                "payload": {"project_id": proj_id, "section": "77(2)"}
            }
        ]

        return {
            "reply": content,
            "actions": actions,
            "sources": ["Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013", "Ministry of Rural Development Guidelines"]
        }

    elif intent == "RISK_ANALYSIS" or target_parcel:
        p = target_parcel or (parcels[0] if parcels else None)
        if p:
            suggs = generate_parcel_prescriptive_suggestions(p)
            top_sugg = suggs[0] if suggs else {}
            reasons = p.risk_reasons or ["Title dispute pending hearing"]
            
            content = (
                f"### 🎯 AI Risk Diagnostic: Parcel {p.id}\n\n"
                f"- **Owner:** {p.owner_name} ({p.state_ref_no})\n"
                f"- **Current Stage:** `{p.stage}` | **Risk Level:** `{p.risk}` (Score: {p.risk_score}/100)\n"
                f"- **Area:** {p.normalized_area_sqm:,.1f} sqm ({p.source_area} {p.source_area_unit})\n\n"
                f"**Primary Contributing Risk Drivers:**\n"
                + "\n".join(f"- {r}" for r in reasons) +
                f"\n\n**AI Prescriptive Remedy:**\n"
                f"**{top_sugg.get('title', 'Expedited Hearing')}**\n"
                f"*{top_sugg.get('summary', 'Initiate statutory action.')}*\n\n"
                f"⏱️ **Projected Schedule Savings:** ~{top_sugg.get('estimated_days_saved', 180)} days | **Success Probability:** {top_sugg.get('success_probability', 90)}%"
            )

            actions = [
                {
                    "type": "VIEW_PARCEL",
                    "label": f"Open Parcel {p.id} 360°",
                    "payload": {"parcel_id": p.id}
                },
                {
                    "type": "OPEN_DIVERSION_STUDIO",
                    "label": "Simulate Bypass Route",
                    "payload": {"project_id": proj_id, "parcel_ids": [p.id]}
                }
            ]

            return {
                "reply": content,
                "actions": actions,
                "sources": ["Explainable AI Risk Engine v2.0", "RFCTLARR Milestone Analyzer"]
            }

    # General inquiry fallback
    content = (
        f"### 🤖 BhoomiAI Land Acquisition Copilot\n\n"
        f"I am actively monitoring **{project.name}** across **{len(parcels)} cadastral parcels**.\n\n"
        f"Here are key intelligence operations I can perform for you:\n"
        f"- **Corridor Rerouting & Bypass:** Ask me *'How can we divert the road around delayed parcels?'* to see alternative bypass alignments.\n"
        f"- **Bottleneck Diagnosis:** Ask *'What are the critical bottlenecks?'* to identify corridor-severing plots and financial idle costs.\n"
        f"- **Statutory Guidance:** Inquire about *RFCTLARR Section 77(2)*, *Section 40 Urgency*, or *100% Solatium consent bonuses*.\n"
        f"- **Parcel 360° Diagnostics:** Ask about any specific plot (e.g., `IN-JH-RAN-0012`) for explainable risk scores and mitigation actions."
    )

    actions = [
        {
            "type": "OPEN_DIVERSION_STUDIO",
            "label": "Explore AI Diverted Routes",
            "payload": {"project_id": proj_id}
        },
        {
            "type": "VIEW_PROJECT",
            "label": "Open Project Dashboard",
            "payload": {"project_id": proj_id}
        }
    ]

    return {
        "reply": content,
        "actions": actions,
        "sources": ["National Land Acquisition & Management System AI Core"]
    }
