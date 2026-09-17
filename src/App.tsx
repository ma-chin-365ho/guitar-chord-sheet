import React, { useState, useEffect } from 'react';
import { SongData, ColumnLayout, DiagramDisplay, AccidentalPreference } from './types/chord';
import { SAMPLE_SONGS } from './data/sampleSongs';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { SheetViewer } from './components/SheetViewer';
import { AutoScrollControls } from './components/AutoScrollControls';
import { ImportExportModal } from './components/ImportExportModal';
import { 
  transposeChordProText, 
  transposeChord, 
  convertChordProAccidentals, 
  convertAccidentalChord, 
  detectAccidentalPreference 
} from './utils/transposer';

const STORAGE_KEY_SONGS = 'chordsketch_songs_v1';
const LEGACY_STORAGE_KEY_SONGS = 'chordcraft_songs_v1';
const STORAGE_KEY_CURRENT = 'chordsketch_current_song_id';
const LEGACY_STORAGE_KEY_CURRENT = 'chordcraft_current_song_id';
const STORAGE_KEY_THEME = 'chordsketch_theme';
const LEGACY_STORAGE_KEY_THEME = 'chordcraft_theme';

export const App: React.FC = () => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME) || localStorage.getItem(LEGACY_STORAGE_KEY_THEME);
    return saved !== null ? saved === 'dark' : true; // default dark
  });

  // Songs state
  const [songs, setSongs] = useState<SongData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SONGS) || localStorage.getItem(LEGACY_STORAGE_KEY_SONGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return SAMPLE_SONGS;
  });

  const [currentSongId, setCurrentSongId] = useState<string>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY_CURRENT) || localStorage.getItem(LEGACY_STORAGE_KEY_CURRENT);
    if (savedId && songs.some((s) => s.id === savedId)) return savedId;
    return songs[0]?.id || SAMPLE_SONGS[0].id;
  });

  // View preferences
  const [columnLayout, setColumnLayout] = useState<ColumnLayout>('1col');
  const [diagramDisplay, setDiagramDisplay] = useState<DiagramDisplay>('top');
  const [accidentalPreference, setAccidentalPreference] = useState<AccidentalPreference>('sharp');

  // Modal state
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
  }, [isDark]);

  // Persist songs
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SONGS, JSON.stringify(songs));
  }, [songs]);

  // Persist current song ID
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT, currentSongId);
  }, [currentSongId]);

  // Get current active song
  const currentSong = songs.find((s) => s.id === currentSongId) || songs[0] || SAMPLE_SONGS[0];

  // Undo / Redo history state
  const [history, setHistory] = useState<SongData[]>(() => [currentSong]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Reset history stack and detect accidental preference when song changes
  useEffect(() => {
    setHistory([currentSong]);
    setHistoryIndex(0);
    setAccidentalPreference(detectAccidentalPreference(currentSong.content, currentSong.key));
  }, [currentSongId]);

  // Update current song and record history
  const handleUpdateSong = (updated: Partial<SongData>, recordHistory = true) => {
    const newSong: SongData = {
      ...currentSong,
      ...updated,
      updatedAt: Date.now(),
    };

    if (recordHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newSong);
      if (nextHistory.length > 50) nextHistory.shift();
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }

    setSongs((prev) =>
      prev.map((s) => (s.id === currentSong.id ? newSong : s))
    );
  };

  // Undo action
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetSong = history[targetIndex];
      setHistoryIndex(targetIndex);
      setSongs((prev) =>
        prev.map((s) => (s.id === currentSong.id ? targetSong : s))
      );
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetSong = history[targetIndex];
      setHistoryIndex(targetIndex);
      setSongs((prev) =>
        prev.map((s) => (s.id === currentSong.id ? targetSong : s))
      );
    }
  };

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (!isCmdOrCtrl) return;

      if (e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, currentSongId]);

  // Create new song
  const handleNewSong = () => {
    const newSong: SongData = {
      id: `song-${Date.now()}`,
      title: '',
      artist: '',
      key: 'C',
      capo: 0,
      tempo: 80,
      content: `{section: }\n[C] \n`,
      updatedAt: Date.now(),
    };
    setSongs((prev) => [newSong, ...prev]);
    setCurrentSongId(newSong.id);
  };

  // Duplicate song
  const handleDuplicateSong = () => {
    const duplicated: SongData = {
      ...currentSong,
      id: `song-${Date.now()}`,
      title: `${currentSong.title} (コピー)`,
      updatedAt: Date.now(),
    };
    setSongs((prev) => [duplicated, ...prev]);
    setCurrentSongId(duplicated.id);
  };

  // Delete song
  const handleDeleteSong = () => {
    if (songs.length <= 1) return;
    if (!window.confirm(`「${currentSong.title}」を削除してもよろしいですか？`)) return;

    const remaining = songs.filter((s) => s.id !== currentSong.id);
    setSongs(remaining);
    setCurrentSongId(remaining[0].id);
  };

  // Select song
  const handleSelectSong = (id: string) => {
    setCurrentSongId(id);
  };

  // Transpose song directly and commit to content & key (with undo support)
  const handleTranspose = (semitones: number) => {
    const newContent = transposeChordProText(currentSong.content, semitones);
    const newKey = currentSong.key ? transposeChord(currentSong.key, semitones) : currentSong.key;
    handleUpdateSong({
      content: newContent,
      key: newKey,
    });
  };

  // Handle accidental toggle (# / b)
  const handleAccidentalChange = (preference: AccidentalPreference) => {
    setAccidentalPreference(preference);
    const newContent = convertChordProAccidentals(currentSong.content, preference);
    const newKey = currentSong.key ? convertAccidentalChord(currentSong.key, preference) : currentSong.key;
    if (newContent !== currentSong.content || newKey !== currentSong.key) {
      handleUpdateSong({
        content: newContent,
        key: newKey,
      });
    }
  };

  // Handle capo change
  const handleCapoChange = (newCapo: number) => {
    handleUpdateSong({ capo: Math.min(15, Math.max(0, newCapo)) });
  };

  return (
    <div className="app-container">
      {/* Sticky Header & Toolbar Container */}
      <div className="sticky-top-wrapper">
        <Header
          songs={songs}
          currentSongId={currentSongId}
          onSelectSong={handleSelectSong}
          onNewSong={handleNewSong}
          onDuplicateSong={handleDuplicateSong}
          onDeleteSong={handleDeleteSong}
          onOpenImportExport={() => setIsImportExportOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <Toolbar
          onTranspose={handleTranspose}
          columnLayout={columnLayout}
          onColumnLayoutChange={setColumnLayout}
          diagramDisplay={diagramDisplay}
          onDiagramDisplayChange={setDiagramDisplay}
          accidentalPreference={accidentalPreference}
          onAccidentalChange={handleAccidentalChange}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>

      {/* Main Workspace Area (Single interactive sheet) */}
      <main className="main-workspace-sheet">
        <SheetViewer
          song={currentSong}
          columnLayout={columnLayout}
          diagramDisplay={diagramDisplay}
          accidentalPreference={accidentalPreference}
          onUpdateSong={handleUpdateSong}
        />
      </main>

      {/* Floating Auto-scroll & Metronome bar */}
      <AutoScrollControls tempo={currentSong.tempo} />

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        currentSong={currentSong}
        allSongs={songs}
        onUpdateSongContent={(content) => handleUpdateSong({ content })}
        onImportAllSongs={(imported) => {
          setSongs(imported);
          setCurrentSongId(imported[0].id);
        }}
      />
    </div>
  );
};

export default App;
