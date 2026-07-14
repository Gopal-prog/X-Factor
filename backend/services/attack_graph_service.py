from sqlalchemy.orm import Session
from models import DigitalTwin, DriftDetection, BaselineControl, AttackGraph

def build_attack_graph(twin_id: int, db: Session):
    twin = db.query(DigitalTwin).filter(DigitalTwin.twin_id == twin_id).first()
    if twin is None:
        return None

    # First, clear previous dynamic attack graph for this twin
    db.query(AttackGraph).filter(AttackGraph.twin_id == twin_id).delete()
    
    # Base nodes that always exist to show the perimeter
    nodes = [
        {"id": "Internet", "label": "Internet", "status": "Safe"},
        {"id": "Firewall", "label": "Firewall", "status": "Safe"},
        {"id": "AWS", "label": "Cloud Application", "status": "Safe"},
        {"id": "Identity", "label": "Identity / IAM", "status": "Safe"},
        {"id": "Database", "label": "Database", "status": "Safe"},
        {"id": "Endpoint", "label": "Endpoint Security", "status": "Safe"},
        {"id": "Logging", "label": "Logging / SIEM", "status": "Safe"},
        {"id": "SensitiveData", "label": "Sensitive Data", "status": "Safe"}
    ]
    
    # We start with basic connections
    edges = [
        {"source": "Internet", "target": "Firewall"},
        {"source": "Firewall", "target": "AWS"}
    ]

    drifts = db.query(DriftDetection).filter(DriftDetection.twin_id == twin_id).all()
    
    node_map = {
        "Cloud": "AWS",
        "Firewall": "Firewall",
        "Identity": "Identity",
        "Database": "Database",
        "Endpoint": "Endpoint",
        "Logging": "Logging"
    }

    severity_priority = {"Safe": 0, "Low": 1, "Medium": 2, "High": 3, "Critical": 4}

    # Dynamically build edges based on vulnerabilities (drifts)
    vulnerable_nodes = set(["Internet", "Firewall"]) # Base starting points

    for drift in drifts:
        control = db.query(BaselineControl).filter(BaselineControl.control_id == drift.control_id).first()
        if not control:
            continue
            
        node_id = node_map.get(control.domain)
        if not node_id:
            continue
            
        vulnerable_nodes.add(node_id)
        
        # Update node severity
        for node in nodes:
            if node["id"] == node_id:
                if severity_priority[drift.severity] > severity_priority[node["status"]]:
                    node["status"] = drift.severity
                node["control"] = control.control_name
                node["parameter"] = control.parameter_name
                node["drift_type"] = drift.drift_type
                break
                
    # Build paths dynamically if nodes are vulnerable
    if "AWS" in vulnerable_nodes:
        edges.append({"source": "AWS", "target": "Identity"})
    if "Identity" in vulnerable_nodes:
        edges.append({"source": "Identity", "target": "Database"})
    if "Database" in vulnerable_nodes:
        edges.append({"source": "Database", "target": "Endpoint"})
        edges.append({"source": "Database", "target": "SensitiveData"}) # Critical path
    if "Endpoint" in vulnerable_nodes:
        edges.append({"source": "Endpoint", "target": "Logging"})
    if "Logging" in vulnerable_nodes:
        edges.append({"source": "Logging", "target": "SensitiveData"})
        
    # Persist the attack graph in the database
    for edge in edges:
        db_edge = AttackGraph(
            twin_id=twin_id,
            source_node=edge["source"],
            destination_node=edge["target"],
            risk_level="High" if edge["target"] == "SensitiveData" else "Medium"
        )
        db.add(db_edge)
        
    db.commit()

    return {
        "nodes": nodes,
        "edges": edges
    }