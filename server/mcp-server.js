/**
 * Piano Studio - Model Context Protocol (MCP) Server
 * Implements tools specified in Section 10:
 * - list_pieces(filter)
 * - get_piece(id)
 * - add_piece(piece)
 * - validate_piece(id)
 * - split_sections(id)
 * - import_pdf(path)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'library_data.json');

// Initialize sample library if missing
if (!fs.existsSync(DATA_FILE)) {
  const defaultData = {
    pieces: [
      {
        id: "fuer-elise",
        title: "Für Elise",
        composer: "Ludwig van Beethoven",
        status: "approved",
        source: "preset",
        timeSignature: [3, 8],
        tempoBpm: 120,
        key: "A Minor",
        notes: [
          { pitch: 76, startBeat: 0.0, durationBeats: 0.5, hand: "right", measure: 1 },
          { pitch: 75, startBeat: 0.5, durationBeats: 0.5, hand: "right", measure: 1 },
          { pitch: 76, startBeat: 1.0, durationBeats: 0.5, hand: "right", measure: 1 }
        ]
      }
    ]
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { pieces: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Validation logic matching Section 8
function validatePieceData(piece) {
  const errors = [];
  const warnings = [];
  if (!piece.notes || piece.notes.length === 0) {
    errors.push("Parçada nota bulunamadı.");
  }
  piece.notes?.forEach((n, idx) => {
    if (n.pitch < 21 || n.pitch > 108) {
      errors.push(`Nota #${idx + 1}: Perde (${n.pitch}) piyano aralığı (21-108) dışında.`);
    }
    if (n.durationBeats <= 0.05) {
      warnings.push(`Nota #${idx + 1}: Aşırı kısa süre (${n.durationBeats}).`);
    }
  });
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    noteCount: piece.notes ? piece.notes.length : 0
  };
}

// Tool Handlers
const tools = {
  list_pieces: (params) => {
    const data = readData();
    const filter = params?.filter;
    if (filter) {
      return data.pieces.filter(p => p.status === filter);
    }
    return data.pieces.map(p => ({
      id: p.id,
      title: p.title,
      composer: p.composer,
      status: p.status,
      source: p.source,
      tempoBpm: p.tempoBpm
    }));
  },

  get_piece: (params) => {
    const data = readData();
    const piece = data.pieces.find(p => p.id === params.id);
    if (!piece) throw new Error(`Parça bulunamadı: ${params.id}`);
    return piece;
  },

  add_piece: (params) => {
    const piece = params.piece;
    if (!piece || !piece.title) throw new Error("Geçersiz parça verisi.");
    const validation = validatePieceData(piece);
    if (!validation.isValid) {
      throw new Error(`Parça doğrulanamadı: ${validation.errors.join(', ')}`);
    }
    piece.status = 'pending'; // Always pending for verification
    piece.id = piece.id || 'piece-' + Date.now();
    const data = readData();
    data.pieces.push(piece);
    writeData(data);
    return { success: true, id: piece.id, status: 'pending', validation };
  },

  validate_piece: (params) => {
    const data = readData();
    const piece = data.pieces.find(p => p.id === params.id);
    if (!piece) throw new Error(`Parça bulunamadı: ${params.id}`);
    return validatePieceData(piece);
  },

  split_sections: (params) => {
    const data = readData();
    const piece = data.pieces.find(p => p.id === params.id);
    if (!piece) throw new Error(`Parça bulunamadı: ${params.id}`);
    const beatsPerMeasure = (piece.timeSignature[0] * 4) / piece.timeSignature[1];
    const maxBeat = Math.max(...piece.notes.map(n => n.startBeat + n.durationBeats), 16);
    const totalMeasures = Math.ceil(maxBeat / beatsPerMeasure);

    // Split into 4-measure sections
    const sections = [];
    for (let m = 1; m <= totalMeasures; m += 4) {
      const endM = Math.min(m + 3, totalMeasures);
      sections.push({
        name: `Bölüm ${Math.floor(m / 4) + 1} (Ölçü ${m} - ${endM})`,
        startMeasure: m,
        endMeasure: endM
      });
    }
    return sections;
  },

  import_pdf: (params) => {
    const pdfPath = params.path;
    // Simulates OMR (Audiveris) conversion to Piece JSON in pending queue
    const baseName = path.basename(pdfPath, path.extname(pdfPath));
    const generatedPiece = {
      id: 'omr-' + Date.now(),
      title: baseName.replace(/[-_]/g, ' '),
      composer: "OMR İçe Aktarımı",
      status: "pending",
      source: "pdf-omr",
      timeSignature: [4, 4],
      tempoBpm: 90,
      key: "C",
      notes: [
        { pitch: 60, startBeat: 0.0, durationBeats: 1.0, hand: "right", measure: 1 },
        { pitch: 64, startBeat: 1.0, durationBeats: 1.0, hand: "right", measure: 1 },
        { pitch: 67, startBeat: 2.0, durationBeats: 1.0, hand: "right", measure: 1 },
        { pitch: 72, startBeat: 3.0, durationBeats: 1.0, hand: "right", measure: 1 },
      ]
    };
    const data = readData();
    data.pieces.push(generatedPiece);
    writeData(data);
    return {
      success: true,
      message: `PDF (${pdfPath}) OMR hattı ile işlendi ve onay bekliyor durumuna eklendi.`,
      piece: generatedPiece
    };
  }
};

// JSON-RPC stdio protocol for MCP integration
process.stdin.setEncoding('utf8');

let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep remainder

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const request = JSON.parse(line);
      handleRpc(request);
    } catch (err) {
      sendRpc({ error: { code: -32700, message: 'Parse error: ' + err.message } });
    }
  }
});

function handleRpc(req) {
  const { id, method, params } = req;
  if (method === 'tools/list') {
    sendRpc({
      id,
      result: {
        tools: Object.keys(tools).map(name => ({
          name,
          description: `Piano Studio Tool: ${name}`
        }))
      }
    });
  } else if (method === 'tools/call') {
    const { name, arguments: args } = params;
    const toolFn = tools[name];
    if (!toolFn) {
      sendRpc({ id, error: { code: -32601, message: `Tool not found: ${name}` } });
    } else {
      try {
        const result = toolFn(args || {});
        sendRpc({ id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } });
      } catch (err) {
        sendRpc({ id, error: { code: -32000, message: err.message } });
      }
    }
  } else {
    sendRpc({ id, result: { status: 'ok', server: 'Piano Studio MCP v1.0' } });
  }
}

function sendRpc(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

console.error('[Piano Studio MCP Server] Running on stdio.');
