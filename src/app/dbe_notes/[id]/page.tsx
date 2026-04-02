"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, PenTool, BookOpen } from "lucide-react";
import Link from "next/link";
import { Kalam } from "next/font/google";
import DrawingOverlay from "@/components/DrawingOverlay";
import PdfExportButton from "@/components/PdfExportButton";
import { getSubjectById } from "@/data/db";

const kalam = Kalam({ weight: ["400", "700"], subsets: ["latin"] });

export default function DbeNotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const subject = getSubjectById(id);

    useEffect(() => {
        // Fetch raw markdown from the public folder
        fetch(`/dbe_notes/${id}.md`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.text();
            })
            .then((text) => {
                setContent(text);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading note:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
                <h1 className="text-7xl font-black text-white/5 mb-4 tracking-tighter">404</h1>
                <p className="text-gray-400 text-lg">Note content not found.</p>
                <Link href={`/${id}`} className="mt-8 text-indigo-400 hover:text-indigo-300 flex items-center font-medium transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Subject
                </Link>
            </div>
        );
    }

    // Colorful markdown renderer for handwritten styling
    const renderMarkdown = (md: string) => {
        return md.split("\n").map((line, i) => {
            if (line.startsWith("# ")) return <h1 key={i} className="text-3xl font-extrabold text-blue-600 mt-8 mb-4 tracking-wide border-b-2 border-blue-200/50 pb-2">{line.slice(2)}</h1>;
            if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-purple-600 mt-6 mb-3">{line.slice(3)}</h2>;
            if (line.startsWith("### ")) return <h3 key={i} className="text-xl font-bold text-pink-600 mt-5 mb-2">{line.slice(4)}</h3>;
            if (line.startsWith("> ")) return <blockquote key={i} className="border-l-4 border-amber-400 bg-amber-50/50 pl-4 py-2 pr-4 rounded-r-lg text-amber-700 italic my-4 text-lg">{line.slice(2)}</blockquote>;
            if (line.startsWith("- ") || line.startsWith("* ")) {
                const contentText = line.slice(2);
                return <li key={i} className="text-slate-800 ml-6 list-none relative my-2 text-lg before:content-['•'] before:absolute before:-left-5 before:text-teal-500 before:font-bold before:text-xl" dangerouslySetInnerHTML={{ __html: contentText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-rose-600 font-bold">$1</strong>') }} />;
            }
            if (line.trim() === "") return <div key={i} className="h-4" />;
            return <p key={i} className="text-slate-800 leading-relaxed my-3 text-lg" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-rose-600 font-bold">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-indigo-100 px-2 py-0.5 rounded-md text-indigo-700 font-sans text-sm font-semibold border border-indigo-200/50">$1</code>') }} />;
        });
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <Link href={`/${id}`} className="flex items-center text-sm font-medium text-gray-500 hover:text-white transition-colors w-fit">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to {subject?.title || id}
            </Link>

            <article className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <BookOpen className="w-3.5 h-3.5" />
                            Study Notes
                        </span>
                        <span className="text-xs text-gray-500">
                            {id} {subject?.title ? `— ${subject.title}` : ""}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            {subject?.title || `${id} Notes`}
                        </h1>
                        <div className="flex items-center gap-3">
                            <PdfExportButton targetRef={containerRef} filename={subject?.title || `${id}_Notes`} />
                            <button
                                onClick={() => setIsDrawingMode(!isDrawingMode)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover-lift ${isDrawingMode
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                                    : "bg-white/10 text-gray-300 hover:bg-white/15"
                                    }`}
                            >
                                <PenTool className="w-4 h-4" />
                                {isDrawingMode ? "Done Annotating" : "Annotate Note"}
                            </button>
                        </div>
                    </div>

                    {/* Content Section with Mac OS Window Wrapper */}
                    <div ref={containerRef} className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-[#1e1e1e] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] sm:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] mt-4 sm:mt-8 ring-1 ring-white/5 mx-auto transition-transform hover-lift">

                        {/* macOS Window Header Bar */}
                        <div className="h-8 sm:h-10 w-full bg-gradient-to-b from-white/10 to-transparent border-b border-white/10 flex items-center px-3 sm:px-4 relative z-40">
                            {/* Traffic Lights */}
                            <div className="flex gap-1.5 sm:gap-2">
                                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-110 shadow-inner"></div>
                                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:brightness-110 shadow-inner"></div>
                                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-110 shadow-inner"></div>
                            </div>

                            {/* Window Title (Note Title) */}
                            <div className="absolute left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-gray-400 tracking-wide max-w-[150px] sm:max-w-sm truncate">
                                {subject?.title || id}.dbe
                            </div>
                        </div>

                        {/* Note Notebook Area (Plain Page) */}
                        <div className="relative w-full bg-[#F9F6EE] min-h-[400px] sm:min-h-[600px] overflow-hidden overflow-x-auto">
                            <div className={`relative z-10 p-4 sm:p-8 md:p-12 ${kalam.className}`}>
                                <div className="prose-like !max-w-none break-words">
                                    {renderMarkdown(content)}
                                </div>
                            </div>
                            <DrawingOverlay noteId={`dbe_${id}`} isDrawingMode={isDrawingMode} />
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
