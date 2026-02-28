"use client";

import { useState, useRef, useEffect } from "react";
import { Zap, Search, Bell, ChevronDown, Wallet } from "lucide-react";

interface TopBarProps {
    balance: number;
    isLoggedIn: boolean;
    walletAddress: string | null;
    onLogin: () => void;
    onLogout: () => void;
}

export default function TopBar({ balance, isLoggedIn, walletAddress, onLogin, onLogout }: TopBarProps) {
    const [scrolled, setScrolled] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

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
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = ["Home", "Series", "Films", "New & Popular"];

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
                    <div className="flex items-center gap-2 cursor-pointer">
                        <Zap className="h-7 w-7 text-[#836ef9] drop-shadow-[0_0_8px_rgba(131,110,249,0.6)]" />
                        <span className="text-2xl font-bold tracking-tight text-white">
                            Stream<span className="text-[#836ef9]">Pay</span>
                        </span>
                    </div>
                    {isLoggedIn && (
                        <nav className="hidden md:flex items-center gap-5">
                            {navItems.map((item, i) => (
                                <button
                                    key={item}
                                    className={`text-sm transition-colors duration-200 cursor-pointer ${
                                        i === 0
                                            ? "text-white font-semibold"
                                            : "text-white/70 hover:text-white/90"
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <button className="text-white/70 hover:text-white transition-colors cursor-pointer">
                                <Search className="h-5 w-5" />
                            </button>
                            <button className="text-white/70 hover:text-white transition-colors cursor-pointer relative">
                                <Bell className="h-5 w-5" />
                            </button>

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
