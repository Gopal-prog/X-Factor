from sqlalchemy.orm import Session
from models import AuditLog


def create_audit_log(
    db: Session,
    user_id: int,
    action: str,
    module_name: str,
    description: str,
    ip_address: str = "127.0.0.1"
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        module_name=module_name,
        description=description,
        ip_address=ip_address
    )

    db.add(log)
    db.commit()