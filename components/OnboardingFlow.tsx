import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { generateIdentityManifesto } from '../services/geminiService';

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (role: UserRole, manifesto: string) => void;
  onClose: () => void;
}

const ROLES = [
  { id: 'ARCHITECT' as UserRole, name: 'Spatial Architect', icon: 'M', desc: 'Map geometry and textures using monocular SLAM.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'GUARD' as UserRole, name: 'Grid Guard', icon: 'G', desc: 'Verify peer telemetry and secure the mesh from injection.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'SCOUT' as UserRole, name: 'Intel Scout', icon: 'S', desc: 'Analyze geopolitical risk and identify data anomalies.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ isOpen, onComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [manifesto, setManifesto] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRole && step === 2) {
      handleGenerateIdentity();
    }
  }, [selectedRole, step]);

  const handleGenerateIdentity = async () => {
    setLoading(true);
    try {
      const loc = "Sovereign-01 Node"; // In real app, query geolocation
      const text = await generateIdentityManifesto(selectedRole!, loc);
      setManifesto(text);
    } catch (e) {
      setManifesto("I am the digital eye that never blinks.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-slate-900 border border-blue-500/20 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
          <div>
            <div className="mono text-[9px] text-blue-500 font-black uppercase tracking-[0.4em] mb-1">Identity_Initialization</div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Enter the <span className="text-blue-500">Backbone</span></h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
          </button>
        </div>

        <div className="p-10 flex-1 flex flex-col items-center justify-center text-center space-y-10">
          {step === 1 ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h3 className="text-white text-xl font-black uppercase tracking-tight">Select your operational role</h3>
                <p className="text-slate-400 text-xs mono">Every node strengthens the sovereign collective.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {ROLES.map(role => (
                  <button
                    key={role.id}
                    onClick={() => { setSelectedRole(role.id); setStep(2); }}
                    className={`p-6 rounded-3xl border transition-all group flex flex-col items-center gap-4 ${selectedRole === role.id ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-950 border-white/5 hover:border-white/20'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border ${role.bg} ${role.color} group-hover:scale-110 transition-transform`}>
                      {role.icon}
                    </div>
                    <div className="space-y-1">
                       <div className="text-[10px] text-white font-black uppercase">{role.name}</div>
                       <p className="text-[8px] text-slate-500 mono leading-tight">{role.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-10 w-full animate-in zoom-in-95">
               <div className="space-y-4">
                 <div className="text-[9px] text-emerald-500 mono font-black uppercase tracking-[0.4em]">Identity_Anchored</div>
                 <div className="p-8 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   {loading ? (
                     <div className="flex flex-col items-center gap-3 py-6">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-[8px] mono text-blue-500 animate-pulse">DECIPHERING_SOUL...</div>
                     </div>
                   ) : (
                     <p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed italic italic">"{manifesto}"</p>
                   )}
                 </div>
               </div>

               <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-6 text-[9px] mono text-slate-500 uppercase font-black">
                     <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> GPU_LOCK</span>
                     <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> SLAM_READY</span>
                  </div>
                  <button 
                    onClick={() => onComplete(selectedRole!, manifesto)}
                    className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-95"
                  >
                    Initialize Connection
                  </button>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-950/80 border-t border-white/5 text-[8px] mono text-slate-600 text-center uppercase tracking-widest font-black">
          By joining, you become part of the decentralized spatial commons.
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;