"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, Coffee, Music, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { useDailyProgress } from "@/hooks/useDailyProgress";

type TimerState = "setup" | "focus" | "break" | "done";

export default function FocusTimer() {
    const [focusMins, setFocusMins] = useState(60);
    const [skipBreaks, setSkipBreaks] = useState(false);
    const [state, setState] = useState<TimerState>("setup");
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [totalFocused, setTotalFocused] = useState(0);
    
    // Audio options
    const [selectedStream, setSelectedStream] = useState("none");
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const streams = {
        lofi: "https://stream.zeno.fm/0r0xa792kw8uv", // Lofi Radio
        nature: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Demo
        none: ""
    };
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { addMinutes } = useDailyProgress();

    const breakCount = skipBreaks ? 0 : Math.max(0, Math.floor(focusMins / 25) - 1);
    const breakDuration = 5; // 5 min breaks

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return clearTimer;
    }, [clearTimer]);

    const startFocus = () => {
        setState("focus");
        setSecondsLeft(focusMins * 60);
        setTotalFocused(0);
        if (selectedStream !== "none") {
            setIsPlayingAudio(true);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            if (isPlayingAudio && selectedStream !== "none") {
                audioRef.current.src = (streams as any)[selectedStream];
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlayingAudio, selectedStream]);

    useEffect(() => {
        if (state !== "focus" && state !== "break") return;

        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearTimer();
                    if (state === "focus") {
                        const earned = focusMins;
                        setTotalFocused(earned);
                        addMinutes(earned);
                        setState("done");
                    } else {
                        // Break done, resume focus
                        setState("focus");
                        return focusMins * 60;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return clearTimer;
    }, [state, clearTimer, focusMins, addMinutes]);

    const handlePause = () => {
        clearTimer();
        setState("setup");
        setIsPlayingAudio(false);
        // Log partial time
        const elapsed = focusMins * 60 - secondsLeft;
        const elapsedMins = Math.floor(elapsed / 60);
        if (elapsedMins > 0) addMinutes(elapsedMins);
    };

    const handleReset = () => {
        clearTimer();
        setState("setup");
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const adjustMins = (delta: number) => {
        setFocusMins((prev) => Math.max(15, Math.min(180, prev + delta)));
    };

    // Setup view
    if (state === "setup") {
        return (
            <div className="glass-panel rounded-2xl border border-slate-900/5 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Get ready to focus</h3>
                <p className="text-[10px] text-slate-500 mb-5 leading-relaxed">
                    Set your duration and start a deep work session.
                </p>

                <div className="flex items-center justify-center gap-1 mb-4">
                    <div className="bg-slate-900/5 rounded-xl border border-slate-900/10 flex items-center">
                        <div className="px-5 py-3 text-center">
                            <span className="text-3xl font-black text-slate-900 tabular-nums">{focusMins}</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">mins</p>
                        </div>
                        <div className="flex flex-col border-l border-slate-900/10">
                            <button onClick={() => adjustMins(15)} className="px-3 py-2 hover:bg-slate-900/5 text-slate-600 hover:text-slate-900 transition-colors border-b border-slate-900/10">
                                <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => adjustMins(-15)} className="px-3 py-2 hover:bg-slate-900/5 text-slate-600 hover:text-slate-900 transition-colors">
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                            <Music className="w-3.5 h-3.5" /> Music & Ambiance
                        </span>
                        <div className="flex gap-2">
                             <a href="https://music.youtube.com" target="_blank" rel="noreferrer" title="YouTube Music">
                                <button className="p-1.5 rounded-lg bg-surface-container-highest flex items-center justify-center hover:text-red-500 transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                             </a>
                             <a href="https://open.spotify.com" target="_blank" rel="noreferrer" title="Spotify">
                                <button className="p-1.5 rounded-lg bg-surface-container-highest flex items-center justify-center hover:text-green-500 transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                             </a>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {["none", "lofi", "nature"].map(s => (
                            <button 
                                key={s}
                                onClick={() => setSelectedStream(s)}
                                className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedStream === s ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container text-on-surface-variant border-outline-variant/10 hover:bg-surface-container-high'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {!skipBreaks && (
                    <p className="text-center text-xs text-slate-500 mb-3">
                        You&apos;ll have <span className="text-slate-900 font-medium">{breakCount}</span> break{breakCount !== 1 ? "s" : ""}.
                    </p>
                )}

                <label className="flex items-center gap-2 justify-center mb-5 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${skipBreaks ? "bg-indigo-500 border-indigo-500" : "border-white/20 group-hover:border-white/40"}`}>
                        {skipBreaks && (
                            <svg className="w-2.5 h-2.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <input type="checkbox" checked={skipBreaks} onChange={(e) => setSkipBreaks(e.target.checked)} className="hidden" />
                    <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">Skip breaks</span>
                </label>

                <button
                    onClick={startFocus}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-slate-900 font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/20"
                >
                    <Play className="w-4 h-4" fill="white" /> Start focus session
                </button>
            </div>
        );
    }

    // Done view
    if (state === "done") {
        return (
            <div className="glass-panel rounded-2xl border border-slate-900/5 p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Session complete!</h3>
                <p className="text-sm text-slate-600 mb-4">
                    You focused for <span className="text-slate-900 font-medium">{totalFocused} minutes</span>.
                </p>
                <button onClick={handleReset} className="px-6 py-2 rounded-xl bg-slate-900/5 border border-slate-900/10 text-slate-900 text-sm font-medium hover:bg-slate-900/10 transition-colors">
                    New session
                </button>
            </div>
        );
    }

    // Active timer (focus or break)
    const progressPercent = state === "break"
        ? ((breakDuration * 60 - secondsLeft) / (breakDuration * 60)) * 100
        : ((focusMins * 60 - secondsLeft) / (focusMins * 60)) * 100;

    return (
        <div className="glass-panel rounded-2xl border border-slate-900/5 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                {state === "focus" ? (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Focusing
                    </span>
                ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                        <Coffee className="w-3 h-3" /> Break
                    </span>
                )}
            </div>

            <p className="text-5xl font-black text-slate-900 tabular-nums mb-2">{formatTime(secondsLeft)}</p>

            <div className="h-1 bg-slate-900/5 rounded-full overflow-hidden mb-5 mx-4">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${state === "break" ? "bg-amber-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={handlePause}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
                >
                    <Pause className="w-4 h-4" /> End
                </button>
                <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className={`p-2 rounded-xl transition-all ${isPlayingAudio ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                    {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
            </div>
            <audio ref={audioRef} loop />
        </div>
    );
}
