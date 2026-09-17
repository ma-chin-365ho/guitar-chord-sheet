import React, { useState, useMemo } from 'react';
import { SongData, ColumnLayout, DiagramDisplay, ParsedLine, ChordPair } from '../types/chord';
import { parseChordPro, extractUniqueChords, stringifyChordPro } from '../utils/chordParser';
import { transposeChordProText } from '../utils/transposer';
import { ChordDiagram } from './ChordDiagram';
import { ChordPickerPopover } from './ChordPickerPopover';
import { Plus, Trash2, Tag, Music, Edit2, GripVertical } from 'lucide-react';

interface SheetViewerProps {
  song: SongData;
  transpose: number;
  columnLayout: ColumnLayout;
  diagramDisplay: DiagramDisplay;
  onUpdateSong: (updated: Partial<SongData>) => void;
}

interface ActivePopoverState {
  lineIndex: number;
  pairIndex: number;
  isNew?: boolean;
  initialChord?: string;
  position: { top: number; left: number };
}

interface DraggedChordInfo {
  sourceLineIndex: number;
  sourcePairIndex: number;
  chord: string;
}

export const SheetViewer: React.FC<SheetViewerProps> = ({
  song,
  transpose,
  columnLayout,
  diagramDisplay,
  onUpdateSong,
}) => {
  // Transpose the content for display
  const transposedContent = useMemo(() => {
    return transposeChordProText(song.content, transpose);
  }, [song.content, transpose]);

  // Parse lines
  const parsedLines: ParsedLine[] = useMemo(() => {
    return parseChordPro(song.content);
  }, [song.content]);

  // Unique chords in current key
  const uniqueChords = useMemo(() => {
    return extractUniqueChords(transposedContent);
  }, [transposedContent]);

  // Popover state
  const [popover, setPopover] = useState<ActivePopoverState | null>(null);

  // Drag and Drop state (Chords)
  const [draggedChord, setDraggedChord] = useState<DraggedChordInfo | null>(null);
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
  const handleDragStart = (e: React.DragEvent, lineIndex: number, pairIndex: number, chord: string) => {
    e.dataTransfer.setData('text/plain', chord);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedChord({ sourceLineIndex: lineIndex, sourcePairIndex: pairIndex, chord });
  };

  const handleDragEnd = () => {
    setDraggedChord(null);
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
    if (!draggedChord) return;

    const { sourceLineIndex, sourcePairIndex, chord } = draggedChord;
    if (sourceLineIndex === targetLineIndex && sourcePairIndex === targetPairIndex) {
      setDraggedChord(null);
      setDropTarget(null);
      return;
    }

    const newLines = [...parsedLines];
    const sourceLine = newLines[sourceLineIndex];
    const targetLine = newLines[targetLineIndex];

    if (sourceLine?.pairs && targetLine?.pairs) {
      const sourcePairs = [...sourceLine.pairs];
      const targetPairs = sourceLineIndex === targetLineIndex ? sourcePairs : [...targetLine.pairs];

      const targetExistingChord = targetPairs[targetPairIndex]?.chord;

      // Move dragged chord to target
      targetPairs[targetPairIndex] = {
        ...targetPairs[targetPairIndex],
        chord: chord,
      };

      // Put previous target chord into source (swap) or remove from source
      sourcePairs[sourcePairIndex] = {
        ...sourcePairs[sourcePairIndex],
        chord: targetExistingChord,
      };

      newLines[sourceLineIndex] = { ...sourceLine, pairs: sourcePairs };
      if (sourceLineIndex !== targetLineIndex) {
        newLines[targetLineIndex] = { ...targetLine, pairs: targetPairs };
      }

      commitLines(newLines);
    }

    setDraggedChord(null);
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
      pairs: [{ chord: 'C', lyric: '歌詞を入力' }],
    });
    commitLines(newLines);
  };

  // Add new section
  const handleAddSection = (indexAfter: number, title = 'サビ') => {
    const newLines = [...parsedLines];
    newLines.splice(
      indexAfter + 1,
      0,
      { type: 'section', sectionTitle: title },
      { type: 'lyrics', pairs: [{ chord: 'G', lyric: '新しい歌詞' }] }
    );
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
                ![
                  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
                  'Am', 'A#m', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm'
                ].includes(song.key) && (
                <option value={song.key}>{song.key}</option>
              )}
              <optgroup label="メジャー (Major)">
                {[
                  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
                ].map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </optgroup>
              <optgroup label="マイナー (Minor)">
                {[
                  'Am', 'A#m', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm'
                ].map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </optgroup>
            </select>
            {transpose !== 0 && (
              <span style={{ color: 'var(--accent-primary)', marginLeft: '4px', fontWeight: 700 }}>
                ({transpose > 0 ? `+${transpose}` : transpose})
              </span>
            )}
          </div>

          {/* Capo */}
          <div className="sheet-meta-item">
            <span className="capo-badge">
              Capo:
              <input
                type="number"
                min="0"
                max="9"
                value={song.capo}
                onChange={(e) => onUpdateSong({ capo: Number(e.target.value) })}
                className="capo-input"
              />
            </span>
          </div>

          {/* BPM */}
          <div className="sheet-meta-item">
            <span>BPM: </span>
            <input
              type="number"
              min="40"
              max="240"
              value={song.tempo || 80}
              onChange={(e) => onUpdateSong({ tempo: Number(e.target.value) })}
              className="inline-meta-input"
              style={{ width: '55px' }}
            />
          </div>
        </div>
      </div>

      {/* Top Diagrams Bar */}
      {(diagramDisplay === 'top' || diagramDisplay === 'both') && uniqueChords.length > 0 && (
        <div className="sheet-diagrams-bar">
          {uniqueChords.map((chord) => (
            <div key={chord} className="diagram-item">
              <ChordDiagram chord={chord} width={75} height={95} />
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
                <div style={{ height: '1.2rem', width: '100%' }} />
                <div className="row-actions no-print">
                  <button
                    className="btn-mini"
                    onClick={() => handleAddLine(lineIndex)}
                    title="ここに歌詞行を追加"
                  >
                    <Plus size={13} />
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
              <div className="pairs-wrapper">
                {line.pairs &&
                  line.pairs.map((pair, pairIndex) => {
                    const isCurrentDropTarget =
                      dropTarget?.lineIndex === lineIndex && dropTarget?.pairIndex === pairIndex;
                    const isBeingDragged =
                      draggedChord?.sourceLineIndex === lineIndex &&
                      draggedChord?.sourcePairIndex === pairIndex;

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
                            className={`chord-tag clickable ${isBeingDragged ? 'is-dragging' : ''}`}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, lineIndex, pairIndex, pair.chord!)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => {
                              if (draggedChord) return;
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
                              isCurrentDropTarget ? 'drop-active' : ''
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
                            <ChordDiagram chord={pair.chord} width={48} height={60} showName={false} />
                          </div>
                        )}

                        {/* Lyric Text: Editable input */}
                        <input
                          type="text"
                          className="lyric-input"
                          value={pair.lyric}
                          size={Math.max(1, (pair.lyric || '').length)}
                          onChange={(e) => handleLyricChange(lineIndex, pairIndex, e.target.value)}
                          placeholder="　"
                        />
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
                    if (!draggedChord) return;
                    // Append dragged chord to end of line
                    const newLines = [...parsedLines];
                    const sourceLine = newLines[draggedChord.sourceLineIndex];
                    const targetLine = newLines[lineIndex];
                    if (sourceLine?.pairs && targetLine?.pairs) {
                      const sourcePairs = [...sourceLine.pairs];
                      const targetPairs =
                        draggedChord.sourceLineIndex === lineIndex ? sourcePairs : [...targetLine.pairs];

                      // Remove from source
                      sourcePairs[draggedChord.sourcePairIndex] = {
                        ...sourcePairs[draggedChord.sourcePairIndex],
                        chord: undefined,
                      };

                      // Add to end of target
                      targetPairs.push({ chord: draggedChord.chord, lyric: ' ' });

                      newLines[draggedChord.sourceLineIndex] = { ...sourceLine, pairs: sourcePairs };
                      if (draggedChord.sourceLineIndex !== lineIndex) {
                        newLines[lineIndex] = { ...targetLine, pairs: targetPairs };
                      }
                      commitLines(newLines);
                    }
                    setDraggedChord(null);
                    setDropTarget(null);
                  }}
                  title="行末にコードを追加（ここにドラッグ＆ドロップも可能）"
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
                  onClick={() => handleAddSection(lineIndex, 'サビ')}
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

        {/* Big append buttons at the bottom */}
        <div className="sheet-append-bar no-print">
          <button
            className="btn"
            style={{ padding: '0.6rem 1.2rem', gap: '0.5rem' }}
            onClick={() => handleAddLine(parsedLines.length - 1)}
          >
            <Plus size={16} />
            <span>行を追加</span>
          </button>
          <button
            className="btn"
            style={{ padding: '0.6rem 1.2rem', gap: '0.5rem' }}
            onClick={() => handleAddSection(parsedLines.length - 1, '新しいセクション')}
          >
            <Tag size={16} />
            <span>セクション（サビ/Aメロ等）を追加</span>
          </button>
        </div>
      </div>

      {/* Floating Chord Picker Popover */}
      {popover && (
        <ChordPickerPopover
          initialChord={popover.initialChord}
          position={popover.position}
          onSelect={handleApplyChord}
          onDelete={popover.isNew ? undefined : handleDeleteChord}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
};
