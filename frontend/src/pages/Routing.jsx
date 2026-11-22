import { useState, useEffect, useMemo } from 'react';
import { Network, Route, CheckCircle2, RotateCcw, ShieldAlert, Activity } from 'lucide-react';

export default function Routing() {
  const [topology, setTopology] = useState({ nodes: [], connections: [] });
  const [loading, setLoading] = useState(true);
  
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [linkFailed, setLinkFailed] = useState(false); // NEW STATE
  
  const [routeResult, setRouteResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetch('/api/routing/topology')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setTopology(json.data);
          if (json.data.nodes.length > 0) {
            setStartNode(json.data.nodes[0].id.toString());
            setEndNode(json.data.nodes[json.data.nodes.length - 1].id.toString());
          }
        }
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const graphOffset = useMemo(() => {
    if (!topology.nodes.length) return { x: 0, y: 0 };
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    topology.nodes.forEach(n => {
      if (n.position_x < minX) minX = n.position_x;
      if (n.position_x > maxX) maxX = n.position_x;
      if (n.position_y < minY) minY = n.position_y;
      if (n.position_y > maxY) maxY = n.position_y;
    });

    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  }, [topology.nodes]);

  const getScreenPos = (node) => {
    const x = 50 + ((node.position_x - graphOffset.x) * 12);
    const y = 50 - ((node.position_y - graphOffset.y) * 18);
    return { x, y };
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setRouteResult(null);
    try {
      const res = await fetch('/api/routing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          algorithm, 
          startNode: Number(startNode), 
          endNode: Number(endNode),
          linkFailed // Send the failure state
        })
      });
      const json = await res.json();
      if (json.success) {
        setRouteResult(json.data);
      } else {
        alert(json.error.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const isLinkInRoute = (source, target) => {
    if (!routeResult || !routeResult.path) return false;
    const path = routeResult.path;
    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i] === source && path[i+1] === target) ||
        (path[i] === target && path[i+1] === source)
      ) {
        return true;
      }
    }
    return false;
  };

  if (loading) return <div className="p-10 text-center text-[#D8B4FE]">Loading topology...</div>;

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-120px)]">
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Network Topology</h1>
        <p className="text-[#D8B4FE]">Visualize shortest-path routing across the smart home infrastructure.</p>
      </div>

      <div className="glass p-6 rounded-2xl flex flex-wrap items-end justify-center gap-6 border border-[#7226FF]/30 shadow-[0_0_30px_rgba(114,38,255,0.1)] shrink-0">
        <div>
          <label className="block text-sm font-bold text-[#D8B4FE] mb-2 uppercase tracking-wider">Algorithm</label>
          <select 
            value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}
            className="w-56 px-4 py-3 bg-black/40 border border-[#7226FF]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7226FF] font-bold text-white appearance-none cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="dijkstra" style={{ backgroundColor: '#010030', color: '#FFFFFF' }}>Link State (Dijkstra)</option>
            <option value="distance_vector" style={{ backgroundColor: '#010030', color: '#FFFFFF' }}>Distance Vector</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-[#D8B4FE] mb-2 uppercase tracking-wider">Source Node</label>
          <select 
            value={startNode} onChange={(e) => setStartNode(e.target.value)}
            className="w-48 px-4 py-3 bg-black/40 border border-[#7226FF]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7226FF] font-bold text-white appearance-none cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            {topology.nodes.map(n => <option key={n.id} value={n.id} style={{ backgroundColor: '#010030' }}>{n.label}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-[#D8B4FE] mb-2 uppercase tracking-wider">Dest Node</label>
          <select 
            value={endNode} onChange={(e) => setEndNode(e.target.value)}
            className="w-48 px-4 py-3 bg-black/40 border border-[#7226FF]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7226FF] font-bold text-white appearance-none cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            {topology.nodes.map(n => <option key={n.id} value={n.id} style={{ backgroundColor: '#010030' }}>{n.label}</option>)}
          </select>
        </div>
        
        <button 
          onClick={handleCalculate} disabled={calculating || startNode === endNode}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-brand text-white font-bold rounded-xl shadow-lg shadow-[#7226FF]/30 hover:opacity-90 transition-all disabled:opacity-50 h-[48px]"
        >
          {calculating ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Route className="w-5 h-5" />}
          Calculate Route
        </button>

        <button 
          onClick={() => setLinkFailed(!linkFailed)}
          className={`flex items-center gap-2 px-6 py-3 border rounded-xl font-bold h-[48px] transition-all ${linkFailed ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-black/30 border-white/20 text-white hover:bg-white/10'}`}
        >
          {linkFailed ? <ShieldAlert className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
          {linkFailed ? 'Fix Core Router' : 'Simulate Core Router Crash'}
        </button>
      </div>

      <div className="flex-1 glass rounded-2xl relative overflow-hidden flex items-center justify-center border border-[#7226FF]/30 bg-[#010030]">
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(114, 38, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(114, 38, 255, 0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
          {topology.connections.map((conn, idx) => {
            const source = topology.nodes.find(n => n.id === conn.source_node_id);
            const target = topology.nodes.find(n => n.id === conn.target_node_id);
            if (!source || !target) return null;

            const pos1 = getScreenPos(source);
            const pos2 = getScreenPos(target);
            const inRoute = isLinkInRoute(source.id, target.id);
            
            // Check if this specific link is the one we "broke"
            const isBrokenLink = linkFailed && (
              (source.id === 1 && target.id === 2) || 
              (source.id === 2 && target.id === 1)
            );

            return (
              <g key={idx}>
                {inRoute && !isBrokenLink && (
                  <line 
                    x1={`${pos1.x}%`} y1={`${pos1.y}%`} x2={`${pos2.x}%`} y2={`${pos2.y}%`} 
                    stroke="#7226FF" strokeWidth={12} opacity={0.3} className="blur-md"
                  />
                )}
                <line 
                  x1={`${pos1.x}%`} y1={`${pos1.y}%`} x2={`${pos2.x}%`} y2={`${pos2.y}%`} 
                  stroke={isBrokenLink ? '#FF4560' : (inRoute ? '#D8B4FE' : 'rgba(255, 255, 255, 0.2)')} 
                  strokeWidth={inRoute ? 4 : 2}
                  strokeDasharray={isBrokenLink ? "4 4" : (inRoute ? "0" : "6 6")}
                  className="transition-all duration-700"
                />
                <circle 
                  cx={`${(pos1.x+pos2.x)/2}%`} cy={`${(pos1.y+pos2.y)/2}%`} r="16" 
                  fill={inRoute ? '#7226FF' : '#010030'} 
                  stroke={inRoute ? '#D8B4FE' : '#7226FF'}
                  strokeWidth="2"
                  className="transition-all duration-700"
                />
                <text 
                  x={`${(pos1.x+pos2.x)/2}%`} y={`${(pos1.y+pos2.y)/2}%`} 
                  dy=".3em" textAnchor="middle" fontSize="12" fontWeight="bold"
                  fill={inRoute ? '#FFFFFF' : '#D8B4FE'}
                >
                  {isBrokenLink ? 'X' : conn.link_cost}
                </text>
              </g>
            );
          })}
        </svg>

        {topology.nodes.map(node => {
          const pos = getScreenPos(node);
          const isStart = Number(startNode) === node.id;
          const isEnd = Number(endNode) === node.id;
          const isInPath = routeResult && routeResult.path.includes(node.id);

          return (
            <div 
              key={node.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 transition-all duration-700 z-20 ${isInPath ? 'scale-110' : ''}`}
            >
              <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-500
                ${isStart ? 'bg-[#7226FF] text-white border-white shadow-[0_0_20px_rgba(114,38,255,0.8)]' : 
                  isEnd ? 'bg-[#D8B4FE] text-[#010030] border-white shadow-[0_0_20px_rgba(216,180,254,0.8)]' : 
                  isInPath ? 'bg-[#160078] text-[#D8B4FE] border-[#7226FF]' : 
                  'bg-black/60 text-white/50 border-white/20'}`}
              >
                <Network className="w-7 h-7 mb-1" />
                <span className="text-[10px] font-bold uppercase">{node.node_type}</span>
              </div>
              
              <div className={`px-3 py-1.5 rounded-lg border backdrop-blur-md text-center whitespace-nowrap transition-all duration-500
                ${isStart || isEnd || isInPath ? 'bg-[#7226FF]/80 border-[#D8B4FE] text-white' : 'bg-black/60 border-white/10 text-white/70'}`}
              >
                <span className="text-xs font-bold">{node.label}</span>
                <span className="block text-[9px] opacity-70 font-mono">{node.ip_address}</span>
              </div>
            </div>
          );
        })}

        {routeResult && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#010030]/95 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-2xl border border-[#7226FF] flex items-center gap-8 animate-in slide-in-from-bottom-8 z-30 w-[90%] max-w-3xl">
            <div className="p-3 bg-green-500/20 rounded-full shrink-0">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#D8B4FE] font-bold uppercase tracking-wider mb-1">
                {routeResult.algorithm === 'dijkstra' ? 'Link State (Dijkstra) Result' : 'Distance Vector Result'}
              </p>
              <div className="flex items-center gap-3">
                <p className="text-lg font-black text-white">Cost: {routeResult.cost}</p>
                <span className="text-white/30">|</span>
                <p className="text-sm text-[#D8B4FE]">Hops: {routeResult.path.length - 1}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 border-l border-white/10 pl-6 overflow-x-auto">
               {routeResult.path.map((nodeId, idx) => {
                 const node = topology.nodes.find(n => n.id === nodeId);
                 return (
                   <div key={idx} className="flex items-center gap-2">
                     <div className="px-3 py-1.5 bg-[#7226FF]/30 border border-[#7226FF] rounded-lg text-xs font-bold text-white whitespace-nowrap">
                       {node?.label || nodeId}
                     </div>
                     {idx < routeResult.path.length - 1 && (
                       <span className="text-[#7226FF] font-bold">→</span>
                     )}
                   </div>
                 );
               })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}