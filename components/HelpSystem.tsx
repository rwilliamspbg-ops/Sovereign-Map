
import React from 'react';

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const HELP_SECTIONS = [
  {
    title: "The Sovereign Mesh",
    icon: "Σ",
    content: "A decentralized network of nodes (Peers) that perform local spatial compute. More peers increase the network's TFLOPS and power efficiency."
  },
  {
    title: "Predictive 'What-If'",
    icon: "T",
    content: "Uses Monte Carlo simulations to project node density and geopolitical risk up to 24 hours into the future. Move the temporal slider to engage."
  },
  {
    title: "Sentinel Logic",
    icon: "S",
    content: "The system's automated reaction engine. Define rules like 'If Efficiency < 85% Then Reroute' to maintain 100% network uptime automatically."
  },
  {
    title: "Sovereign Analyst",
    icon: "A",
    content: "Powered by Gemini 3. Provides boardroom-ready reports grounded in real-time web data and recent geopolitical events."
  },
  {
    title: "Spatial Voxel Engine",
    icon: "V",
    content: "Renders raw feature-point data captured via monocular-inertial SLAM into a collaborative 3D coordinate system."
  }
];

const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border border-blue-500/30 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
          <div>
            <div className="mono text-[9px] text-blue-500 font-black uppercase tracking-[0.4em] mb-1">System_Documentation</div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Command <span className="text-blue-500">Manual</span></h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {HELP_SECTIONS.map((section, idx) => (
            <div key={idx} className="flex gap-6 p-6 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
              <div className="w-12 h-12 shrink-0 bg-blue-600/10 rounded-xl flex items-center justify-center font-black text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {section.icon}
              </div>
              <div>
                <h3 className="text-white font-black text-sm uppercase mb-2 tracking-wide">{section.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-950 border-t border-white/5 text-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            Acknowledge Protocols
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpSystem;
