import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float, Line, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 1. Generate Holographic Dot-Matrix Continents
function DotMatrixEarth() {
  const pointsRef = useRef();
  
  // Create points that form "continents" on the sphere
  const points = useMemo(() => {
    const pts = [];
    const numPoints = 4000;
    
    for (let i = 0; i < numPoints; i++) {
      // Fibonacci sphere algorithm for even distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / numPoints);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);
      
      // Randomly skip points to create a "data cluster" look
      if (Math.random() > 0.6) {
        pts.push(x * 2, y * 2, z * 2);
      }
    }
    return new Float32Array(pts);
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() / 15;
    }
  });

  return (
    <group>
      {/* Outer Base Wireframe Sphere */}
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial color="#00C8F0" wireframe transparent opacity={0.05} />
      </Sphere>

      {/* The Glowing Data Points (Continents) */}
      <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial 
          transparent 
          color="#00D9FF" 
          size={0.025} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

// 2. Glowing Sweeping Orbital Rings
function OrbitalRings() {
  return (
    <group>
      {/* Ring 1 */}
      <mesh rotation={[Math.PI / 2.2, Math.PI / 6, 0]}>
        <torusGeometry args={[2.8, 0.015, 16, 100]} />
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Ring 2 */}
      <mesh rotation={[Math.PI / 1.8, -Math.PI / 4, 0]}>
        <torusGeometry args={[3.1, 0.008, 16, 100]} />
        <meshBasicMaterial color="#BDEBFF" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Ring 3 */}
      <mesh rotation={[Math.PI / 2, Math.PI / 8, Math.PI / 4]}>
        <torusGeometry args={[2.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#9270FF" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// 3. Floating Data Arcs
function DataArcs() {
  const arcs = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 3, 
        (Math.random() - 0.5) * 3, 
        (Math.random() - 0.5) * 3
      ).normalize().multiplyScalar(2);
      
      const end = new THREE.Vector3(
        (Math.random() - 0.5) * 3, 
        (Math.random() - 0.5) * 3, 
        (Math.random() - 0.5) * 3
      ).normalize().multiplyScalar(2);

      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(2.5);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      arr.push(curve.getPoints(20));
    }
    return arr;
  }, []);

  return (
    <group>
      {arcs.map((points, i) => (
        <Line key={i} points={points} color="#00D9FF" lineWidth={1.5} transparent opacity={0.3} />
      ))}
    </group>
  );
}

export default function HeroGlobe() {
  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 10]} intensity={2} />
          
          <Suspense fallback={null}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
              <DotMatrixEarth />
              <OrbitalRings />
              <DataArcs />
            </Float>
          </Suspense>

          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={1.5}
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5} 
          />
        </Canvas>
      </div>

      {/* Floating UI Panels */}
      <div className="absolute top-10 right-10 glass-dark px-5 py-4 rounded-xl z-20 border border-[#00C8F0]/40 shadow-[0_0_20px_rgba(0,200,240,0.2)] animate-pulse pointer-events-none">
        <p className="text-[#00C8F0] text-xs font-bold tracking-widest mb-1">NETWORK STATUS</p>
        <p className="text-white text-lg font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00D68F]" /> ONLINE
        </p>
      </div>
      
      <div className="absolute bottom-16 left-10 glass-dark px-5 py-4 rounded-xl z-20 border border-[#9270FF]/40 pointer-events-none">
        <p className="text-[#9270FF] text-xs font-bold tracking-widest mb-1">SECURE TRANSMISSION</p>
        <p className="text-white text-sm font-mono">AES-256 ACTIVE</p>
      </div>
    </div>
  );
}