from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.risk_service import calculate_risk

router = APIRouter(
    prefix="/risk",
    tags=["Risk Analysis"]
)


@router.post("/{twin_id}")
def calculate_risk_api(
    twin_id: int,
    db: Session = Depends(get_db)
):

    result = calculate_risk(
        twin_id,
        db
    )

    if result is None:

        return {
            "message": "Twin Not Found"
        }

    analysis = result["analysis"]

    return {

        "Twin ID": analysis.twin_id,

        "Risk Score": analysis.final_risk_score,

        "Risk Level": analysis.risk_level,

        "Security Risk": analysis.security_risk,

        "Attack Surface": analysis.attack_surface,

        "Business Criticality": analysis.business_criticality,

        "Compliance Score": analysis.compliance_score,

        "Compound Drift": analysis.compound_drift,

        "Anomaly Score": analysis.anomaly_score,

        "Mitigation Score": analysis.mitigation_score,

        "ML Prediction": result["ml_prediction"],

        "Isolation Forest": result["anomaly"]

    }