import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Coins, 
  Disc3, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Check, 
  X, 
  Dices,
  RotateCcw
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import QuestionCard from '../QuestionCard';

// Authentic European Roulette wheel sequence (0-36, 37 pockets)
const EUROPEAN_ROULETTE_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]);

function getRouletteNumberInfo(num) {
  if (num === 0) {
    return {
      num: 0,
      color: 'green',
      colorName: 'Verde (Casa)',
      parity: 'zero',
      parityName: 'Cero',
      range: 'zero',
      rangeName: 'Cero',
      bgHex: '#059669',
      textHex: '#ffffff'
    };
  }
  const isRed = RED_NUMBERS.has(num);
  const isEven = num % 2 === 0;
  const isLow = num >= 1 && num <= 18;

  return {
    num,
    color: isRed ? 'red' : 'black',
    colorName: isRed ? 'Rojo' : 'Negro',
    parity: isEven ? 'even' : 'odd',
    parityName: isEven ? 'Par' : 'Impar',
    range: isLow ? 'low' : 'high',
    rangeName: isLow ? '1-18 (Bajo)' : '19-36 (Alto)',
    bgHex: isRed ? '#dc2626' : '#18181b',
    textHex: '#ffffff'
  };
}

export default function RouletteGame({
  activity,
  chips = 1000,
  onUpdateChips,
  onBackToLobby,
  activeStudent,
  onRecordStudentScore,
  onAdvanceStudentTurn,
  onGenerateTurnQuestion
}) {
  const canvasRef = useRef(null);
  const [bet, setBet] = useState(50);
  const [isSpinning, setIsSpinning] = useState(false);

  // The 3 classic roulette criteria chosen by the student
  const [predictions, setPredictions] = useState({
    color: 'red',    // 'red' | 'black'
    parity: 'even',  // 'even' | 'odd'
    range: 'low'     // 'low' (1-18) | 'high' (19-36)
  });

  // Winning results & evaluation
  const [evaluationResult, setEvaluationResult] = useState(null); // { hitsCount, colorHit, parityHit, rangeHit, isExonerated }
  const [roundOutcome, setRoundOutcome] = useState(null); // 'lucky_exonerated' | 'unlucky_challenge' | null
  const [winMessage, setWinMessage] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [turnQuestionOverride, setTurnQuestionOverride] = useState(null);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  const rotationRef = useRef(0);
  const lastTickIndexRef = useRef(-1);

  const questions = activity?.questions || [];
  const currentQuestion = turnQuestionOverride || questions[currentQuestionIndex % (questions.length || 1)];

  const numSlices = EUROPEAN_ROULETTE_ORDER.length; // 37
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Draw Realistic European Roulette Wheel
  const drawWheel = useCallback((rotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 12;

    ctx.clearRect(0, 0, width, height);

    // Outer Wooden Rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#78350f';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Golden Decorative Rivets
    const totalRivets = 24;
    for (let i = 0; i < totalRivets; i++) {
      const rAngle = (i * 2 * Math.PI) / totalRivets;
      const rx = centerX + (radius + 5) * Math.cos(rAngle);
      const ry = centerY + (radius + 5) * Math.sin(rAngle);
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#ffffff';
      ctx.fill();
    }
    ctx.restore();

    // 37 Wheel Pockets
    for (let i = 0; i < numSlices; i++) {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const num = EUROPEAN_ROULETTE_ORDER[i];
      const info = getRouletteNumberInfo(num);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = info.bgHex;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // Number text inside pocket
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = info.textHex;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 3;
      ctx.fillText(num.toString(), radius - 14, 4);
      ctx.restore();

      ctx.restore();
    }

    // Inner Silver Separator Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 52, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Brass Center Hub
    const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 50);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#d97706');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 46, 0, 2 * Math.PI);
    ctx.fill();

    // Center Emblem
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 34, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EUROPEAN', centerX, centerY - 4);
    ctx.font = '8px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ROULETTE', centerX, centerY + 8);
    ctx.restore();
  }, [numSlices, sliceAngle]);

  useEffect(() => {
    drawWheel(0);
  }, [drawWheel]);

  // Spin the wheel with realistic physics and 2-of-3 criteria check
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
    setEvaluationResult(null);
    setTurnQuestionOverride(null);

    // Initial random velocity with realistic deceleration
    let velocity = 0.42 + Math.random() * 0.28;
    const friction = 0.988;

    const animate = () => {
      rotationRef.current += velocity;
      velocity *= friction;

      // Pointer angle check at 12 o'clock (3*PI / 2)
      const pointerAngle = (3 * Math.PI / 2 - (rotationRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const currentPocketIdx = Math.floor(pointerAngle / sliceAngle) % numSlices;

      if (currentPocketIdx !== lastTickIndexRef.current) {
        sounds.playTick();
        lastTickIndexRef.current = currentPocketIdx;
      }

      drawWheel(rotationRef.current);

      if (velocity > 0.0018) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const landedNum = EUROPEAN_ROULETTE_ORDER[currentPocketIdx];
        evaluateTwoOfThreeCriteria(landedNum);
      }
    };

    requestAnimationFrame(animate);
  };

  // Evaluate the 2 of 3 criteria rule
  const evaluateTwoOfThreeCriteria = (num) => {
    const info = getRouletteNumberInfo(num);

    let colorHit = false;
    let parityHit = false;
    let rangeHit = false;

    if (num !== 0) {
      colorHit = info.color === predictions.color;
      parityHit = info.parity === predictions.parity;
      rangeHit = info.range === predictions.range;
    }

    let hitsCount = 0;
    if (colorHit) hitsCount++;
    if (parityHit) hitsCount++;
    if (rangeHit) hitsCount++;

    const isExonerated = hitsCount >= 2;

    const evalData = {
      num,
      info,
      colorHit,
      parityHit,
      rangeHit,
      hitsCount,
      isExonerated
    };

    setEvaluationResult(evalData);

    if (isExonerated) {
      // 2 or 3 hits -> EXONERATED!
      const isTripleCrown = hitsCount === 3;
      const payoutMultiplier = isTripleCrown ? 3 : 2;
      const payout = Math.round(bet * payoutMultiplier);
      onUpdateChips(payout);

      if (onRecordStudentScore && activeStudent) {
        onRecordStudentScore(activeStudent.id, payout, true, false, {
          machine: 'roulette',
          bet,
          outcome: 'exonerated_by_luck',
          hitsCount,
          winningNumber: num
        });
      }

      setRoundOutcome('lucky_exonerated');
      sounds.playJackpot();
      confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });

      const hitsNames = [
        colorHit ? `Color (${info.colorName})` : null,
        parityHit ? `Paridad (${info.parityName})` : null,
        rangeHit ? `Rango (${info.rangeName})` : null
      ].filter(Boolean).join(', ');

      setWinMessage(
        `🎉 ¡EXONERADO DE LA PREGUNTA! La ruleta cayó en ${num} (${info.colorName}, ${info.parityName}, ${info.rangeName}). Acertaste ${hitsCount}/3 criterios (${hitsNames}). ¡${activeStudent ? activeStudent.name : 'El alumno'} se salva del reto y cobra +${payout} fichas!`
      );
    } else {
      // 0 or 1 hit -> UNLUCKY CHALLENGE!
      setRoundOutcome('unlucky_challenge');
      sounds.playWrong();

      const hitsText = hitsCount === 1 
        ? `Solo acertaste 1 de 3 criterios (${colorHit ? 'Color' : parityHit ? 'Paridad' : 'Rango'})`
        : 'No acertaste ninguno de los 3 criterios';

      setWinMessage(
        `⚠️ ¡Mala suerte! La ruleta cayó en ${num} (${info.colorName}, ${info.parityName}, ${info.rangeName}). ${hitsText}. La regla exige al menos 2 de 3 para exonerarte. ¡A responder la pregunta pedagógica!`
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
    setEvaluationResult(null);
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
            🎡 Ruleta Europea Clásica
          </h2>
          <p className="text-xs text-amber-300/90 font-medium">
            🎯 Regla: Acierta <strong>2 de los 3 criterios típicos</strong> (Color, Paridad, Rango) para exonerarte
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
        <div className="p-3.5 bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-purple-950/70 border-2 border-purple-500/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-3xl shadow-md">
              {activeStudent.avatar || '🎩'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                  Alumno en Turno de Ruleta:
                </span>
              </div>
              <h4 className="text-lg font-black text-white">{activeStudent.name}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300 font-bold bg-black/50 px-3 py-1.5 rounded-xl border border-amber-500/30">
              💰 {(activeStudent.chips || 1000).toLocaleString()} Fichas
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
                onClick={handleNextTurn}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-bold rounded-xl border border-gray-700 transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Siguiente Alumno</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Roulette Table & Wheel Container */}
      <div className="bg-gradient-to-b from-blue-950/40 via-gray-950 to-black border-4 border-amber-500/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center">
        {/* Top Pointer Indicator */}
        <div className="relative inline-block my-2">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2.5 z-20 pointer-events-none drop-shadow-xl">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400" />
          </div>

          <canvas
            ref={canvasRef}
            width={350}
            height={350}
            className="rounded-full shadow-2xl border-4 border-amber-500/50"
          />
        </div>

        {/* Real-time Result Badge */}
        {evaluationResult && (
          <div className="max-w-xl mx-auto my-4 p-4 rounded-3xl bg-black/80 border-2 border-amber-400 shadow-2xl animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg border-2 border-white/20"
                  style={{ backgroundColor: evaluationResult.info.bgHex }}
                >
                  {evaluationResult.num}
                </span>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Número Ganador:</span>
                  <h4 className="text-base font-black text-white">
                    {evaluationResult.num} • {evaluationResult.info.colorName}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {evaluationResult.info.parityName} • {evaluationResult.info.rangeName}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400">Balance Criterios:</span>
                <div className="text-xl font-black text-amber-300">
                  {evaluationResult.hitsCount} / 3 Acertados
                </div>
                <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${
                  evaluationResult.isExonerated 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  {evaluationResult.isExonerated ? '¡Exonerado!' : 'No exonerado'}
                </span>
              </div>
            </div>

            {/* Criteria Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {/* Color Result */}
              <div className={`p-2 rounded-xl border ${
                evaluationResult.colorHit 
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' 
                  : 'bg-red-950/40 border-red-800/80 text-red-300'
              }`}>
                <span className="text-[10px] block font-bold uppercase text-gray-400">1. Color</span>
                <span className="font-bold flex items-center justify-center gap-1 my-0.5">
                  {evaluationResult.colorHit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                  {predictions.color === 'red' ? 'Rojo' : 'Negro'}
                </span>
                <span className="text-[10px] opacity-80">
                  {evaluationResult.colorHit ? '¡Acertó!' : 'Falló'}
                </span>
              </div>

              {/* Parity Result */}
              <div className={`p-2 rounded-xl border ${
                evaluationResult.parityHit 
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' 
                  : 'bg-red-950/40 border-red-800/80 text-red-300'
              }`}>
                <span className="text-[10px] block font-bold uppercase text-gray-400">2. Paridad</span>
                <span className="font-bold flex items-center justify-center gap-1 my-0.5">
                  {evaluationResult.parityHit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                  {predictions.parity === 'even' ? 'Par' : 'Impar'}
                </span>
                <span className="text-[10px] opacity-80">
                  {evaluationResult.parityHit ? '¡Acertó!' : 'Falló'}
                </span>
              </div>

              {/* Range Result */}
              <div className={`p-2 rounded-xl border ${
                evaluationResult.rangeHit 
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' 
                  : 'bg-red-950/40 border-red-800/80 text-red-300'
              }`}>
                <span className="text-[10px] block font-bold uppercase text-gray-400">3. Rango</span>
                <span className="font-bold flex items-center justify-center gap-1 my-0.5">
                  {evaluationResult.rangeHit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                  {predictions.range === 'low' ? '1-18' : '19-36'}
                </span>
                <span className="text-[10px] opacity-80">
                  {evaluationResult.rangeHit ? '¡Acertó!' : 'Falló'}
                </span>
              </div>
            </div>
          </div>
        )}

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

        {/* The 3 Typical Roulette Criteria Controls */}
        <div className="max-w-xl mx-auto mt-4 p-5 rounded-2xl bg-black/70 border border-amber-500/40 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <div>
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-yellow-400" />
                Los 3 Criterios de la Ruleta (Acierta 2 de 3):
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Configura la predicción del estudiante antes de girar la ruleta:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Criteria 1: Color */}
            <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl">
              <span className="text-[11px] font-bold text-gray-300 block mb-2">
                1. Color
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    setPredictions(prev => ({ ...prev, color: 'red' }));
                  }}
                  disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
                  className={`py-2 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 border transition cursor-pointer disabled:opacity-50 ${
                    predictions.color === 'red'
                      ? 'bg-red-600 border-yellow-400 text-white shadow-md shadow-red-600/40 scale-105 font-black'
                      : 'bg-red-950/40 border-red-900 text-red-300 hover:bg-red-900/50'
                  }`}
                >
                  🔴 Rojo
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    setPredictions(prev => ({ ...prev, color: 'black' }));
                  }}
                  disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
                  className={`py-2 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 border transition cursor-pointer disabled:opacity-50 ${
                    predictions.color === 'black'
                      ? 'bg-zinc-800 border-yellow-400 text-yellow-300 shadow-md shadow-zinc-800/40 scale-105 font-black'
                      : 'bg-black/60 border-zinc-700 text-gray-300 hover:bg-zinc-900'
                  }`}
                >
                  ⚫ Negro
                </button>
              </div>
            </div>

            {/* Criteria 2: Parity (Par / Impar) */}
            <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl">
              <span className="text-[11px] font-bold text-gray-300 block mb-2">
                2. Paridad
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    setPredictions(prev => ({ ...prev, parity: 'even' }));
                  }}
                  disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
                  className={`py-2 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 border transition cursor-pointer disabled:opacity-50 ${
                    predictions.parity === 'even'
                      ? 'bg-indigo-600 border-yellow-400 text-white shadow-md shadow-indigo-600/40 scale-105 font-black'
                      : 'bg-indigo-950/40 border-indigo-900 text-indigo-300 hover:bg-indigo-900/50'
                  }`}
                >
                  🔢 Par
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    setPredictions(prev => ({ ...prev, parity: 'odd' }));
                  }}
                  disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
                  className={`py-2 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 border transition cursor-pointer disabled:opacity-50 ${
                    predictions.parity === 'odd'
                      ? 'bg-purple-600 border-yellow-400 text-white shadow-md shadow-purple-600/40 scale-105 font-black'
                      : 'bg-purple-950/40 border-purple-900 text-purple-300 hover:bg-purple-900/50'
                  }`}
                >
                  🔣 Impar
                </button>
              </div>
            </div>

            {/* Criteria 3: Range (1-18 vs 19-36) */}
            <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl">
              <span className="text-[11px] font-bold text-gray-300 block mb-2">
                3. Rango
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    setPredictions(prev => ({ ...prev, range: 'low' }));
                  }}
                  disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
                  className={`py-2 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 border transition cursor-pointer disabled:opacity-50 ${
                    predictions.range === 'low'
                      ? 'bg-amber-600 border-yellow-400 text-white shadow-md shadow-amber-600/40 scale-105 font-black'
                      : 'bg-amber-950/40 border-amber-900 text-amber-300 hover:bg-amber-900/50'
                  }`}
                >
                  📉 1 - 18
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    setPredictions(prev => ({ ...prev, range: 'high' }));
                  }}
                  disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
                  className={`py-2 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 border transition cursor-pointer disabled:opacity-50 ${
                    predictions.range === 'high'
                      ? 'bg-emerald-600 border-yellow-400 text-white shadow-md shadow-emerald-600/40 scale-105 font-black'
                      : 'bg-emerald-950/40 border-emerald-900 text-emerald-300 hover:bg-emerald-900/50'
                  }`}
                >
                  📈 19 - 36
                </button>
              </div>
            </div>
          </div>

          {/* Bet Selector & Spin Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Apuesta:</span>
              {[25, 50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  type="button"
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

            <button
              type="button"
              onClick={spinRoulette}
              disabled={isSpinning || roundOutcome === 'unlucky_challenge'}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-gray-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/30 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Disc3 className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? '¡Girando la Ruleta...!' : '¡Girar Ruleta Vegas!'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pedagogical English Challenge if Unlucky (< 2 of 3) */}
      {roundOutcome === 'unlucky_challenge' && currentQuestion && (
        <div className="animate-fadeIn">
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Reto Pedagógico Obligatorio
            </span>
            <p className="text-xs text-gray-400 mt-1">
              {activeStudent ? activeStudent.name : 'El estudiante'} no logró los 2 criterios de suerte. Debe responder para salvarse:
            </p>
          </div>

          <QuestionCard
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            disabled={isSpinning}
          />
        </div>
      )}

      {/* Advance Turn Button when round is complete */}
      {(roundOutcome === 'lucky_exonerated' || roundOutcome === 'unlucky_challenge') && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleNextTurn}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-950/50 transition transform hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Siguiente Turno de Estudiante</span>
          </button>
        </div>
      )}
    </div>
  );
}
