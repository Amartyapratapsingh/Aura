# Aura AI Assistant - Backend Integration Contracts

## API Endpoints

### 1. Chat Messages
- **POST /api/chat/send**
  - Body: `{ "message": "string", "session_id": "string" }`
  - Response: `{ "response": "string", "message_id": "string", "timestamp": "datetime" }`
  - Purpose: Send user message and get AI response from Gemini 2.0 Pro

### 2. Session Management
- **POST /api/sessions**
  - Body: `{ "name": "string" }` (optional)
  - Response: `{ "session_id": "string", "name": "string", "created_at": "datetime" }`
  - Purpose: Create new conversation session

- **GET /api/sessions**
  - Response: `[{ "session_id": "string", "name": "string", "last_message": "string", "updated_at": "datetime" }]`
  - Purpose: Get all user sessions

- **GET /api/sessions/{session_id}/messages**
  - Response: `[{ "id": "string", "text": "string", "sender": "user|ai", "timestamp": "datetime" }]`
  - Purpose: Get all messages for a specific session

## Database Models

### Message Model
```python
{
  "id": "ObjectId",
  "session_id": "string",
  "text": "string", 
  "sender": "user|ai",
  "timestamp": "datetime",
  "metadata": {
    "model_used": "gemini-2.0-pro",
    "response_time": "float"
  }
}
```

### Session Model
```python
{
  "id": "ObjectId",
  "session_id": "string", # UUID
  "name": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "message_count": "int"
}
```

## Mock Data to Replace

### In `/app/frontend/src/data/mock.js`:
1. **mockResponses** - Replace with real Gemini API calls
2. **mockSessions** - Replace with database queries
3. **mockUserPreferences** - Keep for now (future enhancement)

### In `/app/frontend/src/components/ChatInterface.jsx`:
1. **messages state** - Load from API instead of hardcoded
2. **sessions state** - Fetch from `/api/sessions`
3. **sendMessage function** - Call `/api/chat/send` instead of mock response
4. **createNewSession function** - Call `/api/sessions`
5. **switchSession function** - Load messages from `/api/sessions/{id}/messages`

## Integration Requirements

### AI Integration:
- Use Gemini 2.0 Pro with Emergent LLM key
- Implement conversation memory within sessions
- Handle rate limiting and error responses
- Maintain friendly, conversational personality

### Frontend Changes:
- Replace mock API calls with real HTTP requests using axios
- Add error handling for network failures
- Implement loading states during API calls
- Add session persistence across browser refreshes

## Implementation Order:
1. Set up Gemini 2.0 Pro integration
2. Create database models and API endpoints
3. Update frontend to use real APIs
4. Test full conversation flow
5. Add error handling and edge cases