import { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  Activity, ChevronDown
} from 'lucide-react';

export default function FlowControl() {
  const [windowSize, setWindowSize] = useState(4);
  const [totalFrames, setTotalFrames] = useState(10);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [simState, setSimState] = useState(null);

  // Initialize Simulation State
  const initSimulation = () => {
    setSimState({
      senderBase: 0,
      nextSeqNum: 0,
      receiverBase: 0,
      frames: Array.from({ length: totalFrames }).map((_, i) => ({
        id: i, sent: false, received: false, acked: false
      })),
      logs: [{ text: "Simulation initialized. Press Play to start.", color: "text-[#D8B4FE]" }],
      activeTx: null, 
    });
    setIsPlaying(false);
  };

  useEffect(() => { initSimulation(); }, [windowSize, totalFrames]);

  // --- THE LOGIC ENGINE ---
  const stepSimulation = () => {
    setSimState(prev => {
      if (!prev) return prev;
      let s = JSON.parse(JSON.stringify(prev)); 
      let logMsg = null;

      if (s.activeTx) {
        if (s.activeTx.type === 'data') {
          s.frames[s.activeTx.id].received = true;
          s.receiverBase++;
          s.activeTx = { id: s.activeTx.id, type: 'ack' };
          logMsg = { text: `Receiver accepted Frame ${s.activeTx.id}, sent ACK.`, color: "text-[#00C8F0]" };
        } 
        else if (s.activeTx.type === 'ack') {
          s.frames[s.activeTx.id].acked = true;
          s.senderBase = s.activeTx.id + 1;
          logMsg = { text: `Sender received ACK ${s.activeTx.id}. Window slides forward.`, color: "text-green-400" };
          s.activeTx = null;
        }
        return { ...s, logs: [...s.logs, logMsg] };
      }

      if (s.nextSeqNum < s.senderBase + windowSize && s.nextSeqNum < totalFrames) {
        s.activeTx = { id: s.nextSeqNum, type: 'data' };
        s.frames[s.nextSeqNum].sent = true;
        logMsg = { text: `Sender transmitting Frame ${s.nextSeqNum}...`, color: "text-[#7226FF]" };
        s.nextSeqNum++;
        return { ...s, logs: [...s.logs, logMsg] };
      }

      if (s.senderBase >= totalFrames && s.logs[s.logs.length - 1].text !== "All frames successfully transmitted!") {
        logMsg = { text: `All frames successfully transmitted!`, color: "text-green-400 font-bold" };
        setIsPlaying(false);
        return { ...s, logs: [...s.logs, logMsg] };
      }

      return s;
    });
  };

  useEffect(() => {
    let interval;
    if (isPlaying && simState) {
      interval = setInterval(stepSimulation, 1500 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, simState]);

  if (!simState) return null;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#7226FF]" /> Sliding Window Protocol
          </h1>
          <p className="text-[#D8B4FE] text-lg max-w-3xl">
            Visualize how the sender window slides forward as ACKs are received.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT PANEL: CONFIG */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col gap-5 lg:col-span-1">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Configuration</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#D8B4FE] uppercase mb-1 block">Window</label>
              <input type="number" min="2" max="6" value={windowSize} onChange={(e) => setWindowSize(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#7226FF]" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#D8B4FE] uppercase mb-1 block">Frames</label>
              <input type="number" min="5" max="15" value={totalFrames} onChange={(e) => setTotalFrames(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#7226FF]" />
            </div>
          </div>

          <button onClick={initSimulation} className="mt-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset Simulation
          </button>
        </div>

        {/* RIGHT PANEL: VISUALIZER */}
        <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col lg:col-span-3 relative overflow-hidden bg-[#010030]">
          
          {/* Legend */}
          <div className="flex gap-4 mb-8 text-xs font-bold">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#7226FF]"/> Inside Window</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500"/> Acked</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#00C8F0]"/> Received</div>
          </div>

          {/* NETWORK PATH */}
          <div className="relative h-48 flex items-center justify-between px-10 border-b border-white/10 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">SENDER</h3>
              <div className="w-24 h-16 bg-[#160078] border border-[#7226FF] rounded-lg flex flex-col items-center justify-center text-xs text-[#D8B4FE]">
                <span>Window Base</span>
                <span className="text-xl font-bold text-white">{simState.senderBase}</span>
              </div>
            </div>

            {/* Animated Packet */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-full h-1 bg-white/10 absolute top-1/2 -translate-y-1/2 rounded-full"></div>
              {simState.activeTx && (
                <div className={`absolute px-4 py-2 rounded-lg font-bold text-sm border-2 transition-all duration-500 shadow-xl ${
                  simState.activeTx.type === 'data' ? 'bg-[#7226FF] border-[#D8B4FE] text-white' : 'bg-[#00C8F0] border-white text-black'
                }`}>
                  {simState.activeTx.type === 'data' ? `Frame ${simState.activeTx.id} →` : `← ACK ${simState.activeTx.id}`}
                </div>
              )}
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">RECEIVER</h3>
              <div className="w-24 h-16 bg-[#160078] border border-[#00C8F0] rounded-lg flex flex-col items-center justify-center text-xs text-[#D8B4FE]">
                <span>Expected Frame</span>
                <span className="text-xl font-bold text-white">{simState.receiverBase}</span>
              </div>
            </div>
          </div>

          {/* FRAME TIMELINE */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {simState.frames.map((f, i) => {
              const inWindow = i >= simState.senderBase && i < simState.senderBase + windowSize;
              let bg = "bg-black/40 border-white/10 text-white/30";
              
              if (f.acked) bg = "bg-green-500 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]";
              else if (f.received) bg = "bg-[#00C8F0] border-[#00C8F0] text-black shadow-[0_0_15px_rgba(0,200,240,0.4)]";
              else if (inWindow) bg = "bg-[#7226FF] border-[#D8B4FE] text-white shadow-[0_0_15px_rgba(114,38,255,0.4)]";

              return (
                <div key={i} className="flex flex-col items-center gap-1 relative">
                  {inWindow && (
                    <div className="absolute -inset-1 border-2 border-dashed border-[#7226FF] rounded-xl animate-pulse pointer-events-none"></div>
                  )}
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold border-2 transition-all duration-300 ${bg} relative z-10`}>
                    {f.id}
                  </div>
                  <span className="text-[10px] font-bold text-white/50 uppercase">F{f.id}</span>
                </div>
              );
            })}
          </div>

          {/* CONTROLS & FIXED DROPDOWN */}
          <div className="flex items-center justify-center gap-4 mt-auto">
            <button onClick={initSimulation} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><RotateCcw className="w-5 h-5" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-full bg-[#7226FF] flex items-center justify-center text-white hover:opacity-80 transition-all shadow-[0_0_20px_rgba(114,38,255,0.5)]">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button onClick={stepSimulation} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><SkipForward className="w-5 h-5" /></button>
            
            {/* CUSTOM DROPDOWN */}
            <div className="relative">
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))} 
                className="appearance-none bg-[#160078] border border-[#7226FF]/50 rounded-xl pl-4 pr-10 py-3 text-white text-sm font-bold focus:outline-none focus:border-[#7226FF] cursor-pointer transition-colors hover:bg-[#7226FF]/20"
              >
                <option value={0.5} className="bg-[#160078] text-white">0.5x Speed</option>
                <option value={1} className="bg-[#160078] text-white">1x Speed</option>
                <option value={2} className="bg-[#160078] text-white">2x Speed</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#D8B4FE] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

      </div>

      {/* EXPLANATION PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LOGS */}
        <div className="glass p-6 rounded-3xl border border-[#00C8F0]/30 bg-gradient-to-br from-[#010030] to-[#160078] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-3">Live Execution Log</h3>
          <div className="bg-black/50 rounded-xl p-4 font-mono text-sm space-y-2 border border-white/10 flex-1">
            {simState.logs.map((log, i) => (
              <p key={i} className={log.color}>{log.text}</p>
            ))}
          </div>
        </div>

        {/* THEORY */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-3">How Sliding Window Works</h3>
          <div className="text-sm text-white/80 space-y-3 bg-black/20 p-4 rounded-xl border border-white/5 flex-1">
            <p>1. <strong>The Window:</strong> The sender is allowed to transmit multiple frames (e.g., Frames 0, 1, 2, 3) without waiting for an ACK.</p>
            <p>2. <strong>The ACKs:</strong> As the receiver gets these frames, it sends back ACKs (cyan).</p>
            <p>3. <strong>Sliding:</strong> When the sender gets an ACK for Frame 0, the left side of the window "slides" forward, allowing Frame 4 to be transmitted.</p>
            <p>4. <strong>Flow Control:</strong> This prevents the sender from overwhelming the receiver with too much data.</p>
          </div>
        </div>

      </div>

    </div>
  );
}