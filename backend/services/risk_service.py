from sqlalchemy.orm import Session

from models import (
    DriftDetection,
    DigitalTwin,
    RiskAnalysis,
    BaselineControl,
    Project,
    ChangeRequest,
    User
)

from ml.predict import predict_from_database


# -------------------------------------------------------
# Severity Weights
# -------------------------------------------------------

SEVERITY_WEIGHT = {
    "Low": 10,
    "Medium": 25,
    "High": 45,
    "Critical": 70
}


# -------------------------------------------------------
# Main Risk Function
# -------------------------------------------------------

def calculate_risk(twin_id: int, db: Session):

    # -----------------------------------------
    # Get Twin
    # -----------------------------------------

    twin = db.query(DigitalTwin).filter(
        DigitalTwin.twin_id == twin_id
    ).first()

    if twin is None:
        return None

    # -----------------------------------------
    # Get Project
    # -----------------------------------------

    project = db.query(Project).filter(
        Project.project_id == twin.project_id
    ).first()

    if project is None:
        return None

    # -----------------------------------------
    # Get all detected drifts
    # -----------------------------------------

    drifts = db.query(DriftDetection).filter(
        DriftDetection.twin_id == twin_id
    ).all()

    # -----------------------------------------
    # Initial Scores
    # -----------------------------------------

    security_risk = 0
    attack_surface = 0
    compliance_score = 0
    compound_drift = 0
    mitigation_score = 10
    anomaly_score = 0

    # -----------------------------------------
    # Calculate Rule Based Scores
    # -----------------------------------------

    for drift in drifts:

        weight = SEVERITY_WEIGHT.get(
            drift.severity,
            0
        )

        security_risk += weight

        attack_surface += weight * 0.6

        compliance_score += weight * 0.4

    # -----------------------------------------
    # Business Criticality
    # -----------------------------------------

    if project.environment == "Production":

        business_criticality = 100

    elif project.environment == "Staging":

        business_criticality = 70

    else:

        business_criticality = 40

    # -----------------------------------------
    # Compound Drift
    # -----------------------------------------

    if len(drifts) >= 3:

        compound_drift = 40

    # -----------------------------------------
    # Final Rule Score
    # -----------------------------------------

    final_score = (

        security_risk * 0.30 +

        attack_surface * 0.20 +

        business_criticality * 0.15 +

        compliance_score * 0.15 +

        compound_drift * 0.10 +

        anomaly_score * 0.10 -

        mitigation_score

    )

    final_score = max(
        0,
        min(
            round(final_score, 2),
            100
        )
    )

    # -----------------------------------------
    # Risk Level
    # -----------------------------------------

    if final_score >= 80:

        risk_level = "Critical"

    elif final_score >= 60:

        risk_level = "High"

    elif final_score >= 30:

        risk_level = "Medium"

    else:

        risk_level = "Low"

    # -----------------------------------------
    # AI Prediction Variables
    # -----------------------------------------

    overall_prediction = "Safe"

    overall_anomaly = "Normal"

    ml_predictions = []
    anomaly_predictions = []

    # -------------------------------------------------------
    # Evaluate Every Drift using AI
    # -------------------------------------------------------

    for drift in drifts:

        baseline = db.query(BaselineControl).filter(
            BaselineControl.control_id == drift.control_id
        ).first()

        if baseline is None:
            continue

        change_request = db.query(ChangeRequest).filter(
            ChangeRequest.twin_id == twin_id
        ).first()

        approved = 0
        maintenance = 0
        actor = "Engineer"

        if change_request:

            if change_request.status == "Approved":
                approved = 1

            maintenance = int(change_request.maintenance_window)

            engineer = db.query(User).filter(
                User.user_id == change_request.engineer_id
            ).first()

            if engineer:
                actor = engineer.role

        prediction, anomaly = predict_from_database(

            domain=baseline.domain,

            parameter=baseline.parameter_name,

            severity=drift.severity,

            approved=approved,

            maintenance_window=maintenance,

            actor=actor,

            environment=project.environment,

            drift=1,

            risk_score=float(final_score)

        )

        ml_predictions.append(prediction)

        anomaly_predictions.append(anomaly)

    # -------------------------------------------------------
    # Combine AI Results
    # -------------------------------------------------------

    if "Risky" in ml_predictions:

        overall_prediction = "Risky"

    if "Anomaly" in anomaly_predictions:

        overall_anomaly = "Anomaly"

        anomaly_score = 30

        final_score = min(
            round(final_score + anomaly_score, 2),
            100
        )

        if final_score >= 80:
            risk_level = "Critical"

        elif final_score >= 60:
            risk_level = "High"

        elif final_score >= 30:
            risk_level = "Medium"

        else:
            risk_level = "Low"

    # -------------------------------------------------------
    # Store Risk Analysis
    # -------------------------------------------------------

    analysis = RiskAnalysis(

        twin_id=twin_id,

        security_risk=security_risk,

        attack_surface=attack_surface,

        business_criticality=business_criticality,

        compliance_score=compliance_score,

        compound_drift=compound_drift,

        anomaly_score=anomaly_score,

        mitigation_score=mitigation_score,

        final_risk_score=final_score,

        risk_level=risk_level

    )

    db.add(analysis)

    db.commit()

    db.refresh(analysis)
    # -------------------------------------------------------
    # Return Final Response
    # -------------------------------------------------------

    return {

        "analysis": analysis,

        "ml_prediction": overall_prediction,

        "anomaly": overall_anomaly

    }