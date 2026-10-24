import React from 'react';
import { MaskCandidate } from '../../types';
import { BarChart3, Star } from 'lucide-react';

interface ProbabilityChartProps {
  candidates: MaskCandidate[];
  wtResidue: string;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({ candidates, wtResidue }) => {
  if (!candidates || candidates.length === 0) return null;

  const maxProb = Math.max(...candidates.map((c) => c.probability), 0.01);

  return (
    <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Top Candidate Residues (Ranked MLM Distribution)</span>
        </div>
        <span className="text-[10px] text-cyan-400 font-mono-seq">Softmax P(x)</span>
      </div>

      <div className="flex flex-col gap-2">
        {candidates.map((item, idx) => {
          const isWt = item.residue === wtResidue;
          const barWidthPercent = (item.probability / maxProb) * 100;
          const pctDisplay = (item.probability * 100).toFixed(1);

          return (
            <div key={item.residue} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono-seq">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px] w-3">#{idx + 1}</span>
                  <span className="font-bold text-white px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                    {item.residue}
                  </span>
                  <span className="text-[11px] text-slate-300 font-sans">{item.name}</span>
                  {isWt && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" /> WT
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-slate-400 text-[10px]">
                    log(P): {item.logProb.toFixed(2)}
                  </span>
                  <span className="font-bold text-cyan-300 text-xs w-12 text-right">
                    {pctDisplay}%
                  </span>
                </div>
              </div>

              {/* Bar Fill */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === 0
                      ? 'bg-gradient-to-r from-cyan-500 to-sky-300 shadow-neon-cyan'
                      : isWt
                      ? 'bg-cyan-500/70'
                      : 'bg-slate-700'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

