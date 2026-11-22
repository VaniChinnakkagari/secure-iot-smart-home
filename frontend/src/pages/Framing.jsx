import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, ContactShadows, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Code, Play, Pause, SkipBack, SkipForward, 
  Binary, CheckCircle2, Zap, 
  Layers, ArrowRightLeft, Calculator, ArrowDown
} from 'lucide-react';

// --- REAL MATH IMPLEMENTATIONS ---
const calculateCRC16 = (str) => {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc = crc << 1;
    }
  }
  return (crc & 0xFFFF);
};

const toHex = (num) => num.toString(16).toUpperCase().padStart(2, '0');
const toBin = (num, pad = 8) => num.toString(2).padStart(pad, '0');

// --- 3D HELPER COMPONENTS ---
function DataBlock({ position, color, label, subLabel, scale = [1, 1, 1], highlight = false }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={scale} />
        <meshStandardMaterial color={color} transparent opacity={highlight ? 1 : 0.7} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...scale)]} />
        <lineBasicMaterial color={highlight ? '#ffffff' : color} linewidth={highlight ? 3 : 1} transparent opacity={0.8} />
      </lineSegments>
      <Html position={[0, scale[1] / 2 + 0.2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
        <div className={`px-3 py-1 rounded-md text-xs font-mono whitespace-nowrap border shadow-lg ${highlight ? 'bg-white text-black border-white' : 'bg-black/80 text-white border-white/20'}`}>
          <span className="font-bold">{label}</span>
          {subLabel && <span className={`ml-2 ${highlight ? 'text-black/60' : 'text-white/50'}`}>{subLabel}</span>}
        </div>
      </Html>
    </group>
  );
}

// --- 3D SCENES ---
function FramingScene({ step, frameData }) {
  if (!frameData) return null;
  
  const blocks = [
    { id: 'f1', label: '0x7E', sub: 'START FLAG', color: '#7226FF' },
    { id: 'p1', label: 'PAYLOAD', sub: `${frameData.originalLength} Bytes`, color: '#00C8F0' },
    { id: 'crc', label: 'CRC-16', sub: '0x' + toHex(frameData.crc), color: '#f59e0b' },
    { id: 'f2', label: '0x7E', sub: 'END FLAG', color: '#7226FF' },
  ];

  return (
    <group position={[-4.5, 0, 0]}>
      {blocks.map((b, i) => step >= i && (
        <Float key={b.id} speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
          <DataBlock position={[i * 3, 0, 0]} color={b.color} label={b.label} subLabel={b.sub} scale={[2, 1.5, 1]} />
        </Float>
      ))}
    </group>
  );
}

function StuffingScene({ step, payload, stuffed }) {
  return (
    <group position={[0, 0, 0]}>
      <group position={[0, 3, 0]}>
        <Text position={[-6, 0, 0]} color="#D8B4FE" fontSize={0.4} anchorX="right">Original</Text>
        {payload.map((byte, i) => {
          const isFlag = byte === 0x7E;
          return (
            <DataBlock 
              key={`orig-${i}`} position={[i * 1.5 - 2, 0, 0]} 
              color={isFlag ? '#ef4444' : '#00C8F0'} label={`0x${toHex(byte)}`} 
              highlight={isFlag} scale={[1, 1, 1]} 
            />
          );
        })}
      </group>
      <group position={[0, -3, 0]}>
        <Text position={[-6, 0, 0]} color="#D8B4FE" fontSize={0.4} anchorX="right">Stuffed</Text>
        {stuffed.map((byte, i) => {
          const isEscape = byte === 0x7D;
          const isStuffedFlag = byte === 0x5E;
          return step >= i && (
            <DataBlock 
              key={`stuff-${i}`} position={[i * 1.5 - 2, 0, 0]} 
              color={isEscape || isStuffedFlag ? '#f59e0b' : '#00C8F0'} 
              label={`0x${toHex(byte)}`} highlight={isEscape || isStuffedFlag} scale={[1, 1, 1]} 
            />
          );
        })}
      </group>
    </group>
  );
}

function CRCScene({ step, crcData }) {
  if (!crcData) return null;
  const { dividend, steps } = crcData;

  return (
    <group position={[-6, 4, 0]}>
      <Text position={[0, 0, 0]} color="#00C8F0" fontSize={0.6} anchorX="left">Data: {dividend}</Text>
      <Text position={[0, -1, 0]} color="#f59e0b" fontSize={0.5} anchorX="left">Poly: 10001000000100001</Text>
      
      {steps.slice(0, step).map((s, i) => (
        <group key={i} position={[0, -2.5 - (i * 1.5), 0]}>
          <Text position={[0, 0, 0]} color="#fff" fontSize={0.45} anchorX="left">{s.xorString}</Text>
          <Text position={[0, -0.6, 0]} color="#7226FF" fontSize={0.45} anchorX="left">{s.result}</Text>
        </group>
      ))}
    </group>
  );
}

