import { ChordDiagramData } from '../types/chord';

// Standard 6-string guitar chord definitions: [string 6 (E), 5 (A), 4 (D), 3 (G), 2 (B), 1 (e)]
// -1 = mute (x), 0 = open (o), 1+ = fret number
export const CHORD_DATABASE: Record<string, ChordDiagramData> = {
  // C
  'C': { chord: 'C', baseFret: 1, frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'Cm': { chord: 'Cm', baseFret: 3, frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [1] },
  'C7': { chord: 'C7', baseFret: 1, frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  'Cmaj7': { chord: 'Cmaj7', baseFret: 1, frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  'CM7': { chord: 'CM7', baseFret: 1, frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  'Cm7': { chord: 'Cm7', baseFret: 3, frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], barres: [1] },
  'Csus4': { chord: 'Csus4', baseFret: 1, frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },
  'Cadd9': { chord: 'Cadd9', baseFret: 1, frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0] },
  'C/E': { chord: 'C/E', baseFret: 1, frets: [0, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'C/G': { chord: 'C/G', baseFret: 1, frets: [3, 3, 2, 0, 1, 0], fingers: [3, 4, 2, 0, 1, 0] },
  'C/B': { chord: 'C/B', baseFret: 1, frets: [-1, 2, 2, 0, 1, 0], fingers: [0, 2, 3, 0, 1, 0] },

  // C# / Db
  'C#': { chord: 'C#', baseFret: 4, frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [1] },
  'Db': { chord: 'Db', baseFret: 4, frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [1] },
  'C#m': { chord: 'C#m', baseFret: 4, frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [1] },
  'Dbm': { chord: 'Dbm', baseFret: 4, frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [1] },
  'C#7': { chord: 'C#7', baseFret: 4, frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1], barres: [1] },
  'C#m7': { chord: 'C#m7', baseFret: 4, frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], barres: [1] },
  'C#maj7': { chord: 'C#maj7', baseFret: 4, frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [1] },
  'C#M7': { chord: 'C#M7', baseFret: 4, frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [1] },

  // D
  'D': { chord: 'D', baseFret: 1, frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'Dm': { chord: 'Dm', baseFret: 1, frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'D7': { chord: 'D7', baseFret: 1, frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'Dmaj7': { chord: 'Dmaj7', baseFret: 1, frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3] },
  'DM7': { chord: 'DM7', baseFret: 1, frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3] },
  'Dm7': { chord: 'Dm7', baseFret: 1, frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], barres: [1] },
  'Dsus4': { chord: 'Dsus4', baseFret: 1, frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 4] },
  'Dadd9': { chord: 'Dadd9', baseFret: 1, frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0] },
  'D/F#': { chord: 'D/F#', baseFret: 1, frets: [2, 0, 0, 2, 3, 2], fingers: [1, 0, 0, 2, 4, 3] },
  'D/A': { chord: 'D/A', baseFret: 1, frets: [-1, 0, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },

  // D# / Eb
  'D#': { chord: 'D#', baseFret: 6, frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [1] },
  'Eb': { chord: 'Eb', baseFret: 6, frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [1] },
  'D#m': { chord: 'D#m', baseFret: 6, frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [1] },
  'Ebm': { chord: 'Ebm', baseFret: 6, frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [1] },
  'Eb7': { chord: 'Eb7', baseFret: 6, frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1], barres: [1] },
  'Ebm7': { chord: 'Ebm7', baseFret: 6, frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], barres: [1] },
  'Ebmaj7': { chord: 'Ebmaj7', baseFret: 6, frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [1] },
  'EbM7': { chord: 'EbM7', baseFret: 6, frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [1] },

  // E
  'E': { chord: 'E', baseFret: 1, frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'Em': { chord: 'Em', baseFret: 1, frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'E7': { chord: 'E7', baseFret: 1, frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  'Emaj7': { chord: 'Emaj7', baseFret: 1, frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
  'EM7': { chord: 'EM7', baseFret: 1, frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
  'Em7': { chord: 'Em7', baseFret: 1, frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 3, 0] },
  'Esus4': { chord: 'Esus4', baseFret: 1, frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0] },
  'Em/G': { chord: 'Em/G', baseFret: 1, frets: [3, 2, 2, 0, 0, 0], fingers: [3, 1, 2, 0, 0, 0] },

  // F
  'F': { chord: 'F', baseFret: 1, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [1] },
  'Fm': { chord: 'Fm', baseFret: 1, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [1] },
  'F7': { chord: 'F7', baseFret: 1, frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barres: [1] },
  'Fmaj7': { chord: 'Fmaj7', baseFret: 1, frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  'FM7': { chord: 'FM7', baseFret: 1, frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  'Fm7': { chord: 'Fm7', baseFret: 1, frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barres: [1] },
  'Fsus4': { chord: 'Fsus4', baseFret: 1, frets: [1, 3, 3, 3, 1, 1], fingers: [1, 2, 3, 4, 1, 1], barres: [1] },
  'F/G': { chord: 'F/G', baseFret: 1, frets: [3, -1, 3, 2, 1, 1], fingers: [3, 0, 4, 2, 1, 1] },

  // F# / Gb
  'F#': { chord: 'F#', baseFret: 2, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [1] },
  'Gb': { chord: 'Gb', baseFret: 2, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [1] },
  'F#m': { chord: 'F#m', baseFret: 2, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [1] },
  'Gbm': { chord: 'Gbm', baseFret: 2, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [1] },
  'F#7': { chord: 'F#7', baseFret: 2, frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barres: [1] },
  'F#m7': { chord: 'F#m7', baseFret: 2, frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barres: [1] },
  'F#m7b5': { chord: 'F#m7b5', baseFret: 1, frets: [2, -1, 2, 2, 1, -1], fingers: [2, 0, 3, 4, 1, 0] },
  'F#maj7': { chord: 'F#maj7', baseFret: 2, frets: [1, -1, 2, 2, 1, -1], fingers: [1, 0, 3, 4, 2, 0] },

  // G
  'G': { chord: 'G', baseFret: 1, frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'Gm': { chord: 'Gm', baseFret: 3, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [1] },
  'G7': { chord: 'G7', baseFret: 1, frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  'Gmaj7': { chord: 'Gmaj7', baseFret: 1, frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3] },
  'GM7': { chord: 'GM7', baseFret: 1, frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3] },
  'Gm7': { chord: 'Gm7', baseFret: 3, frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barres: [1] },
  'Gsus4': { chord: 'Gsus4', baseFret: 1, frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4] },
  'Gadd9': { chord: 'Gadd9', baseFret: 1, frets: [3, 0, 0, 0, 0, 3], fingers: [1, 0, 0, 0, 0, 2] },
  'G/B': { chord: 'G/B', baseFret: 1, frets: [-1, 2, 0, 0, 0, 3], fingers: [0, 1, 0, 0, 0, 2] },

  // G# / Ab
  'G#': { chord: 'G#', baseFret: 4, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [1] },
  'Ab': { chord: 'Ab', baseFret: 4, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [1] },
  'G#m': { chord: 'G#m', baseFret: 4, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [1] },
  'Abm': { chord: 'Abm', baseFret: 4, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [1] },
  'G#7': { chord: 'G#7', baseFret: 4, frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barres: [1] },
  'G#m7': { chord: 'G#m7', baseFret: 4, frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barres: [1] },

  // A
  'A': { chord: 'A', baseFret: 1, frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Am': { chord: 'Am', baseFret: 1, frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'A7': { chord: 'A7', baseFret: 1, frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] },
  'Amaj7': { chord: 'Amaj7', baseFret: 1, frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
  'AM7': { chord: 'AM7', baseFret: 1, frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
  'Am7': { chord: 'Am7', baseFret: 1, frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  'Asus4': { chord: 'Asus4', baseFret: 1, frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Aadd9': { chord: 'Aadd9', baseFret: 1, frets: [-1, 0, 2, 4, 2, 0], fingers: [0, 0, 1, 3, 2, 0] },
  'Am/G': { chord: 'Am/G', baseFret: 1, frets: [3, 0, 2, 0, 1, 0], fingers: [3, 0, 2, 0, 1, 0] },
  'A/C#': { chord: 'A/C#', baseFret: 2, frets: [-1, 4, 2, 2, 2, -1], fingers: [0, 4, 1, 1, 1, 0], barres: [2] },

  // A# / Bb
  'A#': { chord: 'A#', baseFret: 1, frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [1] },
  'Bb': { chord: 'Bb', baseFret: 1, frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [1] },
  'A#m': { chord: 'A#m', baseFret: 1, frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [1] },
  'Bbm': { chord: 'Bbm', baseFret: 1, frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [1] },
  'Bb7': { chord: 'Bb7', baseFret: 1, frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1], barres: [1] },
  'Bbm7': { chord: 'Bbm7', baseFret: 1, frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], barres: [1] },
  'Bbmaj7': { chord: 'Bbmaj7', baseFret: 1, frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [1] },
  'BbM7': { chord: 'BbM7', baseFret: 1, frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [1] },

  // B
  'B': { chord: 'B', baseFret: 2, frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [1] },
  'Bm': { chord: 'Bm', baseFret: 2, frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [1] },
  'B7': { chord: 'B7', baseFret: 1, frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  'Bmaj7': { chord: 'Bmaj7', baseFret: 2, frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [1] },
  'BM7': { chord: 'BM7', baseFret: 2, frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [1] },
  'Bm7': { chord: 'Bm7', baseFret: 2, frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], barres: [1] },
  'Bm7b5': { chord: 'Bm7b5', baseFret: 1, frets: [-1, 2, 3, 2, 3, -1], fingers: [0, 1, 3, 2, 4, 0] },
  'Bsus4': { chord: 'Bsus4', baseFret: 2, frets: [-1, 1, 3, 3, 4, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [1] },
};

// Common aliases and enhancements
export function getChordDiagram(chordName: string): ChordDiagramData | null {
  if (!chordName) return null;
  const cleanName = chordName.trim();

  // Direct match
  if (CHORD_DATABASE[cleanName]) {
    return CHORD_DATABASE[cleanName];
  }

  // Handle M7 -> maj7 or vice versa
  if (cleanName.includes('maj7')) {
    const m7Name = cleanName.replace('maj7', 'M7');
    if (CHORD_DATABASE[m7Name]) return { ...CHORD_DATABASE[m7Name], chord: cleanName };
  }
  if (cleanName.includes('M7')) {
    const maj7Name = cleanName.replace('M7', 'maj7');
    if (CHORD_DATABASE[maj7Name]) return { ...CHORD_DATABASE[maj7Name], chord: cleanName };
  }

  // Handle enharmonic equivalents: C# -> Db, D# -> Eb, F# -> Gb, G# -> Ab, A# -> Bb
  const enharmonicMap: Record<string, string> = {
    'C#': 'Db', 'Db': 'C#',
    'D#': 'Eb', 'Eb': 'D#',
    'F#': 'Gb', 'Gb': 'F#',
    'G#': 'Ab', 'Ab': 'G#',
    'A#': 'Bb', 'Bb': 'A#',
  };

  for (const [key, val] of Object.entries(enharmonicMap)) {
    if (cleanName.startsWith(key)) {
      const altName = cleanName.replace(key, val);
      if (CHORD_DATABASE[altName]) {
        return { ...CHORD_DATABASE[altName], chord: cleanName };
      }
    }
  }

  // Fallback for slash chord (e.g., C/G -> return C if not found)
  if (cleanName.includes('/')) {
    const baseChord = cleanName.split('/')[0];
    const baseDiagram = getChordDiagram(baseChord);
    if (baseDiagram) {
      return { ...baseDiagram, chord: cleanName };
    }
  }

  return null;
}
