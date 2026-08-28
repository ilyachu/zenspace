import React, { useState } from 'react';
import { Volume2, VolumeX, ChevronDown, Sparkles, Wind, Music, Sliders } from 'lucide-react';
import { AppMode } from './Header';
import { GUIDED_TRACKS, SOUNDSCAPES } from '../services/audioEngine';
import { PracticeModal, SoundModal, BreatheModal } from './Modals';

interface FooterControlsProps {
  mode: AppMode;
  // Meditate Mode State
  meditateType: 'free' | string;
  onMeditateTypeChange: (type: 'free' | string) => void;
  meditateDuration: number;
  onMeditateDurationChange: (dur: number) => void;
  bgSound: string;
  onBgSoundChange: (soundId: string) => void;
  // Breathe Mode State
  breathPattern: string;
  onBreathPatternChange: (pattern: string) => void;
  // Ambient Mode State
  ambientSound: string;
  onAmbientSoundChange: (soundId: string) => void;
  // Dual Volume Mixer
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  voiceVolume: number;
  onVoiceVolumeChange: (vol: number) => void;
  ambientVolume: number;
  onAmbientVolumeChange: (vol: number) => void;
  // Start Bell toggle
  playStartBell: boolean;
  onToggleStartBell: () => void;
}

export const FooterControls: React.FC<FooterControlsProps> = ({
  mode,
  meditateType,
  onMeditateTypeChange,
  meditateDuration,
  onMeditateDurationChange,
  bgSound,
  onBgSoundChange,
  breathPattern,
  onBreathPatternChange,
  ambientSound,
  onAmbientSoundChange,
  masterVolume,
  onMasterVolumeChange,
  voiceVolume,
  onVoiceVolumeChange,
  ambientVolume,
  onAmbientVolumeChange,
  playStartBell,
  onToggleStartBell
}) => {
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isBreatheModalOpen, setIsBreatheModalOpen] = useState(false);

  // Active Practice Label
  const getPracticeLabel = () => {
    if (meditateType === 'free') {
      return `⏱️ Свободный таймер • ${Math.round(meditateDuration / 60)} мин`;
    }
    const track = GUIDED_TRACKS.find(t => t.id === meditateType);
    return track ? `🎙️ ${track.title} • ${Math.round(track.duration / 60)} мин` : 'Выбрать практику';
  };

  // Active Sound Label
  const getSoundLabel = (soundId: string) => {
    if (soundId === 'none') return '🤫 Тишина';
    const s = SOUNDSCAPES.find(sc => sc.id === soundId);
    return s ? `${s.icon} ${s.name}` : 'Звук природы';
  };

  // Active Breath Label
  const getBreathLabel = () => {
    if (breathPattern === 'ru-breathing') return '🎙️ Осознанное дыхание • 8 мин';
    if (breathPattern === 'ru-breathsoundbody') return '🎙️ Дыхание и тело • 10 мин';
    if (breathPattern === 'box') return 'Квадрат 4-4-4-4';
    if (breathPattern === 'relax') return 'Релакс 4-7-8';
    return 'Баланс 5.5с';
  };

  return (
    <>
      <footer className="w-full flex flex-col items-center gap-4 z-20 max-w-xl">
        {/* Главный блок элегантных кнопок-триггеров */}
        <div className="flex items-center justify-center gap-3 w-full flex-wrap">
          {/* 1. Режим: Медитация */}
          {mode === 'meditate' && (
            <>
              <button
                onClick={() => setIsPracticeModalOpen(true)}
                className="flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-100 text-xs md:text-sm font-medium px-5 py-3 rounded-2xl backdrop-blur-xl shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-sky-400/50"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>{getPracticeLabel()}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>

              <button
                onClick={() => setIsSoundModalOpen(true)}
                className="flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-100 text-xs md:text-sm font-medium px-5 py-3 rounded-2xl backdrop-blur-xl shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-sky-400/50"
              >
                <Music className="w-4 h-4 text-sky-400" />
                <span>{getSoundLabel(bgSound)}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>
            </>
          )}

          {/* 2. Режим: Дыхание */}
          {mode === 'breathe' && (
            <>
              <button
                onClick={() => setIsBreatheModalOpen(true)}
                className="flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-100 text-xs md:text-sm font-medium px-5 py-3 rounded-2xl backdrop-blur-xl shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-sky-400/50"
              >
                <Wind className="w-4 h-4 text-sky-400" />
                <span>{getBreathLabel()}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>

              <button
                onClick={() => setIsSoundModalOpen(true)}
                className="flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-100 text-xs md:text-sm font-medium px-5 py-3 rounded-2xl backdrop-blur-xl shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-sky-400/50"
              >
                <Music className="w-4 h-4 text-sky-400" />
                <span>{getSoundLabel(bgSound)}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>
            </>
          )}

          {/* 3. Режим: Атмосфера */}
          {mode === 'ambient' && (
            <button
              onClick={() => setIsSoundModalOpen(true)}
              className="flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-100 text-xs md:text-sm font-medium px-6 py-3.5 rounded-2xl backdrop-blur-xl shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-sky-400/50"
            >
              <Music className="w-4 h-4 text-sky-400" />
              <span>Звуковой ландшафт: {getSoundLabel(ambientSound)}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>
          )}
        </div>

        {/* Нижний бар: Громкость, кнопка микшера и горячие клавиши */}
        <div className="w-full flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/[0.06] px-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onMasterVolumeChange(masterVolume === 0 ? 0.85 : 0)}
              className="hover:text-slate-300 transition-colors"
              title="Вкл/Выкл общий звук (M)"
            >
              {masterVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-400 hover:text-sky-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              className="w-20 md:w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
              title="Общая громкость"
            />
            <button
              onClick={() => setIsSoundModalOpen(true)}
              className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-1 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5 transition-colors"
              title="Открыть микшер громкости"
            >
              <Sliders className="w-3 h-3 text-sky-400" />
              <span>Микшер</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[10px] text-slate-300">Space</kbd> Старт</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[10px] text-slate-300">1-3</kbd> Режимы</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[10px] text-slate-300">F</kbd> Экран</span>
          </div>
        </div>
      </footer>

      {/* Модальные всплывающие окна */}
      <PracticeModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        meditateType={meditateType}
        onSelectType={onMeditateTypeChange}
        meditateDuration={meditateDuration}
        onSelectDuration={onMeditateDurationChange}
      />

      <SoundModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
        selectedSound={mode === 'ambient' ? ambientSound : bgSound}
        onSelectSound={(soundId) => {
          if (mode === 'ambient') onAmbientSoundChange(soundId);
          else onBgSoundChange(soundId);
        }}
        voiceVolume={voiceVolume}
        onVoiceVolumeChange={onVoiceVolumeChange}
        ambientVolume={ambientVolume}
        onAmbientVolumeChange={onAmbientVolumeChange}
        playStartBell={playStartBell}
        onToggleStartBell={onToggleStartBell}
      />

      <BreatheModal
        isOpen={isBreatheModalOpen}
        onClose={() => setIsBreatheModalOpen(false)}
        selectedPattern={breathPattern}
        onSelectPattern={onBreathPatternChange}
      />
    </>
  );
};
