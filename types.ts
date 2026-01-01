export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface OscillatorSettings {
  frequency: number;
  waveform: WaveformType;
  volume: number; // 0.0 to 1.0
  isPlaying: boolean;
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
