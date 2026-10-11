import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pieceStore } from '../services/pieceStore.ts';
import { validatePiece } from '../services/pieceValidator.ts';
import { parseMidiFile } from '../services/midiConverter.ts';
import { audioEngine } from '../services/audioEngine.ts';
import { Piece } from '../types/piece.ts';
import { 
  Search, 
  Upload, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Play, 
  Square,
  Sparkles, 
  BookOpen, 
  FileText, 
  AlertTriangle,
  Music,
  Plus
} from 'lucide-react';

interface LibraryProps {
  onSelectPieceForLearn: (pieceId: string) => void;
}

export const Library: React.FC<LibraryProps> = ({ onSelectPieceForLearn }) => {
  const [pieces, setPieces] = useState<Piece[]>(pieceStore.getPieces());
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewingPieceId, setPreviewingPieceId] = useState<string | null>(null);
  const [inspectPiece, setInspectPiece] = useState<Piece | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewTimeoutsRef = useRef<number[]>([]);

  const stopPreview = useCallback(() => {
    previewTimeoutsRef.current.forEach(id => clearTimeout(id));
    previewTimeoutsRef.current = [];
    audioEngine.stopAllNotes();
    setPreviewingPieceId(null);
  }, []);

  // Stop preview on component unmount
  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, [stopPreview]);

  useEffect(() => {
    return pieceStore.subscribe(() => {
      setPieces(pieceStore.getPieces());
    });
  }, []);

  const handleMidiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const buffer = await file.arrayBuffer();
      const newPiece = await parseMidiFile(buffer, file.name);
      pieceStore.addPiece(newPiece);
      setActiveTab('approved');
    } catch (err: any) {
      setUploadError('MIDI dosyası ayrıştırılamadı: ' + (err.message || 'Geçersiz dosya'));
    }
  };

  const handlePreviewPiece = (piece: Piece) => {
    // If clicking the one currently playing, stop it
    if (previewingPieceId === piece.id) {
      stopPreview();
      return;
    }

    // Stop previous preview before starting new one
    stopPreview();
    setPreviewingPieceId(piece.id);

    // Play preview of first 16 notes using playNoteWithDuration
    const previewNotes = piece.notes.slice(0, 16);
    previewNotes.forEach((note) => {
      const delayMs = (note.startBeat * 60 / piece.tempoBpm) * 600;
      const durationSec = Math.max(0.2, (note.durationBeats * 60 / piece.tempoBpm) * 0.9);
      
      const tid = window.setTimeout(() => {
        audioEngine.playNoteWithDuration(note.pitch, durationSec, 0.8, false);
      }, delayMs);
      previewTimeoutsRef.current.push(tid);
    });

    const lastNote = previewNotes[previewNotes.length - 1];
    const totalDuration = ((lastNote?.startBeat || 4) * 60 / piece.tempoBpm) * 600 + 1000;
    
    const endTid = window.setTimeout(() => {
      stopPreview();
    }, totalDuration);
    previewTimeoutsRef.current.push(endTid);
  };

  const filteredPieces = pieces
    .filter(p => p.status === activeTab)
    .filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.composer.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pendingCount = pieces.filter(p => p.status === 'pending').length;

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-6 z-10 w-full space-y-6">
      
      {/* Top Banner & Upload bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Music className="w-6 h-6 text-emerald-400" />
            Parça Kütüphanesi
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Öğrenebileceğiniz parçalar, yapay zekadan gelenler ve yüklenen MIDI dosyaları.
          </p>
        </div>

        {/* Upload MIDI Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mid,.midi"
            onChange={handleMidiUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg shadow-emerald-950/50"
          >
            <Upload className="w-4 h-4" />
            <span>MIDI Parça Yükle (.mid)</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'approved'
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kütüphanedeki Parçalar ({pieces.filter(p => p.status === 'approved').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Onay Bekleyenler ({pendingCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Parça veya besteci ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-zinc-600 transition"
          />
        </div>
      </div>

      {/* Pieces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPieces.map((piece) => {
          const validation = validatePiece(piece);

          return (
            <div
              key={piece.id}
              className="group p-5 rounded-xl bg-zinc-950/70 border border-zinc-800/90 hover:border-zinc-700 transition flex flex-col justify-between shadow-xl backdrop-blur-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                    piece.source === 'pdf-omr' || piece.source === 'ai'
                      ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}>
                    {piece.source}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    piece.difficulty === 'beginner' 
                      ? 'bg-emerald-950 text-emerald-300' 
                      : (piece.difficulty === 'intermediate' ? 'bg-amber-950 text-amber-300' : 'bg-red-950 text-red-300')
                  }`}>
                    {piece.difficulty || 'orta'}
                  </span>
                </div>

                <h3 className="font-bold text-base text-zinc-100 group-hover:text-emerald-300 transition-colors">
                  {piece.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{piece.composer}</p>

                {piece.description && (
                  <p className="text-xs text-zinc-400/80 mt-2 line-clamp-2 leading-relaxed">
                    {piece.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-4 text-[11px] font-mono text-zinc-400">
                  <span>{piece.tempoBpm} BPM</span>
                  <span>•</span>
                  <span>{piece.notes.length} Nota</span>
                  <span>•</span>
                  <span>{piece.key}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handlePreviewPiece(piece)}
                  className={`p-2 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
                    previewingPieceId === piece.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                  }`}
                  title="Kısa Ön Dinleme"
                >
                  {previewingPieceId === piece.id ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                      <span className="text-[11px]">Durdur</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Dinle</span>
                    </>
                  )}
                </button>

                {piece.status === 'pending' ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => pieceStore.approvePiece(piece.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Onayla</span>
                    </button>
                    <button
                      onClick={() => pieceStore.deletePiece(piece.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/60 text-zinc-500 hover:text-red-400 transition"
                      title="Reddet / Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectPieceForLearn(piece.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Öğren</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredPieces.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl bg-zinc-950/40 border border-dashed border-zinc-800">
            <Music className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">Bu filtrede gösterilecek parça bulunamadı.</p>
          </div>
        )}
      </div>

    </div>
  );
};
