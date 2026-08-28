import React from 'react';
import { Play, Pause } from 'lucide-react';

interface CircularRingProps {
  progress: number; // 0 to 1
  timeLeftFormatted: string;
  isRunning: boolean;
  statusText: string;
  breathPhaseText?: string;
  isBreatheMode?: boolean;
  breathHaloScale?: number;
  breathHaloOpacity?: number;
  phaseDurationMs?: number;
  onToggle: () => void;
}

export const CircularRing: React.FC<CircularRingProps> = ({
  progress,
  timeLeftFormatted,
  isRunning,
  statusText,
  breathPhaseText,
  isBreatheMode = false,
  breathHaloScale = 1.0,
  breathHaloOpacity = 0.2,
  phaseDurationMs = 1000,
  onToggle
}) => {
  const radius = 144;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center w-[340px] h-[340px] my-auto">
      {/* 1. Pure SVG Radial Halo (Timed with breath phase duration) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 340 340"
        style={{
          transform: `scale(${breathHaloScale})`,
          opacity: breathHaloOpacity,
          transition: `transform ${phaseDurationMs}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${phaseDurationMs}ms ease`
        }}
      >
        <defs>
          <radialGradient id="haloGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="170" cy="170" r="160" fill="url(#haloGradient)" />
      </svg>

      {/* 2. SVG Circular Progress Ring */}
      <svg className="absolute w-[320px] h-[320px] -rotate-90 pointer-events-none" viewBox="0 0 320 320">
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="5"
        />
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-500 ease-out drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]"
        />
      </svg>

      {/* 3. Center Interactive Focus Area */}
      <div
        onClick={onToggle}
        className="relative z-10 flex flex-col items-center justify-center gap-2.5 cursor-pointer w-[220px] group select-none"
      >
        <button
          aria-label={isRunning ? 'Пауза' : 'Старт'}
          className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-2xl flex items-center justify-center text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:scale-105 group-hover:bg-white/[0.1] group-hover:border-sky-400/50"
        >
          {isRunning ? (
            <Pause className="w-7 h-7 text-sky-400 fill-sky-400" />
          ) : (
            <Play className="w-7 h-7 text-slate-100 fill-slate-100 translate-x-0.5" />
          )}
        </button>

        {isBreatheMode ? (
          <div className="h-10 flex items-center justify-center">
            <span className="text-xl font-medium tracking-widest text-sky-400 uppercase drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
              {breathPhaseText || (isRunning ? 'Дыхание' : 'Готовы к практике')}
            </span>
          </div>
        ) : (
          <div className="text-4xl font-light tracking-tight tabular-nums text-slate-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            {timeLeftFormatted}
          </div>
        )}

        <div className="text-xs font-medium text-slate-400 tracking-wide text-center px-2 line-clamp-1">
          {statusText}
        </div>
      </div>
    </div>
  );
};
