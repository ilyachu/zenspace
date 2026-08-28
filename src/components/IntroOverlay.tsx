import React, { useState, useEffect } from 'react';
import { Heart, Headphones } from 'lucide-react';

interface IntroOverlayProps {
  onEnter: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onEnter }) => {
  const [isEntered, setIsEntered] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('zenspace_entered') === 'true';
    } catch {
      return false;
    }
  });
  const [isFading, setIsFading] = useState<boolean>(false);

  const handleEnter = () => {
    if (isEntered || isFading) return;
    setIsFading(true);
    try {
      sessionStorage.setItem('zenspace_entered', 'true');
    } catch {}

    setTimeout(() => {
      setIsEntered(true);
      onEnter();
    }, 900);
  };

  useEffect(() => {
    if (isEntered) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEntered, isFading]);

  if (isEntered) return null;

  return (
    <div
      onClick={handleEnter}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-radial from-[#081022]/85 via-[#040815]/95 to-[#030712] cursor-pointer select-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-center gap-5 text-center max-w-md">
        {/* Constellation Icon with Golden Glow */}
        <div className="relative w-16 h-16 rounded-full bg-[#f6c46a]/10 border border-[#f6c46a]/30 flex items-center justify-center text-[#f6c46a] shadow-[0_0_32px_rgba(246,196,106,0.25)] animate-pulse">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
            <circle cx="6" cy="6" r="1.5" fill="currentColor"></circle>
            <circle cx="18" cy="7" r="1.5" fill="currentColor"></circle>
            <circle cx="17" cy="18" r="1.5" fill="currentColor"></circle>
            <circle cx="7" cy="17" r="1.5" fill="currentColor"></circle>
            <line x1="6" y1="6" x2="12" y2="12" stroke="currentColor" strokeDasharray="2 2"></line>
            <line x1="18" y1="7" x2="12" y2="12" stroke="currentColor" strokeDasharray="2 2"></line>
            <line x1="17" y1="18" x2="12" y2="12" stroke="currentColor" strokeDasharray="2 2"></line>
            <line x1="7" y1="17" x2="12" y2="12" stroke="currentColor" strokeDasharray="2 2"></line>
          </svg>
        </div>

        {/* Title & Subtitle in lofi-night-sky style */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.25em] uppercase text-white font-['Jost',sans-serif] drop-shadow-[0_2px_18px_rgba(3,7,18,0.7)]">
            enter the zen
          </h1>
          <p className="text-xs font-mono tracking-[0.15em] text-[#94a3b8] animate-pulse">
            нажмите в любое место для входа
          </p>
        </div>

        {/* Monetization / Support Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 p-4 rounded-2xl bg-[#f6c46a]/10 border border-[#f6c46a]/30 shadow-[0_0_24px_rgba(246,196,106,0.1)] flex flex-col items-center gap-2.5 max-w-xs transition-all duration-200 hover:border-[#f6c46a]/50"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#f6c46a] font-['Jost',sans-serif]">
            <Heart className="w-3.5 h-3.5 fill-[#f6c46a]" />
            <span>ZenSpace в App Store &amp; Google Play?</span>
          </div>
          <a
            href="https://pay.cloudtips.ru/p/68f756af"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-full bg-[#f6c46a]/25 hover:bg-[#f6c46a] border border-[#f6c46a]/50 text-[#f6c46a] hover:text-[#030712] text-xs font-medium tracking-wide transition-all duration-200"
          >
            <span>Поддержать релиз</span>
          </a>
        </div>

        {/* Hints and Author tag */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748b] tracking-wider font-mono">
            <Headphones className="w-3 h-3 text-[#38bdf8]" />
            <span>наушники рекомендуются • [F] весь экран • [Space] старт • [B] чаша</span>
          </div>
          <div className="text-[11px] text-[#64748b]">
            <span>crafted with care by </span>
            <a
              href="https://t.me/chu_il"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#f6c46a] hover:underline font-mono"
            >
              Il Chu (@chu_il)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
