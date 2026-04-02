"use client";

import React, { useRef, useState, useEffect } from "react";
import { Pen, Eraser, Trash2, Highlighter, StickyNote as StickyNoteIcon, Type } from "lucide-react";
import { Kalam } from "next/font/google";

const kalam = Kalam({ weight: ["400", "700"], subsets: ["latin"] });

interface DrawingOverlayProps {
    noteId: string;
    isDrawingMode: boolean;
}

type Tool = "pen" | "highlighter" | "eraser" | "sticky" | "text";

interface Point {
    x: number;
    y: number;
}

interface Stroke {
    tool: Tool;
    points: Point[];
    color: string;
    width: number;
}

interface StickyNoteData {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
}

interface TextBoxData {
    id: string;
    x: number;
    y: number;
    text: string;
}

export default function DrawingOverlay({ noteId, isDrawingMode }: DrawingOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState("#2563eb"); // default blue pen
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
    const [textBoxes, setTextBoxes] = useState<TextBoxData[]>([]);
    const [draggingElement, setDraggingElement] = useState<{ id: string, type: 'sticky' | 'text', offsetX: number, offsetY: number } | null>(null);

    // Initialize canvas size and load saved strokes
    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            // Set actual size in memory (scaled to account for extra pixel density)
            const rect = container.getBoundingClientRect();
            // Use 2 for high retina displays
            const scale = window.devicePixelRatio || 1;

            canvas.width = rect.width * scale;
            canvas.height = rect.height * scale;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.scale(scale, scale);
                // Re-render
                redrawCanvas(ctx, strokes);
            }
        };

        const loadSavedStrokes = () => {
            try {
                const saved = localStorage.getItem(`note_annotations_${noteId}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Handle legacy stroke-only arrays vs new combined objects
                    if (Array.isArray(parsed)) {
                        setStrokes(parsed);
                    } else {
                        setStrokes(parsed.strokes || []);
                        setStickyNotes(parsed.stickyNotes || []);
                        setTextBoxes(parsed.textBoxes || []);
                    }
                }
            } catch (e) {
                console.error("Failed to load annotations", e);
            }
        };

        loadSavedStrokes();

        // Initial resize might need a small delay for content to settle
        const sto = setTimeout(resizeCanvas, 100);
        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            clearTimeout(sto);
        };
    }, [noteId]);

    // Save strokes when they change
    useEffect(() => {
        if (strokes.length > 0 || stickyNotes.length > 0 || textBoxes.length > 0) {
            localStorage.setItem(`note_annotations_${noteId}`, JSON.stringify({ strokes, stickyNotes, textBoxes }));
        } else {
            localStorage.removeItem(`note_annotations_${noteId}`);
        }
    }, [strokes, stickyNotes, textBoxes, noteId]);

    const redrawCanvas = (ctx: CanvasRenderingContext2D, strokesToDraw: Stroke[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        strokesToDraw.forEach(stroke => {
            drawStroke(ctx, stroke);
        });
    };

    const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
        if (stroke.points.length < 2) return;

        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (stroke.tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = 20;
            ctx.strokeStyle = "rgba(0,0,0,1)";
        } else if (stroke.tool === "highlighter") {
            ctx.globalCompositeOperation = "source-over";
            ctx.lineWidth = 24;
            // Add transparency to highlighter
            ctx.strokeStyle = stroke.color + "40"; // append alpha hex (25%)
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = stroke.color;
        }

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();

        // Reset
        ctx.globalCompositeOperation = "source-over";
    };

    // Render loop triggered when strokes change
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            redrawCanvas(ctx, strokes);
            if (currentStroke) {
                drawStroke(ctx, currentStroke);
            }
        }
    }, [strokes, currentStroke]);

    const getMousePos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();

        // Handle touch
        if ("touches" in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }

        // Handle mouse
        return {
            x: (e as React.MouseEvent).clientX - rect.left,
            y: (e as React.MouseEvent).clientY - rect.top
        };
    };

    const startInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingMode) return;
        const pos = getMousePos(e);

        if (tool === "sticky") {
            const colors = ["#fef08a", "#fbcfe8", "#bfdbfe", "#bbf7d0"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            setStickyNotes([...stickyNotes, { id: Date.now().toString(), x: pos.x, y: pos.y, text: "New Note", color: randomColor }]);
            setTool("pen"); // auto-revert to pen after placing
            return;
        }

        if (tool === "text") {
            setTextBoxes([...textBoxes, { id: Date.now().toString(), x: pos.x, y: pos.y, text: "" }]);
            setTool("pen");
            return;
        }

        // Otherwise handle normal drawing Start
        e.preventDefault(); // prevent scrolling while drawing
        setIsDrawing(true);
        setCurrentStroke({
            tool,
            color: color,
            width: tool === "eraser" ? 20 : (tool === "highlighter" ? 15 : 2.5),
            points: [pos]
        });
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingMode) return;

        // Handle dragging UI elements
        if (draggingElement) {
            e.preventDefault();
            const pos = getMousePos(e);

            if (draggingElement.type === 'sticky') {
                setStickyNotes(prev => prev.map(note => note.id === draggingElement.id ? { ...note, x: pos.x - draggingElement.offsetX, y: pos.y - draggingElement.offsetY } : note));
            } else {
                setTextBoxes(prev => prev.map(tb => tb.id === draggingElement.id ? { ...tb, x: pos.x - draggingElement.offsetX, y: pos.y - draggingElement.offsetY } : tb));
            }
            return;
        }

        // Handle canvas drawing
        if (!isDrawing || !currentStroke) return;
        e.preventDefault();

        const pos = getMousePos(e);
        setCurrentStroke(prev => {
            if (!prev) return null;
            return {
                ...prev,
                points: [...prev.points, pos]
            };
        });
    };

    const stopInteraction = () => {
        if (draggingElement) setDraggingElement(null);

        if (!isDrawing || !currentStroke) return;

        setIsDrawing(false);
        setStrokes(prev => [...prev, currentStroke]);
        setCurrentStroke(null);
    };

    const clearCanvas = () => {
        if (confirm("Clear all annotations, sticky notes, and text boxes? This cannot be undone.")) {
            setStrokes([]);
            setStickyNotes([]);
            setTextBoxes([]);
        }
    };

    return (
        <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-none">
            {isDrawingMode && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900 border border-white/10 p-2 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] pointer-events-auto transition-all">
                    <button
                        onClick={() => { setTool("pen"); setColor("#2563eb"); }}
                        className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${tool === "pen" && color === "#2563eb" ? "bg-indigo-500/20 text-indigo-400" : "text-gray-400 hover:text-white"}`}
                        title="Blue Pen"
                    >
                        <Pen className="w-5 h-5" />
                        <div className="w-3 h-1 bg-blue-500 rounded-full" />
                    </button>
                    <button
                        onClick={() => { setTool("pen"); setColor("#dc2626"); }}
                        className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${tool === "pen" && color === "#dc2626" ? "bg-red-500/20 text-red-400" : "text-gray-400 hover:text-white"}`}
                        title="Red Pen"
                    >
                        <Pen className="w-5 h-5" />
                        <div className="w-3 h-1 bg-red-600 rounded-full" />
                    </button>
                    <button
                        onClick={() => { setTool("pen"); setColor("#16a34a"); }}
                        className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${tool === "pen" && color === "#16a34a" ? "bg-green-500/20 text-green-400" : "text-gray-400 hover:text-white"}`}
                        title="Green Pen"
                    >
                        <Pen className="w-5 h-5" />
                        <div className="w-3 h-1 bg-green-600 rounded-full" />
                    </button>
                    <button
                        onClick={() => { setTool("pen"); setColor("#171717"); }}
                        className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${tool === "pen" && color === "#171717" ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"}`}
                        title="Black Pen"
                    >
                        <Pen className="w-5 h-5" />
                        <div className="w-3 h-1 bg-gray-900 rounded-full border border-gray-600" />
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-1" />

                    <button
                        onClick={() => { setTool("highlighter"); setColor("#fbbf24"); }}
                        className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${tool === "highlighter" && color === "#fbbf24" ? "bg-yellow-500/20 text-yellow-500" : "text-gray-400 hover:text-white"}`}
                        title="Yellow Highlighter"
                    >
                        <Highlighter className="w-5 h-5" />
                        <div className="w-3 h-1 bg-yellow-400 rounded-full" />
                    </button>
                    <button
                        onClick={() => { setTool("highlighter"); setColor("#4ade80"); }}
                        className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${tool === "highlighter" && color === "#4ade80" ? "bg-green-500/20 text-green-400" : "text-gray-400 hover:text-white"}`}
                        title="Green Highlighter"
                    >
                        <Highlighter className="w-5 h-5" />
                        <div className="w-3 h-1 bg-green-400 rounded-full" />
                    </button>
                    <button
                        onClick={() => { setTool("highlighter"); setColor("#f472b6"); }}
                        className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${tool === "highlighter" && color === "#f472b6" ? "bg-pink-500/20 text-pink-400" : "text-gray-400 hover:text-white"}`}
                        title="Pink Highlighter"
                    >
                        <Highlighter className="w-5 h-5" />
                        <div className="w-3 h-1 bg-pink-400 rounded-full" />
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-1" />

                    <button
                        onClick={() => setTool("eraser")}
                        className={`p-2 rounded-lg transition-colors ${tool === "eraser" ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"}`}
                        title="Eraser"
                    >
                        <Eraser className="w-5 h-5" />
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-1" />

                    <button
                        onClick={() => setTool("sticky")}
                        className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${tool === "sticky" ? "bg-indigo-500/20 text-indigo-400" : "text-gray-400 hover:text-white"}`}
                        title="Add Sticky Note"
                    >
                        <StickyNoteIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setTool("text")}
                        className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${tool === "text" ? "bg-indigo-500/20 text-indigo-400" : "text-gray-400 hover:text-white"}`}
                        title="Add Text Box"
                    >
                        <Type className="w-5 h-5" />
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-1" />

                    <button
                        onClick={clearCanvas}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Clear All"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className={`absolute top-0 left-0 w-full h-full ${isDrawingMode ? (tool === 'sticky' || tool === 'text' ? 'cursor-cell' : 'cursor-crosshair') : 'pointer-events-none'}`}
                onMouseDown={startInteraction}
                onMouseMove={draw}
                onMouseUp={stopInteraction}
                onMouseLeave={stopInteraction}
                onTouchStart={startInteraction}
                onTouchMove={draw}
                onTouchEnd={stopInteraction}
            />

            {/* Render Sticky Notes */}
            {stickyNotes.map(note => (
                <div
                    key={note.id}
                    className={`absolute p-3 shadow-lg rounded-sm ${kalam.className} text-black pointer-events-auto`}
                    style={{ left: note.x, top: note.y, backgroundColor: note.color, zIndex: 30, minWidth: '150px', minHeight: '150px' }}
                >
                    <div
                        className="w-full h-6 cursor-move opacity-30 hover:opacity-100 transition-opacity bg-black/10 absolute top-0 left-0 right-0"
                        onMouseDown={(e) => {
                            if (!isDrawingMode) return;
                            e.stopPropagation();
                            const container = containerRef.current?.getBoundingClientRect();
                            if (container) setDraggingElement({ id: note.id, type: 'sticky', offsetX: e.clientX - container.left - note.x, offsetY: e.clientY - container.top - note.y });
                        }}
                    />
                    <button onClick={() => isDrawingMode && setStickyNotes(prev => prev.filter(n => n.id !== note.id))} className="absolute top-1 right-1 p-0.5 text-black/40 hover:text-black/80 hover:bg-black/10 rounded">
                        <Trash2 className="w-3 h-3" />
                    </button>
                    <textarea
                        className="w-full h-[calc(100%-24px)] mt-4 bg-transparent border-none outline-none resize-none font-bold text-lg"
                        value={note.text}
                        onChange={(e) => setStickyNotes(prev => prev.map(n => n.id === note.id ? { ...n, text: e.target.value } : n))}
                        disabled={!isDrawingMode}
                        placeholder="Type note..."
                    />
                </div>
            ))}

            {/* Render Text Boxes */}
            {textBoxes.map(tb => (
                <div
                    key={tb.id}
                    className={`absolute p-2 ${kalam.className} pointer-events-auto min-w-[100px] border-2 border-transparent hover:border-indigo-500/30 transition-colors rounded`}
                    style={{ left: tb.x, top: tb.y, zIndex: 30 }}
                >
                    <div
                        className="absolute -top-4 -left-4 w-6 h-6 cursor-move bg-indigo-500 rounded-full text-white flex items-center justify-center opacity-0 hover:opacity-100 shadow-sm transition-opacity"
                        onMouseDown={(e) => {
                            if (!isDrawingMode) return;
                            e.stopPropagation();
                            const container = containerRef.current?.getBoundingClientRect();
                            if (container) setDraggingElement({ id: tb.id, type: 'text', offsetX: e.clientX - container.left - tb.x, offsetY: e.clientY - container.top - tb.y });
                        }}
                    >
                        <span className="text-[10px]">Move</span>
                    </div>
                    <button onClick={() => isDrawingMode && setTextBoxes(prev => prev.filter(t => t.id !== tb.id))} className="absolute -top-4 -right-4 w-6 h-6 text-white bg-red-500 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 shadow-sm transition-opacity">
                        <Trash2 className="w-3 h-3" />
                    </button>
                    <textarea
                        className="w-full h-full bg-transparent border-none outline-none resize-none font-bold text-xl text-blue-600 overflow-visible placeholder:text-blue-300"
                        value={tb.text}
                        onChange={(e) => {
                            e.target.style.height = 'auto'; // Auto-resize text area vertically
                            e.target.style.height = e.target.scrollHeight + 'px';
                            setTextBoxes(prev => prev.map(t => t.id === tb.id ? { ...t, text: e.target.value } : t));
                        }}
                        disabled={!isDrawingMode}
                        placeholder="Text..."
                        rows={1}
                    />
                </div>
            ))}
        </div>
    );
}
