import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import ChatInterface from './components/ChatInterface';
import HardhatTerminal from './components/HardhatTerminal';
import Manifesto from './components/Manifesto';
import SpatialScanner from './components/SpatialScanner';
import MeshMainnetHUD from './components/MeshBetaHUD';
import InvitePortal from './components/InvitePortal';
import LaunchReadiness from './components/LaunchReadiness';
import VoxelViewport from './components/VoxelViewport';
import CommercialPortal from './components/CommercialPortal';
import HelpSystem from './components/HelpSystem';
import Web3Portal from './components/Web3Portal';
import OnboardingFlow from './components/OnboardingFlow';
import GuardianAgent from './components/GuardianAgent';
import LiveVoiceInterface from './components/LiveVoiceInterface';
import NetworkOnboarding from './components/NetworkOnboarding';
import NetworkGraph from './components/NetworkGraph';
import { MeshNode, Voxel, SentinelRule, MapLayer, WalletState, WorkloadConfig, UserRole, ViewMode } from './types';

const DEFAULT_RULES: SentinelRule[] = [
  { id: 'rule-1', name: 'Latency_Watch', trigger: 'Efficiency < 85%', action: 'Re-route via Tier-2', active: true },
  { id: 'rule-2', name: 'Asset_Fence', trigger: 'Logistics drift > 5km', action: 'Signal Sentinel_01', active: false }
];

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('MAP');
  const [activeLayers] = useState<MapLayer[]>(['MESH', 'ASSETS']);
  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([]);
  const [voxelStore, setVoxelStore] = useState<Voxel[]>([]);
  const [simulationOffset] = useState(0);
  const [sentinelRules, setSentinelRules] = useState<SentinelRule[]>(DEFAULT_RULES);
  
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLaunchOpen, setIsLaunchOpen] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isCommercialPortalOpen, setIsCommercialPortalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWeb3PortalOpen, setIsWeb3PortalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isGuardianOpen, setIsGuardianOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isNetworkJoinOpen, setIsNetworkJoinOpen] = useState(false);

  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
    staked: 0,
    earnings: 0,
    rank: 1,
    contributionPoints: 0
  });

  const [workload, setWorkload] = useState<WorkloadConfig>({
    active: false,
    intensity: 25,
    type: 'SPATIAL'
  });

  const networkStats = useMemo(() => {
    const verifiedNodes = meshNodes.filter(n => n.isVerified);
    const baseNodeCount = verifiedNodes.length;
    const effectiveCount = baseNodeCount + (workload.active ? (workload.intensity / 20) : 0);
    const totalTflops = (effectiveCount * 5.8 + (Math.random() * 5));
    const powerSaved = Math.min(effectiveCount * 14.2, 92);
    const totalVoxels = voxelStore.length;
    return { count: Math.round(effectiveCount), tflops: totalTflops, efficiency: powerSaved, totalVoxels };
  }, [meshNodes, workload, voxelStore]);

  const handleConnectWallet = () => {
    setWallet(prev => ({
      ...prev,
      connected: true,
      address: `0x${Math.random().toString(16).substring(2, 10)}...`,
      balance: 1000,
      staked: 5,
    }));
  };

  const handleOnboardingComplete = (role: UserRole, manifesto: string) => {
    setWallet(prev => ({
      ...prev,
      role,
      manifesto,
      rank: 2,
      connected: true,
      address: prev.address || `0x${Math.random().toString(16).substring(2, 10)}...`
    }));
    setWorkload(prev => ({ ...prev, active: true }));
    setIsOnboardingOpen(false);
    setIsLaunched(true);
  };

  const handleNetworkJoin = (config: WorkloadConfig) => {
    setWorkload(config);
    setWallet(prev => ({ 
      ...prev, 
      contributionPoints: (prev.contributionPoints || 0) + 100,
      connected: true,
      role: prev.role || 'CONTRIBUTOR'
    }));
    
    const userNode: MeshNode = {
      id: `contributor-${Date.now()}`,
      lat: (Math.random() - 0.5) * 60,
      lng: (Math.random() - 0.5) * 120,
      strength: 2.0,
      timestamp: Date.now(),
      classification: 'Edge',
      isVerified: true
    };
    setMeshNodes(prev => [userNode, ...prev]);
  };

  const handleScanComplete = useCallback((claim: { voxelBatch: Voxel[] }) => {
    setVoxelStore(prev => [...prev, ...claim.voxelBatch].slice(-5000));
    setWallet(prev => ({ ...prev, earnings: prev.earnings + (claim.voxelBatch.length * 0.0001) }));
    setViewMode('VOXEL');
  }, []);

  const handleNodeInteraction = (nodeId: string) => {
    setMeshNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, strength: Math.min(2.0, node.strength + 0.3), timestamp: Date.now() } 
        : node
    ));
  };

  useEffect(() => {
    const initNodes = (lat: number, lng: number) => {
      const seedNodes: MeshNode[] = Array.from({ length: 32 }).map((_, i) => ({
        id: `node-${i}`,
        lat: lat + (Math.random() - 0.5) * 50,
        lng: lng + (Math.random() - 0.5) * 70,
        strength: 0.85 + Math.random() * 0.15,
        timestamp: Date.now(),
        classification: Math.random() > 0.8 ? 'Hub' : 'Infrastructure',
        isVerified: true
      }));
      setMeshNodes(seedNodes);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => initNodes(pos.coords.latitude, pos.coords.longitude),
        () => initNodes(0, 0)
      );
    } else {
      initNodes(0, 0);
    }
  }, []);

  const renderViewport = () => {
    switch(viewMode) {
      case 'MAP':
        return (
          <WorldMap 
            onCountrySelect={setSelectedCountry} 
            selectedId={selectedCountry?.id} 
            meshNodes={meshNodes} 
            simulationOffset={simulationOffset} 
            activeLayers={activeLayers} 
            onNodeClick={handleNodeInteraction}
          />
        );
      case 'VOXEL':
        return <VoxelViewport voxels={voxelStore} isMainnet={isLaunched} />;
      case 'NETWORK_GRAPH':
        return <NetworkGraph nodes={meshNodes} onNodeClick={handleNodeInteraction} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-[#020617] text-slate-50 relative overflow-hidden font-sans">
      <nav className="w-full md:w-20 lg:w-24 shrink-0 border-r border-white/5 bg-slate-950/40 backdrop-blur-3xl flex md:flex-col items-center py-8 gap-10 z-50 order-2 md:order-1 bottom-0 md:relative fixed h-16 md:h-full">
        <div className="hidden md:flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl border border-blue-400/50 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.4)]" onClick={() => setIsManifestoOpen(true)}>
          <span className="font-black text-xl text-white">Σ</span>
        </div>
        
        <div className="flex md:flex-col gap-6 flex-1 justify-around md:justify-start">
          {[
            { id: 'MAP', icon: 'M', active: viewMode === 'MAP', onClick: () => setViewMode('MAP'), label: 'Atlas' },
            { id: 'SCAN', icon: 'S', active: isScannerOpen, onClick: () => setIsScannerOpen(true), label: 'Scan' },
            { id: 'VOXEL', icon: 'V', active: viewMode === 'VOXEL', onClick: () => setViewMode('VOXEL'), label: 'Voxel' },
            { id: 'NETWORK', icon: 'N', active: viewMode === 'NETWORK_GRAPH', onClick: () => setViewMode('NETWORK_GRAPH'), label: 'Mesh' },
            { id: 'GUARD', icon: 'G', active: isGuardianOpen, onClick: () => setIsGuardianOpen(true), label: 'Guard' },
            { id: 'VOICE', icon: 'A', active: isVoiceOpen, onClick: () => setIsVoiceOpen(true), label: 'Live' },
          ].map(item => (
            <button key={item.id} onClick={item.onClick} title={item.label} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${item.active ? 'bg-blue-600/30 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-200'}`}>
              <span className="font-black text-xs mono">{item.icon}</span>
            </button>
          ))}
        </div>

        <div className="flex md:flex-col gap-6 pb-6">
          <button onClick={() => setIsWeb3PortalOpen(true)} className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-900 border border-white/5 text-slate-600 hover:text-emerald-500 transition-colors"><span className="text-xs font-black mono">W</span></button>
          <button onClick={() => setIsHelpOpen(true)} className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-900 border border-white/5 text-slate-600 hover:text-blue-400 transition-colors"><span className="text-xs font-black mono">?</span></button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 order-1 md:order-2 pb-16 md:pb-0">
        <header className="h-16 border-b border-white/5 bg-slate-950/30 backdrop-blur-2xl flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center gap-8">
            <h1 className="font-black tracking-tighter text-xl uppercase flex items-center gap-3">
              Sovereign <span className={isPublished ? 'text-amber-500' : 'text-blue-500'}>Map</span>
            </h1>
            {!workload.active ? (
              <button onClick={() => setIsNetworkJoinOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[10px] mono font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(37,99,235,0.3)] animate-pulse">Join_Backbone</button>
            ) : (
              <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-4 py-2 rounded-xl">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-[10px] mono font-black text-slate-300 uppercase tracking-widest">{wallet.role || 'Contributor'} Node_Active</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[9px] mono text-slate-500 uppercase font-black">Spatial_Yield</span>
                <span className="text-[11px] mono text-emerald-400 font-black">{wallet.earnings.toFixed(4)} SOV</span>
             </div>
             <button onClick={() => setIsScannerOpen(true)} className="bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 px-4 py-2 rounded-xl text-[10px] mono font-black uppercase tracking-widest hover:bg-emerald-600/40 transition-all">Start_Mapping</button>
          </div>
        </header>

        <div className="flex-1 relative flex overflow-hidden">
          <main className="flex-1 relative bg-black/20">
            <Suspense fallback={<div className="flex items-center justify-center h-full mono text-xs text-blue-500 animate-pulse uppercase">Syncing_Spatial_Buffer...</div>}>
              {renderViewport()}
            </Suspense>
            <MeshMainnetHUD stats={networkStats} isMainnet={isLaunched} />
          </main>

          <CountryPanel country={selectedCountry} onClose={() => setSelectedCountry(null)} />
          <ChatInterface />
        </div>
      </div>

      <NetworkOnboarding isOpen={isNetworkJoinOpen} onClose={() => setIsNetworkJoinOpen(false)} onJoin={handleNetworkJoin} />
      <LiveVoiceInterface isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
      <GuardianAgent isOpen={isGuardianOpen} onClose={() => setIsGuardianOpen(false)} />
      <OnboardingFlow isOpen={isOnboardingOpen} onComplete={handleOnboardingComplete} onClose={() => setIsOnboardingOpen(false)} />
      <HardhatTerminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} meshNodes={meshNodes} />
      <Manifesto isOpen={isManifestoOpen} onClose={() => setIsManifestoOpen(false)} />
      <InvitePortal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} onInvite={() => {}} />
      <LaunchReadiness isOpen={isLaunchOpen} onClose={() => setIsLaunchOpen(false)} onLaunch={() => setIsLaunched(true)} stats={networkStats} />
      <SpatialScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanComplete={handleScanComplete} />
      <CommercialPortal isOpen={isCommercialPortalOpen} onClose={() => setIsCommercialPortalOpen(false)} stats={networkStats} onPublish={() => setIsPublished(true)} isPublished={isPublished} initialRules={sentinelRules} onRulesChange={setSentinelRules} />
      <HelpSystem isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <Web3Portal isOpen={isWeb3PortalOpen} onClose={() => setIsWeb3PortalOpen(false)} wallet={wallet} onConnect={handleConnectWallet} workload={workload} onWorkloadChange={(config) => setWorkload(prev => ({ ...prev, ...config }))} />
    </div>
  );
};

export default App;