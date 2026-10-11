import React, { useState } from 'react';
import { 
  Keyboard, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Gauge, 
  Terminal, 
  PlusCircle, 
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine.ts';
import { pieceStore } from '../services/pieceStore.ts';
import { DISPLAY_KEY_LABELS, KEY_CODE_OFFSET_MAP } from '../services/keyMapping.ts';
import { Piece } from '../types/piece.ts';

interface SettingsProps {
  mcpConnected: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ mcpConnected }) => {
  const [latency, setLatency] = useState<number>(audioEngine.getLatencyMs());
  const [mcpSimulating, setMcpSimulating] = useState<boolean>(false);
  const [simulationLog, setSimulationLog] = useState<string | null>(null);

  const measureLatencyNow = () => {
    const lat = audioEngine.measureLatency();
    setLatency(lat);
  };

  // Simulate AI MCP tool call adding a verified piece into approval queue
  const simulateAiMcpImport = () => {
    setMcpSimulating(true);
    setSimulationLog('MCP Aracı Çağrılıyor: import_pdf("etude_op10_no3.pdf")...');

    setTimeout(() => {
      setSimulationLog('OMR Hattı Çalıştırıldı: Audiveris MusicXML üretimi tamamlandı. Şema doğrulanıyor...');
    }, 900);

    setTimeout(() => {
      const newAiPiece: Piece = {
        id: 'ai-chopin-tristesse-' + Date.now(),
        title: 'Etude Op. 10 No. 3 "Tristesse" [MCP Aktarımı]',
        composer: 'Frédéric Chopin',
        status: 'pending',
        source: 'pdf-omr',
        timeSignature: [2, 4],
        tempoBpm: 55,
        key: 'E Major',
        difficulty: 'intermediate',
        description: 'Claude Desktop / MCP sunucusu aracılığıyla PDF partisyondan başarıyla içe aktarıldı. Onayınızı bekliyor.',
        notes: [
          { pitch: 64, startBeat: 0.0, durationBeats: 1.0, hand: 'right', measure: 1 }, // E4
          { pitch: 68, startBeat: 1.0, durationBeats: 0.5, hand: 'right', measure: 1 }, // G#4
          { pitch: 71, startBeat: 1.5, durationBeats: 0.5, hand: 'right', measure: 1 }, // B4
          { pitch: 40, startBeat: 0.0, durationBeats: 2.0, hand: 'left', measure: 1 },  // E2
          { pitch: 76, startBeat: 2.0, durationBeats: 1.5, hand: 'right', measure: 2 }, // E5
          { pitch: 75, startBeat: 3.5, durationBeats: 0.5, hand: 'right', measure: 2 }, // D#5
        ]
      };

      pieceStore.addPiece(newAiPiece);
      setSimulationLog('BAŞARILI: Parça kütüphaneye "onay bekliyor" statüsüyle eklendi! Kütüphane sekmesinden inceleyip onaylayabilirsiniz.');
      setMcpSimulating(false);
    }, 2200);
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-6 z-10 w-full space-y-8">
      
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-purple-400" />
          Stüdyo Ayarları & MCP Sunucu Entegrasyonu
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Klavye eşlemeleri, ses motoru gecikme ayarları ve yapay zeka (MCP) bağlantısı.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Audio Engine Configuration */}
        <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span>Ses Motoru & Düşük Gecikme</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              Web Audio API (interactive)
            </span>
          </div>

          <div className="space-y-3 text-xs text-zinc-300">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div>
                <div className="font-semibold text-zinc-200">Gecikme Hedefi (&lt; 30 ms)</div>
                <div className="text-[11px] text-zinc-400">Ölçülen gecikme: ~{latency} ms</div>
              </div>
              <button
                onClick={measureLatencyNow}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tekrar Ölç</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <div className="font-semibold text-zinc-200">Sample & Sentez Mimarisi</div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Uygulama açılışta anında ses üreten yüksek kaliteli polifonik akustik piyano motorunu başlatır. Arka planda Salamander Grand Piano yüksek çözünürlüklü akustik örnekleri yüklenir.
              </p>
            </div>
          </div>
        </div>

        {/* MCP (Model Context Protocol) AI Hub */}
        <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Yapay Zeka (MCP) Entegrasyonu</span>
            </h3>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Hazır
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            MCP Sunucusu (Model Context Protocol), Claude veya yerel AI ajanlarının PDF notaları analiz edip kütüphanenize yeni parça eklemesini sağlar.
          </p>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase font-mono">Desteklenen MCP Araçları:</span>
            <div className="flex flex-wrap gap-1.5">
              {['list_pieces', 'get_piece', 'add_piece', 'validate_piece', 'split_sections', 'import_pdf'].map(tool => (
                <span key={tool} className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-purple-300 border border-zinc-700/60">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Test Simulation Button */}
          <div className="space-y-2">
            <button
              onClick={simulateAiMcpImport}
              disabled={mcpSimulating}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 disabled:opacity-50 transition shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2"
            >
              {mcpSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI / MCP İşlemi Çalıştırılıyor...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>AI / MCP Parça Ekleme Akışını Test Et</span>
                </>
              )}
            </button>

            {simulationLog && (
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-purple-500/30 text-xs font-mono text-purple-300">
                {simulationLog}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Keyboard Mapping Reference Grid */}
      <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2 pb-3 border-b border-zinc-800/80">
          <Keyboard className="w-4 h-4 text-cyan-400" />
          <span>Fiziksel Klavye Eşlemesi (KeyboardEvent.code)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 text-xs font-mono">
          {Object.entries(KEY_CODE_OFFSET_MAP).map(([code, offset]) => {
            const label = DISPLAY_KEY_LABELS[code] || code;
            const isBlack = [1, 3, 6, 8, 10, 13, 15, 18].includes(offset);

            return (
              <div 
                key={code}
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  isBlack ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-950 border-zinc-800/90 text-zinc-100'
                }`}
              >
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 font-bold text-emerald-400">{label}</kbd>
                <span className="text-[11px] text-zinc-400 font-sans">
                  {isBlack ? 'Siyah Tuş' : 'Beyaz Tuş'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
          <strong className="text-zinc-200">Not:</strong> Eşleme doğrudan fiziksel tuş donanım kodunu (<code className="text-zinc-300">KeyboardEvent.code</code>) kullandığı için Türkçe Q, Türkçe F veya İngilizce klavyelerin tümünde aynı fiziksel düzende çalışır. <code className="text-zinc-300">Space</code> sustain pedalı, <code className="text-zinc-300">Z</code> ve <code className="text-zinc-300">X</code> tuşları oktav kaydırıcıdır.
        </div>
      </div>

    </div>
  );
};
