// Web Audio API retro 8-bit chiptune synthesizer & custom MP3/MP4 media player
// Supports both sweet retro 8-bit chiptune music and user-uploaded MP3/MP4 files

export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  notes?: { f: number; d: number }[];
  src?: string; // For uploaded MP3 or MP4 audio URL / Base64 / ObjectURL
  isCustom?: boolean;
}

export const INITIAL_DEFAULT_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: '01 世界は恋に落ちている - 8bit Chiptune',
    artist: 'HoneyWorks / Retro Chibi Ver.',
    bpm: 136,
    notes: [
      { f: 523.25, d: 0.25 }, // C5
      { f: 587.33, d: 0.25 }, // D5
      { f: 659.25, d: 0.5 },  // E5
      { f: 783.99, d: 0.5 },  // G5
      { f: 659.25, d: 0.25 }, // E5
      { f: 587.33, d: 0.25 }, // D5
      { f: 523.25, d: 0.5 },  // C5
      { f: 440.00, d: 0.5 },  // A4
      { f: 523.25, d: 0.25 }, // C5
      { f: 587.33, d: 0.25 }, // D5
      { f: 659.25, d: 0.75 }, // E5
      { f: 587.33, d: 0.25 }, // D5
      { f: 523.25, d: 1.0 },  // C5
      { f: 0, d: 0.25 },      // Rest
      { f: 659.25, d: 0.25 }, // E5
      { f: 783.99, d: 0.5 },  // G5
      { f: 880.00, d: 0.5 },  // A5
      { f: 783.99, d: 0.25 }, // G5
      { f: 659.25, d: 0.5 },  // E5
      { f: 523.25, d: 0.5 },  // C5
      { f: 587.33, d: 1.0 },  // D5
    ],
  },
  {
    id: 'track-2',
    title: '02 月と星のラプソディ (Moon & Star Romance)',
    artist: '8-Bit Lofi Couple Box',
    bpm: 110,
    notes: [
      { f: 440.00, d: 0.5 }, // A4
      { f: 523.25, d: 0.5 }, // C5
      { f: 659.25, d: 0.5 }, // E5
      { f: 587.33, d: 0.5 }, // D5
      { f: 523.25, d: 0.5 }, // C5
      { f: 493.88, d: 0.5 }, // B4
      { f: 440.00, d: 1.0 }, // A4
      { f: 0, d: 0.25 },
      { f: 392.00, d: 0.5 }, // G4
      { f: 440.00, d: 0.5 }, // A4
      { f: 523.25, d: 0.75 },// C5
      { f: 587.33, d: 0.5 }, // D5
      { f: 523.25, d: 1.25 },// C5
    ],
  },
  {
    id: 'track-3',
    title: '03 草莓大福的告白曲 (Sweet Strawberry Mochi)',
    artist: 'Retro Pixel Love FM',
    bpm: 124,
    notes: [
      { f: 659.25, d: 0.35 },
      { f: 659.25, d: 0.35 },
      { f: 659.25, d: 0.7 },
      { f: 587.33, d: 0.35 },
      { f: 659.25, d: 0.35 },
      { f: 783.99, d: 0.8 },
      { f: 523.25, d: 0.4 },
      { f: 587.33, d: 0.4 },
      { f: 659.25, d: 0.8 },
      { f: 440.00, d: 0.4 },
      { f: 523.25, d: 1.2 },
    ],
  },
];

const STORAGE_CUSTOM_TRACKS_KEY = 'couple_site_custom_tracks';
const STORAGE_DELETED_DEFAULT_TRACKS_KEY = 'couple_site_deleted_default_tracks';

class RetroChiptunePlayer {
  private ctx: AudioContext | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private isPlaying = false;
  private currentTrackIndex = 0;
  private stepTimeout: number | null = null;
  private volume = 0.35;
  private currentNoteIndex = 0;
  private onTrackChangeCallback: ((index: number) => void) | null = null;
  private onPlayStateChangeCallback: ((playing: boolean) => void) | null = null;
  private onTracksUpdatedCallback: (() => void) | null = null;

  public tracks: Track[] = [];

  constructor() {
    this.initAudioElement();
    this.reloadTracks();
  }

