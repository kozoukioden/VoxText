
import { pipeline, env } from '@xenova/transformers';

// Skip local model checks since we are running in the browser
env.allowLocalModels = false;
env.useBrowserCache = true;
// env.backends.onnx.wasm.numThreads = 1;

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny'; // Default model ID fixed
    static instance: any = null;

    static async getInstance(progress_callback: any = null, modelName: any = null) {
        if (modelName && modelName !== this.model) {
            this.instance = null; // Reset if model changes
            this.model = modelName;
        }

        if (this.instance === null) {
            this.instance = pipeline(this.task as any, this.model, {
                progress_callback
            });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { type, data } = event.data;

    if (type === 'load') {
        try {
            await PipelineSingleton.getInstance((x: any) => {
                self.postMessage({ type: 'download', data: x });
            }, data?.model); // Pass model name if provided
            self.postMessage({ type: 'ready' });
        } catch (error: any) {
            console.error("Worker Load Error:", error);
            self.postMessage({ type: 'error', data: error?.message || "Unknown error (load)" });
        }
    } else if (type === 'transcribe') {
        try {
            const transcriber = await PipelineSingleton.getInstance(null, data.model); // Ensure correct model is loaded

            // data.audio should be Float32Array or similar
            // options can include timestamps, language, etc.
            const output = await transcriber(data.audio, {
                ...data.options,
                callback_function: (x: any) => {
                    // Sanitize data to avoid DataCloneError if x contains non-serializable objects
                    if (x && typeof x === 'object') {
                        // Only send text if available, or simple serializable properties
                        const safeData = {
                            text: x.text || "",
                            // timestamps: x.chunks // timestamps might be complex, let's skip for partial updates to be safe
                        };
                        self.postMessage({ type: 'update', data: safeData });
                    }
                }
            });

            self.postMessage({ type: 'complete', data: output });
        } catch (error: any) {
            console.error("Worker Transcribe Error:", error);
            self.postMessage({ type: 'error', data: error?.message || "Unknown error (transcribe)" });
        }
    }
});
