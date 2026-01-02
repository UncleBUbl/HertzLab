import { WaveformType } from '../types';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  
  // Dual Oscillator Setup for Binaural
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  
  private leftPanner: StereoPannerNode | null = null;
  private rightPanner: StereoPannerNode | null = null;

  private gainNode: GainNode | null = null;
  public analyser: AnalyserNode | null = null;

  constructor() {
    // Lazy initialization
  }

  public init() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      this.gainNode = this.audioContext.createGain();
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;
      
      // Connect Master Graph: Gain -> Analyser -> Destination
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      this.gainNode.gain.value = 0; // Start silent
    }
  }

  /**
   * Starts audio generation.
   * If beatFreq is 0, it plays a mono tone (Generator Mode).
   * If beatFreq > 0, it plays true Binaural Beats (Left != Right).
   */
  public async start(carrierFreq: number, type: WaveformType, volume: number, beatFreq: number = 0) {
    if (!this.audioContext) this.init();
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.stopOscillators();

    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // Create Oscillators
    this.leftOsc = ctx.createOscillator();
    this.rightOsc = ctx.createOscillator();
    
    // Create Panners (Hard Left / Hard Right)
    this.leftPanner = ctx.createStereoPanner();
    this.rightPanner = ctx.createStereoPanner();
    this.leftPanner.pan.value = -1;
    this.rightPanner.pan.value = 1;

    // Frequencies
    // Left Ear = Carrier
    // Right Ear = Carrier + Beat
    this.leftOsc.frequency.setValueAtTime(carrierFreq, now);
    this.rightOsc.frequency.setValueAtTime(carrierFreq + beatFreq, now);

    this.leftOsc.type = type;
    this.rightOsc.type = type;

    // Connect Graph
    // Left Osc -> Left Panner -> GainNode
    // Right Osc -> Right Panner -> GainNode
    this.leftOsc.connect(this.leftPanner);
    this.leftPanner.connect(this.gainNode!);

    this.rightOsc.connect(this.rightPanner);
    this.rightPanner.connect(this.gainNode!);

    // Ramp Volume Up
    this.gainNode!.gain.cancelScheduledValues(now);
    this.gainNode!.gain.setValueAtTime(0, now);
    this.gainNode!.gain.linearRampToValueAtTime(volume, now + 0.1);

    this.leftOsc.start();
    this.rightOsc.start();
  }

  public stop() {
    if (this.gainNode && this.audioContext) {
      const currentTime = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.15);

      setTimeout(() => {
        this.stopOscillators();
      }, 200);
    }
  }

  private stopOscillators() {
    if (this.leftOsc) {
      try { this.leftOsc.stop(); this.leftOsc.disconnect(); } catch(e) {}
      this.leftOsc = null;
    }
    if (this.rightOsc) {
      try { this.rightOsc.stop(); this.rightOsc.disconnect(); } catch(e) {}
      this.rightOsc = null;
    }
    // Disconnect panners to prevent leaks
    if (this.leftPanner) { this.leftPanner.disconnect(); this.leftPanner = null; }
    if (this.rightPanner) { this.rightPanner.disconnect(); this.rightPanner = null; }
  }

  public setFrequencies(carrier: number, beat: number) {
    if (this.leftOsc && this.rightOsc && this.audioContext) {
      const now = this.audioContext.currentTime;
      // Smooth transition
      this.leftOsc.frequency.setTargetAtTime(carrier, now, 0.1);
      this.rightOsc.frequency.setTargetAtTime(carrier + beat, now, 0.1);
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.audioContext) {
       this.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
    }
  }

  public setWaveform(type: WaveformType) {
    if (this.leftOsc && this.rightOsc) {
      this.leftOsc.type = type;
      this.rightOsc.type = type;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}

export const audioEngine = new AudioEngine();