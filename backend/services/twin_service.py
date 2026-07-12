from sqlalchemy.orm import Session

from models import DigitalTwin
from models import BaselineControl
from models import TwinControl
from models import DigitalTwin

from sqlalchemy.orm import Session
from models import DigitalTwin, Project

def get_all_twins(db: Session):

    twins = db.query(DigitalTwin).all()

    result = []

    for twin in twins:

        project = db.query(Project).filter(
            Project.project_id == twin.project_id
        ).first()

        result.append({

            "id": twin.twin_id,

            "project_id": twin.project_id,

            "name": f"{project.project_name} Twin" if project else f"Twin {twin.twin_id}",

            "status": twin.status,

            "created_at": twin.created_at

        })

    return result



def create_digital_twin(project_id: int, engineer_id: int, db: Session):

    # Step 1
    twin = DigitalTwin(
        project_id=project_id,
        created_by=engineer_id,
        status="Running",
        risk_score_before=0,
        risk_score_after=0
    )

    db.add(twin)
    db.commit()
    db.refresh(twin)

    # Step 2
    controls = db.query(BaselineControl).filter(
        BaselineControl.project_id == project_id
    ).all()

    # Step 3
    for control in controls:

        twin_control = TwinControl(
            twin_id=twin.twin_id,
            control_id=control.control_id,
            old_value=control.parameter_value,
            new_value=control.parameter_value
        )

        db.add(twin_control)

    db.commit()

    return twin

def update_twin_control(
    twin_id: int,
    control_id: int,
    new_value: str,
    db: Session
):

    twin_control = db.query(TwinControl).filter(
        TwinControl.twin_id == twin_id,
        TwinControl.control_id == control_id
    ).first()

    if not twin_control:
        return None

    twin_control.new_value = new_value

    db.commit()
    db.refresh(twin_control)

    return twin_control