
import React, { useRef, useEffect, useState } from 'react';
import { Voxel } from '../types';

interface SpatialScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (claim: { voxelBatch: Voxel[] }) => void;
}

const SpatialScanner: React.FC<SpatialScannerProps> = ({ isOpen, onClose, onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'IDLE' | 'BOOTING' | 'TRACKING' | 'COMMITTING' | 'FINALIZED'>('IDLE');
  const [points, setPoints] = useState<{ x: number; y: number; life: number; color: string; size: number }[]>([]);
  const [capturedVoxels, setCapturedVoxels] = useState<Voxel[]>([]);
  const [telemetry, setTelemetry] = useState({ voxels: 0, stability: 100 });

  useEffect(() => {
    if (isOpen && status === 'IDLE') {
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setStatus('BOOTING');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus('TRACKING');
      }
    } catch (err) {
      console.error("Spatial Engine Error:", err);
      onClose();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setStatus('IDLE');
  };

  useEffect(() => {
    if (status !== 'TRACKING') return;
    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Simulate 3D Feature Detection
      const newVoxel: Voxel = {
        id: `v-${Date.now()}-${Math.random()}`,
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 40 - 20,
        z: (Math.random() - 0.5) * 100,
        color: '#10b981',
        intensity: 1.0,
        isPeerData: false
      };
      
      setCapturedVoxels(prev => [...prev.slice(-1000), newVoxel]);
      setTelemetry(prev => ({
        voxels: prev.voxels + 1,
        stability: 99.4 + Math.random() * 0.6
      }));

      // 2D Viz Points
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const newPoints = Array.from({ length: 5 }).map(() => ({
        x: centerX + (Math.random() - 0.5) * (canvas.width * 0.8),
        y: centerY + (Math.random() - 0.5) * (canvas.height * 0.8),
        life: 1.0,
        size: Math.random() * 2 + 1,
        color: '#10b981'
      }));
      setPoints(prev => [...prev, ...newPoints].filter(p => p.life > 0).slice(-200));
    }, 100);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== 'TRACKING' || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    let frame: number;
    const render = () => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${p.life})`;
        ctx.fill();
        p.life -= 0.02;
      });
      frame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frame);
  }, [status, points]);

  const handleCommit = () => {
    setStatus('COMMITTING');
    setTimeout(() => {
      setStatus('FINALIZED');
      setTimeout(() => {
        onScanComplete({ voxelBatch: capturedVoxels });
        onClose();
      }, 1000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden animate-in fade-in duration-700 font-mono">
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-50 contrast-125" />
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="absolute inset-0 z-10" />

      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-8">
        <div className="flex justify-between items-start">
          <div className="bg-slate-950/90 backdrop-blur-xl p-5 rounded-3xl border border-blue-600/30 w-72 shadow-2xl">
            <div className="text-[9px] text-blue-500 font-black uppercase mb-3 tracking-[0.4em] border-b border-white/10 pb-2 flex justify-between">
              <span>Spatial_Capture</span>
              <span className="text-emerald-500">LOCK_ON</span>
            </div>
            <div className="space-y-1.5 text-[9px] text-slate-400">
              <div className="flex justify-between"><span>Voxels:</span> <span className="text-white">{telemetry.voxels}</span></div>
              <div className="flex justify-between"><span>Engine:</span> <span className="text-emerald-400">SLAM_v3</span></div>
              <div className="flex justify-between pt-2 border-t border-white/5"><span>Buffer:</span> <span className="text-emerald-400 font-black">LOCAL_ONLY</span></div>
            </div>
          </div>
          <button onClick={onClose} className="pointer-events-auto p-3 bg-slate-950/90 rounded-2xl border border-white/10 text-white hover:bg-rose-500/20 transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col items-center gap-8 mb-20">
          {status === 'TRACKING' && (
            <button 
              onClick={handleCommit}
              className="pointer-events-auto px-12 py-5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] transition-all shadow-2xl border border-blue-400/30"
            >
              Anchor_To_Mesh
            </button>
          )}
          {status === 'COMMITTING' && (
            <div className="bg-slate-950/98 p-8 rounded-3xl w-full max-w-sm text-center border border-emerald-500/40">
              <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 animate-pulse">Syncing Voxel Packets...</div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-[shimmer_1s_infinite]"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{` @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } `}</style>
    </div>
  );
};

export default SpatialScanner;
