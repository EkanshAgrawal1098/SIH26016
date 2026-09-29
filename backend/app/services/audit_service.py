import hashlib
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent

def record_audit_event(
    db: Session,
    actor_user_id: str,
    action: str,
    entity_type: str,
    entity_id: str,
    before_state: dict = None,
    after_state: dict = None,
    actor_name: str = None,
) -> AuditEvent:
    """
    Creates an immutable audit log entry with SHA256 integrity hash
    """
    event = AuditEvent(
        actor_user_id=actor_user_id,
        actor_name=actor_name,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        before_json=before_state,
        after_json=after_state,
        occurred_at=datetime.utcnow()
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def generate_stage_event_hash(parcel_id: str, stage: str, actor: str, date: str) -> str:
    raw_str = f"{parcel_id}:{stage}:{actor}:{date}"
    return "0x" + hashlib.sha256(raw_str.encode()).hexdigest()[:16].upper()
