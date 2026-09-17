import React, { useRef } from 'react';
import { SongData } from '../types/chord';
import { Tag } from 'lucide-react';

interface EditorProps {
  song: SongData;
  onChange: (updated: Partial<SongData>) => void;
}

const COMMON_CHORDS = [
  'C', 'G', 'Am', 'Em', 'F', 'D', 'Dm', 'A', 'E', 
  'B7', 'E7', 'A7', 'D7', 'G7', 'C7',
  'Cmaj7', 'Fmaj7', 'G/B', 'D/F#', 'Csus4', 'Dsus4'
];

const SECTIONS = ['Intro', 'Aメロ', 'Bメロ', 'サビ', '間奏', 'Cメロ', 'Outro'];

export const Editor: React.FC<EditorProps> = ({ song, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert text at cursor position
  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;

    const newContent = current.substring(0, start) + textToInsert + current.substring(end);
    onChange({ content: newContent });

    // Move cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  return (
    <div className="editor-panel">
      {/* Song Metadata Bar */}
      <div className="meta-inputs">
        <input
          className="meta-input"
          type="text"
          placeholder="曲名 (タイトル)"
          value={song.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
        <input
          className="meta-input"
          type="text"
          placeholder="アーティスト名"
          value={song.artist}
          onChange={(e) => onChange({ artist: e.target.value })}
        />
        <input
          className="meta-input"
          type="text"
          placeholder="Key (例: C, G, Am)"
          value={song.key}
          onChange={(e) => onChange({ key: e.target.value })}
        />
      </div>

      {/* Quick Chord & Section Palette */}
      <div className="chord-quick-palette">
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          挿入:
        </span>
        {COMMON_CHORDS.map((ch) => (
          <button
            key={ch}
            className="palette-btn"
            onClick={() => insertAtCursor(`[${ch}]`)}
            title={`[${ch}] を挿入`}
          >
            {ch}
          </button>
        ))}

        <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 4px', flexShrink: 0 }} />

        {SECTIONS.map((sec) => (
          <button
            key={sec}
            className="palette-btn"
            style={{ background: 'var(--section-bg)', color: 'var(--section-text)', borderColor: 'var(--border-subtle)' }}
            onClick={() => insertAtCursor(`\n{section: ${sec}}\n`)}
            title={`{section: ${sec}} セクション見出しを挿入`}
          >
            <Tag size={11} style={{ marginRight: '2px', verticalAlign: 'middle' }} />
            {sec}
          </button>
        ))}
      </div>

      {/* Main ChordPro Text Area */}
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        placeholder={`歌詞とコードをChordPro形式で入力してください。\n\n例:\n[Intro]\n[C] [G] [Am] [F]\n\n[Aメロ]\n[C]空を見上げて[G/B]歩こう\n[Am]夢を胸に抱[F]きしめて\n\n※ ネットの歌詞とコードの2行テキストは、上部「読込・保存」ボタンから一発自動変換できます！`}
        value={song.content}
        onChange={(e) => onChange({ content: e.target.value })}
      />
    </div>
  );
};
