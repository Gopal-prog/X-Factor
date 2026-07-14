from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json

router = APIRouter(
    prefix="/ws",
    tags=["WebSockets"]
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                # Handle disconnected clients gracefully
                pass

manager = ConnectionManager()

@router.websocket("/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    """
    WebSocket endpoint for the Live Dashboard. 
    Frontend connects here to receive real-time risk/drift updates.
    """
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect much from the client, just keep the connection alive
            data = await websocket.receive_text()
            # Could handle ping/pong here if necessary
    except WebSocketDisconnect:
        manager.disconnect(websocket)