  private initAudioElement() {
    if (typeof window !== 'undefined') {
      this.audioEl = new Audio();
      this.audioEl.volume = this.volume;
      this.audioEl.addEventListener('ended', () => {
        this.nextTrack();
      });
      this.audioEl.addEventListener('error', (e) => {
        console.warn('Audio playback error', e);
      });
    }
  }

  public reloadTracks() {
    if (typeof window === 'undefined') {
      this.tracks = [...INITIAL_DEFAULT_TRACKS];
      return;
    }

    // 1. Get deleted default track IDs
    let deletedDefaults: string[] = [];
    try {
      const savedDeleted = localStorage.getItem(STORAGE_DELETED_DEFAULT_TRACKS_KEY);
      if (savedDeleted) {
        deletedDefaults = JSON.parse(savedDeleted);
      }
    } catch (e) {
      console.warn('Failed to parse deleted default tracks', e);
    }

    // 2. Filter initial default tracks
    const activeDefaults = INITIAL_DEFAULT_TRACKS.filter((t) => !deletedDefaults.includes(t.id));

    // 3. Load custom tracks
    let customTracks: Track[] = [];
    try {
      const savedCustom = localStorage.getItem(STORAGE_CUSTOM_TRACKS_KEY);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) {
          customTracks = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load custom tracks', e);
    }

    this.tracks = [...activeDefaults, ...customTracks];

    // Ensure current index is valid
    if (this.currentTrackIndex >= this.tracks.length) {
      this.currentTrackIndex = Math.max(0, this.tracks.length - 1);
    }

    if (this.onTracksUpdatedCallback) this.onTracksUpdatedCallback();
  }

  private saveCustomTracks() {
    if (typeof window === 'undefined') return;
    try {
      const customTracks = this.tracks.filter((t) => t.isCustom);
      localStorage.setItem(STORAGE_CUSTOM_TRACKS_KEY, JSON.stringify(customTracks));
    } catch (e) {
      console.warn('Failed to save custom tracks', e);
    }
  }

  public addCustomTrack(title: string, artist: string, src: string): number {
    const newTrack: Track = {
      id: 'custom-' + Date.now(),
      title: title || '自訂音樂 (Uploaded Audio)',
      artist: artist || 'MP3/MP4 File',
      src,
      isCustom: true,
    };
    this.tracks.push(newTrack);
    this.saveCustomTracks();
    if (this.onTracksUpdatedCallback) this.onTracksUpdatedCallback();
    const newIndex = this.tracks.length - 1;
    this.setTrack(newIndex);
    this.play();
    return newIndex;
  }

  /**
   * Delete ANY track from the playlist (supports removing both custom and default music!)
   */
  public removeTrack(id: string) {
    const idx = this.tracks.findIndex((t) => t.id === id);
    if (idx === -1) return;

    const trackToRemove = this.tracks[idx];

    // If currently playing the track that will be removed, stop it
    if (this.currentTrackIndex === idx) {
      this.pause();
      this.currentTrackIndex = 0;
    } else if (this.currentTrackIndex > idx) {
      this.currentTrackIndex--;
    }

    // If default track, record its ID in deleted defaults
    if (!trackToRemove.isCustom) {
      try {
        let deletedDefaults: string[] = [];
        const savedDeleted = localStorage.getItem(STORAGE_DELETED_DEFAULT_TRACKS_KEY);
        if (savedDeleted) {
          deletedDefaults = JSON.parse(savedDeleted);
        }
        if (!deletedDefaults.includes(id)) {
          deletedDefaults.push(id);
          localStorage.setItem(STORAGE_DELETED_DEFAULT_TRACKS_KEY, JSON.stringify(deletedDefaults));
        }
      } catch (e) {
        console.warn('Failed to save deleted default track id', e);
      }
    }

    // Remove from in-memory array
    this.tracks.splice(idx, 1);

    // Save custom tracks if it was custom
    if (trackToRemove.isCustom) {
      this.saveCustomTracks();
    }

    if (this.onTracksUpdatedCallback) this.onTracksUpdatedCallback();
    if (this.onTrackChangeCallback) this.onTrackChangeCallback(this.currentTrackIndex);
  }

