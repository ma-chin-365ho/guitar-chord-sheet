import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ArrowUp, Volume2, VolumeX } from 'lucide-react';

interface AutoScrollControlsProps {
  tempo?: number;
}

export const AutoScrollControls: React.FC<AutoScrollControlsProps> = ({ tempo = 80 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [currentBpm, setCurrentBpm] = useState(tempo);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Auto-scroll loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollLoop = (time: number) => {
      if (!isPlaying) return;
      const delta = time - lastTime;

      // Scroll speed: pixels per frame
      const pixelsPerSec = speed * 15;
      const scrollBy = (pixelsPerSec * delta) / 1000;

      window.scrollBy({ top: scrollBy, behavior: 'auto' });
      lastTime = time;
      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    if (isPlaying) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(scrollLoop);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, speed]);

  // Metronome audio loop
  useEffect(() => {
    if (!metronomeOn) return;

    const intervalMs = (60 / currentBpm) * 1000;
    const playClick = () => {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz click
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch {
        // audio context blocked by user interaction
      }
    };

    playClick();
    const intervalId = setInterval(playClick, intervalMs);

    return () => clearInterval(intervalId);
  }, [metronomeOn, currentBpm]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="autoscroll-bar no-print">
      {/* Scroll toggle */}
      <button
        className={`btn ${isPlaying ? 'btn-primary' : ''}`}
        style={{ padding: '0.4rem 0.75rem' }}
        onClick={() => setIsPlaying(!isPlaying)}
        title="自動スクロールを開始/停止 (Spaceキー)"
      >
        {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        <span>{isPlaying ? '停止' : '自動スクロール'}</span>
      </button>

      {/* Speed Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>速度:</span>
        <input
          type="range"
          min="1"
          max="8"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="speed-slider"
          title={`スクロール速度: ${speed}`}
        />
        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', minWidth: '1rem' }}>{speed}</span>
      </div>

      <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 2px' }} />

      {/* Metronome */}
      <button
        className={`btn ${metronomeOn ? 'btn-primary' : ''}`}
        style={{ padding: '0.4rem 0.6rem' }}
        onClick={() => setMetronomeOn(!metronomeOn)}
        title="メトロノームON/OFF"
      >
        {metronomeOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
        <span>BPM {currentBpm}</span>
      </button>

      {/* Scroll to Top */}
      <button
        className="btn btn-icon"
        onClick={scrollToTop}
        title="ページ最上部へ戻る"
        style={{ padding: '0.4rem' }}
      >
        <ArrowUp size={15} />
      </button>
    </div>
  );
};
