import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, Waves, Volume2, MoveRight, Info, Zap } from 'lucide-react';
import { WaveformType, SweepSettings } from './types';
import { audioEngine } from './services/audioEngine';
import FrequencyDisplay from './components/FrequencyDisplay';
import Visualizer from './components/Visualizer';
import ChatInterface from './components/ChatInterface';
import SweepControls from './components/SweepControls';
import PresetLibrary from './components/PresetLibrary';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(0.5);
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  const [showChat, setShowChat] = useState(false);
  
  // Sweep State
  const [sweep, setSweep] = useState<SweepSettings>({
    active: false,
    startFreq: 200,
    endFreq: 1000,
    duration: 5,
    stepSize: 50,
    isStepMode: false,
  });
  
  const sweepIntervalRef = useRef<number | null>(null);
  const sweepStartTimeRef = useRef<number>(0);

  // Audio Engine Synchronization
  useEffect(() => {
    if (isPlaying) {
      audioEngine.start(frequency, waveform, volume);
    } else {
      audioEngine.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]); 

  // Live Updates
  useEffect(() => {
    if (isPlaying) {
      audioEngine.setFrequency(frequency);
    }
  }, [frequency, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      audioEngine.setVolume(volume);
    }
  }, [volume, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      audioEngine.setWaveform(waveform);
    }
  }, [waveform, isPlaying]);

  // Sweep Logic
  const stopSweep = useCallback(() => {
    setSweep(s => ({ ...s, active: false }));
    if (sweepIntervalRef.current !== null) {
      clearInterval(sweepIntervalRef.current);
      sweepIntervalRef.current = null;
    }
  }, []);

  const startSweep = useCallback(() => {
    if (sweep.active) {
      stopSweep();
      return;
    }

    setSweep(s => ({ ...s, active: true }));
    sweepStartTimeRef.current = Date.now();
    setFrequency(sweep.startFreq);
    if (!isPlaying) setIsPlaying(true);

    sweepIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = (now - sweepStartTimeRef.current) / 1000;
      
      if (elapsed >= sweep.duration) {
        setFrequency(sweep.endFreq);
        stopSweep();
        return;
      }

      const progress = elapsed / sweep.duration;
      const range = sweep.endFreq - sweep.startFreq;
      let newFreq = sweep.startFreq + (range * progress);

      if (sweep.isStepMode) {
        const steps = Math.floor((newFreq - sweep.startFreq) / sweep.stepSize);
        newFreq = sweep.startFreq + (steps * sweep.stepSize);
      }

      setFrequency(newFreq);
    }, 50); 
  }, [sweep, isPlaying, stopSweep]);

  useEffect(() => {
    return () => {
      if (sweepIntervalRef.current !== null) {
        clearInterval(sweepIntervalRef.current);
      }
    };
  }, []);

  const handlePresetSelect = (freq: number, wave: WaveformType) => {
    setFrequency(freq);
    setWaveform(wave);
    // Optional: Auto-start if not playing? Let's keep manual control for safety.
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-sky-500/30">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        
        {/* Navbar */}
        <header className="px-8 py-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-900/20 ring-1 ring-white/10">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">HertzLab</h1>
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                 <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Generator Online</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`p-2.5 rounded-xl transition-all duration-300 border ${showChat ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-900/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}
          >
            <Info className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
          
          {/* Top Rack: Visualizer */}
          <section className="w-full animate-fade-in-up">
              <Visualizer isPlaying={isPlaying} color={isPlaying ? '#38bdf8' : '#475569'} />
          </section>

          {/* Middle Rack: Frequency & Global Controls */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
             {/* Left: Main Freq Controls (Spans 2 cols) */}
             <div className="xl:col-span-2 flex flex-col gap-6">
                <FrequencyDisplay 
                   frequency={frequency} 
                   setFrequency={(f) => {
                     setFrequency(f);
                   }} 
                   isPlaying={isPlaying} 
                />
                
                {/* Waveform Selection Strip */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Waveform Source</span>
                     <div className="flex gap-3">
                        {(['sine', 'square', 'sawtooth', 'triangle'] as WaveformType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setWaveform(type)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200
                            ${waveform === type 
                                ? 'bg-sky-600 border-sky-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]' 
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            <Waves className="w-4 h-4" />
                            <span className="text-xs uppercase font-bold tracking-wider">{type}</span>
                        </button>
                        ))}
                     </div>
                </div>
             </div>

             {/* Right: Master Control & Settings */}
             <div className="flex flex-col gap-6">
                {/* Master Play Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex-1 min-h-[140px] rounded-3xl font-bold text-2xl tracking-wide transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden group border
                    ${isPlaying 
                      ? 'bg-gradient-to-br from-red-500/10 to-red-900/10 border-red-500/50 text-red-500 hover:bg-red-500/20' 
                      : 'bg-gradient-to-br from-sky-500 to-blue-600 border-transparent text-white hover:scale-[1.02] hover:shadow-sky-500/25'
                    }`}
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    {isPlaying ? (
                        <>
                        <Square className="w-12 h-12 fill-current animate-pulse" /> 
                        <span className="relative z-10">STOP SIGNAL</span>
                        </>
                    ) : (
                        <>
                        <Play className="w-12 h-12 fill-current ml-2" /> 
                        <span className="relative z-10">START SIGNAL</span>
                        </>
                    )}
                </button>

                {/* Volume Slider */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                     <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                           <Volume2 className="w-4 h-4 text-sky-500" /> Master Gain
                        </label>
                        <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/50 px-2 py-1 rounded border border-sky-900">
                            {(volume * 100).toFixed(0)}%
                        </span>
                     </div>
                     <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={volume} 
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer hover:bg-slate-700 accent-sky-500"
                      />
                </div>
             </div>
          </section>

          {/* Bottom Rack: Advanced Modules */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              <SweepControls 
                  sweep={sweep}
                  setSweep={setSweep}
                  startSweep={startSweep}
                  stopSweep={stopSweep}
              />
              
              <PresetLibrary 
                onSelect={handlePresetSelect} 
                currentFreq={frequency}
              />
          </section>
        </main>
      </div>

      {/* Side Panel (Chat) */}
      <div 
        className={`fixed inset-y-0 right-0 transform transition-transform duration-300 ease-in-out z-50
          ${showChat ? 'translate-x-0' : 'translate-x-full'}
          lg:relative lg:translate-x-0 lg:w-96 lg:block
          ${showChat ? 'shadow-[-20px_0_50px_rgba(0,0,0,0.8)] border-l border-slate-800' : ''}
        `}
      >
         <div className="h-full w-full lg:w-96 bg-slate-950 relative">
            {/* Close Mobile Button */}
            <div className={`lg:hidden absolute top-4 left-[-60px] transition-opacity ${showChat ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button 
                    onClick={() => setShowChat(false)}
                    className="p-3 bg-slate-900 text-white rounded-l-xl shadow-xl border-y border-l border-slate-700 flex items-center justify-center"
                >
                    <MoveRight className="w-6 h-6" />
                </button>
            </div>
            <ChatInterface currentFreq={frequency} currentWave={waveform} />
         </div>
      </div>
    </div>
  );
};

export default App;