import React, { useState } from 'react';
import { Volume2, VolumeX, ChevronDown, Sparkles, Wind, Music, Sliders } from 'lucide-react';
import { AppMode } from './Header';
import { GUIDED_TRACKS, SOUNDSCAPES } from '../services/audioEngine';
import { PracticeModal, SoundModal, BreatheModal } from './Modals';

interface FooterControlsProps {
  mode: AppMode;
  meditateType: 'free' | string;
  onMeditateTypeChange: (type: 'free' | string) => void;
  meditateDuration: number;
  onMeditateDurationChange: (dur: number) => void;
  bgSound: string;
  onBgSoundChange: (soundId: string) => void;
  breathPattern: string;
  onBreathPatternChange: (pattern: string) => void;
  ambientSound: string;
  onAmbientSoundChange: (soundId: string) => void;
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  voiceVolume: number;
  onVoiceVolumeChange: (vol: number) => void;
  ambientVolume: number;
  onAmbientVolumeChange: (vol: number) => void;
  playStartBell: boolean;
  onToggleStartBell: () => void;
  selectedVoice: 'female' | 'male';
  onSelectVoice: (voice: 'female' | 'male') => void;
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
  onToggleStartBell,
  selectedVoice,
  onSelectVoice
}) => {
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isBreatheModalOpen, setIsBreatheModalOpen] = useState(false);

  const getPracticeLabel = () => {
    if (meditateType === 'free') {
      return `⏱️ Свободный таймер • ${Math.round(meditateDuration / 60)} мин`;
    }
    const track = GUIDED_TRACKS.find(t => t.id === meditateType);
    const dur = (selectedVoice === 'male' && track?.maleDuration) ? track.maleDuration : (track?.duration || 300);
    const voiceBadge = selectedVoice === 'male' ? '♂' : '♀';
    return track ? `🎙️ ${track.title} • ${Math.round(dur / 60)} мин [${voiceBadge}]` : 'Выбрать практику';
  };

  const getSoundLabel = (soundId: string) => {
    if (soundId === 'none') return '🤫 Тишина';
    const s = SOUNDSCAPES.find(sc => sc.id === soundId);
    return s ? `${s.icon} ${s.name}` : 'Звук природы';
  };

  const getBreathLabel = () => {
    if (breathPattern === 'ru-breathing') return '🎙️ Осознанное дыхание • 8 мин';
    if (breathPattern === 'ru-breathsoundbody') return '🎙️ Дыхание и тело • 10 мин';
    if (breathPattern === 'box') return 'Квадрат 4-4-4-4';
    if (breathPattern === 'relax') return 'Релакс 4-7-8';
    return 'Баланс 5.5с';
  };

  return (
    <>
      <footer className="w-full flex flex-col items-center gap-3 z-20 max-w-xl pb-1">
        {/* Главный блок элегантных glass-pill кнопок в стиле lofi-night-sky */}
        <div className="flex items-center justify-center gap-2.5 w-full flex-wrap">
          {/* 1. Режим: Медитация */}
          {mode === 'meditate' && (
            <>
              <button
                onClick={() => setIsPracticeModalOpen(true)}
                className="flex items-center gap-2 bg-[#060c1a]/80 hover:bg-[#060c1a] border border-white/10 hover:border-[#f6c46a]/40 text-[#e6edf8] text-xs font-medium px-4 py-2.5 rounded-full backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="font-['Manrope',sans-serif]">{getPracticeLabel()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
              </button>

              <button
                onClick={() => setIsSoundModalOpen(true)}
                className="flex items-center gap-2 bg-[#060c1a]/80 hover:bg-[#060c1a] border border-white/10 hover:border-[#f6c46a]/40 text-[#e6edf8] text-xs font-medium px-4 py-2.5 rounded-full backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-[1.02]"
              >
                <Music className="w-3.5 h-3.5 text-[#f6c46a]" />
                <span className="font-['Manrope',sans-serif]">{getSoundLabel(bgSound)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
              </button>
            </>
          )}

          {/* 2. Режим: Дыхание */}
          {mode === 'breathe' && (
            <>
              <button
                onClick={() => setIsBreatheModalOpen(true)}
                className="flex items-center gap-2 bg-[#060c1a]/80 hover:bg-[#060c1a] border border-white/10 hover:border-[#f6c46a]/40 text-[#e6edf8] text-xs font-medium px-4 py-2.5 rounded-full backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-[1.02]"
              >
                <Wind className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="font-['Manrope',sans-serif]">{getBreathLabel()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
              </button>

              <button
                onClick={() => setIsSoundModalOpen(true)}
                className="flex items-center gap-2 bg-[#060c1a]/80 hover:bg-[#060c1a] border border-white/10 hover:border-[#f6c46a]/40 text-[#e6edf8] text-xs font-medium px-4 py-2.5 rounded-full backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-[1.02]"
              >
                <Music className="w-3.5 h-3.5 text-[#f6c46a]" />
                <span className="font-['Manrope',sans-serif]">{getSoundLabel(bgSound)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
              </button>
            </>
          )}

          {/* 3. Режим: Атмосфера */}
          {mode === 'ambient' && (
            <button
              onClick={() => setIsSoundModalOpen(true)}
              className="flex items-center gap-2 bg-[#060c1a]/80 hover:bg-[#060c1a] border border-white/10 hover:border-[#f6c46a]/40 text-[#e6edf8] text-xs font-medium px-5 py-2.5 rounded-full backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-[1.02]"
            >
              <Music className="w-3.5 h-3.5 text-[#f6c46a]" />
              <span className="font-['Manrope',sans-serif]">Звуковой ландшафт: {getSoundLabel(ambientSound)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
            </button>
          )}
        </div>

        {/* Нижний бар: Громкость, кнопка микшера и горячие клавиши */}
        <div className="w-full flex items-center justify-between text-xs text-[#64748b] pt-2 border-t border-white/[0.06] px-2 font-mono">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onMasterVolumeChange(masterVolume === 0 ? 0.85 : 0)}
              className="hover:text-white transition-colors"
              title="Вкл/Выкл общий звук (M)"
            >
              {masterVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-[#64748b]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#94a3b8] hover:text-[#38bdf8]" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              className="w-20 md:w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
              title="Общая громкость"
            />
            <button
              onClick={() => setIsSoundModalOpen(true)}
              className="text-[11px] text-[#94a3b8] hover:text-white flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-full border border-white/10 transition-colors"
              title="Открыть микшер громкости"
            >
              <Sliders className="w-3 h-3 text-[#38bdf8]" />
              <span>Микшер</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#64748b]">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-slate-300">Space</kbd> Старт</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-slate-300">1-3</kbd> Режимы</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-slate-300">F</kbd> Экран</span>
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
        selectedVoice={selectedVoice}
        onSelectVoice={onSelectVoice}
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
        selectedVoice={selectedVoice}
        onSelectVoice={onSelectVoice}
      />
    </>
  );
};
