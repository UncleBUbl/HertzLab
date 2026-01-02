import React from 'react';
import { Brain, Moon, Zap, Sun, Coffee, Sparkles } from 'lucide-react';
import { BinauralSettings, WaveformType } from '../types';

interface BinauralPanelProps {
  settings: BinauralSettings;
  setSettings: (s: BinauralSettings) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const waves = [
  { name: 'Delta', range: '0.5 - 4 Hz', freq: 2, icon: <Moon className="w-4 h-4" />, desc: 'Deep Sleep, Healing' },
  { name: 'Theta', range: '4 - 7 Hz', freq: 5, icon: <Sparkles className="w-4 h-4" />, desc: 'Meditation, Creativity' },
  { name: 'Alpha', range: '7 - 13 Hz', freq: 10, icon: <Coffee className="w-4 h-4" />, desc: 'Relaxation, Focus' },
  { name: 'Beta', range: '13 - 30 Hz', freq: 20, icon: <Sun className="w-4 h-4" />, desc: 'Active Thinking, Alert' },
  { name: 'Gamma', range: '30+ Hz', freq: 40, icon: <Zap className="w-4 h-4" />, desc: 'High Level Cognition' },
];

const BinauralPanel: React.FC<BinauralPanelProps> = ({ settings, setSettings, isPlaying, onTogglePlay }) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Intro / Status */}
        <div className="text-center space-y-2 mb-4">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                Brainwave Entrainment
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Use stereo headphones. This module plays two slightly different frequencies to create a "phantom" beat inside your brain, encouraging specific mental states.
            </p>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {waves.map((w) => {
                const isActive = settings.beatFreq === w.freq;
                return (
                    <button
                        key={w.name}
                        onClick={() => setSettings({ ...settings, beatFreq: w.freq })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group
                            ${isActive 
                                ? 'bg-purple-900/30 border-purple-500/50 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-800'
                            }
                        `}
                    >
                        <div className={`p-2 rounded-full ${isActive ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {w.icon}
                        </div>
                        <div className="text-center z-10">
                            <div className="font-bold text-sm">{w.name}</div>
                            <div className="text-[10px] opacity-70">{w.range}</div>
                        </div>
                    </button>
                )
            })}
        </div>

        {/* Manual Controls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Carrier Frequency */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Base Pitch (Carrier)</label>
                    <span className="font-mono text-xl font-bold text-purple-400">{settings.carrierFreq} Hz</span>
                </div>
                <input 
                    type="range" 
                    min="100" max="600" step="1"
                    value={settings.carrierFreq}
                    onChange={(e) => setSettings({...settings, carrierFreq: Number(e.target.value)})}
                    className="w-full accent-purple-500"
                />
                <p className="text-[10px] text-slate-500">
                    Lower pitch (100-200Hz) is better for relaxation. Higher pitch for focus.
                </p>
            </div>

            {/* Beat Frequency */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Brainwave</label>
                    <span className="font-mono text-xl font-bold text-pink-400">{settings.beatFreq} Hz</span>
                </div>
                <input 
                    type="range" 
                    min="1" max="50" step="0.5"
                    value={settings.beatFreq}
                    onChange={(e) => setSettings({...settings, beatFreq: Number(e.target.value)})}
                    className="w-full accent-pink-500"
                />
                <p className="text-[10px] text-slate-500">
                    This is the difference between Left and Right ears.
                </p>
            </div>
        </div>

        {/* Play Action */}
        <button
            onClick={onTogglePlay}
            className={`w-full py-6 rounded-3xl font-bold text-lg tracking-widest uppercase transition-all flex items-center justify-center gap-4 shadow-2xl
                ${isPlaying 
                    ? 'bg-slate-900 border border-purple-500/30 text-purple-400 hover:bg-purple-900/10' 
                    : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white hover:scale-[1.01] hover:shadow-purple-500/25'
                }
            `}
        >
             {isPlaying ? 'Stop Session' : 'Begin Entrainment'}
        </button>

    </div>
  );
};

export default BinauralPanel;