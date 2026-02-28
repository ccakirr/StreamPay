"use client";

import { ExternalLink, ArrowUpRight, Clock, Zap, TrendingUp, Filter } from "lucide-react";
import { WatchSession } from "@/lib/web3";
import { shortenHash } from "@/lib/mockData";
import { useState } from "react";

interface TransactionsPageProps {
    sessions: WatchSession[];
}

export default function TransactionsPage({ sessions }: TransactionsPageProps) {
    const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");

    const filteredSessions = filter === "all"
        ? sessions
        : sessions.filter((s) => s.status === filter);

    const totalSpent = sessions
        .filter((s) => s.status === "completed")
        .reduce((sum, s) => sum + s.totalCost, 0);

    const totalWatchTime = sessions.reduce((sum, s) => sum + s.totalSeconds, 0);

    const totalTx = sessions.filter((s) => s.status === "completed").length;

    const formatDuration = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="px-6 lg:px-12 pt-24 pb-20">
            <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
            <p className="text-white/40 text-sm mb-8">
                All your watch session payments on Monad Testnet
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-4 w-4 text-[#836ef9]" />
                        <span className="text-xs text-white/40 uppercase tracking-wider">
                            Total Spent
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold font-mono text-white">
                            {totalSpent.toFixed(4)}
                        </span>
                        <span className="text-sm text-white/40">MON</span>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-[#836ef9]" />
                        <span className="text-xs text-white/40 uppercase tracking-wider">
                            Total Watch Time
                        </span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">
                        {formatDuration(totalWatchTime)}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-[#836ef9]" />
                        <span className="text-xs text-white/40 uppercase tracking-wider">
                            Transactions
                        </span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">
                        {totalTx}
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
                <Filter className="h-4 w-4 text-white/40" />
                {(["all", "completed", "pending", "failed"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-xs rounded-full transition-all cursor-pointer capitalize ${
                            filter === f
                                ? "bg-[#836ef9] text-white"
                                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                        }`}
                    >
                        {f} ({f === "all" ? sessions.length : sessions.filter((s) => s.status === f).length})
                    </button>
                ))}
            </div>

            {/* Transactions List */}
            {filteredSessions.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-8 w-8 text-white/20" />
                    </div>
                    <h3 className="text-lg font-medium text-white/40 mb-1">
                        {sessions.length === 0
                            ? "No transactions yet"
                            : "No matching transactions"}
                    </h3>
                    <p className="text-sm text-white/20">
                        {sessions.length === 0
                            ? "Start watching content to see your payment history"
                            : "Try a different filter"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredSessions.map((session, i) => (
                        <div
                            key={`${session.txHash}-${i}`}
                            className={`border rounded-xl p-5 transition-all hover:bg-white/[0.03] ${
                                session.status === "failed"
                                    ? "bg-red-500/5 border-red-500/20"
                                    : session.status === "pending"
                                    ? "bg-yellow-500/5 border-yellow-500/20"
                                    : "bg-white/[0.02] border-white/10"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-base font-medium text-white truncate">
                                            {session.contentTitle}
                                        </h3>
                                        <span
                                            className={`flex-shrink-0 text-[10px] px-2.5 py-0.5 rounded-full font-mono ${
                                                session.status === "completed"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : session.status === "pending"
                                                    ? "bg-yellow-500/20 text-yellow-400 animate-pulse"
                                                    : "bg-red-500/20 text-red-400"
                                            }`}
                                        >
                                            {session.status === "completed"
                                                ? "Confirmed"
                                                : session.status === "pending"
                                                ? "Pending..."
                                                : "Failed"}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                                        <div className="flex items-center gap-1.5 text-white/40">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>
                                                {formatDuration(session.totalSeconds)} watched
                                            </span>
                                        </div>
                                        <div className="text-white/30">
                                            {formatDate(session.startTime)}
                                        </div>
                                    </div>

                                    {session.txHash && session.txHash !== "FAILED" && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs font-mono text-white/20">
                                                TX: {shortenHash(session.txHash)}
                                            </span>
                                            {session.explorerUrl && (
                                                <a
                                                    href={session.explorerUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-[#836ef9] hover:text-[#836ef9]/80 transition-colors"
                                                >
                                                    View on Explorer
                                                    <ArrowUpRight className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <div className="text-lg font-bold font-mono text-[#836ef9]">
                                        -{session.totalCost.toFixed(4)}
                                    </div>
                                    <div className="text-xs text-white/30">MON</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
