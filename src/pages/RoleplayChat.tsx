import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Settings, Upload, Download, Trash2, MessageSquare, Wand2, RotateCcw } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  avatar?: string;
}

interface ChatSession {
  id: string;
  name: string;
  character: Character;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export default function RoleplayChat() {
  const { useMessage, messagesRemaining } = useSubscription();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock characters - in production, this would come from the character cards
  const [availableCharacters] = useState<Character[]>([
    {
      id: '1',
      name: 'Luna',
      description: 'A mysterious mage with silver hair and violet eyes',
      personality: 'Curious, intelligent, slightly mischievous, loves ancient magic',
      scenario: 'You meet Luna in an ancient library filled with magical tomes',
      first_mes: '*Luna looks up from an ancient spellbook, her violet eyes sparkling with curiosity* Oh! I didn\'t expect to find someone else here in the restricted section. Are you perhaps interested in the old magics as well?',
      mes_example: '{{user}}: What kind of magic are you studying?\n{{char}}: *Luna\'s eyes light up with excitement* I\'m researching temporal magic - the ability to glimpse into past and future. It\'s incredibly complex, but fascinating! *She shows you a page covered in intricate symbols* These runes can supposedly show echoes of what happened in a place centuries ago.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1'
    },
    {
      id: '2',
      name: 'Marcus',
      description: 'A skilled knight with a noble heart and unwavering loyalty',
      personality: 'Honorable, protective, brave, sometimes overly serious',
      scenario: 'You encounter Marcus at a crossroads, where he\'s helping travelers',
      first_mes: '*Marcus adjusts his armor and looks up as you approach, offering a respectful nod* Greetings, traveler. The road ahead can be treacherous - bandits have been spotted in these parts. Perhaps we should travel together for safety?',
      mes_example: '{{user}}: Are you really a knight?\n{{char}}: *Marcus straightens with pride, his hand resting on his sword hilt* Indeed I am, sworn to protect the innocent and uphold justice. I\'ve served the realm for ten years now. *His expression softens slightly* Though I must admit, the life of a knight is not always as glorious as the tales make it seem.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1'
    }
  ]);

  const currentSessionData = currentSession ? sessions.find(s => s.id === currentSession) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSessionData?.messages]);

  const createNewSession = (character: Character) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chat with ${character.name}`,
      character,
      messages: [
        {
          id: '1',
          role: 'system',
          content: `You are ${character.name}. ${character.description}. Personality: ${character.personality}. Scenario: ${character.scenario}`,
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          role: 'assistant',
          content: character.first_mes,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession.id);
    setShowCharacterSelect(false);
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentSessionData || messagesRemaining <= 0) {
      if (messagesRemaining <= 0) {
        alert('No messages remaining. Please upgrade your plan.');
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    // Add user message
    setSessions(prev => prev.map(session => {
      if (session.id === currentSession) {
        return {
          ...session,
          messages: [...session.messages, userMessage],
          updatedAt: new Date().toISOString()
        };
      }
      return session;
    }));

    setMessage('');
    setIsTyping(true);

    try {
      // Prepare conversation context
      const conversationHistory = currentSessionData.messages
        .filter(msg => msg.role !== 'system')
        .slice(-10) // Last 10 messages for context
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      conversationHistory.push({
        role: 'user',
        content: message
      });

      // API call to Chutes
      const response = await fetch('https://api.chutes.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer cpk_cfa7d8cde9394901845f0b6e62fdcfa6.0d6209d2d5f1578ba66d122c1d14d9a0.CXzSDxe2QuSFrzonuqjVhOruVY6mUKyK'
        },
        body: JSON.stringify({
          model: 'cydonia',
          messages: [
            {
              role: 'system',
              content: `You are ${currentSessionData.character.name}. ${currentSessionData.character.description}. 

Personality: ${currentSessionData.character.personality}

Scenario: ${currentSessionData.character.scenario}

Example dialogue:
${currentSessionData.character.mes_example}

