import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SmartHome3D from './pages/SmartHome3D';
import Devices from './pages/Devices';
import Framing from './pages/Framing';
import FlowControl from './pages/FlowControl';
import GoBackN from './pages/GoBackN';

import PacketAnalyzer from './pages/PacketAnalyzer';
import Encryption from './pages/Encryption';
import Scanner from './pages/Scanner';
import Security from './pages/Security';
import Analytics from './pages/Analytics';
import Placeholder from './pages/Placeholder';
import SecurityAlerts from './pages/SecurityAlerts';
// NEW IMPORTS
import PacketStream from './pages/PacketStream';
import ActiveConnections from './pages/ActiveConnections';
import NetworkTopology from './pages/NetworkTopology';
import Routing from './pages/Routing';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="smart-home" element={<SmartHome3D />} />
          <Route path="devices" element={<Devices />} />
          <Route path="topology" element={<Routing />} />
          <Route path="encryption" element={<Encryption />} />
          <Route path="framing" element={<Framing />} />
          <Route path="flow-control" element={<FlowControl />} />
          <Route path="go-back-n" element={<GoBackN />} />
          <Route path="routing" element={<Routing />} />
          <Route path="analyzer" element={<PacketAnalyzer />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="security" element={<Security />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="security-alerts" element={<SecurityAlerts />} />
          {/* NEW ROUTES */}
          <Route path="packet-stream" element={<PacketStream />} />
          <Route path="connections" element={<ActiveConnections />} />
          <Route path="/app/topology" element={<NetworkTopology />} />
<Route path="/app/routing" element={<Routing />} />
          <Route path="*" element={<Placeholder title="Coming Soon" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}