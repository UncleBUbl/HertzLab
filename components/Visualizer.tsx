import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface VisualizerProps {
  isPlaying: boolean;
  color: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark background with slight transparency for trail effect
      ctx.fillStyle = '#0f172a'; 
      ctx.fillRect(0, 0, width, height);
      
      // Draw Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=0; i<width; i+=50) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
      ctx.stroke();

      // Center Line
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (!isPlaying || !analyser) {
        // Resting State
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      // Create Gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#0ea5e9');
      gradient.addColorStop(0.5, '#38bdf8');
      gradient.addColorStop(1, '#0ea5e9');

      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Smooth curve
          const prevX = x - sliceWidth;
          const prevY = (dataArray[i-1] / 128.0) * height / 2;
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      
      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, color]);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <canvas 
          ref={canvasRef} 
          width={1000} 
          height={400} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-6 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{isPlaying ? 'Signal Active' : 'Standby'}</span>
        </div>
    </div>
  );
};

export default Visualizer;