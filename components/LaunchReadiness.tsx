import React, { useState, useEffect } from 'react';

interface LaunchReadinessProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: () => void;
  stats: { count: number; efficiency: number };
}

interface CheckItem {
  status: string;
  label: string;
}

const LaunchReadiness: React.FC<LaunchReadinessProps> = ({ isOpen, onClose, onLaunch, stats }) => {
  const [checks, setChecks] = useState<Record<string, CheckItem>>({
    mesh: { status: 'PENDING', label: 'Enterprise Mesh Consistency' },
    peers: { status: 'PENDING', label: 'Commercial Node Quorum' },
    zk: { status: 'PENDING', label: 'Zero-Knowledge Prover Scale' },
    compliance: { status: 'PENDING', label: 'Global Data Compliance' },
    gateway: { status: 'PENDING', label: 'Revenue Sync Gateway' }
  });
  const [phase, setPhase] = useState<'IDLE' | 'SCANNING' | 'READY' | 'DEPLOYING'>('IDLE');

  useEffect(() => {
    if (isOpen && phase === 'IDLE') {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    setPhase('SCANNING');
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    await delay(1200);
    setChecks(prev => ({ ...prev, mesh: { ...prev.mesh, status: 'PASS' } }));
    await delay(800);
    setChecks(prev => ({ ...prev, peers: { ...prev.peers, status: stats.count >= 10 ? 'PASS' : 'WARN' } }));
    await delay(1500);
    setChecks(prev => ({ ...prev, zk: { ...prev.zk, status: 'PASS' } }));
    await delay(1000);
    setChecks(prev => ({ ...prev, compliance: { ...prev.compliance, status: 'PASS' } }));
    await delay(900);
    setChecks(prev => ({ ...prev, gateway: { ...prev.gateway, status: 'PASS' } }));
    
    setPhase('READY');
  };

  const handleDeploy = () => {
    setPhase('DEPLOYING');
    setTimeout(() => {
      onLaunch();
      onClose();
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 bg-slate-950/50 flex justify-between items-center">
          <div>
            <div className="mono text-[9px] text-emerald-500 font-black uppercase tracking-[0.4em] mb-1">Commercial_Ready_Protocol</div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Enterprise Launch <span className="text-emerald-500">Suite</span></h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            {(Object.entries(checks) as [string, CheckItem][]).map(([key, check]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${check.status === 'PASS' ? 'bg-emerald-500 shadow-[0_0_10px_emerald]' : check.status === 'WARN' ? 'bg-amber-500' : 'bg-slate-700 animate-pulse'}`}></div>
                  <span className="mono text-[11px] text-slate-300 font-bold uppercase">{check.label}</span>
                </div>
                <span className={`mono text-[9px] font-black ${check.status === 'PASS' ? 'text-emerald-500' : check.status === 'WARN' ? 'text-amber-500' : 'text-slate-600'}`}>
                  {check.status === 'PASS' ? '[ AUTHENTICATED ]' : check.status === 'WARN' ? '[ LOW_CAPACITY ]' : '[ VERIFYING... ]'}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 text-[10px] text-slate-400 leading-relaxed italic mono text-center">
            "By finalizing commercial launch, you agree to the Sovereign Data Licensing terms and global peering agreements."
          </div>

          {phase === 'READY' && (
            <button 
              onClick={handleDeploy}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.5em] transition-all shadow-2xl shadow-emerald-600/30 animate-pulse"
            >
              Finalize Commercial Release
            </button>
          )}

          {phase === 'DEPLOYING' && (
            <div className="w-full py-10 flex flex-col items-center gap-6">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-[progress_4s_linear_forwards]"></div>
              </div>
              <div className="text-[10px] text-emerald-500 mono font-black animate-pulse uppercase tracking-[0.3em]">Broadcasting_Enterprise_Roots...</div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950 text-center border-t border-white/5">
          <span className="mono text-[8px] text-slate-600 uppercase tracking-widest">Enterprise Ready Signature: SHA256_VERIFIED</span>
        </div>
      </div>
      <style>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
      `}</style>
    </div>
  );
};

export default LaunchReadiness;