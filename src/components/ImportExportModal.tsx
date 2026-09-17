import React, { useState } from 'react';
import { SongData } from '../types/chord';
import { convertTwoLineToChordPro } from '../utils/chordParser';
import { X, Copy, Check, Download, Upload, Wand2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'convert' | 'chordpro' | 'backup'>('convert');
  const [twoLineInput, setTwoLineInput] = useState('');
  const [chordProInput, setChordProInput] = useState(currentSong.content);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Handle 2-line conversion
  const handleConvertTwoLine = () => {
    if (!twoLineInput.trim()) return;
    const converted = convertTwoLineToChordPro(twoLineInput);
    onUpdateSongContent(converted);
    onClose();
  };

  // Copy ChordPro
  const handleCopyChordPro = () => {
    navigator.clipboard.writeText(currentSong.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    downloadAnchor.setAttribute('download', `chordcraft-backup-${new Date().toISOString().slice(0, 10)}.json`);
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
            データの読み込み・保存
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
              borderBottom: activeTab === 'convert' ? '2px solid var(--accent-primary)' : 'none',
              background: activeTab === 'convert' ? 'var(--bg-card)' : 'transparent',
              padding: '0.75rem',
            }}
            onClick={() => setActiveTab('convert')}
          >
            <Wand2 size={15} />
            <span>2行テキスト自動変換</span>
          </button>
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
            ChordProテキスト
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
          {activeTab === 'convert' && (
            <>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Web上のコード譜サイトやメモ帳などにある「1行目がコード、2行目が歌詞」のテキストを貼り付けてください。自動的に文字位置を解析し、ChordPro形式に変換して取り込みます。
              </p>
              <textarea
                className="editor-textarea"
                style={{ height: '220px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                placeholder={`C        G/B      Am       Em/G\n空を見上げて      歩こう\nF        C        Dm7      G\n遠い街に想いを馳せて`}
                value={twoLineInput}
                onChange={(e) => setTwoLineInput(e.target.value)}
              />
            </>
          )}

          {activeTab === 'chordpro' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  ChordPro形式テキストを直接編集またはコピーできます。
                </p>
                <button className="btn" onClick={handleCopyChordPro}>
                  {copied ? <Check size={14} color="lightgreen" /> : <Copy size={14} />}
                  <span>{copied ? 'コピー完了' : 'コピー'}</span>
                </button>
              </div>
              <textarea
                className="editor-textarea"
                style={{ height: '220px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                value={chordProInput}
                onChange={(e) => setChordProInput(e.target.value)}
              />
            </>
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
            キャンセル
          </button>
          {activeTab === 'convert' && (
            <button className="btn btn-primary" onClick={handleConvertTwoLine}>
              <Wand2 size={15} />
              <span>自動変換してエディタに反映</span>
            </button>
          )}
          {activeTab === 'chordpro' && (
            <button className="btn btn-primary" onClick={handleApplyChordPro}>
              エディタに反映
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
