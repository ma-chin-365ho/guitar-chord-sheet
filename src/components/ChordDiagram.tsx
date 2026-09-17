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
  width = 88,
  height = 110,
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

  // SVG coordinates
  const svgWidth = 100;
  const svgHeight = showName ? 130 : 105;
  const startX = 20;
  const endX = 80;
  const startY = showName ? 35 : 18;
  const stringSpacing = (endX - startX) / (numStrings - 1);
  const fretSpacing = 18;
  const endY = startY + numFrets * fretSpacing;

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
            y={18}
            textAnchor="middle"
            fill="currentColor"
            fontSize="14"
            fontWeight="bold"
            fontFamily="var(--font-heading)"
          >
            {name}
          </text>
        )}

        {/* Nut (thick top line) if baseFret is 1 */}
        {baseFret === 1 ? (
          <line
            x1={startX - 1}
            y1={startY}
            x2={endX + 1}
            y2={startY}
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ) : (
          /* Base fret label on the left (e.g. "3fr") */
          <text
            x={startX - 5}
            y={startY + fretSpacing * 0.7}
            textAnchor="end"
            fill="var(--accent-primary)"
            fontSize="10"
            fontWeight="bold"
            fontFamily="var(--font-mono)"
          >
            {baseFret}fr
          </text>
        )}

        {/* Fret horizontal lines */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={startX}
            y1={startY + i * fretSpacing}
            x2={endX}
            y2={startY + i * fretSpacing}
            stroke="var(--border-subtle)"
            strokeWidth="1.2"
          />
        ))}

        {/* Strings vertical lines (6th string to 1st string) */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={startX + i * stringSpacing}
            y1={startY}
            x2={startX + i * stringSpacing}
            y2={endY}
            stroke="var(--border-subtle)"
            strokeWidth={1 + (5 - i) * 0.25} // thicker for lower strings
          />
        ))}

        {/* Barre indicators if any */}
        {barres &&
          barres.map((bfret) => {
            const y = startY + (bfret - 0.5) * fretSpacing;
            return (
              <rect
                key={`barre-${bfret}`}
                x={startX}
                y={y - 5}
                width={endX - startX}
                height={10}
                rx={5}
                fill="var(--accent-primary)"
                opacity="0.85"
              />
            );
          })}

        {/* Open (o) / Mute (x) and Finger Dots */}
        {frets.map((fret, stringIndex) => {
          const x = startX + stringIndex * stringSpacing;
          const finger = fingers ? fingers[stringIndex] : 0;

          if (fret === -1) {
            // Mute (X)
            return (
              <text
                key={`mute-${stringIndex}`}
                x={x}
                y={startY - 6}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="11"
                fontWeight="bold"
                fontFamily="var(--font-mono)"
              >
                ✕
              </text>
            );
          }

          if (fret === 0) {
            // Open (O)
            return (
              <circle
                key={`open-${stringIndex}`}
                cx={x}
                cy={startY - 9}
                r={3.8}
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                fill="none"
              />
            );
          }

          // Fretted note dot
          const relativeFret = fret; // 1-based relative to baseFret
          const dotY = startY + (relativeFret - 0.5) * fretSpacing;

          return (
            <g key={`dot-${stringIndex}`}>
              <circle
                cx={x}
                cy={dotY}
                r={5.5}
                fill="var(--accent-primary)"
              />
              {finger > 0 && (
                <text
                  x={x}
                  y={dotY + 3.5}
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
