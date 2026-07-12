from sqlalchemy.orm import Session

from models import (
    TwinControl,
    BaselineControl,
    DriftDetection
)


def detect_drift(twin_id: int, db: Session):

    # Get all controls of this twin
    twin_controls = db.query(TwinControl).filter(
        TwinControl.twin_id == twin_id
    ).all()

    detected_drifts = []

    for twin in twin_controls:

        baseline = db.query(BaselineControl).filter(
            BaselineControl.control_id == twin.control_id
        ).first()

        if baseline is None:
            continue

        # Compare baseline and twin
        if baseline.parameter_value != twin.new_value:

            drift = DriftDetection(
                twin_id=twin_id,
                control_id=twin.control_id,
                drift_type="Modified",
                severity=baseline.severity
            )

            db.add(drift)

            detected_drifts.append({
                "control_id": twin.control_id,
                "parameter": baseline.parameter_name,
                "baseline": baseline.parameter_value,
                "modified": twin.new_value,
                "severity": baseline.severity
            })

    db.commit()

    return detected_drifts