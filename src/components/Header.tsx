import React from 'react';
import { Bell, Maximize2, Minimize2, Sparkles, Wind, Music, Heart } from 'lucide-react';

export type AppMode = 'meditate' | 'breathe' | 'ambient';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onPlayBowl: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSupport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onPlayBowl,
  isFullscreen,
  onToggleFullscreen,
  onOpenSupport
}) => {
  return (
    <header className="w-full flex items-center justify-between z-20 max-w-5xl pt-2 px-2">
      {/* Brand Badge in lofi-night-sky style */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#060c1a]/80 border border-white/10 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <span className="w-2 h-2 rounded-full bg-[#f6c46a] animate-pulse shadow-[0_0_8px_rgba(246,196,106,0.8)]" />
          <span className="text-xs md:text-sm font-semibold tracking-wider text-white font-['Jost',sans-serif] uppercase">
            ZenSpace
          </span>
          <span className="text-[10px] text-slate-500 font-mono">/</span>
          <a
            href="https://t.me/chu_il"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#94a3b8] hover:text-[#f6c46a] font-['JetBrains_Mono'] transition-colors hidden sm:inline"
            title="Developer: Il Chu (@chu_il)"
          >
            by Il Chu
          </a>
        </div>
      </div>

      {/* Center: Mode Switcher Pills */}
      <nav className="flex items-center bg-[#060c1a]/80 p-1 rounded-full border border-white/10 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => onModeChange('meditate')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            mode === 'meditate'
              ? 'bg-[#38bdf8] text-[#030712] font-semibold shadow-[0_0_12px_rgba(56,189,248,0.35)]'
              : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Медитация</span>
        </button>

        <button
          onClick={() => onModeChange('breathe')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            mode === 'breathe'
              ? 'bg-[#38bdf8] text-[#030712] font-semibold shadow-[0_0_12px_rgba(56,189,248,0.35)]'
              : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Дыхание</span>
        </button>

        <button
          onClick={() => onModeChange('ambient')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            mode === 'ambient'
              ? 'bg-[#38bdf8] text-[#030712] font-semibold shadow-[0_0_12px_rgba(56,189,248,0.35)]'
              : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Атмосфера</span>
        </button>
      </nav>

      {/* Right Controls: Support Button, Tibetan Bowl, Fullscreen */}
      <div className="flex items-center gap-2">
        {/* Support Modal Trigger */}
        <button
          onClick={onOpenSupport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f6c46a]/10 hover:bg-[#f6c46a]/20 border border-[#f6c46a]/30 text-[#f6c46a] text-xs font-semibold backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] shadow-[0_0_12px_rgba(246,196,106,0.15)]"
          title="Поддержать проект"
        >
          <Heart className="w-3.5 h-3.5 fill-[#f6c46a]" />
          <span className="hidden sm:inline">Поддержать</span>
        </button>

        {/* Tibetan Bowl */}
        <button
          onClick={onPlayBowl}
          className="w-8 h-8 rounded-full bg-[#060c1a]/80 border border-white/10 hover:border-white/20 backdrop-blur-xl flex items-center justify-center text-[#94a3b8] hover:text-white transition-all duration-200 hover:scale-105"
          title="Тибетская чаша (B)"
          aria-label="Тибетская чаша"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className="w-8 h-8 rounded-full bg-[#060c1a]/80 border border-white/10 hover:border-white/20 backdrop-blur-xl flex items-center justify-center text-[#94a3b8] hover:text-white transition-all duration-200 hover:scale-105"
          title={isFullscreen ? 'Обычный экран (F)' : 'На весь экран (F)'}
          aria-label="На весь экран"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
