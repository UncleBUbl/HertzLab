import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Type, Settings2 } from 'lucide-react';

interface FrequencyDisplayProps {
  frequency: number;
  setFrequency: (f: number) => void;
  isPlaying: boolean;
}

const FrequencyDisplay: React.FC<FrequencyDisplayProps> = ({ frequency, setFrequency, isPlaying }) => {
  const [step, setStep] = useState(10);
  const [inputValue, setInputValue] = useState(frequency.toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
        setInputValue(frequency.toFixed(2));
    }
  }, [frequency, isEditing]);

  const handleSubmit = () => {
      let val = parseFloat(inputValue);
      if (isNaN(val)) val = frequency;
      // Clamp between 1Hz and 24kHz
      val = Math.max(1, Math.min(24000, val));
      setFrequency(val);
      setInputValue(val.toFixed(2));
      setIsEditing(false);
  }

  const adjust = (amount: number) => {
    setFrequency(Math.max(1, Math.min(24000, frequency + amount)));
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-slate-900/80 rounded-3xl border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden w-full">
       <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500 ${isPlaying ? 'bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.5)]' : 'bg-slate-800'}`}></div>

       {/* Digital Display */}
       <div className="relative group w-full flex justify-center py-4">
            <div className="relative">
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    onFocus={() => setIsEditing(true)}
                    className={`text-6xl md:text-9xl font-mono font-bold text-center bg-transparent border-none focus:outline-none transition-all w-full min-w-[300px] z-10 relative
                    ${isPlaying ? 'text-sky-400 drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]' : 'text-slate-500'}
                    `}
                />
                <span className="absolute -bottom-4 right-0 text-slate-600 font-mono text-lg font-bold tracking-widest">HZ</span>
                {/* Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-slate-800/20 blur-3xl rounded-full pointer-events-none"></div>
            </div>
       </div>

       {/* Stepper Controls */}
       <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-center z-10 mt-4">
            {/* Step Down */}
            <button 
                onClick={() => adjust(-step)}
                className="p-6 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-sky-500 transition-all active:scale-95 shadow-lg group w-24 h-24 flex items-center justify-center"
            >
                <ChevronLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Step Size Selector */}
            <div className="flex flex-col items-center gap-3">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Step Size (Hz)</div>
                <div className="flex bg-slate-950 rounded-xl p-1.5 border border-slate-800 shadow-inner">
                    {[1, 5, 10, 50, 100].map(s => (
                        <button
                            key={s}
                            onClick={() => setStep(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-mono font-bold transition-all ${step === s ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/50' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Step Up */}
            <button 
                onClick={() => adjust(step)}
                className="p-6 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-sky-500 transition-all active:scale-95 shadow-lg group w-24 h-24 flex items-center justify-center"
            >
                <ChevronRight className="w-10 h-10 group-hover:translate-x-1 transition-transform" />
            </button>
       </div>
       
       {/* Fine Tuning Strip */}
       <div className="flex items-center gap-1 mt-4 px-4 py-2 bg-slate-950/50 rounded-full border border-slate-800/50">
            <span className="text-[10px] text-slate-600 font-bold uppercase mr-2">Fine Tune</span>
            <button onClick={() => adjust(-0.1)} className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-sky-400 border-r border-slate-800">-0.1</button>
            <button onClick={() => adjust(-1)} className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-sky-400">-1</button>
            <div className="w-px h-3 bg-slate-700 mx-1"></div>
            <button onClick={() => adjust(1)} className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-sky-400 border-r border-slate-800">+1</button>
            <button onClick={() => adjust(0.1)} className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-sky-400">+0.1</button>
       </div>
    </div>
  );
}

export default FrequencyDisplay;