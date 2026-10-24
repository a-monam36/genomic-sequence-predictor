import React, { useState } from 'react';
import { SequencePreset } from '../../types';
import { PRESETS } from '../../utils/presets';
import { Terminal, BookOpen, Trash2, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

interface SequenceInputConsoleProps {
  rawInput: string;
  onInputChange: (value: string) => void;
  onSelectPreset: (preset: SequencePreset) => void;
  activePresetId?: string;
  detectedHeader: string | null;
  isValid: boolean;
  errorMessage?: string;
}

export const SequenceInputConsole: React.FC<SequenceInputConsoleProps> = ({
  rawInput,
  onInputChange,
  onSelectPreset,
  activePresetId,
  detectedHeader,
  isValid,
  errorMessage
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col bg-slate-900/70 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden shadow-glass">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-cyan-500/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-sm text-slate-100">Sequence Ingestion Console</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {isValid ? (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[11px]">
              <CheckCircle2 className="w-3 h-3" /> Valid Sequence
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full text-[11px]">
              <AlertTriangle className="w-3 h-3" /> Waiting for input
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3.5">
        {/* Preset Quick Selectors */}
        <div>
          <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Reference Presets:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPreset(p)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400/80 text-cyan-100 shadow-neon-cyan'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                      {p.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{p.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Textarea with FASTA & Auto-sanitizer */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Raw or FASTA string (auto-sanitized):</span>
            </span>
            {rawInput.length > 0 && (
              <button
                onClick={() => onInputChange('')}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <textarea
            value={rawInput}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder=">header&#10;MLWWEEVEDCYEREDVQKKTFTKWVNAQFSKFGKQ..."
            rows={isExpanded ? 8 : 4}
            className="w-full bg-slate-950/90 border border-slate-700 rounded-xl p-3 text-xs font-mono-seq text-cyan-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none shadow-inner"
          />

          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-slate-500 italic">
              {detectedHeader ? `Header: ${detectedHeader}` : 'Strips numbers, whitespace & FASTA header automatically'}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

