from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.attack_graph_service import build_attack_graph

router = APIRouter(
    prefix="/attack-graph",
    tags=["Attack Graph"]
)


@router.get("/{twin_id}")
def get_attack_graph(
    twin_id: int,
    db: Session = Depends(get_db)
):

    graph = build_attack_graph(
        twin_id,
        db
    )

    if graph is None:

        return {

            "message": "Digital Twin Not Found"

        }

    return graph