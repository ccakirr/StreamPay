"use client";

import { useState, useEffect, useRef } from "react";
import { User, Zap, Loader2, CheckCircle } from "lucide-react";

interface RegisterModalProps {
    walletAddress: string;
    onRegister: (displayName: string) => Promise<void>;
    onSkip: () => void;
}

export default function RegisterModal({
    walletAddress,
    onRegister,
    onSkip,
}: RegisterModalProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus input
        setTimeout(() => inputRef.current?.focus(), 300);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();

        if (!trimmed) {
            setError("Lütfen bir isim girin.");
            return;
        }
        if (trimmed.length < 2) {
            setError("İsim en az 2 karakter olmalı.");
            return;
        }
        if (trimmed.length > 30) {
            setError("İsim en fazla 30 karakter olabilir.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onRegister(trimmed);
            setSuccess(true);
            setTimeout(() => {
                // Modal will be closed by parent
            }, 1000);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Kayıt başarısız oldu."
            );
        } finally {
            setLoading(false);
        }
    };

    const shortenAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#181818] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white/10">
                {/* Header gradient */}
                <div className="h-1.5 bg-gradient-to-r from-[#836ef9] via-[#6b5ce7] to-[#836ef9]" />

                <div className="p-8">
                    {success ? (
                        /* Success state */
                        <div className="text-center space-y-4 py-4">
                            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto animate-in zoom-in duration-300" />
                            <h2 className="text-2xl font-bold text-white">
                                Hoş geldin, {name}! 🎬
                            </h2>
                            <p className="text-sm text-white/50">
                                StreamPay&apos;e hazırsın. İyi seyirler!
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Welcome icon */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-[#836ef9]/20 flex items-center justify-center mx-auto mb-4">
                                    <Zap className="h-8 w-8 text-[#836ef9]" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Stream<span className="text-[#836ef9]">Pay</span>&apos;e
                                    Hoş Geldiniz!
                                </h2>
                                <p className="text-sm text-white/50">
                                    İlk kez giriş yapıyorsunuz. Kendinizi tanıtın.
                                </p>
                            </div>

                            {/* Wallet info */}
                            <div className="bg-white/5 rounded-lg p-3 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#836ef9] to-[#6b5ce7] flex items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-wider">
                                        Bağlı Cüzdan
                                    </div>
                                    <div className="text-xs font-mono text-white/60">
                                        {shortenAddress(walletAddress)}
                                    </div>
                                </div>
                            </div>

                            {/* Name form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">
                                        Görünen İsim
                                    </label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setError(null);
                                        }}
                                        placeholder="İsminizi girin..."
                                        maxLength={30}
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#836ef9]/50 focus:ring-1 focus:ring-[#836ef9]/30 transition-colors disabled:opacity-50"
                                    />
                                    {error && (
                                        <p className="text-xs text-red-400 mt-1.5">
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !name.trim()}
                                    className="w-full py-3 bg-[#836ef9] hover:bg-[#7258e8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        "Başla"
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={onSkip}
                                    disabled={loading}
                                    className="w-full py-2 text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Şimdilik geç
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
