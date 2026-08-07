'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { latLngToVector3 } from '@/lib/utils';
import { COUNTRIES_SAFETY } from '@/lib/constants';

const GLOBE_RADIUS = 2;

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useTexture(
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
  );

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.03;
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.7}
          metalness={0.2}
          emissive={'#0a1a3a'}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh scale={1.15}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color={'#8b5cf6'}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function SafetyMarker({
  position,
  color,
  label,
  score,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  score: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + position[0];
    if (ref.current) ref.current.position.y = position[1] + Math.sin(t * 2) * 0.02;
    if (pulseRef.current) {
      const p = (t * 0.4) % 1;
      pulseRef.current.scale.setScalar(1 + p * 2.5);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - p);
    }
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={pulseRef}>
        <ringGeometry args={[0.07, 0.09, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <Html distanceFactor={7} center className="pointer-events-none">
        <div
          className="whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-medium backdrop-blur-sm"
          style={{ background: `${color}33`, color: '#fff', border: `1px solid ${color}66` }}
        >
          {label} {score}
        </div>
      </Html>
    </group>
  );
}

function SafetyMarkers() {
  const markers = useMemo(
    () =>
      COUNTRIES_SAFETY.map((c) => {
        const score = c.score;
        const color = score >= 85 ? '#10b981' : score >= 70 ? '#0ea5e9' : score >= 50 ? '#f59e0b' : '#ef4444';
        return {
          position: latLngToVector3(c.coordinates.lat, c.coordinates.lng, GLOBE_RADIUS + 0.04),
          color,
          label: c.country,
          score,
        };
      }),
    []
  );

  return (
    <>
      {markers.map((m, i) => (
        <SafetyMarker key={i} {...m} />
      ))}
    </>
  );
}

export default function SafetyGlobe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} />
      <pointLight position={[-5, -2, -5]} intensity={0.4} color={'#ef4444'} />
      <Suspense fallback={null}>
        <Globe />
        <SafetyMarkers />
      </Suspense>
    </Canvas>
  );
}
