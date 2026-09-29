from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, require_auth, get_current_user_token
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    mode = req.mode or "official"
    
    if mode == "official":
        # Check user by username or role
        user = None
        if req.username:
            user = db.query(User).filter(User.username == req.username).first()
        elif req.role:
            user = db.query(User).filter(User.role == req.role, User.user_mode == "official").first()
            
        if not user:
            # Fallback/Auto-provision demo official user
            user = db.query(User).filter(User.user_mode == "official").first()
            if not user:
                user = User(
                    username="rajesh.kumar",
                    full_name="Rajesh Kumar, IAS",
                    role=req.role or "DISTRICT_OFFICER",
                    user_mode="official",
                    jurisdiction="Jharkhand > Ranchi",
                    avatar_initials="RK",
                    password_hash="demo_password"
                )
                db.add(user)
                db.commit()
                db.refresh(user)

        user_data = {
            "mode": "official",
            "id": user.id,
            "name": user.full_name,
            "role": user.role,
            "jurisdiction": user.jurisdiction or "Jharkhand > Ranchi",
            "avatarInitials": user.avatar_initials or "RK"
        }
        
        token = create_access_token(
            subject=user.id,
            role=user.role,
            mode="official",
            extra_data=user_data
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_data
        )

    else:
        # Landowner Login
        user = None
        if req.owner_ref_id:
            user = db.query(User).filter(User.owner_ref_id == req.owner_ref_id).first()
        elif req.phone:
            user = db.query(User).filter(User.phone_masked.like(f"%{req.phone[-4:]}%")).first()

        if not user:
            user = db.query(User).filter(User.user_mode == "landowner").first()
            if not user:
                user = User(
                    username="suresh.mahto",
                    full_name="Suresh Mahto",
                    role="CITIZEN",
                    user_mode="landowner",
                    owner_ref_id="JH-RAN-OWN-042",
                    phone_masked="+91 98*** **412",
                    password_hash="demo_password"
                )
                db.add(user)
                db.commit()
                db.refresh(user)

        user_data = {
            "mode": "landowner",
            "id": user.id,
            "name": user.full_name,
            "ownerRefId": user.owner_ref_id or "JH-RAN-OWN-042",
            "phoneMasked": user.phone_masked or "+91 98*** **412",
            "parcelIds": ["IN-JH-RAN-0012", "IN-JH-RAN-0014"]
        }

        token = create_access_token(
            subject=user.id,
            role="CITIZEN",
            mode="landowner",
            extra_data=user_data
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_data
        )

@router.get("/me")
def get_current_user(token_data: dict = Depends(require_auth)):
    return token_data
