import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, RotateCcw, Volume2, Coins, Flame, ArrowLeft, User } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import QuestionCard from '../QuestionCard';

const SYMBOLS = [
  { id: 'cherry', icon: '🍒', name: 'Cherry', mult: 2, weight: 30 },
  { id: 'lemon', icon: '🍋', name: 'Lemon', mult: 3, weight: 25 },
  { id: 'clover', icon: '🍀', name: 'Clover', mult: 4, weight: 20 },
  { id: 'bell', icon: '🔔', name: 'Bell', mult: 5, weight: 15 },
  { id: 'diamond', icon: '💎', name: 'Diamond', mult: 10, weight: 8 },
  { id: 'seven', icon: '7️⃣', name: 'Lucky 7', mult: 25, weight: 4 },
];

export default function SlotsGame({
  activity,
  chips,
  onUpdateChips,
  onFinishGame,
  onBackToLobby,
  activeStudent,
  onRecordStudentScore,
  onAdvanceStudentTurn
}) {
  const [bet, setBet] = useState(50);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const [winMessage, setWinMessage] = useState(null);
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const questions = activity?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Pick random symbol weighted
  const getRandomSymbol = () => {
    const totalWeight = SYMBOLS.reduce((acc, s) => acc + s.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const sym of SYMBOLS) {
      if (rand < sym.weight) return sym;
      rand -= sym.weight;
    }
    return SYMBOLS[0];
  };

  // Pull lever or press spin
  const handleSpinRequest = () => {
    if (isSpinning || awaitingAnswer || gameOver) return;
    if (chips < bet) {
      sounds.playWrong();
      alert("No hay suficientes fichas para esta apuesta. Reduce la apuesta o recarga.");
      return;
    }

    // Deduct bet immediately
    onUpdateChips(-bet);
    if (onRecordStudentScore && activeStudent) {
      onRecordStudentScore(activeStudent.id, -bet, false, false);
    }

    sounds.playLever();

    // Trigger question to authorize spin outcome
    setAwaitingAnswer(true);
    setWinMessage(null);
  };

  // Called when student answers the question
  const handleQuestionAnswer = (isCorrect, selected, question) => {
    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setConsecutiveWins(prev => prev + 1);
    } else {
      setConsecutiveWins(0);
    }

    // Run the slot machine spin animation
    executeReelSpin(isCorrect);
  };

  const executeReelSpin = (isCorrect) => {
    setIsSpinning(true);
    setAwaitingAnswer(false);

    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      sounds.playTick();
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].icon,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].icon,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].icon,
      ]);

      if (ticks > 18) {
        clearInterval(interval);
        finalizeReels(isCorrect);
      }
    }, 90);
  };

  const finalizeReels = (isCorrect) => {
    setIsSpinning(false);

    let finalSymbols;
    let wonChips = 0;

    if (isCorrect) {
      // High chance of 3 matching symbols on correct answer!
      const luckyRoll = Math.random();
      if (luckyRoll > 0.45) {
        // 3 of a kind!
        const hit = getRandomSymbol();
        finalSymbols = [hit.icon, hit.icon, hit.icon];
        wonChips = Math.round(bet * hit.mult * (consecutiveWins >= 2 ? 1.5 : 1));
      } else {
        // 2 of a kind
        const hit = getRandomSymbol();
        const other = getRandomSymbol();
        finalSymbols = [hit.icon, hit.icon, other.icon];
        wonChips = Math.round(bet * 1.5);
      }
    } else {
      // Wrong answer: miss
      const s1 = SYMBOLS[0];
      const s2 = SYMBOLS[1];
      const s3 = SYMBOLS[2];
      finalSymbols = [s1.icon, s2.icon, s3.icon];
      wonChips = 0;
    }

    setReels(finalSymbols);

    if (wonChips > 0) {
      onUpdateChips(wonChips);
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, wonChips, isCorrect, true);
      }

      if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
        // JACKPOT!
        sounds.playJackpot();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setWinMessage(`🎰 ¡MEGA JACKPOT! ¡${activeStudent ? activeStudent.name : 'Ganaste'} +${wonChips} Fichas!`);
      } else {
        sounds.playCoin();
        setWinMessage(`✨ ¡Acierto de Rodillos! +${wonChips} Fichas ganadas.`);
      }
    } else {
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, 0, isCorrect, true);
      }
      setWinMessage('❌ Sin coincidencia. ¡Inténtalo en el próximo turno!');
    }

    // Advance student turn for next question
    if (onAdvanceStudentTurn) {
      setTimeout(() => {
        onAdvanceStudentTurn();
      }, 3000);
    }

    // Check if activity is finished
    if (currentQuestionIndex + 1 >= questions.length) {
      setTimeout(() => {
        setGameOver(true);
        if (onFinishGame) {
          onFinishGame({
            gameId: 'slots',
            correctAnswers: isCorrect ? correctCount + 1 : correctCount,
            totalQuestions: questions.length,
            finalChips: chips + wonChips
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
      {/* Top Bar Navigation */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold border border-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Salir al Lobby
        </button>

        <div className="flex items-center gap-3">
          {activeStudent && (
            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400 px-3 py-1 rounded-xl text-xs font-bold text-amber-300 animate-pulse">
              <span>{activeStudent.avatar}</span>
              <span>Turno: {activeStudent.name}</span>
            </div>
          )}

          {consecutiveWins > 1 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Racha x{consecutiveWins}!
            </span>
          )}

          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600/30 to-yellow-600/30 border border-amber-500/40 px-4 py-1.5 rounded-xl shadow-lg">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black text-amber-300">{chips.toLocaleString()} Fichas</span>
          </div>
        </div>
      </div>

      {/* Main Slot Machine Chassis */}
      <div className="w-full max-w-xl bg-gradient-to-b from-red-950 via-gray-900 to-black border-4 border-amber-500 rounded-3xl p-6 shadow-2xl relative">
        {/* Neon Marquee Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-block bg-black/60 px-6 py-2 rounded-2xl border-2 border-amber-400 shadow-lg shadow-amber-500/30">
            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 tracking-wider">
              🎰 LUCKY SLOTS 777
            </h2>
          </div>
          <p className="text-xs text-amber-200/70 mt-1 uppercase tracking-widest font-semibold">
            {activeStudent ? `Turno de: ${activeStudent.name} ${activeStudent.avatar}` : 'Grammar & Vocabulary Reels'}
          </p>
        </div>

        {/* 3 Reels Window */}
        <div className="bg-gradient-to-b from-gray-950 to-gray-900 border-4 border-yellow-600/60 rounded-2xl p-4 shadow-inner mb-6 relative">
          {/* Payline Guides */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full animate-ping" />

          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {reels.map((icon, idx) => (
              <div
                key={idx}
                className="h-28 md:h-36 bg-gradient-to-b from-white via-amber-50 to-amber-100 border-2 border-amber-400 rounded-xl flex items-center justify-center text-5xl md:text-6xl shadow-lg shadow-black/60 overflow-hidden transform transition-all select-none"
              >
                <span className={`inline-block ${isSpinning ? 'animate-bounce blur-[1px]' : ''}`}>
                  {icon}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Win / Feedback Banner */}
        {winMessage && (
          <div className="mb-4 text-center py-2 px-4 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 font-bold text-sm animate-bounce shadow-md">
            {winMessage}
          </div>
        )}

        {/* Betting Controls & Spin Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-black/40 p-4 rounded-2xl border border-gray-800">
          <div>
            <label className="block text-[11px] text-gray-400 uppercase font-bold mb-1">
              Apuesta en Fichas
            </label>
            <div className="flex items-center gap-1.5">
              {[25, 50, 100, 250].map((amount) => (
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
            onClick={handleSpinRequest}
            disabled={isSpinning || awaitingAnswer || gameOver}
            className={`px-8 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider transition-all transform active:scale-95 shadow-xl flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
              isSpinning || awaitingAnswer
                ? 'bg-gray-700 text-gray-400 border border-gray-600'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-gray-950 border-2 border-yellow-200 shadow-amber-500/40 hover:scale-105'
            }`}
          >
            <Sparkles className="w-5 h-5 text-gray-950" />
            {isSpinning ? 'Girando...' : awaitingAnswer ? '¡Responde abajo!' : 'TIRAR Y GIRAR'}
          </button>
        </div>
      </div>

      {/* Educational Challenge Question */}
      {awaitingAnswer && currentQuestion && (
        <div className="w-full mt-6 animate-fadeIn">
          <div className="text-center mb-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              ⚡ {activeStudent ? `¡${activeStudent.name}, responde correctamente para desbloquear el premio!` : '¡Responde correctamente para desbloquear el premio!'}
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
            <h3 className="text-2xl font-black text-white mb-2">¡Ronda Finalizada!</h3>
            <p className="text-gray-300 text-sm mb-4">
              Respuestas correctas: <span className="font-bold text-amber-400">{correctCount}</span> de{' '}
              <span className="font-bold text-amber-400">{questions.length}</span>
            </p>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
              <span className="text-xs text-amber-300 uppercase tracking-wider block mb-1 font-semibold">
                Balance Total de Fichas
              </span>
              <span className="text-3xl font-black text-amber-400">{chips.toLocaleString()} Fichas</span>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onBackToLobby}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl text-sm shadow-lg shadow-amber-500/30 hover:scale-105 transition"
              >
                Volver al Lobby del Casino
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
