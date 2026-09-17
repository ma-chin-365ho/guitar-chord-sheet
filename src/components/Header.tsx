import React from 'react';
import { SongData } from '../types/chord';
import { 
  Guitar, 
  Plus, 
  Printer, 
  Download, 
  Upload, 
  Sun, 
  Moon, 
  Copy, 
  Trash2 
} from 'lucide-react';

interface HeaderProps {
  songs: SongData[];
  currentSongId: string;
  onSelectSong: (id: string) => void;
  onNewSong: () => void;
  onDuplicateSong: () => void;
  onDeleteSong: () => void;
  onOpenImportExport: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  songs,
  currentSongId,
  onSelectSong,
  onNewSong,
  onDuplicateSong,
  onDeleteSong,
  onOpenImportExport,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="app-header">
      <div className="brand">
        <Guitar className="brand-icon" size={26} />
        <span>ChordSketch</span>
      </div>

      <div className="header-controls">
        {/* Song Select Dropdown */}
        <div className="song-select-wrapper">
          <select
            className="song-select"
            value={currentSongId}
            onChange={(e) => onSelectSong(e.target.value)}
          >
            {songs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title || '無題の楽曲'}
              </option>
            ))}
          </select>
        </div>

        {/* Song actions */}
        <button className="btn" onClick={onNewSong} title="新規楽曲を作成">
          <Plus size={16} />
          <span>新規</span>
        </button>

        <button className="btn" onClick={onDuplicateSong} title="現在の曲を複製">
          <Copy size={15} />
          <span>複製</span>
        </button>

        {songs.length > 1 && (
          <button className="btn" onClick={onDeleteSong} title="この曲を削除">
            <Trash2 size={15} color="#e07a5f" />
          </button>
        )}

        <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Import/Export */}
        <button className="btn" onClick={onOpenImportExport} title="読み込み・ダウンロード">
          <Download size={15} />
          <span>読み込み・ダウンロード</span>
        </button>

        {/* Print */}
        <button className="btn btn-primary" onClick={() => window.print()} title="印刷・PDF保存 (Ctrl+P)">
          <Printer size={16} />
          <span>印刷 / PDF</span>
        </button>

        {/* Dark/Light toggle */}
        <button className="btn btn-icon" onClick={onToggleTheme} title="テーマ切り替え">
          {isDark ? <Sun size={18} color="var(--accent-amber)" /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
