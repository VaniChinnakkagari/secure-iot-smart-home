import { useState, useEffect } from 'react';
import { 
  Activity, Wifi, HardDrive, 
  AlertTriangle, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Server
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

// Connect to the backend simulation engine
const socket = io('http://localhost:5000');

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color, onClick }) => (
  <div 
    onClick={onClick}
    className={`glass p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:glass-hover transition-all border border-[#7226FF]/30 ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[#D8B4FE] text-sm font-medium mb-1">{title}</p>
        <h3 className="text-4xl font-black text-white">{value}</h3>
      </div>
      <div 
        className="p-3 rounded-xl border border-white/10"
        style={{ backgroundColor: `${color === 'text-red-400' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(114, 38, 255, 0.1)'}` }}
      >
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    <div className="flex items-center gap-1 text-sm font-medium">
      {trendUp ? <ArrowUpRight className="w-4 h-4 text-green-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}
      <span className={trendUp ? 'text-green-400' : 'text-red-400'}>{trend}</span>
      <span className="text-[#D8B4FE]/50 ml-1">vs last min</span>
    </div>
  </div>
);
export default function Dashboard() {
  const navigate = useNavigate();
  
  // State for Database stats
  const [dbStats, setDbStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    offlineDevices: 0,
    activeAlerts: 0,
  });

  // State for Live Simulation stats
  const [liveStats, setLiveStats] = useState({
    totalPackets: 0,
    encryptedPackets: 0,
  });

  // State for charts
  const [chartData, setChartData] = useState(Array.from({ length: 20 }).map((_, i) => ({
    time: i,
    packets: 0,
    latency: 0,
  })));

  // 1. Fetch real device stats from MySQL Database on load
  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setDbStats(json.data);
        }
      })
      .catch(err => console.error("Failed to fetch DB stats:", err));
  }, []);

  // 2. Listen to live packets from Socket.IO
  useEffect(() => {
    socket.emit('sim:start', { speed: 1000, loss: 0.05 }); // Start simulation

    socket.on('sim:packet', (packet) => {
      // Update live packet counters
      setLiveStats(prev => ({
        totalPackets: prev.totalPackets + 1,
        encryptedPackets: packet.status === 'ok' ? prev.encryptedPackets + 1 : prev.encryptedPackets,
      }));

      // Update the charts with the new packet data
      setChartData(prevData => {
        const newData = [...prevData.slice(1)];
        const lastPackets = newData[newData.length - 1].packets;
        
        newData.push({
          time: newData[newData.length - 1].time + 1,
          packets: lastPackets + Math.floor(Math.random() * 20) + 5, 
          latency: Math.floor(Math.random() * 10) + 12, // Simulated latency
        });
        return newData;
      });
    });

    return () => {
      socket.off('sim:packet');
      socket.emit('sim:stop');
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
          title="Total Devices (MySQL)" 
          value={dbStats.totalDevices.toString()} 
          icon={HardDrive} 
          trend="Live" 
          trendUp={true} 
          color="text-blue-400" 
          onClick={() => navigate('/app/devices')} // <--- ADD THIS LINE
        />
               <StatCard 
          title="Active Connections" 
          value={dbStats.activeDevices.toString()} 
          icon={Wifi} 
          trend="Live" 
          trendUp={true} 
          color="text-[#D8B4FE]" 
          onClick={() => navigate('/app/connections')} // <-- Change this to /app/connections
        />
                <StatCard 
          title="Packets Transmitted" 
          value={liveStats.totalPackets.toLocaleString()} 
          icon={Activity} 
          trend="Live" 
          trendUp={true} 
          color="text-[#7226FF]" 
          onClick={() => navigate('/app/packet-stream')} // <-- Point to the new page
        />
              <StatCard 
          title="Security Alerts (MySQL)" 
          value={dbStats.activeAlerts.toString()} 
          icon={AlertTriangle} 
          trend="Live" 
          trendUp={false} 
          color="text-red-400" 
          onClick={() => navigate('/app/security-alerts')} // <--- New route
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Network Traffic Chart */}
        <div className="glass p-6 rounded-2xl lg:col-span-2 border border-[#7226FF]/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#7226FF]" />
              Network Traffic (Live Packets)
            </h3>
            <span className="text-xs font-bold text-[#D8B4FE] bg-[#7226FF]/20 px-3 py-1 rounded-md border border-[#7226FF]/30">
              {liveStats.totalPackets} Total
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7226FF" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#7226FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#D8B4FE" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#160078', borderRadius: '12px', border: '1px solid #7226FF', color: '#fff' }}
                />
                <Area type="monotone" dataKey="packets" stroke="#7226FF" strokeWidth={3} fillOpacity={1} fill="url(#colorPackets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Chart */}
        <div className="glass p-6 rounded-2xl border border-[#7226FF]/30">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-[#D8B4FE]" />
            Latency (ms)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#D8B4FE" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(114, 38, 255, 0.1)' }} />
                <Bar dataKey="latency" fill="#D8B4FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions Row (New Addition) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        
        {/* Action 1 */}
        <div 
          onClick={() => navigate('/app/smart-home')}
          className="glass p-6 rounded-2xl cursor-pointer hover:glass-hover border border-[#7226FF]/30 group flex items-center justify-between"
        >
          <div>
            <h4 className="text-white font-bold text-lg">Explore 3D Home</h4>
            <p className="text-[#D8B4FE] text-sm">View IoT devices in 3D space.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#7226FF]/20 flex items-center justify-center group-hover:bg-[#7226FF] transition-all">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Action 2 */}
        <div 
          onClick={() => navigate('/app/analyzer')}
          className="glass p-6 rounded-2xl cursor-pointer hover:glass-hover border border-[#D8B4FE]/30 group flex items-center justify-between"
        >
          <div>
            <h4 className="text-white font-bold text-lg">Analyze Packets</h4>
            <p className="text-[#D8B4FE] text-sm">Inspect live network traffic.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#D8B4FE]/20 flex items-center justify-center group-hover:bg-[#D8B4FE] transition-all">
            <ArrowUpRight className="w-5 h-5 text-[#010030]" />
          </div>
        </div>

        {/* Action 3 */}
        <div 
          onClick={() => navigate('/app/encryption')}
          className="glass p-6 rounded-2xl cursor-pointer hover:glass-hover border border-green-500/30 group flex items-center justify-between"
        >
          <div>
            <h4 className="text-white font-bold text-lg">AES-256 Encryption</h4>
            <p className="text-[#D8B4FE] text-sm">Test the encryption engine.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500 transition-all">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
        </div>

      </div>

    </div>
  );
}