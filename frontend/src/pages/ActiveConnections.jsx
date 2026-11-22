import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Search, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function ActiveConnections() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    socket.emit('sim:start', { speed: 1200, loss: 0.05 });

    socket.on('sim:packet', (packet) => {
      setConnections(prev => {
        const newConn = {
          id: packet.id,
          time: packet.time,
          source: packet.source,
          dest: packet.dest,
          protocol: packet.protocol,
          status: packet.status,
          size: packet.length
        };
        // Keep only the last 50 connections
        return [newConn, ...prev].slice(0, 50);
      });
    });

    return () => {
      socket.off('sim:packet');
      socket.emit('sim:stop');
    };
  }, []);

  const filtered = connections.filter(c => 
    c.source.includes(searchTerm) || c.dest.includes(searchTerm) || c.protocol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/app/dashboard')}
          className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#7226FF]/50 transition-all text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Active Connections</h1>
          <p className="text-[#D8B4FE]">Real-time overview of network traffic and packet status.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass p-4 rounded-2xl flex justify-between items-center border border-[#7226FF]/30">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8B4FE]/50" />
          <input 
            type="text" 
            placeholder="Search IP or Protocol..." 
            className="w-full pl-9 pr-4 py-2 bg-black/20 border border-[#7226FF]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7226FF] text-white placeholder-white/30 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#D8B4FE] bg-[#7226FF]/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#7226FF] animate-pulse" /> Live Stream
          </span>
        </div>
      </div>

      {/* Connections Table */}
      <div className="glass rounded-2xl overflow-hidden border border-[#7226FF]/30">
        <div className="grid grid-cols-6 gap-4 p-4 bg-black/40 font-bold text-sm text-[#D8B4FE]/70 border-b border-white/10">
          <div>Time</div>
          <div>Source IP</div>
          <div>Destination IP</div>
          <div>Protocol</div>
          <div>Size</div>
          <div>Status</div>
        </div>
        
        <div className="flex flex-col">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-[#D8B4FE]/50 flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin" />
              Waiting for network traffic...
            </div>
          ) : (
            filtered.map(conn => (
              <div key={conn.id} className="grid grid-cols-6 gap-4 p-3 border-b border-white/5 text-sm items-center hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="font-mono text-[#D8B4FE]/60">{conn.time}</div>
                <div className="text-white font-medium">{conn.source}</div>
                <div className="text-white font-medium">{conn.dest}</div>
                <div>
                  <span className="px-2.5 py-1 bg-[#7226FF]/20 text-[#D8B4FE] rounded-md text-xs font-bold border border-[#7226FF]/30">
                    {conn.protocol}
                  </span>
                </div>
                <div className="text-white/70">{conn.size} B</div>
                <div>
                  {conn.status === 'corrupted' ? (
                    <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-xs font-bold">Corrupted</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-md text-xs font-bold">OK</span>
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