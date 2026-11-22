import { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  Activity, AlertTriangle, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function GoBackN() {
  const [windowSize, setWindowSize] = useState(4);
  const [totalFrames, setTotalFrames] = useState(8);
  const [dropSeq, setDropSeq] = useState(2); // Frame to drop
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [simState, setSimState] = useState(null);

  // Initialize Simulation State
  const initSimulation = () => {
    setSimState({
      senderBase: 0,
      nextSeqNum: 0,
      expectedSeqNum: 0, // Receiver expects this frame
      frames: Array.from({ length: totalFrames }).map((_, i) => ({
        id: i, status: 'pending', sentCount: 0
      })),
      logs: [{ text: `Simulation ready. Window: ${windowSize}, Drop Frame: ${dropSeq}`, color: "text-[#D8B4FE]" }],
      activeTx: null, 
      timeoutActive: false,
    });
    setIsPlaying(false);
  };

  useEffect(() => { initSimulation(); }, [windowSize, totalFrames, dropSeq]);

  // --- THE GBN LOGIC ENGINE ---
  const stepSimulation = () => {
    setSimState(prev => {
      if (!prev) return prev;
      let s = JSON.parse(JSON.stringify(prev)); 
      let logMsg = null;

      // 1. PROCESS ACTIVE TRANSMISSION
      if (s.activeTx) {
        if (s.activeTx.type === 'data') {
          const frameId = s.activeTx.id;
          
          // Did it arrive successfully?
          if (frameId === dropSeq && s.frames[frameId].sentCount === 1) {
            logMsg = { text: `Frame ${frameId} was LOST in transit!`, color: "text-red-400" };
            s.frames[frameId].status = 'lost';
            s.activeTx = null; // Packet vanishes
            return { ...s, logs: [...s.logs, logMsg] };
          } 
          
          // If receiver expects this frame, accept it
          if (frameId === s.expectedSeqNum) {
            s.frames[frameId].status = 'received';
            s.expectedSeqNum++;
            s.activeTx = { id: frameId, type: 'ack' };
            logMsg = { text: `Receiver got Frame ${frameId}. Sent ACK ${frameId}.`, color: "text-[#00C8F0]" };
          } 
          // If it's out of order, GBN discards it
          else if (frameId > s.expectedSeqNum) {
            s.frames[frameId].status = 'discarded';
            logMsg = { text: `Receiver discarded out-of-order Frame ${frameId}. Expected ${s.expectedSeqNum}.`, color: "text-orange-400" };
            s.activeTx = null;
          }
          return { ...s, logs: [...s.logs, logMsg] };
        } 
        
        // PROCESS ACK ARRIVAL
        else if (s.activeTx.type === 'ack') {
          const ackId = s.activeTx.id;
          s.frames[ackId].status = 'acked';
          
          // Cumulative ACK: slide window base
          if (ackId >= s.senderBase) {
            s.senderBase = ackId + 1;
            logMsg = { text: `Sender received ACK ${ackId}. Window slides.`, color: "text-green-400" };
          }
          s.activeTx = null;
          return { ...s, logs: [...s.logs, logMsg] };
        }
      }

      // 2. TRANSMIT NEW FRAMES
      if (s.nextSeqNum < s.senderBase + windowSize && s.nextSeqNum < totalFrames) {
        const nextId = s.nextSeqNum;
        s.frames[nextId].status = 'transmitting';
        s.frames[nextId].sentCount++;
        s.activeTx = { id: nextId, type: 'data' };
        s.nextSeqNum++;
        logMsg = { text: `Sender transmitting Frame ${nextId}...`, color: "text-[#7226FF]" };
        return { ...s, logs: [...s.logs, logMsg] };
      }

      // 3. TIMEOUT LOGIC
      if (s.senderBase < totalFrames) {
        // If the frame at senderBase is stuck (lost or not acked)
        if (s.frames[s.senderBase].status === 'lost' || !s.frames[s.senderBase].status === 'acked') {
           logMsg = { text: `Timeout! Sender resending window from Frame ${s.senderBase}...`, color: "text-red-400 font-bold" };
           s.nextSeqNum = s.senderBase; // Reset sequence num
           // Reset status of all frames in window
           for (let i = s.senderBase; i < s.senderBase + windowSize && i < totalFrames; i++) {
             s.frames[i].status = 'pending';
           }
           return { ...s, logs: [...s.logs, logMsg] };
        }
      }

      if (s.senderBase >= totalFrames) {
        if (s.logs[s.logs.length - 1].text !== "Transmission Complete!") {
          logMsg = { text: `Transmission Complete!`, color: "text-green-400 font-bold" };
          setIsPlaying(false);
          return { ...s, logs: [...s.logs, logMsg] };
        }
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
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in h-full">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 text-[#7226FF]" /> Go-Back-N ARQ
        </h1>
        <p className="text-[#D8B4FE] text-lg max-w-3xl">
          Simulate cumulative acknowledgments and sliding window retransmissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        
        {/* LEFT: CONFIG */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col gap-5 lg:col-span-1">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Parameters</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#D8B4FE] uppercase mb-1 block">Window Size</label>
              <input type="number" min="2" max="6" value={windowSize} onChange={(e) => setWindowSize(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#D8B4FE] uppercase mb-1 block">Total Frames</label>
              <input type="number" min="5" max="15" value={totalFrames} onChange={(e) => setTotalFrames(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-red-400 uppercase mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Drop Frame Sequence
            </label>
            <input type="number" min="0" max={totalFrames-1} value={dropSeq} onChange={(e) => setDropSeq(Number(e.target.value))} className="w-full bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-200" />
            <p className="text-[10px] text-white/50 mt-1">Force this frame to be lost on first transmission.</p>
          </div>

          <button onClick={initSimulation} className="mt-auto w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        {/* RIGHT: VISUALIZER */}
        <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col lg:col-span-3 relative overflow-hidden bg-[#010030]">
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-8 text-xs font-bold">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#7226FF]"/> In Window</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#00C8F0]"/> ACKed/Recv</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500"/> Lost</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-500"/> Discarded</div>
          </div>

          {/* SENDER/RECEIVER STATE */}
          <div className="flex justify-between items-center mb-8 px-8">
            <div className="text-center bg-black/40 p-4 rounded-xl border border-white/10 w-32">
              <p className="text-xs text-[#D8B4FE] uppercase font-bold mb-1">Sender Base</p>
              <p className="text-3xl font-black text-white">{simState.senderBase}</p>
            </div>

            {/* Flying Packet Visualizer */}
            <div className="flex-1 px-8 relative h-12 flex items-center">
              <div className="w-full h-0.5 bg-white/10 absolute"></div>
              {simState.activeTx && (
                <div className={`absolute left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg font-bold text-sm border-2 shadow-xl transition-all duration-500 ${
                  simState.activeTx.type === 'data' 
                    ? (simState.activeTx.id === dropSeq && simState.frames[simState.activeTx.id].sentCount === 1 ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-[#7226FF] border-[#D8B4FE] text-white')
                    : 'bg-[#00C8F0] border-white text-black'
                }`}>
                  {simState.activeTx.type === 'data' ? `Frame ${simState.activeTx.id} →` : `← ACK ${simState.activeTx.id}`}
                </div>
              )}
            </div>

            <div className="text-center bg-black/40 p-4 rounded-xl border border-white/10 w-32">
              <p className="text-xs text-[#D8B4FE] uppercase font-bold mb-1">Expected Seq</p>
              <p className="text-3xl font-black text-white">{simState.expectedSeqNum}</p>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {simState.frames.map((f, i) => {
              const inWindow = i >= simState.senderBase && i < simState.senderBase + windowSize;
              let bg = "bg-black/40 border-white/10 text-white/30";
              let text = "Pending";

              if (f.status === 'acked') { bg = "bg-[#00C8F0] border-[#00C8F0] text-black"; text = "ACKed"; }
              else if (f.status === 'received') { bg = "bg-green-500 border-green-400 text-white"; text = "Received"; }
              else if (f.status === 'lost') { bg = "bg-red-500 border-red-400 text-white"; text = "Lost"; }
              else if (f.status === 'discarded') { bg = "bg-orange-500 border-orange-400 text-white"; text = "Discarded"; }
              else if (inWindow) { bg = "bg-[#7226FF] border-[#D8B4FE] text-white"; text = "In Window"; }

              return (
                <div key={i} className="flex flex-col items-center gap-2 relative">
                  {inWindow && (
                    <div className="absolute -inset-2 border-2 border-dashed border-[#7226FF] rounded-2xl pointer-events-none animate-pulse"></div>
                  )}
                  <div className={`w-16 h-16 flex flex-col items-center justify-center rounded-xl font-bold border-2 transition-all duration-300 ${bg} relative z-10`}>
                    <span className="text-xl">{f.id}</span>
                    {f.sentCount > 1 && <span className="text-[9px] bg-black/50 px-1 rounded mt-1">Retx</span>}
                  </div>
                  <span className="text-[10px] font-bold text-white/50 uppercase">{text}</span>
                </div>
              );
            })}
          </div>

          {/* CONTROLS */}
          <div className="flex items-center justify-center gap-4 mt-auto">
            <button onClick={initSimulation} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><RotateCcw className="w-5 h-5" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-full bg-[#7226FF] flex items-center justify-center text-white hover:opacity-80 transition-all shadow-[0_0_20px_rgba(114,38,255,0.5)]">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button onClick={stepSimulation} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><SkipForward className="w-5 h-5" /></button>
          </div>

        </div>

      </div>

      {/* EXPLANATION PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-3xl border border-[#00C8F0]/30 bg-gradient-to-br from-[#010030] to-[#160078] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-3">Live Execution Log</h3>
          <div className="bg-black/50 rounded-xl p-4 font-mono text-sm space-y-2 border border-white/10 flex-1 h-48 overflow-y-auto">
            {simState.logs.map((log, i) => (
              <p key={i} className={log.color}>{log.text}</p>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-3">Go-Back-N Mechanism</h3>
          <div className="text-sm text-white/80 space-y-3 bg-black/20 p-4 rounded-xl border border-white/5 flex-1 h-48 overflow-y-auto">
            <p>1. <strong>Cumulative ACKs:</strong> If the receiver gets Frame 3, it implicitly acknowledges Frames 0, 1, 2, and 3.</p>
            <p>2. <strong>Discarding:</strong> If Frame 2 is lost, the receiver will discard Frames 3 and 4 even if they arrive perfectly, because it strictly expects Frame 2 next.</p>
            <p>3. <strong>Timeout & Go-Back:</strong> When the sender times out waiting for ACK 2, it goes back and resends Frame 2, Frame 3, and Frame 4.</p>
          </div>
        </div>
      </div>

    </div>
  );
}