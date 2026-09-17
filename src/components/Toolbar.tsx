import React from 'react';
import { ColumnLayout, DiagramDisplay, AccidentalPreference } from '../types/chord';
import { 
  Columns, 
  AlignJustify, 
  Undo2, 
  Redo2 
} from 'lucide-react';

interface ToolbarProps {
  onTranspose: (semitones: number) => void;
  columnLayout: ColumnLayout;
  onColumnLayoutChange: (layout: ColumnLayout) => void;
  diagramDisplay: DiagramDisplay;
  onDiagramDisplayChange: (disp: DiagramDisplay) => void;
  accidentalPreference: AccidentalPreference;
  onAccidentalChange: (pref: AccidentalPreference) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onTranspose,
  columnLayout,
  onColumnLayoutChange,
  diagramDisplay,
  onDiagramDisplayChange,
  accidentalPreference,
  onAccidentalChange,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="app-toolbar">
      {/* Undo & Redo & Transpose Group */}
      <div className="toolbar-group">
        <button
          className="btn btn-icon"
          onClick={onUndo}
          disabled={!canUndo}
          style={{ opacity: canUndo ? 1 : 0.4, cursor: canUndo ? 'pointer' : 'not-allowed' }}
          title="元に戻す (Ctrl+Z)"
        >
          <Undo2 size={16} />
          <span>戻す</span>
        </button>
        <button
          className="btn btn-icon"
          onClick={onRedo}
          disabled={!canRedo}
          style={{ opacity: canRedo ? 1 : 0.4, cursor: canRedo ? 'pointer' : 'not-allowed' }}
          title="やり直す (Ctrl+Y)"
        >
          <Redo2 size={16} />
          <span>進む</span>
        </button>

        {/* Transpose +/- buttons directly next to Redo */}
        <span className="toolbar-label" style={{ marginLeft: '8px' }}>移調:</span>
        <div className="counter-control">
          <button
            className="counter-btn"
            onClick={() => onTranspose(-1)}
            title="半音下げる (-1)"
          >
            -
          </button>
          <button
            className="counter-btn"
            onClick={() => onTranspose(1)}
            title="半音上げる (+1)"
          >
            +
          </button>
        </div>
      </div>

      <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />

      {/* Diagrams & Layout */}
      <div className="toolbar-group">
        <span className="toolbar-label">ダイアグラム:</span>
        <select
          className="meta-input"
          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
          value={diagramDisplay}
          onChange={(e) => onDiagramDisplayChange(e.target.value as DiagramDisplay)}
        >
          <option value="top">上部一覧</option>
          <option value="inline">歌詞とコードの間</option>
          <option value="both">両方</option>
          <option value="none">非表示</option>
        </select>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 4px' }} />

        <span className="toolbar-label">段組:</span>
        <button
          className={`btn ${columnLayout === '1col' ? 'btn-primary' : ''}`}
          style={{ padding: '0.3rem 0.6rem' }}
          onClick={() => onColumnLayoutChange('1col')}
          title="1段組み"
        >
          <AlignJustify size={14} />
          <span>1段</span>
        </button>
        <button
          className={`btn ${columnLayout === '2col' ? 'btn-primary' : ''}`}
          style={{ padding: '0.3rem 0.6rem' }}
          onClick={() => onColumnLayoutChange('2col')}
          title="2段組み (横長・印刷向け)"
        >
          <Columns size={14} />
          <span>2段</span>
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Enharmonic Accidental Toggle: # / b */}
        <span className="toolbar-label">表記:</span>
        <div className="btn-group" style={{ display: 'inline-flex' }}>
          <button
            className={`btn ${accidentalPreference === 'sharp' ? 'btn-primary' : ''}`}
            style={{ padding: '0.3rem 0.65rem', fontWeight: 700 }}
            onClick={() => onAccidentalChange('sharp')}
            title="コードネーム・Keyをシャープ (#) 表記に統一"
          >
            #
          </button>
          <button
            className={`btn ${accidentalPreference === 'flat' ? 'btn-primary' : ''}`}
            style={{ padding: '0.3rem 0.65rem', fontWeight: 700 }}
            onClick={() => onAccidentalChange('flat')}
            title="コードネーム・Keyをフラット (♭) 表記に統一"
          >
            ♭
          </button>
        </div>
      </div>
    </div>
  );
};
