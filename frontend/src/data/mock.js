// Mock data for AI responses - will be replaced with real Gemini API calls
export const mockResponses = [
  "That's a great question! I'd be happy to help you with that. Based on what you've shared, here's what I think...",
  
  "I understand what you're looking for. Let me break this down for you in a way that's easy to follow...",
  
  "Absolutely! That's something I can definitely assist with. Here's my approach to solving this...",
  
  "I love helping with questions like this! From my understanding, the best way to handle this would be...",
  
  "That's an interesting perspective! I think there are a few different ways we could approach this. Let me share some options...",
  
  "Great question! I'm excited to help you explore this topic. Based on the latest information I have...",
  
  "I can definitely help you with that! This is actually a common question, and here's what I've found works best...",
  
  "Thanks for bringing this up! I think this is a really important topic to discuss. Here's my take on it...",
  
  "I'm here to help! Let me think through this step by step and give you a comprehensive answer...",
  
  "That's a thoughtful question! I appreciate you asking. Based on my knowledge and experience, here's what I'd recommend...",
  
  "Perfect timing for this question! I've been thinking about similar topics lately. Here's what I believe...",
  
  "I'm glad you asked about this! It's actually quite fascinating when you dive deeper into it. Let me explain...",
];

// Mock conversation sessions - will be replaced with real database storage
export const mockSessions = [
  {
    id: 1,
    name: "General Questions",
    messages: [
      {
        id: 1,
        text: "Hello! I'm Aura, your friendly AI assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date('2024-01-10T10:00:00'),
      },
      {
        id: 2,
        text: "Hi Aura! Can you help me understand artificial intelligence?",
        sender: 'user',
        timestamp: new Date('2024-01-10T10:01:00'),
      }
    ],
    lastActivity: new Date('2024-01-10T10:01:00'),
    active: true
  },
  {
    id: 2,
    name: "Programming Help",
    messages: [
      {
        id: 1,
        text: "Hello! I'm Aura, your friendly AI assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date('2024-01-09T14:30:00'),
      }
    ],
    lastActivity: new Date('2024-01-09T14:30:00'),
    active: false
  }
];

// Mock user preferences - will be replaced with user account system
export const mockUserPreferences = {
  voiceEnabled: true,
  theme: 'light',
  language: 'en-US',
  conversationStyle: 'friendly',
  notifications: true
};