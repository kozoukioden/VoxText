'use client';

import { useEffect, useState } from 'react';
import { useTranscriber } from '@/hooks/useTranscriber';
import { AudioUploader } from '@/components/AudioUploader';
import { ModelSelector } from '@/components/ModelSelector';
import { Mic, Download, Sparkles, Loader2, FileText, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [model, setModel] = useState('Xenova/whisper-tiny');
  const { ready, progress, isTranscribing, transcript, start, init } = useTranscriber();
  const [audioData, setAudioData] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Initialize (load model) when model or ready state changes
  useEffect(() => {
    // Only init if we haven't already or if model changed.
    // But since init loads the model, we can call it.
    // Ideally we wait for user action, but pre-loading is nice.
    // Let's load on first render or model change.
    if (!isTranscribing) { // Dont switch mid-transcription
      init(model);
    }
  }, [init, model]);

  const handleTranscribe = () => {
    if (!audioData) return;
    start(audioData, model);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Prepare transcript text for download
  const handleDownload = () => {
    if (!transcript) return;
    let text = "";
    if (Array.isArray(transcript.chunks)) {
      text = transcript.chunks.map((c: any) => `[${c.timestamp[0]} -> ${c.timestamp[1]}] ${c.text}`).join('\n');
    } else if (transcript.text) {
      text = transcript.text;
    } else {
      text = JSON.stringify(transcript, null, 2);
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'transcript'}.txt`;
    a.click();
  };

  return (
    <main className="min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Antigravity Scribe
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Free, unlimited, privacy-first audio transcription. Running entirely on your device using WebGPU.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com/oguzhakan94" target="_blank" className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <Globe className="w-5 h-5 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Controls */}
      <div className="p-1 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 pb-[1px] pr-[1px]">
        <div className="bg-[#0f0f0f] rounded-2xl p-6 md:p-8 space-y-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Input */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Settings</label>
                <ModelSelector
                  currentModel={model}
                  onModelChange={setModel}
                  disabled={isTranscribing}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Audio Source</label>
                <AudioUploader
                  onAudioLoaded={(buffer, name) => {
                    setAudioData(buffer);
                    setFileName(name);
                  }}
                />
              </div>

              {/* Status/Actions */}
              {progress && progress.status === 'progress' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between text-xs text-gray-400 uppercase font-medium">
                    <span>Downloading Model...</span>
                    <span>{Math.round(progress.progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{progress.file}</p>
                </div>
              )}

              {audioData && !isTranscribing && (
                <button
                  onClick={handleTranscribe}
                  disabled={!ready}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {ready ? 'Start Transcription' : 'Loading Model...'}
                </button>
              )}

              {isTranscribing && (
                <div className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-blue-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Transcribing...</span>
                </div>
              )}
            </div>

            {/* Right Column: Output */}
            <div className="w-full lg:w-2/3 h-full min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Transcript
                </h2>
                {transcript && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-sm font-medium text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                )}
              </div>

              <div className="flex-1 p-6 bg-black/20 border border-white/5 rounded-2xl min-h-[500px] max-h-[700px] overflow-y-auto font-mono text-gray-300 leading-relaxed space-y-4">
                {!transcript && !isTranscribing && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                    <Mic className="w-12 h-12 opacity-20" />
                    <p>Ready to transcribe. Upload a file to begin.</p>
                  </div>
                )}

                {isTranscribing && !transcript && (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                    <div className="h-4 bg-white/5 rounded w-5/6"></div>
                  </div>
                )}

                {transcript && typeof transcript.text === 'string' && (
                  <div className="whitespace-pre-wrap">{transcript.text}</div>
                )}

                {transcript && Array.isArray(transcript.chunks) && (
                  <div className="space-y-2">
                    {transcript.chunks.map((chunk: any, i: number) => (
                      <div key={i} className="flex gap-4 hover:bg-white/5 p-2 rounded transition-colors group">
                        <span className="text-blue-500/50 text-xs mt-1 select-none group-hover:text-blue-400">
                          {chunk.timestamp && `[${chunk.timestamp[0].toFixed(2)} - ${chunk.timestamp[1].toFixed(2)}]`}
                        </span>
                        <span>{chunk.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
