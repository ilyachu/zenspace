/**
 * ZenSpace Professional Audio Engine
 * Bundled with 100% authentic studio audio assets:
 * - Real Studio Human Russian Guided Meditations & Breathing Practices (UCLA MARC)
 * - Hi-Fi Nature Soundscapes
 * - Authentic Tibetan Singing Bowl
 * - Independent Dual Volume Controls (Voice vs Ambience)
 * - Auto-Ducking
 * - iOS / Android Background Audio Bridge & MediaSession Lock Screen Playback
 * - Screen WakeLock API
 */

export type VoiceType = 'female' | 'male';

export interface GuidedTrack {
  id: string;
  title: string;
  subtitle: string;
  duration: number; // in seconds
  url: string; // female (UCLA MARC / Inguna)
  maleUrl?: string; // male (Dmitry / MBSR)
  maleDuration?: number;
  category: 'core' | 'relaxation' | 'deep';
}

export interface Soundscape {
  id: string;
  name: string;
  icon: string;
  url?: string;
  category: 'nature' | 'frequency';
  subtitle?: string;
  description?: string;
  frequencyType?: 'solfeggio' | 'binaural';
  frequencyHz?: number;
  beatHz?: number;
}

export const GUIDED_TRACKS: GuidedTrack[] = [
  {
    id: 'ru-breathing',
    title: 'Осознанное дыхание',
    subtitle: 'Базовый фокус на дыхании и ясность ума',
    duration: 473, // 7:50
    url: '/audio/meditations/ru-breathing.mp3',
    maleUrl: '/audio/meditations/male-ru-breathing.mp3',
    maleDuration: 180,
    category: 'core'
  },
  {
    id: 'ru-bodyscan',
    title: 'Сканирование тела',
    subtitle: 'Пошаговое мышечное расслабление и заземление',
    duration: 238, // 4:00
    url: '/audio/meditations/ru-bodyscan.mp3',
    maleUrl: '/audio/meditations/male-ru-bodyscan.mp3',
    maleDuration: 106,
    category: 'relaxation'
  },
  {
    id: 'ru-breathsoundbody',
    title: 'Дыхание, звуки и тело',
    subtitle: 'Расширение осознанности и внутренний покой',
    duration: 623, // 10:20
    url: '/audio/meditations/ru-breathsoundbody.mp3',
    maleUrl: '/audio/meditations/male-ru-breathsoundbody.mp3',
    maleDuration: 120,
    category: 'core'
  },
  {
    id: 'ru-lovingkindness',
    title: 'Метта (Доброжелательность)',
    subtitle: 'Снятие тревожности и внутреннее тепло',
    duration: 776, // 13:00
    url: '/audio/meditations/ru-lovingkindness.mp3',
    maleUrl: '/audio/meditations/male-ru-lovingkindness.mp3',
    maleDuration: 140,
    category: 'relaxation'
  },
  {
    id: 'ru-complete',
    title: 'Полная сессия медитации',
    subtitle: 'Глубокое погружение и перезагрузка ума',
    duration: 1245, // 20:45
    url: '/audio/meditations/ru-complete.mp3',
    maleUrl: '/audio/meditations/male-ru-complete.mp3',
    maleDuration: 150,
    category: 'deep'
  }
];

