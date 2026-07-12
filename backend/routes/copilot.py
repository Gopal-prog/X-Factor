from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from schemas import ChatRequest, ChatResponse

from services.copilot_service import ask_copilot

router = APIRouter(
    prefix="/copilot",
    tags=["AI Security Copilot"]
)


@router.post("/chat", response_model=ChatResponse)
def copilot_chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):

    answer = ask_copilot(
        user_id=request.user_id,
        twin_id=request.twin_id,
        question=request.question,
        db=db
    )

    return ChatResponse(
        answer=answer
    )