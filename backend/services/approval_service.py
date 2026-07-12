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

    request.status=decision

    twin=db.query(DigitalTwin).filter(
        DigitalTwin.twin_id==request.twin_id
    ).first()

    if twin:
        twin.status=decision

    db.commit()

    return {

        "message":"Manager Decision Saved",

        "Decision":decision
    }