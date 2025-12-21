
import { pipeline, env } from '@xenova/transformers';

// Skip local model checks since we are running in the browser
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'openai/whisper-tiny';
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
            self.postMessage({ type: 'error', data: error.message });
        }
    } else if (type === 'transcribe') {
        try {
            const transcriber = await PipelineSingleton.getInstance(null, data.model); // Ensure correct model is loaded

            // data.audio should be Float32Array or similar
            // options can include timestamps, language, etc.
            const output = await transcriber(data.audio, {
                ...data.options,
                callback_function: (x: any) => {
                    self.postMessage({ type: 'update', data: x });
                }
            });

            self.postMessage({ type: 'complete', data: output });
        } catch (error: any) {
            self.postMessage({ type: 'error', data: error.message });
        }
    }
});
