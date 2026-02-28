"use client";

import { useState, useRef, useEffect } from "react";
import { Zap, Search, Bell, ChevronDown, Wallet, Clock, ExternalLink } from "lucide-react";
import { WatchSession } from "@/lib/web3";
import { shortenHash } from "@/lib/mockData";

export type ViewType = "home" | "series" | "films" | "new" | "transactions";

interface TopBarProps {
    balance: number;
    isLoggedIn: boolean;
    walletAddress: string | null;
    onLogin: () => void;
    onLogout: () => void;
    activeView: ViewType;
    onNavigate: (view: ViewType) => void;
    onSearchOpen: () => void;
    sessions: WatchSession[];
}

export default function TopBar({
    balance,
    isLoggedIn,
    walletAddress,
    onLogin,
    onLogout,
    activeView,
    onNavigate,
    onSearchOpen,
    sessions,
}: TopBarProps) {
    const [scrolled, setScrolled] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const container = document.getElementById("main-scroll");
            if (container) {
                setScrolled(container.scrollTop > 50);
            }
        };
        const container = document.getElementById("main-scroll");
        container?.addEventListener("scroll", handleScroll);
        return () => container?.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems: { label: string; view: ViewType }[] = [
        { label: "Home", view: "home" },
        { label: "Series", view: "series" },
        { label: "Films", view: "films" },
        { label: "New & Popular", view: "new" },
        { label: "Transactions", view: "transactions" },
    ];

    const recentSessions = sessions.slice(0, 5);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-[#141414]/95 backdrop-blur-md shadow-lg"
                    : "bg-gradient-to-b from-black/80 to-transparent"
            }`}
        >
            <div className="flex items-center justify-between px-6 lg:px-12 py-3">
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-8">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => onNavigate("home")}
                    >
                        <Zap className="h-7 w-7 text-[#836ef9] drop-shadow-[0_0_8px_rgba(131,110,249,0.6)]" />
                        <span className="text-2xl font-bold tracking-tight text-white">
                            Stream<span className="text-[#836ef9]">Pay</span>
                        </span>
                    </div>
                    {isLoggedIn && (
                        <nav className="hidden md:flex items-center gap-5">
                            {navItems.map((item) => (
                                <button
                                    key={item.view}
                                    onClick={() => onNavigate(item.view)}
                                    className={`text-sm transition-colors duration-200 cursor-pointer ${
                                        activeView === item.view
                                            ? "text-white font-semibold"
                                            : "text-white/70 hover:text-white/90"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <button
                                onClick={onSearchOpen}
                                className="text-white/70 hover:text-white transition-colors cursor-pointer"
                            >
                                <Search className="h-5 w-5" />
                            </button>

                            {/* Notifications Bell */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="text-white/70 hover:text-white transition-colors cursor-pointer relative"
                                >
                                    <Bell className="h-5 w-5" />
                                    {recentSessions.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                                    )}
                                </button>

                                {notifOpen && (
                                    <div className="absolute right-0 top-10 w-72 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <span className="text-sm font-medium text-white">
                                                Recent Activity
                                            </span>
                                        </div>
                                        {recentSessions.length === 0 ? (
                                            <div className="px-4 py-6 text-center">
                                                <p className="text-xs text-white/30">
                                                    No recent activity
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="max-h-64 overflow-y-auto">
                                                {recentSessions.map((session, i) => (
                                                    <div
                                                        key={`notif-${session.txHash}-${i}`}
                                                        className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-white truncate">
                                                                {session.contentTitle}
                                                            </span>
                                                            <span className="text-[10px] text-[#836ef9] font-mono flex-shrink-0 ml-2">
                                                                -{session.totalCost.toFixed(3)} MON
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-white/30">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            <span>
                                                                {Math.floor(session.totalSeconds / 60)}m{" "}
                                                                {session.totalSeconds % 60}s
                                                            </span>
                                                            {session.txHash && session.txHash !== "FAILED" && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="font-mono">
                                                                        {shortenHash(session.txHash)}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                onNavigate("transactions");
                                                setNotifOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-xs text-[#836ef9] hover:bg-white/5 transition-colors cursor-pointer text-center"
                                        >
                                            View All Transactions
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#836ef9] to-[#6246ea] flex items-center justify-center text-white text-sm font-bold">
                                        {walletAddress ? walletAddress.slice(2, 4).toUpperCase() : "M"}
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-white/60 transition-transform duration-200 ${
                                            profileOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 top-12 w-56 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Wallet className="h-4 w-4 text-[#836ef9]" />
                                                <span className="text-xs text-white/50 uppercase tracking-wider">
                                                    Wallet Balance
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xl font-bold font-mono text-white">
                                                    {balance.toFixed(4)}
                                                </span>
                                                <span className="text-xs text-white/40">MON</span>
                                            </div>
                                            {walletAddress && (
                                                <div className="mt-1 text-[10px] font-mono text-white/30 truncate">
                                                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                                </div>
                                            )}
                                            <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#836ef9] to-[#6246ea] rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.max((balance / 10) * 100, 0)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    onNavigate("transactions");
                                                    setProfileOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
                                            >
                                                Transactions
                                            </button>
                                            <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer">
                                                Monad Testnet
                                            </button>
                                            <button
                                                onClick={() => { onLogout(); setProfileOpen(false); }}
                                                className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
                                            >
                                                Disconnect Wallet
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={onLogin}
                            className="flex items-center gap-2 px-4 py-2 bg-[#836ef9] hover:bg-[#7258e8] text-white text-sm font-medium rounded transition-all duration-300 cursor-pointer"
                        >
                            <Wallet className="h-4 w-4" />
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
