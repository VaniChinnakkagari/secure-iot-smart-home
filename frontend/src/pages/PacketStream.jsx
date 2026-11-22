import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Database, Zap, BarChart3 } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function PacketStream() {
  const navigate = useNavigate();
  const [packets, setPackets] = useState([]);
  const [stats, setStats] = useState({ total: 0, bytes: 0, rate: 0 });

  useEffect(() => {
    socket.emit('sim:start', { speed: 800, loss: 0.02 });

    let packetCount = 0;
    let byteCount = 0;

    socket.on('sim:packet', (packet) => {
      packetCount++;
      byteCount += packet.length;

      setStats(prev => ({
        total: prev.total + 1,
        bytes: prev.bytes + packet.length,
        rate: Math.floor(Math.random() * 50) + 120 // Simulated packets/sec
      }));

      setPackets(prev => {
        const newPkt = {
          id: packet.id,
          time: packet.time,
          protocol: packet.protocol,
          length: packet.length,
          source: packet.source,
          dest: packet.dest,
          status: packet.status
        };
        return [newPkt, ...prev].slice(0, 50); // Keep last 50
      });
    });

    return () => {
      socket.off('sim:packet');
      socket.emit('sim:stop');
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/app/dashboard')}
          className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#7226FF]/50 transition-all text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Packet Transmission Engine</h1>
          <p className="text-[#D8B4FE]">Monitor the generation, size, and status of outgoing network packets.</p>
        </div>
      </div>

      {/* Engine Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-[#7226FF]/30 flex items-center gap-4">
          <div className="p-3 bg-[#7226FF]/20 rounded-xl text-[#D8B4FE]">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-[#D8B4FE]/70 font-medium">Total Packets Sent</p>
            <h3 className="text-3xl font-black text-white">{stats.total}</h3>
          </div>
        </div>
        
        <div className="glass p-6 rounded-2xl border border-[#7226FF]/30 flex items-center gap-4">
          <div className="p-3 bg-[#D8B4FE]/20 rounded-xl text-[#D8B4FE]">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-[#D8B4FE]/70 font-medium">Total Bytes Transmitted</p>
            <h3 className="text-3xl font-black text-white">{(stats.bytes / 1024).toFixed(2)} KB</h3>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-[#7226FF]/30 flex items-center gap-4">
          <div className="p-3 bg-[#7226FF]/20 rounded-xl text-[#D8B4FE]">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-[#D8B4FE]/70 font-medium">Current Tx Rate</p>
            <h3 className="text-3xl font-black text-white">{stats.rate} <span className="text-sm font-normal text-[#D8B4FE]">pkt/s</span></h3>
          </div>
        </div>
      </div>

      {/* Raw Packet Stream */}
      <div className="glass rounded-2xl overflow-hidden border border-[#7226FF]/30 flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#7226FF]" /> Raw Packet Stream
          </h3>
          <span className="text-xs font-bold text-[#D8B4FE] bg-[#7226FF]/20 px-3 py-1 rounded-md animate-pulse">
            ENGINE RUNNING
          </span>
        </div>
        
        <div className="grid grid-cols-6 gap-4 p-4 bg-black/40 font-bold text-sm text-[#D8B4FE]/70 border-b border-white/10">
          <div>Time</div>
          <div>Protocol</div>
          <div>Length</div>
          <div>Source</div>
          <div>Destination</div>
          <div>Status</div>
        </div>
        
        <div className="flex flex-col max-h-[500px] overflow-y-auto">
          {packets.length === 0 ? (
            <div className="p-12 text-center text-[#D8B4FE]/50">Waiting for transmission engine to generate packets...</div>
          ) : (
            packets.map(pkt => (
              <div key={pkt.id} className="grid grid-cols-6 gap-4 p-3 border-b border-white/5 text-sm items-center hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="font-mono text-[#D8B4FE]/60">{pkt.time}</div>
                <div>
                  <span className="px-2 py-0.5 bg-black/40 text-[#D8B4FE] rounded text-xs font-bold border border-[#7226FF]/30">
                    {pkt.protocol}
                  </span>
                </div>
                <div className="text-white/70 font-mono">{pkt.length} B</div>
                <div className="text-white truncate">{pkt.source}</div>
                <div className="text-white truncate">{pkt.dest}</div>
                <div>
                  {pkt.status === 'corrupted' ? (
                    <span className="text-red-400 font-bold text-xs">Corrupted</span>
                  ) : (
                    <span className="text-green-400 font-bold text-xs">Sent</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}