import * as Tone from 'tone';
import { midiToNoteName } from './keyMapping.ts';
import { RecordedEvent, RecordingSession } from '../types/piece.ts';

class AudioEngine {
  private isInitialized = false;
  private sampler: Tone.Sampler | null = null;
  private polySynth: Tone.PolySynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private masterGain: Tone.Gain | null = null;

  private isSustainActive = false;
  private activeNotes = new Map<number, { synthId?: string; isHeldByKeyboard: boolean; velocity: number }>();
  private sustainedNotes = new Set<number>();

  // Recording state
  private isRecording = false;
  private recordingStartTime = 0;
  private currentRecordedEvents: RecordedEvent[] = [];

  // Listeners for active notes update (UI highlight)
  private activeNoteListeners = new Set<(notes: Set<number>) => void>();
  private currentlyPlayingNotes = new Set<number>();

  // Audio latency metric (ms)
  private measuredLatencyMs: number = 12;

  async init() {
    if (this.isInitialized) return;

    await Tone.start();
    Tone.getContext().lookAhead = 0.005; // Ultra low latency for interactive piano

    this.masterGain = new Tone.Gain(0.85).toDestination();

    this.reverb = new Tone.Reverb({
      decay: 2.5,
      preDelay: 0.01,
      wet: 0.25
    });
    await this.reverb.generate();
    this.reverb.connect(this.masterGain);

    // High quality piano-modeled PolySynth for instant zero-latency feedback
    this.polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle16' // rich acoustic harmonics
      },
      envelope: {
        attack: 0.003,
        decay: 2.5,
        sustain: 0.0, // Acoustic piano naturally decays to silence
        release: 0.6
      },
      volume: -4
    });
    this.polySynth.connect(this.masterGain);
    this.polySynth.connect(this.reverb);

    // Try loading realistic acoustic piano samples in background
    try {
      this.sampler = new Tone.Sampler({
        urls: {
          A0: 'A0.mp3',
          C1: 'C1.mp3',
          'D#1': 'Ds1.mp3',
          'F#1': 'Fs1.mp3',
          A1: 'A1.mp3',
          C2: 'C2.mp3',
          'D#2': 'Ds2.mp3',
          'F#2': 'Fs2.mp3',
          A2: 'A2.mp3',
          C3: 'C3.mp3',
          'D#3': 'Ds3.mp3',
          'F#3': 'Fs3.mp3',
          A3: 'A3.mp3',
          C4: 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          A4: 'A4.mp3',
          C5: 'C5.mp3',
          'D#5': 'Ds5.mp3',
          'F#5': 'Fs5.mp3',
          A5: 'A5.mp3',
          C6: 'C6.mp3',
          'D#6': 'Ds6.mp3',
          'F#6': 'Fs6.mp3',
          A6: 'A6.mp3',
          C7: 'C7.mp3',
          'D#7': 'Ds7.mp3',
          'F#7': 'Fs7.mp3',
          A7: 'A7.mp3',
          C8: 'C8.mp3'
        },
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
        onload: () => {
          console.log('Salamander Grand Piano samples loaded successfully');
        }
      });
      this.sampler.connect(this.masterGain);
      this.sampler.connect(this.reverb);
    } catch (e) {
      console.warn('Sampler init fallback to PolySynth', e);
    }

    this.isInitialized = true;
    this.measureLatency();
  }

  playNote(pitch: number, velocity: number = 0.8, isFromUser: boolean = true) {
    if (!this.isInitialized) {
      this.init().then(() => this.playNote(pitch, velocity, isFromUser));
      return;
    }

    const noteName = midiToNoteName(pitch);
    const clampedVelocity = Math.max(0.1, Math.min(1.0, velocity));

    if (this.sampler && this.sampler.loaded) {
      this.sampler.triggerAttack(noteName, Tone.now(), clampedVelocity);
    } else if (this.polySynth) {
      this.polySynth.triggerAttack(noteName, Tone.now(), clampedVelocity);
    }

    this.activeNotes.set(pitch, { isHeldByKeyboard: true, velocity: clampedVelocity });
    this.currentlyPlayingNotes.add(pitch);
    this.notifyActiveNotes();

    if (this.isRecording && isFromUser) {
      const elapsed = Date.now() - this.recordingStartTime;
      this.currentRecordedEvents.push({
        type: 'noteOn',
        pitch,
        time: elapsed,
        velocity: Math.round(clampedVelocity * 127)
      });
    }
  }

  playNoteWithDuration(pitch: number, durationSec: number = 0.5, velocity: number = 0.8, isFromUser: boolean = false) {
    if (!this.isInitialized) {
      this.init().then(() => this.playNoteWithDuration(pitch, durationSec, velocity, isFromUser));
      return;
    }

    const noteName = midiToNoteName(pitch);
    const clampedVelocity = Math.max(0.1, Math.min(1.0, velocity));
    const now = Tone.now();

    if (this.sampler && this.sampler.loaded) {
      try {
        this.sampler.triggerAttackRelease(noteName, durationSec, now, clampedVelocity);
      } catch (e) {
        console.warn('Sampler triggerAttackRelease error', e);
      }
    } else if (this.polySynth) {
      try {
        this.polySynth.triggerAttackRelease(noteName, durationSec, now, clampedVelocity);
      } catch (e) {
        console.warn('PolySynth triggerAttackRelease error', e);
      }
    }

    this.currentlyPlayingNotes.add(pitch);
    this.notifyActiveNotes();

    setTimeout(() => {
      this.currentlyPlayingNotes.delete(pitch);
      this.notifyActiveNotes();
    }, Math.max(100, durationSec * 1000));

    if (this.isRecording && isFromUser) {
      const elapsed = Date.now() - this.recordingStartTime;
      this.currentRecordedEvents.push({
        type: 'noteOn',
        pitch,
        time: elapsed,
        velocity: Math.round(clampedVelocity * 127)
      });
      setTimeout(() => {
        if (this.isRecording) {
          this.currentRecordedEvents.push({
            type: 'noteOff',
            pitch,
            time: elapsed + durationSec * 1000,
            velocity: 0
          });
        }
      }, durationSec * 1000);
    }
  }

  stopAllNotes() {
    if (this.sampler) {
      try {
        this.sampler.releaseAll(Tone.now());
      } catch {}
    }
    if (this.polySynth) {
      try {
        this.polySynth.releaseAll(Tone.now());
      } catch {}
    }
    this.activeNotes.clear();
    this.currentlyPlayingNotes.clear();
    this.sustainedNotes.clear();
    this.notifyActiveNotes();
  }

  stopNote(pitch: number, isFromUser: boolean = true) {
    if (!this.isInitialized) return;

    const noteName = midiToNoteName(pitch);

    if (this.isSustainActive) {
      // Keep note ringing under sustain
      this.sustainedNotes.add(pitch);
      const noteData = this.activeNotes.get(pitch);
      if (noteData) {
        noteData.isHeldByKeyboard = false;
      }
    } else {
      // Normal release
      if (this.sampler && this.sampler.loaded) {
        this.sampler.triggerRelease(noteName, Tone.now());
      } else if (this.polySynth) {
        this.polySynth.triggerRelease(noteName, Tone.now());
      }
      this.activeNotes.delete(pitch);
      this.currentlyPlayingNotes.delete(pitch);
      this.notifyActiveNotes();
    }

    if (this.isRecording && isFromUser) {
      const elapsed = Date.now() - this.recordingStartTime;
      this.currentRecordedEvents.push({
        type: 'noteOff',
        pitch,
        time: elapsed,
        velocity: 0
      });
    }
  }

  setSustain(active: boolean) {
    this.isSustainActive = active;

    if (!active) {
      // Release all sustained notes that are no longer physically held
      this.sustainedNotes.forEach(pitch => {
        const noteData = this.activeNotes.get(pitch);
        if (!noteData || !noteData.isHeldByKeyboard) {
          const noteName = midiToNoteName(pitch);
          if (this.sampler && this.sampler.loaded) {
            this.sampler.triggerRelease(noteName, Tone.now());
          } else if (this.polySynth) {
            this.polySynth.triggerRelease(noteName, Tone.now());
          }
          this.activeNotes.delete(pitch);
          this.currentlyPlayingNotes.delete(pitch);
        }
      });
      this.sustainedNotes.clear();
      this.notifyActiveNotes();
    }
  }

  getSustain(): boolean {
    return this.isSustainActive;
  }

  setVolume(volume: number) { // 0.0 - 1.0
    if (this.masterGain) {
      this.masterGain.gain.rampTo(volume, 0.05);
    }
  }

  setReverbWet(amount: number) { // 0.0 - 1.0
    if (this.reverb) {
      this.reverb.wet.rampTo(amount, 0.05);
    }
  }

  // Latency calculation
  measureLatency(): number {
    try {
      const ctx = Tone.getContext().rawContext as AudioContext;
      const base = ctx.baseLatency || 0.005;
      const output = ctx.outputLatency || 0.007;
      const total = Math.round((base + output) * 1000);
      this.measuredLatencyMs = Math.max(8, total);
    } catch {
      this.measuredLatencyMs = 12;
    }
    return this.measuredLatencyMs;
  }

  getLatencyMs(): number {
    return this.measuredLatencyMs;
  }

  // Recording Controls
  startRecording() {
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.currentRecordedEvents = [];
  }

  stopRecording(title: string = 'Kayıt'): RecordingSession | null {
    if (!this.isRecording) return null;
    this.isRecording = false;
    const durationMs = Date.now() - this.recordingStartTime;

    const session: RecordingSession = {
      id: 'rec-' + Date.now(),
      title,
      createdAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      durationMs,
      events: [...this.currentRecordedEvents],
      totalNotesPlayed: this.currentRecordedEvents.filter(e => e.type === 'noteOn').length
    };
    return session;
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  subscribeActiveNotes(listener: (notes: Set<number>) => void) {
    this.activeNoteListeners.add(listener);
    listener(new Set(this.currentlyPlayingNotes));
    return () => {
      this.activeNoteListeners.delete(listener);
    };
  }

  private notifyActiveNotes() {
    const copy = new Set(this.currentlyPlayingNotes);
    this.activeNoteListeners.forEach(listener => listener(copy));
  }
}

export const audioEngine = new AudioEngine();
