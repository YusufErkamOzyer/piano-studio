import { KeyMappingConfig } from '../types/piece.ts';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export function midiToNoteName(midi: number): string {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function isBlackKey(midi: number): boolean {
  const noteIndex = midi % 12;
  return [1, 3, 6, 8, 10].includes(noteIndex);
}

export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60;
  const note = match[1];
  const octave = parseInt(match[2], 10);
  const noteIndex = NOTE_NAMES.indexOf(note as any);
  if (noteIndex === -1) return 60;
  return (octave + 1) * 12 + noteIndex;
}

// Relative semitone offsets from root C of current octave:
// Middle C (C4) = offset 0 (MIDI 60)
export const KEY_CODE_OFFSET_MAP: Record<string, number> = {
  // Lower White Keys (Octave 4)
  'KeyA': 0,    // C4
  'KeyS': 2,    // D4
  'KeyD': 4,    // E4
  'KeyF': 5,    // F4
  'KeyG': 7,    // G4
  'KeyH': 9,    // A4
  'KeyJ': 11,   // B4

  // Upper White Keys (Octave 5)
  'KeyK': 12,   // C5
  'KeyL': 14,   // D5
  'Semicolon': 16, // E5
  'Quote': 17,  // F5

  // Black Keys (Accidentals)
  'KeyW': 1,    // C#4
  'KeyE': 3,    // D#4
  'KeyT': 6,    // F#4
  'KeyY': 8,    // G#4
  'KeyU': 10,   // A#4

  // Upper Black Keys
  'KeyO': 13,   // C#5
  'KeyP': 15,   // D#5
  'BracketLeft': 18, // F#5
};

export const DISPLAY_KEY_LABELS: Record<string, string> = {
  'KeyA': 'A',
  'KeyW': 'W',
  'KeyS': 'S',
  'KeyE': 'E',
  'KeyD': 'D',
  'KeyF': 'F',
  'KeyT': 'T',
  'KeyG': 'G',
  'KeyY': 'Y',
  'KeyH': 'H',
  'KeyU': 'U',
  'KeyJ': 'J',
  'KeyK': 'K',
  'KeyO': 'O',
  'KeyL': 'L',
  'KeyP': 'P',
  'Semicolon': ';',
  'Quote': "'",
  'BracketLeft': '[',
};

/**
 * Returns MIDI pitch for a key code given current octave shift (-2 to +2, base 4).
 * Base octave 4: middle C = 60.
 */
export function getMidiFromKeyCode(code: string, octaveOffset: number = 0): number | null {
  if (code in KEY_CODE_OFFSET_MAP) {
    const baseC = (4 + octaveOffset + 1) * 12; // Middle C = (4+1)*12 = 60
    const pitch = baseC + KEY_CODE_OFFSET_MAP[code];
    if (pitch >= 21 && pitch <= 108) {
      return pitch;
    }
  }
  return null;
}

/**
 * Returns keyboard shortcut string to display on top of a piano key
 */
export function getKeyLabelForPitch(pitch: number, octaveOffset: number = 0): string | null {
  const baseC = (4 + octaveOffset + 1) * 12;
  const offset = pitch - baseC;

  for (const [code, keyOffset] of Object.entries(KEY_CODE_OFFSET_MAP)) {
    if (keyOffset === offset) {
      return DISPLAY_KEY_LABELS[code] || code;
    }
  }
  return null;
}
