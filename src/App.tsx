import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/common/Header';
import { HelixCanvas } from './components/3d/HelixCanvas';
import { SequenceViewer } from './components/sequence/SequenceViewer';
import { SequenceStatsBar } from './components/sequence/SequenceStatsBar';
import { SequenceInputConsole } from './components/controls/SequenceInputConsole';
import { VariantConfigPanel } from './components/controls/VariantConfigPanel';
import { VariantReportCard } from './components/analytics/VariantReportCard';
import { sanitizeSequence } from './utils/sequence';
import { PRESETS } from './utils/presets';
import { runInference } from './services/inference';
import { SequencePreset, PredictionMode, VariantResult } from './types';

export function App() {
  // Active Preset & Sequence Input
  const defaultPreset = PRESETS[0]; // Dystrophin Human DMD
  const [activePresetId, setActivePresetId] = useState<string>(defaultPreset.id);
  const [rawInput, setRawInput] = useState<string>(defaultPreset.sequence);

  // Responsive Mobile Tab State
  const [mobileTab, setMobileTab] = useState<'visualizer' | 'controls' | 'results'>('visualizer');

  // Interactive Target & Mutation State
  const [targetPos, setTargetPos] = useState<number>(defaultPreset.defaultTargetPos);
  const [mutantResidue, setMutantResidue] = useState<string>(defaultPreset.defaultMutant);
  const [mode, setMode] = useState<PredictionMode>('mutation');
  const [windowSize, setWindowSize] = useState<number>(50);
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);

  // Backend Integration State
  const [useBackend, setUseBackend] = useState<boolean>(false);
  const [backendUrl, setBackendUrl] = useState<string>('http://localhost:8000');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VariantResult | null>(null);

  // Sanitize raw input
  const { cleanSeq, header, detectedType, stats } = useMemo(() => {
    return sanitizeSequence(rawInput);
  }, [rawInput]);

  // Ensure targetPos remains within valid bounds
  useEffect(() => {
    if (cleanSeq.length > 0) {
      if (targetPos > cleanSeq.length) {
        setTargetPos(cleanSeq.length);
      } else if (targetPos < 1) {
        setTargetPos(1);
      }
    }
  }, [cleanSeq.length, targetPos]);

  // Current wild-type residue at target position
  const currentWt = cleanSeq[targetPos - 1] || 'L';

  // Handle preset selection
  const handleSelectPreset = (preset: SequencePreset) => {
    setActivePresetId(preset.id);
    setRawInput(preset.sequence);
    setTargetPos(preset.defaultTargetPos);
    setMutantResidue(preset.defaultMutant);
    setMode('mutation');
  };

  // Inference execution
  const executeInference = useCallback(async () => {
    if (!cleanSeq || cleanSeq.length === 0) return;
    setIsLoading(true);

    try {
      const res = await runInference({
        sequence: cleanSeq,
        targetPos,
        wtResidue: currentWt,
        mutResidue: mutantResidue,
        mode,
        windowSize,
        backendUrl,
        useBackend
      });
      setResult(res);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cleanSeq, targetPos, currentWt, mutantResidue, mode, windowSize, backendUrl, useBackend]);

  // Trigger initial inference once on mount so app opens with rich preview
  useEffect(() => {
    if (cleanSeq.length > 0 && !result) {
      executeInference();
    }
  }, [cleanSeq, executeInference, result]);

  // Active verdict color
  const verdictColor = result?.verdictColor || '#00f2fe';

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100">
      {/* Top Application Header */}
      <Header
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        resultAvailable={result !== null}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-5">
        {/* Real-time Biological Metrics Bar */}
        <SequenceStatsBar stats={stats} sequence={cleanSeq} />

        {/* Desktop Split Workspace (60% Left Visualizer Rail / 40% Right Controls & Intelligence) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          
          {/* Left Column (60% on desktop: lg:col-span-7) */}
          <div
            className={`flex flex-col gap-4 lg:col-span-7 ${
              mobileTab === 'visualizer' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* 3D Bioluminescent Helix Canvas */}
            <div className="w-full h-[480px] sm:h-[520px] rounded-2xl overflow-hidden border border-cyan-500/25 shadow-glass glow-border-cyan relative">
              <HelixCanvas
                sequence={cleanSeq}
                sequenceType={detectedType}
                targetPos={targetPos}
                onSelectPos={(pos) => setTargetPos(pos)}
                hoveredPos={hoveredPos}
                onHoverPos={(pos) => setHoveredPos(pos)}
                verdictColor={verdictColor}
                verdictLabel={result?.verdictLabel}
              />
            </div>

            {/* Interactive Scrollable Sequence Rail */}
            <SequenceViewer
              sequence={cleanSeq}
              sequenceType={detectedType}
              targetPos={targetPos}
              onSelectPos={(pos) => setTargetPos(pos)}
              hoveredPos={hoveredPos}
              onHoverPos={(pos) => setHoveredPos(pos)}
              windowSize={windowSize}
              mode={mode}
              mutantResidue={mutantResidue}
              verdictColor={verdictColor}
            />
          </div>

          {/* Right Column (40% on desktop: lg:col-span-5) */}
          <div
            className={`flex flex-col gap-4 lg:col-span-5 ${
              mobileTab === 'controls' || mobileTab === 'results' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Controls Tab / Section */}
            <div className={`flex flex-col gap-4 ${mobileTab === 'results' ? 'hidden lg:flex' : 'flex'}`}>
              {/* Sequence Ingestion Console */}
              <SequenceInputConsole
                rawInput={rawInput}
                onInputChange={(val) => {
                  setRawInput(val);
                  setActivePresetId('');
                }}
                onSelectPreset={handleSelectPreset}
                activePresetId={activePresetId}
                detectedHeader={header}
                isValid={stats.valid}
              />

              {/* ESM-2 Variant & Site Selector */}
              <VariantConfigPanel
                sequence={cleanSeq}
                sequenceType={detectedType}
                targetPos={targetPos}
                onTargetPosChange={(pos) => setTargetPos(pos)}
                wtResidue={currentWt}
                mutantResidue={mutantResidue}
                onMutantChange={(mut) => setMutantResidue(mut)}
                mode={mode}
                onModeChange={(m) => setMode(m)}
                windowSize={windowSize}
                onWindowSizeChange={(s) => setWindowSize(s)}
                useBackend={useBackend}
                onToggleBackend={(use) => setUseBackend(use)}
                backendUrl={backendUrl}
                onBackendUrlChange={(url) => setBackendUrl(url)}
                isLoading={isLoading}
                onRunInference={executeInference}
              />
            </div>

            {/* Results & Intelligence Report Card */}
            <div className={`flex flex-col ${mobileTab === 'controls' ? 'hidden lg:flex' : 'flex'}`}>
              <VariantReportCard
                result={result}
                sequence={cleanSeq}
                sequenceType={detectedType}
              />
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-cyan-500/10 bg-slate-950/70 py-4 px-6 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 max-w-[1720px] w-full mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Bioluminescent Genomic & Protein Sequence Explorer</span>
        </div>
        <div className="font-mono-seq text-[11px] text-slate-400">
          ESM-2 Architecture: facebook/esm2_t6_8M_UR50D • LLR Thresholds: [-3.0 / -1.5]
        </div>
      </footer>
    </div>
  );
}

export default App;

