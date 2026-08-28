import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Mail, Check, ArrowRight, Heart, ExternalLink } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email: string; name: string } | null;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(email, name || email.split('@')[0]);
      setIsSubmitting(false);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#060c1a]/90 border border-white/10 rounded-3xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.7)] text-[#e6edf8] flex flex-col max-h-[90vh] overflow-y-auto scrollbar-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#f6c46a]/10 border border-[#f6c46a]/30 flex items-center justify-center text-[#f6c46a] shadow-[0_0_16px_rgba(246,196,106,0.15)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-wide font-['Jost',sans-serif]">ZenSpace // ID</h3>
                <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded-full bg-[#f6c46a]/15 text-[#f6c46a] border border-[#f6c46a]/30">
                  Cloud Sync
                </span>
              </div>
              <p className="text-xs text-[#94a3b8]">Синхронизация практик и поддержка проекта</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Закрыть (Esc)"
            title="Закрыть (Esc)"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User is logged in */}
        {user ? (
          <div className="py-5 space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] font-bold text-sm font-['JetBrains_Mono']">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-[#94a3b8] font-mono">{user.email}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-xs text-[#f87171] hover:text-red-300 font-medium px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 transition-colors"
              >
                Выйти
              </button>
            </div>

            <div className="text-xs text-[#94a3b8] leading-relaxed">
              ✓ Прогресс медитаций сохраняется в вашем личном облаке ZenSpace.
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="py-4 space-y-4">
            {successMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-sm font-medium flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Успешный вход в ZenSpace!</span>
              </div>
            ) : (
              <>
                {/* Быстрый вход через Telegram */}
                <a
                  href="https://t.me/chu_il"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/35 text-[#38bdf8] text-xs font-semibold tracking-wide transition-all duration-200 hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>Связаться с автором в Telegram (@chu_il)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-auto" />
                </a>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 uppercase tracking-widest my-1">
                  <div className="h-px bg-white/10 flex-1" />
                  <span>или по почте</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                      Ваше имя (необязательно)
                    </label>
                    <input
                      type="text"
                      placeholder="Алексей"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#38bdf8]/60 focus:bg-white/[0.07] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                      Email для синхронизации
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="mind@zen.space"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#38bdf8]/60 focus:bg-white/[0.07] transition-all"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#38bdf8] text-[#030712] font-semibold text-xs tracking-wide hover:bg-[#7dd3fc] transition-all duration-200 shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:scale-[1.01]"
                  >
                    <span>{isSubmitting ? 'Входим...' : 'Продолжить'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            MONETIZATION & SUPPORT CARD (В фирменном стиле lofi-night-sky)
            ---------------------------------------------------- */}
        <div className="mt-2 p-4 rounded-2xl bg-[#f6c46a]/10 border border-[#f6c46a]/30 shadow-[0_0_24px_rgba(246,196,106,0.08)] flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#f6c46a]/20 border border-[#f6c46a]/40 flex items-center justify-center text-[#f6c46a] flex-shrink-0 mt-0.5">
              <Heart className="w-4 h-4 fill-[#f6c46a]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#f6c46a] leading-tight font-['Jost',sans-serif]">
                Хотите ZenSpace в App Store &amp; Google Play?
              </p>
              <p className="text-[11px] text-[#e6edf8]/80 mt-0.5 leading-snug">
                Поддержите релиз мобильного приложения и развитие свободных русскоязычных медитаций.
              </p>
            </div>
          </div>

          <a
            href="https://pay.cloudtips.ru/p/68f756af"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#f6c46a] hover:bg-[#ffd78a] text-[#030712] font-bold text-xs tracking-wider uppercase font-['JetBrains_Mono'] transition-all duration-200 shadow-[0_4px_16px_rgba(246,196,106,0.25)] hover:scale-[1.02]"
          >
            <span>Поддержать релиз</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Footer author note */}
        <div className="pt-4 border-t border-white/[0.08] mt-3 flex items-center justify-between text-[11px] text-[#64748b]">
          <span>crafted with care by</span>
          <a
            href="https://t.me/chu_il"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#94a3b8] hover:text-[#f6c46a] font-mono transition-colors"
          >
            Il Chu (@chu_il)
          </a>
        </div>
      </div>
    </div>
  );
};
