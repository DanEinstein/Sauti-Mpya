import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, Volume2, AlertCircle } from 'lucide-react';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { getChatResponse, transcribeAudio, isGroqAvailable } from '../services/groqService';
import type { ChatMessage } from '../types/voice';

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello, I'm here to listen and support you. This is a safe, confidential space. You can share whatever you're comfortable with. How are you feeling today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeRisk = (text: string): string => {
    const lowerText = text.toLowerCase();
    const highRiskWords = ['hit', 'hits', 'hitting', 'punch', 'kick', 'choke', 'strangle', 'weapon', 'knife', 'gun', 'kill', 'murder', 'rape', 'force'];
    const mediumRiskWords = ['hurt', 'afraid', 'scared', 'fear', 'threaten', 'control', 'isolate', 'yell', 'scream', 'insult', 'slap', 'push', 'shove'];

    const hasHighRisk = highRiskWords.some(word => lowerText.includes(word));
    const hasMediumRisk = mediumRiskWords.some(word => lowerText.includes(word));

    if (hasHighRisk) return 'high';
    if (hasMediumRisk) return 'medium';
    return 'low';
  };

  // Fallback response generator (used when Groq is not available)
  const generateFallbackResponse = (userMessage: string): string => {
    const riskLevel = analyzeRisk(userMessage);
    const lowerMessage = userMessage.toLowerCase();

    if (riskLevel === 'high') {
      return "I'm very concerned about your safety. What you're describing sounds serious and dangerous. Please know that you don't deserve to be treated this way, and help is available. Would you like me to share emergency contact numbers for your country? If you're in immediate danger, please call emergency services or use the helpline numbers at the bottom of this page.";
    }

    if (riskLevel === 'medium') {
      return "Thank you for sharing that with me. What you're experiencing sounds really difficult and you deserve to feel safe and respected. These behaviors can be warning signs of abuse. Would you be open to taking our safety assessment? It might help you understand your situation better. Remember, you have options and support is available.";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what do i do') || lowerMessage.includes('what should i')) {
      return "I'm here to support you. Here are some steps you can take: 1) Take our safety assessment to better understand your situation, 2) Create a safety plan, 3) Reach out to local helplines (you'll find numbers at the bottom of this page), 4) Talk to someone you trust. Would you like me to guide you through any of these?";
    }

    if (lowerMessage.includes('leave') || lowerMessage.includes('leaving')) {
      return "Leaving an abusive situation is a brave step, and it's important to plan carefully for your safety. Our safety plan tool can help you prepare. Remember: leaving can be the most dangerous time, so having a plan is crucial. Would you like help creating a safety plan?";
    }

    if (lowerMessage.includes('fault') || lowerMessage.includes('blame') || lowerMessage.includes('my fault')) {
      return "Please hear this: abuse is NEVER your fault. No matter what you did or didn't do, no one deserves to be hurt, controlled, or frightened. The person choosing to be abusive is responsible for their behavior, not you. You deserve to be treated with respect and kindness.";
    }

    if (lowerMessage.includes('children') || lowerMessage.includes('kids') || lowerMessage.includes('child')) {
      return "I understand you're concerned about children in this situation. Children who witness abuse are affected by it, even if they're not directly harmed. Their safety and wellbeing matter too. If you're worried about a child's safety, please reach out to child protection services or the helplines at the bottom of this page.";
    }

    return "Thank you for sharing that with me. Your feelings are valid, and it takes courage to talk about these things. I'm here to listen without judgment. Would you like to tell me more, or would you prefer to explore our safety assessment or resources?";
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Check if Groq is configured
    if (!isGroqAvailable()) {
      console.log('Groq not configured, using fallback responses');
      return generateFallbackResponse(userMessage);
    }

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Get AI response from Groq
      const response = await getChatResponse(conversationHistory);
      return response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to rule-based responses
      return generateFallbackResponse(userMessage);
    }
  };

  const handleSendText = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await getAIResponse(userMessage);

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      setError('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVoice = async (audioBlob: Blob) => {
    setShowVoiceRecorder(false);
    setError(null);
    setIsLoading(true);

    try {
      // Transcribe the audio
      const transcription = await transcribeAudio(audioBlob);

      // Create audio URL for playback
      const audioUrl = URL.createObjectURL(audioBlob);

      // Add user message with voice
      const newUserMessage: ChatMessage = {
        role: 'user',
        content: transcription.text,
        voiceMessage: {
          id: Date.now().toString(),
          audioBlob,
          audioUrl,
          duration: transcription.duration || 0,
          transcription: transcription.text,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newUserMessage]);

      // Get AI response
      const response = await getAIResponse(transcription.text);

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing voice message:', error);
      setError(error instanceof Error ? error.message : 'Failed to process voice message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#2B9EB3] to-[#1E6A8C] text-white p-6">
          <h1 className="text-3xl font-bold mb-2">Confidential Support Chat</h1>
          <p className="text-blue-100">Safe, anonymous, judgment-free space</p>
          {!isGroqAvailable() && (
            <div className="mt-3 bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              <span>AI features limited. Add API key for full functionality.</span>
            </div>
          )}
        </div>

        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="bg-[#2B9EB3] rounded-full p-2 h-10 w-10 flex-shrink-0">
                  <Bot size={24} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.voiceMessage && (
                  <div className="mb-2 pb-2 border-b border-white border-opacity-30">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 size={16} />
                      <span className="text-sm font-semibold">Voice Message</span>
                    </div>
                    <audio
                      controls
                      src={message.voiceMessage.audioUrl}
                      className="w-full h-8"
                      style={{ filter: 'invert(1)' }}
                    />
                  </div>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="bg-[#FF6B35] rounded-full p-2 h-10 w-10 flex-shrink-0">
                  <User size={24} className="text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="bg-[#2B9EB3] rounded-full p-2 h-10 w-10 flex-shrink-0">
                <Bot size={24} className="text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {showVoiceRecorder ? (
            <VoiceRecorder
              onSendVoice={handleSendVoice}
              onCancel={() => setShowVoiceRecorder(false)}
              disabled={isLoading}
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Type your message here..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3]"
                disabled={isLoading}
              />
              <button
                onClick={() => setShowVoiceRecorder(true)}
                disabled={isLoading}
                className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Send voice message"
              >
                <Mic size={20} />
              </button>
              <button
                onClick={handleSendText}
                disabled={isLoading || !input.trim()}
                className="bg-[#2B9EB3] hover:bg-[#1E6A8C] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
