
import React from 'react';
import { X, Activity, Brain, Wind, Sparkles, Zap, Smartphone, Headphones } from 'lucide-react';

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl relative">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-6 flex items-center justify-between z-10">
          <div>
             <h2 className="text-2xl font-bold text-white">About HertzLab</h2>
             <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Guide & Documentation</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
            
            {/* Intro */}
            <div className="text-slate-300 leading-relaxed text-sm">
                <p>
                    HertzLab is a professional-grade audio toolkit designed for audiophiles, sound engineers, and wellness practitioners. 
                    Whether you are testing audio equipment, exploring sound physics, or practicing meditation, this suite provides precise control over sound generation.
                </p>
            </div>

            {/* Feature Grid */}
            <div className="grid gap-6">
                
                {/* Generator */}
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-3 mb-3 text-sky-400">
                        <Activity className="w-5 h-5" />
                        <h3 className="font-bold">Frequency Generator</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        Generate precise tones from 1Hz to 24kHz using various waveforms (Sine, Square, Sawtooth, Triangle) and noise colors.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-300">
                        <li className="flex gap-2">
                            <span className="text-sky-500 font-bold">•</span>
                            <span><strong>Sweep Mode:</strong> Automate frequency transitions over time. Useful for finding resonant frequencies or testing subwoofer crossover points.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-sky-500 font-bold">•</span>
                            <span><strong>Fine Tuning:</strong> Use the stepper controls to adjust precise decimal values for physics experiments.</span>
                        </li>
                    </ul>
                </div>

                {/* Binaural */}
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-3 mb-3 text-purple-400">
                        <Brain className="w-5 h-5" />
                        <h3 className="font-bold">Brainwave Entrainment</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        Utilize psychoacoustic phenomena to influence brain states for focus, relaxation, or sleep.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-2 mb-1 text-slate-200 text-xs font-bold">
                                <Headphones className="w-3 h-3" /> Binaural Beats
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Sends slightly different frequencies to each ear. The brain constructs the difference (the "beat"). 
                                <span className="text-purple-400 block mt-1">Requires Headphones.</span>
                            </p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-2 mb-1 text-slate-200 text-xs font-bold">
                                <Zap className="w-3 h-3" /> Isochronic Tones
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Uses rapid amplitude modulation (pulsing volume) to create the rhythm. Effective on speakers or headphones.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Breath */}
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-3 mb-3 text-emerald-400">
                        <Wind className="w-5 h-5" />
                        <h3 className="font-bold">Breathwork Visualizer</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        A visual guide for rhythmic breathing. Synchronizing your breath with the expanding and contracting circle can help regulate the nervous system.
                        Includes presets for Box Breathing (Focus) and 4-7-8 (Relaxation).
                    </p>
                </div>

                {/* AI */}
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-3 mb-3 text-amber-400">
                        <Sparkles className="w-5 h-5" />
                        <h3 className="font-bold">AI Sound Lab</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Click the <Sparkles className="w-3 h-3 inline mx-1" /> icon to chat with the AI Consultant. 
                        Ask about the physics of specific frequencies, get help calculating wavelengths, or ask for recommended settings for specific tasks.
                    </p>
                </div>
            </div>

            {/* Footer / Mobile Note */}
            <div className="flex items-start gap-3 p-4 bg-sky-900/10 rounded-xl border border-sky-900/30">
                <Smartphone className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400">
                    <strong className="text-sky-300 block mb-1">Mobile Users</strong>
                    To ensure uninterrupted audio playback when your screen locks, the app plays a silent audio track in the background. 
                    However, keeping the screen active (or using the visualizer) is recommended for the best experience.
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
