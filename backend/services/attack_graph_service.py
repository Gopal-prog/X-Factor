from sqlalchemy.orm import Session

from models import (
    DigitalTwin,
    DriftDetection,
    BaselineControl
)


def build_attack_graph(twin_id: int, db: Session):

    twin = db.query(DigitalTwin).filter(
        DigitalTwin.twin_id == twin_id
    ).first()

    if twin is None:
        return None

    # ---------------------------------------------------
    # Enterprise Architecture (Always Visible)
    # ---------------------------------------------------

    nodes = [

        {
            "id": "Internet",
            "label": "Internet",
            "status": "Safe"
        },

        {
            "id": "Firewall",
            "label": "Firewall",
            "status": "Safe"
        },

        {
            "id": "AWS",
            "label": "Cloud Application",
            "status": "Safe"
        },

        {
            "id": "Identity",
            "label": "Identity / IAM",
            "status": "Safe"
        },

        {
            "id": "Database",
            "label": "Database",
            "status": "Safe"
        },

        {
            "id": "Endpoint",
            "label": "Endpoint Security",
            "status": "Safe"
        },

        {
            "id": "Logging",
            "label": "Logging / SIEM",
            "status": "Safe"
        },

        {
            "id": "SensitiveData",
            "label": "Sensitive Data",
            "status": "Safe"
        }

    ]

    edges = [

        {
            "source": "Internet",
            "target": "Firewall"
        },

        {
            "source": "Firewall",
            "target": "AWS"
        },

        {
            "source": "AWS",
            "target": "Identity"
        },

        {
            "source": "Identity",
            "target": "Database"
        },

        {
            "source": "Database",
            "target": "Endpoint"
        },

        {
            "source": "Endpoint",
            "target": "Logging"
        },

        {
            "source": "Logging",
            "target": "SensitiveData"
        }

    ]

    # ---------------------------------------------------
    # Highlight Nodes Based on Drift
    # ---------------------------------------------------

    drifts = db.query(
        DriftDetection
    ).filter(
        DriftDetection.twin_id == twin_id
    ).all()

    node_map = {

        "Cloud": "AWS",

        "Firewall": "Firewall",

        "Identity": "Identity",

        "Database": "Database",

        "Endpoint": "Endpoint",

        "Logging": "Logging"

    }

    severity_priority = {

        "Safe": 0,

        "Low": 1,

        "Medium": 2,

        "High": 3,

        "Critical": 4

    }

    for drift in drifts:

        control = db.query(BaselineControl).filter(
            BaselineControl.control_id == drift.control_id
        ).first()

        if control is None:
            continue

        node_id = node_map.get(control.domain)

        if node_id is None:
            continue

        for node in nodes:

            if node["id"] == node_id:

                if severity_priority[drift.severity] > severity_priority[node["status"]]:

                    node["status"] = drift.severity

                node["control"] = control.control_name

                node["parameter"] = control.parameter_name

                node["drift_type"] = drift.drift_type

                break

    return {

        "nodes": nodes,

        "edges": edges

    }