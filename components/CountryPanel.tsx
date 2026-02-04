import React, { useEffect, useState, useRef } from 'react';
import { getSovereignInsight, EnhancedSovereignInsight, generateBriefingAudio, generateFutureScenarioImage, decodeAudioData } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CountryPanelProps {
  country: { id: string; name: string } | null;
  onClose: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899'];

const CountryPanel: React.FC<CountryPanelProps> = ({ country, onClose }) => {
  const [insight, setInsight] = useState<EnhancedSovereignInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [futureImage, setFutureImage] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (country) {
      setLoading(true);
      setFutureImage(null);
      getSovereignInsight(country.name)
        .then(setInsight)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setInsight(null);
    }
  }, [country]);

  const handlePlayBriefing = async () => {
    if (!insight || audioLoading) return;
    setAudioLoading(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const base64Data = await generateBriefingAudio(insight.summary);
      if (!base64Data) throw new Error("No audio data received");

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await decodeAudioData(bytes, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (err) {
      console.error("Audio generation failed", err);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleVisualizeFuture = async () => {
    if (!country || !insight || imageLoading) return;
    setImageLoading(true);
    try {
      const risks = insight.keyRisks.map(r => r.name);
      const imageUrl = await generateFutureScenarioImage(country.name, risks);
      setFutureImage(imageUrl);
    } catch (err) {
      console.error("Visual generation failed", err);
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className={`fixed md:relative top-0 right-0 h-[85vh] md:h-full w-full md:w-[400px] lg:w-[460px] bg-slate-950/98 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/10 shadow-2xl z-[60] md:z-50 flex flex-col transition-transform duration-500 ease-in-out ${country ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}`}>
      <div className="md:hidden w-full flex justify-center py-3 shrink-0">
        <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
      </div>

      <div className="px-6 md:px-8 py-4 md:py-6 border-b border-white/5 shrink-0">
        <div className="flex justify-between items-start">
          <div className="min-w-0 pr-4">
            <div className="mono text-[8px] text-blue-500 font-black uppercase tracking-[0.4em] mb-1">Sector_Analytics</div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter truncate leading-none">{country?.name || 'ANALYZING'}</h2>
            <div className="flex items-center gap-2 mt-2">
              {insight && <span className={`px-2 py-0.5 rounded text-[8px] mono font-bold border ${insight.riskScore && insight.riskScore > 60 ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>RISK_SCORE: {insight.riskScore || '---'}</span>}
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 rounded-full p-2 transition-colors shrink-0">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-400 mono text-[9px] uppercase tracking-[0.3em] animate-pulse">Scanning Geodata...</p>
          </div>
        ) : insight ? (
          <>
            <div className="flex gap-3">
              <button onClick={handlePlayBriefing} disabled={audioLoading} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl mono text-[8px] font-black uppercase text-blue-400 transition-all flex items-center justify-center gap-2 active:scale-95">
                {audioLoading ? <div className="w-3 h-3 border border-blue-400 border-t-transparent animate-spin rounded-full"></div> : <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                Audio
              </button>
              <button onClick={handleVisualizeFuture} disabled={imageLoading} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl mono text-[8px] font-black uppercase text-emerald-400 transition-all flex items-center justify-center gap-2 active:scale-95">
                {imageLoading ? <div className="w-3 h-3 border border-emerald-400 border-t-transparent animate-spin rounded-full"></div> : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
                Visualize
              </button>
            </div>

            {futureImage && (
              <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black/40">
                <img src={futureImage} className="w-full h-full object-cover" alt="Projection" />
              </div>
            )}

            <section className="space-y-3">
              <h3 className="text-slate-500 text-[8px] mono font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1 h-3 bg-blue-600"></span> Executive Summary
              </h3>
              <p className="text-slate-300 text-[13px] leading-relaxed font-medium">{insight.summary}</p>
            </section>

            <section className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-slate-500 text-[8px] mono font-bold uppercase mb-4 tracking-[0.2em] text-center">Threat Configuration</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={insight.keyRisks} dataKey="severity" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={60} stroke="none">
                      {insight.keyRisks.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => active && payload ? (
                      <div className="bg-slate-950 border border-white/10 p-2 rounded text-[10px] mono text-white">{payload[0].name}: {payload[0].value}%</div>
                    ) : null} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CountryPanel;