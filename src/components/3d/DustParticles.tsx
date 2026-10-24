import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DustParticlesProps {
  count?: number;
}

export const DustParticles: React.FC<DustParticlesProps> = ({ count = 180 }) => {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, scales, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 22; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2; // Z

      scl[i] = Math.random() * 0.08 + 0.02;
      spd[i] = Math.random() * 0.3 + 0.1;
    }
    return [pos, scl, spd];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Gentle floating upward & sinusoidal drift
      array[i * 3 + 1] += speeds[i] * delta * 0.4;
      array[i * 3 + 0] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.005;

      // Wrap around Y bounds
      if (array[i * 3 + 1] > 12) {
        array[i * 3 + 1] = -12;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#00f2fe"
        transparent={true}
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

