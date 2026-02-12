import React, { useState, useEffect, useRef } from 'react';
import { createChatSession } from '../services/geminiService';
import { ChatMessage, Language } from '../types';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { translations } from '../utils/translations';

export const ChatAssistant: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].chat;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize/Reset chat when language changes
  useEffect(() => {
    chatSessionRef.current = createChatSession(lang);
    setMessages([
      { id: '1', role: 'model', text: t.welcome, timestamp: Date.now() }
    ]);
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.response.text();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: t.error,
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-guard-800 rounded-2xl border border-guard-700 overflow-hidden shadow-2xl">
      <div className="bg-guard-900 p-4 border-b border-guard-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-guard-cyan/20 flex items-center justify-center">
          <Bot className="text-guard-cyan w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white">{t.title}</h3>
          <p className="text-xs text-guard-green flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-guard-green animate-pulse"></span>
            {t.status} (AI Model)
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-guard-cyan/20'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-guard-cyan" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-guard-700 text-gray-200 rounded-tl-none border border-guard-600'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-guard-700 px-4 py-2 rounded-2xl rounded-tl-none border border-guard-600 ml-11 flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin text-guard-cyan" />
               <span className="text-xs text-gray-400">{t.typing}</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-guard-900 border-t border-guard-700">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-guard-800 border border-guard-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-guard-cyan focus:ring-1 focus:ring-guard-cyan transition-all"
            placeholder={t.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-guard-cyan text-guard-900 p-3 rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};