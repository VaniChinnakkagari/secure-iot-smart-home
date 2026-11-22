import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SecurityAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts from the backend (which pulls from MySQL)
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/security/alerts');
      const json = await res.json();
      if (json.success) setAlerts(json.data);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Resolve an alert
  const handleResolve = async (id) => {
    try {
      await fetch(`/api/security/alerts/${id}/resolve`, { method: 'PUT' });
      fetchAlerts(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

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
          <h1 className="text-3xl font-bold text-white mb-1">Security Alerts</h1>
          <p className="text-[#D8B4FE]">Monitor and resolve network security events recorded in the database.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Alerts Column */}
        <div className="glass rounded-2xl border border-red-500/30 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-red-500/10">
            <h3 className="font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Active Threats ({activeAlerts.length})
            </h3>
          </div>
          <div className="flex flex-col p-4 gap-4">
            {loading ? (
              <div className="text-center text-[#D8B4FE]">Loading...</div>
            ) : activeAlerts.length === 0 ? (
              <div className="text-center text-green-400 py-10 flex flex-col items-center gap-2">
                <ShieldCheck className="w-10 h-10" /> No active threats. All secure.
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div key={alert.id} className="bg-black/40 border border-red-500/20 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-5 h-5 ${alert.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                      <h4 className="font-bold text-white uppercase tracking-wider text-sm">{alert.event_type.replace('_', ' ')}</h4>
                    </div>
                    <span className="text-xs text-[#D8B4FE]">{new Date(alert.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-[#D8B4FE]">{alert.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-mono text-white/50 bg-white/5 px-2 py-1 rounded">IP: {alert.source_ip || 'Unknown'}</span>
                    <button 
                      onClick={() => handleResolve(alert.id)}
                      className="px-4 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resolved Alerts Column */}
        <div className="glass rounded-2xl border border-green-500/30 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-green-500/10">
            <h3 className="font-bold text-green-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Resolved Logs ({resolvedAlerts.length})
            </h3>
          </div>
          <div className="flex flex-col p-4 gap-3 max-h-[600px] overflow-y-auto">
            {resolvedAlerts.map(alert => (
              <div key={alert.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-1 opacity-70">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white">{alert.event_type.replace('_', ' ')}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs text-[#D8B4FE]">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}