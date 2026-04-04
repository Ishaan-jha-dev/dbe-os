"use client";
 
import React, { useRef, useState, useEffect } from "react";
import { Pen, Eraser, Trash2, Highlighter, StickyNote as StickyNoteIcon, Type, Pencil } from "lucide-react";
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
    opacity: number;
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
    const [color, setColor] = useState("#2563eb"); 
    const [brushSize, setBrushSize] = useState(3);
    const [opacity, setOpacity] = useState(1);
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
 
            const rect = container.getBoundingClientRect();
            const scale = window.devicePixelRatio || 1;
 
            canvas.width = rect.width * scale;
            canvas.height = rect.height * scale;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
 
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.scale(scale, scale);
                redrawCanvas(ctx, strokes);
            }
        };
 
        const loadSavedStrokes = () => {
            try {
                const saved = localStorage.getItem(`note_annotations_${noteId}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
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
        const sto = setTimeout(resizeCanvas, 100);
        window.addEventListener("resize", resizeCanvas);
 
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            clearTimeout(sto);
        };
    }, [noteId]);
 
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
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
 
        if (stroke.tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = stroke.width * 5;
            ctx.strokeStyle = "rgba(0,0,0,1)";
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        } else if (stroke.tool === "highlighter") {
            ctx.globalCompositeOperation = "source-over";
            ctx.lineWidth = stroke.width * 8;
            ctx.strokeStyle = stroke.color + (Math.round(stroke.opacity * 150).toString(16).padStart(2, '0')); 
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = stroke.color + (Math.round(stroke.opacity * 255).toString(16).padStart(2, '0'));
            ctx.beginPath();
            ctx.lineWidth = stroke.width;
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                const xc = (stroke.points[i].x + stroke.points[i - 1].x) / 2;
                const yc = (stroke.points[i].y + stroke.points[i - 1].y) / 2;
                ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, xc, yc);
            }
            ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
    };
 
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
        if ("touches" in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
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
            setStickyNotes([...stickyNotes, { id: Date.now().toString(), x: pos.x, y: pos.y, text: "", color: randomColor }]);
            setTool("pen"); 
            return;
        }
 
        if (tool === "text") {
            setTextBoxes([...textBoxes, { id: Date.now().toString(), x: pos.x, y: pos.y, text: "" }]);
            setTool("pen");
            return;
        }
 
        e.preventDefault();
        setIsDrawing(true);
        setCurrentStroke({
            tool,
            color,
            width: tool === "eraser" ? 20 : (tool === "highlighter" ? 12 : brushSize),
            opacity: tool === "highlighter" ? 0.3 : opacity,
            points: [pos]
        });
    };
 
    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingMode) return;
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
        if (confirm("Clear all annotations?")) {
            setStrokes([]);
            setStickyNotes([]);
            setTextBoxes([]);
        }
    };
 
    return (
        <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-none">
            {isDrawingMode && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900 border border-white/20 p-2.5 rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] pointer-events-auto z-[9999] transition-all border-b-2 border-indigo-500/50 backdrop-blur-xl">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => { setTool("pen"); setColor("#2563eb"); }}
                            className={`p-2.5 rounded-xl transition-all ${tool === "pen" && color === "#2563eb" ? "bg-indigo-600 text-white shadow-inner scale-105" : "text-gray-400 hover:text-white"}`}
                            title="Blue Pen"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => { setTool("pen"); setColor("#dc2626"); }}
                            className={`p-2.5 rounded-xl transition-all ${tool === "pen" && color === "#dc2626" ? "bg-red-600 text-white shadow-inner scale-105" : "text-gray-400 hover:text-white"}`}
                            title="Red Pen"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => { setTool("pen"); setColor("#16a34a"); }}
                            className={`p-2.5 rounded-xl transition-all ${tool === "pen" && color === "#16a34a" ? "bg-green-600 text-white shadow-inner scale-105" : "text-gray-400 hover:text-white"}`}
                            title="Green Pen"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                        <div className="ml-2 flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10 group relative">
                             <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Brush Size</span>
                            {[2, 4, 8].map(s => (
                                <button key={s} onClick={() => setBrushSize(s)} className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${brushSize === s ? "bg-white/20 border border-white/20" : "hover:bg-white/5"}`}>
                                    <div className="bg-white rounded-full" style={{ width: s, height: s }} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/20 mx-2" />
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => { setTool("highlighter"); setColor("#fbbf24"); }}
                            className={`p-2.5 rounded-xl transition-all ${tool === "highlighter" && color === "#fbbf24" ? "bg-yellow-500/30 text-yellow-500 ring-2 ring-yellow-500/20 shadow-inner scale-105" : "text-gray-400 hover:text-white"}`}
                            title="Highlighter"
                        >
                            <Highlighter className="w-5 h-5" />
                        </button>
                        <div className="ml-2 flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10 group relative">
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Opacity</span>
                            {[1, 0.5, 0.2].map(o => (
                                <button key={o} onClick={() => setOpacity(o)} className={`w-9 h-7 text-[9px] font-bold rounded-md transition-all ${opacity === o ? "bg-white/20 text-white border border-white/20" : "text-gray-500 hover:text-gray-300"}`}>
                                    {o * 100}%
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/20 mx-2" />
                    <button onClick={() => setTool("eraser")} className={`p-2.5 rounded-xl transition-all ${tool === "eraser" ? "bg-white/20 text-white shadow-inner scale-105" : "text-gray-400 hover:text-white"}`} title="Eraser"><Eraser className="w-5 h-5" /></button>
                    <button onClick={() => setTool("sticky")} className={`p-2.5 rounded-xl transition-all ${tool === "sticky" ? "bg-indigo-500/10 text-indigo-400 shadow-inner" : "text-gray-400 hover:text-white"}`} title="Sticky Note"><StickyNoteIcon className="w-5 h-5" /></button>
                    <button onClick={clearCanvas} className="p-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all ml-1" title="Clear Page"><Trash2 className="w-5 h-5" /></button>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={`absolute top-0 left-0 w-full h-full ${isDrawingMode ? (tool === 'sticky' ? 'cursor-cell pointer-events-auto' : 'cursor-crosshair pointer-events-auto') : 'pointer-events-none'}`}
                onMouseDown={startInteraction}
                onMouseMove={draw}
                onMouseUp={stopInteraction}
                onMouseLeave={stopInteraction}
                onTouchStart={startInteraction}
                onTouchMove={draw}
                onTouchEnd={stopInteraction}
            />
            {stickyNotes.map(note => (
                <div key={note.id} className={`absolute p-3 shadow-lg rounded-sm ${kalam.className} text-black pointer-events-auto`} style={{ left: note.x, top: note.y, backgroundColor: note.color, zIndex: 30, minWidth: '150px', minHeight: '150px' }}>
                    <div className="w-full h-6 cursor-move opacity-30 hover:opacity-100 bg-black/10 absolute top-0 left-0 right-0" onMouseDown={(e) => { if (!isDrawingMode) return; e.stopPropagation(); const container = containerRef.current?.getBoundingClientRect(); if (container) setDraggingElement({ id: note.id, type: 'sticky', offsetX: e.clientX - container.left - note.x, offsetY: e.clientY - container.top - note.y }); }} />
                    <button onClick={() => isDrawingMode && setStickyNotes(prev => prev.filter(n => n.id !== note.id))} className="absolute top-1 right-1 p-0.5 text-black/40 hover:text-black/80 hover:bg-black/10 rounded"><Trash2 className="w-3 h-3" /></button>
                    <textarea className="w-full h-[calc(100%-24px)] mt-4 bg-transparent border-none outline-none resize-none font-bold text-lg" value={note.text} onChange={(e) => setStickyNotes(prev => prev.map(n => n.id === note.id ? { ...n, text: e.target.value } : n))} disabled={!isDrawingMode} placeholder="Type note..." />
                </div>
            ))}
        </div>
    );
}
