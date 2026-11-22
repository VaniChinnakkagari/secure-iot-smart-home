import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Activity, Lock, Network, Server, Cpu } from 'lucide-react';
import SmartHomeScene from '../components/3d/SmartHomeScene';
import HeroGlobe from '../components/3d/HeroGlobe';

export default function Landing() {
  const navigate = useNavigate();

  // Helper function for smooth scrolling
  const scrollToPreview = (e) => {
    e.preventDefault();
    const el = document.getElementById('smart-home-preview');
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#010030] min-h-screen font-sans selection:bg-[#7226FF] selection:text-white overflow-x-hidden">
      
      {/* 1. FLOATING NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 glass rounded-full px-8 py-4 flex justify-between items-center shadow-lg">
        <button 
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center shadow-lg shadow-[#7226FF]/30">
            <Network className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">IoT SECURE</span>
        </button>
        
        {/* Navbar Links */}
        <div className="hidden lg:flex gap-8 text-lg font-semibold">
          <button 
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className="text-white hover:text-[#FF42FF] transition-colors tracking-wide"
          >
            Home
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('smart-home-preview');
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }} 
            className="text-white hover:text-[#FF42FF] transition-colors tracking-wide"
          >
            3D Smart Home
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('features');
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }} 
            className="text-white hover:text-[#FF42FF] transition-colors tracking-wide"
          >
            Network
          </button>

          {/* NEW: How It Works Link */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('how-it-works');
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }} 
            className="text-white hover:text-[#FF42FF] transition-colors tracking-wide"
          >
            How It Works
          </button>
        </div>

        <button 
          onClick={() => navigate('/app/dashboard')}
          className="px-8 py-3 bg-gradient-brand hover:opacity-90 text-white text-lg rounded-full font-bold transition-all shadow-md shadow-[#7226FF]/30"
        >
          Launch Simulator
        </button>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen w-full flex items-center pt-32 pb-12 overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-6 w-full relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 border border-[#7226FF]/50 backdrop-blur-md mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">Next-Generation Connectivity</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 text-white leading-[1.1]">
              SECURE IoT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-[#D8B4FE] to-[#7226FF]">
                SMART HOME
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white max-w-lg mb-10 font-normal leading-relaxed drop-shadow-md">
              Intelligence Beyond Boundaries. Discover a connected world where smart devices communicate through secure networks and advanced cybersecurity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              
              {/* Hero Scroll Button */}
              <button 
                onClick={scrollToPreview}
                className="px-8 py-4 bg-black/20 border border-[#7226FF] text-white rounded-full font-bold shadow-lg hover:bg-[#7226FF]/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Explore the Digital World
              </button>
              
              {/* Hero Navigate Button */}
              <button 
                onClick={() => navigate('/app/smart-home')}
                className="px-8 py-4 bg-gradient-brand text-white rounded-full font-bold shadow-lg shadow-[#7226FF]/40 hover:opacity-90 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Enter Smart Home <ArrowRight className="w-5 h-5" />
              </button>

            </div>
          </div>

          <div className="h-[500px] lg:h-[700px] w-full relative">
            <HeroGlobe />
          </div>

        </div>
      </section>

      {/* 3. HOLOGRAPHIC SMART HOME PREVIEW (Scroll Target) */}
      <section id="smart-home-preview" className="py-24 relative z-20 bg-[#010030]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Holographic Architecture</h2>
            <p className="text-[#D8B4FE] max-w-2xl mx-auto text-lg">
              Interact with our real-time 3D environment. Rotate, zoom, and inspect live IoT data transmission across the house.
            </p>
          </div>
          
          <div className="rounded-3xl overflow-hidden border border-[#7226FF]/40 shadow-[0_0_50px_rgba(114,38,255,0.2)] bg-[#010030]">
            <SmartHomeScene />
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-24 relative bg-[#010030]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Network Capabilities</h2>
            <p className="text-[#D8B4FE] max-w-2xl mx-auto text-lg">
              A comprehensive suite of networking and cybersecurity tools built into a single platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "AES-256 Encryption", desc: "Military-grade encryption for all IoT data.", icon: Lock },
              { title: "Data Framing", desc: "Robust byte-stuffing and delimiter handling.", icon: Cpu },
              { title: "CRC Error Detection", desc: "Real-time packet corruption detection.", icon: Activity },
              { title: "Sliding Window", desc: "Optimized flow control for reliable delivery.", icon: ArrowRight },
              { title: "Go-Back-N ARQ", desc: "Automatic repeat request for lost packets.", icon: Network },
              { title: "Dijkstra Routing", desc: "Intelligent shortest-path network routing.", icon: Server },
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl glass hover:border-[#7226FF]/80 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-[#D8B4FE] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION (NEW) */}
      <section id="how-it-works" className="py-24 relative z-20 bg-[#010030] overflow-hidden border-t border-white/5">
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7226FF]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">How It Works</h2>
            <p className="text-[#D8B4FE] max-w-2xl mx-auto text-lg">
              Experience the complete lifecycle of a secure IoT network transmission, from the physical device to the cloud.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop Only) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#7226FF]/50 to-transparent -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {[
                { 
                  step: "01", 
                  title: "Capture & Convert", 
                  desc: "IoT devices capture data (like temperature or camera feeds) and convert it into raw binary.",
                  color: "border-[#00C8F0] text-[#00C8F0] shadow-[0_0_20px_rgba(0,200,240,0.2)]"
                },
                { 
                  step: "02", 
                  title: "Frame & Encrypt", 
                  desc: "The Data Link Layer wraps the binary into frames, applies Byte Stuffing, and encrypts it using AES-256.",
                  color: "border-[#f59e0b] text-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                },
                { 
                  step: "03", 
                  title: "Transmit & Verify", 
                  desc: "Frames are transmitted across the network. Flow Control (Sliding Window) ensures no packets are lost, and CRC checks for corruption.",
                  color: "border-[#7226FF] text-[#7226FF] shadow-[0_0_20px_rgba(114,38,255,0.2)]"
                },
                { 
                  step: "04", 
                  title: "Monitor & Secure", 
                  desc: "The central server receives the data. Our Security Center logs the event, calculates the network score, and alerts on any threats.",
                  color: "border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  {/* Step Number Circle */}
                  <div className={`w-16 h-16 mx-auto rounded-full bg-[#010030] border-2 flex items-center justify-center text-xl font-black mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110 ${item.color}`}>
                    {item.step}
                  </div>
                  
                  {/* Card */}
                  <div className="glass p-6 rounded-2xl border border-white/10 text-center hover:bg-white/5 transition-colors h-full">
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-sm text-[#D8B4FE] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-12 border-t border-white/10 text-center bg-[#010030]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <Shield className="w-10 h-10 text-[#7226FF] mb-4" />
          <h2 className="text-2xl font-bold mb-6 text-white">Ready to secure your network?</h2>
          <button onClick={() => navigate('/app/dashboard')} className="px-10 py-4 bg-gradient-brand text-white rounded-full font-bold text-lg shadow-lg shadow-[#7226FF]/30 hover:opacity-90 transition-all">
            Enter the Simulator
          </button>
          <p className="text-[#D8B4FE]/50 text-sm mt-12">© 2026 Secure IoT Smart Home Network. Third Year Project.</p>
        </div>
      </footer>

    </div>
  );
}