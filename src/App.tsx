import { useState, useEffect, useRef, useCallback } from 'react';
import { ParticleCanvas, AmbientTheme } from './components/ParticleCanvas';
import { Header, AppMode } from './components/Header';
import { CircularRing } from './components/CircularRing';
import { FooterControls } from './components/FooterControls';
import { audioEngine, GUIDED_TRACKS } from './services/audioEngine';

export function App() {
  // Navigation State
  const [mode, setMode] = useState<AppMode>('meditate');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isZenDimmed, setIsZenDimmed] = useState<boolean>(false);

  // Meditation Settings
  const [meditateType, setMeditateType] = useState<'free' | string>('ru-bodyscan');
  const [meditateDuration, setMeditateDuration] = useState<number>(238);
  const [meditateTimeLeft, setMeditateTimeLeft] = useState<number>(238);
  const [meditateBgSound, setMeditateBgSound] = useState<string>('fire');
  const [playStartBell, setPlayStartBell] = useState<boolean>(false);

  // Breathing Settings (Studio track or visual rhythm)
  const [breathPattern, setBreathPattern] = useState<string>('ru-breathing');
  const [breathPhaseText, setBreathPhaseText] = useState<string>('Вдох');
  const [breathHaloScale, setBreathHaloScale] = useState<number>(1.0);
  const [breathHaloOpacity, setBreathHaloOpacity] = useState<number>(0.2);

  // Ambient Settings
  const [ambientSound, setAmbientSound] = useState<string>('fire');

  // Independent Volumes
  const [masterVolume, setMasterVolume] = useState<number>(0.85);
  const [voiceVolume, setVoiceVolume] = useState<number>(0.9);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);

  // Timer & Inactivity Refs
  const timerIntervalRef = useRef<number | null>(null);
  const breathTimeoutRef = useRef<number | null>(null);
  const mouseActivityTimerRef = useRef<number | null>(null);

  // Format MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Switch Mode Handler
  const handleModeChange = useCallback((newMode: AppMode) => {
    stopSession();
    setMode(newMode);

    if (newMode === 'meditate') {
      if (meditateType === 'free') {
        setMeditateTimeLeft(meditateDuration);
      } else {
        const track = GUIDED_TRACKS.find(t => t.id === meditateType);
        if (track) setMeditateTimeLeft(track.duration);
      }
    } else if (newMode === 'breathe') {
      if (breathPattern.startsWith('ru-')) {
        const track = GUIDED_TRACKS.find(t => t.id === breathPattern);
        if (track) setMeditateTimeLeft(track.duration);
      }
    }
  }, [meditateType, meditateDuration, breathPattern]);

  // Start / Stop Session
  const stopSession = useCallback(() => {
    setIsRunning(false);
    setIsZenDimmed(false);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (breathTimeoutRef.current) clearTimeout(breathTimeoutRef.current);

    audioEngine.stopAll();

    setBreathHaloScale(0.95);
    setBreathHaloOpacity(0.15);
  }, []);

  const completeSession = useCallback(() => {
    stopSession();
    if (playStartBell) audioEngine.playBowl();

    if (mode === 'meditate') {
      if (meditateType === 'free') {
        setMeditateTimeLeft(meditateDuration);
      } else {
        const track = GUIDED_TRACKS.find(t => t.id === meditateType);
        if (track) setMeditateTimeLeft(track.duration);
      }
    } else if (mode === 'breathe') {
      if (breathPattern.startsWith('ru-')) {
        const track = GUIDED_TRACKS.find(t => t.id === breathPattern);
        if (track) setMeditateTimeLeft(track.duration);
      }
    }
  }, [stopSession, playStartBell, mode, meditateType, meditateDuration, breathPattern]);

  const startMeditateSession = useCallback(() => {
    if (playStartBell) {
      audioEngine.playBowl();
    }

    // Start background ambience if selected
    if (meditateBgSound !== 'none') {
      audioEngine.playSoundscape(meditateBgSound);
    } else {
      audioEngine.stopSoundscape();
    }

    // Start Guided Russian track or Free Timer
    if (meditateType !== 'free') {
      audioEngine.playGuidedTrack(
        meditateType,
        (currentTime, duration) => {
          const remaining = Math.max(0, Math.floor(duration - currentTime));
          setMeditateTimeLeft(remaining);
        },
        () => {
          completeSession();
        }
      );
    } else {
      let currentLeft = meditateTimeLeft;
      timerIntervalRef.current = window.setInterval(() => {
        currentLeft -= 1;
        if (currentLeft >= 0) {
          setMeditateTimeLeft(currentLeft);
        } else {
          completeSession();
        }
      }, 1000);
    }

    setBreathHaloScale(1.15);
    setBreathHaloOpacity(0.3);
  }, [playStartBell, meditateBgSound, meditateType, meditateTimeLeft, completeSession]);

  const startBreatheSession = useCallback(() => {
    // Start background nature ambience if selected
    if (meditateBgSound !== 'none') {
      audioEngine.playSoundscape(meditateBgSound);
    } else {
      audioEngine.stopSoundscape();
    }

    // If it is a studio Russian human breathing track (UCLA MARC)
    if (breathPattern.startsWith('ru-')) {
      audioEngine.playGuidedTrack(
        breathPattern,
        (currentTime, duration) => {
          const remaining = Math.max(0, Math.floor(duration - currentTime));
          setMeditateTimeLeft(remaining);
          const pulse = Math.sin(currentTime * 0.8) * 0.2 + 1.1;
          setBreathHaloScale(pulse);
          setBreathHaloOpacity(0.35);
        },
        () => {
          completeSession();
        }
      );
      return;
    }

    // If it is a visual rhythm pattern (Box, Relax, Coherent)
    const patterns: Record<string, Array<{ text: string; dur: number; scale: number; opacity: number }>> = {
      box: [
        { text: 'Вдох', dur: 4000, scale: 1.35, opacity: 0.5 },
        { text: 'Задержка', dur: 4000, scale: 1.35, opacity: 0.5 },
        { text: 'Выдох', dur: 4000, scale: 0.85, opacity: 0.15 },
        { text: 'Пауза', dur: 4000, scale: 0.85, opacity: 0.15 }
      ],
      relax: [
        { text: 'Вдох', dur: 4000, scale: 1.35, opacity: 0.5 },
        { text: 'Задержка', dur: 7000, scale: 1.35, opacity: 0.5 },
        { text: 'Выдох', dur: 8000, scale: 0.85, opacity: 0.15 }
      ],
      coherent: [
        { text: 'Вдох', dur: 5500, scale: 1.35, opacity: 0.5 },
        { text: 'Выдох', dur: 5500, scale: 0.85, opacity: 0.15 }
      ]
    };

    const pattern = patterns[breathPattern] || patterns.box;
    let phaseIdx = 0;

    const runPhase = () => {
      const p = pattern[phaseIdx];
      setBreathPhaseText(p.text);
      setBreathHaloScale(p.scale);
      setBreathHaloOpacity(p.opacity);

      breathTimeoutRef.current = window.setTimeout(() => {
        phaseIdx = (phaseIdx + 1) % pattern.length;
        runPhase();
      }, p.dur);
    };

    runPhase();
  }, [breathPattern, meditateBgSound, completeSession]);

  const startAmbientSession = useCallback(() => {
    audioEngine.playSoundscape(ambientSound);
    setBreathHaloScale(1.2);
    setBreathHaloOpacity(0.35);
  }, [ambientSound]);

  const toggleSession = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      if (mode === 'meditate') startMeditateSession();
      else if (mode === 'breathe') startBreatheSession();
      else if (mode === 'ambient') startAmbientSession();
    } else {
      stopSession();
    }
  }, [isRunning, mode, startMeditateSession, startBreatheSession, startAmbientSession, stopSession]);

  // Meditate Type Selection
  const handleMeditateTypeChange = (type: 'free' | string) => {
    if (isRunning) stopSession();
    setMeditateType(type);

    if (type === 'free') {
      setMeditateTimeLeft(meditateDuration);
    } else {
      const track = GUIDED_TRACKS.find(t => t.id === type);
      if (track) {
        setMeditateDuration(track.duration);
        setMeditateTimeLeft(track.duration);
      }
    }
  };

  // Meditate Duration Selection
  const handleMeditateDurationChange = (dur: number) => {
    if (isRunning) stopSession();
    setMeditateDuration(dur);
    setMeditateTimeLeft(dur);
  };

  // Breath Pattern Selection
  const handleBreathPatternChange = (pattern: string) => {
    if (isRunning) stopSession();
    setBreathPattern(pattern);

    if (pattern.startsWith('ru-')) {
      const track = GUIDED_TRACKS.find(t => t.id === pattern);
      if (track) {
        setMeditateDuration(track.duration);
        setMeditateTimeLeft(track.duration);
      }
    }
  };

  // Background Sound Selection
  const handleBgSoundChange = (soundId: string) => {
    setMeditateBgSound(soundId);
    if (isRunning && (mode === 'meditate' || mode === 'breathe')) {
      if (soundId !== 'none') audioEngine.playSoundscape(soundId);
      else audioEngine.stopSoundscape();
    }
  };

  // Ambient Sound Click
  const handleAmbientSoundChange = (soundId: string) => {
    if (soundId === ambientSound && isRunning && mode === 'ambient') {
      stopSession();
      return;
    }
    setAmbientSound(soundId);
    setIsRunning(true);
    audioEngine.playSoundscape(soundId);
    setBreathHaloScale(1.2);
    setBreathHaloOpacity(0.35);
  };

  // Volume Handlers
  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    audioEngine.setMasterVolume(vol);
  };

  const handleVoiceVolumeChange = (vol: number) => {
    setVoiceVolume(vol);
    audioEngine.setVoiceVolume(vol);
  };

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    audioEngine.setAmbientVolume(vol);
  };

  // Compute Active Visual Ambient Theme
  const getAmbientTheme = (): AmbientTheme => {
    const activeSound = mode === 'ambient' ? ambientSound : meditateBgSound;
    if (activeSound === 'fire') return 'fire';
    if (activeSound === 'night') return 'night';
    if (activeSound === 'rain') return 'rain';
    if (activeSound === 'ocean') return 'ocean';
    if (activeSound === 'wind') return 'wind';
    return 'neutral';
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Inactivity dimmer
  useEffect(() => {
    const handleMouseMove = () => {
      setIsZenDimmed(false);
      document.body.classList.remove('cursor-none');

      if (mouseActivityTimerRef.current) clearTimeout(mouseActivityTimerRef.current);
      if (isRunning) {
        mouseActivityTimerRef.current = window.setTimeout(() => {
          setIsZenDimmed(true);
          document.body.classList.add('cursor-none');
        }, 3000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseActivityTimerRef.current) clearTimeout(mouseActivityTimerRef.current);
      document.body.classList.remove('cursor-none');
    };
  }, [isRunning]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggleSession();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyB') {
        audioEngine.playBowl();
      } else if (e.code === 'KeyM') {
        handleMasterVolumeChange(masterVolume === 0 ? 0.85 : 0);
      } else if (e.code === 'Digit1') {
        handleModeChange('meditate');
      } else if (e.code === 'Digit2') {
        handleModeChange('breathe');
      } else if (e.code === 'Digit3') {
        handleModeChange('ambient');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSession, handleModeChange, masterVolume]);

  const isBreatheStudioTrack = mode === 'breathe' && breathPattern.startsWith('ru-');
  const isVisualRhythmMode = mode === 'breathe' && !breathPattern.startsWith('ru-');

  const currentTotal = meditateDuration || 300;
  const progress = (mode === 'meditate' || isBreatheStudioTrack)
    ? (meditateTimeLeft / currentTotal)
    : (isRunning ? 1 : 0);

  let statusText = 'Нажмите для начала';
  if (isRunning) {
    if (mode === 'meditate') {
      statusText = meditateType === 'free' ? 'Сессия осознанности' : 'Студийный русский аудио-гайд';
    } else if (mode === 'breathe') {
      statusText = isBreatheStudioTrack ? 'Студийная практика дыхания' : 'Следите за ритмом';
    } else if (mode === 'ambient') {
      statusText = 'Звуковой покой';
    }
  } else {
    if (mode === 'meditate') {
      statusText = meditateType === 'free' ? 'Медитация' : 'Студийный русский аудио-гайд';
    } else if (mode === 'breathe') {
      statusText = isBreatheStudioTrack ? 'Русская практика дыхания' : 'Визуальный ритм дыхания';
    } else if (mode === 'ambient') {
      statusText = 'Выбор ландшафта';
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 overflow-hidden bg-radial from-[#152033] to-[#070c18] text-slate-100">
      {/* Theme-Adaptive Living Particle Background Canvas */}
      <ParticleCanvas
        theme={getAmbientTheme()}
        isRunning={isRunning}
        breathScale={breathHaloScale}
      />

      {/* App Container */}
      <div className={`relative z-10 w-full max-w-4xl h-full min-h-[92vh] flex flex-col items-center justify-between transition-opacity duration-1000 ${
        isZenDimmed ? 'opacity-10' : 'opacity-100'
      }`}>
        <Header
          mode={mode}
          onModeChange={handleModeChange}
          onPlayBowl={() => audioEngine.playBowl()}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        <CircularRing
          progress={progress}
          timeLeftFormatted={mode === 'ambient' ? '∞' : (isVisualRhythmMode ? '🫁' : formatTime(meditateTimeLeft))}
          isRunning={isRunning}
          statusText={statusText}
          breathPhaseText={breathPhaseText}
          isBreatheMode={isVisualRhythmMode}
          breathHaloScale={breathHaloScale}
          breathHaloOpacity={breathHaloOpacity}
          onToggle={toggleSession}
        />

        <FooterControls
          mode={mode}
          meditateType={meditateType}
          onMeditateTypeChange={handleMeditateTypeChange}
          meditateDuration={meditateDuration}
          onMeditateDurationChange={handleMeditateDurationChange}
          bgSound={meditateBgSound}
          onBgSoundChange={handleBgSoundChange}
          breathPattern={breathPattern}
          onBreathPatternChange={handleBreathPatternChange}
          ambientSound={ambientSound}
          onAmbientSoundChange={handleAmbientSoundChange}
          masterVolume={masterVolume}
          onMasterVolumeChange={handleMasterVolumeChange}
          voiceVolume={voiceVolume}
          onVoiceVolumeChange={handleVoiceVolumeChange}
          ambientVolume={ambientVolume}
          onAmbientVolumeChange={handleAmbientVolumeChange}
          playStartBell={playStartBell}
          onToggleStartBell={() => setPlayStartBell(prev => !prev)}
        />
      </div>
    </div>
  );
}
export default App;
