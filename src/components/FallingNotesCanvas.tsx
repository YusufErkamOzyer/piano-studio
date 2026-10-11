import React, { useEffect, useRef, useCallback } from 'react';
import { Piece, Note, Hand } from '../types/piece.ts';
import { isBlackKey } from '../services/keyMapping.ts';
import { audioEngine } from '../services/audioEngine.ts';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  radius: number;
}

interface FallingNotesCanvasProps {
  piece: Piece;
  isPlaying: boolean;
  speed: number;             // e.g. 0.5, 1.0, 1.25
  waitMode: boolean;
  handFilter: 'both' | 'right' | 'left';
  loopStartBeat?: number;
  loopEndBeat?: number;
  userPressedNotes: Set<number>;
  startPitch?: number;       // default 48 (C3)
  endPitch?: number;         // default 84 (C6)
  onScoreUpdate?: (hitType: 'perfect' | 'good' | 'miss', pitch: number) => void;
  onProgress?: (currentBeat: number, totalBeats: number) => void;
  onEnded?: () => void;
}

export const FallingNotesCanvas: React.FC<FallingNotesCanvasProps> = ({
  piece,
  isPlaying,
  speed,
  waitMode,
  handFilter,
  loopStartBeat = 0,
  loopEndBeat,
  userPressedNotes,
  startPitch = 48,
  endPitch = 84,
  onScoreUpdate,
  onProgress,
  onEnded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentBeatRef = useRef<number>(loopStartBeat);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const userPressedNotesRef = useRef<Set<number>>(userPressedNotes);
  const waitModeRef = useRef<boolean>(waitMode);
  const speedRef = useRef<number>(speed);
  const handFilterRef = useRef<'both' | 'right' | 'left'>(handFilter);
  const loopEndBeatRef = useRef<number | undefined>(loopEndBeat);
  const loopStartBeatRef = useRef<number>(loopStartBeat);

  const particlesRef = useRef<Particle[]>([]);
  const triggeredNotesRef = useRef<Set<number>>(new Set()); // index of notes played

  // Synchronize refs
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { userPressedNotesRef.current = userPressedNotes; }, [userPressedNotes]);
  useEffect(() => { waitModeRef.current = waitMode; }, [waitMode]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { handFilterRef.current = handFilter; }, [handFilter]);
  useEffect(() => { loopStartBeatRef.current = loopStartBeat; }, [loopStartBeat]);
  useEffect(() => { loopEndBeatRef.current = loopEndBeat; }, [loopEndBeat]);

  // Reset when piece changes or loop changes
  useEffect(() => {
    currentBeatRef.current = loopStartBeat;
    triggeredNotesRef.current.clear();
  }, [piece, loopStartBeat]);

  const emitHitParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5);
      const vel = 2 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel - 1,
        color,
        alpha: 1.0,
        radius: 2 + Math.random() * 2.5
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    // Calculate pitches and horizontal bounds
    const totalPitches = endPitch - startPitch + 1;
    const whitePitches: number[] = [];
    for (let p = startPitch; p <= endPitch; p++) {
      if (!isBlackKey(p)) whitePitches.push(p);
    }
    const totalWhite = whitePitches.length;

    // Filter relevant notes
    const activeNotes = piece.notes.filter(note => {
      if (handFilterRef.current === 'right' && note.hand === 'left') return false;
      if (handFilterRef.current === 'left' && note.hand === 'right') return false;
      return true;
    });

    const totalPieceBeats = Math.max(...piece.notes.map(n => n.startBeat + n.durationBeats), 16);

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const deltaMs = Math.min(time - lastTime, 100);
      lastTime = time;

      const width = canvas.width;
      const height = canvas.height;
      const hitLineY = height - 32;
      const beatsVisible = 6.0; // How many beats from top to hitline
      const pixelsPerBeat = (hitLineY - 20) / beatsVisible;

      // Handle Resize / Retina
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (canvas.clientWidth !== width / dpr || canvas.clientHeight !== height / dpr) {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const w = width / dpr;
      const h = height / dpr;
      const hitY = h - 32;

      // Clear background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);

      // Measure grid lines
      const beatsPerMeasure = (piece.timeSignature[0] * 4) / piece.timeSignature[1];
      const startMeasureBeat = Math.floor((currentBeatRef.current - 1) / beatsPerMeasure) * beatsPerMeasure;
      ctx.lineWidth = 1;
      for (let b = startMeasureBeat; b <= currentBeatRef.current + beatsVisible + 2; b += beatsPerMeasure) {
        const y = hitY - (b - currentBeatRef.current) * pixelsPerBeat;
        if (y >= 0 && y <= hitY) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // Key column guides
      whitePitches.forEach((_, idx) => {
        const x = (idx / totalWhite) * w;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, hitY);
        ctx.stroke();
      });

      // Hit Line with ambient glow
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(34, 197, 94, 0.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, hitY);
      ctx.lineTo(w, hitY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Helper to compute note X and Width on canvas
      const getNoteXAndWidth = (pitch: number) => {
        const isBlack = isBlackKey(pitch);
        if (!isBlack) {
          const idx = whitePitches.indexOf(pitch);
          if (idx === -1) return null;
          const keyW = w / totalWhite;
          return { x: idx * keyW + 2, width: keyW - 4, isBlack: false };
        } else {
          const prevWhite = pitch - 1;
          const idx = whitePitches.indexOf(prevWhite);
          if (idx === -1) return null;
          const keyW = w / totalWhite;
          const blackW = keyW * 0.65;
          return { x: (idx + 1) * keyW - blackW / 2, width: blackW, isBlack: true };
        }
      };

      // Check Wait Mode Condition
      let shouldAdvanceTime = isPlayingRef.current;
      let notesWaitingAtHitline: Note[] = [];

      if (waitModeRef.current && isPlayingRef.current) {
        // Find notes that are currently right at or very close to the hitline
        const currentBeat = currentBeatRef.current;
        notesWaitingAtHitline = activeNotes.filter(n => {
          const timeDiff = n.startBeat - currentBeat;
          return timeDiff <= 0.06 && timeDiff >= -0.25;
        });

        // If there are notes at the hitline that user has not pressed, freeze!
        for (const waitingNote of notesWaitingAtHitline) {
          if (!userPressedNotesRef.current.has(waitingNote.pitch)) {
            shouldAdvanceTime = false;
            break;
          }
        }
      }

      // Advance song playback if not paused/waiting
      if (shouldAdvanceTime) {
        const beatsPerSecond = (piece.tempoBpm / 60) * speedRef.current;
        currentBeatRef.current += (deltaMs / 1000) * beatsPerSecond;

        // Loop check
        const effectiveEnd = loopEndBeatRef.current || totalPieceBeats;
        if (currentBeatRef.current >= effectiveEnd) {
          if (loopEndBeatRef.current) {
            currentBeatRef.current = loopStartBeatRef.current;
            triggeredNotesRef.current.clear();
          } else {
            onEnded?.();
          }
        }
      }

      onProgress?.(currentBeatRef.current, totalPieceBeats);

      // Render Falling Notes
      activeNotes.forEach((note, noteIndex) => {
        const geom = getNoteXAndWidth(note.pitch);
        if (!geom) return;

        const noteBottomY = hitY - (note.startBeat - currentBeatRef.current) * pixelsPerBeat;
        const noteHeight = Math.max(14, note.durationBeats * pixelsPerBeat);
        const noteTopY = noteBottomY - noteHeight;

        // Only draw if within viewport
        if (noteBottomY < 0 || noteTopY > h) return;

        const isLeftHand = note.hand === 'left';
        const isWaiting = notesWaitingAtHitline.includes(note);

        // Colors
        let gradientColorStart = isLeftHand ? '#10b981' : '#06b6d4'; // Emerald or Cyan
        let gradientColorEnd = isLeftHand ? '#047857' : '#2563eb';   // Darker tone

        if (isWaiting) {
          gradientColorStart = '#fbbf24'; // Amber pulse while waiting for player
          gradientColorEnd = '#d97706';
        }

        const grad = ctx.createLinearGradient(0, noteTopY, 0, noteBottomY);
        grad.addColorStop(0, gradientColorStart);
        grad.addColorStop(1, gradientColorEnd);

        ctx.fillStyle = grad;
        ctx.shadowColor = isWaiting ? 'rgba(251, 191, 36, 0.7)' : (isLeftHand ? 'rgba(16, 185, 129, 0.5)' : 'rgba(6, 182, 212, 0.5)');
        ctx.shadowBlur = 8;

        // Rounded rect for note bar
        const radius = Math.min(6, geom.width / 4);
        ctx.beginPath();
        ctx.roundRect(geom.x, noteTopY, geom.width, noteHeight, radius);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Inner specular highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.roundRect(geom.x + 2, noteTopY + 2, geom.width - 4, 3, 2);
        ctx.fill();

        // Check if note touches hit line and trigger audio/score if autoplay or user match
        const diffToBeats = Math.abs(note.startBeat - currentBeatRef.current);
        if (diffToBeats < 0.12 && !triggeredNotesRef.current.has(noteIndex)) {
          if (!waitModeRef.current) {
            // Autoplay sound or check hit
            audioEngine.playNote(note.pitch, (note.velocity || 90) / 127, false);
            setTimeout(() => audioEngine.stopNote(note.pitch, false), Math.min(800, (note.durationBeats * 60 / piece.tempoBpm) * 1000));
            emitHitParticles(geom.x + geom.width / 2, hitY, gradientColorStart);
            triggeredNotesRef.current.add(noteIndex);
            onScoreUpdate?.('perfect', note.pitch);
          } else {
            // Wait mode: if user played it
            if (userPressedNotesRef.current.has(note.pitch)) {
              emitHitParticles(geom.x + geom.width / 2, hitY, '#10b981');
              triggeredNotesRef.current.add(noteIndex);
              onScoreUpdate?.('perfect', note.pitch);
            }
          }
        }
      });

      // Update & Draw Hit Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [piece, startPitch, endPitch, onScoreUpdate, onProgress, onEnded, emitHitParticles]);

  return (
    <div className="relative w-full h-80 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-2xl">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
      />
      {waitMode && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold backdrop-blur-sm animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Bekleyen Mod Aktif
        </div>
      )}
    </div>
  );
};
