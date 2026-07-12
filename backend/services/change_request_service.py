from sqlalchemy.orm import Session

from models import (
    ChangeRequest,
    Project,
    DigitalTwin,
    User
)


def get_all_change_requests(
    db: Session,
    user_id: int,
    role: str
):

    if role == "Engineer":

        requests = (
            db.query(ChangeRequest)
            .filter(ChangeRequest.engineer_id == user_id)
            .order_by(ChangeRequest.request_id.desc())
            .all()
        )

    else:

        requests = (
            db.query(ChangeRequest)
            .order_by(ChangeRequest.request_id.desc())
            .all()
    )

    result = []

    for req in requests:

        project = db.query(Project).filter(
            Project.project_id == req.project_id
        ).first()

        twin = db.query(DigitalTwin).filter(
            DigitalTwin.twin_id == req.twin_id
        ).first()

        engineer = db.query(User).filter(
            User.user_id == req.engineer_id
        ).first()

        result.append({

            "request_id": req.request_id,

            "ticket_number": req.ticket_number,

            "project_name": project.project_name if project else "",

            "twin_id": req.twin_id,

            "twin_name": f"{project.project_name} Twin" if project else f"Twin {req.twin_id}",

            "engineer": engineer.full_name if engineer else "",

            "reason": req.reason,

            "expected_duration": req.expected_duration,

            "maintenance_window": req.maintenance_window,

            "status": req.status,

            "created_at": req.created_at

        })

    return result


def create_change_request(
    project_id: int,
    engineer_id: int,
    twin_id: int,
    reason: str,
    expected_duration: str,
    ticket_number: str,
    maintenance_window: bool,
    db: Session
):

    request = ChangeRequest(

        project_id=project_id,

        engineer_id=engineer_id,

        twin_id=twin_id,

        reason=reason,

        expected_duration=expected_duration,

        ticket_number=ticket_number,

        maintenance_window=maintenance_window,

        status="Pending"

    )

    db.add(request)

    db.commit()

    db.refresh(request)

    return request