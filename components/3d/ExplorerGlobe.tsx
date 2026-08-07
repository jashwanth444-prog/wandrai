'use client';

import { useRef, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { latLngToVector3 } from '@/lib/utils';
import { COUNTRY_DETAILS } from '@/lib/feature-constants';

const GLOBE_RADIUS = 2;

type ExplorerMarkerProps = {
  position: [number, number, number];
  countryId: string;
  label: string;
  flag: string;
  color: string;
  isSelected: boolean;
  onClick: (countryId: string) => void;
};

function ExplorerMarker({
  position,
  countryId,
  label,
  flag,
  color,
  isSelected,
  onClick,
}: ExplorerMarkerProps) {
  const ref = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + position[0];
    if (ref.current) ref.current.position.y = position[1] + Math.sin(t * 2) * 0.02;

    if (isSelected && pulseRef.current) {
      const p = (t * 0.6) % 1;
      pulseRef.current.scale.setScalar(1 + p * 3.5);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - p);
    }

    if (ringRef.current) {
      const target = hovered || isSelected ? 1.6 : 1;
      ringRef.current.scale.x = THREE.MathUtils.lerp(ringRef.current.scale.x, target, 0.15);
      ringRef.current.scale.y = THREE.MathUtils.lerp(ringRef.current.scale.y, target, 0.15);
      ringRef.current.scale.z = THREE.MathUtils.lerp(ringRef.current.scale.z, target, 0.15);
    }
  });

  return (
    <group position={position}>
      {/* Click target (slightly larger, invisible) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick(countryId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Core marker */}
      <mesh ref={ref}>
        <sphereGeometry args={[isSelected ? 0.08 : 0.06, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Hover ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Pulsing ring for selected marker */}
      {isSelected && (
        <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.1, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      <Html
        distanceFactor={7}
        center
        className="pointer-events-none select-none"
        zIndexRange={[40, 0]}
      >
        <div
          className="flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-medium backdrop-blur-sm transition-all"
          style={{
            background: `${color}33`,
            color: '#fff',
            border: `1px solid ${color}66`,
            transform: hovered || isSelected ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          <span className="text-[10px] leading-none">{flag}</span>
          <span>{label}</span>
        </div>
      </Html>
    </group>
  );
}

function ExplorerMarkers({
  onCountrySelect,
  selectedCountryId,
}: {
  onCountrySelect: (countryId: string) => void;
  selectedCountryId: string | null;
}) {
  const markers = useMemo(
    () =>
      COUNTRY_DETAILS.map((c) => {
        const score = c.safetyScore;
        const color =
          score >= 85 ? '#10b981' : score >= 70 ? '#0ea5e9' : score >= 50 ? '#f59e0b' : '#ef4444';
        return {
          position: latLngToVector3(c.coordinates.lat, c.coordinates.lng, GLOBE_RADIUS + 0.04),
          countryId: c.id,
          label: c.name,
          flag: c.flag,
          color,
          score,
        };
      }),
    []
  );

  return (
    <>
      {markers.map((m) => (
        <ExplorerMarker
          key={m.countryId}
          {...m}
          isSelected={selectedCountryId === m.countryId}
          onClick={onCountrySelect}
        />
      ))}
    </>
  );
}

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
      {/* Atmosphere glow */}
      <mesh scale={1.15}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color={'#3b82f6'}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function ExplorerGlobe({
  onCountrySelect,
  selectedCountryId,
}: {
  onCountrySelect: (countryId: string) => void;
  selectedCountryId: string | null;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} />
      <pointLight position={[-5, -2, -5]} intensity={0.4} color={'#3b82f6'} />
      <Suspense fallback={null}>
        <Globe />
        <ExplorerMarkers
          onCountrySelect={onCountrySelect}
          selectedCountryId={selectedCountryId}
        />
      </Suspense>
    </Canvas>
  );
}
