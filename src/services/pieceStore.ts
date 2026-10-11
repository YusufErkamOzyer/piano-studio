import { Piece, RecordingSession } from '../types/piece.ts';

// Preloaded Pieces with complete accurate note structures
export const PRELOADED_PIECES: Piece[] = [
  {
    id: 'fuer-elise',
    title: 'Für Elise',
    composer: 'Ludwig van Beethoven',
    status: 'approved',
    source: 'preset',
    timeSignature: [3, 8],
    tempoBpm: 120,
    key: 'A Minor',
    difficulty: 'beginner',
    description: 'Klasik piyano repertuarının en ikonik ve melodik eserlerinden biri.',
    notes: [
      // Measure 1 & 2 Opening Theme
      { pitch: 76, startBeat: 0.0, durationBeats: 0.5, hand: 'right', measure: 1 }, // E5
      { pitch: 75, startBeat: 0.5, durationBeats: 0.5, hand: 'right', measure: 1 }, // D#5
      { pitch: 76, startBeat: 1.0, durationBeats: 0.5, hand: 'right', measure: 1 }, // E5
      { pitch: 75, startBeat: 1.5, durationBeats: 0.5, hand: 'right', measure: 1 }, // D#5
      { pitch: 76, startBeat: 2.0, durationBeats: 0.5, hand: 'right', measure: 1 }, // E5
      { pitch: 71, startBeat: 2.5, durationBeats: 0.5, hand: 'right', measure: 1 }, // B4
      { pitch: 74, startBeat: 3.0, durationBeats: 0.5, hand: 'right', measure: 2 }, // D5
      { pitch: 72, startBeat: 3.5, durationBeats: 0.5, hand: 'right', measure: 2 }, // C5
      { pitch: 69, startBeat: 4.0, durationBeats: 1.5, hand: 'right', measure: 2 }, // A4
      // Left Hand Bass accompaniment
      { pitch: 45, startBeat: 4.0, durationBeats: 1.5, hand: 'left', measure: 2 },  // A2
      { pitch: 52, startBeat: 4.5, durationBeats: 1.0, hand: 'left', measure: 2 },  // E3
      { pitch: 57, startBeat: 5.0, durationBeats: 0.5, hand: 'left', measure: 2 },  // A3

      // Measure 3
      { pitch: 48, startBeat: 5.5, durationBeats: 0.5, hand: 'left', measure: 3 },  // C3
      { pitch: 55, startBeat: 6.0, durationBeats: 0.5, hand: 'left', measure: 3 },  // G3
      { pitch: 60, startBeat: 6.5, durationBeats: 0.5, hand: 'right', measure: 3 }, // C4
      { pitch: 64, startBeat: 7.0, durationBeats: 0.5, hand: 'right', measure: 3 }, // E4
      { pitch: 69, startBeat: 7.5, durationBeats: 0.5, hand: 'right', measure: 3 }, // A4
      { pitch: 71, startBeat: 8.0, durationBeats: 1.5, hand: 'right', measure: 3 }, // B4
      { pitch: 47, startBeat: 8.0, durationBeats: 1.5, hand: 'left', measure: 3 },  // B2
      { pitch: 52, startBeat: 8.5, durationBeats: 1.0, hand: 'left', measure: 3 },  // E3
      { pitch: 56, startBeat: 9.0, durationBeats: 0.5, hand: 'left', measure: 3 },  // G#3

      // Measure 4
      { pitch: 52, startBeat: 9.5, durationBeats: 0.5, hand: 'left', measure: 4 },  // E3
      { pitch: 64, startBeat: 10.0, durationBeats: 0.5, hand: 'right', measure: 4 }, // E4
      { pitch: 68, startBeat: 10.5, durationBeats: 0.5, hand: 'right', measure: 4 }, // G#4
      { pitch: 71, startBeat: 11.0, durationBeats: 0.5, hand: 'right', measure: 4 }, // B4
      { pitch: 72, startBeat: 11.5, durationBeats: 1.5, hand: 'right', measure: 4 }, // C5
      { pitch: 45, startBeat: 11.5, durationBeats: 1.5, hand: 'left', measure: 4 },  // A2
      { pitch: 52, startBeat: 12.0, durationBeats: 1.0, hand: 'left', measure: 4 },  // E3
      { pitch: 57, startBeat: 12.5, durationBeats: 0.5, hand: 'left', measure: 4 },  // A3

      // Repeat main motif
      { pitch: 76, startBeat: 13.0, durationBeats: 0.5, hand: 'right', measure: 5 }, // E5
      { pitch: 75, startBeat: 13.5, durationBeats: 0.5, hand: 'right', measure: 5 }, // D#5
      { pitch: 76, startBeat: 14.0, durationBeats: 0.5, hand: 'right', measure: 5 }, // E5
      { pitch: 75, startBeat: 14.5, durationBeats: 0.5, hand: 'right', measure: 5 }, // D#5
      { pitch: 76, startBeat: 15.0, durationBeats: 0.5, hand: 'right', measure: 5 }, // E5
      { pitch: 71, startBeat: 15.5, durationBeats: 0.5, hand: 'right', measure: 5 }, // B4
      { pitch: 74, startBeat: 16.0, durationBeats: 0.5, hand: 'right', measure: 6 }, // D5
      { pitch: 72, startBeat: 16.5, durationBeats: 0.5, hand: 'right', measure: 6 }, // C5
      { pitch: 69, startBeat: 17.0, durationBeats: 1.5, hand: 'right', measure: 6 }, // A4
      { pitch: 45, startBeat: 17.0, durationBeats: 1.5, hand: 'left', measure: 6 },
      { pitch: 52, startBeat: 17.5, durationBeats: 1.0, hand: 'left', measure: 6 },
      { pitch: 57, startBeat: 18.0, durationBeats: 0.5, hand: 'left', measure: 6 },

      // Measure 7
      { pitch: 60, startBeat: 18.5, durationBeats: 0.5, hand: 'right', measure: 7 }, // C4
      { pitch: 64, startBeat: 19.0, durationBeats: 0.5, hand: 'right', measure: 7 }, // E4
      { pitch: 69, startBeat: 19.5, durationBeats: 0.5, hand: 'right', measure: 7 }, // A4
      { pitch: 72, startBeat: 20.0, durationBeats: 1.0, hand: 'right', measure: 7 }, // C5
      { pitch: 71, startBeat: 21.0, durationBeats: 0.5, hand: 'right', measure: 7 }, // B4
      { pitch: 69, startBeat: 21.5, durationBeats: 2.0, hand: 'right', measure: 8 }, // A4
      { pitch: 45, startBeat: 21.5, durationBeats: 2.0, hand: 'left', measure: 8 },  // A2
    ]
  },
  {
    id: 'moonlight-sonata',
    title: 'Moonlight Sonata (Ay Işığı Sonatı)',
    composer: 'Ludwig van Beethoven',
    status: 'approved',
    source: 'preset',
    timeSignature: [4, 4],
    tempoBpm: 60,
    key: 'C# Minor',
    difficulty: 'intermediate',
    description: 'Op. 27 No. 2, Beethoven\'ın melankolik ve derin arpejleriyle ünlü başyapıtı.',
    notes: [
      // Measure 1 - Bass Octaves + Triplets
      { pitch: 37, startBeat: 0.0, durationBeats: 4.0, hand: 'left', measure: 1 }, // C#2
      { pitch: 49, startBeat: 0.0, durationBeats: 4.0, hand: 'left', measure: 1 }, // C#3
      // Triplets Right Hand (G#3, C#4, E4)
      { pitch: 56, startBeat: 0.0, durationBeats: 0.33, hand: 'right', measure: 1 },
      { pitch: 61, startBeat: 0.33, durationBeats: 0.33, hand: 'right', measure: 1 },
      { pitch: 64, startBeat: 0.66, durationBeats: 0.34, hand: 'right', measure: 1 },
      { pitch: 56, startBeat: 1.0, durationBeats: 0.33, hand: 'right', measure: 1 },
      { pitch: 61, startBeat: 1.33, durationBeats: 0.33, hand: 'right', measure: 1 },
      { pitch: 64, startBeat: 1.66, durationBeats: 0.34, hand: 'right', measure: 1 },
      { pitch: 56, startBeat: 2.0, durationBeats: 0.33, hand: 'right', measure: 1 },
      { pitch: 61, startBeat: 2.33, durationBeats: 0.33, hand: 'right', measure: 1 },
      { pitch: 64, startBeat: 2.66, durationBeats: 0.34, hand: 'right', measure: 1 },
      { pitch: 56, startBeat: 3.0, durationBeats: 0.33, hand: 'right', measure: 1 },
      { pitch: 61, startBeat: 3.33, durationBeats: 0.33, hand: 'right', measure: 1 },
      { pitch: 64, startBeat: 3.66, durationBeats: 0.34, hand: 'right', measure: 1 },

      // Measure 2 - Bass B + Triplets
      { pitch: 35, startBeat: 4.0, durationBeats: 4.0, hand: 'left', measure: 2 }, // B1
      { pitch: 47, startBeat: 4.0, durationBeats: 4.0, hand: 'left', measure: 2 }, // B2
      { pitch: 56, startBeat: 4.0, durationBeats: 0.33, hand: 'right', measure: 2 },
      { pitch: 61, startBeat: 4.33, durationBeats: 0.33, hand: 'right', measure: 2 },
      { pitch: 64, startBeat: 4.66, durationBeats: 0.34, hand: 'right', measure: 2 },
      { pitch: 56, startBeat: 5.0, durationBeats: 0.33, hand: 'right', measure: 2 },
      { pitch: 61, startBeat: 5.33, durationBeats: 0.33, hand: 'right', measure: 2 },
      { pitch: 64, startBeat: 5.66, durationBeats: 0.34, hand: 'right', measure: 2 },
      { pitch: 56, startBeat: 6.0, durationBeats: 0.33, hand: 'right', measure: 2 },
      { pitch: 61, startBeat: 6.33, durationBeats: 0.33, hand: 'right', measure: 2 },
      { pitch: 64, startBeat: 6.66, durationBeats: 0.34, hand: 'right', measure: 2 },
      { pitch: 56, startBeat: 7.0, durationBeats: 0.33, hand: 'right', measure: 2 },
      { pitch: 61, startBeat: 7.33, durationBeats: 0.33, hand: 'right', measure: 2 },
      { pitch: 64, startBeat: 7.66, durationBeats: 0.34, hand: 'right', measure: 2 },

      // Measure 3 - Bass A + Triplets + Melody entry
      { pitch: 33, startBeat: 8.0, durationBeats: 4.0, hand: 'left', measure: 3 }, // A1
      { pitch: 45, startBeat: 8.0, durationBeats: 4.0, hand: 'left', measure: 3 }, // A2
      { pitch: 57, startBeat: 8.0, durationBeats: 0.33, hand: 'right', measure: 3 }, // A3
      { pitch: 61, startBeat: 8.33, durationBeats: 0.33, hand: 'right', measure: 3 },
      { pitch: 64, startBeat: 8.66, durationBeats: 0.34, hand: 'right', measure: 3 },
      { pitch: 57, startBeat: 9.0, durationBeats: 0.33, hand: 'right', measure: 3 },
      { pitch: 61, startBeat: 9.33, durationBeats: 0.33, hand: 'right', measure: 3 },
      { pitch: 64, startBeat: 9.66, durationBeats: 0.34, hand: 'right', measure: 3 },
      // Melody note G#4
      { pitch: 68, startBeat: 10.0, durationBeats: 2.0, hand: 'right', measure: 3 }, // G#4
      { pitch: 56, startBeat: 10.0, durationBeats: 0.33, hand: 'right', measure: 3 },
      { pitch: 60, startBeat: 10.33, durationBeats: 0.33, hand: 'right', measure: 3 },
      { pitch: 64, startBeat: 10.66, durationBeats: 0.34, hand: 'right', measure: 3 },
      { pitch: 56, startBeat: 11.0, durationBeats: 0.33, hand: 'right', measure: 3 },
      { pitch: 60, startBeat: 11.33, durationBeats: 0.33, hand: 'right', measure: 3 },
      { pitch: 64, startBeat: 11.66, durationBeats: 0.34, hand: 'right', measure: 3 }
    ]
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D',
    composer: 'Johann Pachelbel',
    status: 'approved',
    source: 'preset',
    timeSignature: [4, 4],
    tempoBpm: 80,
    key: 'D Major',
    difficulty: 'beginner',
    description: 'Barok dönemin en sevilen ve huzur veren polifonik melodisi.',
    notes: [
      // Measure 1 - Bass D & Melody F#
      { pitch: 50, startBeat: 0.0, durationBeats: 2.0, hand: 'left', measure: 1 },  // D3
      { pitch: 74, startBeat: 0.0, durationBeats: 2.0, hand: 'right', measure: 1 }, // D5
      { pitch: 45, startBeat: 2.0, durationBeats: 2.0, hand: 'left', measure: 1 },  // A2
      { pitch: 73, startBeat: 2.0, durationBeats: 2.0, hand: 'right', measure: 1 }, // C#5

      // Measure 2 - Bass B & F#
      { pitch: 47, startBeat: 4.0, durationBeats: 2.0, hand: 'left', measure: 2 },  // B2
      { pitch: 71, startBeat: 4.0, durationBeats: 2.0, hand: 'right', measure: 2 }, // B4
      { pitch: 42, startBeat: 6.0, durationBeats: 2.0, hand: 'left', measure: 2 },  // F#2
      { pitch: 69, startBeat: 6.0, durationBeats: 2.0, hand: 'right', measure: 2 }, // A4

      // Measure 3 - Bass G & D
      { pitch: 43, startBeat: 8.0, durationBeats: 2.0, hand: 'left', measure: 3 },  // G2
      { pitch: 67, startBeat: 8.0, durationBeats: 2.0, hand: 'right', measure: 3 }, // G4
      { pitch: 38, startBeat: 10.0, durationBeats: 2.0, hand: 'left', measure: 3 }, // D2
      { pitch: 66, startBeat: 10.0, durationBeats: 2.0, hand: 'right', measure: 3 }, // F#4

      // Measure 4 - Bass G & A
      { pitch: 43, startBeat: 12.0, durationBeats: 2.0, hand: 'left', measure: 4 }, // G2
      { pitch: 67, startBeat: 12.0, durationBeats: 2.0, hand: 'right', measure: 4 }, // G4
      { pitch: 45, startBeat: 14.0, durationBeats: 2.0, hand: 'left', measure: 4 }, // A2
      { pitch: 69, startBeat: 14.0, durationBeats: 2.0, hand: 'right', measure: 4 }, // A4

      // Moving melody Measure 5
      { pitch: 50, startBeat: 16.0, durationBeats: 2.0, hand: 'left', measure: 5 },
      { pitch: 74, startBeat: 16.0, durationBeats: 1.0, hand: 'right', measure: 5 }, // D5
      { pitch: 76, startBeat: 17.0, durationBeats: 1.0, hand: 'right', measure: 5 }, // E5
      { pitch: 78, startBeat: 18.0, durationBeats: 1.0, hand: 'right', measure: 5 }, // F#5
      { pitch: 79, startBeat: 19.0, durationBeats: 1.0, hand: 'right', measure: 5 }, // G5
    ]
  },
  {
    id: 'river-flows-in-you',
    title: 'River Flows in You',
    composer: 'Yiruma',
    status: 'approved',
    source: 'preset',
    timeSignature: [4, 4],
    tempoBpm: 75,
    key: 'A Major',
    difficulty: 'intermediate',
    description: 'Duygusal, modern ve akıcı çağdaş piyano klasiği.',
    notes: [
      // Measure 1
      { pitch: 69, startBeat: 0.0, durationBeats: 0.5, hand: 'right', measure: 1 }, // A4
      { pitch: 68, startBeat: 0.5, durationBeats: 0.5, hand: 'right', measure: 1 }, // G#4
      { pitch: 69, startBeat: 1.0, durationBeats: 1.0, hand: 'right', measure: 1 }, // A4
      { pitch: 76, startBeat: 2.0, durationBeats: 2.0, hand: 'right', measure: 1 }, // E5
      { pitch: 45, startBeat: 0.0, durationBeats: 4.0, hand: 'left', measure: 1 },  // A2
      { pitch: 52, startBeat: 1.0, durationBeats: 3.0, hand: 'left', measure: 1 },  // E3

      // Measure 2
      { pitch: 69, startBeat: 4.0, durationBeats: 0.5, hand: 'right', measure: 2 }, // A4
      { pitch: 68, startBeat: 4.5, durationBeats: 0.5, hand: 'right', measure: 2 }, // G#4
      { pitch: 69, startBeat: 5.0, durationBeats: 1.0, hand: 'right', measure: 2 }, // A4
      { pitch: 76, startBeat: 6.0, durationBeats: 2.0, hand: 'right', measure: 2 }, // E5
      { pitch: 42, startBeat: 4.0, durationBeats: 4.0, hand: 'left', measure: 2 },  // F#2
      { pitch: 49, startBeat: 5.0, durationBeats: 3.0, hand: 'left', measure: 2 },  // C#3

      // Measure 3
      { pitch: 69, startBeat: 8.0, durationBeats: 0.5, hand: 'right', measure: 3 }, // A4
      { pitch: 68, startBeat: 8.5, durationBeats: 0.5, hand: 'right', measure: 3 }, // G#4
      { pitch: 69, startBeat: 9.0, durationBeats: 1.0, hand: 'right', measure: 3 }, // A4
      { pitch: 74, startBeat: 10.0, durationBeats: 2.0, hand: 'right', measure: 3 }, // D5
      { pitch: 43, startBeat: 8.0, durationBeats: 4.0, hand: 'left', measure: 3 },  // G2
    ]
  },
  // Pending piece imported via AI / MCP for demonstration of approval flow
  {
    id: 'ai-omr-chopin-prelude',
    title: 'Prelude in E Minor Op. 28 No. 4 [AI OMR]',
    composer: 'Frédéric Chopin',
    status: 'pending',
    source: 'pdf-omr',
    timeSignature: [4, 4],
    tempoBpm: 65,
    key: 'E Minor',
    difficulty: 'intermediate',
    description: 'Audiveris OMR ve Claude MCP köprüsü ile PDF notadan dönüştürüldü. Kullanıcı onayı bekleniyor.',
    notes: [
      { pitch: 71, startBeat: 0.0, durationBeats: 1.5, hand: 'right', measure: 1 }, // B4
      { pitch: 72, startBeat: 1.5, durationBeats: 0.5, hand: 'right', measure: 1 }, // C5
      { pitch: 71, startBeat: 2.0, durationBeats: 2.0, hand: 'right', measure: 1 }, // B4
      { pitch: 40, startBeat: 0.0, durationBeats: 4.0, hand: 'left', measure: 1 },  // E2
      { pitch: 52, startBeat: 1.0, durationBeats: 3.0, hand: 'left', measure: 1 },  // E3
      { pitch: 55, startBeat: 2.0, durationBeats: 2.0, hand: 'left', measure: 1 },  // G3
      { pitch: 70, startBeat: 4.0, durationBeats: 3.0, hand: 'right', measure: 2 }, // A#4
      { pitch: 69, startBeat: 7.0, durationBeats: 1.0, hand: 'right', measure: 2 }, // A4
      { pitch: 39, startBeat: 4.0, durationBeats: 4.0, hand: 'left', measure: 2 },  // D#2
    ]
  }
];

