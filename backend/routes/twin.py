from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from schemas import CreateTwinRequest

from services.twin_service import create_digital_twin

from schemas import UpdateTwinRequest
from services.twin_service import update_twin_control

from services.drift_service import detect_drift
from services.audit_service import create_audit_log

from services.twin_service import (
    create_digital_twin,
    update_twin_control,
    get_all_twins
)



router = APIRouter(
    prefix="/twin",
    tags=["Digital Twin"]
)


@router.get("/")
def get_twins(
    db: Session = Depends(get_db)
):

    return get_all_twins(db)


@router.get("/")
def get_twins(
    db: Session = Depends(get_db)
):

    return get_all_twins(db)



@router.post("/create")
def create_twin(
        request: CreateTwinRequest,
        db: Session = Depends(get_db)
):

    twin = create_digital_twin(
        request.project_id,
        request.engineer_id,
        db
    )

    create_audit_log(
        db=db,
        user_id=request.engineer_id,
        action="CREATE",
        module_name="Digital Twin",
        description=f"Created Digital Twin {twin.twin_id}"
    )

    return {
        "message": "Digital Twin Created Successfully",
        "twin_id": twin.twin_id
    }
    

@router.put("/update")
def update_twin(
    request: UpdateTwinRequest,
    db: Session = Depends(get_db)
):

    twin = update_twin_control(
        request.twin_id,
        request.control_id,
        request.new_value,
        db
    )

    if twin is None:
        return {
            "message": "Control Not Found"
        }

    create_audit_log(
    db=db,
    user_id=1,   # Temporary (replace with logged-in user later)
    action="UPDATE",
    module_name="Twin Controls",
    description=f"Updated Control {request.control_id} in Twin {request.twin_id}"
)

    return {
        "message": "Twin Updated Successfully"
    }
    
    
@router.post("/detect-drift/{twin_id}")
def run_drift_detection(
    twin_id: int,
    db: Session = Depends(get_db)
):

    drifts = detect_drift(
        twin_id,
        db
    )

    create_audit_log(
    db=db,
    user_id=1,
    action="DETECT",
    module_name="Drift Detection",
    description=f"Detected {len(drifts)} configuration drift(s) for Twin {twin_id}"
)

    return {
        "total_drifts": len(drifts),
        "drifts": drifts
    }