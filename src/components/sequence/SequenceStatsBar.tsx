import React, { useState } from 'react';
import { SequenceStats, SequenceType } from '../../types';
import { Dna, Activity, Scale, Zap, Copy, Check } from 'lucide-react';

interface SequenceStatsBarProps {
  stats: SequenceStats;
  sequence: string;
}

export const SequenceStatsBar: React.FC<SequenceStatsBarProps> = ({ stats, sequence }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sequence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
      {/* Metric 1: Sequence Length & Type */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-cyan-500/15 rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Dna className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chain Length</span>
          </div>
          <div className="text-lg font-bold text-white font-mono-seq mt-0.5">
            {stats.length.toLocaleString()}{' '}
            <span className="text-xs font-normal text-cyan-300">
              {stats.type === 'DNA' ? 'bp' : 'aa'}
            </span>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
          {stats.type}
        </span>
      </div>

      {/* Metric 2: GC Content or Hydrophobic Ratio */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-cyan-500/15 rounded-xl p-3">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>{stats.type === 'DNA' ? 'GC Content' : 'Hydrophobicity'}</span>
        </div>
        <div className="text-lg font-bold text-white font-mono-seq mt-0.5 flex items-baseline gap-2">
          <span>{stats.type === 'DNA' ? `${stats.gcContent ?? 0}%` : `${stats.hydrophobicRatio}%`}</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden self-center">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{
                width: `${stats.type === 'DNA' ? stats.gcContent ?? 0 : stats.hydrophobicRatio}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Metric 3: Molecular Weight */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-cyan-500/15 rounded-xl p-3">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-cyan-400" />
          <span>Est. Mass</span>
        </div>
        <div className="text-lg font-bold text-white font-mono-seq mt-0.5">
          {stats.molecularWeight}{' '}
          <span className="text-xs font-normal text-slate-400">kDa</span>
        </div>
      </div>

      {/* Metric 4: Net Charge & Copy */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-cyan-500/15 rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Net Charge</span>
          </div>
          <div className="text-lg font-bold font-mono-seq mt-0.5" style={{
            color: stats.chargeEstimate > 0 ? '#38bdf8' : stats.chargeEstimate < 0 ? '#f43f5e' : '#cbd5e1'
          }}>
            {stats.chargeEstimate > 0 ? `+${stats.chargeEstimate}` : stats.chargeEstimate}
            <span className="text-xs font-normal text-slate-400 ml-1">e</span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          title="Copy sequence"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-200 border border-slate-700 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

