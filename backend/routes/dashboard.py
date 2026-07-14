from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db

from models import (
    DigitalTwin,
    DriftDetection,
    RiskAnalysis,
    Recommendation,
    BaselineControl,
    ChangeRequest,
    Project
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):

    total_projects = db.query(Project).count()

    total_twins = db.query(DigitalTwin).count()

    total_drifts = db.query(DriftDetection).count()

    pending_requests = db.query(ChangeRequest).filter(
        ChangeRequest.status == "Pending"
    ).count()

    average_risk = db.query(
        func.avg(RiskAnalysis.final_risk_score)
    ).scalar()

    if average_risk is None:
        average_risk = 0

    return {

        "Projects": total_projects,

        "Digital Twins": total_twins,

        "Detected Drifts": total_drifts,

        "Pending Requests": pending_requests,

        "Average Risk": round(float(average_risk),2)

    }

@router.get("/risk-trend")
def risk_trend(db: Session = Depends(get_db)):

    risks = db.query(
        RiskAnalysis.analysis_id,
        RiskAnalysis.final_risk_score,
        RiskAnalysis.created_at
    ).order_by(
        RiskAnalysis.created_at
    ).all()

    data = []

    for r in risks:

        data.append({

            "Analysis ID": r.analysis_id,

            "Risk Score": float(r.final_risk_score),

            "Time": r.created_at

        })

    return data

@router.get("/recent-drifts")
def recent_drifts(db: Session = Depends(get_db)):

    drifts = db.query(
        DriftDetection
    ).order_by(
        DriftDetection.detected_at.desc()
    ).limit(10).all()

    response = []

    for drift in drifts:

        response.append({

            "Drift ID": drift.drift_id,

            "Twin ID": drift.twin_id,

            "Control ID": drift.control_id,

            "Type": drift.drift_type,

            "Severity": drift.severity,

            "Detected At": drift.detected_at

        })

    return response


@router.get("/recommendations")
def recommendation_history(db: Session = Depends(get_db)):

    recommendations = db.query(
        Recommendation
    ).order_by(
        Recommendation.created_at.desc()
    ).limit(10).all()

    result = []

    for rec in recommendations:

        result.append({

            "Recommendation ID": rec.recommendation_id,

            "Twin ID": rec.twin_id,

            "Recommendation": rec.recommendation,

            "Predicted Risk": float(rec.predicted_risk),

            "Applied": rec.applied

        })

    return result


@router.get("/control-health")
def control_health(db: Session = Depends(get_db)):

    domains = db.query(

        BaselineControl.domain,

        func.count(BaselineControl.control_id)

    ).group_by(
        BaselineControl.domain
    ).all()

    health = []

    for domain, count in domains:

        health.append({

            "Domain": domain,

            "Controls": count

        })

    return health