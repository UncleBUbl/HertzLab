import React, { useState, useEffect, useRef } from 'react';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  label: string;
}

const Knob: React.FC<KnobProps> = ({ value, min, max, onChange, label }) => {
  // Simple CSS implementation of a knob rotation
  // Map value to angle: -135deg to +135deg
  const percentage = (value - min) / (max - min);
  const angle = -135 + (percentage * 270);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 shadow-lg flex items-center justify-center">
        <div 
          className="w-full h-full rounded-full absolute"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="w-1.5 h-3 bg-sky-400 mx-auto mt-1 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>
        </div>
        <div className="text-xs font-mono text-slate-400 pointer-events-none select-none">
            {Math.round(value)}
        </div>
      </div>
      <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">{label}</label>
      <input 
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sr-only" // Screen reader only, as we usually drag knobs, but for simplicity we can use this container as a slider controller overlay if we wanted complex drag logic. 
        // For now, let's just render a visible slider below it for ease of use on mobile
      />
    </div>
  );
};

export default Knob;