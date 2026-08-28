import React, { useEffect } from 'react';
import { X, Heart, ExternalLink, Send, Sparkles } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ru' | 'en';
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const t = {
    ru: {
      title: 'ZenSpace',
      badge: 'Свободный проект',
      desc: 'Минималистичное веб-пространство для осознанности, медитации и глубокого релакса со студийными русскими голосовыми практиками без рекламы и навязчивых подписок.',
      creatorTitle: 'Хотите добавить свою медитацию или практику?',
      creatorDesc: 'Если вы преподаватель осознанности, автор практик или музыкант — напишите мне в Telegram, и мы бесплатно добавим ваши аудиозаписи в ZenSpace!',
      telegramBtn: 'Написать автору в Telegram (@chu_il)',
      donateTitle: 'Хотите ZenSpace в App Store & Google Play?',
      donateDesc: 'Поддержите релиз мобильного приложения для iOS / Android и развитие свободных медитаций.',
      donateBtn: 'Поддержать релиз (CloudTips)',
      footer: 'создано с заботой'
    },
    en: {
      title: 'ZenSpace',
      badge: 'Free & Open',
      desc: 'A minimalist sanctuary for mindfulness, guided meditation, and breathwork with studio-quality audio, free of ads and subscriptions.',
      creatorTitle: 'Want to add your own meditation or practice?',
      creatorDesc: 'If you are a mindfulness teacher, practitioner, or ambient musician — message me on Telegram to feature your audio in ZenSpace!',
      telegramBtn: 'Message the author on Telegram (@chu_il)',
      donateTitle: 'Want ZenSpace in the App Store & Google Play?',
      donateDesc: 'Support the mobile app release for iOS & Android and open mindfulness practices.',
      donateBtn: 'Support the release (CloudTips)',
      footer: 'crafted with care by'
    }
  }[lang];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-[#060c1a]/95 border border-white/10 rounded-3xl p-5 md:p-6 shadow-[0_16px_48px_rgba(0,0,0,0.8)] text-[#e6edf8] flex flex-col gap-3.5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f6c46a]/15 border border-[#f6c46a]/35 flex items-center justify-center text-[#f6c46a] shadow-[0_0_16px_rgba(246,196,106,0.2)]">
              <Heart className="w-4 h-4 fill-[#f6c46a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-wide font-['Jost',sans-serif]">
                  {t.title}
                </h3>
                <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded-full bg-[#f6c46a]/15 text-[#f6c46a] border border-[#f6c46a]/30">
                  {t.badge}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Закрыть (Esc)"
            title="Закрыть (Esc)"
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-[11px] text-[#94a3b8] leading-relaxed font-['Manrope',sans-serif]">
          {t.desc}
        </p>

        {/* 1. Creators Card: Add Your Own Meditation */}
        <div className="p-3.5 rounded-2xl bg-[#0088cc]/10 border border-[#0088cc]/30 shadow-[0_0_16px_rgba(0,136,204,0.1)] flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] font-['Jost',sans-serif] leading-tight">
            <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{t.creatorTitle}</span>
          </div>
          <div className="text-[11px] text-[#e6edf8]/85 leading-snug font-['Manrope',sans-serif]">
            {t.creatorDesc}
          </div>

          <a
            href="https://t.me/chu_il"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-3.5 mt-0.5 rounded-full bg-[#0088cc] hover:bg-[#0099e6] text-white text-xs font-semibold tracking-wide transition-all duration-200 shadow-[0_4px_12px_rgba(0,136,204,0.3)] hover:scale-[1.02]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.telegramBtn}</span>
            <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
          </a>
        </div>

        {/* 2. Golden Monetization / App Release Card */}
        <div className="p-3.5 rounded-2xl bg-[#f6c46a]/10 border border-[#f6c46a]/30 shadow-[0_0_16px_rgba(246,196,106,0.08)] flex flex-col gap-2">
          <div className="text-xs font-semibold text-[#f6c46a] font-['Jost',sans-serif] leading-tight">
            {t.donateTitle}
          </div>
          <div className="text-[11px] text-[#e6edf8]/80 leading-snug font-['Manrope',sans-serif]">
            {t.donateDesc}
          </div>

          <a
            href="https://pay.cloudtips.ru/p/68f756af"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3.5 mt-0.5 rounded-full bg-[#f6c46a] hover:bg-[#ffd78a] text-[#030712] font-bold text-xs tracking-wider uppercase font-['JetBrains_Mono'] transition-all duration-200 shadow-[0_4px_16px_rgba(246,196,106,0.25)] hover:scale-[1.02]"
          >
            <span>{t.donateBtn}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#64748b]">
          <span>{t.footer}</span>
          <a
            href="https://t.me/chu_il"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f6c46a] hover:underline font-mono"
          >
            Il Chu (@chu_il)
          </a>
        </div>
      </div>
    </div>
  );
};
