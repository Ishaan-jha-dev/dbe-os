"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type Question = {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
};

type QuizComponentProps = {
    questions: Question[];
    onComplete?: () => void;
};

export default function QuizComponent({ questions, onComplete }: QuizComponentProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    if (!questions || questions.length === 0) {
        return <div className="text-gray-400">No questions available for this module.</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleSubmit = () => {
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore(score + 1);
        }
        setIsSubmitted(true);
    };

    const handleNext = () => {
        if (isLastQuestion) {
            if (onComplete) onComplete();
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsSubmitted(false);
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-left max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-semibold text-indigo-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm font-semibold text-gray-400">
                    Score: {score}
                </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-6">
                {currentQuestion.text}
            </h3>

            <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => {
                    let optionClass = "bg-gray-700 border-gray-600 hover:bg-gray-650 cursor-pointer text-gray-200";

                    if (isSubmitted) {
                        if (index === currentQuestion.correctAnswer) {
                            optionClass = "bg-green-900/50 border-green-500 text-green-100";
                        } else if (selectedAnswer === index) {
                            optionClass = "bg-red-900/50 border-red-500 text-red-100";
                        } else {
                            optionClass = "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed opacity-50";
                        }
                    } else if (selectedAnswer === index) {
                        optionClass = "bg-indigo-900/50 border-indigo-500 text-indigo-100 ring-2 ring-indigo-500/50";
                    }

                    return (
                        <div
                            key={index}
                            onClick={() => !isSubmitted && setSelectedAnswer(index)}
                            className={`p-4 rounded-lg border transition-all duration-200 flex items-start gap-3 ${optionClass} ${!isSubmitted && 'hover:-translate-y-0.5'}`}
                        >
                            <div className="mt-0.5 flex-shrink-0">
                                {isSubmitted && index === currentQuestion.correctAnswer && (
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                )}
                                {isSubmitted && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                                    <XCircle className="w-5 h-5 text-red-400" />
                                )}
                                {(!isSubmitted || (index !== currentQuestion.correctAnswer && index !== selectedAnswer)) && (
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${selectedAnswer === index ? 'border-indigo-400 text-indigo-400' : 'border-gray-500 text-gray-400'}`}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                )}
                            </div>
                            <span className="font-medium">{option}</span>
                        </div>
                    );
                })}
            </div>

            {isSubmitted && (
                <div className={`p-4 rounded-lg mb-6 border ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
                    <p className="font-bold text-sm mb-1 text-white">
                        {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                    </p>
                    <p className="text-gray-300 text-sm">
                        {currentQuestion.explanation}
                    </p>
                </div>
            )}

            <div className="flex justify-end">
                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                    >
                        Submit Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-lg transition-colors"
                    >
                        {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                    </button>
                )}
            </div>
        </div>
    );
}
