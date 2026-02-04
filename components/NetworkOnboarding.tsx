import React, { useState, useEffect } from 'react';
import { WorkloadConfig } from '../types';

interface NetworkOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (config: WorkloadConfig) => void;
}

const NetworkOnboarding: React.FC<NetworkOnboardingProps> = ({ isOpen, onClose, onJoin }) => {
  const [capabilities, setCapabilities] = useState({
    lidar: false,
    npu: false,
    gps: false,
    highBandwidth: false
  });
  const [step, setStep] = useState(1);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (isOpen && step === 1) {
      setIsDetecting(true);
      const timer = setTimeout(() => {
        const hasGPS = 'geolocation' in navigator;
        const hasLidar = 'XRRay' in window || (navigator as any).xr?.isSessionSupported?.('immersive-ar');
        const hasHighBandwidth = (navigator as any).connection?.downlink > 10;
        
        setCapabilities({
          lidar: !!hasLidar,
          npu: true, // Simulation of sandboxed NPU
          gps: hasGPS,
          highBandwidth: hasHighBandwidth
        });
        setIsDetecting(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-slate-900 border border-blue-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 bg-slate-950/50 flex justify-between items-center">
          <div>
            <div className="mono text-[9px] text-blue-500 font-black uppercase tracking-[0.4em] mb-1">Backbone_Access_Protocol</div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Sovereign <span className="text-blue-500">Node Joiner</span></h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
          </button>
        </div>

        <div className="p-10 space-y-8 overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm leading-relaxed mono">
                  {isDetecting ? (
                    <span className="animate-pulse">> Analyzing hardware profile...</span>
                  ) : (
                    <>
                      > Hardware profile synchronized.<br/>
                      > Spatial sensors detected.
                    </>
                  )}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'LiDAR / Depth', active: capabilities.lidar, icon: 'L' },
                  { label: 'Neural Engine', active: capabilities.npu, icon: 'N' },
                  { label: 'Precision GPS', active: capabilities.gps, icon: 'G' },
                  { label: 'Broadband Mesh', active: capabilities.highBandwidth, icon: 'B' },
                ].map(cap => (
                  <div key={cap.label} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all duration-500 ${isDetecting ? 'opacity-30' : cap.active ? 'bg-blue-500/10 border-blue-500/40' : 'bg-slate-950 border-white/5 opacity-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${cap.active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{cap.icon}</div>
                    <span className="text-[10px] mono font-black text-white uppercase">{cap.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 text-[10px] text-slate-500 italic mono">
                Your device will act as a "Spatial Witness", contributing encrypted packets to the global mesh consensus.
              </div>

              <button 
                onClick={() => setStep(2)} 
                disabled={isDetecting}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                Initiate Contribution
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95">
               <div className="flex flex-col items-center gap-6 text-center">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full border border-emerald-500/40 flex items-center justify-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                    <svg className="absolute w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={3}/></svg>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase">Ready for Sync</h3>
                  <p className="text-slate-400 text-xs mono">Your node signature has been generated. By joining, you contribute to the global spatial double.</p>
               </div>

               <button 
                onClick={() => {
                  onJoin({
                    active: true,
                    intensity: 50,
                    type: 'SPATIAL',
                    hardwareCapability: {
                      lidar: capabilities.lidar,
                      npu: capabilities.npu,
                      gps: capabilities.gps
                    }
                  });
                  onClose();
                }}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95"
               >
                 Confirm Global Join
               </button>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-slate-950 border-t border-white/5 text-[8px] mono text-slate-600 uppercase tracking-widest text-center font-black">
          Sovereign Mapping Protocol v2.5 // SHA256_VERIFIED
        </div>
      </div>
    </div>
  );
};

export default NetworkOnboarding;