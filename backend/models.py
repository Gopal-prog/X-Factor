from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Enum,
    DECIMAL,
    Boolean,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


# -----------------------------
# USERS
# -----------------------------
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(20), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True)
    password_hash = Column(String(255), nullable=False)
    department = Column(String(100))

    role = Column(
        Enum(
            "Engineer",
            "Security Manager",
            "Administrator",
            name="user_roles"
        ),
        nullable=False
    )

    status = Column(
        Enum(
            "Active",
            "Inactive",
            name="user_status"
        ),
        default="Active"
    )

    created_at = Column(TIMESTAMP, server_default=func.now())


# -----------------------------
# PROJECTS
# -----------------------------
class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)

    project_name = Column(String(100), nullable=False)
    application_name = Column(String(100))

    owner_id = Column(Integer, ForeignKey("users.user_id"))

    environment = Column(
        Enum(
            "Development",
            "Staging",
            "Production",
            name="environment_type"
        )
    )

    description = Column(Text)

    created_at = Column(TIMESTAMP, server_default=func.now())


# -----------------------------
# BASELINE CONTROLS
# -----------------------------
class BaselineControl(Base):
    __tablename__ = "baseline_controls"

    control_id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.project_id")
    )

    domain = Column(String(50))

    system_name = Column(String(100))

    control_name = Column(String(100))

    parameter_name = Column(String(100))

    parameter_value = Column(String(255))

    severity = Column(
        Enum(
            "Low",
            "Medium",
            "High",
            "Critical",
            name="severity_levels"
        )
    )

    created_at = Column(TIMESTAMP, server_default=func.now())


# -----------------------------
# DIGITAL TWIN
# -----------------------------
class DigitalTwin(Base):
    __tablename__ = "digital_twins"

    twin_id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.project_id")
    )

    created_by = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    status = Column(
        Enum(
            "Running",
            "Completed",
            "Approved",
            "Rejected",
            name="twin_status"
        ),
        default="Running"
    )

    risk_score_before = Column(DECIMAL(5,2))

    risk_score_after = Column(DECIMAL(5,2))

    created_at = Column(TIMESTAMP, server_default=func.now())


# -----------------------------
# TWIN CONTROLS
# -----------------------------
class TwinControl(Base):
    __tablename__ = "twin_controls"

    twin_control_id = Column(Integer, primary_key=True)

    twin_id = Column(
        Integer,
        ForeignKey("digital_twins.twin_id")
    )

    control_id = Column(
        Integer,
        ForeignKey("baseline_controls.control_id")
    )

    old_value = Column(String(255))

    new_value = Column(String(255))


# -----------------------------
# CHANGE REQUESTS
# -----------------------------
class ChangeRequest(Base):
    __tablename__ = "change_requests"

    request_id = Column(Integer, primary_key=True)

    project_id = Column(Integer, ForeignKey("projects.project_id"))

    engineer_id = Column(Integer, ForeignKey("users.user_id"))

    twin_id = Column(Integer, ForeignKey("digital_twins.twin_id"))

    reason = Column(Text)

    expected_duration = Column(String(50))

    ticket_number = Column(String(50))
    maintenance_window = Column(Boolean, default=False)

    status = Column(
        Enum(
            "Pending",
            "Under Review",
            "Pending Admin Approval",
            "Approved",
            "Rejected",
            "Deployed",
            name="request_status"
        ),
        default="Pending"
    )
    

    created_at = Column(TIMESTAMP, server_default=func.now())


# -----------------------------
# DRIFT DETECTION
# -----------------------------
class DriftDetection(Base):
    __tablename__ = "drift_detection"

    drift_id = Column(Integer, primary_key=True)

    twin_id = Column(Integer, ForeignKey("digital_twins.twin_id"))

    control_id = Column(Integer, ForeignKey("baseline_controls.control_id"))

    drift_type = Column(
        Enum(
            "Added",
            "Modified",
            "Removed",
            name="drift_type"
        )
    )

    severity = Column(
        Enum(
            "Low",
            "Medium",
            "High",
            "Critical",
            name="drift_severity"
        )
    )

    detected_at = Column(TIMESTAMP, server_default=func.now())


