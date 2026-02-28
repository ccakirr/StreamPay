"use client";

import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TopBarProps {
    isPlaying: boolean;
}

export default function TopBar({ isPlaying }: TopBarProps) {
    return (
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Zap className="h-6 w-6 text-[#836ef9] drop-shadow-[0_0_8px_rgba(131,110,249,0.6)]" />
                </div>
                <span className="text-xl font-bold font-mono tracking-tight text-white">
                    Stream<span className="text-[#836ef9]">Pay</span>
                </span>
            </div>

            {/* Center: Badges */}
            <div className="flex items-center gap-3">
                <Badge
                    variant="outline"
                    className="border-[#836ef9]/50 text-[#836ef9] bg-[#836ef9]/10 font-mono text-xs"
                >
                    Monad Testnet
                </Badge>
                <Badge
                    variant="outline"
                    className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 font-mono text-xs"
                >
                    10,000 TPS
                </Badge>
                <Badge
                    variant="outline"
                    className={`font-mono text-xs transition-all duration-300 ${isPlaying
                            ? "border-red-500/50 text-red-400 bg-red-500/10 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                            : "border-zinc-600 text-zinc-500 bg-zinc-800/50"
                        }`}
                >
                    <span
                        className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isPlaying ? "bg-red-500 animate-pulse" : "bg-zinc-600"
                            }`}
                    />
                    LIVE
                </Badge>
            </div>

            {/* Right: Connect Wallet */}
            <Button
                variant="outline"
                className="font-mono text-xs border-[#836ef9]/50 text-[#836ef9] hover:bg-[#836ef9]/20 hover:text-white hover:border-[#836ef9] transition-all duration-300 cursor-pointer"
            >
                Connect Wallet
            </Button>
        </header>
    );
}
