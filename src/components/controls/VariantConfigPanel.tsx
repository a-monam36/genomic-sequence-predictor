import React from 'react';
import { PredictionMode, SequenceType } from '../../types';
import { AMINO_ACIDS, DNA_BASES, getResidueInfo } from '../../utils/sequence';
import {
  Sliders,
  Sparkles,
  Server,
  Cpu,
  Layers,
  ArrowRight,
  HelpCircle,
  Play
} from 'lucide-react';

interface VariantConfigPanelProps {
  sequence: string;
  sequenceType: SequenceType;
  targetPos: number;
  onTargetPosChange: (pos: number) => void;
  wtResidue: string;
  mutantResidue: string;
  onMutantChange: (mut: string) => void;
  mode: PredictionMode;
  onModeChange: (mode: PredictionMode) => void;
  windowSize: number;
  onWindowSizeChange: (size: number) => void;
  useBackend: boolean;
  onToggleBackend: (use: boolean) => void;
  backendUrl: string;
  onBackendUrlChange: (url: string) => void;
  isLoading: boolean;
  onRunInference: () => void;
}

export const VariantConfigPanel: React.FC<VariantConfigPanelProps> = ({
  sequence,
  sequenceType,
  targetPos,
  onTargetPosChange,
  wtResidue,
  mutantResidue,
  onMutantChange,
  mode,
  onModeChange,
  windowSize,
  onWindowSizeChange,
  useBackend,
  onToggleBackend,
  backendUrl,
  onBackendUrlChange,
  isLoading,
  onRunInference
}) => {
  const maxPos = Math.max(1, sequence.length);
  const wtInfo = getResidueInfo(wtResidue, sequenceType);
  const candidateOptions = sequenceType === 'DNA' ? Object.keys(DNA_BASES) : Object.keys(AMINO_ACIDS);

  return (
    <div className="flex flex-col bg-slate-900/70 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden shadow-glass">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-cyan-500/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-sm text-slate-100">ESM-2 Variant & Site Selector</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Mode:</span>
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onModeChange('mutation')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                mode === 'mutation'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Point Variant
            </button>
            <button
              onClick={() => onModeChange('mask')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                mode === 'mask'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mask &lt;mask&gt;
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Row 1: Target Position (1-based) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label className="text-slate-300 font-medium">Target Residue Position (1-based index):</label>
            <span className="font-mono-seq text-cyan-300 font-bold">
              #{targetPos} / {maxPos}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={maxPos}
              value={targetPos}
              onChange={(e) => onTargetPosChange(Number(e.target.value))}
              className="flex-1 accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              min={1}
              max={maxPos}
              value={targetPos}
              onChange={(e) => {
                const val = Math.max(1, Math.min(maxPos, Number(e.target.value) || 1));
                onTargetPosChange(val);
              }}
              className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono-seq text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Row 2: Wild-Type vs Variant Residue Picker */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
          {/* Wild Type Display */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-mono-seq font-extrabold text-base border"
              style={{
                backgroundColor: `${wtInfo.color}22`,
                borderColor: wtInfo.color,
                color: wtInfo.color
              }}
            >
              {wtResidue}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Wild-Type</div>
              <div className="text-xs font-bold text-slate-200">{wtInfo.name}</div>
            </div>
          </div>

          {/* Transformation Arrow */}
          <div className="flex flex-col items-center">
            <ArrowRight className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-[9px] font-mono-seq text-slate-500">p.{wtResidue}{targetPos}{mode === 'mask' ? '?' : mutantResidue}</span>
          </div>

          {/* Target Variant or Mask */}
          {mode === 'mask' ? (
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/80 flex items-center justify-center font-mono-seq text-xs font-bold text-cyan-300 shadow-neon-cyan">
                &lt;mask&gt;
              </div>
              <div>
                <div className="text-[10px] text-cyan-400 uppercase font-semibold">Missing Site</div>
                <div className="text-xs font-bold text-slate-200">ESM-2 Inference</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <select
                value={mutantResidue}
                onChange={(e) => onMutantChange(e.target.value)}
                className="w-14 h-10 bg-slate-900 border border-cyan-500/40 rounded-xl text-center font-mono-seq font-bold text-white text-base focus:outline-none focus:border-cyan-400 cursor-pointer shadow-neon-cyan"
              >
                {candidateOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Mutant</div>
                <div className="text-xs font-bold text-slate-200">
                  {getResidueInfo(mutantResidue, sequenceType).name}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Context Window Slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Context Window (±positions):</span>
            </span>
            <span className="font-mono-seq text-cyan-300 font-bold">±{windowSize}</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={windowSize}
            onChange={(e) => onWindowSizeChange(Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Backend vs Simulation Toggle */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {useBackend ? (
                <Server className="w-4 h-4 text-emerald-400" />
              ) : (
                <Cpu className="w-4 h-4 text-cyan-400" />
              )}
              <span className="text-xs font-semibold text-slate-200">
                {useBackend ? 'PyTorch ESM-2 Backend' : 'Client-Side Neural Simulation'}
              </span>
            </div>
            <button
              onClick={() => onToggleBackend(!useBackend)}
              className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                useBackend
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {useBackend ? 'Connected' : 'Switch Mode'}
            </button>
          </div>

          {useBackend && (
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => onBackendUrlChange(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono-seq text-slate-300 focus:outline-none focus:border-cyan-400"
            />
          )}

          <div className="text-[11px] text-slate-400 leading-snug">
            {useBackend
              ? 'Calls local facebook/esm2_t6_8M_UR50D API server with real masked logits.'
              : 'Standalone instant simulation calibrated with BLOSUM62 & physicochemical distance matrices.'}
          </div>
        </div>

        {/* CTA Button: Run Inference */}
        <button
          onClick={onRunInference}
          disabled={isLoading || sequence.length === 0}
          className="w-full relative group overflow-hidden py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-300 hover:from-cyan-300 hover:to-white transition-all shadow-neon-cyan active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Evaluating Masked MLM...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950" />
              <span>
                {mode === 'mask'
                  ? 'Predict Missing Residue (<mask\\>)'
                  : `Score Variant Effect (p.${wtResidue}${targetPos}${mutantResidue})`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

