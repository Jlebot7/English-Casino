import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { X, Dices, Sparkles, Users, Play, RotateCcw } from 'lucide-react';
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
  activeClassroomName = 'Salón Activo',
  onStudentSelected,
  onOpenRosterModal
}) {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const rotationRef = useRef(0);
  const lastSliceIdxRef = useRef(-1);

  const numSlices = students.length;
  const sliceAngle = numSlices > 0 ? (2 * Math.PI) / numSlices : 0;

  const drawWheel = useCallback((rotation) => {
    const canvas = canvasRef.current;
    if (!canvas || numSlices === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 12;

    ctx.clearRect(0, 0, width, height);

    // Outer Casino Rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#b45309';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Rivets
    const totalRivets = 20;
    for (let i = 0; i < totalRivets; i++) {
      const rAngle = (i * 2 * Math.PI) / totalRivets;
      const rx = centerX + (radius + 4) * Math.cos(rAngle);
      const ry = centerY + (radius + 4) * Math.sin(rAngle);
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#ffffff';
      ctx.fill();
    }
    ctx.restore();

    // Slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const student = students[i];
      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // Student name inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 3;

      const displayName = student.name.length > 15 ? student.name.substring(0, 14) + '…' : student.name;
      ctx.fillText(`${student.avatar || '👤'} ${displayName}`, radius - 15, 4);
      ctx.restore();

      ctx.restore();
    }

    // Center Golden Cap
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LUCKY', centerX, centerY - 3);
    ctx.font = '8px system-ui';
    ctx.fillText('STUDENT', centerX, centerY + 10);
    ctx.restore();

    // Orbiting Ivory Ball
    if (ballRadiusRef.current > 0) {
      const bx = centerX + ballRadiusRef.current * Math.cos(ballAngleRef.current);
      const by = centerY + ballRadiusRef.current * Math.sin(ballAngleRef.current);

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx + 1.5, by + 2, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by, 5.5, 0, 2 * Math.PI);
      const ballGrad = ctx.createRadialGradient(bx - 1.5, by - 1.5, 1, bx, by, 5.5);
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.7, '#e2e8f0');
      ballGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = ballGrad;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();
      ctx.restore();
    }
  }, [numSlices, sliceAngle, students]);

  const ballAngleRef = useRef(0);
  const ballRadiusRef = useRef(150);

  useEffect(() => {
    if (isOpen) {
      ballAngleRef.current = 0;
      ballRadiusRef.current = 150;
      drawWheel(0);
    }
  }, [isOpen, drawWheel]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning || students.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    sounds.playLever();

    const canvas = canvasRef.current;
    const outerRadius = (canvas ? canvas.width / 2 : 170) - 14;
    const pocketRestRadius = outerRadius - 32;

    let wheelSpeed = 0.08 + Math.random() * 0.04;
    let ballSpeed = -(0.25 + Math.random() * 0.08);
    let progress = 0;
    const totalFrames = 220 + Math.floor(Math.random() * 40);

    const animate = () => {
      progress++;
      wheelSpeed *= 0.991;
      ballSpeed *= 0.987;

      rotationRef.current += wheelSpeed;
      ballAngleRef.current += ballSpeed;

      if (progress > totalFrames * 0.5) {
        const dropRatio = (progress - totalFrames * 0.5) / (totalFrames * 0.5);
        ballRadiusRef.current = outerRadius - (outerRadius - pocketRestRadius) * Math.min(1, dropRatio * 1.1);

        const currentSliceIdx = Math.floor(
          Math.abs(ballAngleRef.current - rotationRef.current) / (sliceAngle || 1)
        ) % numSlices;

        if (currentSliceIdx !== lastSliceIdxRef.current && Math.random() > 0.45) {
          sounds.playBallBounce();
          lastSliceIdxRef.current = currentSliceIdx;
        }
      } else {
        ballRadiusRef.current = outerRadius;
      }

      drawWheel(rotationRef.current);

      if (progress < totalFrames && Math.abs(ballSpeed) > 0.008) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Find pocket where ball rested
        const finalAngle = (ballAngleRef.current - rotationRef.current) % (2 * Math.PI);
        const normAngle = (finalAngle + 2 * Math.PI) % (2 * Math.PI);
        const selectedSliceIdx = Math.floor(normAngle / sliceAngle) % numSlices;
        const selectedStudent = students[selectedSliceIdx] || students[0];

        // Snap ball to pocket center
        ballAngleRef.current = rotationRef.current + selectedSliceIdx * sliceAngle + sliceAngle / 2;
        ballRadiusRef.current = pocketRestRadius;
        drawWheel(rotationRef.current);

        setWinner(selectedStudent);
        sounds.playJackpot();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    };

    requestAnimationFrame(animate);
  };

  const handleConfirmWinner = () => {
    if (winner && onStudentSelected) {
      onStudentSelected(winner);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-amber-500/80 rounded-3xl p-6 max-w-lg w-full cabinet-3d-shadow relative text-center flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg transition disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Sorteo de Participante
          </div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-100">
            🎲 RULETA DE ALUMNOS
          </h3>
          <p className="text-xs text-gray-400">
            {activeClassroomName} • {students.length} participantes en el salón
          </p>
        </div>

        {/* Wheel Canvas Container in 3D Perspective Stage */}
        {students.length > 0 ? (
          <div className="casino-3d-stage relative my-2">
            <div
              className="transition-transform duration-500"
              style={{ transform: 'perspective(750px) rotateX(15deg)', transformStyle: 'preserve-3d' }}
            >
              <canvas
                ref={canvasRef}
                width={340}
                height={340}
                className="rounded-full cabinet-3d-shadow border-4 border-amber-500/60"
              />
            </div>
          </div>
        ) : (
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
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">¡El elegido por la suerte es!</span>
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
        {students.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 w-full">
            {!winner ? (
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/30 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Dices className="w-5 h-5" />
                <span>{isSpinning ? '¡Girando la Ruleta...!' : '¡Girar Ruleta de la Suerte!'}</span>
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
