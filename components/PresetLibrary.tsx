import React from 'react';
import { Music, Radio, Activity, Zap, Wind, Ear } from 'lucide-react';
import { WaveformType } from '../types';

interface Preset {
  id: string;
  name: string;
  freq: number;
  wave: WaveformType;
  icon: React.ReactNode;
  category: 'Test' | 'Music' | 'Physics' | 'Health';
  desc: string;
}

interface PresetLibraryProps {
  onSelect: (freq: number, wave: WaveformType) => void;
  currentFreq: number;
}

const presets: Preset[] = [
  { id: 'sub', name: 'Subwoofer Test', freq: 40, wave: 'sine', icon: <Activity className="w-4 h-4" />, category: 'Test', desc: 'Deep bass response check' },
  { id: 'mains', name: 'Mains Hum (US)', freq: 60, wave: 'sine', icon: <Zap className="w-4 h-4" />, category: 'Physics', desc: 'Standard electrical hum' },
  { id: 'tuning', name: 'Standard A4', freq: 440, wave: 'sine', icon: <Music className="w-4 h-4" />, category: 'Music', desc: 'Orchestral tuning pitch' },
  { id: 'solfeggio', name: 'DNA Repair', freq: 528, wave: 'sine', icon: <Wind className="w-4 h-4" />, category: 'Health', desc: 'Solfeggio "Miracle" tone' },
  { id: 'square', name: 'Square Wave', freq: 1000, wave: 'square', icon: <Radio className="w-4 h-4" />, category: 'Test', desc: 'Harmonic rich signal' },
  { id: 'mosquito', name: 'Mosquito Tone', freq: 17400, wave: 'sine', icon: <Ear className="w-4 h-4" />, category: 'Health', desc: 'High frequency hearing test' },
];

const PresetLibrary: React.FC<PresetLibraryProps> = ({ onSelect, currentFreq }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center gap-3 text-slate-200 mb-4">
        <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
            <Radio className="w-5 h-5 text-sky-500" />
        </div>
        <div>
            <h3 className="font-bold text-sm tracking-wide">Frequency Library</h3>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Quick Access Presets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scrollbar">
        {presets.map((preset) => {
          const isActive = currentFreq === preset.freq;
          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.freq, preset.wave)}
              className={`text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden
                ${isActive 
                  ? 'bg-sky-600/20 border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                  : 'bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                }`}
            >
              <div className="flex items-start justify-between mb-1">
                 <div className={`p-1.5 rounded-lg ${isActive ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-sky-400'} transition-colors`}>
                    {preset.icon}
                 </div>
                 <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${isActive ? 'border-sky-500/50 text-sky-300 bg-sky-900/30' : 'border-slate-700 text-slate-500 bg-slate-900'}`}>
                    {preset.freq}Hz
                 </span>
              </div>
              <div>
                  <div className={`font-bold text-xs ${isActive ? 'text-white' : 'text-slate-300'}`}>{preset.name}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{preset.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PresetLibrary;