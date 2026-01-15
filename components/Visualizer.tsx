
import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { Activity, BarChart3 } from 'lucide-react';
import { VisualizerMode } from '../types';

interface VisualizerProps {
  isPlaying: boolean;
  color: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [mode, setMode] = useState<VisualizerMode>('waveform');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // --- Physics Effect 1: Phosphor Persistence ---
      // Instead of clearing the screen completely, draw a semi-transparent black rectangle.
      // This creates a "trail" or "ghosting" effect typical of old CRTs or high-speed physics interactions.
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
      ctx.fillRect(0, 0, width, height);
      
      // Draw Grid (Subtle)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.beginPath();
      for(let i=0; i<width; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
      for(let i=0; i<height; i+=40) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
      ctx.stroke();

      // Center Line
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (!isPlaying || !analyser) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      if (mode === 'waveform') {
          analyser.getByteTimeDomainData(dataArray);

          // --- Physics Effect 2: Chromatic Aberration / Prism Split ---
          // Draw the waveform 3 times with slight offsets and different colors (RGB)
          // This makes loud/fast sounds look like they are "breaking" the display.

          const drawWave = (offset: number, strokeColor: string, lineWidth: number) => {
              ctx.lineWidth = lineWidth;
              ctx.strokeStyle = strokeColor;
              ctx.beginPath();
              
              const sliceWidth = width * 1.0 / bufferLength;
              let x = 0;

              for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                // Add offset to Y based on amplitude to simulate interference
                const y = (v * height / 2) + offset;

                if (i === 0) ctx.moveTo(x, y);
                else {
                    // Smooth quadratic curves for liquid look
                   const prevX = x - sliceWidth;
                   const prevY = ((dataArray[i-1] / 128.0) * height / 2) + offset;
                   const cpX = (prevX + x) / 2;
                   ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
                }
                x += sliceWidth;
              }
              ctx.lineTo(width, height / 2);
              ctx.stroke();
          };

          // Red Shift (Left/Up)
          drawWave(-2, 'rgba(255, 0, 100, 0.5)', 2);
          // Blue Shift (Right/Down)
          drawWave(2, 'rgba(0, 200, 255, 0.5)', 2);
          // Main White/Color Beam
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
          drawWave(0, '#ffffff', 2);
          ctx.shadowBlur = 0;

      } else {
          // --- Physics Effect 3: Mirrored Spectrum ---
          // Audio physics often looks beautiful when symmetrical.
          analyser.getByteFrequencyData(dataArray);
          
          const barWidth = (width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          // Center Y
          const cy = height / 2;

          for(let i = 0; i < bufferLength; i++) {
              barHeight = (dataArray[i] / 255) * (height / 2);
              
              // Color physics: Low freq = cool colors, High freq = hot colors
              const hue = 200 + (i / bufferLength) * 120; // Starts blue, goes to purple/pink
              ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
              
              // Draw mirrored bars
              // Top
              ctx.fillRect(x, cy - barHeight - 1, barWidth, barHeight);
              // Bottom (Reflection)
              ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.4)`; // Slightly more transparent reflection
              ctx.fillRect(x, cy + 1, barWidth, barHeight * 0.7); // Slightly shorter reflection

              x += barWidth + 1;
          }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, color, mode]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 group">
        <canvas 
          ref={canvasRef} 
          width={1000} 
          height={400} 
          className="w-full h-full object-cover"
        />
        
        {/* Status Overlay */}
        <div className="absolute top-4 left-6 flex flex-col gap-1 pointer-events-none">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{isPlaying ? 'Output Active' : 'Standby'}</span>
            </div>
            {isPlaying && <div className="text-[8px] font-mono text-slate-600">Sample Rate: 44.1kHz</div>}
        </div>

        {/* View Toggle */}
        <div className="absolute top-4 right-6 flex bg-slate-900/80 rounded-lg p-1 border border-slate-700 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button 
                onClick={() => setMode('waveform')}
                className={`p-2 rounded-md ${mode === 'waveform' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Oscilloscope"
            >
                <Activity className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setMode('frequency')}
                className={`p-2 rounded-md ${mode === 'frequency' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Spectrum Analyzer"
            >
                <BarChart3 className="w-4 h-4" />
            </button>
        </div>
        
        {/* Vignette Overlay for CRT feel */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(2,6,23,0.6)_100%)]"></div>
    </div>
  );
};

export default Visualizer;
