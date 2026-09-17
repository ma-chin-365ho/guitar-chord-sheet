import React from 'react';
import { ChordDiagramData } from '../types/chord';
import { getChordDiagram } from '../data/chordDictionary';

interface ChordDiagramProps {
  chord: string | ChordDiagramData;
  width?: number;
  height?: number;
  showName?: boolean;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({
  chord,
  width = 96,
  height = 75,
  showName = true,
}) => {
  const data: ChordDiagramData | null =
    typeof chord === 'string' ? getChordDiagram(chord) : chord;

  if (!data) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
        {typeof chord === 'string' ? chord : ''}
      </div>
    );
  }

  const { chord: name, baseFret, frets, fingers, barres } = data;
  const numStrings = 6;
  const numFrets = 4; // Display 4 frets

  // Horizontal layout (1st string on top, 6th string on bottom, nut on left)
  const svgWidth = 104;
  const svgHeight = showName ? 82 : 64;
  const startX = 22;
  const fretSpacing = 18;
  const endX = startX + numFrets * fretSpacing; // 22 + 72 = 94

  const startY = showName ? 24 : 10;
  const stringSpacing = 9.5;
  const endY = startY + (numStrings - 1) * stringSpacing; // startY + 47.5

  // 1st string (index 5) is at top (startY), 6th string (index 0) is at bottom (endY)
  const getStringY = (stringIndex: number) => {
    return startY + (5 - stringIndex) * stringSpacing;
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ overflow: 'visible' }}
      >
        {/* Chord Name */}
        {showName && (
          <text
            x={svgWidth / 2}
            y={15}
            textAnchor="middle"
            fill="currentColor"
            fontSize="13"
            fontWeight="bold"
            fontFamily="var(--font-heading)"
          >
            {name}
          </text>
        )}

        {/* Base fret label (e.g. "3fr" above fret 1) if baseFret > 1 */}
        {baseFret > 1 && (
          <text
            x={startX + fretSpacing * 0.5}
            y={startY - 3}
            textAnchor="middle"
            fill="var(--accent-primary)"
            fontSize="9"
            fontWeight="bold"
            fontFamily="var(--font-mono)"
          >
            {baseFret}fr
          </text>
        )}

        {/* Nut (thick vertical line on the left) if baseFret === 1 */}
        {baseFret === 1 ? (
          <line
            x1={startX}
            y1={startY - 0.5}
            x2={startX}
            y2={endY + 0.5}
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        ) : null}

        {/* Fret vertical lines */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={startX + i * fretSpacing}
            y1={startY}
            x2={startX + i * fretSpacing}
            y2={endY}
            stroke="var(--border-subtle)"
            strokeWidth="1.2"
          />
        ))}

        {/* Strings horizontal lines (1st string top to 6th string bottom) */}
        {Array.from({ length: numStrings }).map((_, stringIndex) => {
          const y = getStringY(stringIndex);
          // 6th string (index 0) is thicker, 1st string (index 5) is thinner
          const strokeWidth = 0.8 + (5 - stringIndex) * 0.28;
          return (
            <line
              key={`string-${stringIndex}`}
              x1={startX}
              y1={y}
              x2={endX}
              y2={y}
              stroke="var(--border-subtle)"
              strokeWidth={strokeWidth}
            />
          );
        })}

        {/* Barre indicators if any (vertical rounded bar across barred strings) */}
        {barres &&
          barres.map((bfret) => {
            const barreX = startX + (bfret - 0.5) * fretSpacing;
            const barredIndices = frets
              .map((f, idx) => (f === bfret ? idx : -1))
              .filter((idx) => idx !== -1);
            if (barredIndices.length === 0) return null;

            const minStr = Math.min(...barredIndices); // lowest string (bottom)
            const maxStr = Math.max(...barredIndices); // highest string (top)
            const topY = getStringY(maxStr);
            const bottomY = getStringY(minStr);

            return (
              <rect
                key={`barre-${bfret}`}
                x={barreX - 4.5}
                y={topY - 4.5}
                width={9}
                height={bottomY - topY + 9}
                rx={4.5}
                fill="var(--accent-primary)"
                opacity="0.85"
              />
            );
          })}

        {/* Open (o) / Mute (x) on the left of nut, and Finger Dots on frets */}
        {frets.map((fret, stringIndex) => {
          const y = getStringY(stringIndex);
          const finger = fingers ? fingers[stringIndex] : 0;

          if (fret === -1) {
            // Mute (✕)
            return (
              <text
                key={`mute-${stringIndex}`}
                x={startX - 9}
                y={y + 3.5}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="10"
                fontWeight="bold"
                fontFamily="var(--font-mono)"
              >
                ✕
              </text>
            );
          }

          if (fret === 0) {
            // Open (○)
            return (
              <circle
                key={`open-${stringIndex}`}
                cx={startX - 9}
                cy={y}
                r={3.2}
                stroke="var(--text-muted)"
                strokeWidth="1.4"
                fill="none"
              />
            );
          }

          // Fretted note dot
          const dotX = startX + (fret - 0.5) * fretSpacing;

          return (
            <g key={`dot-${stringIndex}`}>
              <circle
                cx={dotX}
                cy={y}
                r={5.2}
                fill="var(--accent-primary)"
              />
              {finger > 0 && (
                <text
                  x={dotX}
                  y={y + 3.2}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="bold"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
