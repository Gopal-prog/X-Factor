import pandas as pd
from sqlalchemy.orm import Session
from models import RiskAnalysis
from datetime import datetime, timedelta

def predict_future_risk(twin_id: int, db: Session, days_ahead: int = 7) -> float:
    """
    Predicts the future risk score for a twin based on historical trend.
    This uses a basic linear trend/moving average approach for prototyping.
    """
    # Fetch historical risk scores for the twin
    history = db.query(RiskAnalysis).filter(RiskAnalysis.twin_id == twin_id).order_by(RiskAnalysis.created_at.asc()).all()
    
    if not history:
        return 0.0
        
    if len(history) < 2:
        return float(history[-1].final_risk_score)
        
    # Convert to pandas for simple time-series analysis
    data = []
    for record in history:
        data.append({
            "date": record.created_at,
            "risk": float(record.final_risk_score)
        })
        
    df = pd.DataFrame(data)
    
    # Simple linear slope calculation
    # (risk_n - risk_0) / n_days
    first_record = df.iloc[0]
    last_record = df.iloc[-1]
    
    time_diff = (last_record["date"] - first_record["date"]).days
    if time_diff == 0:
        time_diff = 1 # Avoid division by zero if all records are on the same day
        
    risk_diff = last_record["risk"] - first_record["risk"]
    daily_trend = risk_diff / time_diff
    
    # Predict future risk
    current_risk = last_record["risk"]
    predicted_risk = current_risk + (daily_trend * days_ahead)
    
    # Clamp between 0 and 100
    predicted_risk = max(0.0, min(100.0, predicted_risk))
    
    return round(predicted_risk, 2)