export const SOUNDSCAPES: Soundscape[] = [
  // Природа
  {
    id: 'fire',
    name: 'Костёр',
    icon: '🔥',
    url: '/audio/soundscapes/fire.mp3',
    category: 'nature',
    subtitle: 'Потрескивание пламени в ночи'
  },
  {
    id: 'night',
    name: 'Летняя ночь',
    icon: '🦗',
    url: '/audio/soundscapes/night.mp3',
    category: 'nature',
    subtitle: 'Сверчки и тихое звёздное небо'
  },
  {
    id: 'rain',
    name: 'Мягкий дождь',
    icon: '🌧️',
    url: '/audio/soundscapes/rain.mp3',
    category: 'nature',
    subtitle: 'Успокаивающий шелест капель'
  },
  {
    id: 'ocean',
    name: 'Океан',
    icon: '🌊',
    url: '/audio/soundscapes/ocean.mp3',
    category: 'nature',
    subtitle: 'Мерный прибой и дыхание волн'
  },
  {
    id: 'wind',
    name: 'Лесной ветер',
    icon: '🍃',
    url: '/audio/soundscapes/wind.mp3',
    category: 'nature',
    subtitle: 'Шёпот хвои и горный воздух'
  },

  // Частоты и бинауральные ритмы (Синтезируются через Web Audio API)
  {
    id: 'freq-432',
    name: 'Частота 432 Гц',
    icon: '✨',
    category: 'frequency',
    subtitle: 'Природная гармония и снятие стресса',
    description: 'Частота естественного природного строя Верди. Успокаивает нервную систему и гармонизирует биоритмы.',
    frequencyType: 'solfeggio',
    frequencyHz: 432
  },
  {
    id: 'freq-528',
    name: 'Частота 528 Гц',
    icon: '🧬',
    category: 'frequency',
    subtitle: 'Трансформация и внутренняя сила',
    description: 'Частота Сольфеджио («Золотая пропорция»). Способствует релаксации, ясности ума и снижению кортизола.',
    frequencyType: 'solfeggio',
    frequencyHz: 528
  },
  {
    id: 'freq-alpha',
    name: 'Альфа-ритм (10 Гц)',
    icon: '🧠',
    category: 'frequency',
    subtitle: 'Спокойный фокус и ясность ума',
    description: 'Бинауральный ритм расслабленного внимания. Идеален для чтения, работы и мягкого сброса усталости. Рекомендуется слушать в наушниках.',
    frequencyType: 'binaural',
    frequencyHz: 200,
    beatHz: 10
  },
  {
    id: 'freq-theta',
    name: 'Тета-ритм (6 Гц)',
    icon: '🌌',
    category: 'frequency',
    subtitle: 'Глубокая медитация и интуиция',
    description: 'Синхронизирует мозговую активность с состоянием трансового покоя и расширенного осознавания. Рекомендуется слушать в наушниках.',
    frequencyType: 'binaural',
    frequencyHz: 180,
    beatHz: 6
  },
  {
    id: 'freq-delta',
    name: 'Дельта-ритм (2.5 Гц)',
    icon: '🌙',
    category: 'frequency',
    subtitle: 'Глубокий восстановительный сон',
    description: 'Низкочастотные волны для отключения навязчивых мыслей и быстрого погружения в сон. Рекомендуется слушать в наушниках.',
    frequencyType: 'binaural',
    frequencyHz: 130,
    beatHz: 2.5
  }
];

class AudioEngine {
  private masterVolume: number = 0.85;
  private voiceVolume: number = 0.9;
  private ambientVolume: number = 0.5;

  private activeBgId: string | null = null;
  private activeGuideId: string | null = null;
  private activeVoice: VoiceType = 'female';
  private isPlaying: boolean = false;

  private bgElements: Map<string, HTMLAudioElement> = new Map();
  private guideAudio: HTMLAudioElement | null = null;
  private bowlAudio: HTMLAudioElement;

  // Web Audio API Context for Frequency & Binaural Beats Synthesis
  private audioCtx: AudioContext | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private freqGainNode: GainNode | null = null;

  // iOS Lock Screen Background Audio Bridge
  private bgKeepAliveAudio: HTMLAudioElement | null = null;
  private wakeLock: any = null;

  private onGuideTimeUpdate?: (currentTime: number, duration: number) => void;
  private onGuideEnded?: () => void;

  constructor() {
    // 1. Pre-initialize nature soundscape players (only for those with audio URL)
    SOUNDSCAPES.forEach(s => {
      if (s.url) {
        const a = new Audio(s.url);
        a.loop = true;
        a.preload = 'auto';
        (a as any).playsInline = true;
        a.setAttribute('playsinline', 'true');
        a.setAttribute('webkit-playsinline', 'true');
        a.volume = this.calculateAmbientVol();
        this.bgElements.set(s.id, a);
      }
    });

    // 2. Tibetan Singing Bowl
    this.bowlAudio = new Audio('/audio/soundscapes/bowl.mp3');
    this.bowlAudio.preload = 'auto';
    (this.bowlAudio as any).playsInline = true;
    this.bowlAudio.setAttribute('playsinline', 'true');
    this.bowlAudio.setAttribute('webkit-playsinline', 'true');

    // 3. iOS Lock Screen Keep-Alive Audio Bridge & MediaSession Setup
    this.setupIosBackgroundAudioBridge();
    this.initMediaSessionHandlers();
    this.bindLifecycleEvents();
  }

