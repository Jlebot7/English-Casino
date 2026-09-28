import React, { useState } from 'react';
import { Volume2, VolumeX, CheckCircle, XCircle, Sparkles, HelpCircle, Award } from 'lucide-react';
import { tts } from '../utils/tts';
import { sounds } from '../utils/soundEffects';

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isLocked = false,
  showNextButton = false,
  onNext
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!question) return null;

  const handleSpeak = (textToSpeak) => {
    setIsSpeaking(true);
    sounds.playChips();
    tts.speak(textToSpeak, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleSelect = (option) => {
    if (hasAnswered || isLocked) return;

    setSelectedOption(option);
    setHasAnswered(true);

    const isCorrect = option === question.correctAnswer;
    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    if (onAnswer) {
      onAnswer(isCorrect, option, question);
    }
  };

  const isCorrectAnswer = selectedOption === question.correctAnswer;

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black border-2 border-amber-500/40 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative Golden Casino Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {question.category || 'General English'}
          </span>
          {questionNumber && (
            <span className="text-xs text-gray-400 font-medium">
              Question {questionNumber} / {totalQuestions || '?'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            +{question.points || 200} Chips
          </span>

          {/* TTS Listen Button */}
          <button
            onClick={() => handleSpeak(question.question)}
            title="Listen to pronunciation (TTS)"
            className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isSpeaking
                ? 'bg-amber-500 text-gray-950 scale-105 shadow-lg shadow-amber-500/40 animate-pulse'
                : 'bg-gray-800 hover:bg-gray-700 text-amber-300 hover:text-amber-200 border border-amber-500/30'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Listen</span>
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="my-4">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-wide leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {question.options.map((opt, idx) => {
          let btnStyle = 'bg-gray-800/80 hover:bg-gray-750 text-gray-200 border-gray-700 hover:border-amber-500/50';
          let icon = null;

          if (hasAnswered) {
            if (opt === question.correctAnswer) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-900/30 scale-[1.01]';
              icon = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
            } else if (opt === selectedOption) {
              btnStyle = 'bg-red-950/80 border-red-500 text-red-200 font-semibold';
              icon = <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
            } else {
              btnStyle = 'bg-gray-900/40 text-gray-500 border-gray-800 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              disabled={hasAnswered || isLocked}
              className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between text-left group relative cursor-pointer disabled:cursor-default ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-black/40 border border-gray-700 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm md:text-base font-medium">{opt}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Individual option TTS */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(opt);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:scale-110 p-1 text-gray-400 hover:text-amber-300 transition-opacity"
                  title="Pronounce option"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                {icon}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {hasAnswered && question.explanation && (
        <div className={`mt-4 p-4 rounded-xl border animate-fadeIn text-sm ${
          isCorrectAnswer 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
            : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
        }`}>
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider mb-1 text-amber-300">
                {isCorrectAnswer ? '🎯 Great Job!' : '💡 Educational Rule:'}
              </p>
              <p className="text-xs md:text-sm leading-relaxed text-gray-200">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Optional Next Button */}
      {hasAnswered && showNextButton && onNext && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onNext}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95"
          >
            Next Challenge →
          </button>
        </div>
      )}
    </div>
  );
}
