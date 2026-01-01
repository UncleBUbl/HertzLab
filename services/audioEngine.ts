import { WaveformType } from '../types';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  public analyser: AnalyserNode | null = null;

  constructor() {
    // Lazy initialization in init() to handle browser policies
  }

  public init() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      this.gainNode = this.audioContext.createGain();
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = 2048;
      
      // Connect Graph: Osc -> Gain -> Analyser -> Destination
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      this.gainNode.gain.value = 0; // Start silent
    }
  }

  public async start(frequency: number, type: WaveformType, volume: number) {
    if (!this.audioContext) this.init();
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Stop existing oscillator if any
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
    }

    this.oscillator = this.audioContext!.createOscillator();
    this.oscillator.type = type;
    this.oscillator.frequency.setValueAtTime(frequency, this.audioContext!.currentTime);
    
    // Smooth start to avoid pop
    this.gainNode!.gain.cancelScheduledValues(this.audioContext!.currentTime);
    this.gainNode!.gain.setValueAtTime(0, this.audioContext!.currentTime);
    this.gainNode!.gain.linearRampToValueAtTime(volume, this.audioContext!.currentTime + 0.1);

    this.oscillator.connect(this.gainNode!);
    this.oscillator.start();
  }

  public stop() {
    if (this.oscillator && this.gainNode && this.audioContext) {
      // Smooth stop
      const currentTime = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.1);

      setTimeout(() => {
        if (this.oscillator) {
          this.oscillator.stop();
          this.oscillator.disconnect();
          this.oscillator = null;
        }
      }, 150);
    }
  }

  public setFrequency(frequency: number) {
    if (this.oscillator && this.audioContext) {
      // Use linear ramp for smoother transitions during sweep
      this.oscillator.frequency.linearRampToValueAtTime(frequency, this.audioContext.currentTime + 0.05);
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.audioContext) {
       this.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
    }
  }

  public setWaveform(type: WaveformType) {
    if (this.oscillator) {
      this.oscillator.type = type;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}

export const audioEngine = new AudioEngine();