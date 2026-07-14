from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import User
from ml.train import retrain_models
from pydantic import BaseModel

router = APIRouter(
    prefix="/ml-admin",
    tags=["Machine Learning Administration"]
)

class MLRetrainResponse(BaseModel):
    isolation_forest_status: str
    random_forest_status: str
    accuracy: float
    training_samples: int
    last_trained: str
    message: str = ""

@router.post("/retrain", response_model=MLRetrainResponse)
def trigger_retrain(
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    # Verify the user is an Administrator
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user or user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Only Administrators can retrain the ML models.")

    # Run synchronously so we can return the actual trained metrics.
    # Axios timeout has been increased to 10 minutes to prevent timeouts.
    metrics = retrain_models()
    
    # We must ensure the returned dictionary has a 'message' key to match the schema
    metrics["message"] = "Retraining completed successfully."
    
    return metrics

@router.get("/stats", response_model=MLRetrainResponse)
def get_ml_stats(
    db: Session = Depends(get_db)
):
    # In a real system, these would be fetched from a DB table or config file 
    # where the last training metrics are persisted.
    # For now, return mock recent stats.
    return {
        "isolation_forest_status": "Active",
        "random_forest_status": "Active",
        "accuracy": 97.8,
        "training_samples": 12540,
        "last_trained": "12 Jul 2026"
    }
