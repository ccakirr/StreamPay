"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import TopBar, { ViewType } from "@/components/TopBar";
import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import VideoPlayer from "@/components/VideoPlayer";
import TransactionsPage from "@/components/TransactionsPage";
import SearchOverlay from "@/components/SearchOverlay";
import ContentModal from "@/components/ContentModal";
import {
    ContentItem,
    contentCategories,
    featuredContent,
    allContent,
    MINUTE_PACKAGES,
} from "@/lib/mockData";
import {
    endWatchSession,
    buyMinutes,
    WatchSession,
    connectWallet,
    disconnectWallet,
    getWalletBalance,
    getStoredMinuteBalance,
    loadTransactionsFromDB,
    isMetaMaskInstalled,
    onAccountsChanged,
    onChainChanged,
    checkUserExists,
    getUserDisplayName,
    registerUser,
    MONAD_TESTNET,
} from "@/lib/web3";
import BuyMinutesModal from "@/components/BuyMinutesModal";
import RegisterModal from "@/components/RegisterModal";
import { Wallet, Zap, AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";

export default function StreamPayDemo() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [balance, setBalance] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [minuteBalance, setMinuteBalance] = useState(0);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [activeContent, setActiveContent] = useState<ContentItem | null>(null);
    const [sessions, setSessions] = useState<WatchSession[]>([]);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentPending, setPaymentPending] = useState(false);
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [displayName, setDisplayName] = useState<string | null>(null);

    // New state for navigation, search, modals
    const [activeView, setActiveView] = useState<ViewType>("home");
    const [searchOpen, setSearchOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ContentItem | null>(null);

    // Listen for account/chain changes
    useEffect(() => {
        if (!isLoggedIn) return;

        const unsubAccounts = onAccountsChanged(async (accounts) => {
            if (accounts.length === 0) {
                setIsLoggedIn(false);
                setWalletAddress(null);
                setBalance(0);
                setWalletBalance(0);
                setMinuteBalance(0);
            } else {
                setWalletAddress(accounts[0]);
                const bal = await getWalletBalance(accounts[0]);
                setWalletBalance(bal);
                const mins = await getStoredMinuteBalance(accounts[0]);
                setMinuteBalance(mins);
                setBalance(mins);
            }
        });

        const unsubChain = onChainChanged(() => {
            window.location.reload();
        });

        return () => {
            unsubAccounts();
            unsubChain();
        };
    }, [isLoggedIn]);

    // Filtered content based on active view
    const filteredCategories = useMemo(() => {
        switch (activeView) {
            case "series":
                return [
                    { name: "Sci-Fi Series", items: allContent.filter((c) => c.category === "Sci-Fi") },
                    { name: "Drama Series", items: allContent.filter((c) => c.category === "Drama") },
                    { name: "Thriller Series", items: allContent.filter((c) => c.category === "Thriller") },
                    { name: "All Series", items: allContent.filter((c) => ["Sci-Fi", "Drama", "Thriller", "Mystery"].includes(c.category)) },
                ];
            case "films":
                return [
                    { name: "Action Films", items: allContent.filter((c) => c.category === "Action") },
                    { name: "Documentary Films", items: allContent.filter((c) => c.category === "Documentary") },
                    { name: "Animation", items: allContent.filter((c) => c.category === "Animation") },
                    { name: "All Films", items: allContent },
                ];
            case "new":
                return [
                    { name: "New Releases 2026", items: allContent.filter((c) => c.year === 2026) },
                    { name: "Popular Now", items: allContent.filter((c) => c.match >= 93) },
                    { name: "Trending", items: [...allContent].sort((a, b) => b.match - a.match) },
                ];
            default:
                return contentCategories;
        }
    }, [activeView]);

    const handleLogin = useCallback(async () => {
        setError(null);
        setConnecting(true);
        try {
            if (!isMetaMaskInstalled()) {
                setError("MetaMask yüklü değil. Lütfen MetaMask yükleyin.");
                setConnecting(false);
                return;
            }
            const wallet = await connectWallet();
            setWalletAddress(wallet.address);
            setWalletBalance(wallet.balance);
            const mins = wallet.address ? await getStoredMinuteBalance(wallet.address) : 0;
            setMinuteBalance(mins);
            setBalance(mins);
            // Load past transactions from Supabase
            if (wallet.address) {
                const pastSessions = await loadTransactionsFromDB(wallet.address);
                if (pastSessions.length > 0) {
                    setSessions(pastSessions);
                }
                // Check if first-time user
                const exists = await checkUserExists(wallet.address);
                if (!exists) {
                    // Show registration modal
                    setIsLoggedIn(true);
                    setShowRegister(true);
                    return;
                } else {
                    // Load display name
                    const name = await getUserDisplayName(wallet.address);
                    if (name) setDisplayName(name);
                }
            }
            setIsLoggedIn(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Cüzdan bağlantısı başarısız";
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
        setWalletBalance(0);
        setMinuteBalance(0);
        setActiveView("home");
    }, []);

    const handlePlay = useCallback(
        (content: ContentItem) => {
            if (minuteBalance <= 0) {
                setBuyModalOpen(true);
                return;
            }
            setActiveContent(content);
        },
        [minuteBalance]
    );

    const handleBalanceTick = useCallback((newBalance: number) => {
        setMinuteBalance(Math.max(newBalance, 0));
        setBalance(Math.max(newBalance, 0));
    }, []);

    const handleClosePlayer = useCallback(
        async (totalSeconds: number, minutesUsed: number) => {
            if (activeContent && totalSeconds > 0 && walletAddress) {
                setPaymentPending(true);
                try {
                    const remaining = Math.max(minuteBalance - minutesUsed, 0);
                    const session = await endWatchSession(
                        walletAddress,
                        activeContent.id,
                        activeContent.title,
                        totalSeconds,
                        minutesUsed,
                        remaining
                    );
                    setSessions((prev) => [session, ...prev]);
                    setMinuteBalance(remaining);
                    setBalance(remaining);
                    // Refresh wallet balance
                    const newWalBal = await getWalletBalance(walletAddress);
                    setWalletBalance(newWalBal);
                } catch (err) {
                    console.error("Session recording error:", err);
                } finally {
                    setPaymentPending(false);
                }
            }
            setActiveContent(null);
        },
        [activeContent, walletAddress, minuteBalance]
    );

    const handleNavigate = useCallback((view: ViewType) => {
        setActiveView(view);
    }, []);

    const handleBuyMinutes = useCallback(
        async (pkg: { minutes: number; costMON: number }) => {
            if (!walletAddress) return;
            setPaymentPending(true);
            setError(null);
            try {
                const session = await buyMinutes(walletAddress, pkg.minutes, pkg.costMON);
                setSessions((prev) => [session, ...prev]);
                if (session.status === "completed") {
                    const newMins = await getStoredMinuteBalance(walletAddress);
                    setMinuteBalance(newMins);
                    setBalance(newMins);
                }
                const newWalBal = await getWalletBalance(walletAddress);
                setWalletBalance(newWalBal);
                setBuyModalOpen(false);
            } catch (err) {
                const message = err instanceof Error ? err.message : "İşlem başarısız oldu";
                setError(message);
                console.error("Buy minutes error:", err);
                // Don't close modal so user can retry
            } finally {
                setPaymentPending(false);
            }
        },
        [walletAddress]
    );

    const handleRegister = useCallback(
        async (name: string) => {
            if (!walletAddress) return;
            const success = await registerUser(walletAddress, name);
            if (success) {
                setDisplayName(name);
                setShowRegister(false);
            } else {
                // Still dismiss on failure — localStorage name as fallback
                setDisplayName(name);
                setShowRegister(false);
            }
        },
        [walletAddress]
    );

    const handleSkipRegister = useCallback(() => {
        setShowRegister(false);
    }, []);

    // Login / Connect Wallet Screen
    if (!isLoggedIn) {
        return (
            <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                {/* Background montage */}
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
                    <div className="flex items-center gap-3">
                        <Zap className="h-12 w-12 text-[#836ef9] drop-shadow-[0_0_15px_rgba(131,110,249,0.6)]" />
                        <span className="text-5xl font-bold tracking-tight text-white">
                            Stream<span className="text-[#836ef9]">Pay</span>
                        </span>
                    </div>

                    <p className="text-white/50 text-center text-lg">
                        Pay only for what you watch. Powered by Monad.
                    </p>

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
                minuteBalance={minuteBalance}
                walletBalance={walletBalance}
                isLoggedIn={isLoggedIn}
                walletAddress={walletAddress}
                displayName={displayName}
                onLogin={handleLogin}
                onLogout={handleLogout}
                activeView={activeView}
                onNavigate={handleNavigate}
                onSearchOpen={() => setSearchOpen(true)}
                sessions={sessions}
                onBuyMinutes={() => setBuyModalOpen(true)}
            />

            {/* Main scrollable content */}
            <div id="main-scroll" className="flex-1 overflow-y-auto">
                {activeView === "transactions" ? (
                    <TransactionsPage sessions={sessions} />
                ) : (
                    <>
                        {/* Hero */}
                        <HeroSection
                            content={featuredContent}
                            onPlay={handlePlay}
                            onMoreInfo={(content) => setModalContent(content)}
                        />

                        {/* Content Rows */}
                        <div className="relative z-10 -mt-16 pb-20">
                            {filteredCategories.map((category) => (
                                <ContentRow
                                    key={category.name}
                                    title={category.name}
                                    items={category.items}
                                    onPlay={handlePlay}
                                />
                            ))}

                            {/* Recent Sessions (only on home view) */}
                            {activeView === "home" && sessions.length > 0 && (
                                <div className="px-6 lg:px-12 mt-8">
                                    <h2 className="text-lg font-semibold text-white mb-4">
                                        Recent Watch Sessions
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {sessions.slice(0, 6).map((session, i) => (
                                            <div
                                                key={`${session.txHash}-${i}`}
                                                className={`border rounded-lg p-4 space-y-2 cursor-pointer hover:bg-white/[0.03] transition-colors ${
                                                    session.status === "failed"
                                                        ? "bg-red-500/5 border-red-500/20"
                                                        : session.status === "pending"
                                                        ? "bg-yellow-500/5 border-yellow-500/20"
                                                        : "bg-white/5 border-white/10"
                                                }`}
                                                onClick={() => setActiveView("transactions")}
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
                                                        {session.type === "purchase" ? `+${session.minutesUsed} dk` : `-${session.minutesUsed.toFixed(1)} dk`}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Search Overlay */}
            {searchOpen && (
                <SearchOverlay
                    onClose={() => setSearchOpen(false)}
                    onPlay={handlePlay}
                />
            )}

            {/* Content Info Modal */}
            {modalContent && (
                <ContentModal
                    content={modalContent}
                    onClose={() => setModalContent(null)}
                    onPlay={handlePlay}
                />
            )}

            {/* Video Player Overlay */}
            {activeContent && (
                <VideoPlayer
                    content={activeContent}
                    onClose={handleClosePlayer}
                    balance={minuteBalance}
                    onBalanceTick={handleBalanceTick}
                />
            )}

            {/* Buy Minutes Modal */}
            {buyModalOpen && (
                <BuyMinutesModal
                    onClose={() => setBuyModalOpen(false)}
                    onBuy={handleBuyMinutes}
                    walletBalance={walletBalance}
                    minuteBalance={minuteBalance}
                />
            )}

            {/* Register Modal (first-time users) */}
            {showRegister && walletAddress && (
                <RegisterModal
                    walletAddress={walletAddress}
                    onRegister={handleRegister}
                    onSkip={handleSkipRegister}
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
