import React, { useState, useEffect } from 'react';
import { SecurityEvent, ThreatAssessment } from '../types';

interface GuardianAgentProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuardianAgent: React.FC<GuardianAgentProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [assessment, setAssessment] = useState<ThreatAssessment>({
    overallRisk: 4,
    integrityScore: 98,
    activeThreats: 0,
    shieldStatus: 'NOMINAL'
  });

  // Simulated live security monitoring
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const types: SecurityEvent['type'][] = ['INJECTION', 'SPOOFING', 'INTEGRITY', 'ANOMALY'];
        const severities: SecurityEvent['severity'][] = ['LOW', 'MEDIUM', 'HIGH'];
        const newEvent: SecurityEvent = {
          id: `SEC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          type: types[Math.floor(Math.random() * types.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          source: `Node-0x${Math.floor(Math.random() * 1000).toString(16)}`,
          timestamp: Date.now(),
          resolved: false
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 10));
        
        // Auto-mitigation animation
        setTimeout(() => {
          setEvents(prev => prev.map(ev => ev.id === newEvent.id ? { ...ev, resolved: true } : ev));
        }, 3000);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-rose-500/30 rounded-[3rem] shadow-[0_0_100px_rgba(244,63,94,0.1)] overflow-hidden flex flex-col h-[700px]">
        {/* Header */}
        <div className="p-8 border-b border-rose-500/20 bg-rose-950/20 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.4)]">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth={2.5}/></svg>
            </div>
            <div>
              <div className="mono text-[9px] text-rose-500 font-black uppercase tracking-[0.4em] mb-1">Guardian_Protocol_v4.2</div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sovereign <span className="text-rose-500">Guardian Agent</span></h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={1.5}/></svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Dashboard Left */}
          <div className="w-2/3 p-10 space-y-8 overflow-y-auto custom-scrollbar">
             <section className="space-y-4">
                <div className="flex justify-between items-end">
                   <h3 className="mono text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Integrity_Stream</h3>
                   <span className="text-[10px] mono text-emerald-500 font-black">SCANNING_ACTIVE</span>
                </div>
                <div className="space-y-3">
                   {events.length === 0 ? (
                     <div className="py-20 text-center border border-white/5 rounded-3xl bg-black/20">
                        <p className="text-[10px] mono text-slate-600 uppercase tracking-widest font-black">Zero intrusion attempts detected in current cycle.</p>
                     </div>
                   ) : (
                     events.map(event => (
                       <div key={event.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-500 ${event.resolved ? 'bg-slate-900/50 border-white/5' : 'bg-rose-500/10 border-rose-500/40 animate-pulse'}`}>
                          <div className="flex items-center gap-4">
                             <div className={`w-2 h-2 rounded-full ${event.resolved ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`}></div>
                             <div>
                                <div className="text-[11px] text-white font-black uppercase tracking-wide">{event.type} Detected</div>
                                <div className="text-[8px] text-slate-500 mono">Source: {event.source} | ID: {event.id}</div>
                             </div>
                          </div>
                          <div className={`px-3 py-1 rounded text-[8px] mono font-black border ${event.resolved ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-600 text-white border-rose-400'}`}>
                             {event.resolved ? 'MITIGATED' : 'BLOCKING'}
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </section>

             <section className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 space-y-3">
                   <div className="text-[8px] text-slate-500 mono font-black uppercase">Neural Firewall Status</div>
                   <div className="flex items-end gap-2">
                      <div className="text-2xl font-black text-white">99.9</div>
                      <div className="text-[10px] text-emerald-500 font-black mb-1">% SAFE</div>
                   </div>
                   <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '99.9%' }}></div>
                   </div>
                </div>
                <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 space-y-3">
                   <div className="text-[8px] text-slate-500 mono font-black uppercase">Active Shield Strength</div>
                   <div className="flex items-end gap-2">
                      <div className="text-2xl font-black text-white">1.2</div>
                      <div className="text-[10px] text-rose-500 font-black mb-1">TB/S PROTECTION</div>
                   </div>
                   <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: '75%' }}></div>
                   </div>
                </div>
             </section>
          </div>

          {/* Sidebar Right */}
          <div className="w-1/3 bg-slate-950/50 border-l border-white/5 p-8 space-y-10">
             <div className="space-y-4">
                <h3 className="mono text-rose-500 text-[9px] font-black uppercase tracking-[0.3em]">Threat_Summary</h3>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] mono text-slate-400">
                      <span>Risk Level</span>
                      <span className="text-white font-black">MINIMAL</span>
                   </div>
                   <div className="flex justify-between text-[10px] mono text-slate-400">
                      <span>Integrity Score</span>
                      <span className="text-emerald-500 font-black">98/100</span>
                   </div>
                   <div className="flex justify-between text-[10px] mono text-slate-400">
                      <span>Peers Offline</span>
                      <span className="text-rose-500 font-black">0</span>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-rose-600/5 border border-rose-500/20 rounded-3xl space-y-4">
                <div className="text-[9px] text-rose-500 mono font-black uppercase tracking-widest text-center">Guardian Countermeasures</div>
                <div className="space-y-2">
                   {[
                     { name: 'Node Quarantine', active: true },
                     { name: 'Query Sanitization', active: true },
                     { name: 'ZK-Handshake V2', active: false },
                     { name: 'Traffic Obfuscation', active: true }
                   ].map(c => (
                     <div key={c.name} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-300 font-bold uppercase">{c.name}</span>
                        <div className={`w-2 h-2 rounded-full ${c.active ? 'bg-emerald-500 shadow-[0_0_8px_emerald]' : 'bg-slate-700'}`}></div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="p-6 bg-slate-950 border-t border-rose-500/10 text-center">
          <p className="text-[8px] mono text-slate-600 uppercase tracking-widest font-black">This node is protected by Sovereign Guardian Agent. Unauthorized scanning is restricted.</p>
        </div>
      </div>
    </div>
  );
};

export default GuardianAgent;