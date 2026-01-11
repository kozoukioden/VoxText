'use client';

import { useEffect, useState } from 'react';
import { useTranscriber } from '@/hooks/useTranscriber';
import { AudioUploader } from '@/components/AudioUploader';
import { Mic, Download, Sparkles, Loader2, FileText, Globe, File, FileCode, FileType } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Document, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";

export default function Home() {
  const [model] = useState('Xenova/whisper-tiny'); // Fixed model
  const { ready, progress, isTranscribing, transcript, start, init } = useTranscriber();
  const [audioData, setAudioData] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const addLog = (msg: string) => setStatusLog(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // Initialize (load model) when model or ready state changes
  useEffect(() => {
    if (!isTranscribing && !ready && !isModelLoading) {
      addLog(`Initializing model: ${model}...`);
      setIsModelLoading(true);
      init(model);
    }
  }, [init, model, ready, isTranscribing, isModelLoading]);

  useEffect(() => {
    if (ready) {
      setIsModelLoading(false);
      addLog("Model loaded. Ready to transcribe.");
      toast.success("Ready to transcribe!");
    }
  }, [ready]);

  // Toast notifications based on state
  useEffect(() => {
    if (progress?.status === 'progress') {
      // Optional: Don't spam logs, just UI bar
    }
    if (progress?.status === 'ready') {
      addLog("Model download complete.");
    }
    if (progress?.status === 'error') {
      const errorMsg = `Error: ${progress.data}`;
      toast.error(errorMsg);
      addLog(errorMsg);
      setIsModelLoading(false);
    }
  }, [progress]);

  const handleTranscribe = async () => {
    if (!audioData) return;
    toast.info("Starting transcription...");
    addLog("Starting transcription...");
    try {
      await start(audioData, model);
    } catch (e: any) {
      const msg = e.message || "Failed to start transcription";
      toast.error(msg);
      addLog(`Error: ${msg}`);
    }
  };

  const getTranscriptText = () => {
    if (!transcript) return "";
    if (Array.isArray(transcript.chunks)) {
      return transcript.chunks.map((c: any) => `[${c.timestamp[0].toFixed(2)} -> ${c.timestamp[1].toFixed(2)}] ${c.text}`).join('\n');
    } else if (transcript.text) {
      return transcript.text;
    }
    return "";
  };

  const exportTxt = () => {
    const text = getTranscriptText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'transcript'}.txt`;
    a.click();
    toast.success("Exported as .txt");
  };

  const exportDocx = async () => {
    const text = getTranscriptText();
    const doc = new Document({
      sections: [{
        properties: {},
        children: text.split('\n').map((line: string) => new Paragraph({
          children: [new TextRun(line)],
        })),
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'transcript'}.docx`;
    a.click();
    toast.success("Exported as .docx");
  };

  const exportPdf = () => {
    const text = getTranscriptText();
    const doc = new jsPDF();

    // Simple word wrap
    const splitText = doc.splitTextToSize(text, 180);
    let y = 10;
    doc.setFontSize(12);

    splitText.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(line, 10, y);
      y += 7;
    });

    doc.save(`${fileName || 'transcript'}.pdf`);
    toast.success("Exported as .pdf");
  };

  return (
    <main className="min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            VoxText
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
                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Audio Source</label>
                <AudioUploader
                  onAudioLoaded={(buffer, name) => {
                    setAudioData(buffer);
                    setFileName(name);
                    toast.success("Audio loaded successfully!");
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
                  <p className="text-xs text-gray-500 truncate">{progress.file}</p>
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

              {/* Status Log */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2 max-h-40 overflow-y-auto">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status Log</p>
                <div className="space-y-1">
                  {statusLog.length === 0 && <p className="text-xs text-gray-600 italic">Waiting for activity...</p>}
                  {statusLog.map((log, i) => (
                    <p key={i} className="text-xs text-gray-400 font-mono">{log}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Output */}
            <div className="w-full lg:w-2/3 h-full min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Transcript
                </h2>
                {transcript && (
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-sm font-medium text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>

                    {showExportMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                          <button onClick={exportTxt} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                            <FileCode className="w-4 h-4" /> Text (.txt)
                          </button>
                          <button onClick={exportDocx} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                            <File className="w-4 h-4" /> Word (.docx)
                          </button>
                          <button onClick={exportPdf} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                            <FileType className="w-4 h-4" /> PDF (.pdf)
                          </button>
                        </div>
                      </>
                    )}
                  </div>
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
                  <div className="whitespace-pre-wrap animate-in fade-in duration-500">{transcript.text}</div>
                )}

                {transcript && Array.isArray(transcript.chunks) && (
                  <div className="space-y-2">
                    {transcript.chunks.map((chunk: any, i: number) => (
                      <div key={i} className="flex gap-4 hover:bg-white/5 p-2 rounded transition-colors group animate-in slide-in-from-bottom-2 fade-in duration-300">
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