# -----------------------------
# RISK ANALYSIS
# -----------------------------
class RiskAnalysis(Base):
    __tablename__ = "risk_analysis"

    analysis_id = Column(Integer, primary_key=True)

    twin_id = Column(Integer, ForeignKey("digital_twins.twin_id"))

    security_risk = Column(DECIMAL(5,2))

    attack_surface = Column(DECIMAL(5,2))

    business_criticality = Column(DECIMAL(5,2))

    compliance_score = Column(DECIMAL(5,2))

    compound_drift = Column(DECIMAL(5,2))

    anomaly_score = Column(DECIMAL(5,2))

    mitigation_score = Column(DECIMAL(5,2))

    final_risk_score = Column(DECIMAL(5,2))

    risk_level = Column(
        Enum(
            "Low",
            "Medium",
            "High",
            "Critical",
            name="risk_level"
        )
    )

    created_at = Column(TIMESTAMP, server_default=func.now())


# -----------------------------
# COMPLIANCE
# -----------------------------
class ComplianceMapping(Base):
    __tablename__ = "compliance_mapping"

    compliance_id = Column(Integer, primary_key=True)

    control_id = Column(Integer, ForeignKey("baseline_controls.control_id"))

    nist = Column(String(100))

    cis = Column(String(100))

    gdpr = Column(String(100))

    mitre = Column(String(100))


# -----------------------------
# RECOMMENDATIONS
# -----------------------------
class Recommendation(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(Integer, primary_key=True)

    twin_id = Column(Integer, ForeignKey("digital_twins.twin_id"))

    recommendation = Column(Text)

    predicted_risk = Column(DECIMAL(5,2))

    applied = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())


# -----------------------------
# ATTACK GRAPH
# -----------------------------
class AttackGraph(Base):
    __tablename__ = "attack_graph"

    attack_id = Column(Integer, primary_key=True)

    twin_id = Column(Integer, ForeignKey("digital_twins.twin_id"))

    source_node = Column(String(100))

    destination_node = Column(String(100))

    risk_level = Column(
        Enum(
            "Low",
            "Medium",
            "High",
            "Critical",
            name="attack_risk"
        )
    )


# -----------------------------
# MANAGER APPROVAL
# -----------------------------
class ManagerApproval(Base):
    __tablename__ = "manager_approval"

    approval_id = Column(Integer, primary_key=True)

    request_id = Column(Integer, ForeignKey("change_requests.request_id"))

    manager_id = Column(Integer, ForeignKey("users.user_id"))

    decision = Column(
        Enum(
            "Approved",
            "Rejected",
            "Pending",
            name="approval_status"
        )
    )

    comments = Column(Text)

    approved_at = Column(TIMESTAMP)


# -----------------------------
# DEPLOYMENT
# -----------------------------
class Deployment(Base):
    __tablename__ = "deployment"

    deployment_id = Column(Integer, primary_key=True)

    request_id = Column(Integer, ForeignKey("change_requests.request_id"))

    deployed_by = Column(Integer, ForeignKey("users.user_id"))

    deployment_status = Column(
        Enum(
            "Success",
            "Failed",
            name="deployment_status"
        )
    )

    deployed_at = Column(TIMESTAMP, server_default=func.now())


# -----------------------------
# AUDIT LOGS
# -----------------------------
class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.user_id"))

    action = Column(String(255))

    module_name = Column(String(100))

    description = Column(Text)

    ip_address = Column(String(50))

    log_time = Column(TIMESTAMP, server_default=func.now())


# -----------------------------
# CHATBOT LOGS
# -----------------------------
class ChatbotLog(Base):
    __tablename__ = "chatbot_logs"

    chat_id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.user_id"))

    question = Column(Text)

    response = Column(Text)

    asked_at = Column(TIMESTAMP, server_default=func.now())