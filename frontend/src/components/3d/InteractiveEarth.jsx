import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Create an animated glowing arc between two points on the globe
function DataArc({ start, end, color }) {
  const lineRef = useRef();

  // Generate a curved path between the two points
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const midVec = startVec.clone().add(endVec).multiplyScalar(0.5);
    // Push the midpoint outward to create an arc
    midVec.normalize().multiplyScalar(2.5); 
    
    const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec);
    return curve.getPoints(20);
  }, [start, end]);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      // Make the arc pulse
      lineRef.current.material.opacity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3;
    }
  });

  return <Line ref={lineRef} points={points} color={color} lineWidth={2} transparent opacity={0.5} />;
}

// The Earth itself
function Globe() {
  const globeRef = useRef();
  
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002; // Slow rotation
    }
  });

  // Random nodes on the sphere
  const nodes = [
    [1.5, 1.5, 0], [-1.2, 1.8, 0.5], [0.5, -1.9, 1], 
    [-1.5, -1, -1], [1.8, -0.5, -1]
  ];

  return (
    <group ref={globeRef}>
      {/* Base Sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial color="#06152E" emissive="#287BFF" emissiveIntensity={0.2} wireframe />
      </Sphere>

      {/* Glowing Atmosphere */}
      <Sphere args={[2.05, 64, 64]}>
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.1} side={THREE.BackSide} />
      </Sphere>

      {/* Network Arcs */}
      <DataArc start={nodes[0]} end={nodes[1]} color="#00D9FF" />
      <DataArc start={nodes[2]} end={nodes[3]} color="#9270FF" />
      <DataArc start={nodes[4]} end={nodes[0]} color="#287BFF" />
      <DataArc start={nodes[1]} end={nodes[3]} color="#00D9FF" />

      {/* Glowing Nodes */}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#F4F8FF" />
        </mesh>
      ))}
    </group>
  );
}

export default function InteractiveEarth() {
  return (
    <div className="w-full h-[600px] relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Globe />
        </Float>

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}