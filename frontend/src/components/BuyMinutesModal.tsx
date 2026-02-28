"use client";

import { useState, useEffect } from "react";
import { X, Clock, Zap, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { MinutePackage, MINUTE_PACKAGES } from "@/lib/mockData";

interface BuyMinutesModalProps {
    onClose: () => void;
    onBuy: (pkg: MinutePackage) => Promise<void>;
    walletBalance: number;
    minuteBalance: number;
}

export default function BuyMinutesModal({
    onClose,
    onBuy,
    walletBalance,
    minuteBalance,
}: BuyMinutesModalProps) {
    const [selectedPkg, setSelectedPkg] = useState<MinutePackage | null>(null);
    const [buying, setBuying] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !buying) onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose, buying]);

    const handleBuy = async (pkg: MinutePackage) => {
        if (walletBalance < pkg.costMON) {
            setError("Yetersiz MON bakiye. Cüzdanınıza MON yükleyin.");
            return;
        }

        setSelectedPkg(pkg);
        setBuying(true);
        setError(null);

        try {
            await onBuy(pkg);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Satın alma başarısız");
        } finally {
            setBuying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => !buying && onClose()}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-[#181818] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#836ef9]/20 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-[#836ef9]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Dakika Yükle
                            </h2>
                            <p className="text-xs text-white/40">
                                İzleme bakiyenize dakika ekleyin
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => !buying && onClose()}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4 text-white" />
                    </button>
                </div>

                {/* Current Balance */}
                <div className="px-6 pt-4 pb-2">
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <div>
                            <div className="text-[10px] text-white/40 uppercase tracking-wider">
                                Mevcut Bakiye
                            </div>
                            <div className="text-lg font-bold font-mono text-white">
                                {Math.floor(minuteBalance)}{" "}
                                <span className="text-sm text-white/40">dk</span>
                                {" "}
                                <span className="text-sm text-white/60">
                                    {Math.floor((minuteBalance % 1) * 60)
                                        .toString()
                                        .padStart(2, "0")}
                                </span>
                                <span className="text-sm text-white/40"> sn</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-white/40 uppercase tracking-wider">
                                Cüzdan
                            </div>
                            <div className="text-sm font-mono text-white/60">
                                {walletBalance.toFixed(4)} MON
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success State */}
                {success && (
                    <div className="px-6 py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-1">
                            Başarılı!
                        </h3>
                        <p className="text-sm text-white/50">
                            {selectedPkg?.minutes} dakika bakiyenize eklendi
                        </p>
                    </div>
                )}

                {/* Packages */}
                {!success && (
                    <div className="p-6 space-y-3">
                        {MINUTE_PACKAGES.map((pkg) => {
                            const canAfford = walletBalance >= pkg.costMON;
                            const isSelected = selectedPkg?.id === pkg.id && buying;

                            return (
                                <button
                                    key={pkg.id}
                                    onClick={() => handleBuy(pkg)}
                                    disabled={buying || !canAfford}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer disabled:cursor-not-allowed ${
                                        isSelected
                                            ? "bg-[#836ef9]/20 border-[#836ef9]/50"
                                            : pkg.popular
                                            ? "bg-[#836ef9]/10 border-[#836ef9]/30 hover:bg-[#836ef9]/20"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                    } ${!canAfford ? "opacity-40" : ""}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                                                pkg.popular
                                                    ? "bg-[#836ef9]/30 text-[#836ef9]"
                                                    : "bg-white/10 text-white/70"
                                            }`}
                                        >
                                            {pkg.minutes}
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">
                                                    {pkg.label}
                                                </span>
                                                {pkg.popular && (
                                                    <span className="text-[10px] bg-[#836ef9] text-white px-1.5 py-0.5 rounded-full uppercase font-bold">
                                                        Popüler
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-white/30">
                                                {(pkg.costMON / pkg.minutes).toFixed(4)} MON/dk
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isSelected ? (
                                            <Loader2 className="h-5 w-5 text-[#836ef9] animate-spin" />
                                        ) : (
                                            <div className="text-right">
                                                <div className="text-white font-bold font-mono">
                                                    {pkg.costMON}
                                                </div>
                                                <div className="text-[10px] text-white/40">
                                                    MON
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="px-6 pb-4">
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                            <span className="text-sm text-red-300">{error}</span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {!success && (
                    <div className="px-6 pb-6">
                        <div className="flex items-center gap-2 text-xs text-white/20">
                            <Zap className="h-3 w-3" />
                            <span>
                                Ödeme Monad Testnet üzerinden yapılır. Monoracle ile kaydedilir.
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
