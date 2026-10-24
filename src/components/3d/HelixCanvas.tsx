import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BioluminescentHelix } from './BioluminescentHelix';
import { DustParticles } from './DustParticles';
import { SequenceType } from '../../types';
import { getResidueInfo } from '../../utils/sequence';
import { RotateCw, Pause, Play, Compass, Eye, Sparkles } from 'lucide-react';

interface HelixCanvasProps {
  sequence: string;
  sequenceType: SequenceType;
  targetPos: number;
  onSelectPos: (pos: number) => void;
  hoveredPos: number | null;
  onHoverPos: (pos: number | null) => void;
  verdictColor?: string;
  verdictLabel?: string;
}

export const HelixCanvas: React.FC<HelixCanvasProps> = ({
  sequence,
  sequenceType,
  targetPos,
  onSelectPos,
  hoveredPos,
  onHoverPos,
  verdictColor = '#00f2fe',
  verdictLabel
}) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl>(null!);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Inspect hovered or target residue
  const inspectPos = hoveredPos || targetPos;
  const inspectChar = sequence[inspectPos - 1] || 'A';
  const inspectInfo = getResidueInfo(inspectChar, sequenceType);

  return (
    <div className="relative w-full h-full min-h-[420px] bg-gradient-to-b from-[#030712] via-[#051124] to-[#010409] overflow-hidden select-none">
      {/* Bioluminescent Canvas Background Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.15)_0%,_transparent_70%)]" />
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none bg-cyan-500/5 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none bg-blue-600/5 blur-3xl rounded-full" />

      {/* Floating HUD Top Left: Active Node Telemetry */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <div className="backdrop-blur-md bg-slate-900/75 border border-cyan-500/30 rounded-xl px-3.5 py-2.5 shadow-neon-cyan flex items-center gap-3">
          <div
            className="w-3.5 h-3.5 rounded-full animate-pulse shadow-md"
            style={{ backgroundColor: inspectPos === targetPos ? verdictColor : inspectInfo.color }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-cyan-300 font-mono-seq">
                SITE #{inspectPos}
              </span>
              {inspectPos === targetPos && (
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
                  Target
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{inspectChar}</span>
              <span className="text-xs font-normal text-slate-300">({inspectInfo.name})</span>
              <span className="text-[11px] text-cyan-400 capitalize px-1 bg-cyan-950/60 rounded">
                {inspectInfo.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating HUD Top Right: Interactive 3D Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? "Pause helix rotation" : "Resume helix rotation"}
          className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
            autoRotate
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 shadow-neon-cyan'
              : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset Camera View"
          className="p-2 rounded-xl backdrop-blur-md bg-slate-900/60 border border-slate-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-200 transition-all"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Floating HUD Bottom Right: Navigation Instruction Pill */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 text-[11px] text-cyan-300/80 backdrop-blur-md bg-slate-950/60 px-3 py-1.5 rounded-full border border-cyan-500/20">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Drag to orbit • Scroll to zoom • Click rung to target</span>
      </div>

      {/* 3D Three.js Fiber Canvas */}
      <Canvas
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={45} />
        
        {/* Deep Bio-Lab Emissive Illumination */}
        <ambientLight intensity={0.5} color="#082f49" />
        <pointLight position={[0, 6, 4]} intensity={2.5} color="#00f2fe" distance={25} />
        <pointLight position={[0, -6, -4]} intensity={2.0} color="#1d4ed8" distance={25} />
        <pointLight position={[-8, 0, 8]} intensity={1.5} color="#06b6d4" distance={20} />
        <directionalLight position={[10, 15, 10]} intensity={1.0} color="#e0f2fe" />

        {/* Microscopic Bioluminescent Dust Particles */}
        <DustParticles count={200} />

        {/* Continuous Bioluminescent DNA Helix */}
        <BioluminescentHelix
          sequence={sequence}
          sequenceType={sequenceType}
          targetPos={targetPos}
          onSelectPos={onSelectPos}
          hoveredPos={hoveredPos}
          onHoverPos={onHoverPos}
          autoRotate={autoRotate}
          verdictColor={verdictColor}
        />

        {/* Orbit Controls with Smooth Damping */}
        <OrbitControls
          ref={controlsRef}
          enableDamping={true}
          dampingFactor={0.06}
          minDistance={5}
          maxDistance={32}
          maxPolarAngle={Math.PI - 0.15}
          minPolarAngle={0.15}
        />
      </Canvas>
    </div>
  );
};

