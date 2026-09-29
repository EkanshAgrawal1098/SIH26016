from typing import Dict, Any, Tuple

# State specific field normalization dictionaries
STATE_FIELD_MAPS = {
    "JH-Jharbhoomi": {
        "parcel_ref_field": "khesra_no",
        "area_field": "rakba",
        "area_unit_field": "rakba_unit",
        "owner_field": "raiyat_name",
        "land_class_field": "kisam",
    },
    "MH-Mahabhulekh": {
        "parcel_ref_field": "survey_no",
        "area_field": "area_ha",
        "area_unit_field": "unit",
        "owner_field": "khatedar_name",
        "land_class_field": "dharana_prakar",
    },
    "UP-Bhulekh": {
        "parcel_ref_field": "gata_no",
        "area_field": "area_hectare",
        "area_unit_field": "unit",
        "owner_field": "kashtkar_name",
        "land_class_field": "shreni",
    }
}

def normalize_area_to_sqm(value: float, unit: str) -> float:
    unit_lower = unit.lower().strip()
    if "acre" in unit_lower:
        return value * 4046.86
    elif "hectare" in unit_lower or "ha" in unit_lower:
        return value * 10000.0
    elif "bigha" in unit_lower:
        return value * 2529.28 # Typical standard bigha
    elif "sqm" in unit_lower or "sq m" in unit_lower:
        return value
    elif "sqft" in unit_lower or "sq ft" in unit_lower:
        return value * 0.092903
    return value * 4046.86 # default to acre conversion

def adapt_state_record(source_system: str, record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms state-specific records into canonical National Parcel format
    """
    mapping = STATE_FIELD_MAPS.get(source_system, {
        "parcel_ref_field": "state_ref_no",
        "area_field": "area",
        "area_unit_field": "area_unit",
        "owner_field": "owner_name",
        "land_class_field": "land_classification",
    })

    # Extract state fields
    state_ref = (
        record.get(mapping["parcel_ref_field"]) or
        record.get("khesra_no") or
        record.get("survey_no") or
        record.get("gata_no") or
        record.get("state_ref_no") or
        f"Plot-{record.get('id', '00')}"
    )

    owner_name = (
        record.get(mapping["owner_field"]) or
        record.get("raiyat_name") or
        record.get("khatedar_name") or
        record.get("kashtkar_name") or
        record.get("owner_name") or
        "Citizen Landowner"
    )

    raw_area = float(
        record.get(mapping["area_field"]) or
        record.get("rakba") or
        record.get("area_ha") or
        record.get("area") or
        1.5
    )

    raw_unit = str(
        record.get(mapping["area_unit_field"]) or
        record.get("rakba_unit") or
        record.get("unit") or
        record.get("area_unit") or
        "Acre"
    )

    normalized_sqm = normalize_area_to_sqm(raw_area, raw_unit)

    return {
        "state_ref_no": str(state_ref),
        "owner_name": str(owner_name),
        "source_area": raw_area,
        "source_area_unit": raw_unit,
        "normalized_area_sqm": round(normalized_sqm, 2),
        "source_system": source_system,
        "source_record_id": str(record.get("id") or record.get("source_id") or state_ref),
        "geometry": record.get("geometry"),
    }
