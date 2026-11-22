import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Home, Network, Shield, 
  FileCode2, ArrowRightLeft, RotateCcw, 
  Route, Search, ShieldAlert, BarChart3, 
  Cpu, Lock, X
} from 'lucide-react';

const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/smart-home', label: '3D Smart Home', icon: Home },
  { path: '/app/devices', label: 'Device Management', icon: Cpu },
  { path: '/app/topology', label: 'Network Topology', icon: Network },
  { path: '/app/encryption', label: 'Encryption', icon: Lock },
  { path: '/app/framing', label: 'Framing & CRC', icon: FileCode2 },
  { path: '/app/flow-control', label: 'Flow Control', icon: ArrowRightLeft },
  { path: '/app/go-back-n', label: 'Go-Back-N', icon: RotateCcw },
  { path: '/app/routing', label: 'Routing', icon: Route }, // If you removed this, keep it removed
  { path: '/app/analyzer', label: 'Packet Analyzer', icon: Search },
  { path: '/app/scanner', label: 'Network Scanner', icon: ShieldAlert },
  { path: '/app/security', label: 'Security Center', icon: Shield },
  { path: '/app/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate(); // <--- ADD THIS LINE

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col glass rounded-none border-y-0 border-l-0 border-r border-[#7226FF]/30 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${!isOpen && "-translate-x-full"}`}>
        
        {/* --- UPDATED LOGO SECTION --- */}
        <div 
          onClick={() => {
            navigate('/');
            setIsOpen(false);
          }}
          className="p-6 flex items-center justify-between border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(114,38,255,0.4)] group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">IoT Secure</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
            className="lg:hidden text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* --------------------------- */}

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-brand text-white shadow-md shadow-[#7226FF]/30' 
                  : 'text-[#D8B4FE] hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}