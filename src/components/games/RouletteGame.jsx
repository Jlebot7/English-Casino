import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Coins, Sparkles, Trophy, Disc3, Flame } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import QuestionCard from '../QuestionCard';

const SLICES = [
  { label: 'Grammar x2', mult: 2, color: '#dc2626', textColor: '#fff' }, // Red
  { label: 'Vocabulary x3', mult: 3, color: '#18181b', textColor: '#fbbf24' }, // Black
  { label: 'Pronunciation x2', mult: 2, color: '#2563eb', textColor: '#fff' }, // Blue
  { label: 'Idioms x4', mult: 4, color: '#7c3aed', textColor: '#fff' }, // Purple
  { label: 'MEGA JACKPOT x5', mult: 5, color: '#d97706', textColor: '#000' }, // Gold
  { label: 'Speaking x2', mult: 2, color: '#059669', textColor: '#fff' }, // Green
  { label: 'Bonus Trivia x3', mult: 3, color: '#be123c', textColor: '#fff' }, // Rose
  { label: 'Lucky Star x2', mult: 2, color: '#0f172a', textColor: '#38bdf8' }, // Slate
];

export default function RouletteGame({
  activity,
  chips,
  onUpdateChips,
  onFinishGame,
  onBackToLobby
}) {
  const canvasRef = useRef(null);
  const [bet, setBet] = useState(50);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const [winMessage, setWinMessage] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Rotation angle in radians
  const rotationRef = useRef(0);
  const angularVelocityRef = useRef(0);
  const lastTickSliceRef = useRef(-1);

  const questions = activity?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const numSlices = SLICES.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Draw the roulette wheel on canvas
  const drawWheel = (rotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 15;

    ctx.clearRect(0, 0, width, height);

    // Outer golden rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#b45309';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Rivets / casino lights around rim
    const totalRivets = 24;
    for (let i = 0; i < totalRivets; i++) {
      const rAngle = (i * 2 * Math.PI) / totalRivets;
      const rx = centerX + (radius + 5) * Math.cos(rAngle);
      const ry = centerY + (radius + 5) * Math.sin(rAngle);
      ctx.beginPath();
      ctx.arc(rx, ry, 3, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#ffffff';
      ctx.fill();
    }
    ctx.restore();

    // Draw slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const slice = SLICES[i];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = slice.textColor;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(slice.label, radius - 20, 5);
      ctx.restore();

      ctx.restore();
    }

    // Inner Hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VEGAS', centerX, centerY - 4);
    ctx.font = '9px system-ui';
    ctx.fillText('ENGLISH', centerX, centerY + 12);
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(0);
  }, []);

  const spinRoulette = () => {
    if (isSpinning || awaitingAnswer || gameOver) return;
    if (chips < bet) {
      sounds.playWrong();
      alert("Not enough chips! Please lower your bet.");
      return;
    }

    onUpdateChips(-bet);
    sounds.playLever();
    setIsSpinning(true);
    setWinMessage(null);
    setSelectedSlice(null);

    // Initial angular velocity (randomized for fair casino physics)
    let velocity = 0.35 + Math.random() * 0.25;
    const friction = 0.988;

    const animate = () => {
      rotationRef.current += velocity;
      velocity *= friction;

      // Check needle ticks (Pointer is at top, which is 3 * Math.PI / 2 or -Math.PI / 2)
      // Normalize angle to find slice under pointer
      const pointerAngle = (3 * Math.PI / 2 - (rotationRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const currentSliceIdx = Math.floor(pointerAngle / sliceAngle) % numSlices;

      if (currentSliceIdx !== lastTickSliceRef.current) {
        sounds.playTick();
        lastTickSliceRef.current = currentSliceIdx;
      }

      drawWheel(rotationRef.current);

      if (velocity > 0.002) {
        requestAnimationFrame(animate);
      } else {
        // Stopped!
        setIsSpinning(false);
        const winningSlice = SLICES[currentSliceIdx];
        setSelectedSlice(winningSlice);
        sounds.playChips();
        setAwaitingAnswer(true);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleQuestionAnswer = (isCorrect) => {
    setAwaitingAnswer(false);

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setConsecutiveWins(prev => prev + 1);

      const mult = selectedSlice?.mult || 2;
      const won = Math.round(bet * mult * (consecutiveWins >= 2 ? 1.5 : 1));
      onUpdateChips(won);

      if (mult >= 4) {
        sounds.playJackpot();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setWinMessage(`🎉 ROULETTE HIT! Landed on ${selectedSlice.label} - Won +${won} Chips!`);
      } else {
        sounds.playCoin();
        setWinMessage(`✨ Correct Answer! Won +${won} Chips!`);
      }
    } else {
      setConsecutiveWins(0);
      sounds.playWrong();
      setWinMessage('❌ Incorrect. The house wins this spin!');
    }

    if (currentQuestionIndex + 1 >= questions.length) {
      setTimeout(() => {
        setGameOver(true);
        if (onFinishGame) {
          onFinishGame({
            gameId: 'roulette',
            correctAnswers: isCorrect ? correctCount + 1 : correctCount,
            totalQuestions: questions.length,
            finalChips: chips + (isCorrect ? Math.round(bet * (selectedSlice?.mult || 2)) : 0)
          });
        }
      }, 2500);
    } else {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setWinMessage(null);
      }, 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col items-center">
      {/* Top Header Navigation */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold border border-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Exit to Lobby
        </button>

        <div className="flex items-center gap-3">
          {consecutiveWins > 1 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Streak x{consecutiveWins}!
            </span>
          )}

          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600/30 to-yellow-600/30 border border-amber-500/40 px-4 py-1.5 rounded-xl shadow-lg">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black text-amber-300">{chips.toLocaleString()} Chips</span>
          </div>
        </div>
      </div>

      {/* Main Roulette Table Frame */}
      <div className="w-full max-w-xl bg-gradient-to-b from-gray-900 via-gray-950 to-black border-4 border-amber-500 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center">
        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200">
            🎡 ROULETTE OF FORTUNE
          </h2>
          <p className="text-xs text-amber-200/70 uppercase tracking-widest font-semibold mt-1">
            Spin the Wheel & Answer the Category
          </p>
        </div>

        {/* Wheel Container with Pointer Needle */}
        <div className="relative my-2">
          {/* Top Pointer Needle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />

          {/* Canvas Roulette */}
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            className="rounded-full shadow-2xl border-4 border-amber-600/40"
          />
        </div>

        {/* Selected Sector Indicator */}
        {selectedSlice && (
          <div className="mt-3 px-4 py-1.5 rounded-full border border-amber-400 bg-amber-500/20 text-amber-300 text-xs font-bold animate-pulse">
            🎯 Landed on: {selectedSlice.label}!
          </div>
        )}

        {winMessage && (
          <div className="mt-3 text-center py-2 px-4 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 font-bold text-sm animate-bounce">
            {winMessage}
          </div>
        )}

        {/* Betting Controls & Spin Button */}
        <div className="w-full flex flex-wrap items-center justify-between gap-4 bg-black/50 p-4 rounded-2xl border border-gray-800 mt-4">
          <div>
            <label className="block text-[11px] text-gray-400 uppercase font-bold mb-1">
              Select Bet (Chips)
            </label>
            <div className="flex items-center gap-1.5">
              {[50, 100, 200, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    sounds.playChips();
                    setBet(amount);
                  }}
                  disabled={isSpinning || awaitingAnswer}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    bet === amount
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30'
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-amber-400'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={spinRoulette}
            disabled={isSpinning || awaitingAnswer || gameOver}
            className={`px-8 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider transition-all transform active:scale-95 shadow-xl flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
              isSpinning || awaitingAnswer
                ? 'bg-gray-700 text-gray-400 border border-gray-600'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-gray-950 border-2 border-yellow-200 shadow-amber-500/40 hover:scale-105'
            }`}
          >
            <Disc3 className={`w-5 h-5 text-gray-950 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Spinning Wheel...' : awaitingAnswer ? 'Answer Below!' : 'SPIN ROULETTE'}
          </button>
        </div>
      </div>

      {/* Challenge Question */}
      {awaitingAnswer && currentQuestion && (
        <div className="w-full mt-6 animate-fadeIn">
          <div className="text-center mb-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              ⚡ Landed on {selectedSlice?.label}! Answer to claim your prize!
            </span>
          </div>
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleQuestionAnswer}
          />
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-amber-500 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-2xl font-black text-white mb-2">Roulette Session Completed!</h3>
            <p className="text-gray-300 text-sm mb-4">
              You scored <span className="font-bold text-amber-400">{correctCount}</span> /{' '}
              <span className="font-bold text-amber-400">{questions.length}</span> correct answers!
            </p>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
              <span className="text-xs text-amber-300 uppercase tracking-wider block mb-1 font-semibold">
                Final Casino Bankroll
              </span>
              <span className="text-3xl font-black text-amber-400">{chips.toLocaleString()} Chips</span>
            </div>

            <button
              onClick={onBackToLobby}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl text-sm shadow-lg shadow-amber-500/30 hover:scale-105 transition"
            >
              Return to Casino Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
