"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    Play,
    Pause,
    X,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    ArrowLeft,
    SkipBack,
    SkipForward,
    Sparkles,
} from "lucide-react";
import { ContentItem } from "@/lib/mockData";
import AlternativeEnding from "@/components/AlternativeEnding";

interface VideoPlayerProps {
    content: ContentItem;
    onClose: (totalSeconds: number, minutesUsed: number) => void;
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
    const [minutesUsed, setMinutesUsed] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [showAltEnding, setShowAltEnding] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const [altVideoUrl, setAltVideoUrl] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const balanceRef = useRef(balance);

    // Keep balance ref in sync
    useEffect(() => {
        balanceRef.current = balance;
    }, [balance]);

    // Session billing ticker
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                const costPerSecond = 1 / 60; // 1 minute per 60 seconds
                if (balanceRef.current <= costPerSecond) {
                    setIsPlaying(false);
                    videoRef.current?.pause();
                    return;
                }
                setSecondsWatched((prev) => prev + 1);
                setMinutesUsed((prev) => parseFloat((prev + costPerSecond).toFixed(4)));
                const newBalance = parseFloat(
                    (balanceRef.current - costPerSecond).toFixed(4)
                );
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

    // Track fullscreen changes
    useEffect(() => {
        const handleFS = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFS);
        return () => document.removeEventListener("fullscreenchange", handleFS);
    }, []);

    // Video time update
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setVideoProgress(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setVideoDuration(videoRef.current.duration);
            setVideoReady(true);
        }
    };

    const handleTogglePlay = () => {
        if (!isPlaying && balance <= 1 / 60) return;
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
            setIsPlaying(false);
        } else {
            video.play().catch(() => {});
            setIsPlaying(true);
        }
    };

    const handleClose = () => {
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        onClose(secondsWatched, minutesUsed);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setVideoProgress(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        setMuted(vol === 0);
        if (videoRef.current) {
            videoRef.current.volume = vol;
            videoRef.current.muted = vol === 0;
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !muted;
            videoRef.current.muted = newMuted;
            setMuted(newMuted);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen();
        }
    };

    const skip = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(
                0,
                Math.min(videoRef.current.currentTime + seconds, videoDuration)
            );
        }
    };

    const formatTime = (seconds: number): string => {
        const s = Math.floor(seconds);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, "0")}:${sec
                .toString()
                .padStart(2, "0")}`;
        }
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    const handlePlayAlternative = (url: string) => {
        setAltVideoUrl(url);
        setShowAltEnding(false);
        setVideoEnded(false);
        setIsPlaying(false);
        // The alt video will load via its own element
    };

    const handleAltVideoPlay = () => {
        const altVideo = document.getElementById("alt-video") as HTMLVideoElement;
        if (altVideo) {
            altVideo.play().catch(() => {});
        }
    };

    const handleCloseAltVideo = () => {
        setAltVideoUrl(null);
    };

    const getCostColor = () => {
        if (minutesUsed > 30) return "text-red-400";
        if (minutesUsed > 10) return "text-yellow-400";
        return "text-emerald-400";
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-black"
            onMouseMove={resetControlsTimer}
        >
            {/* Actual Video Element */}
            <video
                ref={videoRef}
                src={content.videoUrl}
                className="absolute inset-0 w-full h-full object-contain bg-black"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                    setIsPlaying(false);
                    setVideoEnded(true);
                }}
                playsInline
                preload="auto"
            />

            {/* Loading state */}
            {!videoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-2 border-[#836ef9] border-t-transparent rounded-full animate-spin" />
                        <span className="text-white/50 text-sm">Loading video...</span>
                    </div>
                </div>
            )}

            {/* Center Play/Pause (click area) */}
            <button
                onClick={handleTogglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
            >
                {(!isPlaying || showControls) && videoReady && (
                    <div
                        className={`w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-black/60 hover:scale-110 ${
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
                {/* Seek bar */}
                <div className="px-6 mb-2">
                    <input
                        type="range"
                        min={0}
                        max={videoDuration || 100}
                        step={0.1}
                        value={videoProgress}
                        onChange={handleSeek}
                        className="w-full h-1 appearance-none cursor-pointer rounded-full bg-white/20 accent-[#836ef9] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#836ef9] hover:[&::-webkit-slider-thumb]:w-4 hover:[&::-webkit-slider-thumb]:h-4 transition-all"
                        style={{
                            background: `linear-gradient(to right, #836ef9 ${
                                (videoProgress / (videoDuration || 1)) * 100
                            }%, rgba(255,255,255,0.2) ${
                                (videoProgress / (videoDuration || 1)) * 100
                            }%)`,
                        }}
                    />
                </div>

                <div className="flex items-center justify-between px-6 pb-6">
                    {/* Left: Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTogglePlay}
                            className="text-white hover:text-white/80 transition-colors cursor-pointer"
                        >
                            {isPlaying ? (
                                <Pause className="h-7 w-7" />
                            ) : (
                                <Play className="h-7 w-7" />
                            )}
                        </button>
                        <button
                            onClick={() => skip(-10)}
                            className="text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                            <SkipBack className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => skip(10)}
                            className="text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                            <SkipForward className="h-5 w-5" />
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2 group/vol">
                            <button
                                onClick={toggleMute}
                                className="text-white/60 hover:text-white transition-colors cursor-pointer"
                            >
                                {muted ? (
                                    <VolumeX className="h-6 w-6" />
                                ) : (
                                    <Volume2 className="h-6 w-6" />
                                )}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={muted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover/vol:w-20 transition-all duration-300 h-1 appearance-none cursor-pointer rounded-full bg-white/20 accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                            />
                        </div>

                        <span className="text-sm text-white/60 font-mono">
                            {formatTime(videoProgress)} / {formatTime(videoDuration)}
                        </span>
                    </div>

                    {/* Center: Title + AI Button */}
                    <div className="text-center hidden md:flex items-center gap-3">
                        <h3 className="text-white font-medium text-sm">{content.title}</h3>
                        <button
                            onClick={() => setShowAltEnding(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#836ef9]/20 hover:bg-[#836ef9]/30 border border-[#836ef9]/40 rounded-full transition-all cursor-pointer group"
                            title="AI Alternatif Son"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-[#836ef9] group-hover:text-[#a58aff] transition-colors" />
                            <span className="text-xs text-[#836ef9] group-hover:text-[#a58aff] font-medium transition-colors">
                                AI Son
                            </span>
                        </button>
                    </div>

                    {/* Right: Session Cost + Fullscreen */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
                            <div className="text-right">
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">
                                    Kullanılan
                                </div>
                                <div
                                    className={`text-lg font-bold font-mono ${getCostColor()} transition-colors`}
                                >
                                    {minutesUsed.toFixed(2)}
                                    <span className="text-xs text-white/30 ml-1">dk</span>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-right">
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">
                                    Kalan Bakiye
                                </div>
                                <div className="text-sm font-mono text-white/70">
                                    {balance.toFixed(2)}
                                    <span className="text-xs text-white/30 ml-1">dk</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={toggleFullscreen}
                            className="text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                            {isFullscreen ? (
                                <Minimize className="h-5 w-5" />
                            ) : (
                                <Maximize className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Live session indicator */}
            {isPlaying && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                    <div
                        className={`flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10 transition-opacity duration-500 ${
                            showControls ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
                            Live Session
                        </span>
                        <span className="text-xs font-mono text-[#836ef9]">
                            -1 dk/dk
                        </span>
                    </div>
                </div>
            )}

            {/* Video Ended Overlay - AI Ending Prompt */}
            {videoEnded && !showAltEnding && !altVideoUrl && (
                <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-5 text-center px-6">
                        <Sparkles className="h-10 w-10 text-[#836ef9]" />
                        <h3 className="text-xl font-bold text-white">
                            Video sona erdi!
                        </h3>
                        <p className="text-sm text-white/50 max-w-sm">
                            Bu hikayeyi farklı bir sonla tekrar canlandırmak ister misin?
                            AI ile alternatif bir final oluştur.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAltEnding(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#836ef9] hover:bg-[#7258e8] text-white font-semibold rounded-lg transition-all cursor-pointer shadow-[0_0_30px_rgba(131,110,249,0.3)]"
                            >
                                <Sparkles className="h-4 w-4" />
                                AI Alternatif Son
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white/70 rounded-lg transition-all cursor-pointer"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alternative Ending Modal */}
            {showAltEnding && (
                <AlternativeEnding
                    videoUrl={content.videoUrl}
                    contentTitle={content.title}
                    onPlayAlternative={handlePlayAlternative}
                    onClose={() => setShowAltEnding(false)}
                />
            )}

            {/* Alternative Video Player Overlay */}
            {altVideoUrl && (
                <div className="absolute inset-0 z-[120] bg-black flex flex-col">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCloseAltVideo}
                                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="text-sm">Orijinal Videoya Dön</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 bg-[#836ef9]/20 border border-[#836ef9]/40 rounded-full px-3 py-1">
                            <Sparkles className="h-3.5 w-3.5 text-[#836ef9]" />
                            <span className="text-xs text-[#836ef9] font-medium">AI Alternatif Son</span>
                        </div>
                    </div>
                    <video
                        id="alt-video"
                        src={altVideoUrl}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        playsInline
                    />
                </div>
            )}

            {/* Session Timer (always visible) */}
            <div className="absolute top-6 right-6 z-20">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">
                        Watch Time
                    </div>
                    <div className="text-sm font-mono text-white/80">
                        {formatTime(secondsWatched)}
                    </div>
                </div>
            </div>
        </div>
    );
}
