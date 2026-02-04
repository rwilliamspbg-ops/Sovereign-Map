import React, { useState, useEffect, useRef } from 'react';
import { MeshNode } from '../types';
import { sanitizeInput } from '../services/geminiService';

interface NodeConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  meshNodes?: MeshNode[];
}

const liveLogs = [
  "[SYSTEM] Sovereign Node Initialization Complete.",
  "[NETWORK] Connecting AggLayer Peer Protocol...",
  "[HANDSHAKE] Encrypted Link Established.",
  "[ZK] SNARK_PROVER: Hardened Acceleration Active.",
  "[MESH] Verification: 0x92f...A1 authenticated.",
  "[SECURITY] Packet Filter: 100% Validation.",
  "[SYSTEM] Spatial Commons Index updated.",
  "[IO] GPS_LOCK: Differential correction applied.",
  "[ZK] Witness generated and hashed.",
  "[MESH] Mesh consensus reached at Layer 0."
];

export const HardhatTerminal: React.FC<NodeConsoleProps> = ({ isOpen, onClose, meshNodes = [] }) => {
  const [output, setOutput] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setOutput(["> Establishing secure tunnel...", "> Initializing obfuscated kernel...", "> Handshaking with AggLayer..."]);
      let i = 0;
      const interval = setInterval(() => {
        if (i < liveLogs.length) {
          setOutput(prev => [...prev, liveLogs[i]]);
          i++;
        } else {
          const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
          const newLog = Math.random() > 0.7 
            ? `[SECURITY] Verified packet from peer 0x${Math.floor(Math.random()*1000).toString(16)}.`
            : `[MESH] Global state root synchronized at ${timestamp}`;
          setOutput(prev => [...prev.slice(-40), newLog]);
        }
      }, 450);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-6 bg-slate-950/95 backdrop-blur-2xl">
      <div className="w-full h-full md:max-w-5xl md:h-[750px] bg-[#010409] md:border border-blue-500/30 md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-[#0d1117] px-6 md:px-10 py-4 md:py-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="ml-3 text-[9px] md:text-[11px] text-slate-400 mono font-black uppercase tracking-widest flex items-center gap-4">
              <span>Secure_Audit_Console</span>
              <span className="text-blue-500">Verified_Peers: {meshNodes.length}</span>
            </span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-all p-2 bg-white/5 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 mono text-[11px] md:text-[13px] leading-relaxed whitespace-pre font-medium text-slate-400 bg-black/40">
          {output.map((line, idx) => {
            const safeLine = sanitizeInput(line);
            let colorClass = "text-slate-500";
            if (safeLine.includes("[SECURITY]")) colorClass = "text-emerald-500 font-black";
            else if (safeLine.includes("[MESH]")) colorClass = "text-blue-400 font-bold";
            else if (safeLine.startsWith(">")) colorClass = "text-white font-black";
            
            return (
              <div key={idx} className={`${colorClass} mb-1.5 animate-in fade-in slide-in-from-left-2 duration-300`}>
                {safeLine}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HardhatTerminal;