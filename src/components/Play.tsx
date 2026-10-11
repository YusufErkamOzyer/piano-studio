import React, { useState, useEffect, useCallback } from 'react';
import { PianoKeyboard } from './PianoKeyboard.tsx';
import { GhostingTester } from './GhostingTester.tsx';
import { audioEngine } from '../services/audioEngine.ts';
import { pieceStore } from '../services/pieceStore.ts';
import { getMidiFromKeyCode, midiToNoteName } from '../services/keyMapping.ts';
import { 
  Circle, 
  Square, 
  Volume2, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Sliders, 
  Save, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const Play: React.FC = () => {
  const [octaveOffset, setOctaveOffset] = useState<number>(0);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [userNotes, setUserNotes] = useState<Set<number>>(new Set());
  const [isSustainOn, setIsSustainOn] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [showTester, setShowTester] = useState<boolean>(false);
  const [showKeyLabels, setShowKeyLabels] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(85);
  const [reverb, setReverb] = useState<number>(25);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Subscribe to audio engine notes
  useEffect(() => {
    return audioEngine.subscribeActiveNotes((notes) => {
      setActiveNotes(notes);
    });
  }, []);

  // Update volume & reverb
  useEffect(() => {
    audioEngine.setVolume(volume / 100);
  }, [volume]);

  useEffect(() => {
    audioEngine.setReverbWet(reverb / 100);
  }, [reverb]);

  // Recording timer
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      const start = Date.now();
      timer = setInterval(() => {
        setRecordDuration(Math.floor((Date.now() - start) / 1000));
      }, 500);
    } else {
      setRecordDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Physical Keyboard Handler with KeyboardEvent.code and repeat suppression
  useEffect(() => {
    const pressedCodes = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.repeat) return;

      // Octave controls
      if (e.code === 'KeyZ') {
        setOctaveOffset(prev => Math.max(-2, prev - 1));
        return;
      }
      if (e.code === 'KeyX') {
        setOctaveOffset(prev => Math.min(2, prev + 1));
        return;
      }

      // Sustain pedal (Space)
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSustainOn(true);
        audioEngine.setSustain(true);
        return;
      }

      const pitch = getMidiFromKeyCode(e.code, octaveOffset);
      if (pitch !== null) {
        pressedCodes.add(e.code);
        setUserNotes(prev => new Set(prev).add(pitch));
        audioEngine.playNote(pitch, 0.85, true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        setIsSustainOn(false);
        audioEngine.setSustain(false);
        return;
      }

      const pitch = getMidiFromKeyCode(e.code, octaveOffset);
      if (pitch !== null) {
        pressedCodes.delete(e.code);
        setUserNotes(prev => {
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
    setUserNotes(prev => new Set(prev).add(pitch));
    audioEngine.playNote(pitch, 0.85, true);
  }, []);

  const handlePointerNoteUp = useCallback((pitch: number) => {
    setUserNotes(prev => {
      const next = new Set(prev);
      next.delete(pitch);
      return next;
    });
    audioEngine.stopNote(pitch, true);
  }, []);

  const toggleRecording = () => {
    if (!isRecording) {
      audioEngine.startRecording();
      setIsRecording(true);
    } else {
      const session = audioEngine.stopRecording(`Serbest Çalma ${new Date().toLocaleTimeString('tr-TR')}`);
      setIsRecording(false);
      if (session && session.events.length > 0) {
        pieceStore.addRecording(session);
        setSavedNotice(`Kayıt kaydedildi (${session.events.length} olay)`);
        setTimeout(() => setSavedNotice(null), 3000);
      }
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative flex flex-col items-center max-w-6xl mx-auto px-4 py-6 z-10 w-full space-y-6">
      
      {/* Top Header & Controls Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        
        {/* Left: Octave & Sustain Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700/60 rounded-lg p-1">
            <button
              onClick={() => setOctaveOffset(prev => Math.max(-2, prev - 1))}
              disabled={octaveOffset <= -2}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 transition"
              title="Oktav Düşür (Z)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs px-2 text-zinc-200 font-semibold select-none">
              Oktav: {octaveOffset > 0 ? `+${octaveOffset}` : octaveOffset} (C{4 + octaveOffset})
            </span>
            <button
              onClick={() => setOctaveOffset(prev => Math.min(2, prev + 1))}
              disabled={octaveOffset >= 2}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 transition"
              title="Oktav Yükselt (X)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Sustain Button */}
          <button
            onClick={() => {
              const next = !isSustainOn;
              setIsSustainOn(next);
              audioEngine.setSustain(next);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              isSustainOn 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isSustainOn ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
            <span>Sustain (Space)</span>
          </button>
        </div>

        {/* Center: Live Recording Controller */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
              isRecording
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Kaydı Durdur ({formatSeconds(recordDuration)})</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                <span>Kaydet</span>
              </>
            )}
          </button>

          {savedNotice && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{savedNotice}</span>
            </div>
          )}
        </div>

        {/* Right: Audio Sliders & Options */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Volume2 className="w-4 h-4 text-zinc-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 accent-emerald-500 h-1 bg-zinc-800 rounded cursor-pointer"
              title="Ana Ses"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={reverb}
              onChange={(e) => setReverb(Number(e.target.value))}
              className="w-16 accent-purple-500 h-1 bg-zinc-800 rounded cursor-pointer"
              title="Oda Yankısı (Reverb)"
            />
          </div>

          <button
            onClick={() => setShowTester(prev => !prev)}
            className={`p-2 rounded-lg border text-xs transition ${
              showTester ? 'bg-zinc-800 text-emerald-400 border-zinc-700' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Ghosting & Gecikme Testini Göster"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Piano Keyboard Component */}
      <div className="w-full">
        <PianoKeyboard
          activeNotes={activeNotes}
          userNotes={userNotes}
          octaveOffset={octaveOffset}
          onNoteDown={handlePointerNoteDown}
          onNoteUp={handlePointerNoteUp}
          showKeyLabels={showKeyLabels}
        />
      </div>

      {/* Active playing note visual feedback pills */}
      <div className="flex items-center justify-between w-full px-2 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-400">Çalınan:</span>
          {activeNotes.size === 0 ? (
            <span className="italic text-zinc-400">Tuşlara basın...</span>
          ) : (
            Array.from(activeNotes).map(p => (
              <span key={p} className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {midiToNoteName(p)}
              </span>
            ))
          )}
        </div>

        <button
          onClick={() => setShowKeyLabels(prev => !prev)}
          className="text-xs text-zinc-400 hover:text-zinc-200 underline"
        >
          {showKeyLabels ? 'Tuş etiketlerini gizle' : 'Tuş etiketlerini göster'}
        </button>
      </div>

      {/* Expandable Ghosting & Latency Tester */}
      {showTester && (
        <div className="w-full animate-in fade-in slide-in-from-top-2 duration-200">
          <GhostingTester />
        </div>
      )}

    </div>
  );
};
