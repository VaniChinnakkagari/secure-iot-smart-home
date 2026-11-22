import { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Activity, Download, BarChart3, 
  Cpu, Wifi, Play, Square
} from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const COLORS = ['#7226FF', '#00C8F0', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [trafficData, setTrafficData] = useState([]);
  const [protocolData, setProtocolData] = useState([
    { name: 'TCP', value: 0 },
    { name: 'UDP', value: 0 },
    { name: 'MQTT', value: 0 },
    { name: 'HTTP', value: 0 }
  ]);
  const [totalPackets, setTotalPackets] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  const capturingRef = useRef(false);
  const protocolCounts = useRef({ TCP: 0, UDP: 0, MQTT: 0, HTTP: 0 });

  useEffect(() => {
    capturingRef.current = isCapturing;
  }, [isCapturing]);

  useEffect(() => {
    socket.on('sim:packet', (packet) => {
      if (!capturingRef.current) return;

      setTotalPackets(prev => prev + 1);

      const proto = packet.protocol || 'TCP';
      protocolCounts.current[proto] = (protocolCounts.current[proto] || 0) + 1;
      
      setProtocolData([
        { name: 'TCP', value: protocolCounts.current.TCP },
        { name: 'UDP', value: protocolCounts.current.UDP },
        { name: 'MQTT', value: protocolCounts.current.MQTT },
        { name: 'HTTP', value: protocolCounts.current.HTTP }
      ]);

      setTrafficData(prev => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        const newData = [...prev, { 
          time: timeStr, 
          packets: packet.size || Math.floor(Math.random() * 500) + 100,
          protocol: proto 
        }];
        
        return newData.slice(-15);
      });
    });

    return () => {
      socket.off('sim:packet');
    };
  }, []);

  const handleStart = () => {
    setIsCapturing(true);
    socket.emit('sim:start', { speed: 1000, loss: 0.02 });
  };

  const handleStop = () => {
    setIsCapturing(false);
    socket.emit('sim:stop');
  };

  const handleExport = () => {
    if (trafficData.length === 0) {
      alert("No data to export. Start a capture first!");
      return;
    }

    const headers = ["Timestamp", "Packet Size (Bytes)", "Protocol"];
    const csvRows = trafficData.map(row => [row.time, row.packets, row.protocol].join(","));
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `IoT_Network_Report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 h-[calc(100vh-100px)] animate-in fade-in">
      
      {/* Header Section - Puts buttons on the left, avoiding the top right corner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-[#7226FF]" /> Analytics & Reports
          </h1>
          <p className="text-[#D8B4FE] text-lg max-w-3xl mb-6">
            Real-time network performance, throughput, and protocol distribution.
          </p>
          
          {/* Action Buttons moved below the title */}
          <div className="flex gap-3">
            {!isCapturing ? (
              <button onClick={handleStart} className="px-6 py-2.5 bg-gradient-brand text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-[0_0_15px_rgba(114,38,255,0.4)]">
                <Play className="w-4 h-4" /> Start Capture
              </button>
            ) : (
              <button onClick={handleStop} className="px-6 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold flex items-center gap-2 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <Square className="w-4 h-4" /> Stop Capture
              </button>
            )}
            
            <button 
              onClick={handleExport}
              className="px-6 py-2.5 bg-[#160078] border border-[#7226FF]/50 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#7226FF]/20 transition-colors"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#00C8F0]" />
          <p className="text-sm font-bold text-[#D8B4FE] uppercase mb-2">Total Packets Captured</p>
          <h3 className="text-4xl font-black text-white">{totalPackets}</h3>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${isCapturing ? 'bg-green-500' : 'bg-white/20'}`} />
          <p className="text-sm font-bold text-[#D8B4FE] uppercase mb-2">Network Status</p>
          <h3 className={`text-3xl font-black flex items-center gap-2 ${isCapturing ? 'text-green-400' : 'text-white/50'}`}>
            {isCapturing ? (
              <><span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" /> LIVE</>
            ) : 'IDLE'}
          </h3>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#7226FF]" />
          <p className="text-sm font-bold text-[#D8B4FE] uppercase mb-2">Capture Protocol</p>
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Wifi className="w-6 h-6 text-[#7226FF]" /> Socket.IO Stream
          </h3>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* Traffic Area Chart */}
        <div className="glass p-6 rounded-3xl border border-white/10 lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#7226FF]" /> Packet Transmission (Live)
          </h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7226FF" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#7226FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#D8B4FE" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#D8B4FE" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#160078', borderRadius: '12px', border: '1px solid #7226FF', color: '#fff' }}
                  itemStyle={{ color: '#00C8F0' }}
                />
                <Area type="monotone" dataKey="packets" stroke="#7226FF" strokeWidth={3} fillOpacity={1} fill="url(#colorPackets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Donut Chart */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#00C8F0]" /> Protocol Distribution
          </h2>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            {protocolData.every(p => p.value === 0) ? (
              <p className="text-white/30 text-sm">No data. Start capture to see distribution.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={protocolData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {protocolData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#160078', borderRadius: '12px', border: '1px solid #7226FF', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}