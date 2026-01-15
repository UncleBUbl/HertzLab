
import React, { useState } from 'react';
import { Music, Radio, Activity, Zap, Wind, Ear, Sparkles, Heart, Anchor, Mountain, Bell } from 'lucide-react';
import { WaveformType } from '../types';

interface Preset {
  id: string;
  name: string;
  freq: number;
  wave: WaveformType;
  icon: React.ReactNode;
  desc: string;
}

interface PresetCategory {
    name: string;
    items: Preset[];
}

interface PresetLibraryProps {
  onSelect: (freq: number, wave: WaveformType) => void;
  currentFreq: number;
}

// Helper Icons
const SunIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
const EyeIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;

const categories: PresetCategory[] = [
    {
        name: "Instruments",
        items: [
            { id: 'tibetan_root', name: 'Tibetan Bowl (Root)', freq: 256, wave: 'bell', icon: <Bell className="w-4 h-4" />, desc: 'Deep resonance for grounding' },
            { id: 'tibetan_heart', name: 'Singing Bowl (Heart)', freq: 341, wave: 'bell', icon: <Heart className="w-4 h-4" />, desc: 'F Key bowl for emotional balance' },
            { id: 'crystal_bowl', name: 'Crystal Bowl', freq: 528, wave: 'bell', icon: <Sparkles className="w-4 h-4" />, desc: 'High pure tone for clarity' },
            { id: 'tingsha', name: 'Mindfulness Chime', freq: 2800, wave: 'bell', icon: <Wind className="w-4 h-4" />, desc: 'High frequency focal point' },
            { id: 'gong_bath', name: 'Deep Gong', freq: 110, wave: 'bell', icon: <Anchor className="w-4 h-4" />, desc: 'Low frequency vibration' },
        ]
    },
    {
        name: "Physics & Test",
        items: [
            { id: 'sub', name: 'Subwoofer Test', freq: 40, wave: 'sine', icon: <Activity className="w-4 h-4" />, desc: 'Deep bass response check' },
            { id: 'mains', name: 'Mains Hum (US)', freq: 60, wave: 'sine', icon: <Zap className="w-4 h-4" />, desc: 'Standard electrical hum' },
            { id: 'square', name: 'Square Wave', freq: 1000, wave: 'square', icon: <Radio className="w-4 h-4" />, desc: 'Harmonic rich signal' },
            { id: 'mosquito', name: 'Mosquito Tone', freq: 17400, wave: 'sine', icon: <Ear className="w-4 h-4" />, desc: 'High frequency hearing test' },
            { id: 'brown', name: 'Brown Noise', freq: 0, wave: 'brown-noise', icon: <Mountain className="w-4 h-4" />, desc: 'Deep rumble for sleep' },
        ]
    },
    {
        name: "Solfeggio",
        items: [
            { id: 'sol_174', name: 'Pain Relief', freq: 174, wave: 'sine', icon: <Activity className="w-4 h-4" />, desc: 'Foundation, grounding' },
            { id: 'sol_285', name: 'Healing Tissue', freq: 285, wave: 'sine', icon: <Heart className="w-4 h-4" />, desc: 'Restoration of organs' },
            { id: 'sol_396', name: 'Liberation', freq: 396, wave: 'sine', icon: <Anchor className="w-4 h-4" />, desc: 'Removing guilt and fear' },
            { id: 'sol_417', name: 'Change', freq: 417, wave: 'sine', icon: <Wind className="w-4 h-4" />, desc: 'Undoing situations' },
            { id: 'sol_528', name: 'Transformation', freq: 528, wave: 'sine', icon: <Sparkles className="w-4 h-4" />, desc: 'DNA Repair / Miracle' },
            { id: 'sol_639', name: 'Connecting', freq: 639, wave: 'sine', icon: <Music className="w-4 h-4" />, desc: 'Relationships & balance' },
            { id: 'sol_852', name: 'Awakening', freq: 852, wave: 'sine', icon: <Zap className="w-4 h-4" />, desc: 'Intuition & spiritual order' },
        ]
    },
    {
        name: "Chakras",
        items: [
            { id: 'root', name: 'Root Chakra', freq: 396, wave: 'sine', icon: <Anchor className="w-4 h-4" />, desc: 'Muladhara - Grounding' },
            { id: 'sacral', name: 'Sacral Chakra', freq: 417, wave: 'sine', icon: <Activity className="w-4 h-4" />, desc: 'Svadhishthana - Creativity' },
            { id: 'solar', name: 'Solar Plexus', freq: 528, wave: 'sine', icon: <SunIcon className="w-4 h-4" />, desc: 'Manipura - Confidence' },
            { id: 'heart', name: 'Heart Chakra', freq: 639, wave: 'sine', icon: <Heart className="w-4 h-4" />, desc: 'Anahata - Love' },
            { id: 'throat', name: 'Throat Chakra', freq: 741, wave: 'sine', icon: <Wind className="w-4 h-4" />, desc: 'Vishuddha - Expression' },
            { id: 'third', name: 'Third Eye', freq: 852, wave: 'sine', icon: <EyeIcon className="w-4 h-4" />, desc: 'Ajna - Intuition' },
            { id: 'crown', name: 'Crown Chakra', freq: 963, wave: 'sine', icon: <Sparkles className="w-4 h-4" />, desc: 'Sahasrara - Spirit' },
        ]
    }
];

const PresetLibrary: React.FC<PresetLibraryProps> = ({ onSelect, currentFreq }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden backdrop-blur-sm">
      
      {/* Header with Tabs */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-sky-500" />
            <h3 className="font-bold text-sm text-slate-200">Library</h3>
          </div>
          
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg overflow-x-auto custom-scrollbar">
              {categories.map((cat, idx) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveTab(idx)}
                    className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold whitespace-nowrap transition-all
                        ${activeTab === idx 
                            ? 'bg-slate-800 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-300'
                        }
                    `}
                  >
                      {cat.name}
                  </button>
              ))}
          </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div className="grid grid-cols-1 gap-2">
            {categories[activeTab].items.map((preset) => {
            const isActive = currentFreq === preset.freq;
            // For bell/noise, we check both freq and wave to determine "active" visually, 
            // since 432Hz Sine != 432Hz Bell
            const isSelected = isActive && preset.wave === (preset.wave || 'sine'); 
            // Simplified check for now:
            const highlight = (currentFreq === preset.freq);

            return (
                <button
                key={preset.id}
                onClick={() => onSelect(preset.freq, preset.wave)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden flex items-center gap-4
                    ${highlight
                    ? 'bg-sky-600/10 border-sky-500/50' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                >
                <div className={`p-2 rounded-lg ${highlight ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'} transition-colors`}>
                    {preset.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className={`font-bold text-xs ${highlight ? 'text-sky-300' : 'text-slate-200'}`}>{preset.name}</span>
                        {preset.freq > 0 && (
                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-900 px-1.5 rounded">
                                {preset.freq}Hz
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{preset.desc}</div>
                </div>
                </button>
            );
            })}
        </div>
      </div>
    </div>
  );
};

export default PresetLibrary;
