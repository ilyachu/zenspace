import React from 'react';
import { Bell, Maximize, Minimize } from 'lucide-react';

export type AppMode = 'meditate' | 'breathe' | 'ambient';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onPlayBowl: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onPlayBowl,
  isFullscreen,
  onToggleFullscreen
}) => {
  return (
    <header className="w-full flex items-center justify-between gap-4 z-20">
      {/* 3 Clear Modes */}
      <nav className="flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-full border border-white/[0.08] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
        <button
          onClick={() => onModeChange('meditate')}
          className={`flex items-center gap-2 text-xs md:text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
            mode === 'meditate'
              ? 'bg-white/[0.14] text-slate-100 font-semibold border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🧘</span>
          <span>Медитация</span>
        </button>

        <button
          onClick={() => onModeChange('breathe')}
          className={`flex items-center gap-2 text-xs md:text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
            mode === 'breathe'
              ? 'bg-white/[0.14] text-slate-100 font-semibold border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🫁</span>
          <span>Дыхание</span>
        </button>

        <button
          onClick={() => onModeChange('ambient')}
          className={`flex items-center gap-2 text-xs md:text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
            mode === 'ambient'
              ? 'bg-white/[0.14] text-slate-100 font-semibold border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🌧️</span>
          <span>Атмосфера</span>
        </button>
      </nav>

      {/* Header Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPlayBowl}
          title="Удар в тибетскую чашу (B)"
          className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-slate-100 hover:border-sky-400/50 hover:scale-105 flex items-center justify-center backdrop-blur-xl transition-all duration-200 shadow-sm"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Выйти из полноэкранного режима (F)' : 'Полноэкранный режим (F)'}
          className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-slate-100 hover:border-sky-400/50 hover:scale-105 flex items-center justify-center backdrop-blur-xl transition-all duration-200 shadow-sm"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