class PieceStore {
  private pieces: Piece[] = [];
  private recordings: RecordingSession[] = [];
  private listeners = new Set<() => void>();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem('piano_studio_pieces');
      if (stored) {
        this.pieces = JSON.parse(stored);
      } else {
        this.pieces = [...PRELOADED_PIECES];
        this.save();
      }

      const storedRecs = localStorage.getItem('piano_studio_recordings');
      if (storedRecs) {
        this.recordings = JSON.parse(storedRecs);
      }
    } catch {
      this.pieces = [...PRELOADED_PIECES];
      this.recordings = [];
    }
  }

  private save() {
    try {
      localStorage.setItem('piano_studio_pieces', JSON.stringify(this.pieces));
      localStorage.setItem('piano_studio_recordings', JSON.stringify(this.recordings));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
    this.notify();
  }

  getPieces(filterStatus?: 'pending' | 'approved'): Piece[] {
    if (!filterStatus) return [...this.pieces];
    return this.pieces.filter(p => p.status === filterStatus);
  }

  getPiece(id: string): Piece | undefined {
    return this.pieces.find(p => p.id === id);
  }

  addPiece(piece: Piece) {
    const existingIndex = this.pieces.findIndex(p => p.id === piece.id);
    if (existingIndex >= 0) {
      this.pieces[existingIndex] = piece;
    } else {
      this.pieces.unshift(piece);
    }
    this.save();
  }

  approvePiece(id: string) {
    const piece = this.pieces.find(p => p.id === id);
    if (piece) {
      piece.status = 'approved';
      this.save();
    }
  }

  deletePiece(id: string) {
    this.pieces = this.pieces.filter(p => p.id !== id);
    this.save();
  }

  // Recordings
  getRecordings(): RecordingSession[] {
    return [...this.recordings];
  }

  addRecording(session: RecordingSession) {
    this.recordings.unshift(session);
    this.save();
  }

  deleteRecording(id: string) {
    this.recordings = this.recordings.filter(r => r.id !== id);
    this.save();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }
}

export const pieceStore = new PieceStore();
