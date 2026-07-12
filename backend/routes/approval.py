from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from services.approval_service import approve_request

router = APIRouter(
    prefix="/approval",
    tags=["Manager Approval"]
)


@router.post("/{request_id}")
def approve(
    request_id: int,
    manager_id: int,
    decision: str,
    comments: str,
    db: Session = Depends(get_db)
):

    return approve_request(
        request_id,
        manager_id,
        decision,
        comments,
        db
    )