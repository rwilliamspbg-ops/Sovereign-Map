
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { getAI, encode, decode, decodeAudioData } from '../services/geminiService';

interface LiveVoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveVoiceInterface: React.FC<LiveVoiceInterfaceProps> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('IDLE');
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const transcriptionRef = useRef<string>("");

  const stopAllAudio = () => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const handleToggle = async () => {
    if (isActive) {
      setIsActive(false);
      setStatus('IDLE');
      if (sessionRef.current) {
        sessionRef.current.close();
      }
      stopAllAudio();
      return;
    }

    try {
      setStatus('CONNECTING');
      const ai = getAI();
      
      if (!inputAudioContextRef.current) {
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('CONNECTED');
            setIsActive(true);
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`, do not add other condition checks.
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Data
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Transcription
            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current += message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev.slice(-4), transcriptionRef.current]);
            }

            if (message.serverContent?.turnComplete) {
              transcriptionRef.current = "";
            }

            if (message.serverContent?.interrupted) {
              stopAllAudio();
            }
          },
          onerror: (e) => {
            console.error("Live session error:", e);
            setStatus('ERROR');
            setIsActive(false);
          },
          onclose: () => {
            setStatus('IDLE');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are the Sovereign Map AI Intelligence. You assist high-level spatial architects with geopolitical insights and network data. Your tone is professional, analytical, and futuristic.',
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to initialize live link:", err);
      setStatus('ERROR');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-slate-900 border border-blue-500/30 rounded-[2.5rem] shadow-[0_0_80px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
          <div>
            <div className="mono text-[9px] text-blue-500 font-black uppercase tracking-[0.4em] mb-1">Native_Audio_Interface</div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Live <span className="text-blue-500">Comms</span></h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={1.5} /></svg>
          </button>
        </div>

        <div className="p-10 flex-1 flex flex-col items-center justify-center text-center space-y-10">
          {/* Visualizer Circle */}
          <div className="relative">
            <div className={`w-32 h-32 rounded-full border-2 transition-all duration-700 flex items-center justify-center ${isActive ? 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)] scale-110' : 'border-slate-800 shadow-none'}`}>
              <div className={`w-24 h-24 rounded-full border border-dashed transition-all duration-1000 ${isActive ? 'border-emerald-400 animate-spin' : 'border-slate-700'}`}></div>
              <div className={`absolute w-16 h-16 rounded-full flex items-center justify-center ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'}`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" strokeWidth={2}/>
                </svg>
              </div>
            </div>
            {isActive && (
              <>
                <div className="absolute -inset-4 border border-emerald-500/20 rounded-full animate-ping"></div>
                <div className="absolute -inset-8 border border-emerald-500/10 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </>
            )}
          </div>

          <div className="space-y-4 w-full">
            <div className="flex flex-col gap-1.5">
               <span className={`text-[10px] mono font-black uppercase tracking-[0.2em] ${status === 'CONNECTED' ? 'text-emerald-500' : status === 'CONNECTING' ? 'text-amber-500 animate-pulse' : status === 'ERROR' ? 'text-rose-500' : 'text-slate-500'}`}>
                 {status === 'CONNECTED' ? 'Link_Established' : status === 'CONNECTING' ? 'Synchronizing_Pulse...' : status === 'ERROR' ? 'Signal_Interrupted' : 'Awaiting_Command'}
               </span>
               {status === 'CONNECTED' && <div className="text-[11px] mono text-slate-400">Zero-latency neural bridge active. Speak now.</div>}
            </div>

            <div className="h-24 bg-black/40 border border-white/5 rounded-2xl p-4 overflow-hidden flex flex-col justify-end text-left">
              {transcription.length > 0 ? (
                transcription.map((line, idx) => (
                  <div key={idx} className="text-[10px] mono text-slate-300 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <span className="text-blue-500 mr-2">SYS_VOICE_FEED:</span> {line}
                  </div>
                ))
              ) : (
                <div className="text-[9px] mono text-slate-600 uppercase tracking-widest text-center py-6">No data in buffer...</div>
              )}
            </div>
          </div>

          <button 
            onClick={handleToggle}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${isActive ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'}`}
          >
            {isActive ? 'Terminate Signal' : 'Initialize Comm Link'}
          </button>
        </div>

        <div className="p-4 bg-slate-950 border-t border-white/5 text-[8px] mono text-slate-600 text-center uppercase tracking-widest">
           Sovereign Voice Protocol (v2.5_Native) • PCM_16BIT_SYNC
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceInterface;
