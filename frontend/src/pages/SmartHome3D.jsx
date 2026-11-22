import SmartHomeScene from '../components/3d/SmartHomeScene';
import { Activity, Shield, Wifi } from 'lucide-react';

export default function SmartHome3D() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Interactive 3D Environment
          </h1>
          <p className="text-[#D8B4FE] text-sm">
            Real-time visualization of secure IoT device communication.
          </p>
        </div>
        
        {/* Fixed Badges - No more overlapping */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 px-4 py-1.5 bg-[#7226FF]/10 text-[#D8B4FE] rounded-full text-xs font-bold border border-[#7226FF]/30 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> AES-256 Active
          </span>
          <span className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-xs font-bold border border-green-500/30 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> 4 Nodes Online
          </span>
        </div>
      </div>

      {/* The 3D Canvas */}
      <SmartHomeScene />

      {/* Bottom Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <div className="glass p-5 rounded-2xl border border-[#7226FF]/30">
          <h4 className="font-bold text-white mb-1 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#7226FF]" /> Central Router
          </h4>
          <p className="text-sm text-[#D8B4FE]/70">Handling encrypted packets from all connected devices.</p>
        </div>
        <div className="glass p-5 rounded-2xl border border-[#7226FF]/30">
          <h4 className="font-bold text-white mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#D8B4FE]" /> Data Packets
          </h4>
          <p className="text-sm text-[#D8B4FE]/70">Animated spheres represent real-time data transmission.</p>
        </div>
        <div className="glass p-5 rounded-2xl border border-[#7226FF]/30">
          <h4 className="font-bold text-white mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" /> Device Nodes
          </h4>
          <p className="text-sm text-[#D8B4FE]/70">CCTV, Smart Locks, and Sensors communicating securely.</p>
        </div>
      </div>
    </div>
  );
}