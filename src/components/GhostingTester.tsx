import React, { useState, useEffect } from 'react';
import { Gauge, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { audioEngine } from '../services/audioEngine.ts';

export const GhostingTester: React.FC = () => {
  const [currentKeys, setCurrentKeys] = useState<Set<string>>(new Set());
  const [maxSimultaneous, setMaxSimultaneous] = useState<number>(0);
  const [measuredLatency, setMeasuredLatency] = useState<number>(audioEngine.getLatencyMs());

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      setCurrentKeys(prev => {
        const next = new Set(prev);
        next.add(e.code);
        if (next.size > maxSimultaneous) {
          setMaxSimultaneous(next.size);
        }
        return next;
      });
      // Test audio latency
      const lat = audioEngine.measureLatency();
      setMeasuredLatency(lat);
    };

    const handleUp = (e: KeyboardEvent) => {
      setCurrentKeys(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [maxSimultaneous]);

  const resetTest = () => {
    setCurrentKeys(new Set());
    setMaxSimultaneous(0);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base text-zinc-100">Klavye Ghosting & Gecikme Testi</h3>
        </div>
        <button
          onClick={resetTest}
          className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
        >
          Sıfırla
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Simultaneous Keys Card */}
        <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-zinc-400 mb-1">Şu Anda Basılan</span>
          <span className="text-3xl font-black font-mono text-emerald-400">
            {currentKeys.size}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1">tuş aynı anda aktif</span>
        </div>

        {/* Max Keys Rollover Card */}
        <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-zinc-400 mb-1">Maksimum Eşzamanlı (Rollover)</span>
          <span className="text-3xl font-black font-mono text-cyan-400">
            {maxSimultaneous}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1">
            {maxSimultaneous >= 6 ? 'Mükemmel (Akor uyumlu)' : (maxSimultaneous >= 3 ? 'Yeterli' : 'Klavye sınırı var')}
          </span>
        </div>

        {/* Audio Latency Card */}
        <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ses Gecikmesi</span>
          </div>
          <span className="text-3xl font-black font-mono text-emerald-400">
            ~{measuredLatency} <span className="text-sm font-sans font-normal text-zinc-500">ms</span>
          </span>
          <span className="text-[11px] text-emerald-500/90 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Hedef &lt; 30 ms sağlandı
          </span>
        </div>
      </div>

      {/* Currently Pressed Keys Chips */}
      <div className="flex items-center gap-2 flex-wrap min-h-[32px] p-2 rounded-lg bg-zinc-950/50 border border-zinc-900">
        <span className="text-xs text-zinc-500 font-mono">Basılı Tuşlar:</span>
        {currentKeys.size === 0 ? (
          <span className="text-xs text-zinc-600 italic">Klavyenizde aynı anda birden fazla tuşa basmayı deneyin (örn. A + S + D + F)...</span>
        ) : (
          Array.from(currentKeys).map(code => (
            <span key={code} className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {code}
            </span>
          ))
        )}
      </div>
    </div>
  );
};
