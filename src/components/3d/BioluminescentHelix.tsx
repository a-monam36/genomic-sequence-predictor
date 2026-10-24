import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getResidueInfo } from '../../utils/sequence';
import { SequenceType } from '../../types';

interface BioluminescentHelixProps {
  sequence: string;
  sequenceType: SequenceType;
  targetPos: number;
  onSelectPos: (pos: number) => void;
  hoveredPos: number | null;
  onHoverPos: (pos: number | null) => void;
  autoRotate: boolean;
  verdictColor?: string;
}

export const BioluminescentHelix: React.FC<BioluminescentHelixProps> = ({
  sequence,
  sequenceType,
  targetPos,
  onSelectPos,
  hoveredPos,
  onHoverPos,
  autoRotate,
  verdictColor = '#00f2fe'
}) => {
  const groupRef = useRef<THREE.Group>(null!);

  // Determine visible window of residues for 3D representation
  // We represent ~32-40 rungs centered around targetPos or beginning
  const NUM_RUNGS = 36;
  const HELIX_RADIUS = 2.4;
  const HELIX_HEIGHT = 18;
  const TURNS = 3.5;

  const { startPos, rungIndices } = useMemo(() => {
    const seqLen = Math.max(1, sequence.length);
    let start = Math.max(1, targetPos - Math.floor(NUM_RUNGS / 2));
    if (start + NUM_RUNGS - 1 > seqLen) {
      start = Math.max(1, seqLen - NUM_RUNGS + 1);
    }
    const indices: number[] = [];
    for (let i = 0; i < NUM_RUNGS; i++) {
      const pos = start + i;
      if (pos <= seqLen) {
        indices.push(pos);
      }
    }
    return { startPos: start, rungIndices: indices };
  }, [sequence.length, targetPos]);

  // Generate continuous procedural curves for Strand A & Strand B
  const { curveA, curveB, rungData } = useMemo(() => {
    const ptsA: THREE.Vector3[] = [];
    const ptsB: THREE.Vector3[] = [];
    const rungs: {
      pos1based: number;
      charA: string;
      charB: string;
      colorA: string;
      colorB: string;
      ptA: THREE.Vector3;
      ptB: THREE.Vector3;
      center: THREE.Vector3;
      length: number;
      orientation: THREE.Quaternion;
    }[] = [];

    const totalSteps = NUM_RUNGS;
    const yStep = HELIX_HEIGHT / (totalSteps - 1);

    for (let i = 0; i < totalSteps; i++) {
      const t = i / (totalSteps - 1);
      const angle = t * TURNS * Math.PI * 2;
      const y = (t - 0.5) * HELIX_HEIGHT;

      const pA = new THREE.Vector3(
        Math.cos(angle) * HELIX_RADIUS,
        y,
        Math.sin(angle) * HELIX_RADIUS
      );

      const pB = new THREE.Vector3(
        Math.cos(angle + Math.PI) * HELIX_RADIUS,
        y,
        Math.sin(angle + Math.PI) * HELIX_RADIUS
      );

      ptsA.push(pA);
      ptsB.push(pB);

      // If this step corresponds to an actual residue index
      if (i < rungIndices.length) {
        const pos1 = rungIndices[i];
        const charA = sequence[pos1 - 1] || 'A';
        const infoA = getResidueInfo(charA, sequenceType);

        // Strand B complement (for DNA) or paired representation
        let charB = 'T';
        if (sequenceType === 'DNA') {
          charB = charA === 'A' ? 'T' : charA === 'T' ? 'A' : charA === 'G' ? 'C' : 'G';
        } else {
          // In protein view, complement strand represents paired peptide backbone / secondary motif
          charB = charA;
        }
        const infoB = getResidueInfo(charB, sequenceType);

        const center = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(pB, pA);
        const len = dir.length();
        dir.normalize();

        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir
        );

        rungs.push({
          pos1based: pos1,
          charA,
          charB,
          colorA: infoA.color,
          colorB: infoB.color,
          ptA: pA,
          ptB: pB,
          center,
          length: len,
          orientation: quat
        });
      }
    }

    const cA = new THREE.CatmullRomCurve3(ptsA);
    const cB = new THREE.CatmullRomCurve3(ptsB);

    return { curveA: cA, curveB: cB, rungData: rungs };
  }, [sequence, sequenceType, rungIndices]);

  // Background ambient helix curves for cinematic scale
  const bgHelixCurve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const angle = t * 4 * Math.PI * 2;
      const y = (t - 0.5) * 32;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * 3.5 - 7,
        y,
        Math.sin(angle) * 3.5 - 14
      ));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  // Frame loop for gentle rotation and bioluminescent pulsation
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.45;
    }
    // Subtle breathing float on Y
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background Cinematic Faint Helix */}
      <mesh>
        <tubeGeometry args={[bgHelixCurve, 80, 0.08, 8, false]} />
        <meshBasicMaterial
          color="#0e7490"
          transparent={true}
          opacity={0.18}
          wireframe={true}
        />
      </mesh>

      {/* Strand A Backbone Tube (Glass-like Bioluminescent) */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[curveA, 128, 0.16, 16, false]} />
        <meshPhysicalMaterial
          color="#06b6d4"
          emissive="#00f2fe"
          emissiveIntensity={0.55}
          roughness={0.12}
          metalness={0.1}
          transmission={0.65}
          ior={1.4}
          transparent={true}
          opacity={0.88}
        />
      </mesh>

      {/* Strand B Backbone Tube */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[curveB, 128, 0.16, 16, false]} />
        <meshPhysicalMaterial
          color="#0284c7"
          emissive="#38bdf8"
          emissiveIntensity={0.45}
          roughness={0.15}
          metalness={0.1}
          transmission={0.6}
          ior={1.4}
          transparent={true}
          opacity={0.85}
        />
      </mesh>

      {/* Base Pair Rungs & Spherical Residue Nodes */}
      {rungData.map((rung) => {
        const isTarget = rung.pos1based === targetPos;
        const isHovered = rung.pos1based === hoveredPos;

        // Dynamic emissive intensity and colors
        let connectorColor = '#0e7490';
        let connectorEmissive = '#0891b2';
        let connectorIntensity = 0.25;

        if (isTarget) {
          connectorColor = verdictColor;
          connectorEmissive = verdictColor;
          connectorIntensity = 1.4;
        } else if (isHovered) {
          connectorColor = '#ffffff';
          connectorEmissive = '#00f2fe';
          connectorIntensity = 0.9;
        }

        return (
          <group
            key={`rung-${rung.pos1based}`}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHoverPos(rung.pos1based);
            }}
            onPointerOut={() => onHoverPos(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPos(rung.pos1based);
            }}
          >
            {/* Cylindrical Connector Rung */}
            <mesh
              position={rung.center}
              quaternion={rung.orientation}
              scale={isTarget ? [1.5, 1, 1.5] : [1, 1, 1]}
            >
              <cylinderGeometry args={[0.07, 0.07, rung.length * 0.94, 12]} />
              <meshStandardMaterial
                color={connectorColor}
                emissive={connectorEmissive}
                emissiveIntensity={connectorIntensity}
                roughness={0.25}
                transparent={true}
                opacity={isTarget ? 0.95 : 0.65}
              />
            </mesh>

            {/* Strand A Node Sphere */}
            <mesh position={rung.ptA}>
              <sphereGeometry args={[isTarget ? 0.38 : isHovered ? 0.32 : 0.22, 16, 16]} />
              <meshStandardMaterial
                color={isTarget ? verdictColor : isHovered ? '#ffffff' : rung.colorA}
                emissive={isTarget ? verdictColor : isHovered ? '#00f2fe' : rung.colorA}
                emissiveIntensity={isTarget ? 1.6 : isHovered ? 1.2 : 0.5}
                roughness={0.2}
              />
            </mesh>

            {/* Strand B Node Sphere */}
            <mesh position={rung.ptB}>
              <sphereGeometry args={[isTarget ? 0.38 : isHovered ? 0.32 : 0.22, 16, 16]} />
              <meshStandardMaterial
                color={isTarget ? verdictColor : isHovered ? '#ffffff' : rung.colorB}
                emissive={isTarget ? verdictColor : isHovered ? '#00f2fe' : rung.colorB}
                emissiveIntensity={isTarget ? 1.6 : isHovered ? 1.2 : 0.5}
                roughness={0.2}
              />
            </mesh>

            {/* Target Position Pulsing Halo Ring */}
            {isTarget && (
              <group position={rung.center}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.6, 1.75, 32]} />
                  <meshBasicMaterial
                    color={verdictColor}
                    side={THREE.DoubleSide}
                    transparent={true}
                    opacity={0.8}
                  />
                </mesh>
                {/* Secondary halo ring */}
                <mesh rotation={[Math.PI / 4, 0, 0]}>
                  <ringGeometry args={[2.0, 2.08, 32]} />
                  <meshBasicMaterial
                    color={verdictColor}
                    side={THREE.DoubleSide}
                    transparent={true}
                    opacity={0.35}
                  />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

