
import React, { useState } from 'react';
import { SentinelRule } from '../types';

interface CommercialPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  isPublished: boolean;
  stats: { count: number; tflops: number; efficiency: number };
  initialRules?: SentinelRule[];
  onRulesChange?: (rules: SentinelRule[]) => void;
}

const TRIGGER_TYPES = ['Efficiency < 85%', 'Latency > 200ms', 'Drift > 5km', 'Mesh Loss > 10%'];
const ACTION_TYPES = ['Reroute via Tier-2', 'Trigger ZK-Audit', 'Notify Admin', 'Signal Sentinel_01', 'Scale Compute'];

const CommercialPortal: React.FC<CommercialPortalProps> = ({ isOpen, onClose, onPublish, isPublished, stats, initialRules = [], onRulesChange }) => {
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'STATS' | 'SENTINEL'>('STATS');
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', trigger: TRIGGER_TYPES[0], action: ACTION_TYPES[0] });

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => { onPublish(); setPublishing(false); }, 2500);
  };

  const toggleRule = (id: string) => {
    const updated = initialRules.map(r => r.id === id ? { ...r, active: !r.active } : r);
    onRulesChange?.(updated);
  };

  const addRule = () => {
    if (!newRule.name.trim()) return;
    const rule: SentinelRule = { id: `rule-${Date.now()}`, ...newRule, active: true };
    onRulesChange?.([...initialRules, rule]);
    setShowAdd(false);
    setNewRule({ name: '', trigger: TRIGGER_TYPES[0], action: ACTION_TYPES[0] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-5xl h-[650px] bg-slate-900 border border-amber-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
          <div>
            <div className="mono text-[9px] text-amber-500 font-black uppercase tracking-[0.4em] mb-1">Commercial_Management_Interface</div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Enterprise <span className="text-amber-500">Portal</span></h2>
          </div>
          <div className="flex gap-4 items-center">
             <div className="bg-slate-900 p-1 rounded-xl flex border border-white/5">
                <button onClick={() => setActiveTab('STATS')} className={`px-4 py-1.5 rounded-lg text-[9px] mono font-black uppercase transition-all ${activeTab === 'STATS' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}>Network</button>
                <button onClick={() => setActiveTab('SENTINEL')} className={`px-4 py-1.5 rounded-lg text-[9px] mono font-black uppercase transition-all ${activeTab === 'SENTINEL' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}>Sentinel_Rules</button>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
             </button>
          </div>
        </div>

        <div className="flex-1 p-10 flex gap-10 overflow-y-auto custom-scrollbar">
          {activeTab === 'STATS' ? (
            <>
              <div className="flex-1 space-y-8">
                <section className="space-y-4">
                  <h3 className="mono text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    Network_Performance
                    <div className="text-[8px] mono text-slate-600 normal-case font-normal">(Real-time cluster telemetry)</div>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 group relative">
                      <div className="text-[8px] text-slate-500 uppercase font-black mono mb-2">Total_Compute</div>
                      <div className="text-3xl font-black text-white">{stats.tflops.toFixed(2)} <span className="text-[10px] text-amber-400">PFLOPS</span></div>
                      <div className="absolute top-4 right-4 text-[7px] text-slate-600 mono opacity-0 group-hover:opacity-100 transition-opacity">Combined mesh power</div>
                    </div>
                    <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 group relative">
                      <div className="text-[8px] text-slate-500 uppercase font-black mono mb-2">Managed_Nodes</div>
                      <div className="text-3xl font-black text-white">{stats.count}</div>
                      <div className="absolute top-4 right-4 text-[7px] text-slate-600 mono opacity-0 group-hover:opacity-100 transition-opacity">Active peer connections</div>
                    </div>
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="mono text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Compliance_Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group relative cursor-help">
                      <span className="mono text-[10px] text-emerald-400 font-bold">GDPR_SPATIAL_SYNC</span>
                      <span className="mono text-[10px] text-emerald-400 font-black">VALID</span>
                      <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none mono">
                        ZK-Proofs verify location without exposing raw PII. Compliant with EU data laws.
                      </div>
                    </div>
                    <div className="flex justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group relative cursor-help">
                      <span className="mono text-[10px] text-emerald-400 font-bold">ISO_27001_ANCHOR</span>
                      <span className="mono text-[10px] text-emerald-400 font-black">VALID</span>
                      <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none mono">
                        Enterprise-grade encryption for all voxel telemetry.
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="w-72 space-y-6">
                <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/20 space-y-4 text-center">
                  <div className="text-[9px] text-amber-400 font-black mono uppercase tracking-widest">Revenue_Estimation</div>
                  <div className="text-3xl font-black text-white">$14,280.00</div>
                  <div className="text-[8px] text-slate-500 mono leading-tight">Projected monthly yield from data licensing fees.</div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: '65%' }}></div></div>
                </div>
                <button onClick={handlePublish} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95">{publishing ? 'Syncing...' : 'Publish_Live'}</button>
              </div>
            </>
          ) : (
            <div className="flex-1 space-y-8 animate-in fade-in duration-300">
               <div className="flex justify-between items-center">
                  <div>
                    <h3 className="mono text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Operational_Flows</h3>
                    <p className="text-[8px] text-slate-500 mono mt-1 normal-case">Automated system reactions based on trigger conditions.</p>
                  </div>
                  <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase transition-all active:scale-95 shadow-lg"> {showAdd ? 'Cancel' : '+ Define New Rule'} </button>
               </div>
               
               {showAdd && (
                 <div className="bg-slate-950 p-6 rounded-3xl border border-amber-500/30 grid grid-cols-1 md:grid-cols-3 gap-6 items-end animate-in slide-in-from-top-4">
                    <div className="space-y-2">
                      <label className="text-[7px] text-slate-500 uppercase mono font-black tracking-widest block">Rule_Name</label>
                      <input value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} className="w-full bg-black border border-white/10 p-2.5 rounded-lg text-[10px] text-white focus:border-amber-500 transition-colors" placeholder="e.g., Performance_Recovery" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[7px] text-slate-500 uppercase mono font-black tracking-widest block">Trigger_Condition</label>
                      <select value={newRule.trigger} onChange={e => setNewRule({...newRule, trigger: e.target.value})} className="w-full bg-black border border-white/10 p-2.5 rounded-lg text-[10px] text-white cursor-pointer">
                        {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[7px] text-slate-500 uppercase mono font-black tracking-widest block">Automated_Action</label>
                      <div className="flex gap-2">
                        <select value={newRule.action} onChange={e => setNewRule({...newRule, action: e.target.value})} className="flex-1 bg-black border border-white/10 p-2.5 rounded-lg text-[10px] text-white cursor-pointer">
                          {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <button onClick={addRule} className="bg-emerald-600 text-white p-2.5 rounded-lg hover:bg-emerald-500 transition-all shadow-lg active:scale-90">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={3}/></svg>
                        </button>
                      </div>
                    </div>
                 </div>
               )}

               <div className="grid gap-4">
                  {initialRules.map(rule => (
                    <div key={rule.id} className={`p-6 rounded-3xl border transition-all ${rule.active ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 'bg-slate-950 border-white/5 opacity-60'}`}>
                       <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-[11px] text-white font-black uppercase tracking-wide">{rule.name}</div>
                            <div className="text-[8px] text-slate-500 mono mt-1">ID: {rule.id}</div>
                          </div>
                          <button onClick={() => toggleRule(rule.id)} className={`px-4 py-1.5 rounded-lg text-[9px] mono font-black transition-all ${rule.active ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}>
                            {rule.active ? 'ACTIVE' : 'DISABLED'}
                          </button>
                       </div>
                       <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                          <div className="space-y-2">
                             <div className="text-[7px] text-slate-500 uppercase mono font-black tracking-widest">Trigger</div>
                             <div className="text-[10px] text-white mono font-bold bg-black/40 p-3 rounded-xl border border-white/5">{rule.trigger}</div>
                          </div>
                          <div className="space-y-2">
                             <div className="text-[7px] text-slate-500 uppercase mono font-black tracking-widest">Action</div>
                             <div className="text-[10px] text-amber-400 mono font-bold bg-black/40 p-3 rounded-xl border border-amber-500/20">{rule.action}</div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-slate-950 border-t border-white/5 text-[9px] mono text-slate-600 uppercase tracking-widest text-center font-bold">Restricted Enterprise Access • ID: SOC-MESH-{Math.floor(Math.random() * 99999)}</div>
      </div>
    </div>
  );
};

export default CommercialPortal;
