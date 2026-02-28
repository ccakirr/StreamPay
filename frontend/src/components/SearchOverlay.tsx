"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Play } from "lucide-react";
import { ContentItem, allContent } from "@/lib/mockData";
import Image from "next/image";

interface SearchOverlayProps {
    onClose: () => void;
    onPlay: (content: ContentItem) => void;
}

export default function SearchOverlay({ onClose, onPlay }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const results = query.length > 0
        ? allContent.filter(
              (item) =>
                  item.title.toLowerCase().includes(query.toLowerCase()) ||
                  item.description.toLowerCase().includes(query.toLowerCase()) ||
                  item.category.toLowerCase().includes(query.toLowerCase())
          )
        : [];

    return (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md overflow-y-auto">
            {/* Search Header */}
            <div className="sticky top-0 z-10 bg-[#141414]/90 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-4 px-6 lg:px-12 py-4">
                    <Search className="h-5 w-5 text-white/40 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search titles, genres, descriptions..."
                        className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-white/30"
                    />
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="px-6 lg:px-12 py-8">
                {query.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="h-12 w-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/30 text-lg">
                            Start typing to search for content
                        </p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-white/30 text-lg">
                            No results for &ldquo;{query}&rdquo;
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-white/40 mb-6">
                            {results.length} result{results.length !== 1 ? "s" : ""} for
                            &ldquo;{query}&rdquo;
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {results.map((item) => (
                                <div
                                    key={item.id}
                                    className="group cursor-pointer"
                                    onClick={() => {
                                        onPlay(item);
                                        onClose();
                                    }}
                                >
                                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
                                                <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-medium text-white truncate">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-emerald-400">
                                            {item.match}% Match
                                        </span>
                                        <span className="text-xs text-white/30">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
