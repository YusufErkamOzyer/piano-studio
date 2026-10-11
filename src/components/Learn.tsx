import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FallingNotesCanvas } from './FallingNotesCanvas.tsx';
import { PianoKeyboard } from './PianoKeyboard.tsx';
import { pieceStore } from '../services/pieceStore.ts';
import { audioEngine } from '../services/audioEngine.ts';
import { getMidiFromKeyCode, midiToNoteName } from '../services/keyMapping.ts';
import { Piece, Hand } from '../types/piece.ts';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  Flame, 
  Gauge, 
  Hand as HandIcon, 
  Repeat, 
  PauseCircle,
  Music,
  CheckCircle2
} from 'lucide-react';

interface LearnProps {
  initialPieceId?: string;
}

export const Learn: React.FC<LearnProps> = ({ initialPieceId }) => {
  const pieces = useMemo(() => pieceStore.getPieces('approved'), []);
  const [selectedPieceId, setSelectedPieceId] = useState<string>(initialPieceId || (pieces[0]?.id || 'fuer-elise'));
  
  const currentPiece = useMemo(() => {
    return pieceStore.getPiece(selectedPieceId) || pieces[0];
  }, [selectedPieceId, pieces]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [waitMode, setWaitMode] = useState<boolean>(true);
  const [handFilter, setHandFilter] = useState<'both' | 'right' | 'left'>('both');
  const [octaveOffset, setOctaveOffset] = useState<number>(0);
  
  // Scoring & Stats
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [perfectHits, setPerfectHits] = useState<number>(0);
  const [totalNotes, setTotalNotes] = useState<number>(0);

  // Active notes state
  const [userPressedNotes, setUserPressedNotes] = useState<Set<number>>(new Set());
  const [engineActiveNotes, setEngineActiveNotes] = useState<Set<number>>(new Set());
  
  // Progress
  const [progressBeat, setProgressBeat] = useState<number>(0);
  const [totalBeats, setTotalBeats] = useState<number>(100);

  // Loop Controls
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [loopStartMeasure, setLoopStartMeasure] = useState<number>(1);
  const [loopEndMeasure, setLoopEndMeasure] = useState<number>(4);

  // Subscribe to audio engine
  useEffect(() => {
    return audioEngine.subscribeActiveNotes((notes) => {
      setEngineActiveNotes(notes);
    });
  }, []);

  // Keyboard Event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.repeat) return;

      // Space to toggle pause/play
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
        return;
      }

      // Octave controls
      if (e.code === 'KeyZ') {
        setOctaveOffset(prev => Math.max(-2, prev - 1));
        return;
      }
      if (e.code === 'KeyX') {
        setOctaveOffset(prev => Math.min(2, prev + 1));
        return;
      }

      const pitch = getMidiFromKeyCode(e.code, octaveOffset);
      if (pitch !== null) {
        setUserPressedNotes(prev => new Set(prev).add(pitch));
        audioEngine.playNote(pitch, 0.85, true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const pitch = getMidiFromKeyCode(e.code, octaveOffset);
      if (pitch !== null) {
        setUserPressedNotes(prev => {
          const next = new Set(prev);
          next.delete(pitch);
          return next;
        });
        audioEngine.stopNote(pitch, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [octaveOffset]);

  const handlePointerNoteDown = useCallback((pitch: number) => {
    setUserPressedNotes(prev => new Set(prev).add(pitch));
    audioEngine.playNote(pitch, 0.85, true);
  }, []);

  const handlePointerNoteUp = useCallback((pitch: number) => {
    setUserPressedNotes(prev => {
      const next = new Set(prev);
      next.delete(pitch);
      return next;
    });
    audioEngine.stopNote(pitch, true);
  }, []);

  const handleScoreUpdate = useCallback((type: 'perfect' | 'good' | 'miss', pitch: number) => {
    if (type === 'perfect') {
      setScore(prev => prev + 100 + combo * 10);
      setCombo(prev => {
        const next = prev + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setPerfectHits(prev => prev + 1);
    } else if (type === 'good') {
      setScore(prev => prev + 50);
      setCombo(prev => prev + 1);
    } else {
      setCombo(0);
    }
    setTotalNotes(prev => prev + 1);
  }, [combo, maxCombo]);

  const handleSongEnded = () => {
    setIsPlaying(false);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const beatsPerMeasure = currentPiece ? (currentPiece.timeSignature[0] * 4) / currentPiece.timeSignature[1] : 4;
  const loopStartBeat = isLooping ? (loopStartMeasure - 1) * beatsPerMeasure : 0;
  const loopEndBeat = isLooping ? loopEndMeasure * beatsPerMeasure : undefined;

  const accuracyPercent = totalNotes > 0 ? Math.round((perfectHits / totalNotes) * 100) : 100;

  return (
    <div className="relative flex flex-col items-center max-w-6xl mx-auto px-4 py-6 z-10 w-full space-y-5">
      
      {/* Top Header: Piece Selector & Learning Mode Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        
        {/* Piece Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedPieceId}
              onChange={(e) => {
                setSelectedPieceId(e.target.value);
                setIsPlaying(false);
                setScore(0);
                setCombo(0);
                setPerfectHits(0);
                setTotalNotes(0);
              }}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-100 outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              {pieces.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.composer}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono">
            {currentPiece?.key} • {currentPiece?.tempoBpm} BPM
          </span>
        </div>

        {/* Center: Play / Pause & Wait Mode Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(prev => !prev)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Öğrenmeye Başla</span>
              </>
            )}
          </button>

          {/* Wait Mode (Bekleyen Mod) Switch */}
          <button
            onClick={() => setWaitMode(prev => !prev)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              waitMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Bekleyen modda doğru tuşa basmadan akan notalar ilerlemez."
          >
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span>Bekleyen Mod: {waitMode ? 'AÇIK' : 'KAPALI'}</span>
          </button>
        </div>

        {/* Right: Hand filter & Speed */}
        <div className="flex items-center gap-3">
          
          {/* Hand Filter (Sağ / Sol El) */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setHandFilter('both')}
              className={`px-2.5 py-1 rounded transition ${handFilter === 'both' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Çift El
            </button>
            <button
              onClick={() => setHandFilter('right')}
              className={`px-2.5 py-1 rounded transition ${handFilter === 'right' ? 'bg-cyan-600 text-white font-bold' : 'text-zinc-400 hover:text-cyan-300'}`}
            >
              Sağ El
            </button>
            <button
              onClick={() => setHandFilter('left')}
              className={`px-2.5 py-1 rounded transition ${handFilter === 'left' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-emerald-300'}`}
            >
              Sol El
            </button>
          </div>

          {/* Speed slider */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg">
            <Gauge className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-transparent text-zinc-200 font-mono font-bold outline-none cursor-pointer"
            >
              <option value={0.5} className="bg-zinc-900">0.50x (Çok Yavaş)</option>
              <option value={0.75} className="bg-zinc-900">0.75x (Yavaş)</option>
              <option value={1.0} className="bg-zinc-900">1.00x (Normal)</option>
              <option value={1.25} className="bg-zinc-900">1.25x (Hızlı)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Score & Combo HUD Bar */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-400">Puan</span>
          </div>
          <span className="text-base font-black font-mono text-zinc-100">{score}</span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${combo > 5 ? 'text-orange-500 animate-bounce' : 'text-zinc-500'}`} />
            <span className="text-xs text-zinc-400">Seri (Combo)</span>
          </div>
          <span className={`text-base font-black font-mono ${combo > 5 ? 'text-orange-400' : 'text-zinc-300'}`}>
            {combo}x <span className="text-xs text-zinc-500 font-normal">({maxCombo} maks)</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-400">İsabet Oranı</span>
          </div>
          <span className="text-base font-black font-mono text-emerald-400">
            %{accuracyPercent}
          </span>
        </div>

        {/* Section Looping Toggle */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className={`w-4 h-4 ${isLooping ? 'text-cyan-400' : 'text-zinc-500'}`} />
            <span className="text-xs text-zinc-400">Döngü (A-B)</span>
          </div>
          <button
            onClick={() => setIsLooping(prev => !prev)}
            className={`text-xs px-2 py-0.5 rounded font-bold transition ${
              isLooping ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {isLooping ? `Ölçü ${loopStartMeasure}-${loopEndMeasure}` : 'Kapalı'}
          </button>
        </div>
      </div>

      {/* Falling Notes Canvas */}
      {currentPiece && (
        <div className="w-full">
          <FallingNotesCanvas
            piece={currentPiece}
            isPlaying={isPlaying}
            speed={speed}
            waitMode={waitMode}
            handFilter={handFilter}
            loopStartBeat={loopStartBeat}
            loopEndBeat={loopEndBeat}
            userPressedNotes={userPressedNotes}
            onScoreUpdate={handleScoreUpdate}
            onEnded={handleSongEnded}
          />
        </div>
      )}

      {/* Synchronized Piano Keyboard */}
      <div className="w-full">
        <PianoKeyboard
          activeNotes={new Set([...Array.from(engineActiveNotes), ...Array.from(userPressedNotes)])}
          userNotes={userPressedNotes}
          octaveOffset={octaveOffset}
          onNoteDown={handlePointerNoteDown}
          onNoteUp={handlePointerNoteUp}
          showKeyLabels={true}
        />
      </div>

    </div>
  );
};
