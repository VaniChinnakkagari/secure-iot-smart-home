import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Cpu, Wifi, Shield, ShieldAlert, 
  Search, RefreshCw, X, Power
} from 'lucide-react';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', device_type: 'cctv', ip_address: '', mac_address: '', room: ''
  });

  // Fetch devices from API
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/devices');
      const json = await res.json();
      if (json.success) setDevices(json.data);
    } catch (err) {
      console.error("Failed to fetch devices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Add new device
  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', device_type: 'cctv', ip_address: '', mac_address: '', room: '' });
        fetchDevices();
      } else {
        const error = await res.json();
        alert(error.error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete device
  const handleDeleteDevice = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this device?")) return;
    try {
      await fetch(`/api/devices/${id}`, { method: 'DELETE' });
      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Device Status (Premium Feature)
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'online' ? 'offline' : 'online';
    
    // Optimistic UI update
    setDevices(devices.map(d => d.id === id ? { ...d, status: newStatus } : d));

    try {
      await fetch(`/api/devices/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error("Failed to update status", err);
      fetchDevices(); // Revert if error
    }
  };

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.ip_address.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Device Management</h1>
          <p className="text-[#D8B4FE]">Provision, monitor, and control your smart home network.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Premium Search Pill */}
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#D8B4FE]/50" />
            <input 
              type="text" 
              placeholder="Search IP or Name..." 
              className="w-full pl-11 pr-4 py-3 bg-[#160078]/30 border border-[#7226FF]/40 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7226FF] text-white placeholder-white/30 text-sm transition-all shadow-inner shadow-black/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchDevices} className="p-3 bg-[#160078]/30 border border-[#7226FF]/40 rounded-full hover:bg-[#7226FF]/20 text-[#D8B4FE] transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-full font-bold shadow-lg shadow-[#7226FF]/30 hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" /> Add Device
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-[#D8B4FE]">Scanning database...</div>
        ) : filteredDevices.length === 0 ? (
          <div className="col-span-full py-20 text-center glass rounded-2xl text-[#D8B4FE]">
            No devices found. Add a new device to begin.
          </div>
        ) : (
          filteredDevices.map(device => (
            <div key={device.id} className="glass p-6 rounded-2xl flex flex-col gap-5 group hover:glass-hover transition-all border border-[#7226FF]/30 relative overflow-hidden">
              
              {/* Status Glow Indicator */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-20 transition-all ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />

              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-xl border ${device.status === 'online' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    <Cpu className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg tracking-tight">{device.name}</h3>
                    <p className="text-xs text-[#D8B4FE]/70 uppercase tracking-wider font-semibold">{device.device_type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm bg-black/30 p-4 rounded-xl border border-white/5 z-10">
                <div>
                  <span className="text-[#D8B4FE]/50 block text-[10px] uppercase font-bold tracking-widest mb-1">IP Address</span>
                  <span className="font-medium text-white font-mono">{device.ip_address}</span>
                </div>
                <div>
                  <span className="text-[#D8B4FE]/50 block text-[10px] uppercase font-bold tracking-widest mb-1">MAC Address</span>
                  <span className="font-medium text-white font-mono text-xs">{device.mac_address}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#D8B4FE]/60 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5" /> {device.room || 'Unassigned'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button onClick={() => handleDeleteDevice(device.id)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Premium Status Toggle Switch */}
                  <button 
                    onClick={() => handleToggleStatus(device.id, device.status)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${device.status === 'online' ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'}`}
                  >
                    <Power className="w-3 h-3" />
                    {device.status.toUpperCase()}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Device Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#010030]/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="glass w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-200 border border-[#7226FF]/50 shadow-[0_0_50px_rgba(114,38,255,0.2)]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-white mb-6">Provision Device</h2>
            
            <form onSubmit={handleAddDevice} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-[#D8B4FE] uppercase tracking-wider mb-2">Device Name</label>
                <input required type="text" className="w-full px-4 py-3 bg-black/30 border border-[#7226FF]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7226FF] text-white placeholder-white/20" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Backyard Camera" />
              </div>

            
                            <div>
                <label className="block text-xs font-bold text-[#D8B4FE] uppercase tracking-wider mb-2">Device Type</label>
                <select 
                  className="w-full px-4 py-3 bg-[#160078] border border-[#7226FF]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7226FF] text-white appearance-none cursor-pointer"
                  value={formData.device_type} 
                  onChange={e => setFormData({...formData, device_type: e.target.value})}
                  style={{ colorScheme: 'dark' }} 
                >
                  <option value="cctv" style={{ backgroundColor: '#010030', color: '#FFFFFF' }}>CCTV Camera</option>
                  <option value="smart_lock" style={{ backgroundColor: '#010030', color: '#FFFFFF' }}>Smart Door Lock</option>
                  <option value="temperature_sensor" style={{ backgroundColor: '#010030', color: '#FFFFFF' }}>Temperature Sensor</option>
                  <option value="motion_sensor" style={{ backgroundColor: '#010030', color: '#FFFFFF' }}>Motion Sensor</option>
                  <option value="smart_light" style={{ backgroundColor: '#010030', color: '#FFFFFF' }}>Smart Light</option>
                  <option value="router" style={{ backgroundColor: '#010030', color: '#FFFFFF' }}>Wi-Fi Router</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#D8B4FE] uppercase tracking-wider mb-2">IP Address</label>
                  <input required type="text" className="w-full px-4 py-3 bg-black/30 border border-[#7226FF]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7226FF] text-white font-mono placeholder-white/20" 
                    value={formData.ip_address} onChange={e => setFormData({...formData, ip_address: e.target.value})} placeholder="192.168.1.X" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#D8B4FE] uppercase tracking-wider mb-2">MAC Address</label>
                  <input required type="text" className="w-full px-4 py-3 bg-black/30 border border-[#7226FF]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7226FF] text-white font-mono placeholder-white/20" 
                    value={formData.mac_address} onChange={e => setFormData({...formData, mac_address: e.target.value})} placeholder="AA:BB:CC:DD:EE:FF" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D8B4FE] uppercase tracking-wider mb-2">Location / Room</label>
                <input type="text" className="w-full px-4 py-3 bg-black/30 border border-[#7226FF]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7226FF] text-white placeholder-white/20" 
                  value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="e.g. Living Room" />
              </div>

              <button type="submit" className="mt-4 w-full py-4 bg-gradient-brand text-white font-black tracking-wide rounded-xl shadow-lg shadow-[#7226FF]/30 hover:opacity-90 transition-all">
                Save & Deploy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}