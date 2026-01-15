
import React from 'react';
import { Play, Pause, Sparkles, Power } from 'lucide-react';

interface ChakraPanelProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  activeMask: boolean[];
  onToggleChakra: (index: number) => void;
}

const chakras = [
    { freq: 963, name: 'Crown', color: '#a855f7', desc: 'Spirit / Connection' }, // Purple
    { freq: 852, name: 'Third Eye', color: '#4f46e5', desc: 'Intuition / Insight' }, // Indigo
    { freq: 741, name: 'Throat', color: '#3b82f6', desc: 'Communication' }, // Blue
    { freq: 639, name: 'Heart', color: '#22c55e', desc: 'Love / Balance' }, // Green
    { freq: 528, name: 'Solar Plexus', color: '#eab308', desc: 'Confidence / Power' }, // Yellow
    { freq: 417, name: 'Sacral', color: '#f97316', desc: 'Creativity / Change' }, // Orange
    { freq: 396, name: 'Root', color: '#ef4444', desc: 'Grounding / Fear' }, // Red
];

const ChakraPanel: React.FC<ChakraPanelProps> = ({ isPlaying, onTogglePlay, activeMask, onToggleChakra }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto animate-fade-in-up">
        
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-green-400 to-purple-400">
                Chakra Alignment
            </h2>
            <p className="text-slate-400 text-sm mt-2">
                Simultaneous multi-band entrainment. Seven harmonic frequencies tuned to align the full energy body.
            </p>
        </div>

        <div className="flex flex-col-reverse gap-3 w-full max-w-md bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 opacity-90 z-0"></div>
            
            {chakras.map((chakra, index) => {
                const isActive = activeMask[index];
                return (
                    <div 
                        key={chakra.freq}
                        className="relative z-10 flex items-center gap-4 group"
                    >
                        {/* Icon Indicator */}
                        <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-700
                            ${(isPlaying && isActive)
                                ? `scale-110 border-white/20` 
                                : 'grayscale opacity-50 border-slate-700'
                            }
                            `}
                            style={{ 
                                backgroundColor: chakra.color,
                                boxShadow: (isPlaying && isActive) ? `0 0 20px ${chakra.color}60` : 'none',
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            {(isPlaying && isActive) && <Sparkles className="w-4 h-4 text-white animate-pulse" />}
                        </div>
                        
                        {/* Control Row */}
                        <div className={`flex-1 bg-slate-900/80 rounded-xl p-3 border flex justify-between items-center transition-all ${isActive ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}>
                            <div onClick={() => onToggleChakra(index)} className="cursor-pointer flex-1">
                                <div className={`font-bold text-sm ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>{chakra.name}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{chakra.desc}</div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <span className="font-mono font-bold text-slate-400 text-sm hidden sm:block">{chakra.freq} Hz</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleChakra(index);
                                    }}
                                    className={`p-2 rounded-lg transition-all ${isActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900 text-slate-600 hover:text-slate-400'}`}
                                    title={isActive ? "Mute Frequency" : "Unmute Frequency"}
                                >
                                    <Power className={`w-4 h-4 ${isActive ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="mt-8 w-full max-w-md">
            <button
                onClick={onTogglePlay}
                className={`w-full py-5 rounded-2xl font-bold text-lg tracking-widest uppercase flex items-center justify-center gap-3 transition-all shadow-xl
                    ${isPlaying 
                        ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white' 
                        : 'bg-gradient-to-r from-red-500 via-yellow-500 to-purple-600 text-white hover:scale-[1.02] shadow-orange-500/20'
                    }
                `}
            >
                {isPlaying ? <><Pause className="w-5 h-5"/> Stop Alignment</> : <><Play className="w-5 h-5"/> Align Chakras</>}
            </button>
            {isPlaying && <div className="text-center mt-4 text-[10px] text-slate-500 animate-pulse">Playing full spectrum audio...</div>}
        </div>

    </div>
  );
};

export default ChakraPanel;
