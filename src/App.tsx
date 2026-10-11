import React, { useState } from 'react';
import { ShaderBackground } from './components/ShaderBackground.tsx';
import { Home } from './components/Home.tsx';
import { Play } from './components/Play.tsx';
import { Learn } from './components/Learn.tsx';
import { Library } from './components/Library.tsx';
import { Review } from './components/Review.tsx';
import { Settings } from './components/Settings.tsx';
import { 
  Piano, 
  PlayCircle, 
  BookOpen, 
  Library as LibraryIcon, 
  Disc, 
  Settings as SettingsIcon,
  Home as HomeIcon,
  Sparkles
} from 'lucide-react';

export type ScreenType = 'home' | 'play' | 'learn' | 'library' | 'review' | 'settings';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [selectedLearnPieceId, setSelectedLearnPieceId] = useState<string | undefined>();
  const [mcpConnected, setMcpConnected] = useState<boolean>(true);

  const handleSelectPieceForLearn = (pieceId: string) => {
    setSelectedLearnPieceId(pieceId);
    setActiveScreen('learn');
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Three.js Procedural WebGL Shader Ambient Background */}
      <ShaderBackground intensity={activeScreen === 'home' ? 1.0 : 0.45} />

      {/* Top Navigation Bar ("Çerçeve içinde çerçeve" estetiği) */}
      <header className="sticky top-0 z-50 w-full px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-2xl backdrop-blur-xl">
          
          {/* Logo */}
          <button 
            onClick={() => setActiveScreen('home')}
            className="flex items-center gap-3 text-left group transition"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-950/40 text-white">
              <Piano className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  PIANO STUDIO
                </span>
                {/* Live pulsing engine status */}
                <span className="relative flex h-2 w-2" title="Ses Motoru & MCP Hazır">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 block font-mono">v1.0 • WebGL & Tone.js</span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveScreen('home')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeScreen === 'home'
                  ? 'bg-zinc-800/90 text-white border border-zinc-700/60 shadow-inner'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ana Sayfa</span>
            </button>

            <button
              onClick={() => setActiveScreen('play')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeScreen === 'play'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-inner'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Serbest Çal</span>
            </button>

            <button
              onClick={() => setActiveScreen('learn')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeScreen === 'learn'
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Öğren</span>
            </button>

            <button
              onClick={() => setActiveScreen('library')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeScreen === 'library'
                  ? 'bg-zinc-800/90 text-white border border-zinc-700/60 shadow-inner'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <LibraryIcon className="w-3.5 h-3.5" />
              <span>Kütüphane</span>
            </button>

            <button
              onClick={() => setActiveScreen('review')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeScreen === 'review'
                  ? 'bg-zinc-800/90 text-white border border-zinc-700/60 shadow-inner'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>Kayıtlar</span>
            </button>

            <button
              onClick={() => setActiveScreen('settings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeScreen === 'settings'
                  ? 'bg-zinc-800/90 text-white border border-zinc-700/60 shadow-inner'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ayarlar</span>
            </button>
          </nav>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 pb-12">
        {activeScreen === 'home' && (
          <Home 
            onNavigate={(screen) => setActiveScreen(screen)} 
            mcpConnected={mcpConnected} 
          />
        )}
        {activeScreen === 'play' && <Play />}
        {activeScreen === 'learn' && <Learn initialPieceId={selectedLearnPieceId} />}
        {activeScreen === 'library' && (
          <Library onSelectPieceForLearn={handleSelectPieceForLearn} />
        )}
        {activeScreen === 'review' && <Review />}
        {activeScreen === 'settings' && <Settings mcpConnected={mcpConnected} />}
      </main>

      {/* Bottom status bar */}
      <footer className="w-full py-3 px-4 border-t border-zinc-900/80 bg-zinc-950/60 backdrop-blur-md z-10 text-center">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Salamander Grand Piano Audio Engine</span>
            <span>•</span>
            <span>&lt; 30 ms Latency</span>
          </div>
          <div>
            <span>KeyboardEvent.code Standardı</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default App;
