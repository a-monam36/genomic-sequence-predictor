import React, { useState } from 'react';
import { VariantResult, SequenceType } from '../../types';
import { DisruptionGauge } from './DisruptionGauge';
import { ProbabilityChart } from './ProbabilityChart';
import {
  FileText,
  Download,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Cpu
} from 'lucide-react';

interface VariantReportCardProps {
  result: VariantResult | null;
  sequence: string;
  sequenceType: SequenceType;
}

export const VariantReportCard: React.FC<VariantReportCardProps> = ({
  result,
  sequence,
  sequenceType
}) => {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 backdrop-blur-md border border-dashed border-cyan-500/20 rounded-2xl text-center">
        <Sparkles className="w-8 h-8 text-cyan-400/60 mb-2 animate-pulse" />
        <div className="text-sm font-semibold text-slate-300">No Variant Evaluation Yet</div>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select a position on the 3D helix or sequence rail, configure a variant or mask, and run ESM-2 inference.
        </p>
      </div>
    );
  }

  // Verdict icon & badge styling
  const getVerdictElements = () => {
    switch (result.verdict) {
      case 'pathogenic':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          badgeBg: 'bg-rose-950/80 border-rose-500/60 text-rose-200',
          badgeText: 'Highly Disruptive / Likely Pathogenic'
        };
      case 'vus':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          badgeBg: 'bg-amber-950/80 border-amber-500/60 text-amber-200',
          badgeText: 'Moderately Disruptive / VUS'
        };
      case 'tolerated':
      default:
        return {
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          badgeBg: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200',
          badgeText: 'Tolerated / Likely Benign'
        };
    }
  };

  const { icon, badgeBg, badgeText } = getVerdictElements();

  const handleCopyTextReport = () => {
    const report = `=====================================================
HELIX-ESM // VARIANT & RESIDUE PREDICTION REPORT
=====================================================
Target Site:         Position ${result.targetPos}
Wild-Type Residue:   ${result.wtResidue}
${result.mode === 'mask' ? 'Predicted Residue:  ' : 'Mutant Residue:     '}${result.mutResidue}
Evaluation Mode:     ${result.mode === 'mask' ? 'Missing Site Inference (<mask\\>)' : 'Point Mutation Scoring'}
Log-Prob Wild-Type:  ${result.p_wt}
Log-Prob Mutant:     ${result.p_mut}
Log-Likelihood Ratio: ${result.llr}
Verdict:             ${result.verdictLabel}
Engine Source:       ${result.source === 'backend' ? 'PyTorch Local Server (esm2_t6_8M_UR50D)' : 'ESM-2 Simulated Engine'}
Timestamp:           ${result.timestamp}
Context Window:      ${result.contextSnippet.startPos}-${result.contextSnippet.endPos}
[...${result.contextSnippet.left}] ${result.contextSnippet.target} [${result.contextSnippet.right}...]
=====================================================`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esm2_variant_pos${result.targetPos}_${result.wtResidue}to${result.mutResidue}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFasta = () => {
    const idx = result.targetPos - 1;
    const mutatedSeq = sequence.slice(0, idx) + result.mutResidue + sequence.slice(idx + 1);
    const fastaContent = `>HelixESM_variant_p.${result.wtResidue}${result.targetPos}${result.mutResidue} | LLR=${result.llr} | Verdict=${result.verdictLabel}\n${mutatedSeq}\n`;
    const blob = new Blob([fastaContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `variant_${result.wtResidue}${result.targetPos}${result.mutResidue}.fasta`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden shadow-glass">
      {/* Header with Verdict */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-cyan-500/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-sm text-slate-100">Prediction Intelligence Report</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{result.latencyMs}ms</span>
          <span>•</span>
          <span className="text-cyan-300 font-mono-seq">{result.source}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Verdict Banner */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${badgeBg}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black/40">{icon}</div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                ESM-2 Verdict
              </div>
              <div className="text-base font-extrabold">{badgeText}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">LLR Score</div>
            <div className="text-xl font-black font-mono-seq">
              {result.llr > 0 ? `+${result.llr.toFixed(4)}` : result.llr.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          {result.description}
        </p>

        {/* Dual Visuals: Disruption Severity Gauge + Prob Distribution Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DisruptionGauge
            llr={result.llr}
            verdict={result.verdict}
            verdictColor={result.verdictColor}
          />
          <ProbabilityChart
            candidates={result.topCandidates}
            wtResidue={result.wtResidue}
          />
        </div>

        {/* Log-Probabilities Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">log(P_wt)</div>
            <div className="text-sm font-bold font-mono-seq text-cyan-300 mt-0.5">
              {result.p_wt.toFixed(4)}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Wild-Type {result.wtResidue}</div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">log(P_mut)</div>
            <div className="text-sm font-bold font-mono-seq text-cyan-300 mt-0.5">
              {result.p_mut.toFixed(4)}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">
              {result.mode === 'mask' ? `Top: ${result.mutResidue}` : `Mutant ${result.mutResidue}`}
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">LLR (Δlog-P)</div>
            <div className="text-sm font-bold font-mono-seq text-white mt-0.5" style={{ color: result.verdictColor }}>
              {result.llr.toFixed(4)}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">log(P_mut) - log(P_wt)</div>
          </div>
        </div>

        {/* Context Snippet Display */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between">
            <span>Local Context Snippet (Pos {result.contextSnippet.startPos}-{result.contextSnippet.endPos}):</span>
            <span className="text-cyan-400 font-mono-seq">Window ±50</span>
          </div>
          <div className="text-xs font-mono-seq text-slate-400 overflow-x-auto whitespace-nowrap py-1">
            <span className="opacity-70">{result.contextSnippet.left}</span>
            <span className="px-1.5 py-0.5 rounded font-black text-black bg-cyan-300 mx-0.5 shadow-neon-cyan">
              {result.contextSnippet.target}
            </span>
            <span className="opacity-70">{result.contextSnippet.right}</span>
          </div>
        </div>

        {/* One-Click Action & Export Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={handleCopyTextReport}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Report Copied' : 'Copy Report'}</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON Report</span>
          </button>

          <button
            onClick={handleDownloadFasta}
            className="flex-1 py-2 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-cyan-800 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-300" />
            <span>Mutated FASTA</span>
          </button>
        </div>
      </div>
    </div>
  );
};

