import React, { useState, useEffect, useRef } from 'react';
import { ChordDiagram } from './ChordDiagram';
import { AccidentalPreference } from '../types/chord';
import { X, Trash2, Check } from 'lucide-react';

interface ChordPickerPopoverProps {
  initialChord?: string;
  position: { top: number; left: number };
  accidentalPreference?: AccidentalPreference;
  onSelect: (chord: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const SHARP_ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const QUALITIES = [
  { label: 'maj', val: '' },
  { label: 'm', val: 'm' },
  { label: '7', val: '7' },
  { label: 'm7', val: 'm7' },
  { label: 'M7', val: 'M7' },
  { label: 'sus4', val: 'sus4' },
  { label: 'add9', val: 'add9' },
  { label: 'dim', val: 'dim' },
  { label: 'm7b5', val: 'm7b5' },
];

const QUICK_CHORDS = [
  'C', 'G', 'Am', 'Em', 'F', 'D', 'Dm', 
  'E7', 'A7', 'D7', 'G7', 'C7', 'B7',
  'G/B', 'D/F#', 'C/G', 'Am7', 'FM7'
];

export const ChordPickerPopover: React.FC<ChordPickerPopoverProps> = ({
  initialChord = '',
  position,
  accidentalPreference = 'sharp',
  onSelect,
  onDelete,
  onClose,
}) => {
  const roots = accidentalPreference === 'flat' ? FLAT_ROOTS : SHARP_ROOTS;
  const [customInput, setCustomInput] = useState(initialChord);
  const [selectedRoot, setSelectedRoot] = useState('C');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse initial chord root
  useEffect(() => {
    if (initialChord) {
      setCustomInput(initialChord);
      const match = initialChord.match(/^([A-G][b#]?)/);
      if (match) {
        setSelectedRoot(match[1]);
      }
    }
  }, [initialChord]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleRootClick = (root: string) => {
    setSelectedRoot(root);
    // Combine with existing quality if any
    const qualityMatch = customInput.match(/^[A-G][b#]?(.*)$/);
    const quality = qualityMatch ? qualityMatch[1] : '';
    setCustomInput(`${root}${quality}`);
  };

  const handleQualityClick = (quality: string) => {
    setCustomInput(`${selectedRoot}${quality}`);
  };

  const handleQuickSelect = (chord: string) => {
    onSelect(chord);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelect(customInput.trim());
      onClose();
    }
  };

  return (
    <div
      ref={popoverRef}
      className="chord-popover"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${Math.max(16, position.left)}px`,
        zIndex: 250,
      }}
    >
      <div className="popover-header">
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>コードを選択・編集</span>
        <button className="btn btn-icon" onClick={onClose} style={{ padding: '0.2rem' }}>
          <X size={16} />
        </button>
      </div>

      <div className="popover-body">
        {/* Preview & Custom Input */}
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.8rem' }}>
          <div style={{ flex: 1 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                ref={inputRef}
                type="text"
                className="meta-input"
                style={{ width: '100%', fontSize: '1rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
                placeholder="コード名 (例: G/B)"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.6rem' }} title="適用">
                <Check size={16} />
              </button>
            </form>
          </div>

          {/* Mini diagram preview */}
          {customInput && (
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '4px' }}>
              <ChordDiagram chord={customInput} width={68} height={50} showName={false} />
            </div>
          )}
        </div>

        {/* Quick Chords */}
        <div style={{ marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>
            定番コード:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {QUICK_CHORDS.map((ch) => (
              <button
                key={ch}
                type="button"
                className={`palette-btn ${customInput === ch ? 'active' : ''}`}
                onClick={() => handleQuickSelect(ch)}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Root Notes */}
        <div style={{ marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>
            ルート音:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '3px' }}>
            {roots.map((r) => (
              <button
                key={r}
                type="button"
                className={`btn ${selectedRoot === r ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem', fontSize: '0.8rem', justifyContent: 'center' }}
                onClick={() => handleRootClick(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Qualities */}
        <div style={{ marginBottom: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>
            タイプ:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {QUALITIES.map((q) => (
              <button
                key={q.label}
                type="button"
                className="btn"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => handleQualityClick(q.val)}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Delete button if modifying existing chord */}
        {onDelete && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn"
              style={{ color: '#e07a5f', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              onClick={() => {
                onDelete();
                onClose();
              }}
            >
              <Trash2 size={14} />
              <span>コードを削除</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => {
                if (customInput.trim()) {
                  onSelect(customInput.trim());
                  onClose();
                }
              }}
            >
              適用
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
