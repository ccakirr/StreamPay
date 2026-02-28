"use client";

import { useState, useCallback } from "react";
import TopBar from "@/components/TopBar";
import VideoPlayer from "@/components/VideoPlayer";
import BalanceCounter from "@/components/BalanceCounter";
import TransactionFeed, { Transaction } from "@/components/TransactionFeed";
import { Separator } from "@/components/ui/separator";
import { startPaymentStream, stopPaymentStream } from "@/lib/web3";

const INITIAL_BALANCE = 10;
const TX_COST = 0.0001;

export default function StreamPayDemo() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [balance, setBalance] = useState(INITIAL_BALANCE);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const getTimestamp = (): string => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
                .getMilliseconds()
                .toString()
                .padStart(3, "0")}`;
    };

    const handleTx = useCallback((hash: string) => {
        setBalance((prev) => {
            const newBalance = Math.max(prev - TX_COST, 0);
            if (newBalance <= 0) {
                stopPaymentStream();
                setIsPlaying(false);
            }
            return parseFloat(newBalance.toFixed(4));
        });
        setTransactions((prev) => [
            ...prev,
            { hash, timestamp: getTimestamp() },
        ]);
    }, []);

    const handlePlay = useCallback(async () => {
        if (balance <= 0) return;
        setIsPlaying(true);
        await startPaymentStream(handleTx);
    }, [balance, handleTx]);

    const handlePause = useCallback(async () => {
        setIsPlaying(false);
        await stopPaymentStream();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">
            <TopBar isPlaying={isPlaying} />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - Video Player & Balance */}
                <div className="w-1/2 flex flex-col gap-4 p-6 overflow-y-auto">
                    <VideoPlayer
                        isPlaying={isPlaying}
                        onPlay={handlePlay}
                        onPause={handlePause}
                    />
                    <BalanceCounter balance={balance} />
                </div>

                {/* Glowing Divider */}
                <div className="relative flex items-center">
                    <Separator
                        orientation="vertical"
                        className="h-full w-px bg-gradient-to-b from-transparent via-[#836ef9] to-transparent"
                    />
                    <div className="absolute inset-0 w-px bg-[#836ef9]/30 blur-md" />
                    <div className="absolute inset-0 w-px bg-[#836ef9]/20 blur-xl" />
                </div>

                {/* Right Panel - Transaction Feed */}
                <div className="w-1/2 p-6 overflow-hidden flex flex-col">
                    <TransactionFeed
                        transactions={transactions}
                        isPlaying={isPlaying}
                    />
                </div>
            </div>
        </div>
    );
}