export default function Framing() {
  const [activeTab, setActiveTab] = useState('framing'); 
  const [message, setMessage] = useState('Hello~World');
  
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [frameData, setFrameData] = useState(null);

  const compileSimulation = () => {
    const payload = Array.from(message).map(c => c.charCodeAt(0));
    const stuffed = [];
    
    payload.forEach(byte => {
      if (byte === 0x7E) stuffed.push(0x7D, 0x5E);
      else if (byte === 0x7D) stuffed.push(0x7D, 0x5D);
      else stuffed.push(byte);
    });

    const crc = calculateCRC16(message);
    
    let binString = payload.map(b => toBin(b)).join('');
    const genPoly = '10001000000100001';
    const paddedBin = binString + '0'.repeat(16);
    
    const crcSteps = [];
    let currentStr = paddedBin;
    for (let i = 0; i < binString.length; i++) {
      if (currentStr[i] === '1') {
        let xorResult = '';
        for (let j = 0; j < genPoly.length; j++) {
          xorResult += (parseInt(currentStr[i + j]) ^ parseInt(genPoly[j])).toString();
        }
        crcSteps.push({
          xorString: `[${currentStr.substring(i, i + genPoly.length)}]`,
          result: `${xorResult}`
        });
        currentStr = currentStr.substring(0, i) + xorResult + currentStr.substring(i + genPoly.length);
      }
    }

    setFrameData({
      payload, stuffed, crc, originalLength: payload.length,
      crcData: { dividend: binString, steps: crcSteps.slice(0, 3) } 
    });
    setStep(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && frameData) {
      interval = setInterval(() => {
        setStep(prev => {
          let max = 0;
          if (activeTab === 'framing') max = 4;
          if (activeTab === 'stuffing') max = frameData.stuffed.length;
          if (activeTab === 'crc') max = frameData.crcData.steps.length;

          if (prev >= max) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / speed); // Slower to let user read the text
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, frameData, activeTab]);

  useEffect(() => {
    setStep(0);
    setIsPlaying(false);
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <Code className="w-8 h-8 text-[#7226FF]" /> Data Link Laboratory
        </h1>
        <p className="text-[#D8B4FE] text-lg max-w-3xl">
          Explore Framing, Byte Stuffing, and CRC Checksums as independent operations.
        </p>
      </div>

      <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 w-full max-w-2xl">
        <button onClick={() => setActiveTab('framing')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'framing' ? 'bg-[#7226FF] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
          <Layers className="w-4 h-4" /> Framing
        </button>
        <button onClick={() => setActiveTab('stuffing')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'stuffing' ? 'bg-[#7226FF] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
          <ArrowRightLeft className="w-4 h-4" /> Byte Stuffing
        </button>
        <button onClick={() => setActiveTab('crc')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'crc' ? 'bg-[#7226FF] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
          <Calculator className="w-4 h-4" /> CRC Calculation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUT PANEL */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col gap-6 lg:col-span-1">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Configuration</h2>
            <p className="text-sm text-[#D8B4FE]/70">Input payload for testing.</p>
          </div>

          <textarea 
            className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-sm h-24 focus:outline-none resize-none focus:border-[#7226FF] transition-colors"
            placeholder="Type message... (use ~ for flag)" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
          />

          <button 
            onClick={compileSimulation} 
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-brand hover:opacity-90 shadow-[0_0_20px_rgba(114,38,255,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <Binary className="w-5 h-5" /> Run Simulation
          </button>
        </div>

        {/* 3D VIEWPORT */}
        <div className="glass p-2 rounded-3xl border border-white/10 flex flex-col lg:col-span-2 relative overflow-hidden bg-[#010030] min-h-[500px]">
          
          <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
              <color attach="background" args={['#010030']} />
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 10]} intensity={1} />
              <gridHelper args={[30, 30, '#7226FF', '#160078']} position={[0, -4, 0]} />
              
              {frameData && activeTab === 'framing' && <FramingScene step={step} frameData={frameData} />}
              {frameData && activeTab === 'stuffing' && <StuffingScene step={step} payload={frameData.payload} stuffed={frameData.stuffed} />}
              {frameData && activeTab === 'crc' && <CRCScene step={step} crcData={frameData.crcData} />}

              <ContactShadows position={[0, -3.95, 0]} opacity={0.5} scale={20} blur={2} far={4} color="#7226FF" />
              
              <OrbitControls enablePan={true} enableZoom={true} autoRotate={false} />
            </Canvas>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div className="glass px-6 py-3 rounded-full border border-white/20 flex items-center gap-4 shadow-xl bg-black/60 backdrop-blur-xl">
              <button onClick={() => { setStep(0); setIsPlaying(false); }} className="text-white/50 hover:text-white transition-colors"><SkipBack className="w-5 h-5" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-[#7226FF] flex items-center justify-center text-white hover:opacity-80 transition-all">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              <button onClick={() => setStep(prev => prev + 1)} className="text-white/50 hover:text-white transition-colors"><SkipForward className="w-5 h-5" /></button>
              <div className="w-px h-6 bg-white/20 mx-2"></div>
              <span className="text-xs font-bold text-white min-w-[60px]">Step {step}</span>
            </div>
          </div>
        </div>

      </div>

      {/* DETAILED IN-BROWSER EXPLANATION PANEL */}
      {frameData && (
        <div className="glass p-8 rounded-3xl border border-[#00C8F0]/30 bg-gradient-to-br from-[#010030] to-[#160078] mt-4 animate-in fade-in">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#00C8F0]" /> Live Explanation
            </h2>
            <div className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30">
              <CheckCircle2 className="w-5 h-5" /> Transmission Valid
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT: DYNAMIC TEXTUAL EXPLANATION */}
            <div className="space-y-4 text-white/80">
              {activeTab === 'framing' && (
                <>
                  <h3 className="text-lg text-white font-bold">What is Framing?</h3>
                  <p className="text-sm">Framing is like putting a letter into an envelope. The receiver needs to know exactly where the message starts and ends.</p>
                  <ul className="space-y-2 mt-4 text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                    <li className={step >= 1 ? "text-[#7226FF] font-bold" : "text-white/30"}>1. Start Flag (0x7E): Marks the beginning.</li>
                    <li className={step >= 2 ? "text-[#00C8F0] font-bold" : "text-white/30"}>2. Payload: Your actual data ({frameData.originalLength} bytes).</li>
                    <li className={step >= 3 ? "text-[#f59e0b] font-bold" : "text-white/30"}>3. CRC: The mathematical checksum (0x{toHex(frameData.crc)}).</li>
                    <li className={step >= 4 ? "text-[#7226FF] font-bold" : "text-white/30"}>4. End Flag (0x7E): Marks the end.</li>
                  </ul>
                </>
              )}

              {activeTab === 'stuffing' && (
                <>
                  <h3 className="text-lg text-white font-bold">What is Byte Stuffing?</h3>
                  <p className="text-sm">If your actual message contains the Flag character (0x7E), the receiver will get confused and think the frame ended early.</p>
                  <p className="text-sm">To fix this, we inject an <strong>Escape Byte (0x7D)</strong> right before it, and scramble the original flag.</p>
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 mt-4 text-xs font-mono">
                    <p className="text-white/50">Notice how 0x7E (Red) turns into <span className="text-[#f59e0b]">0x7D 0x5E</span> (Orange).</p>
                  </div>
                </>
              )}

              {activeTab === 'crc' && (
                <>
                  <h3 className="text-lg text-white font-bold">What is CRC Calculation?</h3>
                  <p className="text-sm">This is binary long division. The Sender adds 16 zeros to the data and divides it by a secret polynomial (0x1021).</p>
                  <p className="text-sm mt-2">Instead of subtracting, we use <strong>XOR</strong> (Same bits = 0, Different bits = 1).</p>
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 mt-4 flex items-center gap-2 text-sm">
                    <span className="text-[#ef4444]">1 XOR 1 = 0</span> <ArrowDown className="w-3 h-3 rotate-90 text-white/50" /> <span className="text-green-400">0</span>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT: LIVE MATH TABLE */}
            <div className="bg-black/40 p-5 rounded-xl border border-white/10 space-y-3 font-mono text-sm h-fit">
              {activeTab === 'framing' && (
                <>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[#D8B4FE]">Start Flag</span>
                    <span className={step >= 1 ? "text-[#7226FF]" : "text-white/20"}>0x7E</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[#D8B4FE]">Payload</span>
                    <span className={step >= 2 ? "text-[#00C8F0] break-all text-right max-w-[200px]" : "text-white/20"}>"{message}"</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[#D8B4FE]">CRC Checksum</span>
                    <span className={step >= 3 ? "text-[#f59e0b]" : "text-white/20"}>0x{toHex(frameData.crc)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[#D8B4FE]">End Flag</span>
                    <span className={step >= 4 ? "text-[#7226FF]" : "text-white/20"}>0x7E</span>
                  </div>
                </>
              )}

              {activeTab === 'stuffing' && (
                <>
                  <p className="text-white/50 mb-2">Original Data:</p>
                  <p className="text-[#00C8F0] break-all">{frameData.payload.map(b => toHex(b)).join(' ')}</p>
                  <div className="h-px bg-white/10 my-3"></div>
                  <p className="text-white/50 mb-2">Stuffed Data:</p>
                  <div className="flex flex-wrap gap-1">
                    {frameData.stuffed.map((b, i) => (
                      <span key={i} className={b === 0x7D || b === 0x5E ? "text-[#f59e0b] font-bold" : "text-[#00C8F0]"}>
                        {toHex(b)}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'crc' && (
                <>
                  <p className="text-white/50 mb-2">Dividend (Data + 16 Zeros):</p>
                  <p className="text-[#00C8F0] break-all text-xs">{frameData.crcData.dividend}</p>
                  <p className="text-[#f59e0b] mt-2 text-xs">Generator: 10001000000100001</p>
                  <div className="h-px bg-white/10 my-3"></div>
                  <p className="text-white/50 mb-2">XOR Steps:</p>
                  {frameData.crcData.steps.slice(0, step).map((s, i) => (
                    <div key={i} className="mb-2 text-xs">
                      <p className="text-white">XOR: <span className="text-[#ef4444]">{s.xorString}</span></p>
                      <p className="text-[#00C8F0]">Res: {s.result}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}