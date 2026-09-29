import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Coins, Disc3, CheckCircle2, AlertCircle, Play, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import QuestionCard from '../QuestionCard';

const SLICES = [
  { id: 'red_1', label: 'Grammar', type: 'red', mult: 2, color: '#dc2626', textColor: '#ffffff' },
  { id: 'black_1', label: 'Vocabulary', type: 'black', mult: 2, color: '#18181b', textColor: '#fbbf24' },
  { id: 'red_2', label: 'Speaking', type: 'red', mult: 2, color: '#dc2626', textColor: '#ffffff' },
  { id: 'black_2', label: 'Pronunciation', type: 'black', mult: 2, color: '#18181b', textColor: '#fbbf24' },
  { id: 'gold_zero', label: 'GOLD JACKPOT', type: 'gold', mult: 5, color: '#d97706', textColor: '#000000' },
  { id: 'red_3', label: 'Idioms', type: 'red', mult: 2, color: '#dc2626', textColor: '#ffffff' },
  { id: 'black_3', label: 'Phrasal Verbs', type: 'black', mult: 2, color: '#18181b', textColor: '#fbbf24' },
  { id: 'red_4', label: 'Bonus Luck', type: 'red', mult: 2, color: '#dc2626', textColor: '#ffffff' },
];

export default function RouletteGame({
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
  const [betChoice, setBetChoice] = useState('red'); // 'red' | 'black' | 'gold'
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningSlice, setWinningSlice] = useState(null);

  // Luck / Exoneration states
  const [roundOutcome, setRoundOutcome] = useState(null); // 'lucky_exonerated' | 'unlucky_challenge' | null
  const [winMessage, setWinMessage] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [turnQuestionOverride, setTurnQuestionOverride] = useState(null);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  const rotationRef = useRef(0);
  const ballAngleRef = useRef(-Math.PI / 2);
  const ballDistRef = useRef(145);
  const lastTickSliceRef = useRef(-1);
  const animationFrameRef = useRef(null);

  const questions = activity?.questions || [];
  const currentQuestion = turnQuestionOverride || questions[currentQuestionIndex % (questions.length || 1)];
  const numSlices = SLICES.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Draw Roulette Wheel with Ball Track and Ball
  const drawWheel = (rotation, ballAngle, ballDist, settledSliceIdx = -1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = width / 2 - 10;
    const trackRadius = outerRadius - 12;
    const wheelRadius = outerRadius - 22;

    ctx.clearRect(0, 0, width, height);

    // 1. Mahogany / Metallic Outer Rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius + 8, 0, 2 * Math.PI);
    const rimGrad = ctx.createRadialGradient(centerX, centerY, wheelRadius, centerX, centerY, outerRadius + 8);
    rimGrad.addColorStop(0, '#78350f');
    rimGrad.addColorStop(0.7, '#451a03');
    rimGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = rimGrad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // 2. Ball Track (Pista de la bolita)
    ctx.beginPath();
    ctx.arc(centerX, centerY, trackRadius + 8, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI, true);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.stroke();

    // Deflectors (Los rombos metálicos)
    const deflectorsCount = 8;
    for (let d = 0; d < deflectorsCount; d++) {
      const defAngle = (d * 2 * Math.PI) / deflectorsCount;
      const dx = centerX + trackRadius * Math.cos(defAngle);
      const dy = centerY + trackRadius * Math.sin(defAngle);

      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(defAngle + Math.PI / 4);
      ctx.beginPath();
      ctx.rect(-3, -3, 6, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // 3. Slices (Wheel Pockets)
    for (let i = 0; i < numSlices; i++) {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const slice = SLICES[i];
      const isWinnerSlice = settledSliceIdx === i;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = isWinnerSlice ? '#f59e0b' : slice.color;
      ctx.fill();
      ctx.lineWidth = isWinnerSlice ? 3 : 1.5;
      ctx.strokeStyle = isWinnerSlice ? '#ffffff' : '#fef08a';
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = isWinnerSlice ? '#000000' : slice.textColor;
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.shadowColor = isWinnerSlice ? 'transparent' : 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = isWinnerSlice ? 0 : 4;
      ctx.fillText(slice.label, wheelRadius - 16, 5);
      ctx.restore();

      ctx.restore();
    }

    // 4. Center Vegas Hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 34, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(centerX - 4, centerY - 4, 2, centerX, centerY, 34);
    hubGrad.addColorStop(0, '#fef08a');
    hubGrad.addColorStop(0.5, '#d97706');
    hubGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'black 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VEGAS', centerX, centerY - 4);
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('ROULETTE', centerX, centerY + 8);
    ctx.restore();

    // 5. The Authentic Roulette Ball (La Bolita)
    if (typeof ballDist === 'number' && ballDist > 0) {
      const bx = centerX + ballDist * Math.cos(ballAngle);
      const by = centerY + ballDist * Math.sin(ballAngle);

      ctx.save();
      // Drop Shadow
      ctx.beginPath();
      ctx.arc(bx + 2.5, by + 3, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.filter = 'blur(2px)';
      ctx.fill();
      ctx.filter = 'none';

      // Golden Halo if settled
      if (settledSliceIdx >= 0) {
        ctx.beginPath();
        ctx.arc(bx, by, 10, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Ball Body
      ctx.beginPath();
      ctx.arc(bx, by, 6.5, 0, 2 * Math.PI);
      const ballGrad = ctx.createRadialGradient(bx - 2, by - 2.5, 1, bx, by, 7);
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.3, '#f8fafc');
      ballGrad.addColorStop(0.75, '#cbd5e1');
      ballGrad.addColorStop(1, '#475569');
      ctx.fillStyle = ballGrad;
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.stroke();
      ctx.restore();
    }
  };

  useEffect(() => {
    drawWheel(0, -Math.PI / 2, 145, -1);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const spinRoulette = () => {
    if (isSpinning || roundOutcome === 'unlucky_challenge') return;
    if (chips < bet) {
      sounds.playWrong();
      alert('No hay suficientes fichas. Por favor reduce la apuesta.');
      return;
    }

    onUpdateChips(-bet);

    sounds.playLever();
    setIsSpinning(true);
    setRoundOutcome(null);
    setWinMessage(null);
    setWinningSlice(null);
    setTurnQuestionOverride(null);

    // Realistic wheel + ball counter-rotation
    let wheelVelocity = 0.16 + Math.random() * 0.08;
    const wheelFriction = 0.992;

    let ballVelocity = -(0.52 + Math.random() * 0.22);
    const ballFriction = 0.985;

    const outerTrackDist = 145;
    const pocketDist = 108;
    let ballDist = outerTrackDist;

    const animate = () => {
      rotationRef.current += wheelVelocity;
      wheelVelocity *= wheelFriction;

      ballAngleRef.current += ballVelocity;
      ballVelocity *= ballFriction;

      const currentBallSpeed = Math.abs(ballVelocity);

      if (currentBallSpeed > 0.14) {
        ballDist = outerTrackDist;
      } else if (currentBallSpeed > 0.025) {
        const dropRatio = (0.14 - currentBallSpeed) / (0.14 - 0.025);
        ballDist = outerTrackDist - dropRatio * (outerTrackDist - pocketDist);

        const relativeAngle = ((ballAngleRef.current - rotationRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const bounce = Math.abs(Math.sin(relativeAngle * numSlices)) * (currentBallSpeed * 40);
        ballDist += bounce;
      } else {
        ballDist = pocketDist;
      }

      ballDistRef.current = ballDist;

      // Sound tick as ball passes pocket frets
      const relAngle = ((ballAngleRef.current - rotationRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSliceIdx = Math.floor(relAngle / sliceAngle) % numSlices;

      if (currentSliceIdx !== lastTickSliceRef.current) {
        sounds.playTick();
        lastTickSliceRef.current = currentSliceIdx;
      }

      drawWheel(rotationRef.current, ballAngleRef.current, ballDist, -1);

      if (currentBallSpeed > 0.003) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const landedSlice = SLICES[currentSliceIdx];
        setWinningSlice(landedSlice);

        // Lock ball into the exact center of winning slice
        const settledAngle = rotationRef.current + currentSliceIdx * sliceAngle + sliceAngle / 2;
        ballAngleRef.current = settledAngle;
        ballDistRef.current = pocketDist;

        drawWheel(rotationRef.current, settledAngle, pocketDist, currentSliceIdx);
        evaluateLuck(landedSlice);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const evaluateLuck = (landedSlice) => {
    const isLuckyHit = landedSlice.type === betChoice;

    if (isLuckyHit) {
      const payout = Math.round(bet * landedSlice.mult);
      onUpdateChips(payout);

      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, payout, true, false, {
          machine: 'roulette',
          bet,
          outcome: 'exonerated_by_luck',
          question: null
        });
      }

      setRoundOutcome('lucky_exonerated');
      sounds.playJackpot();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setWinMessage(
        `🎉 ¡EXONERADO POR SUERTE! La bolilla cayó en ${landedSlice.label} (${landedSlice.type.toUpperCase()}). ¡${activeStudent ? activeStudent.name : 'El estudiante'} acertó su apuesta, se salva del reto y cobra +${payout} fichas!`
      );
    } else {
      setRoundOutcome('unlucky_challenge');
      sounds.playWrong();
      setWinMessage(
        `⚠️ ¡Mala suerte! La ruleta cayó en ${landedSlice.label} (${landedSlice.type.toUpperCase()}) y tu apuesta fue ${betChoice.toUpperCase()}. ¡Debes responder el reto de inglés!`
      );
    }
  };

  const handleQuestionAnswer = (isCorrect, selected, q) => {
    if (isCorrect) {
      const reward = (q?.points || 200) + bet;
      onUpdateChips(reward);
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, reward, true, true, {
          machine: 'roulette',
          bet,
          outcome: 'answered_correct',
          question: q?.question || 'Reto de ruleta'
        });
      }
      sounds.playCorrect();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setWinMessage(`🎯 ¡Excelente! ${activeStudent ? activeStudent.name : 'Respuesta correcta'}. Salvaste tu turno y ganaste +${reward} fichas.`);
    } else {
      sounds.playWrong();
      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, -bet, false, true, {
          machine: 'roulette',
          bet,
          outcome: 'answered_wrong',
          question: q?.question || 'Reto de ruleta'
        });
      }
      setWinMessage('❌ Respuesta incorrecta. ¡La casa se queda con las fichas este giro!');
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
    setRoundOutcome(null);
    setWinMessage(null);
    setTurnQuestionOverride(null);
    if (onAdvanceStudentTurn) {
      onAdvanceStudentTurn();
    }
  };

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
            🎡 Ruleta Vegas
          </h2>
          <p className="text-xs text-gray-400">
            Regla: ¡Predice el color! Si la bolilla acierta, ¡quedas exonerado y cobras!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>{chips.toLocaleString()} Fichas</span>
          </div>
        </div>
      </div>

      {/* Active Student Turn Badge */}
      {activeStudent && (
        <div className="p-3 bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-purple-950/60 border-2 border-purple-500/50 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeStudent.avatar || '🎩'}</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Turno en la Ruleta:</span>
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

      {/* Roulette Table */}
      <div className="bg-gradient-to-b from-blue-950/40 via-gray-950 to-black border-4 border-amber-500 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center">
        {/* Wheel Canvas Container */}
        <div className="relative inline-block my-2">

          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            className="rounded-full shadow-2xl border-4 border-amber-500/50"
          />
        </div>

        {/* Outcome Notification Banner */}
        {winMessage && (
          <div className={`max-w-xl mx-auto my-3 p-3.5 rounded-2xl border text-xs md:text-sm font-bold flex items-center justify-center gap-2 animate-fadeIn ${
            roundOutcome === 'lucky_exonerated'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/40'
              : 'bg-amber-950/80 border-amber-500 text-amber-200'
          }`}>
            {roundOutcome === 'lucky_exonerated' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{winMessage}</span>
          </div>
        )}

        {/* Student Variable Choices: Color and Bet */}
        <div className="max-w-lg mx-auto mt-4 p-4 rounded-2xl bg-black/60 border border-gray-800 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              🎯 Elige tu predicción de la suerte:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  sounds.playTick();
                  setBetChoice('red');
                }}
                disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 transition cursor-pointer disabled:opacity-50 ${
                  betChoice === 'red'
                    ? 'bg-red-600 border-yellow-400 text-white shadow-lg shadow-red-600/40 scale-105'
                    : 'bg-red-950/40 border-red-800 text-red-300 hover:bg-red-900/50'
                }`}
              >
                🔴 ROJO (x2)
              </button>

              <button
                onClick={() => {
                  sounds.playTick();
                  setBetChoice('black');
                }}
                disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 transition cursor-pointer disabled:opacity-50 ${
                  betChoice === 'black'
                    ? 'bg-zinc-800 border-yellow-400 text-yellow-300 shadow-lg shadow-zinc-800/40 scale-105'
                    : 'bg-black/60 border-zinc-700 text-gray-300 hover:bg-zinc-900'
                }`}
              >
                ⚫ NEGRO (x2)
              </button>

              <button
                onClick={() => {
                  sounds.playTick();
                  setBetChoice('gold');
                }}
                disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 transition cursor-pointer disabled:opacity-50 ${
                  betChoice === 'gold'
                    ? 'bg-amber-500 border-yellow-200 text-black shadow-lg shadow-amber-500/40 scale-105 font-black'
                    : 'bg-amber-950/40 border-amber-800 text-amber-300 hover:bg-amber-900/50'
                }`}
              >
                🟡 JACKPOT (x5)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Apuesta:</span>
              {[25, 50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    sounds.playChips();
                    setBet(amount);
                  }}
                  disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                    bet === amount
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-black scale-105'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>

            {roundOutcome !== 'unlucky_challenge' ? (
              <button
                onClick={spinRoulette}
                disabled={isSpinning}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-gray-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Disc3 className="w-4 h-4" />
                <span>{isSpinning ? '¡Girando Ruleta...!' : '¡GIRAR RULETA!'}</span>
              </button>
            ) : (
              <span className="text-xs text-red-400 font-bold animate-pulse">
                👇 ¡Responde la pregunta para continuar!
              </span>
            )}
          </div>
        </div>

        {/* Lucky Exoneration Success Actions */}
        {roundOutcome === 'lucky_exonerated' && (
          <div className="mt-4 pt-3 border-t border-emerald-800/40 flex justify-center gap-3">
            <button
              onClick={handleNextTurn}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg transition transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Siguiente Turno / Alumno →</span>
            </button>

            <button
              onClick={() => {
                setRoundOutcome(null);
                setWinMessage(null);
              }}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-amber-300 font-bold text-xs rounded-xl border border-gray-700 transition cursor-pointer"
            >
              Girar de nuevo
            </button>
          </div>
        )}
      </div>

      {/* Unlucky English Challenge Section */}
      {roundOutcome === 'unlucky_challenge' && currentQuestion && (
        <div className="space-y-3 animate-fadeIn">
          <div className="p-3 bg-red-950/60 border-2 border-red-500/60 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-red-200">
              ⚠️ La ruleta no favoreció tu predicción. ¡Debes superar el siguiente reto pedagógico!
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
