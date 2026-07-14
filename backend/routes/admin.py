from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import (
    User, DigitalTwin, TwinControl, DriftDetection,
    RiskAnalysis, ChangeRequest, AttackGraph, Recommendation,
    ManagerApproval, Deployment
)
from schemas import AddEmployeeRequest
from services.audit_service import create_audit_log

router = APIRouter(
    prefix="/admin",
    tags=["Administration"]
)

@router.post("/add-employee")
def add_employee(request: AddEmployeeRequest, admin_id: int, db: Session = Depends(get_db)):
    admin_user = db.query(User).filter(User.user_id == admin_id).first()
    if not admin_user or admin_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Only Administrators can add employees.")
        
    existing_user = db.query(User).filter(User.employee_id == request.employee_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Employee ID already exists.")
        
    new_user = User(
        employee_id=request.employee_id,
        full_name=request.full_name,
        email=request.email,
        password_hash=request.password,
        department=request.department,
        role=request.role
    )
    
    db.add(new_user)
    
    create_audit_log(
        db=db,
        user_id=admin_user.user_id,
        action="CREATE_USER",
        module_name="Administration",
        description=f"Created new employee: {request.full_name} ({request.role})"
    )
    
    db.commit()
    return {"message": "Employee added successfully"}

@router.post("/clear-system")
def clear_system(admin_id: int, db: Session = Depends(get_db)):
    admin_user = db.query(User).filter(User.user_id == admin_id).first()
    if not admin_user or admin_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Only Administrators can clear system data.")
        
    try:
        # Delete dependent tables first
        db.query(DriftDetection).delete()
        db.query(RiskAnalysis).delete()
        db.query(ManagerApproval).delete()
        db.query(Deployment).delete()
        db.query(ChangeRequest).delete()
        db.query(AttackGraph).delete()
        db.query(Recommendation).delete()
        db.query(TwinControl).delete()
        
        # Finally delete twins
        twins_deleted = db.query(DigitalTwin).delete()
        
        # Add Audit log BEFORE commit to preserve it for ML Training
        create_audit_log(
            db=db,
            user_id=admin_user.user_id,
            action="SYSTEM_WIPE",
            module_name="Administration",
            description=f"Administrator wiped the entire Digital Twin system (cleared {twins_deleted} twins). ML logs preserved."
        )
        
        db.commit()
        return {"message": "System data cleared successfully. Audit logs preserved."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to clear system data: {str(e)}")
