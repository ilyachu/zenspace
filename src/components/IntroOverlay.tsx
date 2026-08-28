import React, { useState, useEffect } from 'react';

interface IntroOverlayProps {
  onEnter: () => void;
  lang: 'ru' | 'en';
  onToggleLang: (lang: 'ru' | 'en') => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({
  onEnter,
  lang,
  onToggleLang
}) => {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [isFading, setIsFading] = useState<boolean>(false);

  const t = {
    ru: {
      title: 'войдите в покой',
      subtitle: 'нажмите в любое место, чтобы войти',
      donateLabel: 'Хотите ZenSpace в App Store & Google Play?',
      donateCta: 'Поддержать релиз',
      hint: 'наушники рекомендуются • [F] весь экран • [Space] старт • [B] чаша',
      author: 'создано с заботой'
    },
    en: {
      title: 'enter the zen',
      subtitle: 'click anywhere to begin',
      donateLabel: 'Want ZenSpace in the App Store & Google Play?',
      donateCta: 'Support the release',
      hint: 'headphones recommended • [F] fullscreen • [Space] pause • [B] singing bowl',
      author: 'crafted with care by'
    }
  }[lang];

  const handleEnter = () => {
    if (hasEntered || isFading) return;
    setIsFading(true);
    // Smoothly notify parent to start fading in the HUD in sync with intro fade out
    onEnter();
    setTimeout(() => {
      setHasEntered(true);
    }, 1000);
  };

  useEffect(() => {
    if (hasEntered) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasEntered, isFading]);

  if (hasEntered) return null;

  return (
    <div
      id="intro-overlay"
      onClick={handleEnter}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFading ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 58%, rgba(8, 16, 34, 0.75), rgba(3, 7, 18, 0.92))'
      }}
    >
      {/* Language Switcher in Top Right */}
      <div
        className="absolute top-4 right-4 z-50 inline-flex items-center gap-0 bg-[#060c1a]/80 border border-white/10 rounded-full p-1 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onToggleLang('en')}
          className={`min-w-[32px] h-[24px] px-2 rounded-full text-[11px] font-mono font-medium transition-all ${
            lang === 'en'
              ? 'bg-[#f6c46a] text-[#030712] font-semibold shadow-sm'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => onToggleLang('ru')}
          className={`min-w-[32px] h-[24px] px-2 rounded-full text-[11px] font-mono font-medium transition-all ${
            lang === 'ru'
              ? 'bg-[#f6c46a] text-[#030712] font-semibold shadow-sm'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          RU
        </button>
      </div>

      {/* Main Intro Container */}
      <div className="flex flex-col items-center gap-5 text-center p-8 max-w-md">
        {/* Constellation Icon with Golden pulse-glow */}
        <svg
          className="w-12 h-12 text-[#f6c46a] animate-pulse-glow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
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

        {/* Intro Title & Subtitle */}
        <div>
          <h1 className="font-['Jost',sans-serif] text-[1.85rem] font-light tracking-[0.25em] uppercase text-white drop-shadow-[0_2px_18px_rgba(3,7,18,0.7)] mt-2">
            {t.title}
          </h1>
          <p className="font-mono text-[0.85rem] tracking-[0.15em] text-[#94a3b8] animate-breathe mt-1.5 drop-shadow-[0_1px_12px_rgba(3,7,18,0.75)]">
            {t.subtitle}
          </p>
        </div>

        {/* Intro Donate / Monetization Card */}
        <a
          href="https://pay.cloudtips.ru/p/68f756af"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-2.5 mt-1.5 p-3.5 px-5 max-w-[22rem] text-decoration-none rounded-2xl bg-[#f6c46a]/[0.12] hover:bg-[#f6c46a]/[0.22] border border-[#f6c46a]/[0.38] hover:border-[#f6c46a] transition-all duration-200"
        >
          <span className="text-[0.78rem] leading-[1.4] text-[#e6edf8]/90 font-['Manrope',sans-serif]">
            {t.donateLabel}
          </span>
          <span className="flex items-center justify-center min-h-[38px] px-4 rounded-full bg-[#f6c46a]/[0.28] hover:bg-[#f6c46a] border border-[#f6c46a]/[0.55] text-[#f6c46a] hover:text-[#030712] text-[0.82rem] font-medium tracking-[0.03em] transition-colors font-mono">
            {t.donateCta}
          </span>
        </a>

        {/* Hint & Author Tag */}
        <div className="space-y-1.5 pt-2">
          <p className="text-[0.75rem] text-[#64748b] tracking-[0.05em] font-['Manrope',sans-serif]">
            {t.hint}
          </p>
          <div className="text-[0.72rem] text-[#64748b] tracking-[0.08em]">
            <span>{t.author} </span>
            <a
              href="https://t.me/chu_il"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#f6c46a] hover:text-white border-b border-dotted border-[#f6c46a]/40 hover:border-white transition-all ml-1 font-mono"
            >
              Il Chu (@chu_il)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
