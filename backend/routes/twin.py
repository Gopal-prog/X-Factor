from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from schemas import CreateTwinRequest, BulkUpdateTwinRequest

from services.twin_service import create_digital_twin

from schemas import UpdateTwinRequest
from services.twin_service import update_twin_control

from services.drift_service import detect_drift
from services.risk_service import calculate_risk
from services.change_request_service import create_change_request
from services.audit_service import create_audit_log

from services.twin_service import (
    create_digital_twin,
    update_twin_control,
    bulk_update_twin_controls,
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


@router.get("/{twin_id}/controls")
def get_twin_controls(
    twin_id: int,
    db: Session = Depends(get_db)
):
    from models import TwinControl, BaselineControl
    
    controls = db.query(TwinControl, BaselineControl).join(
        BaselineControl, TwinControl.control_id == BaselineControl.control_id
    ).filter(TwinControl.twin_id == twin_id).all()

    result = []
    for tc, bc in controls:
        result.append({
            "control_id": tc.control_id,
            "domain": bc.domain,
            "system_name": bc.system_name,
            "control_name": bc.control_name,
            "parameter_name": bc.parameter_name,
            "parameter_value": tc.new_value,  # Important: Use the Twin's current value
            "severity": bc.severity
        })
    return result



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

@router.post("/reset/{twin_id}")
def reset_twin(
    twin_id: int,
    db: Session = Depends(get_db)
):
    from services.twin_service import reset_twin_to_baseline
    twin = reset_twin_to_baseline(twin_id, db)
    if not twin:
        return {"message": "Twin not found"}
        
    create_audit_log(
        db=db,
        user_id=1,
        action="RESET",
        module_name="Digital Twin",
        description=f"Reset Twin {twin_id} to baseline controls."
    )
    
    
    return {"message": "Twin reset to baseline successfully"}

@router.post("/bulk-update")
def bulk_update_twin(
    request: BulkUpdateTwinRequest,
    db: Session = Depends(get_db)
):
    twin = bulk_update_twin_controls(
        request.twin_id,
        request.updates,
        db
    )

    if twin is None:
        return {"message": "Twin Not Found"}

    # Automatically detect drifts
    drifts = detect_drift(twin.twin_id, db)
    
    # Calculate risk automatically
    if len(drifts) > 0:
        calculate_risk(twin.twin_id, db)
        
        # Create an automatic change request
        create_change_request(
            project_id=twin.project_id,
            engineer_id=request.engineer_id,
            twin_id=twin.twin_id,
            reason="Automated Change Request from Bulk Update",
            expected_duration="1 hour",
            ticket_number="AUTO-" + str(twin.twin_id) + "-" + str(len(drifts)),
            maintenance_window=False,
            db=db
        )
        
        
        # Change status
        twin.status = "Running"
        db.commit()

    create_audit_log(
        db=db,
        user_id=request.engineer_id,
        action="UPDATE",
        module_name="Twin Controls",
        description=f"Bulk updated {len(request.updates)} controls in Twin {request.twin_id}"
    )

    return {
        "message": "Bulk Update Successful",
        "drifts_detected": len(drifts),
        "drifts": drifts
    }