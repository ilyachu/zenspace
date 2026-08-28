/**
 * ZenSpace Professional Audio Engine
 * Bundled with 100% authentic studio audio assets:
 * - Real Studio Human Russian Guided Meditations & Breathing Practices (UCLA MARC)
 * - Hi-Fi Nature Soundscapes
 * - Authentic Tibetan Singing Bowl
 * - Independent Dual Volume Controls (Voice vs Ambience)
 * - Auto-Ducking
 * - iOS / Android MediaSession Lock Screen & Background Playback
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

  private bgElements: Map<string, HTMLAudioElement> = new Map();
  private guideAudio: HTMLAudioElement | null = null;
  private bowlAudio: HTMLAudioElement;

  private wakeLock: any = null;
  private onGuideTimeUpdate?: (currentTime: number, duration: number) => void;
  private onGuideEnded?: () => void;

  constructor() {
    // Pre-initialize soundscape players
    SOUNDSCAPES.forEach(s => {
      const a = new Audio(s.url);
      a.loop = true;
      a.preload = 'auto';
      a.volume = this.calculateAmbientVol();
      this.bgElements.set(s.id, a);
    });

    // Tibetan Singing Bowl
    this.bowlAudio = new Audio('/audio/soundscapes/bowl.mp3');
    this.bowlAudio.preload = 'auto';

    this.initMediaSessionHandlers();
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

  public getMasterVolume(): number {
    return this.masterVolume;
  }
  public getVoiceVolume(): number {
    return this.voiceVolume;
  }
  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public playBowl() {
    try {
      this.bowlAudio.currentTime = 0;
      this.bowlAudio.volume = this.masterVolume;
      const p = this.bowlAudio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
      // Ignored
    }
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

    this.activeBgId = id;
    target.volume = this.calculateAmbientVol();

    const p = target.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});

    this.updateMediaSessionMetadata();
    this.requestWakeLock();
  }

  public stopSoundscape() {
    this.activeBgId = null;
    this.bgElements.forEach(audio => {
      audio.pause();
    });
    if (!this.guideAudio) {
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

    this.activeGuideId = trackId;
    this.onGuideTimeUpdate = onTimeUpdate;
    this.onGuideEnded = onEnded;

    const audio = new Audio(track.url);
    audio.volume = this.calculateVoiceVol();
    audio.preload = 'auto';

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

    this.updateMediaSessionMetadata();
    this.requestWakeLock();
  }

  public pauseGuidedTrack() {
    if (this.guideAudio) {
      this.guideAudio.pause();
      this.updateVolumes();
    }
  }

  public resumeGuidedTrack() {
    if (this.guideAudio && this.guideAudio.paused) {
      this.updateVolumes();
      this.guideAudio.play().catch(() => {});
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
      this.releaseWakeLock();
    }
  }

  public stopAll() {
    this.stopSoundscape();
    this.stopGuidedTrack();
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

  private updateMediaSessionMetadata() {
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
    } catch {
      // Ignored if state update is out of range
    }
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
    } catch {
      // Browser permission / battery saver denied
    }
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
