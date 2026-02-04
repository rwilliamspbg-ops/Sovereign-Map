import React, { useState } from 'react';

interface MeshBetaHUDProps {
  stats: {
    count: number;
    tflops: number;
    efficiency: number;
    totalVoxels?: number;
  };
  isMainnet?: boolean;
  isSeeking?: boolean;
  isSimulation?: boolean;
}

export const MeshMainnetHUD: React.FC<MeshBetaHUDProps> = ({ stats, isMainnet, isSeeking, isSimulation }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const globalCoverage = Math.min(stats.count * 1.82, 99.98).toFixed(2);

  return (
    <div className="absolute bottom-6 left-4 md:bottom-8 md:left-8 pointer-events-none z-30 flex flex-col gap-3 animate-in slide-in-from-left-4 duration-700">
      <div className={`backdrop-blur-3xl p-4 md:p-5 rounded-3xl border shadow-2xl pointer-events-auto w-56 md:w-64 transition-all duration-500 ${isMainnet ? (isSimulation ? 'bg-amber-950/30 border-amber-500/20' : 'bg-cyan-950/30 border-cyan-500/20') : 'bg-slate-950/70 border-white/5'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <h3 className={`text-[8px] font-black uppercase tracking-[0.3em] mono ${isSimulation ? 'text-amber-400' : isMainnet ? 'text-cyan-400' : 'text-blue-500'}`}>
              Network_Backbone
            </h3>
            <span className="text-[6px] text-slate-500 mono font-bold">Latency: 24ms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[6px] text-emerald-500 mono font-black uppercase">Live</span>
            </div>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="text-slate-500 hover:text-white transition-colors p-1 pointer-events-auto"
            >
              <svg className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth={3}/></svg>
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <div className="text-[7px] text-slate-500 uppercase font-black mono">Planetary Coverage</div>
                <div className="text-xl font-black text-white leading-none tracking-tight">
                  {globalCoverage}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-[7px] text-slate-500 uppercase font-black mono">Compute</div>
                <div className={`text-sm font-black leading-none ${isSimulation ? 'text-amber-400' : 'text-blue-500'}`}>
                  {stats.tflops.toFixed(1)} PF
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-y border-white/5">
               <div className="text-[7px] text-slate-500 uppercase font-black mono">Spatial_Contribution</div>
               <div className="text-[10px] font-black text-emerald-400 mono">
                 {stats.totalVoxels?.toLocaleString() || 0} VOXELS
               </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[7px] font-black uppercase mono">
                <span className="text-slate-500">Backbone Stability</span>
                <span className={isSimulation ? 'text-amber-400' : 'text-cyan-400'}>{stats.efficiency.toFixed(0)}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${isSimulation ? 'bg-amber-400' : isMainnet ? 'bg-cyan-500' : 'bg-blue-500'}`} 
                  style={{ width: `${stats.efficiency}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeshMainnetHUD;