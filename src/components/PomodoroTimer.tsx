"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

interface PomodoroTimerProps {
    onComplete: (duration: number) => void;
    subject: string;
}

type TimerState = "idle" | "focus" | "break";

export default function PomodoroTimer({ onComplete, subject }: PomodoroTimerProps) {
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [state, setState] = useState<TimerState>("idle");
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessions] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioRef = useRef<AudioContext | null>(null);

    const playBeep = useCallback(() => {
        try {
            if (!audioRef.current) {
                audioRef.current = new AudioContext();
            }
            const ctx = audioRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.frequency.value = 800;
            oscillator.type = "sine";
            gainNode.gain.value = 0.3;
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            oscillator.stop(ctx.currentTime + 0.5);
        } catch {
            // Audio not supported
        }
    }, []);

    useEffect(() => {
        if (!isRunning) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    playBeep();
                    if (state === "focus") {
                        onComplete(focusDuration);
                        setSessions((s) => s + 1);
                        setState("break");
                        return breakDuration * 60;
                    } else {
                        setState("focus");
                        return focusDuration * 60;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, state, focusDuration, breakDuration, playBeep, onComplete]);

    const startFocus = () => {
        setState("focus");
        setTimeLeft(focusDuration * 60);
        setIsRunning(true);
    };

    const togglePause = () => {
        setIsRunning((prev) => !prev);
    };

    const reset = () => {
        setIsRunning(false);
        setState("idle");
        setTimeLeft(focusDuration * 60);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const totalSeconds = state === "focus" ? focusDuration * 60 : breakDuration * 60;
    const progressAngle = state !== "idle" ? ((totalSeconds - timeLeft) / totalSeconds) * 360 : 0;
    const circumference = 2 * Math.PI * 120;
    const dashOffset = circumference - (progressAngle / 360) * circumference;

    return (
        <div className="w-full max-w-4xl flex flex-col items-center space-y-12">
            {/* Timer & Visual Growth */}
            <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center">
                {/* Circular Progress Background (Organic Glow) */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${state === 'focus' ? 'from-primary/10 to-primary-container/20' : 'from-secondary/10 to-secondary-container/20'} blur-3xl transition-colors duration-1000`}></div>
                
                {/* Central Seedling Visualizer */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-8 relative cursor-pointer group" onClick={state === "idle" ? startFocus : togglePause}>
                        <div className={`w-48 h-48 bg-surface-container-lowest rounded-full shadow-2xl flex items-center justify-center border-4 ${state === 'focus' ? 'border-primary/20' : state === 'break' ? 'border-secondary/20' : 'border-outline/10'} hover:scale-105 transition-transform duration-300`}>
                            {state === "focus" || state === "idle" ? (
                                <span className="material-symbols-outlined text-8xl text-primary drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                            ) : (
                                <span className="material-symbols-outlined text-8xl text-secondary drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>coffee</span>
                            )}
                        </div>
                        {isRunning && (
                            <div className="absolute -inset-4 border border-primary/10 rounded-full animate-ping opacity-20"></div>
                        )}
                    </div>
                
                    {/* Countdown Display */}
                    <div className="space-y-1">
                        <h2 className="text-8xl md:text-9xl font-black font-headline tracking-tighter text-on-surface leading-none tabular-nums">
                            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                        </h2>
                        <p className={`font-medium tracking-[0.4em] uppercase text-sm ${state === 'break' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                            {state === "idle" ? "Ready to Focus" : state === "focus" ? "Deep Focus Session" : "Rest & Recover"}
                        </p>
                        {subject && state === "focus" && (
                            <p className="text-primary font-bold text-xs mt-3 uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full inline-block">
                                Studying {subject}
                            </p>
                        )}
                    </div>
                </div>

                {/* Circular Progress Ring (SVG) */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none opacity-40">
                    <circle className="text-outline-variant/20" cx="50%" cy="50%" fill="transparent" r="48%" stroke="currentColor" strokeWidth="2"></circle>
                    {state !== "idle" && (
                        <circle 
                            className={state === "focus" ? "text-primary transition-all duration-1000 ease-linear" : "text-secondary transition-all duration-1000 ease-linear"} 
                            cx="50%" cy="50%" fill="transparent" r="48%" 
                            stroke="currentColor" 
                            strokeLinecap="round" strokeWidth="8"
                            style={{
                                strokeDasharray: 3.0159 * 100, /* Approx mapping for % radius */
                                strokeDashoffset: (3.0159 * 100) - ((3.0159 * 100) * (progressAngle / 360))
                            }}
                        ></circle>
                    )}
                </svg>
            </div>

            {/* Controls Bento Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {/* Duration settings if idle, otherwise Music Controls */}
                {state === "idle" ? (
                    <div className="col-span-1 md:col-span-2 bg-surface-container-lowest rounded-xl p-6 flex items-center justify-around border border-outline-variant/10 shadow-sm">
                        <div className="text-center">
                            <label className="text-xs font-bold font-headline text-on-surface-variant uppercase tracking-widest block mb-3">Focus</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { const v = Math.max(5, focusDuration - 5); setFocusDuration(v); setTimeLeft(v * 60); }}
                                    className="w-10 h-10 rounded-full hover:bg-surface-container text-on-surface font-bold transition-colors border border-outline-variant/20"
                                >−</button>
                                <span className="text-2xl font-black text-primary w-12 text-center">{focusDuration}</span>
                                <button
                                    onClick={() => { const v = Math.min(60, focusDuration + 5); setFocusDuration(v); setTimeLeft(v * 60); }}
                                    className="w-10 h-10 rounded-full hover:bg-surface-container text-on-surface font-bold transition-colors border border-outline-variant/20"
                                >+</button>
                            </div>
                        </div>
                        <div className="w-px h-16 bg-outline-variant/20"></div>
                        <div className="text-center">
                            <label className="text-xs font-bold font-headline text-on-surface-variant uppercase tracking-widest block mb-3">Break</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setBreakDuration(Math.max(1, breakDuration - 1))}
                                    className="w-10 h-10 rounded-full hover:bg-surface-container text-on-surface font-bold transition-colors border border-outline-variant/20"
                                >−</button>
                                <span className="text-2xl font-black text-secondary w-12 text-center">{breakDuration}</span>
                                <button
                                    onClick={() => setBreakDuration(Math.min(30, breakDuration + 1))}
                                    className="w-10 h-10 rounded-full hover:bg-surface-container text-on-surface font-bold transition-colors border border-outline-variant/20"
                                >+</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="col-span-1 md:col-span-2 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between h-40 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant mb-1">Ambient Soundscape</p>
                                <h3 className="text-xl font-bold font-headline text-primary">Greenhouse Rain</h3>
                            </div>
                            <span className="material-symbols-outlined text-primary-dim">music_note</span>
                        </div>
                        <div className="flex items-center gap-6 mt-4">
                            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors">
                                <span className="material-symbols-outlined">skip_previous</span>
                            </button>
                            <button className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                            </button>
                            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors">
                                <span className="material-symbols-outlined">skip_next</span>
                            </button>
                            <div className="flex-grow flex items-center gap-3 ml-4">
                                <span className="material-symbols-outlined text-xs text-on-surface-variant">volume_down</span>
                                <div className="h-1.5 flex-grow bg-outline-variant/30 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-primary rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Session Stats/Action Card */}
                <div 
                  onClick={state === "idle" ? startFocus : reset}
                  className={`${state === 'idle' ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant/20'} rounded-xl p-6 flex flex-col justify-center items-center text-center shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.02]`}
                >
                    {state === "idle" ? (
                       <>
                         <span className="material-symbols-outlined text-4xl mb-2 text-on-primary">potted_plant</span>
                         <p className="text-xs font-bold font-headline uppercase tracking-widest opacity-80 mb-1 text-on-primary">Potential Yield</p>
                         <p className="text-2xl font-black font-headline text-white">+ {Math.max(1, Math.round((focusDuration / 25) * 2))} Tomatoes</p>
                       </>
                    ) : (
                       <>
                         <span className="material-symbols-outlined text-4xl mb-2 text-primary">refresh</span>
                         <p className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant mb-1">Session Active</p>
                         <p className="text-2xl font-black font-headline text-on-surface">Reset Timer</p>
                       </>
                    )}
                </div>
            </div>

            {/* Session count */}
            {sessionsCompleted > 0 && (
                <div className="mt-8 text-sm font-medium text-on-surface-variant bg-surface-container px-6 py-2 rounded-full">
                    <span className="text-primary font-bold">{sessionsCompleted}</span> harvest{sessionsCompleted !== 1 ? 's' : ''} completed today
                </div>
            )}
        </div>
    );
}
