import { useState, useRef, useEffect, useCallback } from 'react';

export interface TranscriberData {
    taskId: string;
    text: string;
    chunks?: { timestamp: [number, number]; text: string }[];
    isBusy: boolean;
}

export function useTranscriber() {
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState<any>(null); // Download progress
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcript, setTranscript] = useState<any>(null);
    const worker = useRef<Worker | null>(null);

    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../app/worker.ts', import.meta.url), {
                type: 'module',
            });
        }

        const onMessageReceived = (e: MessageEvent) => {
            switch (e.data.type) {
                case 'download':
                    setProgress(e.data.data);
                    break;
                case 'ready':
                    setReady(true);
                    setProgress(null);
                    break;
                case 'update':
                    // Partial update (if supported by the pipeline callback)
                    // console.log('Update:', e.data.data);
                    break;
                case 'complete':
                    setTranscript(e.data.data);
                    setIsTranscribing(false);
                    break;
                case 'error':
                    console.error('Worker error:', e.data.data);
                    setIsTranscribing(false);
                    break;
            }
        };

        worker.current.addEventListener('message', onMessageReceived);

        return () => {
            worker.current?.removeEventListener('message', onMessageReceived);
        };
    }, []);

    const start = useCallback(async (audioData: Float32Array | AudioBuffer, model: string, options: any = {}) => {
        if (worker.current) {
            setIsTranscribing(true);
            // If it's an audio buffer, we need to extract the channel data
            let audio;
            if (audioData instanceof AudioBuffer) {
                audio = audioData.getChannelData(0); // Mono
            } else {
                audio = audioData;
            }

            worker.current.postMessage({
                type: 'transcribe',
                data: { audio, model, options }
            });
        }
    }, []);

    const init = useCallback((model: string) => {
        if (worker.current) {
            worker.current.postMessage({ type: 'load', data: { model } });
        }
    }, []);

    return {
        ready,
        progress,
        isTranscribing,
        transcript,
        start,
        init
    };
}
