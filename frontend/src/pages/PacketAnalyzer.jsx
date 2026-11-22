import { useState, useEffect, useRef } from 'react';
import { 
  Search, Play, Pause, Square, 
  Activity, ShieldCheck, ShieldAlert 
} from 'lucide-react';
import { io } from 'socket.io-client';

// Connect to your Node.js backend
const socket = io('http://localhost:5000');

export default function PacketAnalyzer() {
  const [packets, setPackets] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL | TCP | UDP | MQTT
  const [error, setError] = useState(null);
  
  // Use a ref to keep track of capturing state inside the socket listener
  const capturingRef = useRef(false);

  useEffect(() => {
    capturingRef.current = isCapturing;
  }, [isCapturing]);

  useEffect(() => {
    // Listen for packets from the backend
    socket.on('sim:packet', (packet) => {
      if (!capturingRef.current) return;

      // Format the incoming packet data
      // Assuming packet structure from backend: { id, protocol, source, dest, size, status, time }
      const newPacket = {
        id: packet.id || Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString(),
        source: packet.source_ip || '192.168.1.100',
        dest: packet.dest_ip || '192.168.1.1',
        protocol: packet.protocol || ['TCP', 'UDP', 'MQTT'][Math.floor(Math.random() * 3)],
        length: packet.size || Math.floor(Math.random() * 1000) + 64,
        status: packet.status || 'ok', // 'ok' or 'corrupt'
      };

      setPackets(prev => [newPacket, ...prev].slice(0, 100)); // Keep last 100
    });

    // Handle connection errors
    socket.on('connect_error', () => {
      setError("Failed to connect to simulation engine. Is the backend running?");
    });

    return () => {
      socket.off('sim:packet');
      socket.off('connect_error');
    };
  }, []);

  const handlePlay = () => {
    setIsCapturing(true);
    socket.emit('sim:start', { speed: 1000, loss: 0.05 });
  };

  const handlePause = () => {
    setIsCapturing(false);
    // We don't stop the simulation globally, just stop capturing on this page
  };

  const handleStop = () => {
    setIsCapturing(false);
    setPackets([]);
    socket.emit('sim:stop');
  };

  const filteredPackets = packets.filter(p => filter === 'ALL' || p.protocol === filter);

  return (
    <div className="flex flex-col gap-6 pb-12 h-[calc(100vh-100px)] animate-in fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Search className="w-8 h-8 text-[#7226FF]" /> Packet Analyzer
          </h1>
          <p className="text-[#D8B4FE] text-lg max-w-3xl">
            Live network traffic capture via Socket.IO.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden">
            <button onClick={handlePlay} className={`p-3 transition-colors ${isCapturing ? 'bg-[#7226FF]/20 text-[#7226FF]' : 'hover:bg-white/5 text-green-400'}`} title="Start Capture">
              <Play className="w-5 h-5" />
            </button>
            <button onClick={handlePause} className="p-3 hover:bg-white/5 text-yellow-400 border-l border-white/10 transition-colors" title="Pause Capture">
              <Pause className="w-5 h-5" />
            </button>
            <button onClick={handleStop} className="p-3 hover:bg-white/5 text-red-400 border-l border-white/10 transition-colors" title="Clear & Stop">
              <Square className="w-5 h-5" />
            </button>
          </div>

          <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden text-xs font-bold">
            {['ALL', 'TCP', 'UDP', 'MQTT'].map(p => (
              <button 
                key={p} 
                onClick={() => setFilter(p)}
                className={`px-4 py-3 transition-colors ${filter === p ? 'bg-[#7226FF] text-white' : 'text-[#D8B4FE] hover:bg-white/5'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Data Table */}
      <div className="glass rounded-3xl border border-white/10 flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-white/10 bg-black/40 text-xs font-bold text-[#D8B4FE] uppercase tracking-wider">
          <div>Time</div>
          <div>Source IP</div>
          <div>Dest IP</div>
          <div>Protocol</div>
          <div>Length</div>
          <div>Status</div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {!isCapturing && packets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/30 gap-4">
              <Activity className="w-12 h-12 opacity-50" />
              <p>Click the Green Play button to start capturing live packets.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredPackets.map((p) => (
                <div key={p.id} className="grid grid-cols-6 gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm font-mono items-center">
                  <div className="text-white/50">{p.time}</div>
                  <div className="text-[#00C8F0]">{p.source}</div>
                  <div className="text-[#00C8F0]">{p.dest}</div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      p.protocol === 'TCP' ? 'bg-blue-500/20 text-blue-400' : 
                      p.protocol === 'UDP' ? 'bg-purple-500/20 text-purple-400' : 
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {p.protocol}
                    </span>
                  </div>
                  <div className="text-white">{p.length} B</div>
                  <div>
                    {p.status === 'ok' ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs font-bold"><ShieldCheck className="w-4 h-4"/> Valid</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><ShieldAlert className="w-4 h-4"/> Corrupt</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}