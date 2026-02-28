"use client";

import { useState, useCallback, useEffect } from "react";
import TopBar from "@/components/TopBar";
import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import VideoPlayer from "@/components/VideoPlayer";
import {
    ContentItem,
    contentCategories,
    featuredContent,
    shortenHash,
    allContent,
} from "@/lib/mockData";
import {
    endWatchSession,
    WatchSession,
    connectWallet,
    disconnectWallet,
    getWalletBalance,
    isMetaMaskInstalled,
    onAccountsChanged,
    onChainChanged,
    MONAD_TESTNET,
} from "@/lib/web3";
import { Wallet, Zap, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";

const INITIAL_BALANCE = 10;

export default function StreamPayDemo() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [balance, setBalance] = useState(0);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [activeContent, setActiveContent] = useState<ContentItem | null>(null);
    const [sessions, setSessions] = useState<WatchSession[]>([]);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentPending, setPaymentPending] = useState(false);

    // Listen for account/chain changes
    useEffect(() => {
        if (!isLoggedIn) return;

        const unsubAccounts = onAccountsChanged(async (accounts) => {
            if (accounts.length === 0) {
                setIsLoggedIn(false);
                setWalletAddress(null);
                setBalance(0);
            } else {
                setWalletAddress(accounts[0]);
                const bal = await getWalletBalance(accounts[0]);
                setBalance(bal);
            }
        });

        const unsubChain = onChainChanged(() => {
            // Reload on chain change
            window.location.reload();
        });

        return () => {
            unsubAccounts();
            unsubChain();
        };
    }, [isLoggedIn]);

    const handleLogin = useCallback(async () => {
        setError(null);
        setConnecting(true);
        try {
            if (!isMetaMaskInstalled()) {
                setError("MetaMask is not installed. Please install MetaMask to continue.");
                setConnecting(false);
                return;
            }
            const wallet = await connectWallet();
            setWalletAddress(wallet.address);
            setBalance(wallet.balance);
            setIsLoggedIn(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to connect wallet";
            setError(message);
        } finally {
            setConnecting(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        await disconnectWallet();
        setIsLoggedIn(false);
        setWalletAddress(null);
        setBalance(0);
    }, []);

    const handlePlay = useCallback(
        (content: ContentItem) => {
            if (balance <= 0) return;
            setActiveContent(content);
        },
        [balance]
    );

    const handleBalanceTick = useCallback((newBalance: number) => {
        setBalance(Math.max(newBalance, 0));
    }, []);

    const handleClosePlayer = useCallback(
        async (totalSeconds: number, totalCost: number) => {
            if (activeContent && totalSeconds > 0) {
                setPaymentPending(true);
                try {
                    const session = await endWatchSession(
                        activeContent.id,
                        activeContent.title,
                        totalSeconds,
                        totalCost
                    );
                    setSessions((prev) => [session, ...prev]);
                    // Refresh real balance after payment
                    if (walletAddress) {
                        const newBal = await getWalletBalance(walletAddress);
                        setBalance(newBal);
                    }
                } catch (err) {
                    console.error("Session payment error:", err);
                } finally {
                    setPaymentPending(false);
                }
            }
            setActiveContent(null);
        },
        [activeContent, walletAddress]
    );

    // Login / Connect Wallet Screen
    if (!isLoggedIn) {
        return (
            <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                {/* Background montage of content images */}
                <div className="absolute inset-0">
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 opacity-15 rotate-[-5deg] scale-110 -translate-y-8">
                        {allContent.concat(allContent).map((item, i) => (
                            <div key={`bg-${i}`} className="aspect-video relative overflow-hidden rounded">
                                <Image
                                    src={item.image}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="200px"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-transparent to-[#0a0a0a]/90" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-8 max-w-md mx-auto px-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <Zap className="h-12 w-12 text-[#836ef9] drop-shadow-[0_0_15px_rgba(131,110,249,0.6)]" />
                        <span className="text-5xl font-bold tracking-tight text-white">
                            Stream<span className="text-[#836ef9]">Pay</span>
                        </span>
                    </div>

                    {/* Tagline */}
                    <p className="text-white/50 text-center text-lg">
                        Pay only for what you watch. Powered by Monad.
                    </p>

                    {/* Network Info */}
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Wallet className="h-4 w-4 text-[#836ef9]" />
                            <span className="text-xs text-white/40 uppercase tracking-wider">
                                Monad Testnet
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-white/40">Network</span>
                                <span className="text-white/70 font-mono text-xs">Monad Testnet</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/40">Chain ID</span>
                                <span className="text-white/70 font-mono text-xs">{MONAD_TESTNET.chainIdDecimal}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/40">Currency</span>
                                <span className="text-white/70 font-mono text-xs">MON</span>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-white/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live on Monad Testnet
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-red-300">{error}</p>
                                {!isMetaMaskInstalled() && (
                                    <a
                                        href="https://metamask.io/download/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-[#836ef9] hover:underline mt-1 inline-block"
                                    >
                                        Install MetaMask →
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Connect Button */}
                    <button
                        onClick={handleLogin}
                        disabled={connecting}
                        className="w-full py-4 bg-[#836ef9] hover:bg-[#7258e8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-semibold rounded-lg transition-all duration-300 cursor-pointer shadow-[0_0_30px_rgba(131,110,249,0.3)] hover:shadow-[0_0_50px_rgba(131,110,249,0.5)] flex items-center justify-center gap-3"
                    >
                        {connecting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <Wallet className="h-5 w-5" />
                                Connect MetaMask
                            </>
                        )}
                    </button>

                    <p className="text-xs text-white/20 text-center">
                        Connects to Monad Testnet. Real on-chain transactions.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#141414] text-white overflow-hidden">
            <TopBar
                balance={balance}
                isLoggedIn={isLoggedIn}
                walletAddress={walletAddress}
                onLogin={handleLogin}
                onLogout={handleLogout}
            />

            {/* Main scrollable content */}
            <div id="main-scroll" className="flex-1 overflow-y-auto">
                {/* Hero */}
                <HeroSection content={featuredContent} onPlay={handlePlay} />

                {/* Content Rows */}
                <div className="relative z-10 -mt-16 pb-20">
                    {contentCategories.map((category) => (
                        <ContentRow
                            key={category.name}
                            title={category.name}
                            items={category.items}
                            onPlay={handlePlay}
                        />
                    ))}

                    {/* Recent Sessions */}
                    {sessions.length > 0 && (
                        <div className="px-6 lg:px-12 mt-8">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Recent Watch Sessions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {sessions.slice(0, 6).map((session, i) => (
                                    <div
                                        key={`${session.txHash}-${i}`}
                                        className={`border rounded-lg p-4 space-y-2 ${
                                            session.status === "failed"
                                                ? "bg-red-500/5 border-red-500/20"
                                                : session.status === "pending"
                                                ? "bg-yellow-500/5 border-yellow-500/20"
                                                : "bg-white/5 border-white/10"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">
                                                {session.contentTitle}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                                session.status === "completed"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : session.status === "pending"
                                                    ? "bg-yellow-500/20 text-yellow-400 animate-pulse"
                                                    : "bg-red-500/20 text-red-400"
                                            }`}>
                                                {session.status === "completed" ? "Confirmed" : session.status === "pending" ? "Pending..." : "Failed"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-white/50">
                                            <span>
                                                {Math.floor(session.totalSeconds / 60)}m {session.totalSeconds % 60}s watched
                                            </span>
                                            <span className="text-[#836ef9] font-mono">
                                                -{session.totalCost.toFixed(4)} MON
                                            </span>
                                        </div>
                                        {session.txHash && session.txHash !== "FAILED" && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-white/20">
                                                    TX: {shortenHash(session.txHash)}
                                                </span>
                                                {session.explorerUrl && (
                                                    <a
                                                        href={session.explorerUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#836ef9] hover:text-[#836ef9]/80 transition-colors"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Player Overlay */}
            {activeContent && (
                <VideoPlayer
                    content={activeContent}
                    onClose={handleClosePlayer}
                    balance={balance}
                    onBalanceTick={handleBalanceTick}
                />
            )}

            {/* Payment Pending Overlay */}
            {paymentPending && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
                        <Loader2 className="h-10 w-10 text-[#836ef9] animate-spin mx-auto" />
                        <h3 className="text-lg font-semibold text-white">Processing Payment</h3>
                        <p className="text-sm text-white/50">
                            Sending transaction to Monad Testnet...
                        </p>
                        <p className="text-xs text-white/30">
                            Please confirm the transaction in MetaMask
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
