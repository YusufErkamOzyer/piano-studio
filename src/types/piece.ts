export type Hand = 'right' | 'left';
export type PieceStatus = 'pending' | 'approved';
export type PieceSource = 'midi' | 'musicxml' | 'pdf-omr' | 'ai' | 'preset';

export interface Note {
  pitch: number;          // MIDI pitch (21 - 108)
  startBeat: number;      // Beat offset in the piece (e.g. 0, 1.5, 4.0)
  durationBeats: number;  // Duration in beats
  hand?: Hand;
  measure?: number;
  velocity?: number;      // 0 - 127 (defaults to 90)
}

export interface Piece {
  id: string;
  title: string;
  composer: string;
  status: PieceStatus;
  source: PieceSource;
  timeSignature: [number, number]; // e.g. [4, 4] or [3, 4]
  tempoBpm: number;
  key: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
  notes: Note[];
}

export interface RecordedEvent {
  type: 'noteOn' | 'noteOff';
  pitch: number;
  time: number;          // milliseconds from recording start
  velocity: number;
}

export interface RecordingSession {
  id: string;
  title: string;
  createdAt: string;
  durationMs: number;
  events: RecordedEvent[];
  pieceId?: string;
  accuracyScore?: number; // 0 - 100%
  totalNotesPlayed?: number;
  notesCorrect?: number;
}

export interface KeyMappingConfig {
  [code: string]: number; // KeyboardEvent.code -> MIDI pitch
}

export interface PracticeStats {
  notesHit: number;
  notesMissed: number;
  currentStreak: number;
  maxStreak: number;
  accuracy: number;
}

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalMeasures: number;
  totalNotes: number;
  pitchRange: [number, number];
}
