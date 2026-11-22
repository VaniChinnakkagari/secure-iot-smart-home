import { useState, useEffect } from 'react';
import { 
  Menu, Bell, Settings, Play, Square, Pause, X, 
  ShieldAlert, AlertTriangle, CheckCircle2, Info
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Topbar({ setIsOpen }) {
  const location = useLocation();
  const [showControl, setShowControl] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [loss, setLoss] = useState(5);
  const [speed, setSpeed] = useState(1500);
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const title = location.pathname === '/' ? 'Landing Page' : 
    location.pathname.split('/')[2].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Fetch recent alerts for notifications
  useEffect(() => {
    fetch('/api/security/alerts')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const recentAlerts = json.data
            .filter(a => a.resolved === 0)
            .slice(0, 5)
            .map(a => ({
              id: a.id,
              title: a.event_type.replace(/_/g, ' ').toUpperCase(),
              desc: a.description,
              severity: a.severity,
              read: false,
              time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
          setNotifications(recentAlerts);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleStart = () => {
    socket.emit('sim:start', { speed: Number(speed), loss: Number(loss) / 100 });
    setShowControl(false);
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical' || severity === 'high') return <ShieldAlert className="w-4 h-4 text-red-400" />;
    if (severity === 'medium') return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    return <Info className="w-4 h-4 text-green-400" />;
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 glass rounded-none border-x-0 border-t-0 border-b border-[#7226FF]/30 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsOpen(true)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-4 relative">
        
        {/* SIM CONTROLS */}
        <button 
          onClick={() => { setShowControl(!showControl); setShowNotifications(false); }} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${showControl ? 'bg-[#7226FF] text-white' : 'bg-[#7226FF]/20 text-[#D8B4FE] hover:bg-[#7226FF]/40'}`}
        >
          <Settings className="w-4 h-4" /> Sim Controls
        </button>

        {/* --- NOTIFICATION BELL --- */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowControl(false); }}
            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#010030] text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          {showNotifications && (
            <div className="absolute top-14 right-0 w-80 bg-[#0A003B] shadow-2xl rounded-2xl border border-[#7226FF]/50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white">Security Alerts</h3>
                <button onClick={() => setShowNotifications(false)} className="text-white/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-white/50 text-sm">
                    <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2 opacity-50" />
                    All clear. No active security alerts.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="mt-1">{getSeverityIcon(n.severity)}</div>
                        <div>
                          <p className="text-sm font-bold text-white">{n.title}</p>
                          <p className="text-xs text-[#D8B4FE] mt-1 line-clamp-2">{n.desc}</p>
                          <p className="text-[10px] text-white/40 mt-2 font-mono">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-white/10 bg-white/5 text-center">
                <a href="/app/security" className="text-xs font-bold text-[#00C8F0] hover:text-white transition-colors">
                  View All in Security Center →
                </a>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SIM CONTROLS POPUP */}
      {showControl && (
        <div className="absolute top-14 right-24 w-80 bg-[#0A003B] shadow-2xl rounded-2xl p-5 border border-[#7226FF]/50 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#00C8F0]" /> Global Simulation
            </h3>
            <button onClick={() => setShowControl(false)} className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-1 rounded-md transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mb-5">
            <label className="flex justify-between text-sm font-medium text-[#D8B4FE] mb-2">
              <span>Packet Loss</span> <span className="text-white font-bold">{loss}%</span>
            </label>
            <input type="range" min="0" max="100" value={loss} onChange={(e) => setLoss(e.target.value)} className="w-full accent-[#7226FF]" />
          </div>

          <div className="mb-6">
            <label className="flex justify-between text-sm font-medium text-[#D8B4FE] mb-2">
              <span>Transmission Speed</span> <span className="text-white font-bold">{speed}ms</span>
            </label>
            <input type="range" min="200" max="3000" step="100" value={speed} onChange={(e) => setSpeed(e.target.value)} className="w-full accent-[#7226FF]" />
          </div>

          <div className="flex gap-2">
            <button onClick={handleStart} className="flex-1 py-2.5 bg-gradient-brand text-white font-bold rounded-lg flex justify-center items-center gap-2 hover:opacity-90 shadow-[0_0_15px_rgba(114,38,255,0.3)]">
              <Play className="w-4 h-4"/> Start
            </button>
            <button onClick={() => socket.emit('sim:pause')} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-white/10 transition-colors">
              <Pause className="w-4 h-4"/> Pause
            </button>
            <button onClick={() => socket.emit('sim:stop')} className="flex-1 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-red-500/20 transition-colors">
              <Square className="w-4 h-4"/> Stop
            </button>
          </div>
        </div>
      )}

    </header>
  );
}