from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from services.change_request_service import (
    create_change_request,
    get_all_change_requests
)

router = APIRouter(
    prefix="/change-request",
    tags=["Change Requests"]
)


# -------------------------------
# Get All Change Requests
# -------------------------------
@router.get("/")
def get_change_requests(
    user_id: int,
    role: str,
    db: Session = Depends(get_db)
):

    return get_all_change_requests(
        db,
        user_id,
        role
    )

# -------------------------------
# Create Change Request
# -------------------------------
@router.post("/")
def create_request(
    project_id: int,
    engineer_id: int,
    twin_id: int,
    reason: str,
    expected_duration: str,
    ticket_number: str,
    maintenance_window: bool,
    db: Session = Depends(get_db)
):

    request = create_change_request(
        project_id,
        engineer_id,
        twin_id,
        reason,
        expected_duration,
        ticket_number,
        maintenance_window,
        db
    )

    return {
        "message": "Change Request Created",
        "request_id": request.request_id
    }