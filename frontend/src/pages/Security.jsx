import { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, 
  AlertTriangle, Activity, CheckCircle2 
} from 'lucide-react';

export default function SecurityCenter() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real alerts from MySQL Database
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Assuming your backend route is /api/security/alerts
      const res = await fetch('/api/security/alerts');
      const json = await res.json();
      
      if (json.success) {
        setAlerts(json.data);
      } else {
        setError("Failed to load security events.");
      }
    } catch (err) {
      setError("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Mark an alert as resolved in the DB
  const handleResolve = async (id) => {
    try {
      const res = await fetch(`/api/security/alerts/${id}/resolve`, { method: 'PUT' });
      const json = await res.json();
      if (json.success) {
        // Optimistically update UI
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: 1 } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- DYNAMIC CALCULATIONS ---
  const activeThreats = alerts.filter(a => a.resolved === 0).length;
  const resolvedThreats = alerts.filter(a => a.resolved === 1).length;
  const totalEvents = alerts.length;

  // Score starts at 100. Deduct 15 points for every active threat.
  const securityScore = Math.max(0, 100 - (activeThreats * 15));

  // Helper for severity colors
  const getSeverityColor = (severity) => {
    if (severity === 'critical' || severity === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (severity === 'medium') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#7226FF]" /> Security Center
          </h1>
          <p className="text-[#D8B4FE] text-lg max-w-3xl">
            Monitor network threats, authentication logs, and system integrity.
          </p>
        </div>
        <button 
          onClick={fetchAlerts} 
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-colors"
        >
          <Activity className="w-4 h-4 text-[#00C8F0]" /> Refresh Logs
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Network Security Score */}
        <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
          <p className="text-sm font-bold text-[#D8B4FE] uppercase mb-2">Network Security Score</p>
          <div className="flex items-end gap-2">
            <h3 className={`text-5xl font-black ${securityScore > 70 ? 'text-green-400' : securityScore > 40 ? 'text-orange-400' : 'text-red-400'}`}>
              {securityScore}
            </h3>
            <span className="text-white/50 font-bold mb-1">/ 100</span>
          </div>
          <p className="text-xs text-white/50 mt-2">Score decreases by 15 for every active threat.</p>
        </div>

        {/* Active Threats */}
        <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          <p className="text-sm font-bold text-[#D8B4FE] uppercase mb-2">Active Threats</p>
          <h3 className="text-5xl font-black text-red-400">{activeThreats}</h3>
          <p className="text-xs text-white/50 mt-2">Unresolved security events in database.</p>
        </div>

        {/* Status Summary */}
        <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#00C8F0]" />
          <p className="text-sm font-bold text-[#D8B4FE] uppercase mb-2">Total Events Logged</p>
          <h3 className="text-5xl font-black text-white">{totalEvents}</h3>
          <p className="text-xs text-white/50 mt-2">{resolvedThreats} have been resolved.</p>
        </div>

      </div>

      {/* Event History Table */}
      <div className="glass p-6 rounded-3xl border border-white/10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00C8F0]" /> Event History
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-white/50">Loading logs...</div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/30 gap-2">
              <ShieldCheck className="w-10 h-10 opacity-50" />
              <p>No security events found in the database.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isResolved = alert.resolved === 1;
              return (
                <div 
                  key={alert.id} 
                  className={`border rounded-xl p-4 flex items-center justify-between transition-all ${
                    isResolved ? 'bg-black/20 border-white/5 opacity-60' : 'bg-black/40 border-white/10 hover:border-[#7226FF]/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg border ${isResolved ? 'bg-green-500/10 border-green-500/20 text-green-400' : getSeverityColor(alert.severity)}`}>
                      {isResolved ? <CheckCircle2 className="w-6 h-6" /> : 
                       alert.severity === 'high' ? <ShieldAlert className="w-6 h-6" /> : 
                       <AlertTriangle className="w-6 h-6" />}
                    </div>
                    
                    <div>
                      <h4 className={`font-bold ${isResolved ? 'text-white/50 line-through' : 'text-white'}`}>
                        {alert.event_type || 'Security Event'}
                      </h4>
                      <p className="text-sm text-[#D8B4FE]">{alert.description || 'No description provided.'}</p>
                      <p className="text-xs font-mono text-white/40 mt-1">
                        IP: {alert.source_ip || 'Unknown'} • {new Date(alert.created_at || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Resolve Button */}
                  {!isResolved ? (
                    <button 
                      onClick={() => handleResolve(alert.id)}
                      className="px-4 py-2 bg-white/5 hover:bg-green-500/20 hover:text-green-400 border border-white/10 hover:border-green-500/30 rounded-lg text-sm font-bold text-white transition-all"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                      Resolved
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}