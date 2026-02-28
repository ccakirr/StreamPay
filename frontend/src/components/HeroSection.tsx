"use client";

import { Play, Info } from "lucide-react";
import { ContentItem } from "@/lib/mockData";
import Image from "next/image";

interface HeroSectionProps {
    content: ContentItem;
    onPlay: (content: ContentItem) => void;
    onMoreInfo: (content: ContentItem) => void;
}

export default function HeroSection({ content, onPlay, onMoreInfo }: HeroSectionProps) {
    return (
        <div className="relative w-full h-[85vh] min-h-[500px]">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={content.image}
                    alt={content.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                {/* Color overlay for branding */}
                <div className={`absolute inset-0 bg-gradient-to-br ${content.thumbnail} opacity-40`} />
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 pb-20">
                <div className="max-w-2xl space-y-4">
                    {/* Badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#836ef9] bg-[#836ef9]/10 border border-[#836ef9]/30 rounded px-2 py-0.5 uppercase tracking-wider">
                            StreamPay Original
                        </span>
                        <span className="text-xs text-white/50 font-mono">
                            {content.match}% Match
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
                        {content.title}
                    </h1>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-sm text-white/60">
                        <span className="text-emerald-400 font-semibold">{content.match}% Match</span>
                        <span>{content.year}</span>
                        <span className="border border-white/20 px-1.5 py-0.5 text-xs rounded">HD</span>
                        <span>{content.duration}</span>
                        <span className="text-[#836ef9] font-mono text-xs">
                            Dakikalık izleme
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-base text-white/70 max-w-lg leading-relaxed">
                        {content.description}
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={() => onPlay(content)}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-black font-semibold rounded hover:bg-white/80 transition-all duration-200 cursor-pointer text-lg"
                        >
                            <Play className="h-6 w-6 fill-black" />
                            Play
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded hover:bg-white/30 transition-all duration-200 cursor-pointer text-lg"
                            onClick={() => onMoreInfo(content)}
                        >
                            <Info className="h-6 w-6" />
                            More Info
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
