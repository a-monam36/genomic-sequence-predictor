import React from 'react';
import { Dna, Sparkles, Cpu, Layers, BarChart2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'visualizer' | 'controls' | 'results';
  onTabChange: (tab: 'visualizer' | 'controls' | 'results') => void;
  resultAvailable: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  resultAvailable
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-cyan-500/20 shadow-glass">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-sky-300 flex items-center justify-center shadow-neon-cyan group cursor-pointer">
            <Dna className="w-6 h-6 text-slate-950 animate-subtle-float" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400 opacity-20 blur-md group-hover:opacity-60 transition-opacity" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                HELIX // ESM-2
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm">
                v2.0 BioLab
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Genomic & Protein Sequence Intelligence • Masked MLM Inference • Variant Effect Scoring
            </div>
          </div>
        </div>

        {/* Model Spec Badge */}
        <div className="hidden md:flex items-center gap-2.5 text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-cyan-500/20">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Model:</span>
          <span className="font-mono-seq text-cyan-200 font-semibold">
            facebook/esm2_t6_8M_UR50D
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('visualizer')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'visualizer'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>3D Helix</span>
          </button>
          <button
            onClick={() => onTabChange('controls')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'controls'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Controls</span>
          </button>
          <button
            onClick={() => onTabChange('results')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'results'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Report</span>
            {resultAvailable && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
          </button>
        </div>
      </div>
    </header>
  );
};

