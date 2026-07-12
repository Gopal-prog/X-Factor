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


from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
def home():
    return {
        "message": "SecureTwin AI Backend Running"
    }