from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List
from datetime import datetime

# Import models and services
from models import Message, MessageCreate, MessageResponse, Session, SessionCreate, SessionResponse
from ai_service import ai_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Aura AI Assistant Backend is running!"}

# Chat endpoints
@api_router.post("/chat/send", response_model=MessageResponse)
async def send_message(input: MessageCreate):
    try:
        # Save user message to database
        user_message = Message(
            session_id=input.session_id,
            text=input.message,
            sender="user"
        )
        await db.messages.insert_one(user_message.dict())
        
        # Generate AI response
        ai_response_text, metadata = await ai_service.generate_response(
            input.message, 
            input.session_id
        )
        
        # Save AI response to database
        ai_message = Message(
            session_id=input.session_id,
            text=ai_response_text,
            sender="ai",
            metadata=metadata
        )
        await db.messages.insert_one(ai_message.dict())
        
        # Update session with latest activity
        await db.sessions.update_one(
            {"session_id": input.session_id},
            {
                "$set": {"updated_at": datetime.utcnow()},
                "$inc": {"message_count": 2}  # User + AI message
            }
        )
        
        return MessageResponse(
            response=ai_response_text,
            message_id=ai_message.id,
            timestamp=ai_message.timestamp
        )
        
    except Exception as e:
        logging.error(f"Error in send_message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process message")

# Session management endpoints
@api_router.post("/sessions", response_model=SessionResponse)
async def create_session(input: SessionCreate):
    try:
        # Create new session
        session = Session(
            name=input.name or f"Chat {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
        )
        
        # Save to database
        await db.sessions.insert_one(session.dict())
        
        # Create initial AI greeting
        greeting_message = Message(
            session_id=session.session_id,
            text="Hello! I'm Aura, your friendly AI assistant. How can I help you today?",
            sender="ai"
        )
        await db.messages.insert_one(greeting_message.dict())
        
        # Update session message count
        await db.sessions.update_one(
            {"session_id": session.session_id},
            {"$inc": {"message_count": 1}}
        )
        
        return SessionResponse(
            session_id=session.session_id,
            name=session.name,
            last_message="Hello! I'm Aura, your friendly AI assistant...",
            updated_at=session.updated_at,
            message_count=1
        )
        
    except Exception as e:
        logging.error(f"Error creating session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create session")

@api_router.get("/sessions", response_model=List[SessionResponse])
async def get_sessions():
    try:
        # Get all sessions, sorted by most recent
        sessions_cursor = db.sessions.find().sort("updated_at", -1)
        sessions = await sessions_cursor.to_list(100)
        
        result = []
        for session_data in sessions:
            # Get last message for preview
            last_message_cursor = db.messages.find(
                {"session_id": session_data["session_id"]}
            ).sort("timestamp", -1).limit(1)
            
            last_messages = await last_message_cursor.to_list(1)
            last_message_text = last_messages[0]["text"] if last_messages else "No messages"
            
            # Truncate long messages for preview
            if len(last_message_text) > 50:
                last_message_text = last_message_text[:47] + "..."
            
            result.append(SessionResponse(
                session_id=session_data["session_id"],
                name=session_data["name"],
                last_message=last_message_text,
                updated_at=session_data["updated_at"],
                message_count=session_data.get("message_count", 0)
            ))
        
        return result
        
    except Exception as e:
        logging.error(f"Error getting sessions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch sessions")

@api_router.get("/sessions/{session_id}/messages", response_model=List[Message])
async def get_session_messages(session_id: str):
    try:
        # Get all messages for the session, ordered by timestamp
        messages_cursor = db.messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1)
        
        messages = await messages_cursor.to_list(1000)
        
        return [Message(**msg) for msg in messages]
        
    except Exception as e:
        logging.error(f"Error getting session messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)