// 12 chromatic semitones
const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Map note to semitone index (0 - 11)
const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

/**
 * Transposes a single note by a given number of semitones
 */
export function transposeNote(note: string, semitones: number, preferFlats = false): string {
  const clean = note.trim();
  const index = NOTE_TO_SEMITONE[clean];
  if (index === undefined) return note;

  const newIndex = (index + semitones + 1200) % 12;
  const scale = preferFlats ? FLAT_SCALE : SHARP_SCALE;
  return scale[newIndex];
}

/**
 * Transposes a chord name (including slash chords like D/F#)
 */
export function transposeChord(chord: string, semitones: number, preferFlats?: boolean): string {
  if (!chord || semitones === 0) return chord;

  // Check if it's a slash chord
  if (chord.includes('/')) {
    const [topChord, bassNote] = chord.split('/');
    const transposedTop = transposeChord(topChord, semitones, preferFlats);
    const transposedBass = transposeNote(bassNote, semitones, preferFlats ?? topChord.includes('b'));
    return `${transposedTop}/${transposedBass}`;
  }

  // Regex to separate root note from modifier: e.g. "C#m7" -> root: "C#", modifier: "m7"
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;

  const [, root, modifier] = match;
  // If original had flat, or target key naturally uses flats (e.g. F, Bb, Eb, Ab), prefer flats
  const useFlats = preferFlats !== undefined ? preferFlats : root.includes('b') || modifier.includes('b');
  const transposedRoot = transposeNote(root, semitones, useFlats);

  return `${transposedRoot}${modifier}`;
}

/**
 * Transposes all bracketed chords in a ChordPro text
 */
export function transposeChordProText(text: string, semitones: number): string {
  if (semitones === 0) return text;

  // Determine if the song mostly uses flats
  const flatCount = (text.match(/\[[A-G]b/g) || []).length;
  const sharpCount = (text.match(/\[[A-G]#/g) || []).length;
  const preferFlats = flatCount > sharpCount;

  return text.replace(/\[([A-G][a-zA-Z0-9#b\+\-\/\(\)]*)\]/g, (match, chordName) => {
    // Check if it's a section keyword
    if (/^(Intro|Verse|Chorus|Bridge|Interlude|Outro|Solo|Aメロ|Bメロ|サビ|間奏|前奏|後奏|イントロ|アウトロ)$/i.test(chordName)) {
      return match;
    }
    const newChord = transposeChord(chordName, semitones, preferFlats);
    return `[${newChord}]`;
  });
}

/**
 * Calculates capo position adjustment
 * If original song is played without capo and user puts Capo on N, the chord shapes must be transposed by -N
 */
export function calculateCapoTranspose(fromCapo: number, toCapo: number): number {
  return -(toCapo - fromCapo);
}

// Enharmonic maps for note-level conversion
export const ENHARMONIC_SHARP_TO_FLAT: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
  'E#': 'F',
  'B#': 'C',
};

export const ENHARMONIC_FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
  'Fb': 'E',
  'Cb': 'B',
};

/**
 * Converts a note to sharp or flat spelling
 */
export function convertAccidentalNote(note: string, to: 'sharp' | 'flat'): string {
  const clean = note.trim();
  if (to === 'sharp') {
    return ENHARMONIC_FLAT_TO_SHARP[clean] || clean;
  } else {
    return ENHARMONIC_SHARP_TO_FLAT[clean] || clean;
  }
}

/**
 * Converts a chord (including slash chords like D/F# or C/E) to sharp or flat
 */
export function convertAccidentalChord(chord: string, to: 'sharp' | 'flat'): string {
  if (!chord) return chord;
  if (chord.includes('/')) {
    const [top, bass] = chord.split('/');
    return `${convertAccidentalChord(top, to)}/${convertAccidentalNote(bass, to)}`;
  }
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;
  const [, root, modifier] = match;
  const convertedRoot = convertAccidentalNote(root, to);
  return `${convertedRoot}${modifier}`;
}

/**
 * Converts all bracketed chords in ChordPro text to sharp or flat
 */
export function convertChordProAccidentals(text: string, to: 'sharp' | 'flat'): string {
  if (!text) return text;
  return text.replace(/\[([A-G][a-zA-Z0-9#b\+\-\/\(\)]*)\]/g, (match, chordName) => {
    if (/^(Intro|Verse|Chorus|Bridge|Interlude|Outro|Solo|Aメロ|Bメロ|サビ|間奏|前奏|後奏|イントロ|アウトロ)$/i.test(chordName)) {
      return match;
    }
    return `[${convertAccidentalChord(chordName, to)}]`;
  });
}

/**
 * Detects whether a ChordPro text or Key mostly uses sharps or flats
 */
export function detectAccidentalPreference(content: string, key?: string): 'sharp' | 'flat' {
  if (key) {
    if (key.includes('b')) return 'flat';
    if (key.includes('#')) return 'sharp';
  }
  const flatCount = (content.match(/\[[A-G]b/g) || []).length;
  const sharpCount = (content.match(/\[[A-G]#/g) || []).length;
  return flatCount > sharpCount ? 'flat' : 'sharp';
}
