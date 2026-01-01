import React from 'react';
import { Play, Square, Activity, ArrowRightLeft } from 'lucide-react';
import { SweepSettings } from '../types';

interface SweepControlsProps {
    sweep: SweepSettings;
    setSweep: React.Dispatch<React.SetStateAction<SweepSettings>>;
    startSweep: () => void;
    stopSweep: () => void;
}

const SweepControls: React.FC<SweepControlsProps> = ({ sweep, setSweep, startSweep, stopSweep }) => {
    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
            {sweep.active && <div className="absolute top-0 left-0 w-full h-0.5 bg-sky-500 animate-pulse-slow"></div>}
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-slate-200">
                    <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                        <ArrowRightLeft className="w-5 h-5 text-sky-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide">Automation</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Sweep & Step</p>
                    </div>
                </div>
                <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800">
                    <button 
                        onClick={() => setSweep(s => ({...s, isStepMode: false}))}
                        className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${!sweep.isStepMode ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Smooth
                    </button>
                    <button 
                        onClick={() => setSweep(s => ({...s, isStepMode: true}))}
                        className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${sweep.isStepMode ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Step
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                 <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start</label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                value={sweep.startFreq} 
                                onChange={(e) => setSweep(s => ({...s, startFreq: Number(e.target.value)}))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-300 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                            />
                            <span className="absolute right-3 top-2 text-[10px] text-slate-600 font-mono font-bold">HZ</span>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End</label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                value={sweep.endFreq} 
                                onChange={(e) => setSweep(s => ({...s, endFreq: Number(e.target.value)}))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-300 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                            />
                            <span className="absolute right-3 top-2 text-[10px] text-slate-600 font-mono font-bold">HZ</span>
                        </div>
                     </div>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration</label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                value={sweep.duration} 
                                onChange={(e) => setSweep(s => ({...s, duration: Number(e.target.value)}))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-300 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                            />
                            <span className="absolute right-3 top-2 text-[10px] text-slate-600 font-mono font-bold">SEC</span>
                        </div>
                     </div>
                     <div className={`space-y-1 transition-all duration-300 ${!sweep.isStepMode ? 'opacity-20 blur-[1px] pointer-events-none' : 'opacity-100'}`}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step Size</label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                value={sweep.stepSize} 
                                onChange={(e) => setSweep(s => ({...s, stepSize: Number(e.target.value)}))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-300 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                            />
                            <span className="absolute right-3 top-2 text-[10px] text-slate-600 font-mono font-bold">HZ</span>
                        </div>
                     </div>
                 </div>
            </div>

            <button 
                onClick={sweep.active ? stopSweep : startSweep}
                className={`w-full py-4 rounded-xl font-bold text-xs tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-3
                  ${sweep.active 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                    : 'bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-900/50 hover:shadow-sky-500/30 border border-transparent'
                  }`}
            >
                {sweep.active ? <><Square className="w-4 h-4 fill-current"/> Stop</> : <><Play className="w-4 h-4 fill-current"/> Start Loop</>}
            </button>
        </div>
    );
};

export default SweepControls;