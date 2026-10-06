import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Coins, Bomb, Gem, Sparkles, Trophy, AlertCircle, Play, ShieldCheck } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import QuestionCard from '../QuestionCard';

const GRID_SIZE = 25; // 5x5
const MINES_COUNT = 3;

const MULTIPLIERS = [
  1.0,  // 0 gems
  1.15, // 1 gem
  1.42, // 2 gems (min to exonerate)
  1.80, // 3 gems
  2.35, // 4 gems
  3.15, // 5 gems
  4.30, // 6 gems
  6.00  // 7+ gems
];

export default function MinesGame({
  activity,
  chips,
  onUpdateChips,
  onBackToLobby,
  activeStudent,
  onRecordStudentScore,
  onAdvanceStudentTurn,
  onGenerateTurnQuestion
}) {
  const [bet, setBet] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [minePositions, setMinePositions] = useState([]);
  const [revealedTiles, setRevealedTiles] = useState({}); // { [idx]: 'gem' | 'mine' }
  const [gemsFound, setGemsFound] = useState(0);

  // Outcome & Challenge states
  const [roundOutcome, setRoundOutcome] = useState(null); // 'lucky_exonerated' | 'unlucky_challenge' | null
  const [winMessage, setWinMessage] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [turnQuestionOverride, setTurnQuestionOverride] = useState(null);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  const questions = activity?.questions || [];
  const currentQuestion = turnQuestionOverride || questions[currentQuestionIndex % (questions.length || 1)];

  const currentMultiplier = MULTIPLIERS[Math.min(gemsFound, MULTIPLIERS.length - 1)];

  // Start new game session
  const handleStartGame = () => {
    if (isPlaying || roundOutcome === 'unlucky_challenge') return;
    if (chips < bet) {
      sounds.playWrong();
      alert('No tienes suficientes fichas para esta apuesta.');
      return;
    }

    onUpdateChips(-bet);
    sounds.playChips();

    // Place 3 random mines
    const positions = new Set();
    while (positions.size < MINES_COUNT) {
      positions.add(Math.floor(Math.random() * GRID_SIZE));
    }

    setMinePositions(Array.from(positions));
    setRevealedTiles({});
    setGemsFound(0);
    setIsPlaying(true);
    setRoundOutcome(null);
    setWinMessage(null);
    setTurnQuestionOverride(null);
  };

  // Click on tile
  const handleTileClick = (idx) => {
    if (!isPlaying || revealedTiles[idx] !== undefined) return;

    const isMine = minePositions.includes(idx);

    if (isMine) {
      // BOOM!
      sounds.playExplosion();
      const newRevealed = { ...revealedTiles, [idx]: 'mine' };
      // Reveal all other mines
      minePositions.forEach(mIdx => {
        newRevealed[mIdx] = 'mine';
      });
      setRevealedTiles(newRevealed);
      setIsPlaying(false);
      evaluateMineHit();
    } else {
      // GEM!
      sounds.playCoin();
      const nextGems = gemsFound + 1;
      setGemsFound(nextGems);
      setRevealedTiles(prev => ({ ...prev, [idx]: 'gem' }));
    }
  };

  // Cash out and get exonerated
  const handleCashOut = () => {
    if (!isPlaying || gemsFound < 2) return;

    setIsPlaying(false);
    const payout = Math.round(bet * currentMultiplier);
    onUpdateChips(payout);

    // Reveal rest of board
    const fullReveal = { ...revealedTiles };
    minePositions.forEach(m => {
      if (!fullReveal[m]) fullReveal[m] = 'mine';
    });
    setRevealedTiles(fullReveal);

    if (onRecordStudentScore && activeStudent) {
      onRecordStudentScore(activeStudent.id, payout, true, false, {
        machine: 'mines',
        bet,
        outcome: 'exonerated_by_luck',
        question: null
      });
    }

    setRoundOutcome('lucky_exonerated');
    sounds.playJackpot();
    confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });
    setWinMessage(
      `🎉 ¡EXONERADO POR SUERTE EN CASINO MINES! Descubriste ${gemsFound} diamantes (${currentMultiplier.toFixed(2)}x) y te plantaste a salvo. ¡${activeStudent ? activeStudent.name : 'El estudiante'} se salva de la pregunta y cobra +${payout} fichas!`
    );
  };

  const evaluateMineHit = () => {
    setRoundOutcome('unlucky_challenge');
    sounds.playWrong();
    setWinMessage(
      `💥 ¡BOOM! Pisaste una mina oculta. ¡Mala suerte! Debes responder el reto de inglés para defender tus puntos.`
    );
  };

  const handleQuestionAnswer = (isCorrect, selected, q) => {
    if (isCorrect) {
      const reward = (q?.points || 200) + bet;
      onUpdateChips(reward);
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, reward, true, true, {
          machine: 'mines',
          bet,
          outcome: 'answered_correct',
          question: q?.question || 'Reto de Mines'
        });
      }
      sounds.playCorrect();
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      setWinMessage(`🎯 ¡Excelente! ${activeStudent ? activeStudent.name : 'Respuesta correcta'}. Salvaste tu turno y ganaste +${reward} fichas.`);
    } else {
      sounds.playWrong();
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, -bet, false, true, {
          machine: 'mines',
          bet,
          outcome: 'answered_wrong',
          question: q?.question || 'Reto de Mines'
        });
      }
      setWinMessage('❌ Respuesta incorrecta. ¡La casa retiene las fichas este turno!');
    }

    setCurrentQuestionIndex(prev => (prev + 1) % (questions.length || 1));
  };

  const handleGenerateLiveQuestion = async () => {
    if (!onGenerateTurnQuestion) return;
    setIsGeneratingIA(true);
    sounds.playChips();
    try {
      const liveQ = await onGenerateTurnQuestion(activeStudent);
      if (liveQ) {
        setTurnQuestionOverride(liveQ);
        sounds.playCorrect();
      }
    } catch (err) {
      console.error('Error generating AI question:', err);
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handleResetForNextRound = () => {
    setIsPlaying(false);
    setRevealedTiles({});
    setGemsFound(0);
    setRoundOutcome(null);
    setWinMessage(null);
    setTurnQuestionOverride(null);
    if (onAdvanceStudentTurn) {
      onAdvanceStudentTurn();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fadeIn space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900/90 border border-emerald-500/40 p-4 rounded-3xl backdrop-blur-md shadow-xl">
        <button
          onClick={() => {
            sounds.playTick();
            onBackToLobby();
          }}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition px-3 py-1.5 rounded-xl hover:bg-gray-800 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Volver al Lobby</span>
        </button>

        {activeStudent && (
          <div className="flex items-center gap-2.5 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-2xl">
            <span className="text-xl">{activeStudent.avatar || '🎩'}</span>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block leading-tight">Buscador en Turno:</span>
              <span className="text-xs font-black text-white">{activeStudent.name}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 bg-black/60 border border-amber-500/30 px-3.5 py-1.5 rounded-2xl">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-black text-amber-300 font-mono">
            {chips.toLocaleString()} Fichas
          </span>
        </div>
      </div>

      {/* Main Mines Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* 5x5 Matrix Grid */}
        <div className="md:col-span-7 bg-gradient-to-b from-gray-900 via-slate-950 to-black border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gem className="w-4 h-4 text-emerald-400" />
              Tablero 5×5 (3 Minas • 22 Diamantes)
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-black/50 px-2.5 py-1 rounded-xl border border-gray-800">
              💎 {gemsFound} Encontrados
            </span>
          </div>

          {/* Grid Container */}
          <div className={`casino-3d-stage w-full max-w-sm mx-auto ${roundOutcome === 'lucky_exonerated' ? 'win-glow' : ''}`}>
            <div 
              style={{ transform: 'perspective(800px) rotateX(12deg) rotateY(-2deg)' }}
              className="grid grid-cols-5 gap-2.5 p-3 bg-black/60 border border-gray-800 rounded-3xl w-full h-full aspect-square shadow-inner"
            >
              {Array.from({ length: GRID_SIZE }).map((_, idx) => {
                const status = revealedTiles[idx];
                const isRevealed = status !== undefined;

                return (
                  <button
                    key={idx}
                    disabled={!isPlaying || isRevealed}
                    onClick={() => handleTileClick(idx)}
                    className={`relative rounded-2xl transition-all duration-300 flex items-center justify-center text-2xl font-bold cursor-pointer select-none shadow-md ${
                      isRevealed
                        ? status === 'gem'
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-emerald-300 text-white scale-95 shadow-emerald-950/60 tile-flip-3d gem-sparkle'
                          : 'bg-gradient-to-br from-red-600 to-rose-900 border-2 border-red-400 text-white scale-95 animate-shake tile-flip-3d mine-shake shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                        : isPlaying
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-emerald-400 hover:scale-105 active:scale-95 text-gray-400 shadow-[0_6px_0_#1e293b,0_8px_20px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_0_#1e293b,0_10px_24px_rgba(0,0,0,0.5)]'
                        : 'bg-gray-850 border border-gray-800 text-gray-600 opacity-60 shadow-[0_6px_0_#1e293b,0_8px_20px_rgba(0,0,0,0.4)]'
                    }`}
                  >
                    {isRevealed ? (
                      status === 'gem' ? '💎' : '💣'
                    ) : (
                      <span className="text-xs text-gray-500 font-mono">?</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-gray-400 text-center mt-4">
            Encuentra al menos 2 diamantes para poder retirarte y quedar exonerado. ¡Cuidado con las 3 minas!
          </p>
        </div>

        {/* Controls Column */}
        <div className="md:col-span-5 bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Regla de Exoneración
            </div>
            <h3 className="text-xl font-black text-white">
              💣 Casino Mines
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              Destapa casillas con gemas. <strong>¡Si descubres 2 o más diamantes y te retiras con el botón verde, quedas totalmente EXONERADO!</strong>
            </p>
          </div>

          {/* Current Multiplier Badge */}
          <div className="p-3 bg-black/50 border border-gray-800 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Multiplicador Actual:</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {currentMultiplier.toFixed(2)}x
            </span>
          </div>

          {/* Bet Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">
              Fichas en Apuesta:
            </label>
            <div className="flex flex-wrap gap-2">
              {[25, 50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  disabled={isPlaying || roundOutcome === 'unlucky_challenge'}
                  onClick={() => {
                    sounds.playChips();
                    setBet(amt);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    bet === amt
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Play vs Cash Out */}
          {!isPlaying && !roundOutcome && (
            <button
              onClick={handleStartGame}
              disabled={chips < bet}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-950/60 transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 text-yellow-300" />
              <span>INICIAR TABLERO ({bet} Fichas)</span>
            </button>
          )}

          {isPlaying && (
            <button
              onClick={handleCashOut}
              disabled={gemsFound < 2}
              className={`cabinet-3d-shadow w-full py-4 font-black text-base rounded-2xl shadow-xl transition transform cursor-pointer flex items-center justify-center gap-2 border ${
                gemsFound >= 2
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 text-black border-emerald-300 animate-pulse hover:scale-[1.02] metallic-shine relative overflow-hidden'
                  : 'bg-gray-800 border-gray-700 text-gray-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-5 h-5 relative z-10" />
              <span className="relative z-10">
                {gemsFound >= 2
                  ? `PLANTARSE Y EXONERARSE (${Math.round(bet * currentMultiplier)} FICHAS)`
                  : `ENCUENTRA ${2 - gemsFound} GEMA(S) MÁS PARA EXONERARTE`}
              </span>
            </button>
          )}

          {/* Win / Feedback message */}
          {winMessage && (
            <div className={`p-4 rounded-2xl border text-xs md:text-sm leading-relaxed ${
              roundOutcome === 'lucky_exonerated'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/60 border-red-500/50 text-red-200'
            }`}>
              {winMessage}
            </div>
          )}

          {/* Exonerated button */}
          {roundOutcome === 'lucky_exonerated' && (
            <button
              onClick={handleResetForNextRound}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span>Siguiente Turno / Continuar</span>
            </button>
          )}
        </div>
      </div>

      {/* Challenge Section on Mine Hit */}
      {roundOutcome === 'unlucky_challenge' && (
        <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl animate-fadeIn space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-base font-black text-white">
                  Desafío de Inglés por Detonación de Mina
                </h4>
                <p className="text-xs text-gray-400">
                  {activeStudent ? activeStudent.name : 'El estudiante'} detonó una mina en el tablero. ¡Debe responder el reto para salvar su puntuación!
                </p>
              </div>
            </div>

            {onGenerateTurnQuestion && (
              <button
                onClick={handleGenerateLiveQuestion}
                disabled={isGeneratingIA}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{isGeneratingIA ? 'Generando con IA...' : 'Generar Otra Pregunta IA (Groq)'}</span>
              </button>
            )}
          </div>

          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleQuestionAnswer}
              activeStudent={activeStudent}
            />
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">
              No hay preguntas configuradas para esta actividad.
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleResetForNextRound}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Pasar al Siguiente Alumno ⏭️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

