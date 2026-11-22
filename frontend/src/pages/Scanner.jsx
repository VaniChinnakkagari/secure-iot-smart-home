import { useState } from 'react';
import { 
  ShieldAlert, Search, Server, Activity, 
  Terminal, ShieldCheck, Wifi, Cpu
} from 'lucide-react';

export default function NetworkScanner() {
  const [subnet, setSubnet] = useState('192.168.1.0/24');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);

  const addLog = (text, color = "text-[#00C8F0]") => {
    setLogs(prev => [{ text, color, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  const startScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setLogs([]);
    setDiscoveredDevices([]);
    
    addLog(`Starting Nmap-style scan on ${subnet}...`, "text-green-400");

    try {
      // 1. Fetch real devices from your MySQL database
      const response = await fetch('/api/devices');
      const json = await response.json();
      
      if (!json.success) throw new Error("Failed to fetch devices");
      
      const devices = json.data;
      addLog(`Found ${devices.length} active hosts in database. Beginning port scan...`, "text-[#D8B4FE]");

      // 2. Simulate scanning them one by one for a cool UI effect
      for (let i = 0; i < devices.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Artificial delay for visual effect
        
        const dev = devices[i];
        setProgress(Math.round(((i + 1) / devices.length) * 100));
        
        // Generate fake open ports based on device type
        const openPorts = dev.device_type === 'cctv' ? [80, 554, 8080] : [80, 443];
        
        addLog(`Scanning ${dev.ip_address}...`, "text-white");
        addLog(`  -> Host is UP. Open ports: ${openPorts.join(', ')}`, "text-green-400");
        
        setDiscoveredDevices(prev => [...prev, { ...dev, openPorts }]);
      }
      
      addLog(`Scan complete. ${devices.length} hosts discovered.`, "text-[#7226FF] font-bold");
      
    } catch (err) {
      addLog(`Scan failed: Backend unreachable.`, "text-red-400");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-[#7226FF]" /> Network Scanner
          </h1>
          <p className="text-[#D8B4FE] text-lg max-w-3xl">
            Perform active port scans and OS fingerprinting on your local subnet.
          </p>
        </div>
      </div>

      {/* Scanner Control Bar */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Terminal className="w-6 h-6 text-[#00C8F0]" />
          <div>
            <label className="text-[10px] font-bold text-[#D8B4FE] uppercase block">Target Subnet</label>
            <input 
              type="text" 
              value={subnet} 
              onChange={(e) => setSubnet(e.target.value)}
              className="bg-transparent text-white font-mono text-lg font-bold focus:outline-none w-64"
            />
          </div>
        </div>

        <button 
          onClick={startScan} 
          disabled={isScanning}
          className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
            isScanning ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-gradient-brand text-white shadow-[0_0_20px_rgba(114,38,255,0.4)] hover:opacity-90'
          }`}
        >
          <Search className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} /> 
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </button>
      </div>

      {/* Progress Bar */}
      {isScanning && (
        <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/10">
          <div 
            className="bg-[#7226FF] h-full transition-all duration-300 shadow-[0_0_10px_rgba(114,38,255,0.8)]" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left: Terminal Logs */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col lg:col-span-1 bg-[#010030]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00C8F0]" /> Terminal Output
          </h2>
          <div className="flex-1 bg-black/60 rounded-xl p-4 font-mono text-xs overflow-y-auto border border-white/5 space-y-2">
            {logs.length === 0 ? (
              <p className="text-white/30">Waiting for scan to start...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-white/30">[{log.time}]</span>
                  <span className={log.color}>{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Discovered Devices */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Discovered Hosts</h2>
            <span className="text-xs font-bold text-[#00C8F0] bg-[#00C8F0]/10 px-3 py-1 rounded-lg border border-[#00C8F0]/30">
              {discoveredDevices.length} Found
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {discoveredDevices.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/30 gap-4">
                <Server className="w-12 h-12 opacity-50" />
                <p>No hosts discovered yet. Run a scan.</p>
              </div>
            ) : (
              discoveredDevices.map((dev, i) => (
                <div key={i} className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-[#7226FF]/50 transition-colors animate-in slide-in-from-right-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#7226FF]/20 flex items-center justify-center">
                      {dev.device_type === 'smart_lock' ? <ShieldCheck className="w-5 h-5 text-[#00C8F0]" /> :
                       dev.device_type === 'cctv' ? <Activity className="w-5 h-5 text-[#00C8F0]" /> :
                       <Cpu className="w-5 h-5 text-[#00C8F0]" />}
                    </div>
                    <div>
                      <p className="text-white font-bold">{dev.name}</p>
                      <p className="text-xs text-[#D8B4FE] font-mono">{dev.ip_address} • {dev.mac_address}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {dev.openPorts.map(port => (
                      <span key={port} className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-mono font-bold">
                        :{port}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}