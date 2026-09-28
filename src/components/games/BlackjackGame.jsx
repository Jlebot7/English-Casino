import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Coins, Sparkles, Trophy, Hand, ShieldAlert, Award } from 'lucide-react';
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
  // Shuffle
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
  chips,
  onUpdateChips,
  onFinishGame,
  onBackToLobby
}) {
  const [deck, setDeck] = useState(createShuffledDeck());
  const [bet, setBet] = useState(100);
  const [gameStage, setGameStage] = useState('betting'); // 'betting' | 'playing' | 'dealerTurn' | 'roundEnd'
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [hideDealerHole, setHideDealerHole] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [awaitingHitQuestion, setAwaitingHitQuestion] = useState(false);
  const [isDoubleDown, setIsDoubleDown] = useState(false);
  const [roundResult, setRoundResult] = useState(null); // 'win' | 'lose' | 'push' | 'blackjack'
  const [resultMessage, setResultMessage] = useState('');

  const [correctCount, setCorrectCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const questions = activity?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Deal initial hands
  const startNewDeal = () => {
    if (chips < bet) {
      sounds.playWrong();
      alert('Not enough chips to bet this amount!');
      return;
    }

    onUpdateChips(-bet);
    sounds.playChips();

    let currentDeck = deck.length < 15 ? createShuffledDeck() : [...deck];

    const pCard1 = currentDeck.pop();
    const dCard1 = currentDeck.pop();
    const pCard2 = currentDeck.pop();
    const dCard2 = currentDeck.pop();

    setDeck(currentDeck);
    sounds.playCard();

    setPlayerHand([pCard1, pCard2]);
    setDealerHand([dCard1, dCard2]);
    setHideDealerHole(true);
    setRoundResult(null);
    setResultMessage('');
    setGameStage('playing');

    // Check natural blackjack
    const pScore = calculateHandScore([pCard1, pCard2]);
    const dScore = calculateHandScore([dCard1, dCard2]);

    if (pScore === 21) {
      setHideDealerHole(false);
      setGameStage('roundEnd');
      if (dScore === 21) {
        setRoundResult('push');
        setResultMessage('Push! Both have Blackjack!');
        onUpdateChips(bet);
      } else {
        setRoundResult('blackjack');
        setResultMessage('🔥 BLACKJACK! Natural 21 Pays 3:2!');
        const winPayout = Math.round(bet * 2.5);
        onUpdateChips(winPayout);
        sounds.playJackpot();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    }
  };

  // Player requests HIT: Must answer English question
  const requestHit = () => {
    if (gameStage !== 'playing' || awaitingHitQuestion) return;
    setIsDoubleDown(false);
    setAwaitingHitQuestion(true);
  };

  // Player requests DOUBLE DOWN
  const requestDoubleDown = () => {
    if (gameStage !== 'playing' || playerHand.length !== 2 || awaitingHitQuestion) return;
    if (chips < bet) {
      sounds.playWrong();
      alert('Not enough chips to double down!');
      return;
    }

    onUpdateChips(-bet);
    setBet(prev => prev * 2);
    setIsDoubleDown(true);
    setAwaitingHitQuestion(true);
  };

  // Handle question answer for HIT / DOUBLE
  const handleQuestionAnswer = (isCorrect) => {
    setAwaitingHitQuestion(false);

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      sounds.playCard();

      let currentDeck = [...deck];
      if (currentDeck.length === 0) currentDeck = createShuffledDeck();
      const newCard = currentDeck.pop();
      setDeck(currentDeck);

      const newHand = [...playerHand, newCard];
      setPlayerHand(newHand);

      const score = calculateHandScore(newHand);

      if (score > 21) {
        // Bust!
        sounds.playWrong();
        setHideDealerHole(false);
        setGameStage('roundEnd');
        setRoundResult('lose');
        setResultMessage(`Bust (${score})! The house wins.`);
        advanceQuestionOrFinish();
      } else if (score === 21 || isDoubleDown) {
        // Automatically stand
        standTurn(newHand);
      }
    } else {
      // Incorrect answer: Card not dealt, house strikes!
      sounds.playWrong();
      setResultMessage('Incorrect answer! No card granted this turn.');
      standTurn(playerHand);
    }
  };

  // Player STANDS: Dealer plays
  const standTurn = (handToEvaluate = playerHand) => {
    setGameStage('dealerTurn');
    setHideDealerHole(false);
    sounds.playCard();

    const pScore = calculateHandScore(handToEvaluate);
    let curDealerHand = [...dealerHand];
    let curDeck = [...deck];

    // Dealer hits on soft 16, stands on 17+
    const dealerPlayLoop = () => {
      let dScore = calculateHandScore(curDealerHand);

      if (dScore < 17) {
        if (curDeck.length === 0) curDeck = createShuffledDeck();
        const nextCard = curDeck.pop();
        curDealerHand.push(nextCard);
        sounds.playCard();
        setDealerHand([...curDealerHand]);
        setTimeout(dealerPlayLoop, 600);
      } else {
        // Final evaluation
        setDeck(curDeck);
        evaluateFinalWinner(pScore, dScore);
      }
    };

    setTimeout(dealerPlayLoop, 600);
  };

  const evaluateFinalWinner = (pScore, dScore) => {
    setGameStage('roundEnd');

    if (dScore > 21) {
      // Dealer busts
      setRoundResult('win');
      setResultMessage(`Dealer Busted with ${dScore}! You Win!`);
      sounds.playJackpot();
      confetti({ particleCount: 90, spread: 60 });
      onUpdateChips(bet * 2);
    } else if (pScore > dScore) {
      setRoundResult('win');
      setResultMessage(`You Win! ${pScore} beats Dealer's ${dScore}!`);
      sounds.playCoin();
      onUpdateChips(bet * 2);
    } else if (pScore === dScore) {
      setRoundResult('push');
      setResultMessage(`Push! Both tied at ${pScore}. Bet refunded.`);
      onUpdateChips(bet);
    } else {
      setRoundResult('lose');
      setResultMessage(`Dealer wins with ${dScore} over your ${pScore}.`);
      sounds.playWrong();
    }

    advanceQuestionOrFinish();
  };

  const advanceQuestionOrFinish = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
      setTimeout(() => {
        setGameOver(true);
        if (onFinishGame) {
          onFinishGame({
            gameId: 'blackjack',
            correctAnswers: correctCount,
            totalQuestions: questions.length,
            finalChips: chips
          });
        }
      }, 3000);
    } else {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setGameStage('betting');
        setPlayerHand([]);
        setDealerHand([]);
        setRoundResult(null);
        setResultMessage('');
      }, 4000);
    }
  };

  const playerScore = calculateHandScore(playerHand);
  const dealerScore = hideDealerHole
    ? (dealerHand[0] ? calculateHandScore([dealerHand[0]]) : 0)
    : calculateHandScore(dealerHand);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col items-center">
      {/* Top Header Navigation */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold border border-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Exit to Lobby
        </button>

        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600/30 to-yellow-600/30 border border-amber-500/40 px-4 py-1.5 rounded-xl shadow-lg">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-black text-amber-300">{chips.toLocaleString()} Chips</span>
        </div>
      </div>

      {/* Blackjack Table (Green Felt Style) */}
      <div className="w-full max-w-2xl bg-gradient-to-b from-emerald-900 via-emerald-950 to-green-950 border-4 border-amber-500/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Table Felt Inscription */}
        <div className="text-center mb-6 border-b border-emerald-700/50 pb-3">
          <h2 className="text-2xl font-black text-yellow-300 uppercase tracking-widest drop-shadow-md">
            🃏 21 BLACKJACK LINGUA
          </h2>
          <p className="text-[11px] text-emerald-200/80 uppercase tracking-wider font-semibold">
            Blackjack Pays 3 to 2 • Answer English Questions to Hit Cards
          </p>
        </div>

        {/* Dealer Zone */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Dealer Hand</span>
            {dealerHand.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-black/50 text-yellow-300 text-xs font-extrabold border border-yellow-500/30">
                {hideDealerHole ? `${dealerScore} + ?` : dealerScore}
              </span>
            )}
          </div>

          <div className="flex gap-3 min-h-[96px] items-center justify-center">
            {dealerHand.map((card, idx) => {
              if (idx === 1 && hideDealerHole) {
                return (
                  <div
                    key={idx}
                    className="w-16 h-24 bg-gradient-to-br from-blue-900 to-indigo-950 border-2 border-yellow-400 rounded-lg shadow-lg flex items-center justify-center text-yellow-400 text-xl font-bold"
                  >
                    🎲
                  </div>
                );
              }
              return (
                <div
                  key={idx}
                  className="w-16 h-24 bg-white rounded-lg border-2 border-gray-300 shadow-xl flex flex-col justify-between p-1.5 select-none animate-fadeIn"
                >
                  <div className={`text-xs font-bold leading-none ${card.color}`}>
                    {card.value}
                    <div className="text-[10px]">{card.suit}</div>
                  </div>
                  <div className={`text-2xl text-center font-bold ${card.color}`}>{card.suit}</div>
                  <div className={`text-xs font-bold leading-none self-end rotate-180 ${card.color}`}>
                    {card.value}
                    <div className="text-[10px]">{card.suit}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Table Message */}
        {resultMessage && (
          <div className="text-center py-2 px-4 rounded-xl bg-black/70 border border-yellow-400 text-yellow-300 font-bold text-sm mb-4 animate-bounce">
            {resultMessage}
          </div>
        )}

        {/* Player Zone */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Your Hand</span>
            {playerHand.length > 0 && (
              <span className={`px-2 py-0.5 rounded-md bg-black/50 text-xs font-extrabold border ${
                playerScore > 21 ? 'text-red-400 border-red-500' : 'text-yellow-300 border-yellow-500/30'
              }`}>
                {playerScore}
              </span>
            )}
          </div>

          <div className="flex gap-3 min-h-[96px] items-center justify-center">
            {playerHand.map((card, idx) => (
              <div
                key={idx}
                className="w-16 h-24 bg-white rounded-lg border-2 border-gray-300 shadow-xl flex flex-col justify-between p-1.5 select-none animate-fadeIn"
              >
                <div className={`text-xs font-bold leading-none ${card.color}`}>
                  {card.value}
                  <div className="text-[10px]">{card.suit}</div>
                </div>
                <div className={`text-2xl text-center font-bold ${card.color}`}>{card.suit}</div>
                <div className={`text-xs font-bold leading-none self-end rotate-180 ${card.color}`}>
                  {card.value}
                  <div className="text-[10px]">{card.suit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-black/60 p-4 rounded-2xl border border-emerald-600/40 flex flex-wrap items-center justify-between gap-4">
          {gameStage === 'betting' && (
            <>
              <div>
                <label className="block text-[11px] text-emerald-300 uppercase font-bold mb-1">
                  Select Bet
                </label>
                <div className="flex items-center gap-1.5">
                  {[50, 100, 200, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        sounds.playChips();
                        setBet(amount);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        bet === amount
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-emerald-950 text-emerald-200 border-emerald-700 hover:border-amber-400'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startNewDeal}
                className="px-8 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-gray-950 font-black text-sm uppercase rounded-xl shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition"
              >
                Deal Cards
              </button>
            </>
          )}

          {gameStage === 'playing' && (
            <div className="w-full flex items-center justify-center gap-4">
              <button
                onClick={requestHit}
                disabled={awaitingHitQuestion}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-md transition transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> HIT (Answer Question)
              </button>

              <button
                onClick={() => standTurn()}
                disabled={awaitingHitQuestion}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm shadow-md transition transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Hand className="w-4 h-4" /> STAND
              </button>

              {playerHand.length === 2 && (
                <button
                  onClick={requestDoubleDown}
                  disabled={awaitingHitQuestion}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm shadow-md transition transform hover:scale-105 active:scale-95"
                >
                  DOUBLE x2
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Challenge Question for Hit / Double */}
      {awaitingHitQuestion && currentQuestion && (
        <div className="w-full mt-6 animate-fadeIn">
          <div className="text-center mb-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              ⚡ Answer correctly to receive your next card!
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
            <h3 className="text-2xl font-black text-white mb-2">Blackjack Table Finished!</h3>
            <p className="text-gray-300 text-sm mb-4">
              Correct answers: <span className="font-bold text-amber-400">{correctCount}</span> /{' '}
              <span className="font-bold text-amber-400">{questions.length}</span>
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
