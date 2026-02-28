"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { ContentItem } from "@/lib/mockData";
import Image from "next/image";

interface ContentRowProps {
    title: string;
    items: ContentItem[];
    onPlay: (content: ContentItem) => void;
}

export default function ContentRow({ title, items, onPlay }: ContentRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.75;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="relative group/row mb-8">
            {/* Title */}
            <h2 className="text-lg font-semibold text-white mb-3 px-6 lg:px-12">
                {title}
            </h2>

            {/* Scroll Container */}
            <div className="relative">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-0 bottom-0 w-12 bg-black/50 z-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 cursor-pointer hover:bg-black/70"
                >
                    <ChevronLeft className="h-8 w-8 text-white" />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-0 bottom-0 w-12 bg-black/50 z-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 cursor-pointer hover:bg-black/70"
                >
                    <ChevronRight className="h-8 w-8 text-white" />
                </button>

                {/* Items */}
                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide px-6 lg:px-12"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex-shrink-0 w-[220px] lg:w-[260px] group/card relative"
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            {/* Card */}
                            <div
                                className={`relative aspect-video rounded overflow-hidden transition-all duration-300 cursor-pointer ${
                                    hoveredId === item.id
                                        ? "scale-110 z-20 shadow-2xl shadow-black/80"
                                        : "scale-100"
                                }`}
                                onClick={() => onPlay(item)}
                            >
                                {/* Thumbnail */}
                                <div className="absolute inset-0">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 220px, 260px"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.thumbnail} opacity-20`} />
                                    {/* Title on card */}
                                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                        <span className="text-sm font-medium text-white line-clamp-1">
                                            {item.title}
                                        </span>
                                    </div>
                                </div>

                                {/* Hover overlay */}
                                {hoveredId === item.id && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-in fade-in duration-200">
                                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                            <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Expanded Info */}
                            {hoveredId === item.id && (
                                <div className="absolute top-full left-0 right-0 bg-[#1a1a2e] rounded-b p-3 z-20 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-emerald-400 font-semibold">
                                            {item.match}% Match
                                        </span>
                                        <span className="text-xs text-white/40">
                                            {item.duration}
                                        </span>
                                        <span className="text-xs border border-white/20 px-1 py-0.5 rounded text-white/50">
                                            HD
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded">
                                            {item.category}
                                        </span>
                                        <span className="text-[10px] text-[#836ef9] font-mono">
                                            {item.costPerSecond} MON/sec
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
