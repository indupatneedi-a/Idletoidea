import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Quiz, User } from '../types';
import { IdleToIdeaService } from '../services/idleToIdeaService';

interface SafetyQuizModalProps {
  quiz: Quiz | null;
  currentUser: User;
  onClose: () => void;
  onQuizCompleted: (passed: boolean, score: number) => void;
}

export const SafetyQuizModal: React.FC<SafetyQuizModalProps> = ({
  quiz,
  currentUser,
  onClose,
  onQuizCompleted,
}) => {
  if (!quiz) return null;

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<{ passed: boolean; score: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmit = () => {
    setErrorMessage('');
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      setErrorMessage(`Please answer all ${quiz.questions.length} questions before submitting.`);
      return;
    }

    try {
      const res = IdleToIdeaService.submitQuiz(currentUser, quiz.id, selectedAnswers);
      setResult({ passed: res.passed, score: res.score });
      setSubmitted(true);
      onQuizCompleted(res.passed, res.score);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error evaluating quiz.');
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f050a] border border-[#5c0f20] shadow-2xl p-5 sm:p-6 flex flex-col text-[#faedf1] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b0e19]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#8a1731] to-[#3b0914] border border-[#f5b5c8]/50">
              <ShieldAlert className="w-5 h-5 text-[#f5b5c8]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-cinematic uppercase tracking-wide text-[#faedf1]">
                {quiz.title}
              </h3>
              <p className="text-xs text-[#c4adb5] font-mono-film">
                Pass mark: {quiz.passMark}% (4/5) • Max 3 attempts/day • Demo verified
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#c4adb5] hover:text-[#fff] hover:bg-[#3b0e19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Body */}
        <div className="py-4 space-y-6">
          {/* Result Banner if Submitted */}
          {result && (
            <div
              className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                result.passed
                  ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-600/70 text-rose-200'
              }`}
            >
              {result.passed ? (
                <Award className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold text-sm">
                  {result.passed
                    ? `Certification Passed with ${result.score}%!`
                    : `Score: ${result.score}%. Minimum ${quiz.passMark}% required to pass.`}
                </div>
                <p className="text-xs mt-1 text-[#d6c4ca]">
                  {result.passed
                    ? 'Your safety knowledge has been certified and logged in the institutional audit trail. You can now request access.'
                    : 'Review the questions and explanations below to understand proper safety protocols, then try again.'}
                </p>
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {quiz.questions.map((q, qIdx) => {
              const selectedIdx = selectedAnswers[q.id];
              const isCorrect = selectedIdx === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-mono-film text-[#f5b5c8] uppercase">
                      Question {qIdx + 1} of {quiz.questions.length}
                    </span>
                    {submitted && (
                      <span
                        className={`text-[10px] font-mono-film px-2 py-0.5 rounded-full ${
                          isCorrect
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-700'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[#faedf1] leading-relaxed">
                    {q.text}
                  </p>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = selectedIdx === oIdx;
                      let optionBorder = 'border-[#2e0c17] bg-[#0c0407] hover:border-[#5c0f20]';

                      if (submitted) {
                        if (oIdx === q.correctIndex) {
                          optionBorder = 'border-emerald-600 bg-emerald-950/40 text-emerald-100';
                        } else if (isOptionSelected) {
                          optionBorder = 'border-rose-600 bg-rose-950/40 text-rose-200';
                        }
                      } else if (isOptionSelected) {
                        optionBorder = 'border-[#f5b5c8] bg-[#290913] text-[#faedf1] shadow-sm';
                      }

                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center space-x-2.5 transition-all ${optionBorder}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isOptionSelected ? 'border-[#f5b5c8] bg-[#f5b5c8]' : 'border-neutral-600'
                            }`}
                          >
                            {isOptionSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                          <span className="flex-1">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {submitted && (
                    <div className="p-2.5 rounded-xl bg-[#1e0710] border border-[#4a1220] text-[11px] text-[#e094aa] flex items-start space-x-2">
                      <HelpCircle className="w-3.5 h-3.5 text-[#f5b5c8] shrink-0 mt-0.5" />
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#3b0e19] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1f0710] text-xs font-medium text-[#c4adb5] hover:text-[#faedf1]"
          >
            {submitted ? 'Close Window' : 'Cancel'}
          </button>

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#5c0f20] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold shadow-lg shadow-[#8a1731]/40 hover:scale-105 transition-all cursor-pointer"
            >
              Submit Certification Quiz
            </button>
          ) : (
            !result?.passed && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#f5b5c8]" />
                <span>Retry Safety Quiz</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