  /**
   * Restore all default built-in songs
   */
  public restoreDefaultTracks() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_DELETED_DEFAULT_TRACKS_KEY);
      } catch (e) {
        console.warn('Failed to clear deleted default tracks', e);
      }
    }
    this.reloadTracks();
    if (this.onTracksUpdatedCallback) this.onTracksUpdatedCallback();
    if (this.onTrackChangeCallback) this.onTrackChangeCallback(this.currentTrackIndex);
  }

  public onTracksUpdated(cb: () => void) {
    this.onTracksUpdatedCallback = cb;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play() {
    if (this.tracks.length === 0) return;

    const track = this.tracks[this.currentTrackIndex];
    this.isPlaying = true;
    if (this.onPlayStateChangeCallback) this.onPlayStateChangeCallback(true);

    if (track && track.src && this.audioEl) {
      // Stop synth if running
      if (this.stepTimeout) {
        window.clearTimeout(this.stepTimeout);
        this.stepTimeout = null;
      }
      if (this.audioEl.src !== track.src) {
        this.audioEl.src = track.src;
      }
      this.audioEl.volume = this.volume;
      this.audioEl.play().catch((err) => console.warn('Audio play failed', err));
    } else {
      if (this.audioEl) {
        this.audioEl.pause();
      }
      this.initContext();
      this.playNextNote();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    if (this.stepTimeout) {
      window.clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }
    if (this.onPlayStateChangeCallback) this.onPlayStateChangeCallback(false);
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public nextTrack() {
    if (this.tracks.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.currentNoteIndex = 0;
    if (this.onTrackChangeCallback) this.onTrackChangeCallback(this.currentTrackIndex);
    if (this.isPlaying) {
      this.play();
    }
  }

  public prevTrack() {
    if (this.tracks.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.currentNoteIndex = 0;
    if (this.onTrackChangeCallback) this.onTrackChangeCallback(this.currentTrackIndex);
    if (this.isPlaying) {
      this.play();
    }
  }

  public setTrack(index: number) {
    if (index >= 0 && index < this.tracks.length) {
      this.currentTrackIndex = index;
      this.currentNoteIndex = 0;
      if (this.onTrackChangeCallback) this.onTrackChangeCallback(this.currentTrackIndex);
      if (this.isPlaying) {
        this.play();
      }
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
    }
  }

  public getVolume() {
    return this.volume;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getCurrentTrack(): Track | null {
    if (this.tracks.length === 0) return null;
    return this.tracks[this.currentTrackIndex] || this.tracks[0];
  }

  public getCurrentTrackIndex() {
    return this.currentTrackIndex;
  }

  public onTrackChange(cb: (index: number) => void) {
    this.onTrackChangeCallback = cb;
  }

  public onPlayStateChange(cb: (playing: boolean) => void) {
    this.onPlayStateChangeCallback = cb;
  }

  private playTone(freq: number, duration: number) {
    if (!this.ctx || freq <= 0) return;

    try {
      const now = this.ctx.currentTime;
      // Main melody oscillator: square wave (8-bit Nintendo/GameBoy style)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      // Cute slight vibrato for emotional warmth
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 5; // 5Hz vibrato
      lfoGain.gain.value = 4;  // subtle pitch bend
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);

      // Envelope: gentle attack, nice sustain, soft decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.45, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.95);

      // Secondary harmony oscillator: triangle wave (warm bass backing)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(freq / 2, now); // 1 octave lower

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.9);

      // Connect
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
      subOsc.start(now);
      subOsc.stop(now + duration);
    } catch (e) {
      console.warn('Audio playTone error', e);
    }
  }

  private playNextNote() {
    if (!this.isPlaying) return;

    const track = this.tracks[this.currentTrackIndex];
    if (!track || !track.notes) return;

    const note = track.notes[this.currentNoteIndex];
    if (note) {
      if (note.f > 0) {
        this.playTone(note.f, note.d);
      }
      this.currentNoteIndex = (this.currentNoteIndex + 1) % track.notes.length;
      const durationMs = note.d * 1000;
      this.stepTimeout = window.setTimeout(() => {
        this.playNextNote();
      }, durationMs);
    }
  }
}

export const soundPlayer = new RetroChiptunePlayer();