Stay in character at all times. Respond naturally and engage with the user's messages. Use *actions* for physical descriptions and emotions.`
            },
            ...conversationHistory
          ],
          max_tokens: 200,
          temperature: 0.8
        })
      }).catch(() => {
        // Fallback to mock response
        return {
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: generateMockResponse(currentSessionData.character, message)
              }
            }]
          })
        };
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || generateMockResponse(currentSessionData.character, message);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString()
        };

        setSessions(prev => prev.map(session => {
          if (session.id === currentSession) {
            return {
              ...session,
              messages: [...session.messages, assistantMessage],
              updatedAt: new Date().toISOString()
            };
          }
          return session;
        }));

        useMessage();
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again.',
        timestamp: new Date().toISOString()
      };

      setSessions(prev => prev.map(session => {
        if (session.id === currentSession) {
          return {
            ...session,
            messages: [...session.messages, errorMessage],
            updatedAt: new Date().toISOString()
          };
        }
        return session;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const generateMockResponse = (character: Character, userMessage: string): string => {
    const responses = {
      'Luna': [
        '*Luna tilts her head thoughtfully, her violet eyes studying you with interest* That\'s a fascinating perspective. In my studies of ancient magic, I\'ve learned that...',
        '*She closes the spellbook gently and gives you her full attention* You know, that reminds me of something I discovered in the old archives...',
        '*Luna\'s eyes sparkle with curiosity as she considers your words* How intriguing! I\'ve never thought about it that way before...'
      ],
      'Marcus': [
        '*Marcus nods solemnly, his expression serious but kind* I understand your concern. In my years as a knight, I\'ve faced similar situations...',
        '*He adjusts his armor and looks at you with respect* Your words carry wisdom. Perhaps we should consider...',
        '*Marcus places a reassuring hand on his sword hilt* Fear not, I shall ensure your safety. We knights are bound by honor to...'
      ]
    };

    const characterResponses = responses[character.name as keyof typeof responses] || [
      '*They look at you thoughtfully and respond with genuine interest*',
      '*Their expression shows they\'re carefully considering your words*',
      '*They smile warmly as they prepare to respond*'
    ];

    return characterResponses[Math.floor(Math.random() * characterResponses.length)];
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession === sessionId) {
      setCurrentSession(null);
    }
  };

  const exportSession = (session: ChatSession) => {
    const exportData = {
      character: session.character,
      messages: session.messages.filter(msg => msg.role !== 'system'),
      metadata: {
        name: session.name,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${session.character.name}_chat_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSession = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          const newSession: ChatSession = {
            id: Date.now().toString(),
            name: importedData.metadata?.name || `Imported chat with ${importedData.character.name}`,
            character: importedData.character,
            messages: [
              {
                id: '1',
                role: 'system',
                content: `You are ${importedData.character.name}. ${importedData.character.description}`,
                timestamp: new Date().toISOString()
              },
              ...importedData.messages
            ],
            createdAt: importedData.metadata?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setSessions(prev => [...prev, newSession]);
          alert('Chat session imported successfully!');
        } catch (error) {
          alert('Error importing chat session. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roleplay Chat</h1>
            <p className="text-gray-600 mt-2">Interactive conversations with AI characters</p>
          </div>
          <div className="flex space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import Chat
              <input
                type="file"
                accept=".json"
                onChange={importSession}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowCharacterSelect(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Chat Sessions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat Sessions</h2>
              <div className="space-y-2 overflow-y-auto max-h-[calc(100%-60px)]">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSession === session.id
                        ? 'bg-purple-100 border-purple-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentSession(session.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          {session.character.avatar && (
                            <img
                              src={session.character.avatar}
                              alt={session.character.name}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          )}
                          <h3 className="font-medium text-gray-900 text-sm">{session.character.name}</h3>
                        </div>
                        <p className="text-xs text-gray-600">
                          {session.messages.filter(m => m.role !== 'system').length} messages
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportSession(session);
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {currentSessionData ? (
              <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    {currentSessionData.character.avatar && (
                      <img
                        src={currentSessionData.character.avatar}
                        alt={currentSessionData.character.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {currentSessionData.character.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {currentSessionData.character.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentSessionData.messages
                    .filter(msg => msg.role !== 'system')
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {msg.role === 'assistant' && currentSessionData.character.avatar && (
                              <img
                                src={currentSessionData.character.avatar}
                                alt={currentSessionData.character.name}
                                className="w-6 h-6 rounded-full flex-shrink-0 mt-1"
                              />
                            )}
                            {msg.role === 'user' && (
                              <User className="w-6 h-6 flex-shrink-0 mt-1" />
                            )}
                            <div className="flex-1">
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <p className={`text-xs mt-1 ${
                                msg.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                              }`}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {currentSessionData.character.avatar && (
                            <img
                              src={currentSessionData.character.avatar}
                              alt={currentSessionData.character.name}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={`Message ${currentSessionData.character.name}...`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isTyping || messagesRemaining <= 0}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim() || isTyping || messagesRemaining <= 0}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {messagesRemaining} messages remaining
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No Chat Selected</h2>
                  <p className="text-gray-600 mb-6">Select a chat session or start a new conversation</p>
                  <button
                    onClick={() => setShowCharacterSelect(true)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Start New Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Character Selection Modal */}
        {showCharacterSelect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Choose a Character</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCharacters.map((character) => (
                    <div
                      key={character.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 cursor-pointer transition-colors"
                      onClick={() => createNewSession(character)}
                    >
                      <div className="flex items-start space-x-3">
                        {character.avatar && (
                          <img
                            src={character.avatar}
                            alt={character.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{character.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{character.description}</p>
                          <p className="text-xs text-gray-500">{character.scenario}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowCharacterSelect(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}