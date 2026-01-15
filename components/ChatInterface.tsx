
import React, { useState, useRef, useEffect } from 'react';
import { generateAudioInsight } from '../services/geminiService';
import { MessageSquare, Send, Loader2, Sparkles, Key, X, WifiOff } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  currentFreq: number;
  currentWave: string;
  onClose?: () => void;
}

// --- Markdown Formatter Component ---
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  // Helper to process inline formatting like **bold**
  const processInline = (line: string) => {
    // Split by bold markers
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-sky-200 font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Split text by newlines to handle block formatting
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        
        // Handle Headers (###, ##, #)
        if (trimmed.startsWith('#')) {
          const level = trimmed.match(/^#+/)?.[0].length || 0;
          const content = trimmed.replace(/^#+\s*/, '');
          const Component = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
          const styles = level === 1 ? "text-lg font-bold text-sky-300 mt-4 mb-2" 
                       : level === 2 ? "text-base font-bold text-sky-300 mt-3 mb-2" 
                       : "text-sm font-bold text-sky-300 mt-2 mb-1 uppercase tracking-wide";
          
          return <div key={i} className={styles}>{processInline(content)}</div>;
        }

        // Handle Bullet Lists (* or -)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 ml-1 pl-1 border-l-2 border-slate-700/50 my-1">
              <span className="text-sky-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
              <span className="text-slate-300 leading-relaxed text-sm">{processInline(trimmed.replace(/^[\*\-]\s*/, ''))}</span>
            </div>
          );
        }

        // Handle Numbered Lists (1. )
        if (/^\d+\.\s/.test(trimmed)) {
             return (
                <div key={i} className="flex gap-2 ml-1 my-1">
                    <span className="text-sky-400 font-mono text-xs font-bold mt-0.5">{trimmed.match(/^\d+\./)?.[0]}</span>
                    <span className="text-slate-300 leading-relaxed text-sm">{processInline(trimmed.replace(/^\d+\.\s*/, ''))}</span>
                </div>
             )
        }

        // Handle Empty Lines (Paragraph Breaks)
        if (!trimmed) {
          return <div key={i} className="h-2" />;
        }

        // Standard Paragraph
        return <p key={i} className="text-slate-300 leading-relaxed text-sm">{processInline(line)}</p>;
      })}
    </div>
  );
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentFreq, currentWave, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your AI Audio Assistant. Ask me about frequencies, pitch, or acoustics.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true); // Optimistically true, verified on mount
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // API Key Check
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();

    // Online Status Listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
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
    
    if (isOffline) {
        setMessages(prev => [...prev, { role: 'model', text: "You are currently offline. Please check your internet connection." }]);
        return;
    }

    if (!hasApiKey) {
        await handleConnectKey();
        return; 
    }

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await generateAudioInsight(currentFreq, currentWave, input);
    const finalText = response === "OFFLINE_MODE" 
        ? "Network Error: You appear to be offline." 
        : response;
    
    setMessages(prev => [...prev, { role: 'model', text: finalText }]);
    setLoading(false);
  };

  const askQuickQuestion = async () => {
    if (isOffline) {
        setMessages(prev => [...prev, { role: 'model', text: "Feature unavailable offline." }]);
        return;
    }

    if (!hasApiKey) {
        await handleConnectKey();
        return;
    }

    const prompt = `What is ${currentFreq}Hz typically used for or associated with?`;
    const userMsg: ChatMessage = { role: 'user', text: `Analyze ${currentFreq}Hz` };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const response = await generateAudioInsight(currentFreq, currentWave, prompt);
    const finalText = response === "OFFLINE_MODE" 
        ? "Network Error: You appear to be offline." 
        : response;

    setMessages(prev => [...prev, { role: 'model', text: finalText }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-full lg:w-96 shadow-2xl z-20">
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-400 font-bold">
          {onClose && (
            <button 
                onClick={onClose} 
                className="lg:hidden p-1 mr-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
          )}
          <Sparkles className="w-5 h-5" />
          <span>AI Sound Lab</span>
        </div>
        
        {isOffline ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-900/30 border border-red-800 text-red-400 text-xs font-bold">
                <WifiOff className="w-3 h-3" /> Offline
            </div>
        ) : !hasApiKey ? (
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-4 shadow-md ${
              m.role === 'user' 
                ? 'bg-sky-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
            }`}>
              {m.role === 'user' ? (
                  <p className="text-sm">{m.text}</p>
              ) : (
                  <FormattedText text={m.text} />
              )}
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
        {!hasApiKey && !isOffline ? (
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
                placeholder={isOffline ? "You are offline..." : "Ask about this frequency..."}
                disabled={isOffline}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim() || isOffline}
                className="p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
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
