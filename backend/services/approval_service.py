from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException
from models import (
    ManagerApproval,
    ChangeRequest,
    DigitalTwin,
    User
)


def approve_request(
        request_id,
        manager_id,
        decision,
        comments,
        db:Session
):

    request = db.query(ChangeRequest).filter(
        ChangeRequest.request_id==request_id
    ).first()

    if request is None:
        return {"message":"Request Not Found"}

    manager = db.query(User).filter(
        User.user_id == manager_id
    ).first()

    if manager is None:
        return {
            "message": "Manager Not Found"
        }

    if manager.role not in ["Administrator", "Security Manager"]:
        raise HTTPException(
            status_code=403,
            detail="Only Administrator or Security Manager can approve requests."
        )

    approval = ManagerApproval(

        request_id=request_id,

        manager_id=manager_id,

        decision=decision,

        comments=comments,

        approved_at=datetime.now()

    )

    db.add(approval)
    
    # Feature 17: Multi-level Approval Workflow
    final_status = decision
    if decision == "Approved":
        if manager.role == "Security Manager":
            final_status = "Pending Admin Approval"
        elif manager.role == "Administrator":
            final_status = "Approved"

    request.status = final_status

    twin = db.query(DigitalTwin).filter(DigitalTwin.twin_id == request.twin_id).first()
    if twin:
        if final_status in ["Approved", "Rejected"]:
            twin.status = final_status

    if final_status == "Rejected":
        # Feature 4: Automatic Baseline Restoration
        from models import DriftDetection, TwinControl, BaselineControl
        from services.risk_service import calculate_risk
        
        # If rejected, revert the unauthorized changes back to the secure baseline
        drifts = db.query(DriftDetection).filter(DriftDetection.twin_id == twin.twin_id).all()
        for drift in drifts:
            twin_control = db.query(TwinControl).filter(
                TwinControl.twin_id == twin.twin_id,
                TwinControl.control_id == drift.control_id
            ).first()
            baseline = db.query(BaselineControl).filter(
                BaselineControl.control_id == drift.control_id
            ).first()
            
            if twin_control and baseline:
                # Revert twin control back to baseline parameter value
                twin_control.new_value = baseline.parameter_value
                
            # Remove drift record since baseline is restored
            db.delete(drift)
            
        db.commit()
        calculate_risk(twin_id=twin.twin_id, db=db)

    elif final_status == "Approved" and manager.role == "Administrator":
        # If approved, check the current risk score before authorizing changes to the baseline.
        from models import DriftDetection, TwinControl, BaselineControl
        from services.risk_service import calculate_risk

        # Evaluate current risk with the existing drifts
        risk_result = calculate_risk(twin_id=twin.twin_id, db=db)
        current_risk = risk_result["analysis"].final_risk_score if risk_result else 0

        if current_risk < 30:
            drifts = db.query(DriftDetection).filter(DriftDetection.twin_id == twin.twin_id).all()
            for drift in drifts:
                twin_control = db.query(TwinControl).filter(
                    TwinControl.twin_id == twin.twin_id,
                    TwinControl.control_id == drift.control_id
                ).first()
                baseline = db.query(BaselineControl).filter(
                    BaselineControl.control_id == drift.control_id
                ).first()
                
                if twin_control and baseline:
                    # The change is authorized and safe, so we update the baseline to the new value
                    baseline.parameter_value = twin_control.new_value
                    
                # Remove drift record since it is now safely authorized
                db.delete(drift)
                
            db.commit()
            calculate_risk(twin_id=twin.twin_id, db=db)
        else:
            # If risk >= 70, we do NOT change the baseline or clear the drift yet. 
            # The drift stays until the risk score is brought under the permitted limit.
            db.commit()

    else:
        db.commit()

    return {
        "message": "Manager Decision Saved",
        "Decision": decision
    }