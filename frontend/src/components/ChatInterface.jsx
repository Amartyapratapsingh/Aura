import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Mic, MicOff, Send, Bot, User, Plus } from 'lucide-react';
import { mockResponses } from '../data/mock';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Aura, your friendly AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, name: 'Current Session', active: true, lastMessage: 'Hello! I\'m Aura...' }
  ]);
  const [activeSession, setActiveSession] = useState(1);
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Mock speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognition.current) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Mock AI response with delay
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const createNewSession = () => {
    const newSessionId = Date.now();
    const newSession = {
      id: newSessionId,
      name: `Session ${sessions.length + 1}`,
      active: true,
      lastMessage: 'New conversation started'
    };

    setSessions(prev => prev.map(s => ({ ...s, active: false })).concat(newSession));
    setActiveSession(newSessionId);
    setMessages([{
      id: Date.now(),
      text: "Hello! I'm Aura, your friendly AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    }]);
  };

  const switchSession = (sessionId) => {
    setSessions(prev => prev.map(s => ({ ...s, active: s.id === sessionId })));
    setActiveSession(sessionId);
    // In real app, load session messages here
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <Button 
            onClick={createNewSession}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>
        
        <ScrollArea className="h-full">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Recent Sessions</h3>
            {sessions.map((session) => (
              <Card 
                key={session.id}
                className={`mb-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  session.active ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => switchSession(session.id)}
              >
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm">{session.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 truncate">{session.lastMessage}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/api/placeholder/40/40" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Aura AI Assistant</h1>
              <p className="text-sm text-gray-500">Friendly & conversational AI powered by Gemini</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <Card className={`max-w-xs sm:max-w-md ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'bg-white shadow-sm hover:shadow-md transition-shadow'
                }`}>
                  <CardContent className="p-3">
                    <p className={`text-sm ${message.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                      {message.text}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>

                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-500 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message or use voice input..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="pr-12 focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant="ghost"
                  size="sm"
                  className={`absolute right-1 top-1 h-8 w-8 ${
                    isListening ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isListening ? 'Listening... Speak now!' : 'Click the mic button or type to chat with Aura'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;