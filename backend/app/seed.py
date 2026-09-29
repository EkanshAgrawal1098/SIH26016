import json
from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine, Base
from app.models.reference import State, District, Subdistrict, Village
from app.models.user import User
from app.models.project import Project, ProjectParcel
from app.models.parcel import LandParcel
from app.models.workflow import StageEvent, AcquisitionCase
from app.models.finance import FinancialRecord
from app.models.dispute import Objection, Grievance
from app.models.document import DocumentRef
from app.models.integration import SourceSystem, FieldMapping
from app.models.audit import DataConflict, Bottleneck
from app.models.rr import AffectedFamily, RRCase

def square(lat: float, lng: float, size_deg: float):
    h = size_deg / 2
    return {
        "type": "Polygon",
        "coordinates": [
            [
                [round(lng - h, 6), round(lat - h, 6)],
                [round(lng + h, 6), round(lat - h, 6)],
                [round(lng + h, 6), round(lat + h, 6)],
                [round(lng - h, 6), round(lat + h, 6)],
                [round(lng - h, 6), round(lat - h, 6)],
            ]
        ]
    }

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding Reference Hierarchy (States, Districts, Villages)...")
        # States
        states_data = [
            {"id": "JH", "code": "JH", "name": "Jharkhand"},
            {"id": "WB", "code": "WB", "name": "West Bengal"},
            {"id": "OD", "code": "OD", "name": "Odisha"},
        ]
        for s in states_data:
            if not db.query(State).filter(State.id == s["id"]).first():
                db.add(State(id=s["id"], code=s["code"], name=s["name"]))
        db.commit()

        # Districts
        districts_data = [
            {"id": "JH-RAN", "name": "Ranchi", "state_id": "JH"},
            {"id": "JH-EMB", "name": "East Singhbhum", "state_id": "JH"},
            {"id": "WB-PUR", "name": "Purulia", "state_id": "WB"},
            {"id": "WB-HOW", "name": "Howrah", "state_id": "WB"},
            {"id": "OD-MYB", "name": "Mayurbhanj", "state_id": "OD"},
        ]
        for d in districts_data:
            if not db.query(District).filter(District.id == d["id"]).first():
                db.add(District(id=d["id"], name=d["name"], state_id=d["state_id"]))
        db.commit()

        # Subdistricts
        for d in districts_data:
            sub_id = f"SUB-{d['id']}"
            if not db.query(Subdistrict).filter(Subdistrict.id == sub_id).first():
                db.add(Subdistrict(id=sub_id, name=f"{d['name']} Sadar", district_id=d["id"]))
        db.commit()

        # Villages
        villages_data = [
            {"id": "V01", "name": "Namkum", "district_id": "JH-RAN"},
            {"id": "V02", "name": "Ormanjhi", "district_id": "JH-RAN"},
            {"id": "V03", "name": "Jamshedpur Rural", "district_id": "JH-EMB"},
            {"id": "V04", "name": "Ghatshila", "district_id": "JH-EMB"},
            {"id": "V05", "name": "Balarampur", "district_id": "WB-PUR"},
            {"id": "V06", "name": "Raghunathpur", "district_id": "WB-PUR"},
            {"id": "V07", "name": "Uluberia", "district_id": "WB-HOW"},
            {"id": "V08", "name": "Domjur", "district_id": "WB-HOW"},
            {"id": "V09", "name": "Baripada", "district_id": "OD-MYB"},
            {"id": "V10", "name": "Rairangpur", "district_id": "OD-MYB"},
        ]
        for v in villages_data:
            if not db.query(Village).filter(Village.id == v["id"]).first():
                db.add(Village(id=v["id"], name=v["name"], district_id=v["district_id"]))
        db.commit()

        print("Seeding Users & Roles...")
        users_data = [
            {
                "username": "rajesh.kumar",
                "full_name": "Rajesh Kumar, IAS",
                "role": "DISTRICT_OFFICER",
                "user_mode": "official",
                "jurisdiction": "Jharkhand > Ranchi",
                "avatar_initials": "RK"
            },
            {
                "username": "national.admin",
                "full_name": "Dr. Ananya Sharma",
                "role": "NATIONAL_ADMIN",
                "user_mode": "official",
                "jurisdiction": "National HQ, New Delhi",
                "avatar_initials": "AS"
            },
            {
                "username": "state.officer",
                "full_name": "P. K. Verma",
                "role": "STATE_OFFICER",
                "user_mode": "official",
                "jurisdiction": "Jharkhand State",
                "avatar_initials": "PV"
            },
            {
                "username": "field.officer",
                "full_name": "Rohan Das",
                "role": "FIELD_OFFICER",
                "user_mode": "official",
                "jurisdiction": "Ranchi Field Division",
                "avatar_initials": "RD"
            },
            {
                "username": "suresh.mahato",
                "full_name": "Suresh Mahato",
                "role": "CITIZEN",
                "user_mode": "landowner",
                "owner_ref_id": "ORID-JH-778102",
                "phone_masked": "+91 98••••••41"
            }
        ]
        for u in users_data:
            if not db.query(User).filter(User.username == u["username"]).first():
                db.add(User(
                    username=u["username"],
                    full_name=u["full_name"],
                    role=u["role"],
                    user_mode=u["user_mode"],
                    jurisdiction=u.get("jurisdiction"),
                    avatar_initials=u.get("avatar_initials"),
                    owner_ref_id=u.get("owner_ref_id"),
                    phone_masked=u.get("phone_masked"),
                    password_hash="demo_password"
                ))
        db.commit()

        print("Seeding Projects & Corridors...")
        projects_data = [
            {
                "id": "PRJ-HW-01",
                "name": "NH-143 Ranchi–Kolkata Expansion Corridor",
                "type": "HIGHWAY",
                "state_ids": ["JH", "WB"],
                "total_land_required_sqm": 4820000,
                "corridor": {
                    "type": "LineString",
                    "coordinates": [
                        [85.3096, 23.3441],
                        [86.2, 23.05],
                        [86.66, 22.98],
                        [87.855, 22.9868],
                        [88.1, 22.75]
                    ]
                },
                "description": "Six-lane expansion of NH-143 connecting Ranchi to Kolkata metropolitan periphery, spanning two states and eleven villages."
            },
            {
                "id": "PRJ-RL-01",
                "name": "East Coast Freight Rail Link",
                "type": "RAIL",
                "state_ids": ["JH", "OD"],
                "total_land_required_sqm": 3150000,
                "corridor": {
                    "type": "LineString",
                    "coordinates": [
                        [86.2, 22.8],
                        [86.4, 22.4],
                        [86.5, 21.9],
                        [85.9, 21.4],
                        [85.82, 20.9]
                    ]
                },
                "description": "Dedicated freight rail corridor linking the Jamshedpur industrial belt to the Mayurbhanj mineral belt in Odisha."
            }
        ]
        for p in projects_data:
            proj = db.query(Project).filter(Project.id == p["id"]).first()
            if not proj:
                db.add(Project(
                    id=p["id"],
                    project_code=p["id"],
                    name=p["name"],
                    type=p["type"],
                    state_ids=p["state_ids"],
                    total_land_required_sqm=p["total_land_required_sqm"],
                    corridor=p["corridor"],
                    description=p["description"]
                ))
        db.commit()

        print("Seeding Parcels and Sub-entities...")
        parcels_raw = [
            {
                "id": "NLAMS-JH-RAN-0001",
                "stateRefNo": "Khesra No. 214/2, Rakba 1.85 acre",
                "stateId": "JH",
                "districtId": "JH-RAN",
                "villageId": "V01",
                "projectId": "PRJ-HW-01",
                "ownerId": "OWN-1001",
                "ownerName": "Suresh Mahato",
                "normalizedAreaSqm": 7487,
                "sourceArea": 1.85,
                "sourceAreaUnit": "acre",
                "stage": "POSSESSION",
                "risk": "LOW",
                "riskReasons": [],
                "dataQualityFlags": [],
                "lat": 23.3441, "lng": 85.3096,
                "financials": {
                    "awardedAmount": 4210000,
                    "disbursedAmount": 4210000,
                    "paymentReferenceMasked": "UTR••••8821",
                    "settlementDate": "2025-07-01",
                    "valuationRatePerSqm": 562
                },
                "docs": [
                    {"id": "D1", "title": "Section 11 Public Notice", "type": "NOTICE", "uploadedAt": "2025-03-12", "ocrVerified": True},
                    {"id": "D2", "title": "Award Order No. 2025/RAN/0044", "type": "AWARD_ORDER", "uploadedAt": "2025-06-02", "ocrVerified": True},
                    {"id": "D3", "title": "Payment Receipt", "type": "PAYMENT_RECEIPT", "uploadedAt": "2025-07-01", "ocrVerified": True}
                ],
                "conflicts": [],
                "objections": []
            },
            {
                "id": "NLAMS-JH-RAN-0002",
                "stateRefNo": "Khesra No. 219/1, Rakba 0.92 acre",
                "stateId": "JH",
                "districtId": "JH-RAN",
                "villageId": "V02",
                "projectId": "PRJ-HW-01",
                "ownerId": "OWN-1002",
                "ownerName": "Devanti Devi",
                "normalizedAreaSqm": 3723,
                "sourceArea": 0.92,
                "sourceAreaUnit": "acre",
                "stage": "HEARING",
                "risk": "HIGH",
                "riskReasons": ["Contested ownership between two heirs", "Objection filed past hearing date twice rescheduled"],
                "dataQualityFlags": ["Area mismatch: source deed vs GIS survey (Δ4.2%)"],
                "lat": 23.41, "lng": 85.42,
                "financials": {"awardedAmount": 0, "disbursedAmount": 0, "paymentReferenceMasked": "—", "valuationRatePerSqm": 0},
                "docs": [
                    {"id": "D4", "title": "Section 11 Public Notice", "type": "NOTICE", "uploadedAt": "2025-03-25", "ocrVerified": True}
                ],
                "conflicts": [
                    {
                        "field": "Owner Name",
                        "sourceA": {"system": "Jharkhand Bhoomi Portal", "value": "Devanti Devi"},
                        "sourceB": {"system": "District Revenue Register", "value": "Devanti Devi W/O Late Ram Mahato"},
                        "resolved": False
                    }
                ],
                "objections": [
                    {
                        "id": "O1",
                        "filedBy": "Birsa Mahato (claimed co-heir)",
                        "filedAt": "2025-04-18",
                        "subject": "Ownership share dispute",
                        "description": "Claimant asserts a 50% ancestral share not reflected in current record of rights.",
                        "status": "IN_HEARING",
                        "slaDueDate": "2025-09-10"
                    }
                ]
            },
            {
                "id": "NLAMS-JH-EMB-0003",
                "stateRefNo": "Survey No. 88, Rakba 2.10 acre",
                "stateId": "JH",
                "districtId": "JH-EMB",
                "villageId": "V03",
                "projectId": "PRJ-RL-01",
                "ownerId": "OWN-1003",
                "ownerName": "Manoj Tudu",
                "normalizedAreaSqm": 8498,
                "sourceArea": 2.10,
                "sourceAreaUnit": "acre",
                "stage": "VALUATION",
                "risk": "MEDIUM",
                "riskReasons": ["Tribal land tenure classification requires statutory district committee consent"],
                "dataQualityFlags": [],
                "lat": 22.8, "lng": 86.2,
                "financials": {"awardedAmount": 4760000, "disbursedAmount": 0, "paymentReferenceMasked": "—", "valuationRatePerSqm": 560},
                "docs": [
                    {"id": "D5", "title": "Joint Verification Report", "type": "SURVEY_MAP", "uploadedAt": "2025-04-01", "ocrVerified": True}
                ],
                "conflicts": [],
                "objections": []
            },
            {
                "id": "NLAMS-WB-PUR-0005",
                "stateRefNo": "Plot No. 412, Area 1.45 acre",
                "stateId": "WB",
                "districtId": "WB-PUR",
                "villageId": "V05",
                "projectId": "PRJ-HW-01",
                "ownerId": "OWN-1005",
                "ownerName": "Ananda Sen",
                "normalizedAreaSqm": 5868,
                "sourceArea": 1.45,
                "sourceAreaUnit": "acre",
                "stage": "COMPENSATION",
                "risk": "LOW",
                "riskReasons": [],
                "dataQualityFlags": [],
                "lat": 23.1, "lng": 86.66,
                "financials": {"awardedAmount": 3810000, "disbursedAmount": 3810000, "paymentReferenceMasked": "UTR••••9011", "settlementDate": "2025-06-15", "valuationRatePerSqm": 650},
                "docs": [],
                "conflicts": [],
                "objections": []
            },
            {
                "id": "NLAMS-WB-HOW-0007",
                "stateRefNo": "RS Dag No. 892, 0.65 acre",
                "stateId": "WB",
                "districtId": "WB-HOW",
                "villageId": "V07",
                "projectId": "PRJ-HW-01",
                "ownerId": "OWN-1007",
                "ownerName": "Tapas Mondal",
                "normalizedAreaSqm": 2630,
                "sourceArea": 0.65,
                "sourceAreaUnit": "acre",
                "stage": "OBJECTION",
                "risk": "HIGH",
                "riskReasons": ["Commercial structure compensation claim 3x circle rate expectation"],
                "dataQualityFlags": [],
                "lat": 22.48, "lng": 88.1,
                "financials": {"awardedAmount": 0, "disbursedAmount": 0, "paymentReferenceMasked": "—", "valuationRatePerSqm": 0},
                "docs": [],
                "conflicts": [],
                "objections": [
                    {
                        "id": "O2",
                        "filedBy": "Tapas Mondal",
                        "filedAt": "2025-05-02",
                        "subject": "Structure Valuation Discrepancy",
                        "description": "Owner contests that 2-story brick warehouse structure was excluded in preliminary survey.",
                        "status": "OPEN",
                        "slaDueDate": "2025-08-30"
                    }
                ]
            }
        ]

        for p_data in parcels_raw:
            parcel = db.query(LandParcel).filter(LandParcel.id == p_data["id"]).first()
            if not parcel:
                geom = square(p_data["lat"], p_data["lng"], 0.006)
                parcel = LandParcel(
                    id=p_data["id"],
                    national_parcel_id=p_data["id"],
                    state_ref_no=p_data["stateRefNo"],
                    state_id=p_data["stateId"],
                    district_id=p_data["districtId"],
                    village_id=p_data["villageId"],
                    owner_id=p_data["ownerId"],
                    owner_name=p_data["ownerName"],
                    normalized_area_sqm=p_data["normalizedAreaSqm"],
                    source_area=p_data["sourceArea"],
                    source_area_unit=p_data["sourceAreaUnit"],
                    stage=p_data["stage"],
                    risk=p_data["risk"],
                    risk_reasons=p_data["riskReasons"],
                    data_quality_flags=p_data["dataQualityFlags"],
                    geometry=geom,
                    centroid=[p_data["lat"], p_data["lng"]],
                )
                db.add(parcel)
                db.flush()

                # Project Parcel association
                db.add(ProjectParcel(
                    project_id=p_data["projectId"],
                    parcel_id=parcel.id,
                    priority="HIGH",
                    criticality_score=85.0 if parcel.risk == "HIGH" else 25.0
                ))

                # Financials
                fin = p_data["financials"]
                db.add(FinancialRecord(
                    parcel_id=parcel.id,
                    awarded_amount=fin["awardedAmount"],
                    disbursed_amount=fin["disbursedAmount"],
                    payment_reference_masked=fin["paymentReferenceMasked"],
                    settlement_date=fin.get("settlementDate"),
                    valuation_rate_per_sqm=fin["valuationRatePerSqm"],
                    status="DISBURSED" if fin["disbursedAmount"] > 0 else "PENDING"
                ))

                # Timeline base
                db.add(StageEvent(
                    parcel_id=parcel.id,
                    stage="SURVEY",
                    date="2025-02-10",
                    actor="Field Survey Team",
                    note="Cadastral survey boundary plotted and verified",
                    immutable_hash="0x0001a1sur"
                ))
                if parcel.stage != "SURVEY":
                    db.add(StageEvent(
                        parcel_id=parcel.id,
                        stage=parcel.stage,
                        date="2025-04-15",
                        actor="District Acquisition Officer",
                        note=f"Advanced to {parcel.stage}",
                        immutable_hash="0x0002a1adv"
                    ))

                # Docs
                for d in p_data.get("docs", []):
                    db.add(DocumentRef(
                        id=d["id"],
                        parcel_id=parcel.id,
                        title=d["title"],
                        type=d["type"],
                        uploaded_at=d["uploadedAt"],
                        ocr_verified=d.get("ocrVerified", True)
                    ))

                # Objections
                for obj in p_data.get("objections", []):
                    db.add(Objection(
                        id=obj["id"],
                        parcel_id=parcel.id,
                        filed_by=obj["filedBy"],
                        filed_at=obj["filedAt"],
                        subject=obj["subject"],
                        description=obj["description"],
                        status=obj["status"],
                        sla_due_date=obj["slaDueDate"]
                    ))

                # Conflicts
                for c in p_data.get("conflicts", []):
                    db.add(DataConflict(
                        parcel_id=parcel.id,
                        field=c["field"],
                        source_a=c["sourceA"],
                        source_b=c["sourceB"],
                        resolved=c["resolved"]
                    ))

        db.commit()

        # -------------------------------------------------------------
        # SEED REHABILITATION & RESETTLEMENT (R&R) FAMILIES AND CASES
        # -------------------------------------------------------------
        print("Seeding Rehabilitation & Resettlement (R&R) Data...")
        rr_seed_families = [
            {
                "id": "FAM-JH-01",
                "family_head": "Suresh Mahato",
                "members_count": 5,
                "social_category": "OBC",
                "livelihood_type": "AGRICULTURE",
                "displacement_status": "NON_DISPLACED",
                "contact_masked": "+91 98*** **41",
                "parcel_id": "NLAMS-JH-RAN-0001",
                "project_id": "PRJ-HW-01",
                "case": {
                    "id": "RRC-2025-001",
                    "case_number": "R&R/JH/RAN/2025/084",
                    "eligibility_status": "ELIGIBLE",
                    "rehabilitation_status": "COMPLETED",
                    "resettlement_status": "NOT_APPLICABLE",
                    "total_assistance_amount": 550000.0,
                    "disbursed_amount": 550000.0,
                    "benefits_package": {
                        "rehabilitation_grant": "₹5,00,000 one-time lump sum annuity assist",
                        "subsistence_allowance": "₹36,000 (₹3,000/mo x 12 months)",
                        "cattle_shed_grant": "₹14,000 for livestock shelter",
                        "vocational_training": "1 Family member enrolled in NSDC Skill Center, Ranchi"
                    },
                    "remarks": "Rehabilitation entitlement fully disbursed into verified Aadhaar-linked Bank A/C."
                }
            },
            {
                "id": "FAM-JH-02",
                "family_head": "Devanti Devi",
                "members_count": 4,
                "social_category": "OBC",
                "livelihood_type": "AGRICULTURAL_LABOR",
                "displacement_status": "AT_RISK",
                "contact_masked": "+91 94*** **82",
                "parcel_id": "NLAMS-JH-RAN-0002",
                "project_id": "PRJ-HW-01",
                "case": {
                    "id": "RRC-2025-002",
                    "case_number": "R&R/JH/RAN/2025/091",
                    "eligibility_status": "UNDER_REVIEW",
                    "rehabilitation_status": "IN_PROGRESS",
                    "resettlement_status": "SITE_IDENTIFIED",
                    "total_assistance_amount": 720000.0,
                    "disbursed_amount": 150000.0,
                    "resettlement_colony_site": "Ormanjhi Model Resettlement Colony Sector-2",
                    "benefits_package": {
                        "house_entitlement": "1BHK Unit or ₹2.5L Construction Grant (Pradhan Mantri Awaas Yojana standard)",
                        "annuity_lump_sum": "₹5,00,000 Livelihood Rehabilitation Assistance",
                        "relocation_allowance": "₹50,000 transportation & transit"
                    },
                    "remarks": "Awaiting final revenue hearing to determine heir share percentage."
                }
            },
            {
                "id": "FAM-JH-03",
                "family_head": "Manoj Tudu",
                "members_count": 6,
                "social_category": "ST",
                "livelihood_type": "FOREST_PRODUCE_AGRICULTURE",
                "displacement_status": "DISPLACED",
                "contact_masked": "+91 97*** **19",
                "parcel_id": "NLAMS-JH-EMB-0003",
                "project_id": "PRJ-RL-01",
                "case": {
                    "id": "RRC-2025-003",
                    "case_number": "R&R/JH/EMB/2025/112",
                    "eligibility_status": "ELIGIBLE",
                    "rehabilitation_status": "ALLOTTED",
                    "resettlement_status": "HOUSE_CONSTRUCTED",
                    "total_assistance_amount": 950000.0,
                    "disbursed_amount": 600000.0,
                    "resettlement_colony_site": "Ghatshila Tribal Rehabilitation Enclave",
                    "benefits_package": {
                        "tribal_special_grant": "₹1,00,000 Scheduled Tribe statutory resettlement bonus",
                        "house_allotment": "Plot #14, Ghatshila Tribal Rehabilitation Enclave (Freehold)",
                        "annuity_lump_sum": "₹5,00,000 Livelihood package",
                        "subsistence_grant": "₹3,500/mo x 12 months"
                    },
                    "remarks": "Tribal Advisory Council approval granted. Resettlement house handover underway."
                }
            },
            {
                "id": "FAM-WB-04",
                "family_head": "Tapas Mondal",
                "members_count": 4,
                "social_category": "GEN",
                "livelihood_type": "COMMERCIAL_STORAGE",
                "displacement_status": "DISPLACED",
                "contact_masked": "+91 98*** **33",
                "parcel_id": "NLAMS-WB-HOW-0007",
                "project_id": "PRJ-HW-01",
                "case": {
                    "id": "RRC-2025-004",
                    "case_number": "R&R/WB/HOW/2025/044",
                    "eligibility_status": "ELIGIBLE",
                    "rehabilitation_status": "IN_PROGRESS",
                    "resettlement_status": "SITE_IDENTIFIED",
                    "total_assistance_amount": 650000.0,
                    "disbursed_amount": 100000.0,
                    "resettlement_colony_site": "Uluberia Commercial Relocation Hub",
                    "benefits_package": {
                        "commercial_shop_allotment": "Shop Booth #8, Uluberia Relocation Zone",
                        "machinery_shift_allowance": "₹75,000 for equipment relocation",
                        "rehabilitation_lump_sum": "₹5,00,000 one-time assistance"
                    },
                    "remarks": "Structure valuation hearing in progress."
                }
            }
        ]

        for fam_data in rr_seed_families:
            fam = db.query(AffectedFamily).filter(AffectedFamily.id == fam_data["id"]).first()
            if not fam:
                fam = AffectedFamily(
                    id=fam_data["id"],
                    family_head=fam_data["family_head"],
                    members_count=fam_data["members_count"],
                    social_category=fam_data["social_category"],
                    livelihood_type=fam_data["livelihood_type"],
                    displacement_status=fam_data["displacement_status"],
                    contact_masked=fam_data["contact_masked"],
                    parcel_id=fam_data.get("parcel_id"),
                    project_id=fam_data["project_id"]
                )
                db.add(fam)
                db.flush()

                c_data = fam_data["case"]
                db.add(RRCase(
                    id=c_data["id"],
                    family_id=fam.id,
                    case_number=c_data["case_number"],
                    eligibility_status=c_data["eligibility_status"],
                    rehabilitation_status=c_data["rehabilitation_status"],
                    resettlement_status=c_data["resettlement_status"],
                    total_assistance_amount=c_data["total_assistance_amount"],
                    disbursed_amount=c_data["disbursed_amount"],
                    resettlement_colony_site=c_data.get("resettlement_colony_site"),
                    benefits_package=c_data.get("benefits_package", {}),
                    remarks=c_data.get("remarks")
                ))

        db.commit()

        # Seed Source Systems
        print("Seeding Interoperability Adapters...")
        sources = [
            SourceSystem(id="JH-Jharbhoomi", code="JH_REV", name="Jharkhand Jharbhoomi Portal", state_code="JH", system_type="LAND_RECORD"),
            SourceSystem(id="MH-Mahabhulekh", code="MH_REV", name="Maharashtra Mahabhulekh 7/12", state_code="MH", system_type="LAND_RECORD"),
            SourceSystem(id="WB-Banglarbhumi", code="WB_REV", name="West Bengal Banglarbhumi", state_code="WB", system_type="LAND_RECORD"),
            SourceSystem(id="OD-Bhulekh", code="OD_REV", name="Odisha Bhulekh Land Records", state_code="OD", system_type="LAND_RECORD"),
        ]
        for s in sources:
            if not db.query(SourceSystem).filter(SourceSystem.id == s.id).first():
                db.add(s)
        db.commit()

        print("Database seeded successfully with all R&R records!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
