import React, { useState } from 'react';
import { SongData } from '../types/chord';
import { X, Copy, Check, Download, Upload } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: SongData;
  allSongs: SongData[];
  onUpdateSongContent: (content: string) => void;
  onImportAllSongs: (songs: SongData[]) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  currentSong,
  allSongs,
  onUpdateSongContent,
  onImportAllSongs,
}) => {
  const [activeTab, setActiveTab] = useState<'chordpro' | 'backup'>('chordpro');
  const [chordProInput, setChordProInput] = useState(currentSong.content);
  const [copied, setCopied] = useState(false);

  // Synchronize chordProInput when modal opens or currentSong changes
  React.useEffect(() => {
    if (isOpen) {
      setChordProInput(currentSong.content);
    }
  }, [isOpen, currentSong]);

  if (!isOpen) return null;

  // Generate standard full ChordPro with metadata directives
  const generateFullChordPro = (useCurrentInput: boolean = true): string => {
    const metaLines: string[] = [];
    if (currentSong.title) metaLines.push(`{title: ${currentSong.title}}`);
    if (currentSong.artist) metaLines.push(`{artist: ${currentSong.artist}}`);
    if (currentSong.key) metaLines.push(`{key: ${currentSong.key}}`);
    if (currentSong.capo > 0) metaLines.push(`{capo: ${currentSong.capo}}`);
    if (currentSong.tempo) metaLines.push(`{tempo: ${currentSong.tempo}}`);

    const header = metaLines.length > 0 ? metaLines.join('\n') + '\n\n' : '';
    const body = useCurrentInput ? chordProInput : currentSong.content;
    return header + body;
  };

  // Copy ChordPro
  const handleCopyChordPro = () => {
    const full = generateFullChordPro(true);
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download ChordPro / Text file
  const handleDownloadChordPro = (extension: 'chordpro' | 'txt' = 'chordpro') => {
    const full = generateFullChordPro(true);
    const blob = new Blob([full], { type: 'text/plain;charset=utf-8' });
    const downloadAnchor = document.createElement('a');
    const safeTitle = (currentSong.title || 'song').replace(/[\\/:*?"<>|]/g, '_');
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = `${safeTitle}.${extension}`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Upload ChordPro file (.chordpro / .cho / .txt)
  const handleChordProFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        // Remove directive lines from content for the sheet editor
        const cleanedContent = text
          .split('\n')
          .filter((line) => !line.trim().match(/^\{(title|artist|key|capo|tempo):/i))
          .join('\n');

        setChordProInput(cleanedContent);
        onUpdateSongContent(cleanedContent);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  // Apply ChordPro
  const handleApplyChordPro = () => {
    onUpdateSongContent(chordProInput);
    onClose();
  };

  // Download all songs backup as JSON
  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allSongs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chordsketch-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Upload JSON backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && json.length > 0) {
          onImportAllSongs(json);
          onClose();
        } else {
          alert('有効な楽曲データファイルではありません。');
        }
      } catch {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            読み込み・ダウンロード
          </h2>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
          <button
            className="btn"
            style={{
              flex: 1,
              borderRadius: 0,
              border: 'none',
              borderBottom: activeTab === 'chordpro' ? '2px solid var(--accent-primary)' : 'none',
              background: activeTab === 'chordpro' ? 'var(--bg-card)' : 'transparent',
              padding: '0.75rem',
            }}
            onClick={() => setActiveTab('chordpro')}
          >
            <span>ChordPro</span>
          </button>
          <button
            className="btn"
            style={{
              flex: 1,
              borderRadius: 0,
              border: 'none',
              borderBottom: activeTab === 'backup' ? '2px solid var(--accent-primary)' : 'none',
              background: activeTab === 'backup' ? 'var(--bg-card)' : 'transparent',
              padding: '0.75rem',
            }}
            onClick={() => setActiveTab('backup')}
          >
            JSONバックアップ
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'chordpro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  現在の楽曲を標準ChordPro形式テキストとしてエクスポート（ダウンロード / コピー）したり、既存のChordProファイルを読み込んで編集できます。
                </p>
                {/* Action Buttons Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  <button className="btn btn-primary" onClick={() => handleDownloadChordPro('chordpro')} title="標準の.chordpro形式でダウンロード">
                    <Download size={14} />
                    <span>.chordpro ダウンロード</span>
                  </button>
                  <button className="btn" onClick={() => handleDownloadChordPro('txt')} title="テキスト形式(.txt)でダウンロード">
                    <Download size={14} />
                    <span>.txt ダウンロード</span>
                  </button>
                  <button className="btn" onClick={handleCopyChordPro} title="クリップボードにコピー">
                    {copied ? <Check size={14} color="lightgreen" /> : <Copy size={14} />}
                    <span>{copied ? 'コピー完了' : 'テキストをコピー'}</span>
                  </button>
                  <label className="btn" style={{ display: 'inline-flex', cursor: 'pointer', marginLeft: 'auto' }} title="ChordPro/テキストファイルを読み込む">
                    <Upload size={14} />
                    <span>ファイルを読み込み</span>
                    <input
                      type="file"
                      accept=".chordpro,.cho,.txt"
                      onChange={handleChordProFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <textarea
                className="editor-textarea"
                style={{
                  height: '210px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                }}
                value={chordProInput}
                onChange={(e) => setChordProInput(e.target.value)}
                placeholder="[C]空を見上げて [G/B]歩こう..."
              />
            </div>
          )}

          {activeTab === 'backup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '0.5rem 0' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                  全楽曲データをダウンロード
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  登録されている全楽曲（{allSongs.length}曲）を1つのJSONファイルとして保存します。
                </p>
                <button className="btn btn-primary" onClick={handleDownloadBackup}>
                  <Download size={15} />
                  <span>JSONファイルをダウンロード</span>
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                  JSONバックアップから復元
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  以前保存したJSONファイルを読み込み、楽曲データを復元します。
                </p>
                <label className="btn" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                  <Upload size={15} />
                  <span>ファイルを選択してインポート</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            閉じる
          </button>
          {activeTab === 'chordpro' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" onClick={() => handleDownloadChordPro('chordpro')}>
                <Download size={14} />
                <span>ダウンロード (.chordpro)</span>
              </button>
              <button className="btn btn-primary" onClick={handleApplyChordPro}>
                エディタに反映
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
