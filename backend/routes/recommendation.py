from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from services.recommendation_service import generate_recommendation

router = APIRouter(
    prefix="/recommendation",
    tags=["AI Recommendation"]
)


@router.post("/{twin_id}")
def recommend(
        twin_id: int,
        db: Session = Depends(get_db)
):

    rec = generate_recommendation(
        twin_id,
        db
    )

    return {
        "Recommendation": rec.recommendation,
        "Predicted Risk": rec.predicted_risk
    }