"use client";

import { X, Play, Clock, Star } from "lucide-react";
import { ContentItem } from "@/lib/mockData";
import Image from "next/image";
import { useEffect } from "react";

interface ContentModalProps {
    content: ContentItem;
    onClose: () => void;
    onPlay: (content: ContentItem) => void;
}

export default function ContentModal({ content, onClose, onPlay }: ContentModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl bg-[#181818] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                {/* Hero Image */}
                <div className="relative aspect-video">
                    <Image
                        src={content.image}
                        alt={content.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 768px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/60 via-transparent to-transparent" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#181818]/80 hover:bg-[#181818] flex items-center justify-center transition-colors cursor-pointer z-10"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>

                    {/* Title over image */}
                    <div className="absolute bottom-6 left-6 right-6">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            {content.title}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    onPlay(content);
                                    onClose();
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-semibold rounded hover:bg-white/80 transition-all cursor-pointer"
                            >
                                <Play className="h-5 w-5 fill-black" />
                                Play
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="p-6 space-y-4">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-emerald-400 font-semibold">
                            {content.match}% Match
                        </span>
                        <span className="text-white/60">{content.year}</span>
                        <span className="border border-white/20 px-1.5 py-0.5 text-xs rounded text-white/50">
                            HD
                        </span>
                        <div className="flex items-center gap-1 text-white/60">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{content.duration}</span>
                        </div>
                        <span className="text-[#836ef9] font-mono text-xs bg-[#836ef9]/10 border border-[#836ef9]/30 rounded px-2 py-0.5">
                            Dakikalık İzleme
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-white/70 leading-relaxed">{content.description}</p>

                    {/* Tags */}
                    <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs text-white/30">Genre:</span>
                        <span className="text-xs text-white/60 bg-white/5 border border-white/10 rounded px-2 py-0.5">
                            {content.category}
                        </span>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-[#836ef9]" />
                            <span className="text-xs text-white/40 uppercase tracking-wider">
                                StreamPay Pricing
                            </span>
                        </div>
                        <p className="text-sm text-white/50">
                            Dakikalık izleme sistemi. Sadece izlediğiniz kadar
                            bakiyenizden düşer. İzlemek için dakika yükleyin,
                            her dakika izleme = 1 dakika bakiye. Ödemeler Monad Testnet üzerinde işlenir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
