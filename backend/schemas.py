from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


# --------------------------
# LOGIN
# --------------------------

class LoginRequest(BaseModel):
    employee_id: str
    password: str


class LoginResponse(BaseModel):
    user_id: int
    full_name: str
    role: str
    department: str


# --------------------------
# PROJECT
# --------------------------

class ProjectResponse(BaseModel):
    project_id: int
    project_name: str
    application_name: str
    environment: str
    description: Optional[str]


# --------------------------
# BASELINE CONTROL
# --------------------------

class BaselineResponse(BaseModel):
    control_id: int
    domain: str
    system_name: str
    control_name: str
    parameter_name: str
    parameter_value: str
    severity: str


# --------------------------
# CREATE DIGITAL TWIN
# --------------------------

class CreateTwinRequest(BaseModel):
    project_id: int
    engineer_id: int


class CreateTwinResponse(BaseModel):
    twin_id: int
    status: str


# --------------------------
# UPDATE CONTROL
# --------------------------

class UpdateTwinRequest(BaseModel):
    twin_id: int
    control_id: int
    new_value: str


# --------------------------
# RISK RESPONSE
# --------------------------

class RiskResponse(BaseModel):
    twin_id: int
    risk_score: Decimal
    risk_level: str


# --------------------------
# AI RECOMMENDATION
# --------------------------

class RecommendationResponse(BaseModel):
    recommendation: str
    predicted_risk: Decimal


# --------------------------
# AI COPILOT
# --------------------------

class ChatRequest(BaseModel):
    user_id: int
    twin_id: int
    question: str


class ChatResponse(BaseModel):
    answer: str