# VoxText 🎙️

A free, unlimited, and privacy-focused audio transcription web application running entirely in your browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Transformers.js](https://img.shields.io/badge/AI-Transformers.js-yellow)

## Features

- **🔒 Privacy First**: All transcription happens locally on your device using WebGPU/WASM. No audio is ever uploaded to a server.
- **♾️ Unlimited Duration**: Transcribe meetings, lectures, or interviews of any length (1hr+ supported).
- **💸 100% Free**: No API keys, no subscriptions, no pay-per-minute costs.
- **🧠 Model Selection**: Choose between `Tiny` (Fastest), `Base` (Balanced), and `Small` (High Accuracy) Whisper models.
- **🎨 Premium UI**: Built with Shadcn/UI, TailwindCSS, and a sleek dark mode aesthetic.
- **📂 Drag & Drop**: Easy file upload support for MP3, WAV, M4A, and more.
- **⚡ Offline Capable**: Once the model is loaded, it runs without an internet connection.

## How it Works

This application uses [Transformers.js](https://huggingface.co/docs/transformers.js) to run OpenAI's Whisper model directly in your browser via a Web Worker. This ensures the main UI remains responsive while the heavy processing happens in the background.

## Getting Started

### Prerequisites

- Node.js 18+ installed.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/kozoukioden/VoxText.git
    cd VoxText
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

This project is optimized for Vercel. Since it is a static client-side app (with a Next.js wrapper), it deploys seamlessly.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkozoukioden%2FVoxText)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Engine**: @xenova/transformers (Whisper)
- **Icons**: Lucide React

## License

MIT
