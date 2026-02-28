"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Animation phases in order
type Phase = "black" | "fadeIn" | "glow" | "sweep" | "fly" | "done";

interface IntroAnimationProps {
    children: React.ReactNode;
}

export default function IntroAnimation({ children }: IntroAnimationProps) {
    const [phase, setPhase] = useState<Phase>("black");

    useEffect(() => {
        const schedule: [Phase, number][] = [
            ["fadeIn", 100],    // Text begins fading in
            ["glow", 700],     // Glow + subtitle appear
            ["sweep", 1600],   // Light sweep passes
            ["fly", 2400],     // Logo flies to navbar corner
            ["done", 3300],    // Cleanup, reveal full UI
        ];
        const timers = schedule.map(([p, ms]) => setTimeout(() => setPhase(p), ms));
        return () => timers.forEach(clearTimeout);
    }, []);

    const isDone = phase === "done";
    const isFly = phase === "fly";
    const showLogo = phase !== "done";
    const showSubtitle = phase === "glow" || phase === "sweep";
    const showSweep = phase === "sweep";
    const showGlow = phase === "glow" || phase === "sweep";

    return (
        <div className="relative">
            {/* ── Black Overlay ── */}
            <AnimatePresence>
                {!isDone && (
                    <motion.div
                        key="intro-overlay"
                        className="fixed inset-0 bg-black"
                        style={{ zIndex: 100 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    />
                )}
            </AnimatePresence>

            {/* ── Floating Animated Logo ── */}
            <AnimatePresence>
                {showLogo && (
                    <motion.div
                        key="intro-logo-wrapper"
                        className="fixed flex flex-col items-center pointer-events-none"
                        style={{ zIndex: 101 }}
                        initial={{
                            top: "50%",
                            left: "50%",
                            x: "-50%",
                            y: "-50%",
                        }}
                        animate={
                            isFly
                                ? {
                                      top: "0.82rem",
                                      left: "4.5rem",
                                      x: "0%",
                                      y: "0%",
                                  }
                                : {
                                      top: "50%",
                                      left: "50%",
                                      x: "-50%",
                                      y: "-50%",
                                  }
                        }
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: isFly ? 0.8 : 0.5,
                            ease: [0.25, 0.1, 0.25, 1],
                        }}
                    >
                        {/* StreamPay Text */}
                        <motion.span
                            layoutId="streampay-logo"
                            className="font-mono font-bold whitespace-nowrap select-none"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                fontSize: isFly ? "1.5rem" : "4.5rem",
                            }}
                            transition={{
                                opacity: { duration: 0.5, ease: "easeOut" },
                                scale: { duration: 0.5, ease: "easeOut" },
                                fontSize: {
                                    duration: isFly ? 0.8 : 0.3,
                                    ease: [0.25, 0.1, 0.25, 1],
                                },
                            }}
                            style={{
                                textShadow: showGlow
                                    ? "0 0 7px #00ff41, 0 0 10px #00ff41, 0 0 21px #00ff41, 0 0 42px #00ff41, 0 0 82px #00ff41, 0 0 92px #00ff41"
                                    : "none",
                                transition: "text-shadow 0.4s ease",
                            }}
                        >
                            <span className="text-white">Stream</span>
                            <span
                                className="intro-pay-text"
                                style={{
                                    color: isFly ? "#836ef9" : "#00ff41",
                                    transition: "color 0.6s ease",
                                }}
                            >
                                Pay
                            </span>
                        </motion.span>

                        {/* Glow pulse ring behind text */}
                        {showGlow && (
                            <motion.div
                                className="absolute rounded-full pointer-events-none"
                                style={{
                                    width: "120%",
                                    height: "200%",
                                    top: "-50%",
                                    left: "-10%",
                                    background:
                                        "radial-gradient(ellipse at center, rgba(0,255,65,0.12) 0%, transparent 70%)",
                                }}
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.6, 1, 0.6],
                                }}
                                transition={{
                                    duration: 1.4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        )}

                        {/* Light Sweep */}
                        <AnimatePresence>
                            {showSweep && (
                                <motion.div
                                    key="light-sweep"
                                    className="absolute inset-0 overflow-hidden pointer-events-none"
                                    style={{ zIndex: 20 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        className="absolute top-0 bottom-0"
                                        style={{
                                            width: "6rem",
                                            background:
                                                "linear-gradient(90deg, transparent, rgba(0,255,65,0.15), rgba(255,255,255,0.5), rgba(0,255,65,0.15), transparent)",
                                        }}
                                        initial={{ left: "-6rem" }}
                                        animate={{ left: "calc(100% + 6rem)" }}
                                        transition={{
                                            duration: 0.7,
                                            ease: "easeInOut",
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Subtitle: Powered by Monad */}
                        <AnimatePresence>
                            {showSubtitle && !isFly && (
                                <motion.p
                                    key="powered-subtitle"
                                    className="mt-5 text-sm font-mono tracking-[0.25em] uppercase"
                                    style={{ color: "#836ef9" }}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.45 }}
                                >
                                    Powered by Monad
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Decorative particles during intro ── */}
            <AnimatePresence>
                {!isDone && !isFly && (
                    <motion.div
                        key="particles"
                        className="fixed inset-0 pointer-events-none overflow-hidden"
                        style={{ zIndex: 100 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full"
                                style={{
                                    background: i % 2 === 0 ? "#00ff41" : "#836ef9",
                                    left: `${15 + i * 14}%`,
                                    top: `${30 + (i % 3) * 20}%`,
                                }}
                                animate={{
                                    y: [0, -20, 0],
                                    opacity: [0.2, 0.7, 0.2],
                                    scale: [1, 1.5, 1],
                                }}
                                transition={{
                                    duration: 2 + i * 0.3,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main App Content ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isFly || isDone ? 1 : 0 }}
                transition={{ duration: 0.8, delay: isFly ? 0.3 : 0 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
