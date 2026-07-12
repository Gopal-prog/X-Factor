from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Project

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.get("/")
def get_projects(db: Session = Depends(get_db)):

    projects = db.query(Project).all()

    result = []

    for project in projects:
        result.append({
            "project_id": project.project_id,
            "project_name": project.project_name,
            "application_name": project.application_name,
            "environment": project.environment,
            "description": project.description
        })

    return result