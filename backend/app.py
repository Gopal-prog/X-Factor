from fastapi import FastAPI

from routes.auth import router as auth_router
from routes.project import router as project_router
from routes.baseline import router as baseline_router
from routes.twin import router as twin_router
from routes.risk import router as risk_router
from routes.recommendation import router as recommendation_router
from routes.change_request import router as change_router
from routes.approval import router as approval_router
from routes.dashboard import router as dashboard_router
from routes.attack_graph import router as attack_graph_router
from routes.copilot import router as copilot_router
from routes.ml_admin import router as ml_admin_router
from routes.websockets import router as websockets_router
from routes.reports import router as reports_router
from routes.admin import router as admin_router

from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

# Ensure all new tables (like AttackGraph) are created
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SecureTwin AI",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(project_router)
app.include_router(baseline_router)
app.include_router(twin_router)
app.include_router(risk_router)
app.include_router(recommendation_router)
app.include_router(change_router)
app.include_router(approval_router)
app.include_router(dashboard_router)
app.include_router(attack_graph_router)
app.include_router(copilot_router)
app.include_router(ml_admin_router)
app.include_router(websockets_router)
app.include_router(reports_router)
app.include_router(admin_router)

@app.get("/")
def home():
    return {
        "message": "SecureTwin AI Backend Running"
    }