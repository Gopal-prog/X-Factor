from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import BaselineControl

router = APIRouter(
    prefix="/baseline",
    tags=["Baseline Controls"]
)

@router.get("/{project_id}")
def get_baseline(project_id: int, db: Session = Depends(get_db)):

    controls = db.query(BaselineControl).filter(
        BaselineControl.project_id == project_id
    ).all()

    result = []

    for control in controls:
        result.append({
            "control_id": control.control_id,
            "domain": control.domain,
            "system_name": control.system_name,
            "control_name": control.control_name,
            "parameter_name": control.parameter_name,
            "parameter_value": control.parameter_value,
            "severity": control.severity
        })

    return result