import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Coins, Rocket, Sparkles, Trophy, AlertCircle, Flame, ShieldAlert } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import QuestionCard from '../QuestionCard';

export default function CrashRocketGame({
  activity,
  chips,
  onUpdateChips,
  onBackToLobby,
  activeStudent,
  onRecordStudentScore,
  onAdvanceStudentTurn,
  onGenerateTurnQuestion
}) {
  const canvasRef = useRef(null);
  const [bet, setBet] = useState(50);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'flying' | 'crashed' | 'cashed_out'
  const [multiplier, setMultiplier] = useState(1.00);

  // Outcome & Challenge states
  const [roundOutcome, setRoundOutcome] = useState(null); // 'lucky_exonerated' | 'unlucky_challenge' | null
  const [winMessage, setWinMessage] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [turnQuestionOverride, setTurnQuestionOverride] = useState(null);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  const animationFrameRef = useRef(null);
  const crashPointRef = useRef(2.0);
  const startTimeRef = useRef(0);
  const cashedOutMultiplierRef = useRef(null);

  const questions = activity?.questions || [];
  const currentQuestion = turnQuestionOverride || questions[currentQuestionIndex % (questions.length || 1)];

  // Draw Space / Flight Canvas
  const drawFlightCanvas = (currentMult, state, points = []) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Deep Cosmic Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.6, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Stars Parallax
    if (starsRef.current.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      starsRef.current.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (state === 'flying') {
          star.y += star.speed;
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }
        }
      });
    }

    // Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 30; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const originX = 40;
    const originY = height - 40;

    // Flight Curve
    if (points.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      // Neon trajectory line
      ctx.strokeStyle = state === 'crashed' ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = state === 'crashed' ? '#ef4444' : '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Shaded area beneath curve
      ctx.lineTo(points[points.length - 1].x, originY);
      ctx.lineTo(points[0].x, originY);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, 0, 0, height);
      areaGrad.addColorStop(0, state === 'crashed' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.25)');
      areaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = areaGrad;
      ctx.fill();
      ctx.restore();

      // Rocket or Explosion at curve tip
      const lastPt = points[points.length - 1];
      if (state === 'crashed') {
        // Explosion Starburst
        ctx.save();
        ctx.translate(lastPt.x, lastPt.y);
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(24 * Math.cos(a), 24 * Math.sin(a));
          ctx.strokeStyle = i % 2 === 0 ? '#ef4444' : '#f59e0b';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#fee2e2';
        ctx.fill();
        ctx.restore();
      } else {
        // Flying Rocket Icon
        ctx.save();
        ctx.translate(lastPt.x, lastPt.y);
        ctx.rotate(-0.4);

        // Rocket Exhaust Fire
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(-28, -5);
        ctx.lineTo(-24, 0);
        ctx.lineTo(-28, 5);
        ctx.closePath();
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Rocket Body
        ctx.font = '24px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚀', 0, 0);
        ctx.restore();
      }
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, 10);
    ctx.lineTo(originX, originY);
    ctx.lineTo(width - 10, originY);
    ctx.stroke();

    // Multiplier Text Overlay
    ctx.save();
    ctx.font = '900 48px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (state === 'crashed') {
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.fillText(`💥 ${currentMult.toFixed(2)}x`, width / 2, height / 2 - 20);
      ctx.font = '700 16px system-ui';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText('¡CRASH! EL COHETE EXPLOTÓ', width / 2, height / 2 + 25);
    } else if (state === 'cashed_out') {
      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 20;
      ctx.fillText(`💰 ${currentMult.toFixed(2)}x`, width / 2, height / 2 - 20);
      ctx.font = '700 16px system-ui';
      ctx.fillStyle = '#86efac';
      ctx.fillText('¡RETIRADO A TIEMPO!', width / 2, height / 2 + 25);
    } else if (state === 'flying') {
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#ca8a04';
      ctx.shadowBlur = 25;
      ctx.fillText(`${currentMult.toFixed(2)}x`, width / 2, height / 2 - 20);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('1.00x', width / 2, height / 2 - 20);
      ctx.font = '700 14px system-ui';
      ctx.fillStyle = '#64748b';
      ctx.fillText('LISTO PARA DESPEGAR', width / 2, height / 2 + 20);
    }
    ctx.restore();
  };

  useEffect(() => {
    drawFlightCanvas(1.00, 'idle');
  }, []);

  const handleLaunchRocket = () => {
    if (gameState === 'flying' || roundOutcome === 'unlucky_challenge') return;
    if (chips < bet) {
      sounds.playWrong();
      alert('No tienes suficientes fichas para esta apuesta.');
      return;
    }

    onUpdateChips(-bet);
    sounds.playLever();

    setGameState('flying');
    setRoundOutcome(null);
    setWinMessage(null);
    setTurnQuestionOverride(null);
    cashedOutMultiplierRef.current = null;

    // Pick crash multiplier using exponential distribution
    // Ranges generally between 1.25x and 6.00x, with occasional higher spikes
    const rand = Math.random();
    let crashMult = 1.15 + (1 / (1 - rand * 0.88) - 1) * 0.7;
    crashMult = Math.min(10.0, Math.max(1.20, crashMult));
    crashPointRef.current = parseFloat(crashMult.toFixed(2));

    startTimeRef.current = performance.now();
    const flightPoints = [{ x: 40, y: 340 - 40 }];

    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 440;
    const height = canvas ? canvas.height : 320;
    const originX = 40;
    const originY = height - 40;

    let currentMult = 1.00;

    const tick = (now) => {
      const elapsedSeconds = (now - startTimeRef.current) / 1000;
      // Exponential multiplier growth formula
      currentMult = 1.00 + Math.pow(elapsedSeconds * 0.9, 1.75);
      setMultiplier(currentMult);

      // Trajectory curve coordinate
      const plotProgress = Math.min(1, elapsedSeconds / 6.0);
      const px = originX + plotProgress * (width - originX - 45);
      const py = originY - Math.min(originY - 30, Math.pow(plotProgress, 1.4) * (originY - 40));

      flightPoints.push({ x: px, y: py });

      if (cashedOutMultiplierRef.current !== null) {
        // Player cashed out successfully!
        drawFlightCanvas(cashedOutMultiplierRef.current, 'cashed_out', flightPoints);
        return;
      }

      if (currentMult >= crashPointRef.current) {
        // CRASHED!
        sounds.playExplosion();
        setGameState('crashed');
        drawFlightCanvas(crashPointRef.current, 'crashed', flightPoints);
        evaluateCrash(crashPointRef.current);
      } else {
        drawFlightCanvas(currentMult, 'flying', flightPoints);
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const handleCashOut = () => {
    if (gameState !== 'flying' || cashedOutMultiplierRef.current !== null) return;

    const wonMult = Math.max(1.01, multiplier);
    cashedOutMultiplierRef.current = wonMult;
    setGameState('cashed_out');
    cancelAnimationFrame(animationFrameRef.current);

    const payout = Math.round(bet * wonMult);
    onUpdateChips(payout);

    if (onRecordStudentScore && activeStudent) {
      onRecordStudentScore(activeStudent.id, payout, true, false, {
        machine: 'crash',
        bet,
        outcome: 'exonerated_by_luck',
        question: null
      });
    }

    setRoundOutcome('lucky_exonerated');
    sounds.playJackpot();
    confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });
    setWinMessage(
      `🎉 ¡EXONERADO POR SUERTE EN LUCKY ROCKET! Te retiraste a tiempo en ${wonMult.toFixed(2)}x antes de que explotara. ¡${activeStudent ? activeStudent.name : 'El estudiante'} se salva de la pregunta y cobra +${payout} fichas!`
    );
  };

  const evaluateCrash = (finalMult) => {
    setRoundOutcome('unlucky_challenge');
    sounds.playWrong();
    setWinMessage(
      `💥 ¡BOOM! El cohete explotó en ${finalMult.toFixed(2)}x antes de que pudieras retirarte. ¡Debes responder el desafío de inglés para salvar tu turno!`
    );
  };

  const handleQuestionAnswer = (isCorrect, selected, q) => {
    if (isCorrect) {
      const reward = (q?.points || 200) + bet;
      onUpdateChips(reward);
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, reward, true, true, {
          machine: 'crash',
          bet,
          outcome: 'answered_correct',
          question: q?.question || 'Reto de Lucky Rocket'
        });
      }
      sounds.playCorrect();
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      setWinMessage(`🎯 ¡Excelente! ${activeStudent ? activeStudent.name : 'Respuesta correcta'}. Salvaste tu turno y ganaste +${reward} fichas.`);
    } else {
      sounds.playWrong();
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, -bet, false, true, {
          machine: 'crash',
          bet,
          outcome: 'answered_wrong',
          question: q?.question || 'Reto de Lucky Rocket'
        });
      }
      setWinMessage('❌ Respuesta incorrecta. ¡La casa retiene las fichas este despegue!');
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
    setGameState('idle');
    setMultiplier(1.00);
    setRoundOutcome(null);
    setWinMessage(null);
    setTurnQuestionOverride(null);
    cashedOutMultiplierRef.current = null;
    drawFlightCanvas(1.00, 'idle');
    if (onAdvanceStudentTurn) {
      onAdvanceStudentTurn();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fadeIn space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900/90 border border-sky-500/40 p-4 rounded-3xl backdrop-blur-md shadow-xl">
        <button
          onClick={() => {
            sounds.playTick();
            onBackToLobby();
          }}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition px-3 py-1.5 rounded-xl hover:bg-gray-800 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span>Volver al Lobby</span>
        </button>

        {activeStudent && (
          <div className="flex items-center gap-2.5 bg-sky-950/60 border border-sky-500/40 px-3.5 py-1.5 rounded-2xl">
            <span className="text-xl">{activeStudent.avatar || '🎩'}</span>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-sky-300 block leading-tight">Piloto en Turno:</span>
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

      {/* Main Crash Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Canvas Flight Display */}
        <div className={`md:col-span-7 bg-gradient-to-b from-gray-900 via-slate-950 to-black border-2 border-sky-500/40 rounded-3xl p-5 shadow-2xl flex flex-col items-center justify-center casino-3d-stage cabinet-3d-shadow ${gameState === 'flying' ? 'rocket-thrust' : ''} ${gameState === 'crashed' ? 'mine-shake' : ''}`}>
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-yellow-400" />
              Lucky Rocket Crash Game
            </span>
            <span className="text-xs font-mono font-bold text-gray-400">
              {gameState === 'flying' ? 'EN VUELO ASCENDENTE...' : 'ESTACIÓN DE LANZAMIENTO'}
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={400}
            height={320}
            className="rounded-2xl border border-gray-800 shadow-inner max-w-full"
          />

          <p className="text-[11px] text-gray-400 text-center mt-3">
            El multiplicador sube en tiempo real. ¡Presiona RETIRARSE antes de que el cohete explote para quedar exonerado!
          </p>
        </div>

        {/* Controls Column */}
        <div className="md:col-span-5 bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-sky-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Regla de Exoneración
            </div>
            <h3 className="text-xl font-black text-white">
              🚀 Lucky Rocket (Aviator)
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              Despega el cohete. <strong>¡Si te retiras con éxito antes del Crash, el alumno queda totalmente EXONERADO!</strong> Si explota antes, responde el reto de inglés.
            </p>
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
                  disabled={gameState === 'flying' || roundOutcome === 'unlucky_challenge'}
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

          {/* Action Buttons: Launch vs Cash Out */}
          {gameState === 'idle' && (
            <button
              onClick={handleLaunchRocket}
              disabled={chips < bet}
              style={{ transform: 'perspective(600px) rotateX(2deg)' }}
              className="cabinet-3d-shadow w-full py-4 bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 text-white font-black text-base rounded-2xl shadow-xl shadow-sky-950/60 transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5 text-yellow-300" />
              <span>DESPEGAR COHETE ({bet} Fichas)</span>
            </button>
          )}

          {gameState === 'flying' && (
            <button
              onClick={handleCashOut}
              style={{ transform: 'perspective(500px) rotateX(3deg)', boxShadow: '0 8px 30px rgba(16,185,129,0.5), 0 2px 0 #065f46' }}
              className="metallic-shine relative overflow-hidden w-full py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 text-black font-black text-lg rounded-2xl shadow-2xl shadow-emerald-950/80 animate-pulse transition transform hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-2 border-emerald-300"
            >
              <Coins className="w-6 h-6 text-black relative z-10" />
              <span className="relative z-10">COBRAR {Math.round(bet * multiplier)} FICHAS ({multiplier.toFixed(2)}x)</span>
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

      {/* Challenge Section on Crash */}
      {roundOutcome === 'unlucky_challenge' && (
        <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl animate-fadeIn space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-base font-black text-white">
                  Desafío de Inglés por Explosión del Cohete
                </h4>
                <p className="text-xs text-gray-400">
                  {activeStudent ? activeStudent.name : 'El estudiante'} no cobró a tiempo antes del crash. ¡Debe responder el reto para salvar su puntuación!
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

