"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BalanceCounterProps {
    balance: number;
}

const INITIAL_BALANCE = 10;

export default function BalanceCounter({ balance }: BalanceCounterProps) {
    const [isPulsing, setIsPulsing] = useState(false);
    const [prevBalance, setPrevBalance] = useState(balance);

    useEffect(() => {
        if (balance !== prevBalance) {
            setIsPulsing(true);
            setPrevBalance(balance);
            const timeout = setTimeout(() => setIsPulsing(false), 200);
            return () => clearTimeout(timeout);
        }
    }, [balance, prevBalance]);

    const percentage = (balance / INITIAL_BALANCE) * 100;

    const getProgressColor = () => {
        if (percentage > 60) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
        if (percentage > 30) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
        return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    };

    const getTextColor = () => {
        if (percentage > 60) return "text-emerald-400";
        if (percentage > 30) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <Card className="bg-black/60 border-white/10 p-6">
            <div className="space-y-4">
                {/* Label */}
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-white/50 uppercase tracking-wider">
                        Wallet Balance
                    </span>
                    <span className="font-mono text-xs text-white/30">
                        {balance > 0 ? `${((INITIAL_BALANCE - balance) / 0.001).toFixed(0)} TXs sent` : "Depleted"}
                    </span>
                </div>

                {/* Balance */}
                <div className="flex items-baseline gap-2">
                    <span
                        className={`font-mono text-5xl font-bold tracking-tight transition-all duration-150 ${getTextColor()} ${isPulsing
                            ? "scale-105 brightness-150"
                            : "scale-100 brightness-100"
                            }`}
                        style={{
                            textShadow: isPulsing
                                ? `0 0 20px currentColor, 0 0 40px currentColor`
                                : `0 0 10px currentColor`,
                            transition: "transform 150ms ease-out, filter 150ms ease-out",
                        }}
                    >
                        {balance.toFixed(4)}
                    </span>
                    <span className="font-mono text-lg text-white/40">MON</span>
                </div>

                {/* Progress bar */}
                <div className="relative">
                    <Progress value={percentage} className="h-2 bg-white/5" />
                    <div
                        className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                        style={{ width: `${Math.max(percentage, 0)}%` }}
                    />
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between font-mono text-[11px] text-white/30">
                    <span>0 MON</span>
                    <span>Rate: -0.0001 MON/TX</span>
                    <span>{INITIAL_BALANCE} MON</span>
                </div>
            </div>
        </Card>
    );
}
