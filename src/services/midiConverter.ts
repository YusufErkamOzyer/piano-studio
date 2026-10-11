import { Midi } from '@tonejs/midi';
import { Piece, Note, RecordingSession } from '../types/piece.ts';

/**
 * Parses an ArrayBuffer containing standard MIDI data into internal Piece format
 */
export async function parseMidiFile(fileBuffer: ArrayBuffer, fileName: string): Promise<Piece> {
  const midi = new Midi(fileBuffer);
  const tempo = midi.header.tempos.length > 0 ? Math.round(midi.header.tempos[0].bpm) : 120;
  const timeSignature: [number, number] = midi.header.timeSignatures.length > 0 
    ? [midi.header.timeSignatures[0].timeSignature[0], midi.header.timeSignatures[0].timeSignature[1]]
    : [4, 4];

  const secondsPerBeat = 60 / tempo;
  const notes: Note[] = [];

  // Sort tracks or assign right/left hand based on pitch or channel/track
  midi.tracks.forEach((track, trackIndex) => {
    track.notes.forEach(midiNote => {
      const startBeat = midiNote.time / secondsPerBeat;
      const durationBeats = midiNote.duration / secondsPerBeat;
      
      // Determine hand: track heuristic or pitch split (Middle C = 60)
      const hand = trackIndex === 1 ? 'left' : (midiNote.midi < 60 ? 'left' : 'right');

      notes.push({
        pitch: midiNote.midi,
        startBeat: Math.round(startBeat * 100) / 100,
        durationBeats: Math.max(0.25, Math.round(durationBeats * 100) / 100),
        velocity: Math.round(midiNote.velocity * 127),
        hand
      });
    });
  });

  // Sort notes chronologically
  notes.sort((a, b) => a.startBeat - b.startBeat || a.pitch - b.pitch);

  const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return {
    id: 'piece-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    title: midi.header.name || cleanTitle,
    composer: 'Bilinmeyen Besteci',
    status: 'approved',
    source: 'midi',
    timeSignature,
    tempoBpm: tempo,
    key: 'C',
    difficulty: notes.length > 200 ? 'advanced' : (notes.length > 80 ? 'intermediate' : 'beginner'),
    notes
  };
}

/**
 * Exports a recording session into a standard MIDI (.mid) file download
 */
export function exportRecordingToMidi(session: RecordingSession, bpm: number = 120): Blob {
  const midi = new Midi();
  midi.header.name = session.title;
  midi.header.setTempo(bpm);
  
  const track = midi.addTrack();
  track.name = 'Piano';

  // Pair noteOn and noteOff events
  const pendingNotes = new Map<number, { startTimeMs: number; velocity: number }>();

  session.events.forEach(evt => {
    if (evt.type === 'noteOn') {
      pendingNotes.set(evt.pitch, {
        startTimeMs: evt.time,
        velocity: (evt.velocity || 80) / 127
      });
    } else if (evt.type === 'noteOff') {
      const pending = pendingNotes.get(evt.pitch);
      if (pending) {
        const timeSec = pending.startTimeMs / 1000;
        const durationSec = Math.max(0.1, (evt.time - pending.startTimeMs) / 1000);
        track.addNote({
          midi: evt.pitch,
          time: timeSec,
          duration: durationSec,
          velocity: pending.velocity
        });
        pendingNotes.delete(evt.pitch);
      }
    }
  });

  // Handle any unclosed notes at session end
  pendingNotes.forEach((pending, pitch) => {
    const timeSec = pending.startTimeMs / 1000;
    const durationSec = Math.max(0.2, (session.durationMs - pending.startTimeMs) / 1000);
    track.addNote({
      midi: pitch,
      time: timeSec,
      duration: durationSec,
      velocity: pending.velocity
    });
  });

  const rawBytes = midi.toArray();
  return new Blob([rawBytes], { type: 'audio/midi' });
}
