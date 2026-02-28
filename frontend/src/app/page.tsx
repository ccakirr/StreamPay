"use client";

import { useState, useEffect } from "react";
import StreamPayDemo from "@/components/StreamPayDemo";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    // Phase 1: Text fades in
    const fadeInTimer = setTimeout(() => {
      setIntroPhase("out");
    }, 1800);

    // Phase 2: Text fades out, then show UI
    const hideTimer = setTimeout(() => {
      setShowIntro(false);
    }, 2800);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
        <div
          className={`font-mono text-lg tracking-[0.3em] uppercase transition-all duration-700 ${introPhase === "in"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
            }`}
          style={{
            color: "#836ef9",
            textShadow:
              "0 0 20px rgba(131,110,249,0.6), 0 0 40px rgba(131,110,249,0.3)",
          }}
        >
          <span className="inline-block animate-pulse">▸</span>{" "}
          Connecting to Monad...
        </div>

        {/* Decorative loading bar */}
        <div className="absolute bottom-1/3 w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#836ef9] to-[#00ff41] rounded-full"
            style={{
              animation: "loadbar 2.5s ease-in-out",
              width: introPhase === "in" ? "70%" : "100%",
              transition: "width 0.8s ease-out",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <StreamPayDemo />
    </div>
  );
}
