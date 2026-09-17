import React, { useState, useMemo } from 'react';
import { SongData, ColumnLayout, DiagramDisplay, ParsedLine, ChordPair, AccidentalPreference } from '../types/chord';
import { parseChordPro, extractUniqueChords, stringifyChordPro } from '../utils/chordParser';
import { ChordDiagram } from './ChordDiagram';
import { ChordPickerPopover } from './ChordPickerPopover';
import { Plus, Trash2, Tag, Music, Edit2, GripVertical, GripHorizontal } from 'lucide-react';

interface SheetViewerProps {
  song: SongData;
  columnLayout: ColumnLayout;
  diagramDisplay: DiagramDisplay;
  accidentalPreference?: AccidentalPreference;
  onUpdateSong: (updated: Partial<SongData>) => void;
}

interface ActivePopoverState {
  lineIndex: number;
  pairIndex: number;
  isNew?: boolean;
  initialChord?: string;
  position: { top: number; left: number };
}

interface DraggedItemInfo {
  type: 'chord' | 'lyric';
  sourceLineIndex: number;
  sourcePairIndex: number;
  value: string;
}

export const SheetViewer: React.FC<SheetViewerProps> = ({
  song,
  columnLayout,
  diagramDisplay,
  accidentalPreference = 'sharp',
  onUpdateSong,
}) => {
  // Parse lines directly from song.content
  const parsedLines: ParsedLine[] = useMemo(() => {
    return parseChordPro(song.content);
  }, [song.content]);

  // Unique chords in current song
  const uniqueChords = useMemo(() => {
    return extractUniqueChords(song.content);
  }, [song.content]);

  // Popover state
  const [popover, setPopover] = useState<ActivePopoverState | null>(null);

  // Drag and Drop state (Chords & Lyrics)
  const [draggedItem, setDraggedItem] = useState<DraggedItemInfo | null>(null);
  const [dropTarget, setDropTarget] = useState<{ lineIndex: number; pairIndex: number } | null>(null);

  // Drag and Drop state (Sections)
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [dropTargetSection, setDropTargetSection] = useState<{
    lineIndex: number;
    position: 'before' | 'after';
  } | null>(null);

  // Helper to get line range of a section
  const getSectionRange = (lines: ParsedLine[], secLineIndex: number) => {
    const startIndex = secLineIndex;
    let endIndex = secLineIndex;
    for (let i = secLineIndex + 1; i < lines.length; i++) {
      if (lines[i].type === 'section') {
        break;
      }
      endIndex = i;
    }
    return { startIndex, endIndex };
  };

  // Move a whole section chunk
  const handleSectionDrop = (targetSecIndex: number, position: 'before' | 'after') => {
    if (draggedSectionIndex === null || draggedSectionIndex === targetSecIndex) {
      setDraggedSectionIndex(null);
      setDropTargetSection(null);
      return;
    }

    const newLines = [...parsedLines];
    const sourceRange = getSectionRange(newLines, draggedSectionIndex);
    const sectionChunk = newLines.slice(sourceRange.startIndex, sourceRange.endIndex + 1);

    // Remove source section chunk
    newLines.splice(sourceRange.startIndex, sectionChunk.length);

    // Calculate new target index after removal
    let adjustedTargetIndex = targetSecIndex;
    if (draggedSectionIndex < targetSecIndex) {
      adjustedTargetIndex -= sectionChunk.length;
    }

    if (position === 'after') {
      const targetRange = getSectionRange(newLines, adjustedTargetIndex);
      newLines.splice(targetRange.endIndex + 1, 0, ...sectionChunk);
    } else {
      newLines.splice(adjustedTargetIndex, 0, ...sectionChunk);
    }

    commitLines(newLines);
    setDraggedSectionIndex(null);
    setDropTargetSection(null);
  };

  // Editing metadata
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingArtist, setEditingArtist] = useState(false);

  // Commit updated lines back to song.content
  const commitLines = (newLines: ParsedLine[]) => {
    const serialized = stringifyChordPro(newLines);
    onUpdateSong({ content: serialized });
  };

  // Drag handlers
  const handleDragStart = (
    e: React.DragEvent,
    type: 'chord' | 'lyric',
    lineIndex: number,
    pairIndex: number,
    value: string
  ) => {
    e.dataTransfer.setData('text/plain', value);
    e.dataTransfer.setData('application/type', type);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ type, sourceLineIndex: lineIndex, sourcePairIndex: pairIndex, value });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, lineIndex: number, pairIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTarget?.lineIndex !== lineIndex || dropTarget?.pairIndex !== pairIndex) {
      setDropTarget({ lineIndex, pairIndex });
    }
  };

  const handleDragLeave = (e: React.DragEvent, lineIndex: number, pairIndex: number) => {
    if (dropTarget?.lineIndex === lineIndex && dropTarget?.pairIndex === pairIndex) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetLineIndex: number, targetPairIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { type, sourceLineIndex, sourcePairIndex, value } = draggedItem;
    if (sourceLineIndex === targetLineIndex && sourcePairIndex === targetPairIndex) {
      setDraggedItem(null);
      setDropTarget(null);
      return;
    }

    const newLines = [...parsedLines];
    const sourceLine = newLines[sourceLineIndex];
    const targetLine = newLines[targetLineIndex];

    if (sourceLine?.pairs && targetLine?.pairs) {
      const sourcePairs = [...sourceLine.pairs];
      const targetPairs = sourceLineIndex === targetLineIndex ? sourcePairs : [...targetLine.pairs];

      if (type === 'chord') {
        const targetExistingChord = targetPairs[targetPairIndex]?.chord;

        // Move dragged chord to target
        targetPairs[targetPairIndex] = {
          ...targetPairs[targetPairIndex],
          chord: value,
        };

        // Put previous target chord into source (swap) or remove from source
        sourcePairs[sourcePairIndex] = {
          ...sourcePairs[sourcePairIndex],
          chord: targetExistingChord,
        };
      } else if (type === 'lyric') {
        const targetExistingLyric = targetPairs[targetPairIndex]?.lyric;

        // Move dragged lyric to target
        targetPairs[targetPairIndex] = {
          ...targetPairs[targetPairIndex],
          lyric: value,
        };

        // Put previous target lyric into source (swap)
        sourcePairs[sourcePairIndex] = {
          ...sourcePairs[sourcePairIndex],
          lyric: targetExistingLyric || '',
        };
      }

      newLines[sourceLineIndex] = { ...sourceLine, pairs: sourcePairs };
      if (sourceLineIndex !== targetLineIndex) {
        newLines[targetLineIndex] = { ...targetLine, pairs: targetPairs };
      }

      commitLines(newLines);
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  // Open chord picker on an existing chord
  const handleChordClick = (e: React.MouseEvent, lineIndex: number, pairIndex: number, currentChord?: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    setPopover({
      lineIndex,
      pairIndex,
      initialChord: currentChord,
      position: {
        top: rect.bottom + scrollY + 4,
        left: rect.left + scrollX,
      },
    });
  };

  // Open chord picker to add a chord above a lyric pair that currently has none
  const handleAddChordAboveLyric = (e: React.MouseEvent, lineIndex: number, pairIndex: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const defaultDisplayChord = 'C';
    setPopover({
      lineIndex,
      pairIndex,
      isNew: true,
      initialChord: defaultDisplayChord,
      position: {
        top: rect.bottom + scrollY + 4,
        left: rect.left + scrollX,
      },
    });
  };

  // Handle double clicking anywhere on a lyric input to insert a chord at that exact position
  const handleLyricDoubleClick = (
    e: React.MouseEvent<HTMLInputElement>,
    lineIndex: number,
    pairIndex: number
  ) => {
    e.stopPropagation();
    const input = e.currentTarget;
    const clickPos = input.selectionStart ?? 0;
    const currentText = input.value;

    const newLines = [...parsedLines];
    const targetLine = newLines[lineIndex];
    if (!targetLine || targetLine.type !== 'lyrics' || !targetLine.pairs) return;

    const currentPairs = [...targetLine.pairs];
    const currentPair = currentPairs[pairIndex];
    if (!currentPair) return;

    const rect = input.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const baseChordToSave = 'C';

    // Case 1: The pair has NO chord yet, and click is at start or short string
    if (!currentPair.chord && (clickPos === 0 || currentText.trim().length <= 1)) {
      currentPairs[pairIndex] = { ...currentPair, chord: baseChordToSave };
      newLines[lineIndex] = { ...targetLine, pairs: currentPairs };
      commitLines(newLines);

      setPopover({
        lineIndex,
        pairIndex,
        isNew: true,
        initialChord: 'C',
        position: {
          top: rect.bottom + scrollY + 4,
          left: rect.left + scrollX,
        },
      });
      return;
    }

    // Case 2: Split text at click position
    // e.g. "カントリーロード" -> "カントリー" and "[C]ロード"
    const splitIndex = clickPos > 0 && clickPos < currentText.length ? clickPos : 0;

    if (splitIndex > 0) {
      const beforeText = currentText.slice(0, splitIndex);
      const afterText = currentText.slice(splitIndex);

      const updatedFirstPair = { ...currentPair, lyric: beforeText };
      const newSecondPair = { chord: baseChordToSave, lyric: afterText };

      currentPairs.splice(pairIndex, 1, updatedFirstPair, newSecondPair);
      newLines[lineIndex] = { ...targetLine, pairs: currentPairs };
      commitLines(newLines);

      const approxCharWidth = 14;
      const leftOffset = Math.min(rect.width - 20, splitIndex * approxCharWidth);

      setPopover({
        lineIndex,
        pairIndex: pairIndex + 1,
        isNew: true,
        initialChord: 'C',
        position: {
          top: rect.bottom + scrollY + 4,
          left: rect.left + scrollX + leftOffset,
        },
      });
    } else {
      // Insert right before
      const newPair = { chord: baseChordToSave, lyric: ' ' };
      currentPairs.splice(pairIndex, 0, newPair);
      newLines[lineIndex] = { ...targetLine, pairs: currentPairs };
      commitLines(newLines);

      setPopover({
        lineIndex,
        pairIndex,
        isNew: true,
        initialChord: 'C',
        position: {
          top: rect.bottom + scrollY + 4,
          left: rect.left + scrollX,
        },
      });
    }
  };

  // Handle double clicking on the empty space of a line
  const handleWrapperDoubleClick = (e: React.MouseEvent, lineIndex: number) => {
    if (e.target !== e.currentTarget) return;
    handleAddChordPairToEndOfLine(e, lineIndex);
  };

  // Insert chord into specific pair
  const handleApplyChord = (newChord: string) => {
    if (!popover) return;
    const { lineIndex, pairIndex } = popover;
    const newLines = [...parsedLines];
    const targetLine = newLines[lineIndex];

    if (targetLine && targetLine.type === 'lyrics' && targetLine.pairs) {
      const newPairs = [...targetLine.pairs];
      const targetPair = newPairs[pairIndex];
      if (targetPair) {
        newPairs[pairIndex] = { ...targetPair, chord: newChord };
        newLines[lineIndex] = { ...targetLine, pairs: newPairs };
        commitLines(newLines);
      }
    }
    setPopover(null);
  };

  // Delete chord from pair
  const handleDeleteChord = () => {
    if (!popover) return;
    const { lineIndex, pairIndex } = popover;
    const newLines = [...parsedLines];
    const targetLine = newLines[lineIndex];

    if (targetLine && targetLine.type === 'lyrics' && targetLine.pairs) {
      const newPairs = [...targetLine.pairs];
      const targetPair = newPairs[pairIndex];
      if (targetPair) {
        newPairs[pairIndex] = { ...targetPair, chord: undefined };
        newLines[lineIndex] = { ...targetLine, pairs: newPairs };
        commitLines(newLines);
      }
    }
    setPopover(null);
  };

  // Edit lyric text directly in pair
  const handleLyricChange = (lineIndex: number, pairIndex: number, newText: string) => {
    const newLines = [...parsedLines];
    const targetLine = newLines[lineIndex];

    if (targetLine && targetLine.type === 'lyrics' && targetLine.pairs) {
      const newPairs = [...targetLine.pairs];
      newPairs[pairIndex] = { ...newPairs[pairIndex], lyric: newText };
      newLines[lineIndex] = { ...targetLine, pairs: newPairs };
      commitLines(newLines);
    }
  };

  // Split pair at cursor or append new chord-lyric block
  const handleAddChordPairToEndOfLine = (e: React.MouseEvent, lineIndex: number) => {
    e.stopPropagation();
    const newLines = [...parsedLines];
    const targetLine = newLines[lineIndex];

    if (targetLine && targetLine.type === 'lyrics' && targetLine.pairs) {
      const newPairs = [...targetLine.pairs, { chord: 'C', lyric: ' ' }];
      newLines[lineIndex] = { ...targetLine, pairs: newPairs };
      commitLines(newLines);

      // Open popover for this new chord immediately
      const rect = e.currentTarget.getBoundingClientRect();
      setPopover({
        lineIndex,
        pairIndex: newPairs.length - 1,
        initialChord: 'C',
        position: {
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX - 60,
        },
      });
    }
  };

  // Add new line
  const handleAddLine = (indexAfter: number) => {
    const newLines = [...parsedLines];
    newLines.splice(indexAfter + 1, 0, {
      type: 'lyrics',
      pairs: [{ chord: 'C', lyric: '' }],
    });
    commitLines(newLines);
  };

  // Add new section
  const handleAddSection = (indexAfter: number, title = '') => {
    const newLines = [...parsedLines];
    newLines.splice(indexAfter + 1, 0, {
      type: 'section',
      sectionTitle: title,
    });
    commitLines(newLines);
  };

  // Delete line
  const handleDeleteLine = (lineIndex: number) => {
    const newLines = [...parsedLines];
    newLines.splice(lineIndex, 1);
    commitLines(newLines);
  };

  // Update section title
  const handleSectionTitleChange = (lineIndex: number, newTitle: string) => {
    const newLines = [...parsedLines];
    newLines[lineIndex] = { ...newLines[lineIndex], sectionTitle: newTitle };
    commitLines(newLines);
  };

  return (
    <div className="sheet-panel">
      {/* Sheet Header (Interactive) */}
      <div className="sheet-header">
        {editingTitle ? (
          <input
            type="text"
            className="sheet-title-input"
            value={song.title}
            onChange={(e) => onUpdateSong({ title: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
            autoFocus
            placeholder="曲名を入力"
          />
        ) : (
          <h1
            className="sheet-title editable-hover"
            onClick={() => setEditingTitle(true)}
            title="クリックして曲名を編集"
          >
            {song.title || '無題の楽曲'}
            <Edit2 size={16} className="edit-icon-hint no-print" />
          </h1>
        )}

        <div className="sheet-meta">
          {/* Artist */}
          <div className="sheet-meta-item">
            <span>Artist: </span>
            {editingArtist ? (
              <input
                type="text"
                className="meta-input"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}
                value={song.artist}
                onChange={(e) => onUpdateSong({ artist: e.target.value })}
                onBlur={() => setEditingArtist(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingArtist(false)}
                autoFocus
                placeholder="アーティスト名"
              />
            ) : (
              <strong
                className="editable-hover"
                onClick={() => setEditingArtist(true)}
                title="クリックしてアーティストを編集"
              >
                {song.artist || '(未設定)'}
              </strong>
            )}
          </div>

          {/* Key */}
          <div className="sheet-meta-item">
            <span>Key: </span>
            <select
              className="inline-meta-input key-select"
              value={song.key}
              onChange={(e) => onUpdateSong({ key: e.target.value })}
              title="Keyを選択"
              style={{ cursor: 'pointer', paddingRight: '0.2rem' }}
            >
              {/* Custom key if not in standard list */}
              {song.key && 
                !(accidentalPreference === 'flat'
                  ? [
                      'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
                      'Am', 'Bbm', 'Bm', 'Cm', 'Dbm', 'Dm', 'Ebm', 'Em', 'Fm', 'Gbm', 'Gm', 'Abm'
                    ]
                  : [
                      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
                      'Am', 'A#m', 'Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m'
                    ]
                ).includes(song.key) && (
                <option value={song.key}>{song.key}</option>
              )}
              <optgroup label="メジャー (Major)">
                {(accidentalPreference === 'flat'
                  ? ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
                  : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
                ).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </optgroup>
              <optgroup label="マイナー (Minor)">
                {(accidentalPreference === 'flat'
                  ? ['Am', 'Bbm', 'Bm', 'Cm', 'Dbm', 'Dm', 'Ebm', 'Em', 'Fm', 'Gbm', 'Gm', 'Abm']
                  : ['Am', 'A#m', 'Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m']
                ).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Capo */}
          <div className="sheet-meta-item">
            <span>Capo: </span>
            <div className="counter-control">
              <button
                className="counter-btn"
                onClick={() => onUpdateSong({ capo: Math.max(0, song.capo - 1) })}
                title="カポを下げる (-1)"
              >
                -
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={song.capo}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                  const parsed = sanitized === '' ? 0 : parseInt(sanitized, 10);
                  onUpdateSong({ capo: Math.min(15, Math.max(0, parsed)) });
                }}
                style={{
                  width: '32px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-main)',
                  padding: 0,
                  outline: 'none',
                }}
                title="カポ位置 (0〜15、直接入力可)"
              />
              <button
                className="counter-btn"
                onClick={() => onUpdateSong({ capo: Math.min(15, song.capo + 1) })}
                title="カポを上げる (+1)"
              >
                +
              </button>
            </div>
          </div>

          {/* BPM */}
          <div className="sheet-meta-item">
            <span>BPM: </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={song.tempo !== undefined ? String(song.tempo) : ''}
              onKeyDown={(e) => {
                // Allow navigation and shortcut keys
                if (
                  [
                    'Backspace',
                    'Tab',
                    'Enter',
                    'Escape',
                    'ArrowLeft',
                    'ArrowRight',
                    'ArrowUp',
                    'ArrowDown',
                    'Delete',
                    'Home',
                    'End',
                  ].includes(e.key) ||
                  e.ctrlKey ||
                  e.metaKey
                ) {
                  return;
                }
                // Disallow any non-numeric key
                if (!/^[0-9]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                // Filter out non-numeric characters (handles paste & IME) and limit to 3 digits
                const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                const val = digitsOnly === '' ? undefined : parseInt(digitsOnly, 10);
                onUpdateSong({ tempo: val });
              }}
              placeholder="80"
              className="inline-meta-input"
              style={{ width: '55px' }}
              title="BPMを入力 (数字のみ)"
            />
          </div>
        </div>
      </div>

      {/* Top Diagrams Bar */}
      {(diagramDisplay === 'top' || diagramDisplay === 'both') && uniqueChords.length > 0 && (
        <div className="sheet-diagrams-bar">
          {uniqueChords.map((chord) => (
            <div key={chord} className="diagram-item">
              <ChordDiagram chord={chord} width={82} height={66} />
            </div>
          ))}
        </div>
      )}

      {/* Lyrics & Chords Content (WYSIWYG Editable) */}
      <div className={`sheet-content ${columnLayout === '2col' ? 'layout-2col' : ''}`}>
        {parsedLines.map((line, lineIndex) => {
          // Section header
          if (line.type === 'section') {
            const isDropTargetThisSection = dropTargetSection?.lineIndex === lineIndex;
            const isDraggingThisSection = draggedSectionIndex === lineIndex;

            return (
              <div
                key={`sec-${lineIndex}`}
                className={`section-row group-hover-parent ${
                  isDropTargetThisSection
                    ? dropTargetSection.position === 'before'
                      ? 'section-drop-before'
                      : 'section-drop-after'
                    : ''
                } ${isDraggingThisSection ? 'section-is-dragging' : ''}`}
                onDragOver={(e) => {
                  if (draggedSectionIndex === null) return;
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const isAfter = e.clientY > rect.top + rect.height / 2;
                  setDropTargetSection({ lineIndex, position: isAfter ? 'after' : 'before' });
                }}
                onDragLeave={() => {
                  if (dropTargetSection?.lineIndex === lineIndex) {
                    setDropTargetSection(null);
                  }
                }}
                onDrop={(e) => {
                  if (draggedSectionIndex === null) return;
                  e.preventDefault();
                  e.stopPropagation();
                  if (dropTargetSection) {
                    handleSectionDrop(dropTargetSection.lineIndex, dropTargetSection.position);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {/* Section Drag Handle */}
                  <div
                    className="section-drag-handle no-print"
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', `section-${lineIndex}`);
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggedSectionIndex(lineIndex);
                    }}
                    onDragEnd={() => {
                      setDraggedSectionIndex(null);
                      setDropTargetSection(null);
                    }}
                    title="ドラッグしてこのセクション全体を移動"
                  >
                    <GripVertical size={16} />
                  </div>

                  <input
                    type="text"
                    className="section-badge-input"
                    value={line.sectionTitle || ''}
                    onChange={(e) => handleSectionTitleChange(lineIndex, e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === 'Escape') && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                        e.currentTarget.blur();
                      }
                    }}
                    placeholder="セクション名 (Intro, サビ, Aメロ...)"
                  />
                </div>

                {/* Row Quick Action Menu */}
                <div className="row-actions no-print">
                  <button
                    className="btn-mini"
                    onClick={() => handleAddLine(lineIndex)}
                    title="この下に歌詞行を追加"
                  >
                    <Plus size={13} />
                    <span>行</span>
                  </button>
                  <button
                    className="btn-mini"
                    onClick={() => handleAddSection(lineIndex)}
                    title="この下に新しいセクションを追加"
                  >
                    <Tag size={12} />
                    <span>セクション</span>
                  </button>
                  <button
                    className="btn-mini btn-danger"
                    onClick={() => handleDeleteLine(lineIndex)}
                    title="このセクションを削除"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          }

          // Empty line
          if (line.type === 'empty') {
            return (
              <div key={`empty-${lineIndex}`} className="empty-row group-hover-parent">
                <div
                  style={{ height: '1.4rem', width: '100%', cursor: 'pointer' }}
                  onDoubleClick={() => handleAddSection(lineIndex)}
                  title="ダブルクリックでセクションを追加"
                />
                <div className="row-actions no-print">
                  <button
                    className="btn-mini"
                    onClick={() => handleAddLine(lineIndex)}
                    title="ここに歌詞行を追加"
                  >
                    <Plus size={13} />
                    <span>行</span>
                  </button>
                  <button
                    className="btn-mini"
                    onClick={() => handleAddSection(lineIndex)}
                    title="ここにセクションを追加"
                  >
                    <Tag size={12} />
                    <span>セクション</span>
                  </button>
                  <button
                    className="btn-mini btn-danger"
                    onClick={() => handleDeleteLine(lineIndex)}
                    title="この空行を削除"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          }

          // Lyrics line with interactive chord pairs
          return (
            <div key={`line-${lineIndex}`} className="sheet-line group-hover-parent">
              <div
                className="pairs-wrapper"
                onDoubleClick={(e) => handleWrapperDoubleClick(e, lineIndex)}
                title="余白をダブルクリックで行末にコード追加"
              >
                {line.pairs &&
                  line.pairs.map((pair, pairIndex) => {
                    const isCurrentDropTarget =
                      dropTarget?.lineIndex === lineIndex && dropTarget?.pairIndex === pairIndex;
                    const isBeingDraggedChord =
                      draggedItem?.type === 'chord' &&
                      draggedItem?.sourceLineIndex === lineIndex &&
                      draggedItem?.sourcePairIndex === pairIndex;
                    const isBeingDraggedLyric =
                      draggedItem?.type === 'lyric' &&
                      draggedItem?.sourceLineIndex === lineIndex &&
                      draggedItem?.sourcePairIndex === pairIndex;

                    const showInlineDiagram =
                      (diagramDisplay === 'inline' || diagramDisplay === 'both') && Boolean(pair.chord);

                    return (
                      <div
                        key={`pair-${lineIndex}-${pairIndex}`}
                        className={`chord-lyric-pair-interactive ${pair.chord ? 'has-chord' : ''} ${
                          showInlineDiagram ? 'has-inline-diagram' : ''
                        } ${isCurrentDropTarget ? 'is-drop-target' : ''}`}
                        onDragOver={(e) => handleDragOver(e, lineIndex, pairIndex)}
                        onDragLeave={(e) => handleDragLeave(e, lineIndex, pairIndex)}
                        onDrop={(e) => handleDrop(e, lineIndex, pairIndex)}
                      >
                        {/* Chord Slot: Click to edit or add, Drag to move */}
                        {pair.chord ? (
                          <button
                            type="button"
                            className={`chord-tag clickable ${isBeingDraggedChord ? 'is-dragging' : ''}`}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, 'chord', lineIndex, pairIndex, pair.chord!)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => {
                              if (draggedItem) return;
                              handleChordClick(e, lineIndex, pairIndex, pair.chord);
                            }}
                            title="クリックで編集、ドラッグで位置移動"
                          >
                            {pair.chord}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`chord-add-placeholder no-print ${
                              isCurrentDropTarget && draggedItem?.type === 'chord' ? 'drop-active' : ''
                            }`}
                            onClick={(e) => handleAddChordAboveLyric(e, lineIndex, pairIndex)}
                            title="クリックでコード追加、またはここにドロップ"
                          >
                            <Plus size={11} />
                          </button>
                        )}

                        {/* Inline Diagram between chord and lyrics */}
                        {showInlineDiagram && pair.chord && (
                          <div className="inline-diagram-container">
                            <ChordDiagram chord={pair.chord} width={52} height={36} showName={false} />
                          </div>
                        )}

                        {/* Lyric Text: Editable input with drag handle & double-click to insert chord */}
                        <div className="lyric-wrapper">
                          <div
                            className="lyric-drag-handle no-print"
                            draggable={Boolean(pair.lyric && pair.lyric.trim())}
                            onDragStart={(e) => handleDragStart(e, 'lyric', lineIndex, pairIndex, pair.lyric)}
                            onDragEnd={handleDragEnd}
                            title="ドラッグしてこの歌詞を移動"
                          >
                            <GripHorizontal size={11} />
                          </div>
                          <div className="lyric-input-box">
                            <span className="lyric-sizer" aria-hidden="true">
                              {pair.lyric || '　'}
                            </span>
                            <input
                              type="text"
                              className={`lyric-input ${isBeingDraggedLyric ? 'is-dragging-lyric' : ''}`}
                              value={pair.lyric}
                              onChange={(e) => handleLyricChange(lineIndex, pairIndex, e.target.value)}
                              onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === 'Escape') && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                                  e.currentTarget.blur();
                                }
                              }}
                              onBlur={(e) => {
                                e.currentTarget.scrollLeft = 0;
                              }}
                              onDoubleClick={(e) => handleLyricDoubleClick(e, lineIndex, pairIndex)}
                              title="クリックで編集、ダブルクリックでコード挿入 (Enterで確定)"
                              placeholder="　"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Add chord to the end of this line */}
                <button
                  type="button"
                  className="btn-mini btn-add-end no-print"
                  onClick={(e) => handleAddChordPairToEndOfLine(e, lineIndex)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!draggedItem) return;
                    const newLines = [...parsedLines];
                    const sourceLine = newLines[draggedItem.sourceLineIndex];
                    const targetLine = newLines[lineIndex];
                    if (sourceLine?.pairs && targetLine?.pairs) {
                      const sourcePairs = [...sourceLine.pairs];
                      const targetPairs =
                        draggedItem.sourceLineIndex === lineIndex ? sourcePairs : [...targetLine.pairs];

                      if (draggedItem.type === 'chord') {
                        // Remove from source
                        sourcePairs[draggedItem.sourcePairIndex] = {
                          ...sourcePairs[draggedItem.sourcePairIndex],
                          chord: undefined,
                        };
                        // Add to end of target
                        targetPairs.push({ chord: draggedItem.value, lyric: ' ' });
                      } else if (draggedItem.type === 'lyric') {
                        // Remove from source
                        sourcePairs[draggedItem.sourcePairIndex] = {
                          ...sourcePairs[draggedItem.sourcePairIndex],
                          lyric: '',
                        };
                        // Add to end of target
                        targetPairs.push({ lyric: draggedItem.value });
                      }

                      newLines[draggedItem.sourceLineIndex] = { ...sourceLine, pairs: sourcePairs };
                      if (draggedItem.sourceLineIndex !== lineIndex) {
                        newLines[lineIndex] = { ...targetLine, pairs: targetPairs };
                      }
                      commitLines(newLines);
                    }
                    setDraggedItem(null);
                    setDropTarget(null);
                  }}
                  title="行末に追加（ここにコードや歌詞をドラッグ＆ドロップも可能）"
                >
                  <Plus size={12} />
                  <Music size={11} />
                </button>
              </div>

              {/* Row Management buttons (visible on hover) */}
              <div className="row-actions no-print">
                <button
                  className="btn-mini"
                  onClick={() => handleAddLine(lineIndex)}
                  title="下に新しい行を追加"
                >
                  <Plus size={13} />
                  <span>行</span>
                </button>
                <button
                  className="btn-mini"
                  onClick={() => handleAddSection(lineIndex)}
                  title="下に新しいセクションを追加"
                >
                  <Tag size={12} />
                  <span>セクション</span>
                </button>
                <button
                  className="btn-mini btn-danger"
                  onClick={() => handleDeleteLine(lineIndex)}
                  title="この行を削除"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Chord Picker Popover */}
      {popover && (
        <ChordPickerPopover
          initialChord={popover.initialChord}
          position={popover.position}
          accidentalPreference={accidentalPreference}
          onSelect={handleApplyChord}
          onDelete={popover.isNew ? undefined : handleDeleteChord}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
};
