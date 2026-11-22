import { useState } from 'react';
import { Network, Server, Wifi, ShieldAlert } from 'lucide-react';

export default function NetworkTopology() {
  const [crashed, setCrashed] = useState(false);

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Network className="w-8 h-8 text-[#7226FF]" /> Network Topology
          </h1>
          <p className="text-[#D8B4FE] text-lg max-w-3xl">
            Visualize the physical and logical layout of the smart home infrastructure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        
        {/* Left Panel: Controls */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col gap-5 lg:col-span-1">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Network Control</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded-xl border border-white/10">
              <p className="text-xs text-[#D8B4FE] uppercase font-bold mb-1">Status</p>
              <p className={`font-mono text-sm ${crashed ? 'text-red-400' : 'text-green-400'}`}>
                {crashed ? 'Core Router Offline' : 'All Systems Nominal'}
              </p>
            </div>

            <button 
              onClick={() => setCrashed(!crashed)}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${crashed ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'}`}
            >
              <ShieldAlert className="w-5 h-5" /> 
              {crashed ? 'Restore Core Router' : 'Simulate Router Crash'}
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-bold text-white mb-3">Device Details</h3>
            <p className="text-xs text-[#D8B4FE]/70">Click any node on the map to view its details (Coming Soon).</p>
          </div>
        </div>

        {/* Right Panel: Topology Map */}
        <div className="glass p-8 rounded-3xl border border-white/10 lg:col-span-3 relative overflow-hidden bg-[#010030] flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#7226FF1a_1px,transparent_1px),linear-gradient(to_bottom,#7226FF1a_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <div className="relative w-full max-w-2xl flex flex-col items-center gap-12">
            
            {/* Top Layer */}
            <div className="flex justify-between w-full">
              <div className="w-24 h-24 bg-[#160078] border-2 border-[#7226FF] rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(114,38,255,0.4)]">
                <Server className="w-8 h-8 text-white mb-1" />
                <span className="text-xs font-bold text-white">IoT Gateway</span>
                <span className="text-[9px] text-[#D8B4FE]">192.168.1.1</span>
              </div>

              <div className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center transition-all ${crashed ? 'bg-red-500/20 border-2 border-red-500 opacity-50' : 'bg-[#160078] border-2 border-[#00C8F0] shadow-[0_0_20px_rgba(0,200,240,0.4)]'}`}>
                <Wifi className="w-8 h-8 text-white mb-1" />
                <span className="text-xs font-bold text-white">WiFi Router</span>
                <span className="text-[9px] text-[#D8B4FE]">10.0.0.5</span>
              </div>
            </div>

            {/* Connecting Lines */}
            <div className="w-full h-px bg-white/20 relative">
              <div className={`absolute top-0 left-0 h-full w-full border-t-2 border-dashed ${crashed ? 'border-red-500/50' : 'border-[#7226FF]/50'}`} />
            </div>

            {/* Bottom Layer */}
            <div className="flex justify-between w-full">
              <div className="w-24 h-24 bg-[#160078] border-2 border-[#7226FF] rounded-xl flex flex-col items-center justify-center">
                <Server className="w-8 h-8 text-white mb-1" />
                <span className="text-xs font-bold text-white">Switch A</span>
                <span className="text-[9px] text-[#D8B4FE]">10.0.0.2</span>
              </div>

              <div className="w-24 h-24 bg-[#160078] border-2 border-[#7226FF] rounded-xl flex flex-col items-center justify-center">
                <Server className="w-8 h-8 text-white mb-1" />
                <span className="text-xs font-bold text-white">Home Server</span>
                <span className="text-[9px] text-[#D8B4FE]">10.0.0.4</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}