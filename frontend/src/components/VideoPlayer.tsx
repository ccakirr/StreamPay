"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, X, Volume2, Maximize, ArrowLeft } from "lucide-react";
import { ContentItem, COST_PER_SECOND } from "@/lib/mockData";
import Image from "next/image";

interface VideoPlayerProps {
    content: ContentItem;
    onClose: (totalSeconds: number, totalCost: number) => void;
    balance: number;
    onBalanceTick: (newBalance: number) => void;
}

export default function VideoPlayer({
    content,
    onClose,
    balance,
    onBalanceTick,
}: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [secondsWatched, setSecondsWatched] = useState(0);
    const [sessionCost, setSessionCost] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const balanceRef = useRef(balance);

    // Keep balance ref in sync
    useEffect(() => {
        balanceRef.current = balance;
    }, [balance]);

    // Session ticker
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                if (balanceRef.current <= COST_PER_SECOND) {
                    // Out of funds
                    setIsPlaying(false);
                    return;
                }
                setSecondsWatched((prev) => prev + 1);
                setSessionCost((prev) => {
                    const newCost = parseFloat((prev + COST_PER_SECOND).toFixed(4));
                    return newCost;
                });
                const newBalance = parseFloat((balanceRef.current - COST_PER_SECOND).toFixed(4));
                onBalanceTick(newBalance);
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
    }, [isPlaying, onBalanceTick]);

    // Auto-hide controls
    const resetControlsTimer = useCallback(() => {
        setShowControls(true);
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    }, [isPlaying]);

    useEffect(() => {
        resetControlsTimer();
        return () => {
            if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        };
    }, [isPlaying, resetControlsTimer]);

    const handleToggle = () => {
        if (!isPlaying && balance <= COST_PER_SECOND) return;
        setIsPlaying(!isPlaying);
    };

    const handleClose = () => {
        setIsPlaying(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        onClose(secondsWatched, sessionCost);
    };

    const formatTime = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // Calculate cost display color
    const getCostColor = () => {
        if (sessionCost > 1) return "text-red-400";
        if (sessionCost > 0.5) return "text-yellow-400";
        return "text-emerald-400";
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black"
            onMouseMove={resetControlsTimer}
        >
            {/* Video Background */}
            <div className="absolute inset-0">
                <Image
                    src={content.image}
                    alt={content.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${content.thumbnail} opacity-30`} />
                <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-white/10"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 3}s`,
                            }}
                        />
                    ))}
                </div>
                {isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-96 h-96 rounded-full bg-white/5 blur-3xl animate-pulse" />
                    </div>
                )}
            </div>

            {/* Center Play/Pause (always clickable) */}
            <button
                onClick={handleToggle}
                className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
            >
                {(!isPlaying || showControls) && (
                    <div
                        className={`w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:scale-110 ${
                            isPlaying ? "opacity-60" : "opacity-100"
                        }`}
                    >
                        {isPlaying ? (
                            <Pause className="h-8 w-8 text-white" />
                        ) : (
                            <Play className="h-8 w-8 text-white ml-1" />
                        )}
                    </div>
                )}
            </button>

            {/* Top Controls */}
            <div
                className={`absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-500 ${
                    showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            >
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="h-6 w-6" />
                        <span className="text-lg font-medium">Back to Browse</span>
                    </button>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Bottom Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-500 ${
                    showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            >
                {/* Progress bar */}
                <div className="px-6 mb-2">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden group cursor-pointer hover:h-2 transition-all">
                        <div
                            className="h-full bg-[#836ef9] rounded-full transition-all duration-1000"
                            style={{
                                width: `${Math.min((secondsWatched / 3600) * 100, 100)}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between px-6 pb-6">
                    {/* Left: Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleToggle}
                            className="text-white hover:text-white/80 transition-colors cursor-pointer"
                        >
                            {isPlaying ? (
                                <Pause className="h-7 w-7" />
                            ) : (
                                <Play className="h-7 w-7" />
                            )}
                        </button>
                        <button className="text-white/60 hover:text-white transition-colors cursor-pointer">
                            <Volume2 className="h-6 w-6" />
                        </button>
                        <span className="text-sm text-white/60 font-mono">
                            {formatTime(secondsWatched)}
                        </span>
                    </div>

                    {/* Center: Title */}
                    <div className="text-center">
                        <h3 className="text-white font-medium text-sm">{content.title}</h3>
                    </div>

                    {/* Right: Session Cost */}
                    <div className="flex items-center gap-4">
                        {/* Session cost meter */}
                        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
                            <div className="text-right">
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">Session Cost</div>
                                <div className={`text-lg font-bold font-mono ${getCostColor()} transition-colors`}>
                                    {sessionCost.toFixed(4)}
                                    <span className="text-xs text-white/30 ml-1">MON</span>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-right">
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">Balance</div>
                                <div className="text-sm font-mono text-white/70">
                                    {balance.toFixed(4)}
                                    <span className="text-xs text-white/30 ml-1">MON</span>
                                </div>
                            </div>
                        </div>

                        <button className="text-white/60 hover:text-white transition-colors cursor-pointer">
                            <Maximize className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Live session indicator */}
            {isPlaying && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                    <div className={`flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10 transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0"}`}>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
                            Live Session
                        </span>
                        <span className="text-xs font-mono text-[#836ef9]">
                            -{COST_PER_SECOND} MON/s
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
