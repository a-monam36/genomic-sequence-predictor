import React, { useRef, useEffect } from 'react';
import { SequenceType, PredictionMode } from '../../types';
import { getResidueInfo } from '../../utils/sequence';
import { Crosshair, Eye, Sparkles } from 'lucide-react';

interface SequenceViewerProps {
  sequence: string;
  sequenceType: SequenceType;
  targetPos: number;
  onSelectPos: (pos: number) => void;
  hoveredPos: number | null;
  onHoverPos: (pos: number | null) => void;
  windowSize: number;
  mode: PredictionMode;
  mutantResidue: string;
  verdictColor?: string;
}

export const SequenceViewer: React.FC<SequenceViewerProps> = ({
  sequence,
  sequenceType,
  targetPos,
  onSelectPos,
  hoveredPos,
  onHoverPos,
  windowSize,
  mode,
  mutantResidue,
  verdictColor = '#00f2fe'
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const targetTileRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll target into view
  useEffect(() => {
    if (targetTileRef.current && scrollContainerRef.current) {
      targetTileRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [targetPos]);

  const targetIdx = targetPos - 1;
  const windowStart = Math.max(0, targetIdx - windowSize);
  const windowEnd = Math.min(sequence.length - 1, targetIdx + windowSize);

  return (
    <div className="flex flex-col w-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden shadow-glass">
      {/* Sequence Header Bar */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-cyan-500/15 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Interactive Sequence Rail</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono-seq">
            Length: {sequence.length}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono-seq">
            Context: ±{windowSize} ({Math.max(0, windowEnd - windowStart + 1)} bp/aa)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Target Site</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-cyan-500/20 border border-cyan-500/40"></span>
            <span>Context Window</span>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Rail */}
      <div
        ref={scrollContainerRef}
        className="p-4 overflow-x-auto overflow-y-hidden select-none focus:outline-none"
        tabIndex={0}
      >
        <div className="inline-flex gap-1.5 min-w-full pb-2">
          {sequence.split('').map((char, idx) => {
            const pos1 = idx + 1;
            const isTarget = pos1 === targetPos;
            const isHovered = pos1 === hoveredPos;
            const inWindow = idx >= windowStart && idx <= windowEnd;
            const info = getResidueInfo(char, sequenceType);

            return (
              <button
                key={`seq-pos-${pos1}`}
                ref={isTarget ? targetTileRef : null}
                onClick={() => onSelectPos(pos1)}
                onMouseEnter={() => onHoverPos(pos1)}
                onMouseLeave={() => onHoverPos(null)}
                className={`group relative flex flex-col items-center justify-center min-w-[34px] w-9 h-14 rounded-lg transition-all duration-150 font-mono-seq text-center ${
                  isTarget
                    ? 'ring-2 ring-offset-2 ring-offset-slate-950 scale-105 z-10 font-bold shadow-lg'
                    : isHovered
                    ? 'scale-105 bg-slate-800 border-cyan-400 text-white z-10'
                    : inWindow
                    ? 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-750'
                    : 'bg-slate-900/40 border-slate-800/50 opacity-60 hover:opacity-100 hover:bg-slate-800/60'
                } border`}
                style={{
                  borderColor: isTarget ? verdictColor : isHovered ? '#00f2fe' : undefined,
                  boxShadow: isTarget ? `0 0 16px ${verdictColor}66` : undefined,
                  backgroundColor: isTarget ? `${verdictColor}22` : undefined,
                }}
              >
                {/* Position Index */}
                <span
                  className={`text-[9px] leading-tight mb-1 font-semibold ${
                    isTarget ? 'text-white' : inWindow ? 'text-cyan-400/80' : 'text-slate-500'
                  }`}
                >
                  {pos1 % 5 === 0 || isTarget ? pos1 : '•'}
                </span>

                {/* Residue / Mutation Representation */}
                {isTarget ? (
                  mode === 'mask' ? (
                    <span className="text-xs font-extrabold text-cyan-200 bg-cyan-950 px-1 py-0.5 rounded border border-cyan-400">
                      &lt;M&gt;
                    </span>
                  ) : (
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-[10px] line-through text-slate-400">{char}</span>
                      <span className="text-sm font-extrabold" style={{ color: verdictColor }}>
                        {mutantResidue}
                      </span>
                    </div>
                  )
                ) : (
                  <span
                    className="text-sm font-bold transition-colors"
                    style={{ color: info.color }}
                  >
                    {char}
                  </span>
                )}

                {/* Hover Tooltip Preview */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-30 bg-slate-950/90 border border-cyan-500/40 rounded px-2 py-0.5 text-[10px] text-cyan-200 whitespace-nowrap shadow-md">
                  #{pos1} {char} • {info.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

