'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { latLngToVector3 } from '@/lib/utils';
import { DESTINATIONS } from '@/lib/constants';

const EARTH_RADIUS = 2;
const CLOUD_RADIUS = 2.02;
const MARKER_RADIUS = 2.04;

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const earthTexture = useTexture(
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = t * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y = t * 0.065;
    if (atmosphereRef.current) atmosphereRef.current.rotation.y = t * 0.03;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.85}
          metalness={0.05}
          emissive={'#0a1a3a'}
          emissiveIntensity={0.15}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[CLOUD_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color={'#ffffff'}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={atmosphereRef} scale={1.12}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color={'#3b82f6'}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh scale={1.25}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color={'#8b5cf6'}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh scale={1.4}>
        <sphereGeometry args={[EARTH_RADIUS, 16, 16]} />
        <meshBasicMaterial
          color={'#10b981'}
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function DestinationMarker({
  position,
  color,
  label,
}: {
  position: [number, number, number];
  color: string;
  label: string;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 2) * 0.15;
      ringRef.current.scale.setScalar(s);
    }
    if (pulseRef.current) {
      const p = (t * 0.5) % 1;
      pulseRef.current.scale.setScalar(1 + p * 2);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - p);
    }
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.06, 0.09, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={pulseRef}>
        <ringGeometry args={[0.06, 0.08, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <Html distanceFactor={6} center className="pointer-events-none">
        <div className="whitespace-nowrap rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {label}
        </div>
      </Html>
    </group>
  );
}

function DestinationMarkers() {
  const markers = useMemo(
    () =>
      DESTINATIONS.map((d) => ({
        position: latLngToVector3(d.coordinates.lat, d.coordinates.lng, MARKER_RADIUS),
        color: d.color,
        label: d.name,
      })),
    []
  );

  return (
    <>
      {markers.map((m, i) => (
        <DestinationMarker key={i} position={m.position} color={m.color} label={m.label} />
      ))}
    </>
  );
}

function GlowingRoute({
  from,
  to,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}) {
  const curve = useMemo(() => {
    const mid = [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 + 0.8,
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

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={0.4} />
    </line>
  );
}

function FlightRoutes() {
  const routes = useMemo(() => {
    const paris = latLngToVector3(48.8566, 2.3522, MARKER_RADIUS);
    return DESTINATIONS.filter((d) => d.id !== 'paris').map((d) => ({
      from: paris,
      to: latLngToVector3(d.coordinates.lat, d.coordinates.lng, MARKER_RADIUS),
      color: d.color,
    }));
  }, []);

  return (
    <>
      {routes.map((r, i) => (
        <GlowingRoute key={i} from={r.from} to={r.to} color={r.color} />
      ))}
    </>
  );
}

function Airplane() {
  const ref = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.BufferAttribute>(null);

  const trailPositions = useMemo(() => new Float32Array(60 * 3), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.3;
    const angle = t;
    const radius = 3.2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle * 0.5) * 1.2;
    const z = Math.sin(angle) * radius;

    if (ref.current) {
      ref.current.position.set(x, y, z);
      const nextAngle = angle + 0.05;
      const nx = Math.cos(nextAngle) * radius;
      const ny = Math.sin(nextAngle * 0.5) * 1.2;
      const nz = Math.sin(nextAngle) * radius;
      ref.current.lookAt(nx, ny, nz);
    }

    for (let i = 59; i > 0; i--) {
      trailPositions[i * 3] = trailPositions[(i - 1) * 3];
      trailPositions[i * 3 + 1] = trailPositions[(i - 1) * 3 + 1];
      trailPositions[i * 3 + 2] = trailPositions[(i - 1) * 3 + 2];
    }
    trailPositions[0] = x;
    trailPositions[1] = y;
    trailPositions[2] = z;
    if (trailRef.current) trailRef.current.needsUpdate = true;
  });

  return (
    <>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.06, 0.2, 8]} />
          <meshStandardMaterial
            color={'#ffffff'}
            emissive={'#3b82f6'}
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.04]} />
          <meshStandardMaterial
            color={'#e2e8f0'}
            emissive={'#60a5fa'}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            ref={trailRef}
            attach="attributes-position"
            args={[trailPositions, 3]}
            count={60}
          />
        </bufferGeometry>
        <lineBasicMaterial color={'#60a5fa'} transparent opacity={0.5} />
      </line>
    </>
  );
}

function GalaxyParticles() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 3000;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 15 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={'#a78bfa'}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CameraRig() {
  const { camera, mouse } = useThree();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const targetX = mouse.x * 0.8 + Math.sin(t * 0.1) * 0.5;
    const targetY = mouse.y * 0.4 + 1.5 + Math.cos(t * 0.08) * 0.3;
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.position.z = 6.5 + Math.sin(t * 0.05) * 0.3;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function SceneLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
        <span className="text-xs text-muted-foreground">Loading Earth…</span>
      </div>
    </Html>
  );
}

export default function EarthScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 6.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} color={'#ffffff'} />
      <pointLight position={[-5, -2, -5]} intensity={0.5} color={'#3b82f6'} />

      <Suspense fallback={<SceneLoader />}>
        <Earth />
        <DestinationMarkers />
        <FlightRoutes />
        <Airplane />
        <GalaxyParticles />
      </Suspense>

      <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <CameraRig />
    </Canvas>
  );
}
