"use client";

import { useState } from "react";
import {
    Sparkles,
    Smile,
    Skull,
    Shuffle,
    Loader2,
    X,
    Play,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

type EndingType = "happy" | "dark" | "plot-twist";

interface EndingOption {
    type: EndingType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
}

const ENDING_OPTIONS: EndingOption[] = [
    {
        type: "happy",
        label: "Happy Ending",
        description: "Mutlu bir sonla bitir",
        icon: <Smile className="h-5 w-5" />,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
    },
    {
        type: "dark",
        label: "Dark Ending",
        description: "Karanlık ve dramatik bir son",
        icon: <Skull className="h-5 w-5" />,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
    },
    {
        type: "plot-twist",
        label: "Plot Twist",
        description: "Beklenmedik bir dönüş",
        icon: <Shuffle className="h-5 w-5" />,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
    },
];

interface AlternativeEndingResult {
    script: {
        title: string;
        tone: string;
        script: string;
        emotion_intensity: number;
    };
    video: {
        url: string;
        content_type: string;
        file_name: string;
        file_size: number;
    };
}

interface AlternativeEndingProps {
    videoUrl: string;
    contentTitle: string;
    onPlayAlternative: (videoUrl: string) => void;
    onClose: () => void;
}

export default function AlternativeEnding({
    videoUrl,
    contentTitle,
    onPlayAlternative,
    onClose,
}: AlternativeEndingProps) {
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<EndingType | null>(null);
    const [result, setResult] = useState<AlternativeEndingResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scriptExpanded, setScriptExpanded] = useState(false);

    const handleGenerate = async (type: EndingType) => {
        setSelectedType(type);
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/alternative-ending", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ video_url: videoUrl, ending_type: type }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to generate alternative ending");
            }

            setResult(data.data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Alternatif son oluşturulamadı"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={!loading ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#836ef9]/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-[#836ef9]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                AI Alternatif Son
                            </h2>
                            <p className="text-xs text-white/40">
                                {contentTitle} için farklı bir finale ne dersin?
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <X className="h-4 w-4 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!result && !loading && (
                        <>
                            <p className="text-sm text-white/50 mb-4">
                                Bir son türü seç, AI sana yeni bir senaryo ve video oluştursun:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {ENDING_OPTIONS.map((option) => (
                                    <button
                                        key={option.type}
                                        onClick={() => handleGenerate(option.type)}
                                        className={`flex flex-col items-center gap-3 p-5 rounded-xl border ${option.borderColor} ${option.bgColor} hover:bg-opacity-20 transition-all cursor-pointer group`}
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-full ${option.bgColor} flex items-center justify-center ${option.color} group-hover:scale-110 transition-transform`}
                                        >
                                            {option.icon}
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className={`text-sm font-semibold ${option.color}`}
                                            >
                                                {option.label}
                                            </div>
                                            <div className="text-[11px] text-white/40 mt-1">
                                                {option.description}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-2 border-[#836ef9]/30 border-t-[#836ef9] animate-spin" />
                                <Sparkles className="h-6 w-6 text-[#836ef9] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-semibold">
                                    AI Yeni Son Oluşturuyor...
                                </h3>
                                <p className="text-sm text-white/40 mt-1">
                                    {selectedType === "happy" && "Mutlu bir son hazırlanıyor"}
                                    {selectedType === "dark" && "Karanlık bir son yazılıyor"}
                                    {selectedType === "plot-twist" &&
                                        "Beklenmedik bir twist yaratılıyor"}
                                </p>
                                <p className="text-xs text-white/25 mt-3">
                                    Bu işlem 30-60 saniye sürebilir
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
                            <p className="text-sm text-red-400">{error}</p>
                            <button
                                onClick={() => {
                                    setError(null);
                                    setSelectedType(null);
                                }}
                                className="text-xs text-[#836ef9] hover:underline mt-2"
                            >
                                Tekrar dene
                            </button>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="space-y-4">
                            {/* Script Info */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-white font-semibold text-sm">
                                            {result.script.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-[#836ef9]/20 text-[#836ef9] px-2 py-0.5 rounded-full">
                                                {result.script.tone}
                                            </span>
                                            <span className="text-[10px] text-white/30">
                                                Intensity: {result.script.emotion_intensity}/5
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setScriptExpanded(!scriptExpanded)}
                                        className="text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                                    >
                                        {scriptExpanded ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                {scriptExpanded && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                            {result.script.script}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {/* Video Preview + Play */}
                            <div className="relative rounded-xl overflow-hidden border border-white/10">
                                <video
                                    src={result.video.url}
                                    className="w-full aspect-video object-cover bg-black"
                                    preload="metadata"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <button
                                        onClick={() => onPlayAlternative(result.video.url)}
                                        className="w-16 h-16 rounded-full bg-[#836ef9] hover:bg-[#7258e8] flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-[0_0_30px_rgba(131,110,249,0.4)]"
                                    >
                                        <Play className="h-7 w-7 text-white ml-1" />
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                                    <span className="text-[10px] text-white/60 font-mono">
                                        {(result.video.file_size / 1024 / 1024).toFixed(1)} MB
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onPlayAlternative(result.video.url)}
                                    className="flex-1 py-3 bg-[#836ef9] hover:bg-[#7258e8] text-white font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Play className="h-4 w-4" />
                                    Alternatif Sonu İzle
                                </button>
                                <button
                                    onClick={() => {
                                        setResult(null);
                                        setSelectedType(null);
                                        setScriptExpanded(false);
                                    }}
                                    className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white/70 rounded-lg transition-all cursor-pointer text-sm"
                                >
                                    Farklı Tür
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
