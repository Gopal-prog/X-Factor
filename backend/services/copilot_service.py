from sqlalchemy.orm import Session

from models import (
    ChatbotLog,
    RiskAnalysis,
    DriftDetection,
    Recommendation,
    DigitalTwin,
    BaselineControl
)

def ask_copilot(
    user_id: int,
    twin_id: int,
    question: str,
    db: Session
):
    q = question.lower()

    answer = "Sorry, I couldn't understand your question."
    twin = db.query(DigitalTwin).filter(
        DigitalTwin.twin_id == twin_id,
        DigitalTwin.created_by == user_id
    ).first()

    if twin is None:

        answer = "Digital Twin not found."

        chat = ChatbotLog(
            user_id=user_id,
            question=question,
            response=answer
        )

        db.add(chat)
        db.commit()

        return answer
    # -----------------------------------
    # Find Latest Twin of Current User
    # -----------------------------------

    
    # -------------------------------
    # Risk
    # -------------------------------

# -------------------------------
# Risk Explanation
# -------------------------------

    if any(word in q for word in [
        "risk",
        "secure",
        "security",
        "vulnerable",
        "threat"
    ]):

        risk = db.query(RiskAnalysis).filter(
            RiskAnalysis.twin_id == twin_id
        ).order_by(
            RiskAnalysis.created_at.desc()
        ).first()

        if risk is None:

            answer = "Risk analysis has not been performed."

        else:

            drifts = db.query(DriftDetection).filter(
                DriftDetection.twin_id == twin_id
            ).all()

            explanation = []

            if len(drifts) == 0:

                explanation.append("No configuration drift detected.")

            else:

                explanation.append("Reasons for current risk:")

                for drift in drifts:

                    control = db.query(BaselineControl).filter(
                        BaselineControl.control_id == drift.control_id
                    ).first()

                    if control:

                        explanation.append(
                            f"• {control.domain} → "
                            f"{control.control_name} "
                            f"({drift.severity})"
                        )

            rec = db.query(Recommendation).filter(
                Recommendation.twin_id == twin_id
            ).order_by(
                Recommendation.created_at.desc()
            ).first()

            recommendation = ""

            if rec:

                recommendation = (
                    f"\n\nRecommended Action:\n"
                    f"{rec.recommendation}"
                )

            answer = (

                f"Risk Score : {risk.final_risk_score}\n"

                f"Risk Level : {risk.risk_level}\n\n"

                + "\n".join(explanation)

                + recommendation

            )
        
    # -------------------------------
    # Drift
    # -------------------------------
    elif any(word in q for word in [
        "drift",
        "change",
        "modified",
        "configuration"
    ]):

        drifts = db.query(
            DriftDetection
        ).filter(
            DriftDetection.twin_id == twin_id
        ).all()

        if len(drifts) == 0:

            answer = "No drift detected."

        else:

            lines = ["Detected Configuration Drift:\n"]

            for drift in drifts:

                control = db.query(
                    BaselineControl
                ).filter(
                    BaselineControl.control_id == drift.control_id
                ).first()

                if control:

                    lines.append(

                        f"• {control.domain}"

                        f"\n  Control : {control.control_name}"

                        f"\n  Parameter : {control.parameter_name}"

                        f"\n  Drift : {drift.drift_type}"

                        f"\n  Severity : {drift.severity}\n"

                    )

            answer = "\n".join(lines)

    # -------------------------------
    # Recommendation
    # -------------------------------
    elif any(word in q for word in [
        "recommend",
        "suggestion",
        "recommendation",
        "suggest"
    ]):

        rec = db.query(
            Recommendation
        ).filter(
            Recommendation.twin_id == twin_id
        ).order_by(
            Recommendation.created_at.desc()
        ).first()

        risk = db.query(
            RiskAnalysis
        ).filter(
            RiskAnalysis.twin_id == twin_id
        ).order_by(
            RiskAnalysis.created_at.desc()
        ).first()

        if rec:

            answer = (

                "AI Recommendation\n\n"

                f"{rec.recommendation}\n\n"

                f"Current Risk : {risk.final_risk_score}"

            )

        else:

            answer = "No recommendation available."

    # -------------------------------
    # Attack Graph
    # -------------------------------

    elif "attack" in q:

        drifts = db.query(
            DriftDetection
        ).filter(
            DriftDetection.twin_id == twin_id
        ).all()

        nodes = []

        for drift in drifts:

            control = db.query(
                BaselineControl
            ).filter(
                BaselineControl.control_id == drift.control_id
            ).first()

            if control:

                nodes.append(
                    f"{control.domain} ({drift.severity})"
                )

        if len(nodes) == 0:

            answer = "No vulnerable attack path detected."

        else:

            answer = (

                "Current vulnerable nodes:\n\n"

                + "\n".join(nodes)

                + "\n\nAttack Path\n\n"

                "Internet\n"

                "↓\n"

                "Firewall\n"

                "↓\n"

                "Cloud\n"

                "↓\n"

                "Identity\n"

                "↓\n"

                "Database\n"

                "↓\n"

                "Sensitive Data"

            )
    # -------------------------------
    # Approval
    # -------------------------------

    elif "approval" in q:

        answer = (
            "Manager Approval is required before deployment."
        )

    # -------------------------------
    # Dashboard
    # -------------------------------

    elif "dashboard" in q:

        answer = (
            "Dashboard displays project statistics, "
            "digital twins, recent drifts, "
            "risk trends and AI recommendations."
        )

    # -------------------------------
    # Store Chat
    # -------------------------------

    chat = ChatbotLog(

        user_id=user_id,

        question=question,

        response=answer

    )

    db.add(chat)

    db.commit()

    return answer