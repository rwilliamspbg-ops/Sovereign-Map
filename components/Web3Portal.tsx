import React, { useState } from 'react';
import { WalletState, WorkloadConfig } from '../types';

interface Web3PortalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onConnect: () => void;
  workload: WorkloadConfig;
  onWorkloadChange: (config: Partial<WorkloadConfig>) => void;
}

const Web3Portal: React.FC<Web3PortalProps> = ({ isOpen, onClose, wallet, onConnect, workload, onWorkloadChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
          <div>
            <div className="mono text-[9px] text-emerald-500 font-black uppercase tracking-[0.4em] mb-1">Spatial_Identity_Provider</div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sovereign <span className="text-emerald-500">Identity</span></h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {!wallet.connected ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeWidth={2}/></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-black text-lg uppercase">Connect Provider</h3>
                <p className="text-slate-400 text-xs mono">Link your Web3 identity to verify node ownership and earn rewards.</p>
              </div>
              <button onClick={onConnect} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95">
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Identity Header */}
              <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 flex gap-6 items-center">
                 <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-3xl font-black text-blue-500">
                   {wallet.role?.charAt(0) || 'P'}
                 </div>
                 <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-blue-400 mono font-black uppercase tracking-widest">{wallet.role || 'PEER'}</span>
                       <span className="text-[9px] text-slate-500 mono">Rank: {wallet.rank}</span>
                    </div>
                    <div className="text-lg font-black text-white truncate">{wallet.address}</div>
                    <p className="text-[8px] text-slate-400 italic font-medium leading-relaxed">"{wallet.manifesto || 'Securing the spatial layer.'}"</p>
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-white/5">
                  <div className="text-[7px] text-slate-500 mono font-black uppercase mb-1">Total_Yield</div>
                  <div className="text-[14px] text-white font-black">{wallet.earnings.toFixed(4)} <span className="text-[8px] text-emerald-500">SOV</span></div>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-white/5">
                  <div className="text-[7px] text-slate-500 mono font-black uppercase mb-1">Staked_Capacity</div>
                  <div className="text-[14px] text-white font-black">{wallet.staked} <span className="text-[8px] text-blue-500">NODES</span></div>
                </div>
              </div>

              {/* Workload Configuration */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="mono text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Operational_Contribution</h3>
                  <div className={`px-2 py-1 rounded text-[8px] mono font-bold ${workload.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-white/5'}`}>
                    {workload.active ? 'NETWORK_SYNC' : 'LOCAL_ONLY'}
                  </div>
                </div>

                <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-black text-xs uppercase mb-1">Broadcasting Mapping</div>
                      <div className="text-[9px] text-slate-500 mono">Allow the mesh to utilize your device's NPU for feature extraction.</div>
                    </div>
                    <button 
                      onClick={() => onWorkloadChange({ active: !workload.active })}
                      className={`w-12 h-6 rounded-full transition-all relative ${workload.active ? 'bg-emerald-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${workload.active ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>

                  {workload.active && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] mono font-bold text-slate-500 uppercase">
                          <span>Grid Intensity</span>
                          <span className="text-emerald-400">{workload.intensity}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={workload.intensity}
                          onChange={(e) => onWorkloadChange({ intensity: parseInt(e.target.value) })}
                          className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-950 border-t border-white/5 text-center">
          <p className="text-[8px] mono text-slate-600 uppercase tracking-widest mb-4">Secured by Polygon AggLayer • Identity V2.1</p>
        </div>
      </div>
    </div>
  );
};

export default Web3Portal;