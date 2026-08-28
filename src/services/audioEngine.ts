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

export interface GuidedTrack {
  id: string;
  title: string;
  subtitle: string;
  duration: number; // in seconds
  url: string;
  category: 'core' | 'relaxation' | 'deep';
}

export interface Soundscape {
  id: string;
  name: string;
  icon: string;
  url: string;
}

export const GUIDED_TRACKS: GuidedTrack[] = [
  {
    id: 'ru-breathing',
    title: 'Осознанное дыхание',
    subtitle: 'Живая студийная аудио-практика дыхания',
    duration: 473, // 7:50
    url: '/audio/meditations/ru-breathing.mp3',
    category: 'core'
  },
  {
    id: 'ru-bodyscan',
    title: 'Сканирование тела',
    subtitle: 'Пошаговое мышечное расслабление',
    duration: 238, // 4:00
    url: '/audio/meditations/ru-bodyscan.mp3',
    category: 'relaxation'
  },
  {
    id: 'ru-breathsoundbody',
    title: 'Дыхание, звуки и тело',
    subtitle: 'Расширение осознанности и покой',
    duration: 623, // 10:20
    url: '/audio/meditations/ru-breathsoundbody.mp3',
    category: 'core'
  },
  {
    id: 'ru-lovingkindness',
    title: 'Метта (Доброжелательность)',
    subtitle: 'Снятие тревожности и внутреннее тепло',
    duration: 776, // 13:00
    url: '/audio/meditations/ru-lovingkindness.mp3',
    category: 'relaxation'
  },
  {
    id: 'ru-complete',
    title: 'Полная сессия медитации',
    subtitle: 'Глубокое погружение и перезагрузка ума',
    duration: 1245, // 20:45
    url: '/audio/meditations/ru-complete.mp3',
    category: 'deep'
  }
];

export const SOUNDSCAPES: Soundscape[] = [
  {
    id: 'fire',
    name: 'Костёр',
    icon: '🔥',
    url: '/audio/soundscapes/fire.mp3'
  },
  {
    id: 'night',
    name: 'Летняя ночь',
    icon: '🦗',
    url: '/audio/soundscapes/night.mp3'
  },
  {
    id: 'rain',
    name: 'Мягкий дождь',
    icon: '🌧️',
    url: '/audio/soundscapes/rain.mp3'
  },
  {
    id: 'ocean',
    name: 'Океан',
    icon: '🌊',
    url: '/audio/soundscapes/ocean.mp3'
  },
  {
    id: 'wind',
    name: 'Лесной ветер',
    icon: '🍃',
    url: '/audio/soundscapes/wind.mp3'
  }
];

class AudioEngine {
  private masterVolume: number = 0.85;
  private voiceVolume: number = 0.9;
  private ambientVolume: number = 0.5;

  private activeBgId: string | null = null;
  private activeGuideId: string | null = null;
  private isPlaying: boolean = false;

  private bgElements: Map<string, HTMLAudioElement> = new Map();
  private guideAudio: HTMLAudioElement | null = null;
  private bowlAudio: HTMLAudioElement;

  // iOS Lock Screen Background Audio Bridge
  private bgKeepAliveAudio: HTMLAudioElement | null = null;
  private wakeLock: any = null;

  private onGuideTimeUpdate?: (currentTime: number, duration: number) => void;
  private onGuideEnded?: () => void;

  constructor() {
    // 1. Pre-initialize soundscape players
    SOUNDSCAPES.forEach(s => {
      const a = new Audio(s.url);
      a.loop = true;
      a.preload = 'auto';
      (a as any).playsInline = true;
      a.setAttribute('playsinline', 'true');
      a.setAttribute('webkit-playsinline', 'true');
      a.volume = this.calculateAmbientVol();
      this.bgElements.set(s.id, a);
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

    const voiceVol = this.calculateVoiceVol();
    if (this.guideAudio) {
      this.guideAudio.volume = voiceVol;
    }

    this.bowlAudio.volume = this.masterVolume;
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

    // Stop other soundscapes
    this.bgElements.forEach((audio, k) => {
      if (k !== id) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const target = this.bgElements.get(id);
    if (!target) return;

    this.isPlaying = true;
    this.activeBgId = id;
    target.volume = this.calculateAmbientVol();

    const p = target.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});

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
    if (!this.guideAudio) {
      this.isPlaying = false;
      if (this.bgKeepAliveAudio) this.bgKeepAliveAudio.pause();
      this.releaseWakeLock();
    }
  }

  public playGuidedTrack(
    trackId: string,
    onTimeUpdate?: (current: number, dur: number) => void,
    onEnded?: () => void
  ) {
    this.stopGuidedTrack();

    const track = GUIDED_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    this.isPlaying = true;
    this.activeGuideId = trackId;
    this.onGuideTimeUpdate = onTimeUpdate;
    this.onGuideEnded = onEnded;

    const audio = new Audio(track.url);
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
