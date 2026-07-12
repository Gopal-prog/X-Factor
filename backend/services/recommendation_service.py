from sqlalchemy.orm import Session

from models import (
    Recommendation,
    DriftDetection,
    BaselineControl,
    RiskAnalysis
)


def generate_recommendation(twin_id: int, db: Session):

    drifts = db.query(DriftDetection).filter(
        DriftDetection.twin_id == twin_id
    ).all()

    recommendations = []

    for drift in drifts:

        control = db.query(BaselineControl).filter(
            BaselineControl.control_id == drift.control_id
        ).first()

        if not control:
            continue

        text = ""

        if control.parameter_name.lower().find("logging") != -1:
            text = "Enable Logging immediately."

        elif control.parameter_name.lower().find("encryption") != -1:
            text = "Restore AES256 Encryption."

        elif control.parameter_name.lower().find("ssh") != -1:
            text = "Restrict SSH access to Internal or VPN."

        elif control.parameter_name.lower().find("mfa") != -1:
            text = "Enable Multi-Factor Authentication."

        elif control.parameter_name.lower().find("firewall") != -1:
            text = "Review Firewall Rules."

        else:
            text = f"Restore {control.parameter_name} to baseline."

        recommendations.append(text)

    analysis = db.query(RiskAnalysis).filter(
        RiskAnalysis.twin_id == twin_id
    ).first()

    current_score = analysis.final_risk_score if analysis else 50

    predicted_score = max(current_score - (len(recommendations) * 10), 5)

    final_text = "\n".join(recommendations)

    recommendation = Recommendation(
        twin_id=twin_id,
        recommendation=final_text,
        predicted_risk=predicted_score,
        applied=False
    )

    db.add(recommendation)
    db.commit()

    return recommendation