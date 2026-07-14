from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Project, User
from fastapi import HTTPException

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

@router.get("/")
def get_projects(user_id: int, db: Session = Depends(get_db)):
    # Feature 14: Multi-Tenant Support
    # Filter projects based on the user's department to create isolated environments
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    department_users = db.query(User.user_id).filter(User.department == user.department).subquery()
    
    if user.role in ["Administrator", "Security Manager"]:
        projects = db.query(Project).all()
    else:
        projects = db.query(Project).filter(Project.owner_id.in_(department_users)).all()

    result = []

    for project in projects:
        result.append({
            "project_id": project.project_id,
            "project_name": project.project_name,
            "application_name": project.application_name,
            "environment": project.environment,
            "description": project.description,
            "department": user.department # Expose tenant for UI if needed
        })

    return result