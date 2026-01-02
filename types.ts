export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type AppMode = 'generator' | 'binaural' | 'breath';

export interface OscillatorSettings {
  frequency: number;
  waveform: WaveformType;
  volume: number; // 0.0 to 1.0
  isPlaying: boolean;
}

export interface BinauralSettings {
  carrierFreq: number;
  beatFreq: number; // The difference (e.g., 4Hz for Theta)
  waveform: WaveformType;
}

export interface SweepSettings {
  active: boolean;
  startFreq: number;
  endFreq: number;
  duration: number; // in seconds
  stepSize: number; // For step mode, in Hz
  isStepMode: boolean; // True for step, False for smooth
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface BreathPattern {
  name: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  color: string;
}