"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { shortenHash } from "@/lib/mockData";

export interface Transaction {
    hash: string;
    timestamp: string;
}

interface TransactionFeedProps {
    transactions: Transaction[];
    isPlaying: boolean;
}

export default function TransactionFeed({
    transactions,
    isPlaying,
}: TransactionFeedProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transactions]);

    return (
        <Card className="bg-black/60 border-white/10 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${isPlaying
                            ? "bg-[#00ff41] shadow-[0_0_6px_#00ff41] animate-pulse"
                            : "bg-zinc-600"
                            }`}
                    />
                    <span className="font-mono text-xs text-white/50 uppercase tracking-wider">
                        Transaction Stream
                    </span>
                </div>
                <span className="font-mono text-[10px] text-white/30">
                    {transactions.length} TXs
                </span>
            </div>

            {/* Feed */}
            <ScrollArea className="flex-1 px-4 py-2">
                <div className="space-y-0.5">
                    {transactions.map((tx, i) => (
                        <div
                            key={`${tx.hash}-${i}`}
                            className="font-mono text-xs py-1 border-b border-white/[0.03] last:border-0 animate-in slide-in-from-bottom-1 fade-in duration-200"
                            style={{
                                color: "#00ff41",
                                textShadow: "0 0 8px rgba(0,255,65,0.4)",
                            }}
                        >
                            <span className="text-white/20">[</span>
                            <span className="text-white/40">{tx.timestamp}</span>
                            <span className="text-white/20">]</span>{" "}
                            <span className="text-white/30">TX:</span>{" "}
                            <span>{shortenHash(tx.hash)}</span>{" "}
                            <span className="text-emerald-400">✓</span>{" "}
                            <span className="text-yellow-500/80">-0.0001 MON</span>
                        </div>
                    ))}

                    {/* Pause indicator */}
                    {!isPlaying && transactions.length > 0 && (
                        <div
                            className="font-mono text-xs py-2 text-center animate-pulse"
                            style={{
                                color: "#facc15",
                                textShadow: "0 0 8px rgba(250,204,21,0.4)",
                            }}
                        >
                            [STREAM PAUSED ⏸]
                        </div>
                    )}

                    {/* Empty state */}
                    {transactions.length === 0 && (
                        <div className="py-8 text-center">
                            <span className="font-mono text-xs text-white/20">
                                Press play to start streaming transactions...
                            </span>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>
            </ScrollArea>
        </Card>
    );
}
