# =============================================================================
# FastAPI WebSocket Proxy for IslandHub Admin Dashboard
# Bridges ZeroClaw Gateway with Admin Web Interface
# =============================================================================

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import asyncio
import json
import os
import logging
from typing import Optional, Dict, Set
from datetime import datetime
import httpx
import jwt
from jwt.exceptions import InvalidTokenError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
ZEROCLAW_URL = os.getenv("ZEROCLAW_URL", "http://localhost:3001")
ZEROCLAW_API_KEY = os.getenv("ZEROCLAW_API_KEY", "")
API_URL = os.getenv("API_URL", "http://localhost:5001")
JWT_SECRET = os.getenv("JWT_SECRET", "")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Security
security = HTTPBearer()

# Connection managers
class ConnectionManager:
    """Manages WebSocket connections for admin dashboard"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_agents: Dict[str, Set[str]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_agents[user_id] = set()
        logger.info(f"Admin connected: {user_id}")
        
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_agents:
            del self.user_agents[user_id]
        logger.info(f"Admin disconnected: {user_id}")
        
    async def send_message(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)
            
    async def broadcast(self, message: dict):
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Failed to send to {user_id}: {e}")

manager = ConnectionManager()

class ZeroClawClient:
    """Client for communicating with ZeroClaw Gateway"""
    
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.client = httpx.AsyncClient(timeout=30.0)
        
    async def send_command(
        self, 
        agent_id: str, 
        command: str, 
        params: dict,
        require_pairing: bool = False
    ) -> dict:
        """Send command to ZeroClaw agent"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "agent": agent_id,
            "command": command,
            "params": params,
            "require_pairing": require_pairing,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            response = await self.client.post(
                f"{self.base_url}/v1/agents/{agent_id}/execute",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"ZeroClaw HTTP error: {e.response.status_code}")
            return {
                "error": True,
                "status": e.response.status_code,
                "message": str(e)
            }
        except Exception as e:
            logger.error(f"ZeroClaw error: {str(e)}")
            return {
                "error": True,
                "message": str(e)
            }
            
    async def get_agents(self) -> list:
        """Get list of available agents"""
        
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        try:
            response = await self.client.get(
                f"{self.base_url}/v1/agents",
                headers=headers
            )
            response.raise_for_status()
            return response.json().get("agents", [])
        except Exception as e:
            logger.error(f"Failed to get agents: {e}")
            return []
            
    async def health_check(self) -> bool:
        """Check if ZeroClaw is healthy"""
        
        try:
            response = await self.client.get(
                f"{self.base_url}/health",
                timeout=5.0
            )
            return response.status_code == 200
        except:
            return False

# Initialize ZeroClaw client
zeroclaw = ZeroClawClient(ZEROCLAW_URL, ZEROCLAW_API_KEY)

# FastAPI lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    logger.info("Starting WebSocket Proxy...")
    
    if await zeroclaw.health_check():
        logger.info("Connected to ZeroClaw Gateway")
    else:
        logger.warning("ZeroClaw Gateway not available")
    
    yield
    
    logger.info("Shutting down WebSocket Proxy...")
    await zeroclaw.client.aclose()

# Create FastAPI app
app = FastAPI(
    title="IslandHub ZeroClaw WebSocket Proxy",
    description="Bridge between Admin Dashboard and ZeroClaw Agents",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication
async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token and extract user info"""
    
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        
        if payload.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
            
        return payload
        
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# REST Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    
    zeroclaw_healthy = await zeroclaw.health_check()
    
    return {
        "status": "healthy" if zeroclaw_healthy else "degraded",
        "zeroclaw_connected": zeroclaw_healthy,
        "active_websocket_connections": len(manager.active_connections),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/agents")
async def list_agents(user: dict = Depends(verify_admin_token)):
    """List available ZeroClaw agents"""
    
    agents = await zeroclaw.get_agents()
    return {
        "agents": agents,
        "count": len(agents)
    }

@app.post("/agents/{agent_id}/execute")
async def execute_agent_command(
    agent_id: str,
    command: dict,
    user: dict = Depends(verify_admin_token)
):
    """Execute command on specific agent via REST"""
    
    result = await zeroclaw.send_command(
        agent_id=agent_id,
        command=command.get("action", "chat"),
        params=command.get("params", {}),
        require_pairing=command.get("require_pairing", False)
    )
    
    return {
        "success": not result.get("error", False),
        "agent": agent_id,
        "result": result,
        "executed_by": user.get("user_id"),
        "timestamp": datetime.utcnow().isoformat()
    }

# WebSocket Endpoints
@app.websocket("/ws/admin")
async def admin_websocket(websocket: WebSocket, token: Optional[str] = None):
    """WebSocket endpoint for admin dashboard"""
    
    if not token:
        await websocket.close(code=4001, reason="Missing authentication token")
        return
        
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "admin":
            await websocket.close(code=4003, reason="Admin access required")
            return
        user_id = payload.get("user_id", "unknown")
    except InvalidTokenError:
        await websocket.close(code=4001, reason="Invalid token")
        return
    
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_json({"error": True, "message": "Invalid JSON"})
                continue
            
            agent_id = message.get("agent")
            command = message.get("command", "chat")
            params = message.get("params", {})
            require_pairing = message.get("require_pairing", False)
            
            if not agent_id:
                await websocket.send_json({"error": True, "message": "Agent ID required"})
                continue
            
            manager.user_agents[user_id].add(agent_id)
            
            logger.info(f"User {user_id} sending command to {agent_id}: {command}")
            
            result = await zeroclaw.send_command(
                agent_id=agent_id,
                command=command,
                params=params,
                require_pairing=require_pairing
            )
            
            await websocket.send_json({
                "status": "success" if not result.get("error") else "error",
                "agent": agent_id,
                "command": command,
                "result": result,
                "timestamp": datetime.utcnow().isoformat()
            })
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        logger.info(f"Admin {user_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for {user_id}: {e}")
        manager.disconnect(user_id)

@app.websocket("/ws/customer")
async def customer_websocket(websocket: WebSocket, session_id: Optional[str] = None):
    """WebSocket endpoint for customer chat"""
    
    await websocket.accept()
    
    customer_id = session_id or f"guest_{datetime.utcnow().timestamp()}"
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            result = await zeroclaw.send_command(
                agent_id="customer_service",
                command="chat",
                params={
                    "message": message.get("text"),
                    "session_id": customer_id,
                    "context": message.get("context", {})
                }
            )
            
            await websocket.send_json({
                "response": result.get("response", "I'm sorry, I couldn't process that."),
                "actions": result.get("actions", []),
                "session_id": customer_id
            })
            
    except WebSocketDisconnect:
        logger.info(f"Customer {customer_id} disconnected")
    except Exception as e:
        logger.error(f"Customer WebSocket error: {e}")

# Startup
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5002,
        reload=False,
        log_level="info"
    )
