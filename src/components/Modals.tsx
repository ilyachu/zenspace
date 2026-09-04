import React, { useEffect } from 'react';
import { X, Check, Sparkles, Clock, Mic, TreePine, Bell, Wind } from 'lucide-react';
import { GUIDED_TRACKS, SOUNDSCAPES, GuidedTrack, Soundscape } from '../services/audioEngine';

// Hook for Escape key closing
const useEscapeKey = (isOpen: boolean, onClose: () => void) => {
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
};

// 1. Модальное окно выбора практики медитации
interface PracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  meditateType: 'free' | string;
  onSelectType: (type: 'free' | string) => void;
  meditateDuration: number;
  onSelectDuration: (dur: number) => void;
  selectedVoice: 'female' | 'male';
  onSelectVoice: (voice: 'female' | 'male') => void;
}

export const PracticeModal: React.FC<PracticeModalProps> = ({
  isOpen,
  onClose,
  meditateType,
  onSelectType,
  meditateDuration,
  onSelectDuration,
  selectedVoice,
  onSelectVoice
}) => {
  useEscapeKey(isOpen, onClose);
  if (!isOpen) return null;

  const freeDurations = [
    { label: '3 мин', sec: 180 },
    { label: '5 мин', sec: 300 },
    { label: '10 мин', sec: 600 },
    { label: '15 мин', sec: 900 },
    { label: '20 мин', sec: 1200 },
    { label: '30 мин', sec: 1800 }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0d1527] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white">Выбор практики</h3>
            <p className="text-xs text-slate-400">Свободный таймер или русские голосовые медитации</p>
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

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 scrollbar-none">
          {/* Секция 1: Свободный таймер */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Свободный таймер</span>
            </div>

            <div
              onClick={() => onSelectType('free')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                meditateType === 'free'
                  ? 'bg-sky-500/10 border-sky-400/80 shadow-[0_0_16px_rgba(56,189,248,0.15)]'
                  : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-white">Тихая медитация с таймером</div>
                {meditateType === 'free' && <Check className="w-4 h-4 text-sky-400" />}
              </div>

              {/* Длительности */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {freeDurations.map(d => (
                  <button
                    key={d.sec}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectType('free');
                      onSelectDuration(d.sec);
                    }}
                    className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                      meditateType === 'free' && meditateDuration === d.sec
                        ? 'bg-sky-400 text-slate-950 font-semibold border-sky-400 shadow-md'
                        : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Секция 2: Голосовые практики UCLA */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Голосовые медитации</span>
              </div>
            </div>

            {/* Выбор голоса: Женский / Мужской */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 mb-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVoice('female');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                  selectedVoice === 'female'
                    ? 'bg-sky-400 text-slate-950 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>♀</span>
                <span>Женский (Ингуна)</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVoice('male');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                  selectedVoice === 'male'
                    ? 'bg-sky-400 text-slate-950 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>♂</span>
                <span>Мужской (Дмитрий)</span>
              </button>
            </div>

            <div className="space-y-2">
              {GUIDED_TRACKS.map((track: GuidedTrack) => {
                const trackDur = (selectedVoice === 'male' && track.maleDuration) ? track.maleDuration : track.duration;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      onSelectType(track.id);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      meditateType === track.id
                        ? 'bg-sky-500/10 border-sky-400/80 shadow-[0_0_16px_rgba(56,189,248,0.15)]'
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        <span>{track.title}</span>
                        <span className="text-xs text-sky-400/90 font-mono bg-sky-400/10 px-2 py-0.5 rounded-md">
                          {Math.floor(trackDur / 60)}:{(trackDur % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{track.subtitle}</div>
                    </div>

                    {meditateType === track.id && (
                      <div className="w-6 h-6 rounded-full bg-sky-400 flex items-center justify-center text-slate-950 flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs text-slate-500">
          <span>Нажмите <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-slate-400">Esc</kbd> или кликните вне окна</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-400 text-slate-950 text-xs font-semibold hover:bg-sky-300 transition-colors shadow-lg"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Модальное окно выбора фонового звука и микшера
interface SoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSound: string;
  onSelectSound: (id: string) => void;
  voiceVolume: number;
  onVoiceVolumeChange: (vol: number) => void;
  ambientVolume: number;
  onAmbientVolumeChange: (vol: number) => void;
  playStartBell?: boolean;
  onToggleStartBell?: () => void;
}

export const SoundModal: React.FC<SoundModalProps> = ({
  isOpen,
  onClose,
  selectedSound,
  onSelectSound,
  voiceVolume,
  onVoiceVolumeChange,
  ambientVolume,
  onAmbientVolumeChange,
  playStartBell = false,
  onToggleStartBell
}) => {
  useEscapeKey(isOpen, onClose);
  const [soundTab, setSoundTab] = React.useState<'nature' | 'frequency'>(() => {
    return selectedSound.startsWith('freq-') ? 'frequency' : 'nature';
  });

  if (!isOpen) return null;

  const natureSounds = SOUNDSCAPES.filter(s => s.category === 'nature');
  const freqSounds = SOUNDSCAPES.filter(s => s.category === 'frequency');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0d1527] border border-white/10 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white">Фоновая атмосфера</h3>
            <p className="text-xs text-slate-400">Природа, частоты Сольфеджио и бинауральные ритмы</p>
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

        {/* Табы: Природа / Частоты */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 my-3">
          <button
            type="button"
            onClick={() => setSoundTab('nature')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
              soundTab === 'nature'
                ? 'bg-sky-400 text-slate-950 font-semibold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🌲 Звуки природы</span>
          </button>
          <button
            type="button"
            onClick={() => setSoundTab('frequency')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
              soundTab === 'frequency'
                ? 'bg-sky-400 text-slate-950 font-semibold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Частоты & Бинаурал</span>
          </button>
        </div>

        {/* Звуковые карточки */}
        <div className="py-1 space-y-2 overflow-y-auto scrollbar-none pr-0.5 max-h-[38vh]">
          {soundTab === 'nature' ? (
            <>
              {/* Тишина */}
              <div
                onClick={() => onSelectSound('none')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedSound === 'none'
                    ? 'bg-sky-500/10 border-sky-400/80 shadow-[0_0_16px_rgba(56,189,248,0.15)]'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🤫</span>
                  <div>
                    <div className="text-sm font-medium text-white">Тишина</div>
                    <div className="text-xs text-slate-400">Без фонового звука</div>
                  </div>
                </div>
                {selectedSound === 'none' && <Check className="w-4 h-4 text-sky-400" />}
              </div>

              {/* Природа */}
              {natureSounds.map((s: Soundscape) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSound(s.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedSound === s.id
                      ? 'bg-sky-500/10 border-sky-400/80 shadow-[0_0_16px_rgba(56,189,248,0.15)]'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.subtitle || 'Бесшовный стерео-луп природы'}</div>
                    </div>
                  </div>
                  {selectedSound === s.id && <Check className="w-4 h-4 text-sky-400" />}
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Бейдж подсказки про наушники */}
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-400/20 text-[11px] text-sky-300 flex items-center gap-2 mb-2">
                <span>🎧</span>
                <span>Рекомендуется слушать в наушниках для стерео-эффекта бинауральных волн.</span>
              </div>

              {/* Частоты */}
              {freqSounds.map((s: Soundscape) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSound(s.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedSound === s.id
                      ? 'bg-sky-500/10 border-sky-400/80 shadow-[0_0_16px_rgba(56,189,248,0.15)]'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-sm font-medium text-white">{s.name}</span>
                    </div>
                    {selectedSound === s.id && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                  <div className="text-xs text-sky-400/90 font-mono mb-1">{s.subtitle}</div>
                  {s.description && <div className="text-[11px] text-slate-400 leading-relaxed">{s.description}</div>}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Раздельный микшер звука */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {/* Слайдер Голоса */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300 min-w-[130px]">
              <Mic className="w-4 h-4 text-sky-400" />
              <span>Голос диктора:</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={voiceVolume}
                onChange={(e) => onVoiceVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                {Math.round(voiceVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Слайдер Фона природы */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300 min-w-[130px]">
              <TreePine className="w-4 h-4 text-emerald-400" />
              <span>Фон природы:</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => onAmbientVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                {Math.round(ambientVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Опциональный тумблер стартового гонга */}
          {onToggleStartBell && (
            <div
              onClick={onToggleStartBell}
              className="flex items-center justify-between pt-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200 select-none"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Звуковой гонг в начале сессии</span>
              </div>
              <div className={`w-8 h-4 rounded-full transition-colors relative ${playStartBell ? 'bg-sky-400' : 'bg-white/10'}`}>
                <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${playStartBell ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Модальное окно выбора техники дыхания
interface BreatheModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPattern: string;
  onSelectPattern: (p: string) => void;
  selectedVoice?: 'female' | 'male';
  onSelectVoice?: (v: 'female' | 'male') => void;
}

export const BreatheModal: React.FC<BreatheModalProps> = ({
  isOpen,
  onClose,
  selectedPattern,
  onSelectPattern,
  selectedVoice = 'female',
  onSelectVoice
}) => {
  useEscapeKey(isOpen, onClose);
  if (!isOpen) return null;

  const studioTracks = [
    {
      id: 'ru-breathing',
      title: '🎙️ Осознанное дыхание',
      subtitle: selectedVoice === 'male' ? 'Мужской голос (Дмитрий)' : 'Живой голос (UCLA MARC / Ингуна)',
      desc: 'Обучение глубокому фокусу на дыхании, освобождение от мыслей.'
    },
    {
      id: 'ru-breathsoundbody',
      title: '🎙️ Дыхание, звуки и тело',
      subtitle: selectedVoice === 'male' ? 'Мужской голос (Дмитрий)' : 'Живой голос (UCLA MARC / Ингуна)',
      desc: 'Синхронизация дыхания с телесными ощущениями и пространством.'
    }
  ];

  const rhythmPatterns = [
    {
      id: 'box',
      title: 'Квадрат 4-4-4-4',
      subtitle: 'Вдох (4с) — Задержка (4с) — Выдох (4с) — Задержка (4с)',
      desc: 'Снижает уровень кортизола, возвращает ясность мышления и фокус.'
    },
    {
      id: 'relax',
      title: 'Релакс 4-7-8 (Эндрю Вейл)',
      subtitle: 'Вдох (4с) — Задержка (7с) — Выдох (8с)',
      desc: 'Активирует парасимпатическую нервную систему, успокаивает перед сном.'
    },
    {
      id: 'coherent',
      title: 'Баланс 5.5с (Когерентное)',
      subtitle: 'Вдох (5.5с) — Выдох (5.5с)',
      desc: 'Гармонизирует вариабельность сердечного ритма (HRV) и давление.'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0d1527] border border-white/10 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white">Практики дыхания</h3>
            <p className="text-xs text-slate-400">Студийные русские сессии или визуальный ритм</p>
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

        <div className="overflow-y-auto py-4 space-y-4 pr-1 scrollbar-none">
          {/* Секция 1: Студийные русские дыхательные аудио-треки */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Студийные аудио-практики</span>
            </div>

            {/* Выбор голоса */}
            {onSelectVoice && (
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 mb-2.5">
                <button
                  type="button"
                  onClick={() => onSelectVoice('female')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                    selectedVoice === 'female'
                      ? 'bg-sky-400 text-slate-950 font-semibold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>♀ Женский</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectVoice('male')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                    selectedVoice === 'male'
                      ? 'bg-sky-400 text-slate-950 font-semibold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>♂ Мужской</span>
                </button>
              </div>
            )}
            <div className="space-y-2">
              {studioTracks.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectPattern(t.id);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedPattern === t.id
                      ? 'bg-sky-500/10 border-sky-400/80 shadow-[0_0_16px_rgba(56,189,248,0.15)]'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="text-sm font-medium text-white">{t.title}</div>
                    {selectedPattern === t.id && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                  <div className="text-xs text-sky-400/90 font-mono mb-1">{t.subtitle}</div>
                  <div className="text-xs text-slate-400">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Секция 2: Визуально-медитативные ритмы дыхания */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              <span>Визуальные дыхательные ритмы</span>
            </div>
            <div className="space-y-2">
              {rhythmPatterns.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPattern(p.id);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedPattern === p.id
                      ? 'bg-sky-500/10 border-sky-400/80 shadow-[0_0_16px_rgba(56,189,248,0.15)]'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="text-sm font-medium text-white">{p.title}</div>
                    {selectedPattern === p.id && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                  <div className="text-xs text-sky-400/90 font-mono mb-1">{p.subtitle}</div>
                  <div className="text-xs text-slate-400">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs text-slate-500">
          <span>Нажмите <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-slate-400">Esc</kbd> или кликните вне окна</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-400 text-slate-950 text-xs font-semibold hover:bg-sky-300 transition-colors shadow-lg"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
