from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import LoginRequest, LoginResponse
from services.audit_service import create_audit_log


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login", response_model=LoginResponse)
@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.employee_id == request.employee_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Employee ID not found"
        )

    # For Hackathon (Plain Password)
    if user.password_hash != request.password:
        raise HTTPException(
            status_code=401,
            detail="Incorrect Password"
        )

    # -----------------------------
    # Audit Log
    # -----------------------------
    create_audit_log(
        db=db,
        user_id=user.user_id,
        action="LOGIN",
        module_name="Authentication",
        description=f"{user.full_name} logged in"
    )

    return LoginResponse(
        user_id=user.user_id,
        full_name=user.full_name,
        role=user.role,
        department=user.department
    )