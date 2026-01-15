
import { WaveformType } from '../types';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  
  // Oscillators (Carrier)
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  
  // Bell/Harmonic Oscillators (for 'bell' mode)
  private bellHarmonics: OscillatorNode[] = [];
  private bellGain: GainNode | null = null;

  // Chakra Oscillators (Septasync)
  private chakraNodes: { osc: OscillatorNode, panner: StereoPannerNode, gain: GainNode }[] = [];
  private chakraMasterGain: GainNode | null = null;
  private readonly CHAKRA_INDIVIDUAL_GAIN = 0.12; // Constant for mixing

  // Isochronic LFO (Low Frequency Oscillator)
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null; 
  private carrierGain: GainNode | null = null; 
  
  // Noise Sources
  private noiseSource: AudioBufferSourceNode | null = null;

  // Graph
  private leftPanner: StereoPannerNode | null = null;
  private rightPanner: StereoPannerNode | null = null;
  private gainNode: GainNode | null = null; // Master volume
  public analyser: AnalyserNode | null = null;
  private limiter: DynamicsCompressorNode | null = null; // Safety limiter

  // Buffers Cache
  private whiteBuffer: AudioBuffer | null = null;
  private pinkBuffer: AudioBuffer | null = null;
  private brownBuffer: AudioBuffer | null = null;

  constructor() {
    // Lazy initialization
  }

  public init() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      this.gainNode = this.audioContext.createGain();
      this.analyser = this.audioContext.createAnalyser();
      
      // --- MASTER LIMITER SETUP ---
      this.limiter = this.audioContext.createDynamicsCompressor();
      this.limiter.threshold.value = -1.0; 
      this.limiter.knee.value = 10;        
      this.limiter.ratio.value = 12.0;     
      this.limiter.attack.value = 0.002;   
      this.limiter.release.value = 0.25;   
      
      this.analyser.fftSize = 4096;
      this.analyser.smoothingTimeConstant = 0.85;
      
      this.gainNode.connect(this.limiter);
      this.limiter.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      this.gainNode.gain.value = 0; 
    }
  }

  public async resumeContext() {
    if (!this.audioContext) this.init();
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private getNoiseBuffer(type: 'white-noise' | 'pink-noise' | 'brown-noise'): AudioBuffer {
    if (type === 'white-noise' && this.whiteBuffer) return this.whiteBuffer;
    if (type === 'pink-noise' && this.pinkBuffer) return this.pinkBuffer;
    if (type === 'brown-noise' && this.brownBuffer) return this.brownBuffer;

    const ctx = this.audioContext!;
    const bufferSize = ctx.sampleRate * 5; // 5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white-noise') {
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        this.whiteBuffer = buffer;
    } else if (type === 'pink-noise') {
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11; // Compensate for gain
            b6 = white * 0.115926;
        }
        this.pinkBuffer = buffer;
    } else if (type === 'brown-noise') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut + (0.02 * white)) / 1.02;
            data[i] = lastOut * 3.5; // Compensate for gain
        }
        this.brownBuffer = buffer;
    }

    return buffer;
  }

  // --- CHAKRA ALIGNMENT MODE ---
  
  // Updated to accept a mask of active chakras so we can start with specific ones muted
  public startChakraMode(volume: number, activeMask?: boolean[]) {
      if (!this.audioContext) this.init();
      this.stopSources(); // Clear standard oscillators

      const ctx = this.audioContext!;
      const now = ctx.currentTime;

      // Soft start master
      this.gainNode!.gain.cancelScheduledValues(now);
      this.gainNode!.gain.setValueAtTime(0, now);
      this.gainNode!.gain.linearRampToValueAtTime(volume, now + 1.0); // Slow fade in for 7 tones

      // The 7 Solfeggio Frequencies
      const freqs = [396, 417, 528, 639, 741, 852, 963];
      
      // Create a dedicated sub-mix for chakras
      this.chakraMasterGain = ctx.createGain();
      this.chakraMasterGain.gain.value = 0.8; 
      this.chakraMasterGain.connect(this.gainNode!);

      freqs.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const panner = ctx.createStereoPanner();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          // Spatial Distribution
          const pan = index === 0 ? 0 : (index % 2 === 0 ? (index/6) : -(index/6)); 
          panner.pan.value = pan;

          // Check if this specific chakra should be active on start
          const shouldPlay = activeMask ? activeMask[index] : true;
          gain.gain.value = shouldPlay ? this.CHAKRA_INDIVIDUAL_GAIN : 0;

          osc.connect(gain).connect(panner).connect(this.chakraMasterGain!);
          osc.start();

          this.chakraNodes.push({ osc, panner, gain });
      });
  }

  // New method to toggle individual frequencies while playing
  public setChakraStatus(index: number, active: boolean) {
      if (this.chakraNodes[index]) {
          const node = this.chakraNodes[index];
          const now = this.audioContext?.currentTime || 0;
          
          // Smoothly ramp gain to avoid clicking
          node.gain.gain.cancelScheduledValues(now);
          node.gain.gain.setTargetAtTime(
              active ? this.CHAKRA_INDIVIDUAL_GAIN : 0, 
              now, 
              0.1
          );
      }
  }

  public async start(
      carrierFreq: number, 
      type: WaveformType, 
      volume: number, 
      beatFreq: number = 0,
      entrainmentMethod: 'binaural' | 'isochronic' = 'binaural'
    ) {
    if (!this.audioContext) this.init();
    
    if (this.audioContext?.state === 'suspended') {
      try { await this.audioContext.resume(); } catch(e) {}
    }

    this.stopSources(); // Stop previous sounds

    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // Safety Soft Start (Fade In)
    this.gainNode!.gain.cancelScheduledValues(now);
    this.gainNode!.gain.setValueAtTime(0, now);
    this.gainNode!.gain.linearRampToValueAtTime(volume, now + 0.5);

    const isNoise = type.includes('noise');

    if (isNoise) {
        this.noiseSource = ctx.createBufferSource();
        this.noiseSource.buffer = this.getNoiseBuffer(type as any);
        this.noiseSource.loop = true;
        this.noiseSource.connect(this.gainNode!);
        this.noiseSource.start();
        return;
    }

    this.leftOsc = ctx.createOscillator();
    this.rightOsc = ctx.createOscillator();
    
    const baseType = type === 'bell' ? 'sine' : (type as OscillatorType);
    
    this.leftOsc.type = baseType;
    this.rightOsc.type = baseType;

    this.leftPanner = ctx.createStereoPanner();
    this.rightPanner = ctx.createStereoPanner();
    this.leftPanner.pan.value = -1;
    this.rightPanner.pan.value = 1;

    // --- BELL SYNTHESIS (Additive) ---
    if (type === 'bell') {
        this.bellGain = ctx.createGain();
        this.bellGain.gain.value = 0.15; 
        this.bellGain.connect(this.gainNode!); 

        const ratios = [2.38, 4.12, 5.85]; 
        
        ratios.forEach(ratio => {
            const hLeft = ctx.createOscillator();
            const hRight = ctx.createOscillator();
            hLeft.type = 'sine';
            hRight.type = 'sine';
            
            if (beatFreq > 0) {
                 hLeft.frequency.setValueAtTime(carrierFreq * ratio, now);
                 hRight.frequency.setValueAtTime((carrierFreq + beatFreq) * ratio, now);
            } else {
                 hLeft.frequency.setValueAtTime(carrierFreq * ratio, now);
                 hRight.frequency.setValueAtTime((carrierFreq * ratio) + 1.5, now); 
            }

            const pLeft = ctx.createStereoPanner();
            const pRight = ctx.createStereoPanner();
            pLeft.pan.value = -0.7;
            pRight.pan.value = 0.7;

            hLeft.connect(pLeft).connect(this.bellGain!);
            hRight.connect(pRight).connect(this.bellGain!);
            
            hLeft.start();
            hRight.start();
            
            this.bellHarmonics.push(hLeft, hRight);
        });
    }


    if (beatFreq > 0 && entrainmentMethod === 'isochronic') {
        // --- ISOCHRONIC ---
        this.leftOsc.frequency.setValueAtTime(carrierFreq, now);
        this.rightOsc.frequency.setValueAtTime(carrierFreq, now);

        this.carrierGain = ctx.createGain();
        this.carrierGain.gain.value = 0.5;

        this.leftOsc.connect(this.leftPanner);
        this.leftPanner.connect(this.carrierGain);

        this.rightOsc.connect(this.rightPanner);
        this.rightPanner.connect(this.carrierGain);

        this.lfoOsc = ctx.createOscillator();
        this.lfoOsc.type = 'square';
        this.lfoOsc.frequency.setValueAtTime(beatFreq, now);

        this.lfoGain = ctx.createGain();
        this.lfoGain.gain.value = 0.5;

        this.lfoOsc.connect(this.lfoGain);
        this.lfoGain.connect(this.carrierGain.gain);
        this.carrierGain.connect(this.gainNode!);

        this.lfoOsc.start();
        this.leftOsc.start();
        this.rightOsc.start();

    } else if (beatFreq > 0) {
        // --- BINAURAL ---
        this.leftOsc.frequency.setValueAtTime(carrierFreq, now);
        this.rightOsc.frequency.setValueAtTime(carrierFreq + beatFreq, now);

        this.leftOsc.connect(this.leftPanner);
        this.leftPanner.connect(this.gainNode!);

        this.rightOsc.connect(this.rightPanner);
        this.rightPanner.connect(this.gainNode!);

        this.leftOsc.start();
        this.rightOsc.start();
    } else {
        // --- STANDARD TONE ---
        this.leftOsc.frequency.setValueAtTime(carrierFreq, now);
        this.rightOsc.frequency.setValueAtTime(carrierFreq, now);

        this.leftOsc.connect(this.leftPanner);
        this.leftPanner.connect(this.gainNode!);

        this.rightOsc.connect(this.rightPanner);
        this.rightPanner.connect(this.gainNode!);

        this.leftOsc.start();
        this.rightOsc.start();
    }
  }

  public stop(fadeOutDuration: number = 0.2) {
    if (this.gainNode && this.audioContext) {
      const currentTime = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

      setTimeout(() => {
        this.stopSources();
      }, fadeOutDuration * 1000 + 50);
    }
  }

  private stopSources() {
    // Oscillators
    [this.leftOsc, this.rightOsc, this.lfoOsc, ...this.bellHarmonics].forEach(osc => {
        if (osc) {
            try { osc.stop(); osc.disconnect(); } catch(e) {}
        }
    });
    this.leftOsc = null;
    this.rightOsc = null;
    this.lfoOsc = null;
    this.bellHarmonics = [];

    // Chakra Nodes
    this.chakraNodes.forEach(node => {
        try { 
            node.osc.stop(); 
            node.osc.disconnect();
            node.gain.disconnect();
            node.panner.disconnect();
        } catch(e) {}
    });
    this.chakraNodes = [];
    if (this.chakraMasterGain) {
        try { this.chakraMasterGain.disconnect(); } catch(e) {}
        this.chakraMasterGain = null;
    }

    // Noise
    if (this.noiseSource) {
      try { this.noiseSource.stop(); this.noiseSource.disconnect(); } catch(e) {}
      this.noiseSource = null;
    }

    // Nodes
    [this.leftPanner, this.rightPanner, this.carrierGain, this.lfoGain, this.bellGain].forEach(node => {
        if (node) {
             try { node.disconnect(); } catch(e) {}
        }
    });
    this.leftPanner = null;
    this.rightPanner = null;
    this.carrierGain = null;
    this.lfoGain = null;
    this.bellGain = null;
  }

  public setFrequencies(carrier: number, beat: number) {
    if (this.audioContext) {
      const now = this.audioContext.currentTime;
      
      if (this.leftOsc && this.rightOsc) {
         if (this.lfoOsc) {
            this.leftOsc.frequency.setTargetAtTime(carrier, now, 0.1);
            this.rightOsc.frequency.setTargetAtTime(carrier, now, 0.1);
            this.lfoOsc.frequency.setTargetAtTime(beat, now, 0.1);
         } else {
            this.leftOsc.frequency.setTargetAtTime(carrier, now, 0.1);
            this.rightOsc.frequency.setTargetAtTime(carrier + beat, now, 0.1);
         }
      }

      if (this.bellHarmonics.length > 0) {
          const ratios = [2.38, 4.12, 5.85]; 
          for (let i = 0; i < this.bellHarmonics.length; i += 2) {
              const ratio = ratios[Math.floor(i / 2)];
              const hLeft = this.bellHarmonics[i];
              const hRight = this.bellHarmonics[i + 1];

              if (hLeft && hRight) {
                  if (beat > 0) {
                      hLeft.frequency.setTargetAtTime(carrier * ratio, now, 0.1);
                      hRight.frequency.setTargetAtTime((carrier + beat) * ratio, now, 0.1);
                  } else {
                      hLeft.frequency.setTargetAtTime(carrier * ratio, now, 0.1);
                      hRight.frequency.setTargetAtTime((carrier * ratio) + 1.5, now, 0.1);
                  }
              }
          }
      }
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.audioContext) {
       this.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
    }
  }

  public setWaveform(type: WaveformType) {
    if (!type.includes('noise') && type !== 'bell' && this.leftOsc && this.rightOsc) {
      this.leftOsc.type = type as OscillatorType;
      this.rightOsc.type = type as OscillatorType;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}

export const audioEngine = new AudioEngine();
