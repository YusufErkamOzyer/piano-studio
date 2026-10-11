import { Piece, ValidationReport } from '../types/piece.ts';

export function validatePiece(piece: Piece): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!piece.notes || piece.notes.length === 0) {
    errors.push('Parçada hiç nota bulunamadı.');
    return {
      isValid: false,
      errors,
      warnings,
      totalMeasures: 0,
      totalNotes: 0,
      pitchRange: [0, 0]
    };
  }

  let minPitch = 127;
  let maxPitch = 0;
  const beatsPerMeasure = (piece.timeSignature[0] * 4) / piece.timeSignature[1];

  // Group notes by measure
  const measureBeatMap = new Map<number, number>();

  piece.notes.forEach((note, index) => {
    // 1. Piano pitch boundaries (21 = A0, 108 = C8)
    if (note.pitch < 21 || note.pitch > 108) {
      errors.push(`Nota #${index + 1}: Perde (${note.pitch}) piyano standart sınırları (21–108) dışında.`);
    }

    if (note.pitch < minPitch) minPitch = note.pitch;
    if (note.pitch > maxPitch) maxPitch = note.pitch;

    // 2. Suspicious durations
    if (note.durationBeats <= 0.05) {
      warnings.push(`Nota #${index + 1} (Pitch: ${note.pitch}): Aşırı kısa süre (${note.durationBeats.toFixed(2)} vuruş), tuş gürültüsü olabilir.`);
    } else if (note.durationBeats > 16) {
      warnings.push(`Nota #${index + 1} (Pitch: ${note.pitch}): Şüpheli derecede uzun süre (${note.durationBeats.toFixed(1)} vuruş).`);
    }

    // 3. Start beats check
    if (note.startBeat < 0) {
      errors.push(`Nota #${index + 1}: Başlangıç vuruşu (${note.startBeat}) negatif olamaz.`);
    }

    // Measure computation
    const measure = note.measure || Math.floor(note.startBeat / beatsPerMeasure) + 1;
    const endBeatInMeasure = (note.startBeat % beatsPerMeasure) + note.durationBeats;
    const currentMax = measureBeatMap.get(measure) || 0;
    if (endBeatInMeasure > currentMax) {
      measureBeatMap.set(measure, endBeatInMeasure);
    }
  });

  // 4. Measure duration overflow check
  measureBeatMap.forEach((maxEndBeat, measure) => {
    if (maxEndBeat > beatsPerMeasure * 1.5) {
      warnings.push(`Ölçü ${measure}: Notalar ölçü süresini aşıyor (${maxEndBeat.toFixed(2)} > ${beatsPerMeasure} vuruş).`);
    }
  });

  const totalMeasures = measureBeatMap.size || Math.ceil(piece.notes[piece.notes.length - 1].startBeat / beatsPerMeasure);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalMeasures,
    totalNotes: piece.notes.length,
    pitchRange: [minPitch, maxPitch]
  };
}
