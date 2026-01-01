import React, { useState, useRef, useEffect } from 'react';
import { generateAudioInsight } from '../services/geminiService';
import { MessageSquare, Send, Loader2, Sparkles, Key } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  currentFreq: number;
  currentWave: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentFreq, currentWave }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your AI Audio Assistant. Ask me about frequencies, pitch, or acoustics.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true); // Optimistically true, verified on mount
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasApiKey(true); // Optimistic update per instructions
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!hasApiKey) {
        await handleConnectKey();
        return; 
    }

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await generateAudioInsight(currentFreq, currentWave, input);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  const askQuickQuestion = async () => {
    if (!hasApiKey) {
        await handleConnectKey();
        return;
    }

    const prompt = `What is ${currentFreq}Hz typically used for or associated with?`;
    const userMsg: ChatMessage = { role: 'user', text: `Analyze ${currentFreq}Hz` };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const response = await generateAudioInsight(currentFreq, currentWave, prompt);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-full lg:w-96 shadow-2xl z-20">
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-400 font-bold">
          <Sparkles className="w-5 h-5" />
          <span>AI Sound Lab</span>
        </div>
        {!hasApiKey ? (
            <button 
                onClick={handleConnectKey}
                className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded hover:bg-amber-500/30 border border-amber-500/50 transition-colors flex items-center gap-1"
            >
                <Key className="w-3 h-3" /> Connect Key
            </button>
        ) : (
            <button 
              onClick={askQuickQuestion}
              className="text-xs bg-sky-900/50 text-sky-200 px-2 py-1 rounded hover:bg-sky-900 border border-sky-800 transition-colors"
              disabled={loading}
            >
              Quick Analysis
            </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
              m.role === 'user' 
                ? 'bg-sky-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700">
              <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        {!hasApiKey ? (
             <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-lg border border-slate-800">
                <p className="text-slate-400 text-xs mb-3 text-center">To use the AI Assistant, please select a billing project/API key.</p>
                <button 
                    onClick={handleConnectKey}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-bold transition-colors"
                >
                    <Key className="w-4 h-4" /> Select API Key
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] text-slate-600 mt-2 hover:text-slate-400 underline">Billing Documentation</a>
             </div>
        ) : (
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about this frequency..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;