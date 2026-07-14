from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import RiskAnalysis, DigitalTwin, Project, ComplianceMapping, BaselineControl, TwinControl

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.get("/pdf/{twin_id}")
def generate_pdf_report(twin_id: int, db: Session = Depends(get_db)):
    """
    Generates an automated Risk and Compliance Report.
    In a production system, this would use pdfkit or reportlab to generate a binary PDF file.
    """
    twin = db.query(DigitalTwin).filter(DigitalTwin.twin_id == twin_id).first()
    if not twin:
        return {"error": "Twin not found"}
        
    project = db.query(Project).filter(Project.project_id == twin.project_id).first()
    risk = db.query(RiskAnalysis).filter(RiskAnalysis.twin_id == twin_id).order_by(RiskAnalysis.created_at.desc()).first()
    
    # Calculate detailed compliance (Feature 11)
    # Mock compliance scores based on risk for demonstration
    iso_score = max(0, 100 - float(risk.final_risk_score) * 0.8) if risk else 100
    nist_score = max(0, 100 - float(risk.final_risk_score) * 0.9) if risk else 100
    pci_score = max(0, 100 - float(risk.final_risk_score) * 1.1) if risk else 100
    
    report_data = {
        "title": "Automated Security & Compliance Report",
        "project": project.project_name if project else "Unknown",
        "environment": project.environment if project else "Unknown",
        "overall_risk_score": float(risk.final_risk_score) if risk else 0,
        "risk_level": risk.risk_level if risk else "Safe",
        "compliance": {
            "ISO 27001": f"{iso_score:.1f}%",
            "NIST": f"{nist_score:.1f}%",
            "PCI DSS": f"{pci_score:.1f}%"
        },
        "status": "Generated Successfully",
        "note": "This is a JSON representation of what would be rendered as a PDF."
    }
    
    return report_data
