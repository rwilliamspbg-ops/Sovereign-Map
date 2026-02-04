
import React, { useState } from 'react';

interface InvitePortalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: () => void;
}

const InvitePortal: React.FC<InvitePortalProps> = ({ isOpen, onClose, onInvite }) => {
  const [step, setStep] = useState<'IDLE' | 'GENERATING' | 'READY'>('IDLE');
  const [inviteCode, setInviteCode] = useState('');

  const generateCode = () => {
    setStep('GENERATING');
    setTimeout(() => {
      const code = `SM-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setInviteCode(code);
      setStep('READY');
      onInvite();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-slate-900 border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
          <div>
            <div className="mono text-[9px] text-blue-500 font-black uppercase tracking-[0.4em] mb-1">Mesh_Expansion_Portal</div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Expand the <span className="text-blue-500">Sovereign Mesh</span></h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-8">
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            Generating an encrypted Peer Key allows you to invite a secondary device to the Sovereign Mesh. 
            Combined processing power reserves your battery by offloading spatial computations.
          </p>

          {step === 'IDLE' && (
            <button 
              onClick={generateCode}
              className="w-full py-4 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              Generate Peer Key
            </button>
          )}

          {step === 'GENERATING' && (
            <div className="w-full py-10 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-[10px] text-blue-500 mono font-black animate-pulse">ENCRYPTING_SIGNAL...</div>
            </div>
          )}

          {step === 'READY' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="bg-black/50 p-6 rounded-2xl border border-blue-500/20 text-center">
                <div className="text-[8px] text-slate-500 uppercase font-black mb-3 mono tracking-[0.3em]">Encrypted_Peer_Code</div>
                <div className="text-2xl font-black text-blue-400 tracking-[0.2em] mono">{inviteCode}</div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { navigator.clipboard.writeText(inviteCode); alert("Key Copied"); }} className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Copy Key</button>
                <button onClick={onClose} className="flex-1 py-4 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Done</button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-950/80 border-t border-white/5 text-[8px] mono text-slate-600 text-center uppercase tracking-widest">
          Beta Launch Protocol: Limited to 10 invites per node.
        </div>
      </div>
    </div>
  );
};

export default InvitePortal;
