"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
}

export default function VideoPlayer({
    isPlaying,
    onPlay,
    onPause,
}: VideoPlayerProps) {
    const [secondsWatched, setSecondsWatched] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setSecondsWatched((prev) => prev + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying]);

    const handleToggle = useCallback(() => {
        if (isPlaying) {
            onPause();
        } else {
            onPlay();
        }
    }, [isPlaying, onPlay, onPause]);

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <Card className="relative bg-black/60 border-white/10 overflow-hidden aspect-video flex items-center justify-center group">
            {/* Mock video background — animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111118] to-[#0d0d1a]">
                {/* Animated scan lines */}
                <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-full h-px bg-[#836ef9]/30"
                            style={{
                                top: `${12.5 * (i + 1)}%`,
                                animation: `scanline ${2 + i * 0.3}s ease-in-out infinite`,
                                animationDelay: `${i * 0.15}s`,
                            }}
                        />
                    ))}
                </div>
                {/* Center glow */}
                {isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-[#836ef9]/10 blur-3xl animate-pulse" />
                    </div>
                )}
            </div>

            {/* Play/Pause button */}
            <button
                onClick={handleToggle}
                className="relative z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_30px_rgba(131,110,249,0.4)] group-hover:opacity-100 cursor-pointer"
                style={{ opacity: isPlaying ? 0.6 : 1 }}
            >
                {isPlaying ? (
                    <Pause className="h-8 w-8 text-white" />
                ) : (
                    <Play className="h-8 w-8 text-white ml-1" />
                )}
            </button>

            {/* Seconds watched badge */}
            <Badge
                variant="outline"
                className="absolute bottom-3 right-3 font-mono text-xs border-white/20 text-white/80 bg-black/60 backdrop-blur-sm"
            >
                ⏱ {formatTime(secondsWatched)} watched
            </Badge>

            {/* Stream status indicator */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
                <div
                    className={`w-2 h-2 rounded-full ${isPlaying
                            ? "bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse"
                            : "bg-zinc-600"
                        }`}
                />
                <span className="font-mono text-[10px] text-white/60 uppercase tracking-wider">
                    {isPlaying ? "Streaming" : "Paused"}
                </span>
            </div>
        </Card>
    );
}
