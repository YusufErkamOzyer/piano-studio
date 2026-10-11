import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pieceStore } from '../services/pieceStore.ts';
import { audioEngine } from '../services/audioEngine.ts';
import { exportRecordingToMidi } from '../services/midiConverter.ts';
import { midiToNoteName } from '../services/keyMapping.ts';
import { RecordingSession, RecordedEvent } from '../types/piece.ts';
import { 
  Disc, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  Clock, 
  Calendar, 
  Music, 
  Activity,
  FileDown
} from 'lucide-react';

export const Review: React.FC = () => {
  const [recordings, setRecordings] = useState<RecordingSession[]>(pieceStore.getRecordings());
  const [activeSession, setActiveSession] = useState<RecordingSession | null>(recordings[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTimeMs, setPlaybackTimeMs] = useState<number>(0);

  const playbackTimeoutsRef = useRef<number[]>([]);
  const playbackIntervalRef = useRef<number | null>(null);

  const stopPlayback = useCallback(() => {
    playbackTimeoutsRef.current.forEach(id => clearTimeout(id));
    playbackTimeoutsRef.current = [];
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    audioEngine.stopAllNotes();
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount or session change
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  useEffect(() => {
    return pieceStore.subscribe(() => {
      const recs = pieceStore.getRecordings();
      setRecordings(recs);
      if (!activeSession && recs.length > 0) {
        setActiveSession(recs[0]);
      }
    });
  }, [activeSession]);

  const handleDownloadMidi = (session: RecordingSession) => {
    const blob = exportRecordingToMidi(session);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.title.replace(/\s+/g, '_')}.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePlaySession = (session: RecordingSession) => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    stopPlayback();
    setIsPlaying(true);
    setPlaybackTimeMs(0);

    const startTime = Date.now();

    // Schedule all events
    session.events.forEach(evt => {
      const tid = window.setTimeout(() => {
        if (evt.type === 'noteOn') {
          audioEngine.playNote(evt.pitch, (evt.velocity || 80) / 127, false);
        } else {
          audioEngine.stopNote(evt.pitch, false);
        }
      }, evt.time);
      playbackTimeoutsRef.current.push(tid);
    });

    playbackIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      setPlaybackTimeMs(elapsed);
      if (elapsed >= session.durationMs) {
        stopPlayback();
      }
    }, 50);
  };

  const formatMs = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-6 z-10 w-full space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Disc className="w-6 h-6 text-cyan-400" />
            Kayıtlar & Performans İncelemesi
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Çaldığınız seansların olay günlüğü, geri dinleme ve MIDI (.mid) dışa aktarımı.
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
          Toplam {recordings.length} Kayıt
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recordings List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-bold text-zinc-300 px-1">Kayıtlı Seanslar</h3>
          
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {recordings.map((session) => {
              const isSelected = activeSession?.id === session.id;
              const noteCount = session.events.filter(e => e.type === 'noteOn').length;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    setActiveSession(session);
                    setIsPlaying(false);
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-zinc-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-zinc-200 truncate">{session.title}</span>
                    <span className="text-[11px] font-mono text-zinc-500">{session.createdAt}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2 font-mono">
                      <span>{formatMs(session.durationMs)}</span>
                      <span>•</span>
                      <span>{noteCount} nota</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadMidi(session);
                        }}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300 transition"
                        title="MIDI İndir"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pieceStore.deleteRecording(session.id);
                        }}
                        className="p-1 rounded hover:bg-red-950/40 text-zinc-500 hover:text-red-400 transition"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {recordings.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 text-zinc-500 text-xs">
                Henüz kayıt bulunmuyor. Serbest Çal ekranında kayıt başlatıp kendi performansınızı kaydedebilirsiniz.
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Session Visualizer & Event Log */}
        <div className="lg:col-span-2">
          {activeSession ? (
            <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-xl space-y-6">
              
              {/* Playback bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
                <div>
                  <h3 className="text-xl font-bold text-white">{activeSession.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {activeSession.createdAt} • Süre: {formatMs(activeSession.durationMs)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlaySession(activeSession)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg shadow-cyan-950/50"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Durdur' : 'Geri Dinle'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadMidi(activeSession)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition"
                  >
                    <FileDown className="w-4 h-4 text-cyan-400" />
                    <span>MIDI İndir (.mid)</span>
                  </button>
                </div>
              </div>

              {/* Timeline Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>{formatMs(playbackTimeMs)}</span>
                  <span>{formatMs(activeSession.durationMs)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-100"
                    style={{
                      width: `${Math.min(100, (playbackTimeMs / Math.max(1, activeSession.durationMs)) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Event Log Inspector */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 mb-2.5 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Olay Günlüğü (Event Log - İlk 25 Olay)</span>
                </h4>

                <div className="max-h-60 overflow-y-auto rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-3 space-y-1 font-mono text-xs">
                  {activeSession.events.slice(0, 25).map((evt, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-1 px-2 rounded hover:bg-zinc-800/40 text-zinc-300"
                    >
                      <span className="text-zinc-500">#{idx + 1} @ {formatMs(evt.time)}</span>
                      <span className={`font-bold ${evt.type === 'noteOn' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {evt.type}
                      </span>
                      <span className="font-bold text-cyan-300">{midiToNoteName(evt.pitch)} (P:{evt.pitch})</span>
                      <span className="text-zinc-400">Vel: {evt.velocity}</span>
                    </div>
                  ))}
                  {activeSession.events.length > 25 && (
                    <div className="text-center py-2 text-zinc-500 text-[11px] italic">
                      + {activeSession.events.length - 25} ek olay daha...
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-zinc-950/40 border border-dashed border-zinc-800 text-zinc-500">
              İncelemek için sol taraftan bir kayıt seçin.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
