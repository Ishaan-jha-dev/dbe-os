"use client";

import React, { useState, useEffect, useRef } from "react";
import { Question } from "@/data/db";
import { Check, X, ArrowRight, Clock, Flag, Eraser, Eye, LogOut } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useQuizHistory } from "@/hooks/useQuizHistory";

interface QuizEngineProps {
    subjectId: string;
    moduleId: number;
    questions: Question[];
    mode: "practice" | "exam";
    onComplete: () => void;
}

type QuestionStatus = "not-visited" | "unanswered" | "answered" | "marked";

export default function QuizEngine({ subjectId, moduleId, questions, mode, onComplete }: QuizEngineProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
    const [statuses, setStatuses] = useState<QuestionStatus[]>(
        new Array(questions.length).fill("not-visited")
    );
    const [showAnswer, setShowAnswer] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(Date.now());

    const { markModuleComplete } = useProgress();
    const { saveAttempt } = useQuizHistory();

    // Timer
    useEffect(() => {
        if (submitted) return;
        timerRef.current = setInterval(() => {
            setTotalTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [submitted]);

    // Mark current as visited
    useEffect(() => {
        setStatuses((prev) => {
            const next = [...prev];
            if (next[currentIndex] === "not-visited") {
                next[currentIndex] = "unanswered";
            }
            return next;
        });
        setShowAnswer(false);
    }, [currentIndex]);

    if (questions.length === 0) {
        return <p className="text-gray-400">No questions available.</p>;
    }

    const question = questions[currentIndex];
    const selectedOption = answers[currentIndex];
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const selectOption = (idx: number) => {
        if (submitted) return;
        const next = [...answers];
        next[currentIndex] = idx;
        setAnswers(next);

        setStatuses((prev) => {
            const ns = [...prev];
            if (ns[currentIndex] !== "marked") ns[currentIndex] = "answered";
            return ns;
        });
    };

    const clearResponse = () => {
        if (submitted) return;
        const next = [...answers];
        next[currentIndex] = null;
        setAnswers(next);
        setStatuses((prev) => {
            const ns = [...prev];
            ns[currentIndex] = "unanswered";
            return ns;
        });
    };

    const markForReview = () => {
        if (submitted) return;
        setStatuses((prev) => {
            const ns = [...prev];
            ns[currentIndex] = ns[currentIndex] === "marked" ? (answers[currentIndex] !== null ? "answered" : "unanswered") : "marked";
            return ns;
        });
        // Move to next
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const submitAll = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const score = answers.reduce<number>((acc, ans, i) => acc + (ans === questions[i].correctAnswer ? 1 : 0), 0);
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setTotalTimeSpent(elapsed);
        markModuleComplete(subjectId, moduleId, score, questions.length);
        saveAttempt({ subjectId, moduleId, mode, score, total: questions.length, timeSpent: elapsed });
        setSubmitted(true);
    };

    const submitAndNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // Count stats for navigator
    const counts = {
        notVisited: statuses.filter((s) => s === "not-visited").length,
        unanswered: statuses.filter((s) => s === "unanswered").length,
        answered: statuses.filter((s) => s === "answered").length,
        marked: statuses.filter((s) => s === "marked").length,
    };

    // Submitted results view
    if (submitted) {
        const score = answers.reduce<number>((acc, ans, i) => acc + (ans === questions[i].correctAnswer ? 1 : 0), 0);
        const percentage = Math.round((score / questions.length) * 100);
        const mins = Math.floor(totalTimeSpent / 60);
        const secs = totalTimeSpent % 60;

        return (
            <div className="glass-panel rounded-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-500 border border-white/10 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-indigo-400" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">
                    {mode === "exam" ? "Exam Complete" : "Practice Complete"}
                </h2>
                <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {mins}m {secs}s
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="glass-panel rounded-xl p-3 border border-white/5">
                        <p className="text-2xl font-black text-white">{score}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Correct</p>
                    </div>
                    <div className="glass-panel rounded-xl p-3 border border-white/5">
                        <p className="text-2xl font-black text-white">{questions.length - score}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Wrong</p>
                    </div>
                    <div className="glass-panel rounded-xl p-3 border border-white/5">
                        <p className="text-2xl font-black text-white">{percentage}%</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Accuracy</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${percentage >= 70 ? "bg-green-500" : percentage >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <button
                    onClick={onComplete}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
                >
                    Return to Overview
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-4 w-full animate-in fade-in duration-300">
            {/* Left: Question area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <div className="flex items-center justify-between glass-panel rounded-xl p-3 mb-4 border border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Q. {currentIndex + 1}
                        </span>
                        {mode === "exam" && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                EXAM
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-mono tabular-nums">{formatTime(totalTimeSpent)}</span>
                        <span className="text-gray-600">Time Spent</span>
                    </div>
                </div>

                {/* Question content */}
                <div className="glass-panel rounded-2xl p-6 border border-white/5 flex-1">
                    <h2 className="text-lg font-bold text-white leading-relaxed mb-6 whitespace-pre-wrap">
                        {question.text}
                    </h2>

                    <div className="space-y-2.5">
                        {question.options.map((opt, idx) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = idx === question.correctAnswer;

                            let btnClass = "w-full p-3.5 rounded-xl border text-left transition-all relative font-medium text-sm ";

                            if (showAnswer) {
                                if (isCorrect) {
                                    btnClass += "bg-green-500/10 border-green-500/40 text-green-300";
                                } else if (isSelected && !isCorrect) {
                                    btnClass += "bg-red-500/10 border-red-500/40 text-red-300";
                                } else {
                                    btnClass += "bg-white/[0.02] border-white/5 text-gray-500";
                                }
                            } else if (isSelected) {
                                btnClass += "bg-indigo-500/10 border-indigo-500/40 text-white";
                            } else {
                                btnClass += "bg-white/[0.02] border-white/5 text-gray-300 hover:border-indigo-500/30 hover:bg-white/[0.05] hover:text-white";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => selectOption(idx)}
                                    className={btnClass}
                                    disabled={showAnswer}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold transition-all ${showAnswer && isCorrect ? "bg-green-500/20 text-green-400 border border-green-500/40" :
                                                showAnswer && isSelected && !isCorrect ? "bg-red-500/20 text-red-400 border border-red-500/40" :
                                                    isSelected ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40" :
                                                        "bg-white/5 text-gray-500 border border-white/10"
                                            }`}>
                                            {showAnswer && isCorrect ? <Check className="w-3 h-3" /> :
                                                showAnswer && isSelected && !isCorrect ? <X className="w-3 h-3" /> :
                                                    String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="flex-1">{opt}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Show explanation when answer is shown */}
                    {showAnswer && question.explanation && (
                        <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 animate-in fade-in duration-300">
                            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1.5">Explanation</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{question.explanation}</p>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-6 flex-wrap">
                        <button
                            onClick={markForReview}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-all"
                        >
                            <Flag className="w-3 h-3" /> Mark for Review & Next
                        </button>
                        <button
                            onClick={clearResponse}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all"
                        >
                            <Eraser className="w-3 h-3" /> Clear Response
                        </button>
                        <button
                            onClick={() => setShowAnswer(!showAnswer)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-all"
                        >
                            <Eye className="w-3 h-3" /> {showAnswer ? "Hide Answer" : "Show Answer"}
                        </button>
                        <button
                            onClick={submitAndNext}
                            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-all"
                        >
                            Submit & Next <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Question Navigator */}
            <div className="w-56 flex-shrink-0 hidden lg:flex flex-col">
                <div className="glass-panel rounded-2xl p-4 border border-white/5 flex-1 flex flex-col">
                    {/* Status legend */}
                    <div className="space-y-1.5 mb-4 text-[10px]">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-gray-600/50 border border-gray-500/30" />
                            <span className="text-gray-400">{counts.notVisited} Not Visited</span>
                            <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/30 ml-2" />
                            <span className="text-gray-400">{counts.unanswered} Unanswered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500/30" />
                            <span className="text-gray-400">{counts.answered} Answered</span>
                            <span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500/30 ml-2" />
                            <span className="text-gray-400">{counts.marked} Marked</span>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-5 gap-1.5 flex-1 content-start">
                        {questions.map((_, i) => {
                            const status = statuses[i];
                            const isCurrent = i === currentIndex;
                            let bg = "bg-gray-700/50 text-gray-400 border-gray-600/30";
                            if (status === "answered") bg = "bg-green-500/20 text-green-400 border-green-500/30";
                            if (status === "unanswered") bg = "bg-red-500/20 text-red-400 border-red-500/30";
                            if (status === "marked") bg = "bg-purple-500/20 text-purple-400 border-purple-500/30";

                            return (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`w-8 h-8 rounded-lg border text-[11px] font-bold flex items-center justify-center transition-all ${bg} ${isCurrent ? "ring-2 ring-white/50 scale-110" : "hover:scale-105"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom actions */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                        <button
                            onClick={onComplete}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all"
                        >
                            <LogOut className="w-3 h-3" /> Exit
                        </button>
                        <button
                            onClick={() => { if (confirm(`Submit? ${counts.answered}/${questions.length} answered.`)) submitAll(); }}
                            className="flex-1 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-[10px] font-bold hover:bg-white/15 transition-all"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
