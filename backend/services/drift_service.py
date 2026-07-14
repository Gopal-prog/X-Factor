from sqlalchemy.orm import Session

from models import (
    TwinControl,
    BaselineControl,
    DriftDetection,
    DigitalTwin
)


def detect_drift(twin_id: int, db: Session):

    # Clear existing drift records for this twin to prevent duplicates from multiple scans
    db.query(DriftDetection).filter(DriftDetection.twin_id == twin_id).delete()

    # Get all controls of this twin
    twin_controls = db.query(TwinControl).filter(
        TwinControl.twin_id == twin_id
    ).all()

    detected_drifts = []
    
    # We need a user context for audit logs, but since this might run in a background task, 
    # we can use the twin's creator or a system ID.
    twin_record = db.query(DigitalTwin).filter(DigitalTwin.twin_id == twin_id).first()
    system_user_id = twin_record.created_by if twin_record else None

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
            
            # Feature 10: Drift Timeline - Record to Audit Log for historical tracking
            from models import AuditLog
            audit_entry = AuditLog(
                user_id=system_user_id,
                action="Drift Detected",
                module_name="DriftService",
                description=f"{baseline.domain} {baseline.control_name} modified from {baseline.parameter_value} to {twin.new_value}",
                ip_address="system"
            )
            db.add(audit_entry)
            
            # Feature 7: Enterprise Notifications
            if baseline.severity == "Critical":
                from services.notification_service import send_notification
                send_notification(
                    channels=["Email", "Teams", "Slack", "SMS"],
                    subject="Critical Drift Detected",
                    message=f"Critical Drift Detected in Twin {twin_id}.\n{baseline.domain} {baseline.control_name} modified.\nPlease review immediately."
                )

            detected_drifts.append({
                "control_id": twin.control_id,
                "parameter": baseline.parameter_name,
                "baseline": baseline.parameter_value,
                "modified": twin.new_value,
                "severity": baseline.severity
            })

    db.commit()

    return detected_drifts