import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Coins, CheckCircle2, AlertCircle, Play, Plus, Shield, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import QuestionCard from '../QuestionCard';

const SUITS = [
  { symbol: '♠', name: 'spades', color: 'text-gray-900' },
  { symbol: '♥', name: 'hearts', color: 'text-red-600' },
  { symbol: '♦', name: 'diamonds', color: 'text-red-600' },
  { symbol: '♣', name: 'clubs', color: 'text-gray-900' }
];

const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createShuffledDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const val of CARD_VALUES) {
      deck.push({
        value: val,
        suit: suit.symbol,
        color: suit.color
      });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function calculateHandScore(cards) {
  let score = 0;
  let aces = 0;

  for (const card of cards) {
    if (['J', 'Q', 'K'].includes(card.value)) {
      score += 10;
    } else if (card.value === 'A') {
      aces += 1;
      score += 11;
    } else {
      score += parseInt(card.value, 10);
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return score;
}

export default function BlackjackGame({
  activity,
  chips = 1000,
  onUpdateChips,
  onBackToLobby,
  activeStudent,
  onRecordStudentScore,
  onAdvanceStudentTurn,
  onGenerateTurnQuestion
}) {
  const [deck, setDeck] = useState(createShuffledDeck());
  const [bet, setBet] = useState(100);
  const [gameStage, setGameStage] = useState('betting'); // 'betting' | 'playing' | 'roundEnd'
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [hideDealerHole, setHideDealerHole] = useState(true);

  // Luck / Exoneration states
  const [roundOutcome, setRoundOutcome] = useState(null); // 'lucky_exonerated' | 'unlucky_challenge' | 'push' | null
  const [resultMessage, setResultMessage] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [turnQuestionOverride, setTurnQuestionOverride] = useState(null);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  const questions = activity?.questions || [];
  const currentQuestion = turnQuestionOverride || questions[currentQuestionIndex % (questions.length || 1)];

  // Start new hand: Deal initial 2 cards to each
  const startNewDeal = () => {
    if (chips < bet) {
      sounds.playWrong();
      alert('¡No hay suficientes fichas para esta apuesta!');
      return;
    }

    onUpdateChips(-bet);

    sounds.playChips();

    let currentDeck = deck.length < 12 ? createShuffledDeck() : [...deck];
    const pCard1 = currentDeck.pop();
    const dCard1 = currentDeck.pop();
    const pCard2 = currentDeck.pop();
    const dCard2 = currentDeck.pop();

    setDeck(currentDeck);
    sounds.playCard();

    const initialPlayerCards = [pCard1, pCard2];
    const initialDealerCards = [dCard1, dCard2];

    setPlayerHand(initialPlayerCards);
    setDealerHand(initialDealerCards);
    setHideDealerHole(true);
    setRoundOutcome(null);
    setResultMessage('');
    setTurnQuestionOverride(null);
    setGameStage('playing');

    // Natural 21 check
    const pScore = calculateHandScore(initialPlayerCards);
    if (pScore === 21) {
      finalizeRound(initialPlayerCards, initialDealerCards, currentDeck, true);
    }
  };

  // Player hits
  const handleHit = () => {
    if (gameStage !== 'playing') return;

    let currentDeck = deck.length < 5 ? createShuffledDeck() : [...deck];
    const nextCard = currentDeck.pop();
    const updatedPlayerHand = [...playerHand, nextCard];

    setDeck(currentDeck);
    setPlayerHand(updatedPlayerHand);
    sounds.playCard();

    const score = calculateHandScore(updatedPlayerHand);
    if (score > 21) {
      finalizeRound(updatedPlayerHand, dealerHand, currentDeck, false);
    } else if (score === 21) {
      handleStand(updatedPlayerHand, currentDeck);
    }
  };

  // Player stands: Dealer plays
  const handleStand = (customPlayerHand = null, customDeck = null) => {
    if (gameStage !== 'playing') return;

    const finalPlayerHand = customPlayerHand || playerHand;
    let currentDeck = customDeck || (deck.length < 5 ? createShuffledDeck() : [...deck]);
    let currentDealerHand = [...dealerHand];

    setHideDealerHole(false);

    // Dealer draws to 17
    while (calculateHandScore(currentDealerHand) < 17) {
      const card = currentDeck.pop();
      currentDealerHand.push(card);
    }

    setDeck(currentDeck);
    setDealerHand(currentDealerHand);
    finalizeRound(finalPlayerHand, currentDealerHand, currentDeck, false);
  };

  const finalizeRound = (pHand, dHand, currentDeck, isNaturalBlackjack = false) => {
    setHideDealerHole(false);
    setGameStage('roundEnd');

    const pScore = calculateHandScore(pHand);
    const dScore = calculateHandScore(dHand);

    if (pScore > 21) {
      // Bust -> Unlucky!
      setRoundOutcome('unlucky_challenge');
      sounds.playWrong();
      setResultMessage(`💥 ¡Te pasaste de 21 (${pScore} puntos)! La casa gana la mano. ¡Debes responder el reto de inglés!`);
    } else if (isNaturalBlackjack) {
      // Natural 21 -> Lucky exonerated with 3:2 payout
      const winPayout = Math.round(bet * 2.5);
      onUpdateChips(winPayout);
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, winPayout, true, false, {
          machine: 'blackjack',
          bet,
          outcome: 'exonerated_by_luck',
          question: null
        });
      }
      setRoundOutcome('lucky_exonerated');
      sounds.playJackpot();
      confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 } });
      setResultMessage(`🔥 ¡BLACKJACK NATURAL (21)! ${activeStudent ? activeStudent.name : 'El estudiante'} derrota a la casa, queda exonerado y cobra +${winPayout} fichas.`);
    } else if (dScore > 21 || pScore > dScore) {
      // Player wins -> Lucky exonerated!
      const winPayout = Math.round(bet * 2);
      onUpdateChips(winPayout);
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, winPayout, true, false, {
          machine: 'blackjack',
          bet,
          outcome: 'exonerated_by_luck',
          question: null
        });
      }
      setRoundOutcome('lucky_exonerated');
      sounds.playJackpot();
      confetti({ particleCount: 110, spread: 70, origin: { y: 0.6 } });
      setResultMessage(`🎉 ¡VICTORIA EN EL 21! ${pScore} vs ${dScore > 21 ? 'Crupier se pasó' : `${dScore} del Crupier`}. ¡${activeStudent ? activeStudent.name : 'El estudiante'} queda exonerado de la pregunta y cobra +${winPayout} fichas!`);
    } else if (pScore === dScore) {
      // Push -> Bet returned
      onUpdateChips(bet);
      setRoundOutcome('push');
      sounds.playChips();
      setResultMessage(`🤝 ¡Empate (${pScore} a ${dScore})! La casa devuelve las fichas.`);
    } else {
      // Dealer wins -> Unlucky!
      setRoundOutcome('unlucky_challenge');
      sounds.playWrong();
      setResultMessage(`⚠️ El Crupier ganó (${dScore} vs tus ${pScore}). ¡Debes superar el reto de inglés para salvar tu ronda!`);
    }
  };

  const handleQuestionAnswer = (isCorrect, selected, q) => {
    if (isCorrect) {
      const reward = (q?.points || 200) + bet;
      onUpdateChips(reward);
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, reward, true, true, {
          machine: 'blackjack',
          bet,
          outcome: 'answered_correct',
          question: q?.question || 'Reto de blackjack'
        });
      }
      sounds.playCorrect();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setResultMessage(`🎯 ¡Reto superado! ${activeStudent ? activeStudent.name : 'Respuesta correcta'}. Salvaste tu turno y ganaste +${reward} fichas.`);
    } else {
      sounds.playWrong();
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, -bet, false, true, {
          machine: 'blackjack',
          bet,
          outcome: 'answered_wrong',
          question: q?.question || 'Reto de blackjack'
        });
      }
      setResultMessage('❌ Respuesta incorrecta. ¡Sigue practicando!');
    }

    setCurrentQuestionIndex(prev => (prev + 1) % (questions.length || 1));
  };

  const handleRegenerateTurnQuestion = async () => {
    if (!onGenerateTurnQuestion) return;
    setIsGeneratingIA(true);
    sounds.playChips();
    try {
      const newQ = await onGenerateTurnQuestion(activeStudent);
      if (newQ) {
        setTurnQuestionOverride(newQ);
        sounds.playTick();
      }
    } catch (err) {
      alert(err.message || 'Error al generar pregunta con IA.');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handleNextTurn = () => {
    setGameStage('betting');
    setRoundOutcome(null);
    setResultMessage('');
    setPlayerHand([]);
    setDealerHand([]);
    setTurnQuestionOverride(null);
    if (onAdvanceStudentTurn) {
      onAdvanceStudentTurn();
    }
  };

  const playerScore = calculateHandScore(playerHand);
  const dealerScore = hideDealerHole
    ? (dealerHand[0] ? calculateHandScore([dealerHand[0]]) : 0)
    : calculateHandScore(dealerHand);

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fadeIn space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToLobby}
          className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/40 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Sala Principal
        </button>

        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-100 uppercase tracking-wider">
            🃏 21 Blackjack Casino
          </h2>
          <p className="text-xs text-gray-400">
            Regla: ¡Derrota al crupier para exonerarte del reto! Si pierdes la mano, ¡a responder!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>{(chips ?? 0).toLocaleString()} Fichas</span>
          </div>
        </div>
      </div>

      {/* Active Student Turn Badge */}
      {activeStudent && (
        <div className="p-3 bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-purple-950/60 border-2 border-purple-500/50 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeStudent.avatar || '🎩'}</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Turno en Blackjack:</span>
              <h4 className="text-base font-black text-white">{activeStudent.name}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300 font-bold bg-black/40 px-2.5 py-1 rounded-xl border border-amber-500/20">
              💰 {activeStudent.chips || 1000} Fichas
            </span>

            {onGenerateTurnQuestion && (
              <button
                onClick={handleRegenerateTurnQuestion}
                disabled={isGeneratingIA}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer disabled:opacity-50"
                title="Generar un nuevo reto de inglés para este turno con IA Groq"
              >
                <Sparkles className={`w-3.5 h-3.5 text-yellow-300 ${isGeneratingIA ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isGeneratingIA ? 'Generando...' : '⚡ Reto IA'}</span>
              </button>
            )}

            {onAdvanceStudentTurn && (
              <button
                onClick={onAdvanceStudentTurn}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-bold rounded-xl border border-gray-700 transition cursor-pointer"
              >
                Cambiar Turno ↻
              </button>
            )}
          </div>
        </div>
      )}

      {/* Green Felt Table */}
      <div className="bg-gradient-to-b from-emerald-950 via-green-950 to-gray-950 border-4 border-amber-500 rounded-3xl p-6 shadow-2xl relative text-center">
        {/* Dealer Area */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase mb-3">
            <span>🤵 Crupier (Casa)</span>
            {dealerHand.length > 0 && (
              <span className="text-white font-mono font-bold bg-emerald-900/80 px-2 py-0.5 rounded-full">
                {hideDealerHole ? `Muestra ${dealerScore}` : `Total: ${dealerScore}`}
              </span>
            )}
          </div>

          <div className="flex justify-center gap-3 min-h-[110px] items-center">
            {dealerHand.length === 0 ? (
              <div className="text-xs text-emerald-300/60 font-semibold italic">Esperando apuesta para repartir cartas...</div>
            ) : (
              dealerHand.map((card, idx) => {
                if (idx === 1 && hideDealerHole) {
                  return (
                    <div
                      key={idx}
                      className="w-16 h-24 md:w-20 md:h-28 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 border-2 border-amber-400 shadow-xl flex items-center justify-center text-amber-300 font-bold text-xs select-none"
                    >
                      🂠 VEGAS
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="w-16 h-24 md:w-20 md:h-28 rounded-xl bg-white border-2 border-gray-300 shadow-xl flex flex-col justify-between p-2 select-none animate-fadeIn"
                  >
                    <span className={`text-sm md:text-base font-black ${card.color}`}>{card.value}</span>
                    <span className={`text-2xl md:text-3xl text-center ${card.color}`}>{card.suit}</span>
                    <span className={`text-sm md:text-base font-black text-right ${card.color}`}>{card.value}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Player Area */}
        <div className="pt-4 border-t border-emerald-800/60">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase mb-3">
            <span>👤 Mano del Alumno</span>
            {playerHand.length > 0 && (
              <span className="text-black font-mono font-black bg-amber-400 px-2 py-0.5 rounded-full">
                Puntos: {playerScore}
              </span>
            )}
          </div>

          <div className="flex justify-center gap-3 min-h-[110px] items-center">
            {playerHand.length === 0 ? (
              <div className="text-xs text-emerald-300/60 font-semibold italic">Presiona "Repartir Mano" para comenzar</div>
            ) : (
              playerHand.map((card, idx) => (
                <div
                  key={idx}
                  className="w-16 h-24 md:w-20 md:h-28 rounded-xl bg-white border-2 border-gray-300 shadow-xl flex flex-col justify-between p-2 select-none animate-fadeIn"
                >
                  <span className={`text-sm md:text-base font-black ${card.color}`}>{card.value}</span>
                  <span className={`text-2xl md:text-3xl text-center ${card.color}`}>{card.suit}</span>
                  <span className={`text-sm md:text-base font-black text-right ${card.color}`}>{card.value}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Result Message Banner */}
        {resultMessage && (
          <div className={`max-w-xl mx-auto my-4 p-3.5 rounded-2xl border text-xs md:text-sm font-bold flex items-center justify-center gap-2 animate-fadeIn ${
            roundOutcome === 'lucky_exonerated'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/40'
              : roundOutcome === 'push'
              ? 'bg-blue-950/90 border-blue-500 text-blue-200'
              : 'bg-amber-950/90 border-amber-500 text-amber-200'
          }`}>
            {roundOutcome === 'lucky_exonerated' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{resultMessage}</span>
          </div>
        )}

        {/* Action Controls & Betting Bar */}
        <div className="max-w-lg mx-auto mt-4 pt-3 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3">
          {gameStage === 'betting' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-300">Apuesta:</span>
                {[50, 100, 200].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      sounds.playChips();
                      setBet(amount);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      bet === amount
                        ? 'bg-amber-500 text-black shadow font-black scale-105'
                        : 'bg-black/60 text-gray-300 hover:bg-gray-800 border border-gray-700'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              <button
                onClick={startNewDeal}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-gray-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>🃏 ¡REPARTIR MANO!</span>
              </button>
            </>
          )}

          {gameStage === 'playing' && (
            <div className="flex items-center justify-center gap-4 w-full">
              <button
                onClick={handleHit}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-sm rounded-2xl shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>PEDIR CARTA (Hit)</span>
              </button>

              <button
                onClick={() => handleStand()}
                className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 text-black font-black text-sm rounded-2xl shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>PLANTARSE (Stand)</span>
              </button>
            </div>
          )}

          {gameStage === 'roundEnd' && roundOutcome !== 'unlucky_challenge' && (
            <div className="flex items-center justify-center gap-3 w-full">
              <button
                onClick={handleNextTurn}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg transition transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Siguiente Turno / Alumno →</span>
              </button>

              <button
                onClick={() => {
                  setGameStage('betting');
                  setPlayerHand([]);
                  setDealerHand([]);
                  setRoundOutcome(null);
                  setResultMessage('');
                  setTurnQuestionOverride(null);
                }}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-amber-300 font-bold text-xs rounded-xl border border-gray-700 transition cursor-pointer"
              >
                Jugar otra mano
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unlucky English Challenge Section */}
      {roundOutcome === 'unlucky_challenge' && currentQuestion && (
        <div className="space-y-3 animate-fadeIn">
          <div className="p-3 bg-red-950/60 border-2 border-red-500/60 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-red-200">
              ⚠️ La casa ganó la mano. ¡Para salvar tu ronda y ganar fichas, responde el reto de inglés!
            </span>

            {onGenerateTurnQuestion && (
              <button
                type="button"
                onClick={handleRegenerateTurnQuestion}
                disabled={isGeneratingIA}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingIA ? 'Generando...' : '⚡ Generar Otro Reto IA'}</span>
              </button>
            )}
          </div>

          <QuestionCard
            question={currentQuestion}
            questionNumber={(currentQuestionIndex % (questions.length || 1)) + 1}
            totalQuestions={questions.length}
            onAnswer={handleQuestionAnswer}
            activeStudent={activeStudent}
            showNextButton={true}
            onNext={handleNextTurn}
            onRegenerateQuestion={onGenerateTurnQuestion ? handleRegenerateTurnQuestion : null}
            isRegenerating={isGeneratingIA}
          />
        </div>
      )}
    </div>
  );
}
