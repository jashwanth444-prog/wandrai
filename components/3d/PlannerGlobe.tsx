'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { latLngToVector3 } from '@/lib/utils';
import type { Destination } from '@/types';

const GLOBE_RADIUS = 2;

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useTexture(
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
  );

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.04;
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

function LatRings() {
  return (
    <>
      {[0.3, 0.6, 0.9, 1.2, 1.5, 1.8].map((y, i) => (
        <mesh key={i} position={[0, y * 1.1 - 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.05, 2.07, 64]} />
          <meshBasicMaterial color={'#3b82f6'} transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

function SelectedMarker({ destination }: { destination: Destination | null }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const position = useMemo<[number, number, number]>(() => {
    if (!destination) return [0, 0, 0];
    return latLngToVector3(destination.coordinates.lat, destination.coordinates.lng, GLOBE_RADIUS + 0.05);
  }, [destination]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.2);
    }
    if (pulseRef.current) {
      const p = (t * 0.6) % 1;
      pulseRef.current.scale.setScalar(1 + p * 3);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - p);
    }
  });

  if (!destination) return null;

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={destination.color} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.1, 0.14, 32]} />
        <meshBasicMaterial color={destination.color} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={pulseRef}>
        <ringGeometry args={[0.1, 0.12, 32]} />
        <meshBasicMaterial color={destination.color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <Html distanceFactor={6} center className="pointer-events-none">
        <div
          className="whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
          style={{ background: `${destination.color}33`, color: '#fff', border: `1px solid ${destination.color}66` }}
        >
          {destination.name}
        </div>
      </Html>
    </group>
  );
}

function FlightPath({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const curve = useMemo(() => {
    const mid = [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 + 1.5,
      (from[2] + to[2]) / 2,
    ] as [number, number, number];
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to)
    );
  }, [from, to]);

  const points = useMemo(() => curve.getPoints(50), [curve]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  if (from[0] === to[0] && from[1] === to[1] && from[2] === to[2]) return null;

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color={'#60a5fa'} transparent opacity={0.6} />
    </line>
  );
}

function SceneContent({ destination }: { destination: Destination | null }) {
  const home: [number, number, number] = latLngToVector3(40.7128, -74.006, GLOBE_RADIUS + 0.05);
  const dest = useMemo(() => {
    if (!destination) return null;
    return latLngToVector3(destination.coordinates.lat, destination.coordinates.lng, GLOBE_RADIUS + 0.05);
  }, [destination]);

  return (
    <Suspense fallback={null}>
      <Globe />
      <LatRings />
      {dest && (
        <>
          <SelectedMarker destination={destination} />
          <FlightPath from={home} to={dest} />
        </>
      )}
    </Suspense>
  );
}

export default function PlannerGlobe({ selectedDestination }: { selectedDestination: Destination | null }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} />
      <pointLight position={[-5, -2, -5]} intensity={0.4} color={'#8b5cf6'} />
      <SceneContent destination={selectedDestination} />
    </Canvas>
  );
}
