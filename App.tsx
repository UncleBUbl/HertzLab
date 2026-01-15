
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, Waves, Volume2, MoveRight, Info, Zap, Brain, Wind, Activity, Clock, AlertTriangle, MessageSquareText, Sparkles, Bell, Layers } from 'lucide-react';
import { WaveformType, SweepSettings, AppMode, BinauralSettings } from './types';
import { audioEngine } from './services/audioEngine';
import FrequencyDisplay from './components/FrequencyDisplay';
import Visualizer from './components/Visualizer';
import ChatInterface from './components/ChatInterface';
import SweepControls from './components/SweepControls';
import PresetLibrary from './components/PresetLibrary';
import BinauralPanel from './components/BinauralPanel';
import BreathVisualizer from './components/BreathVisualizer';
import ChakraPanel from './components/ChakraPanel';
import InfoModal from './components/InfoModal';

// Standard silent WAV data URI to keep audio context unlocked on mobile without errors
const SILENT_AUDIO_URI = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

const App: React.FC = () => {
  // mode = UI View (Navigation)
  // playingMode = Which audio engine configuration is active
  const [mode, setMode] = useState<AppMode>('generator');
  const [playingMode, setPlayingMode] = useState<AppMode>('generator'); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4); 
  const [showChat, setShowChat] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // -- Mobile Background Audio Hack --
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // -- Timer State --
  const [timerDuration, setTimerDuration] = useState<number>(0); 
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

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
    beatFreq: 10,
    waveform: 'sine',
    entrainmentMethod: 'binaural',
  });

  // -- Chakra State --
  const [chakraMask, setChakraMask] = useState<boolean[]>(new Array(7).fill(true));

  // -- Breath State --
  const [isBreathActive, setIsBreathActive] = useState(false);

  // Refs for loop
  const sweepIntervalRef = useRef<number | null>(null);
  const sweepStartTimeRef = useRef<number>(0);

  // -- Initialize Audio Element --
  useEffect(() => {
    // This audio element plays silence to keep the audio session active on mobile devices
    // when the screen is locked or app is backgrounded.
    const audio = new Audio(SILENT_AUDIO_URI);
    audio.loop = true;
    audio.volume = 0.01; // Nearly silent
    audioRef.current = audio;

    return () => {
        audio.pause();
        audio.src = '';
    };
  }, []);

  // -- Timer Logic --
  useEffect(() => {
    if (isPlaying && timerDuration > 0) {
        setTimeLeft(timerDuration * 60);
        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsPlaying(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    } else {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (!isPlaying) setTimeLeft(0);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timerDuration]);

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // -- Audio Engine Logic --
  useEffect(() => {
    const triggerAudio = async () => {
        if (isPlaying) {
            // Start background silence hack for mobile
            if (audioRef.current && audioRef.current.paused) {
                try {
                    await audioRef.current.play();
                } catch(e) {
                    // Silent catch, browser policy might block auto-play until interaction
                }
            }

            // Start Actual Web Audio based on PLAYING MODE (not UI mode)
            if (playingMode === 'generator' || playingMode === 'breath') {
                audioEngine.start(frequency, waveform, volume, 0);
            } else if (playingMode === 'binaural') {
                audioEngine.start(
                    binauralSettings.carrierFreq, 
                    binauralSettings.waveform, 
                    volume, 
                    binauralSettings.beatFreq,
                    binauralSettings.entrainmentMethod
                );
            } else if (playingMode === 'chakra') {
                // NEW: Chakra Mode with masking
                audioEngine.startChakraMode(volume, chakraMask);
            }
        } else {
            // Stop background silence
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
            }

            // Stop Web Audio
            audioEngine.stop(timeLeft === 0 && timerDuration > 0 ? 1 : 0.2);
        }
    };
    triggerAudio();
  }, [isPlaying, playingMode]); 

  // Parameter Updates (Live)
  useEffect(() => {
    if (isPlaying) {
       audioEngine.setVolume(volume);
    }
  }, [volume, isPlaying]);

  useEffect(() => {
      if(isPlaying) {
         if (playingMode === 'generator' || playingMode === 'breath') {
             audioEngine.start(frequency, waveform, volume, 0);
         }
      }
  }, [waveform]);

  useEffect(() => {
    // Only update frequencies if the playing mode matches the controls being touched
    if (isPlaying && (playingMode === 'generator' || playingMode === 'breath') && !waveform.includes('noise')) {
        audioEngine.setFrequencies(frequency, 0);
    }
    if (isPlaying && playingMode === 'binaural') {
        audioEngine.setFrequencies(binauralSettings.carrierFreq, binauralSettings.beatFreq);
    }
  }, [frequency, binauralSettings.carrierFreq, binauralSettings.beatFreq, isPlaying, playingMode]);
  
  useEffect(() => {
      if (isPlaying && playingMode === 'binaural') {
          audioEngine.start(
            binauralSettings.carrierFreq, 
            binauralSettings.waveform, 
            volume, 
            binauralSettings.beatFreq,
            binauralSettings.entrainmentMethod
        );
      }
  }, [binauralSettings.entrainmentMethod]);


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
    
    // If not already playing generator, switch to it
    if (!isPlaying || playingMode !== 'generator') {
        setPlayingMode('generator');
        setIsPlaying(true);
    }

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
  }, [sweep, isPlaying, playingMode, stopSweep]);

  useEffect(() => {
    return () => {
        if (sweepIntervalRef.current) clearInterval(sweepIntervalRef.current);
    };
  }, []);
  
  // Stop sweep if we switch audio engines completely (e.g. to Binaural)
  useEffect(() => {
      if (playingMode === 'binaural' && sweep.active) {
          stopSweep();
      }
  }, [playingMode, sweep.active, stopSweep]);


  const handlePresetSelect = (freq: number, wave: WaveformType) => {
    setFrequency(freq);
    setWaveform(wave);
    setPlayingMode('generator');
    if (!isPlaying) setIsPlaying(true);
  };

  const handleModeChange = (newMode: AppMode) => {
      setMode(newMode);
  }

  const togglePlayback = (targetMode: AppMode) => {
      // FIX: Explicitly resume context on user gesture (click/tap) for mobile
      audioEngine.resumeContext();

      if (isPlaying && playingMode === targetMode) {
          setIsPlaying(false);
      } else {
          setPlayingMode(targetMode);
          setIsPlaying(true);
      }
  };

  // -- Toggle individual chakra freq --
  const toggleChakra = (index: number) => {
    const newMask = [...chakraMask];
    newMask[index] = !newMask[index];
    setChakraMask(newMask);

    // Live update if playing
    if (isPlaying && playingMode === 'chakra') {
        audioEngine.setChakraStatus(index, newMask[index]);
    }
  };

  const currentChatFreq = playingMode === 'binaural' ? binauralSettings.beatFreq : frequency;
  const currentChatWave = playingMode === 'binaural' ? 'binaural' : waveform;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 custom-scrollbar">
        
        {/* Navigation Header */}
        <header className="px-6 py-4 border-b border-slate-900 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Logo */}
              <div className="flex items-center gap-3 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-sky-500/10 opacity-100"></div>
                  <img 
                    src="logo.png" 
                    alt="HertzLab" 
                    className="w-full h-full object-contain p-1.5 relative z-10 transition-transform duration-500 group-hover:scale-110" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('bg-gradient-to-tr', 'from-purple-600', 'to-indigo-600');
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
                      e.currentTarget.parentElement?.appendChild(icon);
                  }}/>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-sky-400 transition-all duration-300">HertzLab</h1>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] group-hover:text-purple-400 transition-colors">Mind & Frequency</p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
                  <button 
                    onClick={() => handleModeChange('generator')}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${mode === 'generator' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <Activity className="w-4 h-4" /> Generator
                  </button>
                  <button 
                    onClick={() => handleModeChange('binaural')}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${mode === 'binaural' ? 'bg-purple-900/50 text-purple-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <Brain className="w-4 h-4" /> Binaural
                  </button>
                  <button 
                    onClick={() => handleModeChange('chakra')}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${mode === 'chakra' ? 'bg-orange-900/50 text-orange-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <Layers className="w-4 h-4" /> Alignment
                  </button>
                  <button 
                    onClick={() => handleModeChange('breath')}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${mode === 'breath' ? 'bg-sky-900/50 text-sky-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <Wind className="w-4 h-4" /> Breath
                  </button>
              </div>

              {/* Action Buttons: Chat & Info */}
              <div className="flex items-center gap-2 hidden lg:flex">
                  <button 
                    onClick={() => setShowChat(!showChat)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 border font-bold text-xs ${showChat ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    title="AI Audio Assistant"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Chat AI</span>
                  </button>

                  <button 
                    onClick={() => setShowInfo(true)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    title="About & Guide"
                  >
                    <Info className="w-5 h-5" />
                  </button>
              </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
          
          {/* Top Area: Visualizer */}
          <section className={`w-full relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-500 ${mode === 'breath' ? 'h-[600px] md:h-[650px]' : 'h-80'}`}>
              {mode === 'breath' ? (
                  <BreathVisualizer 
                    isActive={isBreathActive} 
                    onToggle={() => setIsBreathActive(!isBreathActive)} 
                  />
              ) : (
                  <Visualizer 
                    isPlaying={isPlaying} 
                    // Visualizer color reflects the ACTIVE audio source, not just the UI mode
                    color={playingMode === 'binaural' ? '#d8b4fe' : playingMode === 'chakra' ? '#f59e0b' : '#38bdf8'} 
                  />
              )}
          </section>

          {/* Mode Specific Controls */}
          {mode === 'generator' && (
              <>
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up">
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        <FrequencyDisplay 
                            frequency={frequency} 
                            setFrequency={setFrequency} 
                            // Only animate/highlight if generator is the source of sound
                            isPlaying={isPlaying && (playingMode === 'generator' || playingMode === 'breath')} 
                        />
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Source Type</span>
                            
                            {/* Standard Oscillators */}
                            <div className="flex gap-3 flex-wrap">
                                {(['sine', 'square', 'sawtooth', 'triangle', 'bell'] as WaveformType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setWaveform(type)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 flex-1 justify-center
                                    ${waveform === type 
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    {type === 'bell' ? <Bell className="w-4 h-4"/> : <Waves className="w-4 h-4" />}
                                    <span className="text-xs uppercase font-bold tracking-wider">{type}</span>
                                </button>
                                ))}
                            </div>
                            
                            {/* Noise Generators */}
                            <div className="flex gap-3 pt-2 border-t border-slate-800/50">
                                {(['white-noise', 'pink-noise', 'brown-noise'] as WaveformType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setWaveform(type)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-[10px] uppercase font-bold tracking-wider flex-1 justify-center
                                        ${waveform === type 
                                            ? 'bg-sky-600 border-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.2)]' 
                                            : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        <Wind className="w-3 h-3" />
                                        {type.replace('-noise', '')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        {/* Play Button */}
                        <button
                            onClick={() => togglePlayback('generator')}
                            className={`flex-1 min-h-[140px] rounded-3xl font-bold text-2xl tracking-wide transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden group border
                                ${isPlaying && (playingMode === 'generator')
                                ? 'bg-gradient-to-br from-red-500/10 to-red-900/10 border-red-500/50 text-red-500 hover:bg-red-500/20' 
                                : 'bg-gradient-to-br from-purple-600 to-indigo-600 border-transparent text-white hover:scale-[1.02] hover:shadow-purple-500/25'
                                }`}
                        >
                            {isPlaying && (playingMode === 'generator') ? (
                                <>
                                {timeLeft > 0 && <span className="absolute top-4 right-4 text-xs font-mono font-bold text-red-400">{formatTime(timeLeft)}</span>}
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
                        
                        {/* Control Panel: Volume & Timer */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
                            
                            {/* Volume */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                        <Volume2 className="w-4 h-4 text-purple-500" /> Gain
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

                            {/* Timer */}
                            <div className="space-y-3 border-t border-slate-800 pt-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-sky-500" /> Auto-Off
                                    </label>
                                    <span className="text-xs font-mono font-bold text-sky-400">
                                        {timerDuration === 0 ? 'OFF' : `${timerDuration} min`}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {[0, 15, 30, 60].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTimerDuration(t)}
                                            className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-colors ${timerDuration === t ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-600'}`}
                                        >
                                            {t === 0 ? '∞' : t}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                    isPlaying={isPlaying && playingMode === 'binaural'}
                    onTogglePlay={() => togglePlayback('binaural')}
                 />
                 
                 {/* Volume & Timer Control for Binaural */}
                 <div className="max-w-4xl mx-auto mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-8">
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Volume2 className="w-4 h-4 text-purple-500" /> Master Volume
                            </label>
                            <span className="text-xs font-mono font-bold text-purple-400">{Math.round(volume * 100)}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={volume} 
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="w-full accent-purple-500"
                        />
                     </div>
                     <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8">
                         <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Clock className="w-4 h-4 text-sky-500" /> Session Timer
                            </label>
                            <span className="text-xs font-mono font-bold text-sky-400">
                                {isPlaying && timerDuration > 0 ? formatTime(timeLeft) : (timerDuration === 0 ? '∞' : `${timerDuration}m`)}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {[0, 15, 30, 45, 60].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTimerDuration(t)}
                                    className={`flex-1 py-2 rounded text-[10px] font-bold border transition-colors ${timerDuration === t ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-600'}`}
                                >
                                    {t === 0 ? '∞' : t}
                                </button>
                            ))}
                        </div>
                     </div>
                 </div>
              </section>
          )}

          {mode === 'chakra' && (
              <section className="animate-fade-in-up">
                  <ChakraPanel 
                    isPlaying={isPlaying && playingMode === 'chakra'}
                    onTogglePlay={() => togglePlayback('chakra')}
                    activeMask={chakraMask}
                    onToggleChakra={toggleChakra}
                  />

                  {/* Volume Control for Chakra */}
                 <div className="max-w-md mx-auto mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                     <div className="flex justify-between items-center mb-4">
                         <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                             <Volume2 className="w-4 h-4 text-orange-500" /> Intensity
                         </label>
                         <span className="text-xs font-mono font-bold text-orange-400">{Math.round(volume * 100)}%</span>
                     </div>
                     <input 
                         type="range" min="0" max="1" step="0.01" 
                         value={volume} 
                         onChange={(e) => setVolume(Number(e.target.value))}
                         className="w-full accent-orange-500"
                     />
                  </div>
              </section>
          )}

          {mode === 'breath' && (
             <div className="text-center max-w-2xl mx-auto mt-8 animate-fade-in-up">
                <h3 className="text-xl font-bold text-white mb-2">Synchronized Breathing</h3>
                <p className="text-slate-400">
                    Follow the visual guide above. Use the controls on the visualizer to start. 
                </p>
                
                <div className="mt-8 p-4 border border-slate-800 rounded-xl bg-slate-900/50 inline-block">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-500 uppercase">Audio Aid (432Hz)</span>
                            <button 
                                onClick={() => togglePlayback('breath')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isPlaying && (playingMode === 'generator' || playingMode === 'breath') ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                            >
                                {isPlaying && (playingMode === 'generator' || playingMode === 'breath') ? 'Active' : 'Muted'}
                            </button>
                        </div>
                        {/* Hidden Volume control for breath */}
                        {isPlaying && (
                             <input 
                                type="range" min="0" max="1" step="0.01" 
                                value={volume} 
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-full accent-purple-500 h-1"
                            />
                        )}
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
            <ChatInterface 
                currentFreq={currentChatFreq} 
                currentWave={currentChatWave} 
                onClose={() => setShowChat(false)}
            />
         </div>
      </div>
    </div>
  );
};

export default App;
