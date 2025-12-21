'use client';

import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const MODELS = [
    { id: 'Xenova/whisper-tiny', name: 'Tiny (Fastest, ~40MB)', description: 'Good for clear audio, very fast.' },
    { id: 'Xenova/whisper-base', name: 'Base (Balanced, ~80MB)', description: 'Better accuracy, reasonable size.' },
    { id: 'Xenova/whisper-small', name: 'Small (Accurate, ~250MB)', description: 'High accuracy, slower download.' },
];

interface ModelSelectorProps {
    currentModel: string;
    onModelChange: (model: string) => void;
    disabled?: boolean;
}

export function ModelSelector({ currentModel, onModelChange, disabled }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selected = MODELS.find(m => m.id === currentModel) || MODELS[0];

    return (
        <div className="relative">
            <button
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full lg:w-80 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
                <div>
                    <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Model</span>
                    <div className="text-white font-medium mt-0.5">{selected.name}</div>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full mt-2 w-full lg:w-96 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onModelChange(model.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3",
                                    currentModel === model.id && "bg-white/5"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 mt-1 rounded-full border border-white/20 flex items-center justify-center",
                                    currentModel === model.id && "border-blue-500 bg-blue-500"
                                )}>
                                    {currentModel === model.id && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{model.name}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{model.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
