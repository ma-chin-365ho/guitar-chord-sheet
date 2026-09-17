export interface ChordDiagramData {
  chord: string; // e.g., "C", "Am7", "F#m7b5"
  baseFret: number; // e.g. 1
  frets: number[]; // 6 strings from 6th (low E) to 1st (high E). -1 for mute (X), 0 for open (O), 1-n for fret number
  fingers?: number[]; // finger numbers (1: index, 2: middle, 3: ring, 4: pinky, 0: none)
  barres?: number[]; // fret numbers where a barre is placed
}

export interface ChordToken {
  type: 'chord';
  chord: string;
}

export interface LyricToken {
  type: 'lyric';
  text: string;
}

export interface ChordPair {
  chord?: string;
  lyric: string;
}

export interface ParsedLine {
  type: 'section' | 'lyrics' | 'empty' | 'comment';
  content?: string;
  sectionTitle?: string;
  pairs?: ChordPair[];
}

export interface SongData {
  id: string;
  title: string;
  artist: string;
  key: string;
  capo: number; // 0 for no capo
  tempo?: number; // BPM
  timeSignature?: string; // e.g., "4/4", "3/4"
  notes?: string;
  content: string; // raw ChordPro text
  updatedAt: number;
}

export type ViewMode = 'dual' | 'edit' | 'view';
export type ColumnLayout = '1col' | '2col';
export type DiagramDisplay = 'none' | 'inline' | 'top' | 'both';
export type AccidentalPreference = 'sharp' | 'flat';
