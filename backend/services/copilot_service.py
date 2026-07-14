from sqlalchemy.orm import Session
from models import ChatbotLog, DigitalTwin
from services.rag_service import generate_rag_response

def ask_copilot(
    user_id: int,
    twin_id: int,
    question: str,
    db: Session
):
    # Validate the twin exists
    twin = db.query(DigitalTwin).filter(
        DigitalTwin.twin_id == twin_id
    ).first()

    if twin is None:
        answer = "Digital Twin not found."
    else:
        # Use the RAG service to generate a response
        answer = generate_rag_response(question, twin_id, db)

    # Store Chat in DB
    chat = ChatbotLog(
        user_id=user_id,
        question=question,
        response=answer
    )
    db.add(chat)
    db.commit()

    return answer