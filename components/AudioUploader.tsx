'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileAudio, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AudioUploaderProps {
    onAudioLoaded: (audioBuffer: AudioBuffer, fileName: string) => void;
}

export function AudioUploader({ onAudioLoaded }: AudioUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [decoding, setDecoding] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(async (file: File) => {
        setDecoding(true);
        setFileName(file.name);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000 // Whisper expects 16k
            });
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            onAudioLoaded(audioBuffer, file.name);
        } catch (error) {
            console.error("Error decoding audio", error);
            toast.error("Error decoding audio file. Please try another format.");
            setFileName(null);
        } finally {
            setDecoding(false);
        }
    }, [onAudioLoaded]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            processFile(file);
        } else {
            toast.error('Please drop an audio file.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const triggerFileInput = () => {
        inputRef.current?.click();
    };

    if (fileName) {
        return (
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl animate-in fade-in duration-300">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <FileAudio className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="font-medium text-white truncate max-w-[200px]">{fileName}</p>
                        <p className="text-sm text-gray-400">{decoding ? 'Decoding audio...' : 'Ready to transcribe'}</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setFileName(null);
                        if (inputRef.current) inputRef.current.value = '';
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>
        );
    }

    return (
        <div
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden touch-manipulation",
                isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5"
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex flex-col items-center gap-4 text-center p-6 pointer-events-none">
                <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-black/20">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                    <p className="text-lg font-medium text-white group-hover:text-blue-200 transition-colors">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        MP3, WAV, M4A (Unlimited duration)
                    </p>
                </div>
            </div>
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
                onChange={handleFileChange}
            />
        </div>
    );
}
