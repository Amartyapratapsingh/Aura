import os
import asyncio
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
load_dotenv()

class GeminiAIService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY environment variable not set")
        
        # Chat instances per session (for conversation memory)
        self.chat_instances = {}
    
    def get_or_create_chat(self, session_id: str) -> LlmChat:
        """Get existing chat instance or create new one for session"""
        if session_id not in self.chat_instances:
            # Create new chat instance with friendly system message
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message="You are Aura, a friendly and conversational AI assistant. You're helpful, enthusiastic, and personable. Keep responses natural and engaging while being informative. Show personality in your responses and make the conversation feel warm and human-like."
            )
            
            # Configure to use Gemini 2.0 Flash (latest available in the playbook)
            chat.with_model("gemini", "gemini-2.0-flash")
            
            self.chat_instances[session_id] = chat
        
        return self.chat_instances[session_id]
    
    async def generate_response(self, message: str, session_id: str) -> tuple[str, dict]:
        """Generate AI response using Gemini 2.0 Pro"""
        try:
            # Get chat instance for this session
            chat = self.get_or_create_chat(session_id)
            
            # Create user message
            user_message = UserMessage(text=message)
            
            # Record start time for metadata
            start_time = datetime.utcnow()
            
            # Send message and get response
            response = await chat.send_message(user_message)
            
            # Calculate response time
            end_time = datetime.utcnow()
            response_time = (end_time - start_time).total_seconds()
            
            # Prepare metadata
            metadata = {
                "model_used": "gemini-2.0-flash",
                "response_time": response_time,
                "session_id": session_id
            }
            
            return response, metadata
            
        except Exception as e:
            print(f"Error generating AI response: {str(e)}")
            # Fallback friendly response
            fallback_response = "I apologize, but I'm having trouble processing your request right now. Could you please try again? I'm here to help!"
            metadata = {
                "model_used": "fallback",
                "error": str(e),
                "response_time": 0.0
            }
            return fallback_response, metadata
    
    def clear_session_memory(self, session_id: str):
        """Clear conversation memory for a specific session"""
        if session_id in self.chat_instances:
            del self.chat_instances[session_id]

# Global AI service instance
ai_service = GeminiAIService()