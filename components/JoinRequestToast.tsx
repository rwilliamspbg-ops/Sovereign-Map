
import React from 'react';

interface JoinRequestToastProps {
  request: { id: string; device: string };
  onAccept: () => void;
  onDecline: () => void;
}

const JoinRequestToast: React.FC<JoinRequestToastProps> = ({ request, onAccept, onDecline }) => {
  return (
    <div className="absolute bottom-24 right-4 md:right-8 z-[60] animate-in slide-in-from-right-8 duration-500">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl p-6 shadow-2xl w-72 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <svg className="w-6 h-6 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <div className="text-[9px] text-emerald-500 font-black mono uppercase tracking-widest">Incoming_Peer</div>
            <div className="text-xs font-black text-white truncate">{request.device}</div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mono">Nearby device is requesting to join the local spatial swarm.</p>
        <div className="flex gap-2">
          <button 
            onClick={onAccept}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Accept
          </button>
          <button 
            onClick={onDecline}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Ignore
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestToast;
