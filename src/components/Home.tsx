import React from 'react';
import { Play, Sparkles, BookOpen, Settings, Disc, ShieldCheck, ChevronRight, Activity } from 'lucide-react';
import { pieceStore } from '../services/pieceStore.ts';

interface HomeProps {
  onNavigate: (screen: 'play' | 'learn' | 'library' | 'review' | 'settings') => void;
  mcpConnected: boolean;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, mcpConnected }) => {
  const pendingCount = pieceStore.getPieces('pending').length;
  const approvedCount = pieceStore.getPieces('approved').length;
  const recordingsCount = pieceStore.getRecordings().length;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-8 z-10">
      {/* Outer Cinematic Frame */}
      <div className="relative w-full max-w-4xl p-1 rounded-2xl bg-gradient-to-b from-zinc-700/40 via-zinc-800/20 to-zinc-900/40 backdrop-blur-xl shadow-2xl border border-zinc-700/30">
        
        {/* Inner Frame ("Çerçeve içinde çerçeve") */}
        <div className="relative rounded-xl bg-zinc-950/80 p-8 sm:p-12 border border-zinc-800/80 flex flex-col items-center text-center overflow-hidden">
          
          {/* Subtle Ambient Glow behind title */}
          <div className="absolute top-1/4 -translate-y-1/2 w-96 h-48 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Status Badge with pulsing green dot */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-inner mb-6 z-10 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-medium tracking-wide text-zinc-300">
              SES MOTORU HAZIR <span className="text-zinc-600">•</span> {mcpConnected ? 'MCP BAĞLI' : 'YEREL STÜDYO'}
            </span>
          </div>

          {/* Giant Hero Title with tight letter-tracking */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 mb-4 select-none drop-shadow-sm">
            PIANO STUDIO
          </h1>

          <p className="text-base sm:text-lg text-zinc-400/90 max-w-xl mb-8 leading-relaxed font-normal">
            Bilgisayar klavyenizle çalın, akan notalarla parçaları öğrenin ve yapay zeka ile kendi repertuarınızı genişletin.
          </p>

          {/* Primary Liquid Glass CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 z-10">
            <button
              onClick={() => onNavigate('play')}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-semibold text-white tracking-wide overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-[0_8px_32px_rgba(34,197,94,0.35)]"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.85) 0%, rgba(16,185,129,0.95) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.25)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
              <Play className="w-5 h-5 fill-white transition-transform group-hover:translate-x-0.5" />
              <span>Hemen Çalmaya Başla</span>
            </button>

            <button
              onClick={() => onNavigate('learn')}
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl text-base font-medium text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Parça Öğren (Akan Notalar)</span>
            </button>
          </div>

          {/* Quick Hub Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full text-left">
            {/* Library Card */}
            <div 
              onClick={() => onNavigate('library')}
              className="group p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <BookOpen className="w-4 h-4" />
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-transform group-hover:translate-x-1" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-200">Kütüphane</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {approvedCount} Onaylı Parça
                  {pendingCount > 0 && (
                    <span className="ml-1 text-amber-400 font-semibold">• {pendingCount} Bekleyen</span>
                  )}
                </p>
              </div>
            </div>

            {/* Recordings Card */}
            <div 
              onClick={() => onNavigate('review')}
              className="group p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Disc className="w-4 h-4" />
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-transform group-hover:translate-x-1" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-200">Kayıtlar & İnceleme</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{recordingsCount} Kayıtlı Seans • MIDI Dışa Aktar</p>
              </div>
            </div>

            {/* AI & Settings Card */}
            <div 
              onClick={() => onNavigate('settings')}
              className="group p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-4 h-4" />
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-transform group-hover:translate-x-1" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-200">Ayarlar & AI MCP</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Klavye Eşlemesi • Düşük Gecikme</p>
              </div>
            </div>
          </div>

          {/* Keyboard shortcut quick hint */}
          <div className="mt-8 pt-6 border-t border-zinc-900 w-full flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">A-L</kbd>
              <span>Beyaz Tuşlar</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">W,E,T,Y,U,O,P</kbd>
              <span>Siyah Tuşlar</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">Space</kbd>
              <span>Sustain Pedalı</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">Z / X</kbd>
              <span>Oktav Kaydır</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