  /**
   * Generates a 2-second inaudible 18 Hz tone.
   * Pure digital silence is discarded by iOS WebKit, but an inaudible 18Hz tone
   * guarantees the iOS system keeps AVAudioSessionCategoryPlayback active on lock screen!
   */
  private createQuietKeepAliveUrl(): string {
    const sampleRate = 22050;
    const seconds = 2;
    const numSamples = sampleRate * seconds;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin((i * 18 * 2 * Math.PI) / sampleRate) * 80;
      view.setInt16(44 + i * 2, sample, true);
    }

    return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
  }

  private setupIosBackgroundAudioBridge() {
    if (typeof document === 'undefined') return;
    try {
      const el = document.createElement('audio');
      el.loop = true;
      el.preload = 'auto';
      (el as any).playsInline = true;
      el.volume = 0.02;
      el.setAttribute('playsinline', 'true');
      el.setAttribute('webkit-playsinline', 'true');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
      el.src = this.createQuietKeepAliveUrl();
      document.body.appendChild(el);
      this.bgKeepAliveAudio = el;
    } catch (e) {
      console.warn('iOS audio bridge init warning:', e);
    }
  }

  private bindLifecycleEvents() {
    if (typeof window === 'undefined') return;

    const keepAlive = () => {
      if (this.isPlaying && this.bgKeepAliveAudio && this.bgKeepAliveAudio.paused) {
        this.bgKeepAliveAudio.play().catch(() => {});
      }
      this.updateMediaSessionMetadata();
    };

    document.addEventListener('visibilitychange', keepAlive);
    window.addEventListener('pageshow', keepAlive);
    window.addEventListener('focus', keepAlive);
  }

  private calculateAmbientVol(): number {
    const ducking = this.guideAudio && !this.guideAudio.paused ? 0.35 : 1.0;
    return Math.max(0, Math.min(1, this.masterVolume * this.ambientVolume * ducking));
  }

  private calculateVoiceVol(): number {
    return Math.max(0, Math.min(1, this.masterVolume * this.voiceVolume));
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.updateVolumes();
  }

  public setVoiceVolume(vol: number) {
    this.voiceVolume = Math.max(0, Math.min(1, vol));
    this.updateVolumes();
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    this.updateVolumes();
  }

  private updateVolumes() {
    const ambVol = this.calculateAmbientVol();
    this.bgElements.forEach(a => {
      a.volume = ambVol;
    });

    if (this.freqGainNode && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      try {
        this.freqGainNode.gain.cancelScheduledValues(now);
        this.freqGainNode.gain.setValueAtTime(this.freqGainNode.gain.value, now);
        this.freqGainNode.gain.linearRampToValueAtTime(ambVol, now + 0.1);
      } catch {}
    }

    const voiceVol = this.calculateVoiceVol();
    if (this.guideAudio) {
      this.guideAudio.volume = voiceVol;
    }

    this.bowlAudio.volume = this.masterVolume;
  }

  /* ----------------------------------------------------
     Frequency & Binaural Beats Web Audio Synthesizer
     ---------------------------------------------------- */
  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private playFrequencySound(sound: any) {
    this.stopFrequencySound();
    const ctx = this.initAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    const targetVol = this.calculateAmbientVol();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(targetVol, now + 0.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(sound.frequencyType === 'solfeggio' ? 1200 : 500, now);

    masterGain.connect(filter);
    filter.connect(ctx.destination);

    this.freqGainNode = masterGain;

    if (sound.frequencyType === 'solfeggio') {
      const baseHz = sound.frequencyHz || 432;
      // Main pure sine
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseHz, now);

      // Warm harmonic (softer)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseHz * 2, now);
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.07, now);

      osc1.connect(masterGain);
      osc2.connect(osc2Gain);
      osc2Gain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      this.activeOscillators = [osc1, osc2];
    } else if (sound.frequencyType === 'binaural') {
      const baseHz = sound.frequencyHz || 200;
      const diff = sound.beatHz || 6;
      const leftHz = baseHz - diff / 2;
      const rightHz = baseHz + diff / 2;

      const oscLeft = ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(leftHz, now);

      const oscRight = ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(rightHz, now);

      if ('createStereoPanner' in ctx) {
        const pannerLeft = (ctx as any).createStereoPanner();
        pannerLeft.pan.setValueAtTime(-0.95, now);
        oscLeft.connect(pannerLeft);
        pannerLeft.connect(masterGain);

        const pannerRight = (ctx as any).createStereoPanner();
        pannerRight.pan.setValueAtTime(0.95, now);
        oscRight.connect(pannerRight);
        pannerRight.connect(masterGain);
      } else {
        oscLeft.connect(masterGain);
        oscRight.connect(masterGain);
      }

      oscLeft.start(now);
      oscRight.start(now);
      this.activeOscillators = [oscLeft, oscRight];
    }
  }

  private stopFrequencySound() {
    if (this.freqGainNode && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      try {
        this.freqGainNode.gain.cancelScheduledValues(now);
        this.freqGainNode.gain.setValueAtTime(this.freqGainNode.gain.value, now);
        this.freqGainNode.gain.linearRampToValueAtTime(0.0001, now + 0.2);
      } catch {}
    }
    const oscs = [...this.activeOscillators];
    this.activeOscillators = [];
    setTimeout(() => {
      oscs.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
    }, 250);
  }

  public setActiveVoice(voice: VoiceType) {
    this.activeVoice = voice;
  }

  public getActiveVoice(): VoiceType {
    return this.activeVoice;
  }

  public playBowl() {
    try {
      this.bowlAudio.currentTime = 0;
      this.bowlAudio.volume = this.masterVolume;
      const p = this.bowlAudio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {}
  }

  public playSoundscape(id: string | null) {
    if (!id || id === 'none') {
      this.stopSoundscape();
      return;
    }

    const target = SOUNDSCAPES.find(s => s.id === id);
    if (!target) return;

    this.isPlaying = true;
    this.activeBgId = id;

    // 1. If it's a frequency soundscape, synthesize via Web Audio
    if (target.category === 'frequency') {
      this.bgElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      this.playFrequencySound(target);
    } else {
      // 2. If it's a nature soundscape, stop frequency synth and play HTMLAudioElement
      this.stopFrequencySound();
      this.bgElements.forEach((audio, k) => {
        if (k !== id) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      const el = this.bgElements.get(id);
      if (el) {
        el.volume = this.calculateAmbientVol();
        const p = el.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    }

    if (this.bgKeepAliveAudio && this.bgKeepAliveAudio.paused) {
      this.bgKeepAliveAudio.play().catch(() => {});
    }

    this.updateMediaSessionMetadata();
    this.requestWakeLock();
  }

  public stopSoundscape() {
    this.activeBgId = null;
    this.bgElements.forEach(audio => {
      audio.pause();
    });
    this.stopFrequencySound();
    if (!this.guideAudio) {
      this.isPlaying = false;
      if (this.bgKeepAliveAudio) this.bgKeepAliveAudio.pause();
      this.releaseWakeLock();
    }
  }

  public playGuidedTrack(
    trackId: string,
    onTimeUpdate?: (current: number, dur: number) => void,
    onEnded?: () => void,
    voice: VoiceType = this.activeVoice
  ) {
    this.stopGuidedTrack();

    const track = GUIDED_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    this.isPlaying = true;
    this.activeGuideId = trackId;
    this.activeVoice = voice;
    this.onGuideTimeUpdate = onTimeUpdate;
    this.onGuideEnded = onEnded;

    const audioUrl = (voice === 'male' && (track as any).maleUrl) ? (track as any).maleUrl : track.url;
    const audio = new Audio(audioUrl);
    audio.volume = this.calculateVoiceVol();
    audio.preload = 'auto';
    (audio as any).playsInline = true;
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');

    audio.ontimeupdate = () => {
      if (this.onGuideTimeUpdate) {
        this.onGuideTimeUpdate(audio.currentTime, audio.duration || track.duration);
      }
      this.updateMediaSessionPosition(audio.currentTime, audio.duration || track.duration);
    };

    audio.onended = () => {
      if (this.onGuideEnded) this.onGuideEnded();
      this.updateVolumes();
    };

    this.guideAudio = audio;
    this.updateVolumes();

    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});

    if (this.bgKeepAliveAudio && this.bgKeepAliveAudio.paused) {
      this.bgKeepAliveAudio.play().catch(() => {});
    }

    this.updateMediaSessionMetadata();
    this.requestWakeLock();
  }

  public pauseGuidedTrack() {
    if (this.guideAudio) {
      this.guideAudio.pause();
      this.updateVolumes();
    }
    if (!this.activeBgId) {
      this.isPlaying = false;
      if (this.bgKeepAliveAudio) this.bgKeepAliveAudio.pause();
    }
  }

  public resumeGuidedTrack() {
    if (this.guideAudio && this.guideAudio.paused) {
      this.isPlaying = true;
      this.updateVolumes();
      this.guideAudio.play().catch(() => {});
      if (this.bgKeepAliveAudio && this.bgKeepAliveAudio.paused) {
        this.bgKeepAliveAudio.play().catch(() => {});
      }
      this.requestWakeLock();
    }
  }

  public stopGuidedTrack() {
    if (this.guideAudio) {
      this.guideAudio.pause();
      this.guideAudio.ontimeupdate = null;
      this.guideAudio.onended = null;
      this.guideAudio = null;
      this.activeGuideId = null;
    }
    this.updateVolumes();
    if (!this.activeBgId) {
      this.isPlaying = false;
      if (this.bgKeepAliveAudio) this.bgKeepAliveAudio.pause();
      this.releaseWakeLock();
    }
  }

  public stopAll() {
    this.isPlaying = false;
    this.stopSoundscape();
    this.stopGuidedTrack();
    if (this.bgKeepAliveAudio) this.bgKeepAliveAudio.pause();
    this.releaseWakeLock();
  }

  public getActiveSoundscape(): string | null {
    return this.activeBgId;
  }

  public getActiveGuide(): string | null {
    return this.activeGuideId;
  }

  /* ----------------------------------------------------
     iOS / Android Lock Screen & Background Playback
     ---------------------------------------------------- */
  private initMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      if (this.guideAudio) this.resumeGuidedTrack();
      else if (this.activeBgId) this.playSoundscape(this.activeBgId);
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      if (this.guideAudio) this.pauseGuidedTrack();
      else this.stopSoundscape();
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      this.stopAll();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && this.guideAudio) {
        this.guideAudio.currentTime = details.seekTime;
      }
    });
  }

  public updateMediaSessionMetadata() {
    if (!('mediaSession' in navigator)) return;

    let title = 'Звуковой покой';
    let subtitle = 'ZenSpace // Осознанность';

    if (this.activeGuideId) {
      const track = GUIDED_TRACKS.find(t => t.id === this.activeGuideId);
      if (track) {
        title = track.title;
        subtitle = track.subtitle;
      }
    } else if (this.activeBgId) {
      const sound = SOUNDSCAPES.find(s => s.id === this.activeBgId);
      if (sound) {
        title = `Звуковой ландшафт: ${sound.name}`;
      }
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: 'ZenSpace // Il Chu',
      album: subtitle,
      artwork: [
        { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
      ]
    });
  }

  private updateMediaSessionPosition(currentTime: number, duration: number) {
    if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
    if (isNaN(duration) || duration <= 0) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(0, duration),
        playbackRate: 1,
        position: Math.max(0, Math.min(currentTime, duration))
      });
    } catch {}
  }

  /* ----------------------------------------------------
     Screen WakeLock API (Не гасить экран / Ночник)
     ---------------------------------------------------- */
  private async requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      if (!this.wakeLock) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
      }
    } catch {}
  }

  private async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch {}
      this.wakeLock = null;
    }
  }
}

export const audioEngine = new AudioEngine();
