import { ParsedLine, ChordPair } from '../types/chord';

// Standard section identifiers (English and Japanese)
const SECTION_REGEX = /^\s*\[(Intro|Verse|Chorus|Bridge|Interlude|Outro|Solo|Ending|Aメロ|Bメロ|サビ|間奏|前奏|後奏|イントロ|アウトロ|大サビ|落ちサビ|Cメロ)([\s\d\w\-_]*)\]\s*$/i;

// Regex to identify if a line consists only of chords and spaces/delimiters like |, /, -
const CHORD_ONLY_CHARS = /^[A-Ga-g0-9#b\+\-\/msuadjdimaugM\s\|\[\]\(\)\.\:\,\-]+$/;

// Regex to match chord tokens in text like [C] or [Am7/G]
const INLINE_CHORD_REGEX = /\[([A-G][a-zA-Z0-9#b\+\/\(\)]*)\]/g;

/**
 * Parses raw ChordPro text into structured lines for display
 */
export function parseChordPro(text: string): ParsedLine[] {
  const lines = text.split('\n');
  const parsedLines: ParsedLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line
    if (!trimmed) {
      parsedLines.push({ type: 'empty' });
      continue;
    }

    // Comment line or directive like {comment: ...} or # comment
    if (trimmed.startsWith('#') || trimmed.startsWith('{c:') || trimmed.startsWith('{comment:')) {
      const commentText = trimmed.replace(/^\{c(omment)?:\s*|\}$|^#\s*/g, '');
      parsedLines.push({ type: 'comment', content: commentText });
      continue;
    }

    // Section header like [Intro], [サビ], [Verse 1]
    const sectionMatch = trimmed.match(SECTION_REGEX);
    if (sectionMatch) {
      const sectionName = trimmed.replace(/^\[|\]$/g, '');
      parsedLines.push({ type: 'section', sectionTitle: sectionName });
      continue;
    }

    // Check if the line has chord brackets [C] etc.
    if (rawLine.includes('[') && rawLine.includes(']')) {
      const pairs: ChordPair[] = [];
      let lastIndex = 0;
      let currentChord: string | undefined = undefined;

      // Extract parts
      const regex = /\[([A-Za-z0-9#b\+\-\/\(\)]+)\]/g;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(rawLine)) !== null) {
        const chordName = match[1];
        const matchStart = match.index;

        // Any lyric before this chord?
        if (matchStart > lastIndex) {
          const lyricBefore = rawLine.slice(lastIndex, matchStart);
          pairs.push({ chord: currentChord, lyric: lyricBefore });
          currentChord = undefined;
        }

        currentChord = chordName;
        lastIndex = regex.lastIndex;
      }

      // Remaining lyric after the last chord
      const remainingLyric = rawLine.slice(lastIndex);
      pairs.push({ chord: currentChord, lyric: remainingLyric || '' });

      // Clean up pairs
      const validPairs = pairs.filter((p) => (p.chord && p.chord.length > 0) || p.lyric.length > 0);

      parsedLines.push({
        type: 'lyrics',
        pairs: validPairs.length > 0 ? validPairs : [{ lyric: rawLine }],
      });
      continue;
    }

    // Plain text line without chords
    parsedLines.push({
      type: 'lyrics',
      pairs: [{ lyric: rawLine }],
    });
  }

  return parsedLines;
}

/**
 * Converts a 2-line format (Line 1: chords, Line 2: lyrics) into ChordPro format
 */
export function convertTwoLineToChordPro(input: string): string {
  const lines = input.split('\n');
  const resultLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const trimmed = currentLine.trim();

    if (!trimmed) {
      resultLines.push('');
      continue;
    }

    // If already a section or directive
    if (trimmed.match(SECTION_REGEX) || trimmed.startsWith('#') || trimmed.startsWith('{')) {
      resultLines.push(currentLine);
      continue;
    }

    // Check if next line exists and current line looks like chord line
    const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
    const isChordLine = isProbableChordLine(currentLine);

    if (isChordLine && nextLine !== null && !isProbableChordLine(nextLine) && nextLine.trim().length > 0) {
      // Merge currentLine (chords) into nextLine (lyrics)
      const merged = mergeChordAndLyricLines(currentLine, nextLine);
      resultLines.push(merged);
      i++; // Skip nextLine as it is consumed
    } else if (isChordLine) {
      // Standalone chord line (e.g., intro chords | C | G | Am | F |)
      // Wrap bare chords with brackets
      const bracketed = bracketBareChords(currentLine);
      resultLines.push(bracketed);
    } else {
      // Normal lyric line without chords
      resultLines.push(currentLine);
    }
  }

  return resultLines.join('\n');
}

/**
 * Checks if a string looks like a line containing guitar chords
 */
export function isProbableChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Split by whitespace
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  // Match typical chord patterns: C, Am, F#m7, Bb/D, Gsus4, etc.
  const chordPattern = /^[A-G][b#]?(m|maj|min|M|dim|aug|sus|add)?[0-9]*(\/[A-G][b#]?)?$/;

  let chordCount = 0;
  for (const token of tokens) {
    const cleanToken = token.replace(/[\|\(\)\,\:\-]/g, '');
    if (cleanToken && chordPattern.test(cleanToken)) {
      chordCount++;
    }
  }

  return chordCount / tokens.length >= 0.5;
}

/**
 * Merges a chord line and a lyric line based on character positions
 */
function mergeChordAndLyricLines(chordLine: string, lyricLine: string): string {
  const chordRegex = /[A-G][b#]?(m|maj|min|M|dim|aug|sus|add)?[0-9]*(\/[A-G][b#]?)?/g;
  const chords: { index: number; chord: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = chordRegex.exec(chordLine)) !== null) {
    chords.push({ index: match.index, chord: match[0] });
  }

  if (chords.length === 0) {
    return lyricLine;
  }

  let result = '';
  let lyricIndex = 0;

  for (const item of chords) {
    // Append lyrics up to this chord position
    if (item.index > lyricIndex) {
      result += lyricLine.slice(lyricIndex, item.index);
      lyricIndex = item.index;
    }
    result += `[${item.chord}]`;
  }

  // Append remaining lyrics
  if (lyricIndex < lyricLine.length) {
    result += lyricLine.slice(lyricIndex);
  }

  return result;
}

/**
 * Wraps bare chords in [ ]
 */
function bracketBareChords(line: string): string {
  const chordRegex = /\b([A-G][b#]?(m|maj|min|M|dim|aug|sus|add)?[0-9]*(\/[A-G][b#]?)?)\b/g;
  return line.replace(chordRegex, '[$1]');
}

/**
 * Extracts all unique chord names from ChordPro text
 */
export function extractUniqueChords(text: string): string[] {
  const matches = text.match(INLINE_CHORD_REGEX);
  if (!matches) return [];

  const unique = new Set<string>();
  for (const match of matches) {
    const chord = match.slice(1, -1).trim();
    if (chord && !isSectionTag(chord)) {
      unique.add(chord);
    }
  }

  return Array.from(unique);
}

function isSectionTag(name: string): boolean {
  return /^(Intro|Verse|Chorus|Bridge|Interlude|Outro|Solo|Ending|Aメロ|Bメロ|サビ|間奏|前奏|後奏|イントロ|アウトロ)/i.test(name);
}

/**
 * Serializes structured ParsedLine array back into ChordPro string
 */
export function stringifyChordPro(lines: ParsedLine[]): string {
  const result: string[] = [];

  for (const line of lines) {
    if (line.type === 'empty') {
      result.push('');
    } else if (line.type === 'comment') {
      result.push(`# ${line.content || ''}`);
    } else if (line.type === 'section') {
      result.push(`[${line.sectionTitle || 'Section'}]`);
    } else if (line.type === 'lyrics' && line.pairs) {
      let lineText = '';
      for (const pair of line.pairs) {
        if (pair.chord) {
          lineText += `[${pair.chord}]`;
        }
        lineText += pair.lyric || '';
      }
      result.push(lineText);
    }
  }

  return result.join('\n');
}

