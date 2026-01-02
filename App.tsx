import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, Waves, Volume2, MoveRight, Info, Zap, Brain, Wind, Activity } from 'lucide-react';
import { WaveformType, SweepSettings, AppMode, BinauralSettings } from './types';
import { audioEngine } from './services/audioEngine';
import FrequencyDisplay from './components/FrequencyDisplay';
import Visualizer from './components/Visualizer';
import ChatInterface from './components/ChatInterface';
import SweepControls from './components/SweepControls';
import PresetLibrary from './components/PresetLibrary';
import BinauralPanel from './components/BinauralPanel';
import BreathVisualizer from './components/BreathVisualizer';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('generator');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showChat, setShowChat] = useState(false);
  
  // -- Generator State --
  const [frequency, setFrequency] = useState(432);
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  const [sweep, setSweep] = useState<SweepSettings>({
    active: false,
    startFreq: 200,
    endFreq: 1000,
    duration: 5,
    stepSize: 50,
    isStepMode: false,
  });

  // -- Binaural State --
  const [binauralSettings, setBinauralSettings] = useState<BinauralSettings>({
    carrierFreq: 200,
    beatFreq: 10, // Alpha
    waveform: 'sine',
  });

  // -- Breath State --
  const [isBreathActive, setIsBreathActive] = useState(false);

  // Refs for loop
  const sweepIntervalRef = useRef<number | null>(null);
  const sweepStartTimeRef = useRef<number>(0);

  // -- Audio Engine Logic --
  useEffect(() => {
    if (isPlaying) {
        if (mode === 'generator' || mode === 'breath') {
            // Mono / Standard Tone
            audioEngine.start(frequency, waveform, volume, 0);
        } else if (mode === 'binaural') {
            // Stereo / Binaural
            audioEngine.start(binauralSettings.carrierFreq, binauralSettings.waveform, volume, binauralSettings.beatFreq);
        }
    } else {
      audioEngine.stop();
    }
  }, [isPlaying, mode, frequency, waveform, binauralSettings.carrierFreq, binauralSettings.beatFreq, binauralSettings.waveform]); // Re-trigger on param change? Actually start handles param updates usually via separate setters, let's optimize.

  // Optimize Live Updates
  useEffect(() => {
    if (isPlaying) {
       audioEngine.setVolume(volume);
    }
  }, [volume, isPlaying]);

  useEffect(() => {
    if (isPlaying && (mode === 'generator' || mode === 'breath')) {
        audioEngine.setFrequencies(frequency, 0);
        audioEngine.setWaveform(waveform);
    }
    if (isPlaying && mode === 'binaural') {
        audioEngine.setFrequencies(binauralSettings.carrierFreq, binauralSettings.beatFreq);
        // Binaural usually stays Sine, but we allow wave change if needed
    }
  }, [frequency, waveform, binauralSettings, isPlaying, mode]);


  // -- Sweep Logic (Generator Only) --
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
        if (sweepIntervalRef.current) clearInterval(sweepIntervalRef.current);
    };
  }, []);

  const handlePresetSelect = (freq: number, wave: WaveformType) => {
    setFrequency(freq);
    setWaveform(wave);
  };

  const handleModeChange = (newMode: AppMode) => {
      setIsPlaying(false);
      stopSweep();
      setMode(newMode);
  }

  // Determine current effective frequency for Chat Context
  const currentChatFreq = mode === 'binaural' ? binauralSettings.beatFreq : frequency;
  const currentChatWave = mode === 'binaural' ? 'binaural' : waveform;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 custom-scrollbar">
        
        {/* Navigation Header */}
        <header className="px-6 py-4 border-b border-slate-900 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/20 ring-1 ring-white/10">
                  <Zap className="text-white w-5 h-5 fill-current" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">HertzLab</h1>
                  <p className="text-[10px] text-purple-400 font-mono uppercase tracking-widest">Mind & Frequency</p>
                </div>
              </div>

              {/* Mode Switcher (The "Swizard" Tabs) */}
              <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => handleModeChange('generator')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'generator' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <Activity className="w-4 h-4" /> Generator
                  </button>
                  <button 
                    onClick={() => handleModeChange('binaural')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'binaural' ? 'bg-purple-900/50 text-purple-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <Brain className="w-4 h-4" /> Binaural
                  </button>
                  <button 
                    onClick={() => handleModeChange('breath')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'breath' ? 'bg-sky-900/50 text-sky-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <Wind className="w-4 h-4" /> Breath
                  </button>
              </div>

              {/* AI Toggle */}
              <button 
                onClick={() => setShowChat(!showChat)}
                className={`hidden md:flex p-2.5 rounded-xl transition-all duration-300 border ${showChat ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-900/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <Info className="w-5 h-5" />
              </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
          
          {/* Top Area: Visualizer (Different per mode) */}
          <section className={`w-full relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-500 ${mode === 'breath' ? 'h-[600px] md:h-[650px]' : 'h-80'}`}>
              {mode === 'breath' ? (
                  <BreathVisualizer 
                    isActive={isBreathActive} 
                    onToggle={() => setIsBreathActive(!isBreathActive)} 
                  />
              ) : (
                  <Visualizer 
                    isPlaying={isPlaying} 
                    color={mode === 'binaural' ? '#d8b4fe' : '#38bdf8'} 
                  />
              )}
          </section>

          {/* Mode Specific Controls */}
          {mode === 'generator' && (
              <>
                {/* Standard Generator Interface */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up">
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        <FrequencyDisplay 
                            frequency={frequency} 
                            setFrequency={setFrequency} 
                            isPlaying={isPlaying} 
                        />
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Waveform</span>
                            <div className="flex gap-3">
                                {(['sine', 'square', 'sawtooth', 'triangle'] as WaveformType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setWaveform(type)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200
                                    ${waveform === type 
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
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
                    <div className="flex flex-col gap-6">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`flex-1 min-h-[140px] rounded-3xl font-bold text-2xl tracking-wide transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden group border
                                ${isPlaying 
                                ? 'bg-gradient-to-br from-red-500/10 to-red-900/10 border-red-500/50 text-red-500 hover:bg-red-500/20' 
                                : 'bg-gradient-to-br from-purple-600 to-indigo-600 border-transparent text-white hover:scale-[1.02] hover:shadow-purple-500/25'
                                }`}
                        >
                            {isPlaying ? (
                                <>
                                <Square className="w-12 h-12 fill-current animate-pulse" /> 
                                <span className="relative z-10">STOP</span>
                                </>
                            ) : (
                                <>
                                <Play className="w-12 h-12 fill-current ml-2" /> 
                                <span className="relative z-10">START</span>
                                </>
                            )}
                        </button>
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Volume2 className="w-4 h-4 text-purple-500" /> Master Gain
                                </label>
                                <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/50 px-2 py-1 rounded border border-purple-900">
                                    {(volume * 100).toFixed(0)}%
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.01" 
                                value={volume} 
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>
                    </div>
                </section>
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
              </>
          )}

          {mode === 'binaural' && (
              <section className="animate-fade-in-up">
                 <BinauralPanel 
                    settings={binauralSettings} 
                    setSettings={setBinauralSettings}
                    isPlaying={isPlaying}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                 />
                 
                 {/* Volume Control for Binaural */}
                 <div className="max-w-4xl mx-auto mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                     <div className="flex justify-between items-center mb-4">
                         <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                             <Volume2 className="w-4 h-4 text-purple-500" /> Master Volume
                         </label>
                     </div>
                     <input 
                         type="range" min="0" max="1" step="0.01" 
                         value={volume} 
                         onChange={(e) => setVolume(Number(e.target.value))}
                         className="w-full accent-purple-500"
                     />
                 </div>
              </section>
          )}

          {mode === 'breath' && (
             <div className="text-center max-w-2xl mx-auto mt-8 animate-fade-in-up">
                <h3 className="text-xl font-bold text-white mb-2">Synchronized Breathing</h3>
                <p className="text-slate-400">
                    Follow the visual guide above. Use the controls on the visualizer to start. 
                    <br/>
                    <span className="text-xs opacity-50 mt-2 block">(Optional) Audio accompaniment is played at 432Hz for relaxation.</span>
                </p>
                {/* Hidden audio controls for breath mode if user wants sound */}
                <div className="mt-8 p-4 border border-slate-800 rounded-xl bg-slate-900/50 inline-block">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-500 uppercase">Audio Aid</span>
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isPlaying ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                            {isPlaying ? 'Mute' : 'Enable Tone'}
                        </button>
                    </div>
                </div>
             </div>
          )}

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
            <div className={`lg:hidden absolute top-4 left-[-60px] transition-opacity ${showChat ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button onClick={() => setShowChat(false)} className="p-3 bg-slate-900 text-white rounded-l-xl shadow-xl border-y border-l border-slate-700">
                    <MoveRight className="w-6 h-6" />
                </button>
            </div>
            <ChatInterface currentFreq={currentChatFreq} currentWave={currentChatWave} />
         </div>
      </div>
    </div>
  );
};

export default App;