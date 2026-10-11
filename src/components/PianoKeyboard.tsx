import React, { useCallback } from 'react';
import { isBlackKey, midiToNoteName, getKeyLabelForPitch } from '../services/keyMapping.ts';

interface PianoKeyboardProps {
  activeNotes: Set<number>;
  userNotes?: Set<number>;
  octaveOffset: number;
  startPitch?: number; // default C3 = 48
  endPitch?: number;   // default C6 = 84
  onNoteDown?: (pitch: number) => void;
  onNoteUp?: (pitch: number) => void;
  showKeyLabels?: boolean;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  activeNotes,
  userNotes = new Set(),
  octaveOffset,
  startPitch = 48, // C3
  endPitch = 84,   // C6
  onNoteDown,
  onNoteUp,
  showKeyLabels = true,
}) => {
  // Generate keys in range
  const pitches: number[] = [];
  for (let p = startPitch; p <= endPitch; p++) {
    pitches.push(p);
  }

  // Count white keys to calculate widths
  const whitePitches = pitches.filter(p => !isBlackKey(p));
  const totalWhiteKeys = whitePitches.length;

  const handlePointerDown = useCallback((pitch: number, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    onNoteDown?.(pitch);
  }, [onNoteDown]);

  const handlePointerUp = useCallback((pitch: number, e: React.PointerEvent) => {
    e.preventDefault();
    onNoteUp?.(pitch);
  }, [onNoteUp]);

  return (
    <div className="relative w-full select-none overflow-x-auto pb-2 scrollbar-thin">
      <div 
        className="relative mx-auto flex h-48 min-w-[760px] max-w-5xl rounded-xl bg-zinc-950 p-2 shadow-2xl border border-zinc-800/80 backdrop-blur-md"
        style={{ perspective: 1000 }}
      >
        {/* Felt header strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-950 via-red-900 to-red-950 rounded-t-xl z-30 opacity-80" />

        {/* White Keys */}
        <div className="relative flex w-full h-full">
          {whitePitches.map((pitch) => {
            const isActive = activeNotes.has(pitch);
            const isUserPressed = userNotes.has(pitch);
            const keyLabel = getKeyLabelForPitch(pitch, octaveOffset);
            const noteName = midiToNoteName(pitch);
            const isC = pitch % 12 === 0;

            return (
              <div
                key={pitch}
                onPointerDown={(e) => handlePointerDown(pitch, e)}
                onPointerUp={(e) => handlePointerUp(pitch, e)}
                onPointerLeave={(e) => handlePointerUp(pitch, e)}
                style={{ width: `${100 / totalWhiteKeys}%` }}
                className={`relative flex flex-col justify-end items-center h-full rounded-b-md border-r border-zinc-300/40 transition-all duration-75 cursor-pointer touch-none ${
                  isActive
                    ? isUserPressed
                      ? 'bg-gradient-to-t from-emerald-400 via-emerald-200 to-white shadow-[0_0_25px_rgba(34,197,94,0.8)] translate-y-1'
                      : 'bg-gradient-to-t from-cyan-400 via-cyan-200 to-white shadow-[0_0_25px_rgba(56,189,248,0.8)] translate-y-1'
                    : 'bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2)] hover:bg-zinc-100'
                }`}
              >
                {/* Visual active bottom glow */}
                {isActive && (
                  <div className="absolute -bottom-2 w-full h-3 bg-emerald-400/60 blur-md rounded-full pointer-events-none" />
                )}

                {/* Key Label (keyboard key & note name) */}
                <div className="flex flex-col items-center pb-2 pointer-events-none text-zinc-800">
                  {showKeyLabels && keyLabel && (
                    <span className={`text-[11px] font-mono font-bold px-1 py-0.5 rounded ${
                      isActive ? 'bg-emerald-950 text-emerald-300' : 'bg-zinc-800/20 text-zinc-700'
                    }`}>
                      {keyLabel}
                    </span>
                  )}
                  {isC && (
                    <span className="text-[9px] font-bold tracking-tight text-zinc-500 mt-0.5">
                      {noteName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Black Keys layer */}
        <div className="absolute inset-x-2 top-2 h-32 pointer-events-none flex">
          {whitePitches.map((whitePitch, whiteIndex) => {
            // Check if there is an accidental right after this white key
            const blackPitch = whitePitch + 1;
            const hasBlack = isBlackKey(blackPitch);

            if (!hasBlack || whiteIndex === whitePitches.length - 1) {
              return null;
            }

            const isActive = activeNotes.has(blackPitch);
            const isUserPressed = userNotes.has(blackPitch);
            const keyLabel = getKeyLabelForPitch(blackPitch, octaveOffset);

            // Compute percentage position: centered between current white key and next white key
            const leftPercent = ((whiteIndex + 1) / totalWhiteKeys) * 100;
            const blackWidthPercent = (100 / totalWhiteKeys) * 0.65;

            return (
              <div
                key={blackPitch}
                onPointerDown={(e) => handlePointerDown(blackPitch, e)}
                onPointerUp={(e) => handlePointerUp(blackPitch, e)}
                onPointerLeave={(e) => handlePointerUp(blackPitch, e)}
                style={{
                  left: `calc(${leftPercent}% - ${blackWidthPercent / 2}%)`,
                  width: `${blackWidthPercent}%`
                }}
                className={`absolute top-0 h-full rounded-b-md transition-all duration-75 cursor-pointer pointer-events-auto z-20 flex flex-col justify-end items-center pb-2 ${
                  isActive
                    ? isUserPressed
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.9)] translate-y-0.5'
                      : 'bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.9)] translate-y-0.5'
                    : 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-x border-b border-zinc-700/60 shadow-[0_4px_8px_rgba(0,0,0,0.8)] hover:bg-zinc-800'
                }`}
              >
                {showKeyLabels && keyLabel && (
                  <span className={`text-[10px] font-mono font-bold px-1 rounded pointer-events-none ${
                    isActive ? 'bg-zinc-950 text-emerald-300' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {keyLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
