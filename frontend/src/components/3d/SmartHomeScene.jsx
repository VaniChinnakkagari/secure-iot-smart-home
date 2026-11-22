import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, ContactShadows, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

const NEON_BLUE = "#00C8F0";
const NEON_PURPLE = "#7226FF";

// 1. A Glowing Wireframe Box (to build the house)
function WireBox({ args, position, color = NEON_BLUE, opacity = 0.8 }) {
  const geometry = useMemo(() => new THREE.BoxGeometry(...args), [args]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  
  return (
    <group position={position}>
      {/* Faint solid inner box for depth */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} transparent opacity={0.05} depthWrite={false} />
      </mesh>
      {/* Glowing Edges */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} lineWidth={2} transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
}

// 2. Floating Holographic Data Panel
function DataPanel({ position, title, value, color = NEON_BLUE, lineTarget = [0, 0, 0] }) {
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
      <group position={position}>
        <Html transform distanceFactor={10} zIndexRange={[100, 0]}>
          <div 
            className="glass px-6 py-4 rounded-xl border-2 shadow-[0_0_20px_rgba(114,38,255,0.4)] pointer-events-none min-w-[140px]" 
            style={{ borderColor: color, backgroundColor: 'rgba(1, 0, 48, 0.8)' }}
          >
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: color }}>{title}</p>
            <p className="text-white text-xl font-black font-mono">{value}</p>
          </div>
        </Html>
        {/* Connecting line from panel to house center */}
        <Line points={[[0,0,0], lineTarget]} color={color} lineWidth={1.5} dashed dashScale={20} transparent opacity={0.4} />
      </group>
    </Float>
  );
}

// 3. Animated Data Packet
function DataPacket({ start, end, color = NEON_BLUE, speed = 1 }) {
  const ref = useRef();
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * speed) % 1;
    ref.current.position.lerpVectors(
      new THREE.Vector3(...start),
      new THREE.Vector3(...end),
      t
    );
  });

  return (
    <Sphere ref={ref} args={[0.1, 16, 16]} position={start}>
      <meshBasicMaterial color="#FFFFFF" />
    </Sphere>
  );
}

// 4. The Holographic House Structure
function HolographicHouse() {
  const serverPos = [0, 1.5, 0];
  const devices = [
    { pos: [-2, 0.5, -2], color: NEON_BLUE },
    { pos: [2, 0.5, -2], color: NEON_PURPLE },
    { pos: [-2, 0.5, 2], color: NEON_BLUE },
    { pos: [2, 0.5, 2], color: NEON_BLUE },
  ];

  return (
    <group position={[0, -1, 0]}>
      {/* Main Building Blocks */}
      <WireBox args={[4, 2, 4]} position={[0, 1, 0]} color={NEON_BLUE} />
      
      {/* Roof Lines */}
      <group position={[0, 2.5, 0]}>
        <Line points={[[-2.2, 0, -2.2], [0, 1.5, -2.2], [2.2, 0, -2.2]]} color={NEON_BLUE} lineWidth={2} />
        <Line points={[[-2.2, 0, 2.2], [0, 1.5, 2.2], [2.2, 0, 2.2]]} color={NEON_BLUE} lineWidth={2} />
        <Line points={[[-2.2, 0, -2.2], [-2.2, 0, 2.2]]} color={NEON_BLUE} lineWidth={2} />
        <Line points={[[2.2, 0, -2.2], [2.2, 0, 2.2]]} color={NEON_BLUE} lineWidth={2} />
        <Line points={[[0, 1.5, -2.2], [0, 1.5, 2.2]]} color={NEON_BLUE} lineWidth={2} />
      </group>

      {/* Internal Server */}
      <WireBox args={[0.5, 1, 0.5]} position={serverPos} color={NEON_PURPLE} />
      <pointLight position={serverPos} color={NEON_PURPLE} intensity={5} distance={5} />

      {/* Internal Devices (Sensors) */}
      {devices.map((dev, i) => (
        <group key={i}>
          <Line 
            points={[serverPos, dev.pos]} 
            color={dev.color} 
            lineWidth={1} 
            dashed
            dashScale={20}
            transparent 
            opacity={0.3} 
          />
          <WireBox args={[0.3, 0.3, 0.3]} position={dev.pos} color={dev.color} opacity={1} />
          <DataPacket start={serverPos} end={dev.pos} color={dev.color} speed={1 + i * 0.2} />
        </group>
      ))}

      {/* FLOATING PANELS - Matching the Reference Image */}
      <DataPanel 
        position={[-3.5, 2, 2.5]} 
        title="TEMP-03" 
        value="22°C" 
        color={NEON_BLUE} 
        lineTarget={[-1, -1, 1]}
      />
      <DataPanel 
        position={[3.5, 2, 2.5]} 
        title="MOTION-04" 
        value="STANDBY" 
        color={NEON_BLUE} 
        lineTarget={[1, -1, 1]}
      />
      <DataPanel 
        position={[-2.5, 3.5, -2]} 
        title="LOCK-02" 
        value="SECURE" 
        color={NEON_PURPLE} 
        lineTarget={[-1, -1, -1]}
      />
      <DataPanel 
        position={[2.5, 3.5, -2]} 
        title="CAM-01" 
        value="ONLINE" 
        color={NEON_PURPLE} 
        lineTarget={[1, -1, -1]}
      />
    </group>
  );
}

export default function SmartHomeScene() {
  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#010030] border border-[#7226FF]/30 shadow-[0_0_50px_rgba(114,38,255,0.15)]">
      <Canvas camera={{ position: [10, 8, 10], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#FFFFFF" />
        
        {/* The Holographic Grid Floor */}
        <gridHelper args={[30, 60, '#00C8F0', '#160078']} position={[0, -1.1, 0]} />
        
        <HolographicHouse />
        
        {/* Glowing Contact Shadows */}
        <ContactShadows position={[0, -1.05, 0]} opacity={0.6} scale={15} blur={2} far={4} color={NEON_PURPLE} />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.2} 
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="glass px-4 py-2 rounded-lg border border-[#00C8F0]/30 shadow-[0_0_15px_rgba(0,200,240,0.2)]">
          <h3 className="font-bold text-white text-sm">Live 3D Topology</h3>
          <p className="text-xs text-[#D8B4FE]">Drag to rotate • Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
}