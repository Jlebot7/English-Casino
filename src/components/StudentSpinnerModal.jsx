import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { X, Dices, Sparkles, Users, Play, RotateCcw, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const WHEEL_COLORS = [
  '#dc2626', // Red
  '#18181b', // Black
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#d97706', // Amber/Gold
  '#059669', // Emerald
  '#be123c', // Rose
  '#0284c7'  // Sky
];

export default function StudentSpinnerModal({
  isOpen,
  onClose,
  students = [],
  completedStudentIds = [],
  activeClassroomName = 'Salón Activo',
  onStudentSelected,
  onOpenRosterModal,
  onResetRound,
  onCloseSession
}) {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showCompletedList, setShowCompletedList] = useState(false);

  // Wheel & Ball Animation State Refs
  const rotationRef = useRef(0);
  const ballAngleRef = useRef(0);
  const ballDistRef = useRef(150);
  const isSettledRef = useRef(true);
  const lastSliceIdxRef = useRef(-1);
  const animationFrameIdRef = useRef(null);

  // Filter students who haven't participated in this session yet
  const eligibleStudents = students.filter(s => !(completedStudentIds || []).includes(s.id));
  const completedStudents = students.filter(s => (completedStudentIds || []).includes(s.id));
  const currentPool = eligibleStudents.length > 0 ? eligibleStudents : students;

  const numSlices = currentPool.length;
  const sliceAngle = numSlices > 0 ? (2 * Math.PI) / numSlices : 0;

  // Draw Roulette Wheel and Animated Ball
  const drawWheel = useCallback((rotation, ballAngle, ballDist, settledSliceIdx = -1) => {
    const canvas = canvasRef.current;
    if (!canvas || numSlices === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = width / 2 - 10;
    const trackRadius = outerRadius - 12;
    const wheelRadius = outerRadius - 22;

    ctx.clearRect(0, 0, width, height);

    // 1. Mahogany / Metallic Outer Casement
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

    // 2. Ball Track (Pista de la bolita) - Smooth concave brass/chrome groove
    ctx.beginPath();
    ctx.arc(centerX, centerY, trackRadius + 8, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI, true);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.stroke();

    // Metallic deflectors / diamonds along the ball track (Los rombos deflectores)
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

    // 3. Slices (Student Pockets)
    for (let i = 0; i < numSlices; i++) {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const student = currentPool[i];
      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
      const isWinnerSlice = settledSliceIdx === i;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
      ctx.closePath();

      // Pocket fill
      ctx.fillStyle = isWinnerSlice ? '#f59e0b' : color;
      ctx.fill();

      // Fret separator line
      ctx.lineWidth = isWinnerSlice ? 3 : 1.5;
      ctx.strokeStyle = isWinnerSlice ? '#ffffff' : '#fef08a';
      ctx.stroke();

      // Student name & avatar inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = isWinnerSlice ? '#000000' : '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.shadowColor = isWinnerSlice ? 'transparent' : 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = isWinnerSlice ? 0 : 4;

      const displayName = student.name.length > 13 ? student.name.substring(0, 12) + '…' : student.name;
      ctx.fillText(`${student.avatar || '👤'} ${displayName}`, wheelRadius - 16, 4);
      ctx.restore();

      ctx.restore();
    }

    // 4. Center Hub (Torreta Central de la Ruleta)
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
    ctx.fillText('LUCKY', centerX, centerY - 4);
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('STUDENT', centerX, centerY + 8);
    ctx.restore();

    // 5. The Authentic Roulette Ball (La Bolita)
    if (typeof ballDist === 'number' && ballDist > 0) {
      const bx = centerX + ballDist * Math.cos(ballAngle);
      const by = centerY + ballDist * Math.sin(ballAngle);

      ctx.save();

      // Ball shadow on track/wheel surface
      ctx.beginPath();
      ctx.arc(bx + 2.5, by + 3, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.filter = 'blur(2px)';
      ctx.fill();
      ctx.filter = 'none';

      // Golden halo if settled on winner
      if (settledSliceIdx >= 0) {
        ctx.beginPath();
        ctx.arc(bx, by, 10, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Ball Body (Polished ivory sphere with 3D reflection)
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
  }, [currentPool, numSlices, sliceAngle]);

  // Initial render when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialBallDist = 145;
      ballDistRef.current = initialBallDist;
      ballAngleRef.current = -Math.PI / 2;
      drawWheel(rotationRef.current, ballAngleRef.current, initialBallDist, -1);
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isOpen, drawWheel]);

  if (!isOpen) return null;

  // Spin with realistic wheel + ball counter-rotation physics
  const handleSpin = () => {
    if (isSpinning || currentPool.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    sounds.playLever();

    // Wheel rotates clockwise
    let wheelVelocity = 0.16 + Math.random() * 0.08;
    const wheelFriction = 0.992;

    // Ball is launched at high speed along the outer rim track (counter-clockwise)
    let ballVelocity = -(0.52 + Math.random() * 0.22);
    const ballFriction = 0.985;

    const outerTrackDist = 145;
    const pocketDist = 105;
    let ballDist = outerTrackDist;
    isSettledRef.current = false;

    const animate = () => {
      // Advance wheel
      rotationRef.current += wheelVelocity;
      wheelVelocity *= wheelFriction;

      // Advance ball
      ballAngleRef.current += ballVelocity;
      ballVelocity *= ballFriction;

      const currentBallSpeed = Math.abs(ballVelocity);

      // Centrifugal descent: ball stays in outer groove while fast, then spirals into pockets as it slows
      if (currentBallSpeed > 0.14) {
        ballDist = outerTrackDist;
      } else if (currentBallSpeed > 0.025) {
        const dropRatio = (0.14 - currentBallSpeed) / (0.14 - 0.025);
        ballDist = outerTrackDist - dropRatio * (outerTrackDist - pocketDist);

        // Micro-bounces as the ball rattles against pocket separators
        const relativeAngle = ((ballAngleRef.current - rotationRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const bounce = Math.abs(Math.sin(relativeAngle * numSlices)) * (currentBallSpeed * 40);
        ballDist += bounce;
      } else {
        ballDist = pocketDist;
      }

      ballDistRef.current = ballDist;

      // Sound tick when the ball passes between pocket dividers
      const relAngle = ((ballAngleRef.current - rotationRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSliceIdx = Math.floor(relAngle / sliceAngle) % numSlices;

      if (currentSliceIdx !== lastSliceIdxRef.current) {
        sounds.playTick();
        lastSliceIdxRef.current = currentSliceIdx;
      }

      drawWheel(rotationRef.current, ballAngleRef.current, ballDist, -1);

      // Check if ball has settled into pocket
      if (currentBallSpeed > 0.003) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        // Settled into winning pocket!
        setIsSpinning(false);
        isSettledRef.current = true;

        const winningStudent = currentPool[currentSliceIdx];
        setWinner(winningStudent);

        // Lock ball into the exact center of the winning slice
        const settledAngle = rotationRef.current + currentSliceIdx * sliceAngle + sliceAngle / 2;
        ballAngleRef.current = settledAngle;
        ballDistRef.current = pocketDist;

        drawWheel(rotationRef.current, settledAngle, pocketDist, currentSliceIdx);

        sounds.playJackpot();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);
  };

  const handleConfirmWinner = () => {
    if (winner && onStudentSelected) {
      onStudentSelected(winner);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-amber-500/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-center flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg transition disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Sorteo de Sesión Diaria
          </div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-100">
            🎲 RULETA DE ALUMNOS
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {activeClassroomName} • <strong className="text-amber-400">{eligibleStudents.length} pendientes</strong> de {students.length}
          </p>
        </div>

        {/* Participation Stats & Pill */}
        {students.length > 0 && (
          <div className="w-full flex items-center justify-between text-[11px] px-3 py-1.5 bg-black/50 border border-gray-800 rounded-xl mb-2">
            <span className="text-gray-400">
              Participaron hoy: <strong className="text-emerald-400">{completedStudents.length}</strong> / {students.length}
            </span>
            {completedStudents.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCompletedList(prev => !prev)}
                className="text-amber-400 hover:underline font-bold"
              >
                {showCompletedList ? 'Ocultar lista' : 'Ver lista de hoy'}
              </button>
            )}
          </div>
        )}

        {/* Completed list drawer */}
        {showCompletedList && completedStudents.length > 0 && (
          <div className="w-full max-h-24 overflow-y-auto bg-black/70 border border-gray-800 rounded-xl p-2 mb-2 text-left space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
              Alumnos que ya tuvieron su turno en esta sesión:
            </span>
            <div className="flex flex-wrap gap-1">
              {completedStudents.map(cs => (
                <span
                  key={cs.id}
                  className="px-2 py-0.5 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 text-[11px] flex items-center gap-1"
                >
                  <span>{cs.avatar || '👤'}</span>
                  <span>{cs.name}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Case 1: Eligible students left to spin */}
        {eligibleStudents.length > 0 ? (
          <div className="relative my-2">
            {/* The canvas handles the full roulette including the animated ball! NO static pointer arrow! */}
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="rounded-full shadow-2xl border-4 border-amber-500/40"
            />
          </div>
        ) : students.length > 0 ? (
          /* Case 2: All students have participated in today's session */
          <div className="py-8 px-6 border-2 border-emerald-500/40 bg-emerald-950/20 rounded-3xl my-3 max-w-sm w-full animate-fadeIn">
            <Award className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
            <h4 className="text-base font-black text-white">¡Todos los alumnos ya participaron hoy!</h4>
            <p className="text-xs text-emerald-200/90 mt-1 mb-4 leading-relaxed">
              Los {students.length} estudiantes del salón han jugado en la sesión diaria. La ruleta ha completado su ronda.
            </p>
            <div className="flex flex-col gap-2">
              {onResetRound && (
                <button
                  type="button"
                  onClick={() => {
                    onResetRound();
                    sounds.playChips();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Iniciar Nueva Ronda de Sorteo
                </button>
              )}
              {onCloseSession && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCloseSession();
                  }}
                  className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs rounded-xl border border-gray-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-amber-400" /> Cerrar Sesión del Día
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Case 3: Empty Classroom */
          <div className="py-12 px-6 border-2 border-dashed border-gray-800 rounded-3xl my-4 max-w-sm">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-300">No hay estudiantes en este salón</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Agrega los nombres de tus alumnos para hacer el sorteo.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenRosterModal();
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs rounded-xl shadow hover:scale-105 transition cursor-pointer"
            >
              + Ingresar Nombres
            </button>
          </div>
        )}

        {/* Winner Announcement */}
        {winner && (
          <div className="my-3 p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-2 border-amber-400 rounded-2xl w-full animate-bounce">
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">¡La bolilla cayó en!</span>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="text-3xl">{winner.avatar || '🎩'}</span>
              <h4 className="text-2xl font-black text-white">{winner.name}</h4>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              ¡Es tu turno de probar suerte en el casino o responder el reto!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {eligibleStudents.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 w-full">
            {!winner ? (
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/30 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Dices className="w-5 h-5" />
                <span>{isSpinning ? '¡Girando la Ruleta con la Bolita...!' : '¡Lanzar Bolita de la Suerte!'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleConfirmWinner}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white font-black text-sm rounded-xl shadow-lg transition transform hover:scale-105 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>¡Jugar con {winner.name.split(' ')[0]}!</span>
                </button>

                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="py-3 px-4 bg-gray-800 hover:bg-gray-700 text-amber-300 font-bold text-xs rounded-xl border border-gray-700 transition cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Girar de nuevo</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
