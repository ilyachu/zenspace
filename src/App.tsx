import { useState, useEffect, useRef, useCallback } from 'react';
import { ParticleCanvas, AmbientTheme } from './components/ParticleCanvas';
import { Header, AppMode } from './components/Header';
import { CircularRing } from './components/CircularRing';
import { FooterControls } from './components/FooterControls';
import { AuthModal } from './components/AuthModal';
import { IntroOverlay } from './components/IntroOverlay';
import { audioEngine, GUIDED_TRACKS } from './services/audioEngine';

const ZEN_QUOTES = {
  ru: [
    'ничего срочного сегодня',
    'вдох — покой, выдох — отпускание',
    'здесь и сейчас всё спокойно',
    'ум чист как ночное небо',
    'просто наблюдайте за дыханием',
    'тишина внутри вас',
    'возвращайтесь в настоящий момент'
  ],
  en: [
    'nothing urgent tonight',
    'inhale peace, exhale release',
    'all is calm right here, right now',
    'mind is clear as the night sky',
    'simply observe your breath',
    'silence resides within you',
    'return gently to the present moment'
  ]
};

export function App() {
  // Navigation & Language State
  const [lang, setLang] = useState<'ru' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('zenspace_lang');
      return (saved === 'ru' || saved === 'en') ? saved : 'ru';
    } catch {
      return 'ru';
    }
  });

  const [mode, setMode] = useState<AppMode>('meditate');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isZenDimmed, setIsZenDimmed] = useState<boolean>(false);

  // Auth & Monetization Modal State
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    try {
      const saved = localStorage.getItem('zenspace_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Floating Sky Thought
  const [quoteIdx, setQuoteIdx] = useState<number>(0);

  // Meditation Settings
  const [meditateType, setMeditateType] = useState<'free' | string>('ru-bodyscan');
  const [meditateDuration, setMeditateDuration] = useState<number>(238);
  const [meditateTimeLeft, setMeditateTimeLeft] = useState<number>(238);
  const [meditateBgSound, setMeditateBgSound] = useState<string>('fire');
  const [playStartBell, setPlayStartBell] = useState<boolean>(false);

  // Breathing Settings
  const [breathPattern, setBreathPattern] = useState<string>('ru-breathing');
  const [breathPhaseText, setBreathPhaseText] = useState<string>('Вдох');
  const [breathHaloScale, setBreathHaloScale] = useState<number>(1.0);
  const [breathHaloOpacity, setBreathHaloOpacity] = useState<number>(0.2);
  const [phaseDurationMs, setPhaseDurationMs] = useState<number>(1000);

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

  const toggleLang = (newLang: 'ru' | 'en') => {
    setLang(newLang);
    try {
      localStorage.setItem('zenspace_lang', newLang);
    } catch {}
  };

  // Format MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleLogin = (email: string, name: string) => {
    const u = { email, name };
    setUser(u);
    try {
      localStorage.setItem('zenspace_user', JSON.stringify(u));
    } catch {}
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('zenspace_user');
    } catch {}
  };

  const nextQuote = () => {
    const quotes = ZEN_QUOTES[lang];
    setQuoteIdx((prev) => (prev + 1) % quotes.length);
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
    setPhaseDurationMs(800);
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

    if (meditateBgSound !== 'none') {
      audioEngine.playSoundscape(meditateBgSound);
    } else {
      audioEngine.stopSoundscape();
    }

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

    setPhaseDurationMs(1200);
    setBreathHaloScale(1.15);
    setBreathHaloOpacity(0.3);
  }, [playStartBell, meditateBgSound, meditateType, meditateTimeLeft, completeSession]);

  const startBreatheSession = useCallback(() => {
    if (meditateBgSound !== 'none') {
      audioEngine.playSoundscape(meditateBgSound);
    } else {
      audioEngine.stopSoundscape();
    }

    if (breathPattern.startsWith('ru-')) {
      audioEngine.playGuidedTrack(
        breathPattern,
        (currentTime, duration) => {
          const remaining = Math.max(0, Math.floor(duration - currentTime));
          setMeditateTimeLeft(remaining);
          const pulse = Math.sin(currentTime * 0.8) * 0.15 + 1.1;
          setPhaseDurationMs(1000);
          setBreathHaloScale(pulse);
          setBreathHaloOpacity(0.35);
        },
        () => {
          completeSession();
        }
      );
      return;
    }

    const patterns: Record<string, Array<{ text: string; dur: number; scale: number; opacity: number }>> = {
      box: [
        { text: lang === 'ru' ? 'Вдох' : 'Inhale', dur: 4000, scale: 1.35, opacity: 0.5 },
        { text: lang === 'ru' ? 'Задержка' : 'Hold', dur: 4000, scale: 1.35, opacity: 0.5 },
        { text: lang === 'ru' ? 'Выдох' : 'Exhale', dur: 4000, scale: 0.85, opacity: 0.15 },
        { text: lang === 'ru' ? 'Пауза' : 'Hold', dur: 4000, scale: 0.85, opacity: 0.15 }
      ],
      relax: [
        { text: lang === 'ru' ? 'Вдох' : 'Inhale', dur: 4000, scale: 1.35, opacity: 0.5 },
        { text: lang === 'ru' ? 'Задержка' : 'Hold', dur: 7000, scale: 1.35, opacity: 0.5 },
        { text: lang === 'ru' ? 'Выдох' : 'Exhale', dur: 8000, scale: 0.85, opacity: 0.15 }
      ],
      coherent: [
        { text: lang === 'ru' ? 'Вдох' : 'Inhale', dur: 5500, scale: 1.35, opacity: 0.5 },
        { text: lang === 'ru' ? 'Выдох' : 'Exhale', dur: 5500, scale: 0.85, opacity: 0.15 }
      ]
    };

    const pattern = patterns[breathPattern] || patterns.box;
    let phaseIdx = 0;

    const runPhase = () => {
      const p = pattern[phaseIdx];
      setBreathPhaseText(p.text);
      setPhaseDurationMs(p.dur);
      setBreathHaloScale(p.scale);
      setBreathHaloOpacity(p.opacity);

      breathTimeoutRef.current = window.setTimeout(() => {
        phaseIdx = (phaseIdx + 1) % pattern.length;
        runPhase();
      }, p.dur);
    };

    runPhase();
  }, [breathPattern, meditateBgSound, completeSession, lang]);

  const startAmbientSession = useCallback(() => {
    audioEngine.playSoundscape(ambientSound);
    setPhaseDurationMs(1200);
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
    setPhaseDurationMs(1200);
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
        }, 3500);
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

  let statusText = lang === 'ru' ? 'Нажмите для начала' : 'Click to begin';
  if (isRunning) {
    if (mode === 'meditate') {
      statusText = meditateType === 'free'
        ? (lang === 'ru' ? 'Сессия осознанности' : 'Mindfulness Session')
        : (lang === 'ru' ? 'Студийный русский аудио-гайд' : 'Studio Guided Meditation');
    } else if (mode === 'breathe') {
      statusText = isBreatheStudioTrack
        ? (lang === 'ru' ? 'Студийная практика дыхания' : 'Guided Breathwork')
        : (lang === 'ru' ? 'Следите за ритмом' : 'Follow the Rhythm');
    } else if (mode === 'ambient') {
      statusText = lang === 'ru' ? 'Звуковой покой' : 'Ambient Immersion';
    }
  } else {
    if (mode === 'meditate') {
      statusText = meditateType === 'free'
        ? (lang === 'ru' ? 'Медитация' : 'Meditation')
        : (lang === 'ru' ? 'Студийный русский аудио-гайд' : 'Studio Guided Session');
    } else if (mode === 'breathe') {
      statusText = isBreatheStudioTrack
        ? (lang === 'ru' ? 'Русская практика дыхания' : 'Studio Breath Session')
        : (lang === 'ru' ? 'Визуальный ритм дыхания' : 'Visual Breath Flow');
    } else if (mode === 'ambient') {
      statusText = lang === 'ru' ? 'Выбор ландшафта' : 'Select Soundscape';
    }
  }

  const quotes = ZEN_QUOTES[lang];
  const activeQuote = quotes[quoteIdx % quotes.length];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 md:p-6 overflow-hidden bg-[#030712] text-[#e6edf8]">
      {/* 1. Intro Screen Overlay in exact lofi-night-sky style */}
      <IntroOverlay
        onEnter={() => {}}
        lang={lang}
        onToggleLang={toggleLang}
      />

      {/* 2. Theme-Adaptive Living Particle Background Canvas */}
      <ParticleCanvas
        theme={getAmbientTheme()}
        isRunning={isRunning}
        breathScale={breathHaloScale}
      />

      {/* 3. App Main HUD Container */}
      <div className={`relative z-10 w-full max-w-5xl h-full min-h-[92vh] flex flex-col items-center justify-between transition-opacity duration-1000 ${
        isZenDimmed ? 'opacity-15' : 'opacity-100'
      }`}>
        <Header
          mode={mode}
          onModeChange={handleModeChange}
          onPlayBowl={() => audioEngine.playBowl()}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenAuth={() => setIsAuthOpen(true)}
          user={user}
        />

        {/* Floating Poetic Zen Quote in lofi-night-sky style */}
        <div
          onClick={nextQuote}
          title={lang === 'ru' ? 'Нажмите, чтобы сменить мысль' : 'Click to change thought'}
          className="cursor-pointer text-xs md:text-sm font-['Jost',sans-serif] tracking-wider text-[#94a3b8] hover:text-[#f6c46a] transition-all duration-300 py-1.5 px-4 rounded-full bg-[#060c1a]/50 border border-white/5 backdrop-blur-md shadow-sm select-none hover:scale-105 my-2"
        >
          {activeQuote}
        </div>

        <CircularRing
          progress={progress}
          timeLeftFormatted={mode === 'ambient' ? '∞' : (isVisualRhythmMode ? '🫁' : formatTime(meditateTimeLeft))}
          isRunning={isRunning}
          statusText={statusText}
          breathPhaseText={breathPhaseText}
          isBreatheMode={isVisualRhythmMode}
          breathHaloScale={breathHaloScale}
          breathHaloOpacity={breathHaloOpacity}
          phaseDurationMs={phaseDurationMs}
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

      {/* 4. Auth & Monetization Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </div>
  );
}
export default App;
