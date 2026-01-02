import React, { useEffect, useState } from 'react';
import { BreathPattern } from '../types';
import { Wind, Pause, Play } from 'lucide-react';

interface BreathVisualizerProps {
  isActive: boolean;
  onToggle: () => void;
}

const patterns: BreathPattern[] = [
  { name: 'Box Breathing', inhale: 4000, holdIn: 4000, exhale: 4000, holdOut: 4000, color: '#a855f7' },
  { name: 'Relax (4-7-8)', inhale: 4000, holdIn: 7000, exhale: 8000, holdOut: 0, color: '#38bdf8' },
  { name: 'Energy (4-2)', inhale: 4000, holdIn: 0, exhale: 2000, holdOut: 0, color: '#f59e0b' },
];

const BreathVisualizer: React.FC<BreathVisualizerProps> = ({ isActive, onToggle }) => {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(patterns[0]);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(1);
  
  // Animation Loop logic could be complex with JS, 
  // but let's use CSS transitions driven by JS state changes for smoothness
  
  useEffect(() => {
    if (!isActive) {
        setPhase('Inhale');
        setScale(1);
        return;
    }

    let timeoutId: any;
    
    const runCycle = async () => {
        // Inhale
        setPhase('Inhale');
        setScale(1.5); // Expand
        await new Promise(r => timeoutId = setTimeout(r, selectedPattern.inhale));
        
        // Hold In
        if (selectedPattern.holdIn > 0) {
            setPhase('Hold');
            await new Promise(r => timeoutId = setTimeout(r, selectedPattern.holdIn));
        }

        // Exhale
        setPhase('Exhale');
        setScale(1.0); // Contract
        await new Promise(r => timeoutId = setTimeout(r, selectedPattern.exhale));

        // Hold Out
        if (selectedPattern.holdOut > 0) {
            setPhase('Hold');
            await new Promise(r => timeoutId = setTimeout(r, selectedPattern.holdOut));
        }

        if (isActive) runCycle();
    };

    runCycle();

    return () => clearTimeout(timeoutId);
  }, [isActive, selectedPattern]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
                className="w-64 h-64 rounded-full blur-[100px] transition-all duration-[4000ms]"
                style={{ 
                    backgroundColor: selectedPattern.color, 
                    opacity: isActive ? 0.2 : 0,
                    transform: `scale(${isActive ? 1.5 : 0.8})` 
                }}
            ></div>
        </div>

        {/* Main Breathing Circle */}
        <div className="relative z-10 flex flex-col items-center">
            <div 
                className="w-64 h-64 rounded-full border-4 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all ease-in-out relative backdrop-blur-sm"
                style={{
                    borderColor: selectedPattern.color,
                    transform: `scale(${scale})`,
                    transitionDuration: phase === 'Inhale' ? `${selectedPattern.inhale}ms` : phase === 'Exhale' ? `${selectedPattern.exhale}ms` : '0ms'
                }}
            >
                <div 
                    className="w-full h-full rounded-full opacity-20 absolute inset-0"
                    style={{ backgroundColor: selectedPattern.color }}
                ></div>
                
                {isActive && (
                    <span className="text-2xl font-bold tracking-widest uppercase text-white drop-shadow-lg transition-none" style={{ transform: `scale(${1/scale})` }}>
                        {phase}
                    </span>
                )}
                {!isActive && (
                     <Wind className="w-16 h-16 text-white/50" />
                )}
            </div>
            
            {!isActive && <p className="mt-8 text-slate-400 text-sm">Select a pattern and press Start</p>}

            {/* Controls */}
            <div className="mt-12 flex flex-col gap-6 w-full max-w-sm z-20">
                 <div className="flex justify-center gap-2">
                    {patterns.map(p => (
                        <button
                            key={p.name}
                            onClick={() => setSelectedPattern(p)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedPattern.name === p.name ? 'bg-slate-800 text-white border-white/20' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'}`}
                        >
                            {p.name}
                        </button>
                    ))}
                 </div>

                 <button
                    onClick={onToggle}
                    className={`w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all
                        ${isActive 
                            ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800' 
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50 hover:scale-[1.02]'
                        }
                    `}
                 >
                    {isActive ? <><Pause className="w-4 h-4" /> Stop Session</> : <><Play className="w-4 h-4" /> Start Breathwork</>}
                 </button>
            </div>
        </div>
    </div>
  );
};

export default BreathVisualizer;