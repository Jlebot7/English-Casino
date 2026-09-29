import React, { useRef, useEffect } from 'react';
import { Sparkles, Users, Disc3, Dices, School, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function StudentLobby({
  activities = [],
  currentActivity,
  onSelectActivity,
  onLaunchGame,
  classrooms = [],
  activeClassroomId,
  onSelectClassroom,
  students = [],
  activeStudent,
  hasChosenTurnStudent = false,
  completedStudentIds = [],
  onOpenSpinner,
  onOpenRosterModal,
  onOpenTeacherPortal,
  onResetSessionRound,
  onCloseDailySession,
  currentTeacher,
  onOpenAuthModal
}) {
  const currentClassroom = classrooms.find(c => c.id === activeClassroomId) || classrooms[0];
  const gamesSectionRef = useRef(null);

  // Smoothly scroll down towards the games panel when a student is picked from the roulette
  useEffect(() => {
    if (hasChosenTurnStudent && gamesSectionRef.current) {
      setTimeout(() => {
        gamesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [hasChosenTurnStudent]);

  const handleLaunchMachine = (machineType) => {
    sounds.playChips();
    if (onLaunchGame) {
      onLaunchGame(machineType);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fadeIn space-y-8">
      {/* Welcome Casino Hero Banner */}
      <div className="text-center py-4 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          The Educational English Casino • Proyección en Aula
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-100 tracking-tight neon-text-gold my-2">
          LUCKY ENGLISH CASINO
        </h1>

        <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          ¡Aprende inglés probando tu suerte! Sortea un estudiante con la ruleta de la clase. El alumno juega la máquina: <strong>¡si tiene suerte se exonera de la pregunta!</strong> Si no, ¡demuestra sus conocimientos respondiendo al reto!
        </p>
      </div>

      {/* Classroom Status & Student Turn Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Active Classroom Selector */}
        <div className="md:col-span-5 bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <School className="w-4 h-4" /> Salón de Clases
              </span>
              <button
                onClick={() => {
                  sounds.playTick();
                  if (!currentTeacher && onOpenAuthModal) {
                    onOpenAuthModal('gestionar los salones de clases', onOpenRosterModal);
                  } else {
                    onOpenRosterModal();
                  }
                }}
                className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Gestionar Salones</span>
                {!currentTeacher && <span className="text-[10px]">🔒</span>}
              </button>
            </div>

            <div className="p-3 bg-black/50 border border-gray-800 rounded-2xl">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                🏫 {currentClassroom?.name || 'Salón Principal'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {students.length} estudiantes registrados en este salón
              </p>
            </div>

            {/* Quick Salon Switcher */}
            {classrooms.length > 1 && (
              <div className="mt-3">
                <label className="block text-[11px] font-bold text-gray-400 mb-1.5">
                  Cambiar a otro salón:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {classrooms.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        sounds.playTick();
                        if (onSelectClassroom) onSelectClassroom(c.id);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        c.id === activeClassroomId
                          ? 'bg-amber-500 text-black font-black'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
            <button
              onClick={() => {
                sounds.playTick();
                if (!currentTeacher && onOpenAuthModal) {
                  onOpenAuthModal('ver y gestionar la lista de alumnos', onOpenRosterModal);
                } else {
                  onOpenRosterModal();
                }
              }}
              className="text-xs text-gray-300 hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver lista de alumnos ({students.length})</span>
              {!currentTeacher && <span className="text-[10px] text-amber-400">🔒</span>}
            </button>
          </div>
        </div>

        {/* Big Lucky Student Selection Spinner Launcher */}
        <div className="md:col-span-7 bg-gradient-to-br from-purple-950/60 via-gray-900 to-black border-2 border-purple-500/70 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-widest bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-500/40">
                <Dices className="w-3.5 h-3.5 text-yellow-300" />
                Sorteo Diario • {students.filter(s => !completedStudentIds.includes(s.id)).length} pendientes de {students.length}
              </span>

              {activeStudent && hasChosenTurnStudent && (
                <span className="text-xs font-mono font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                  💰 {activeStudent.chips || 1000} Fichas
                </span>
              )}
            </div>

            {hasChosenTurnStudent && activeStudent ? (
              <div className="p-4 bg-black/40 border border-purple-500/30 rounded-2xl flex items-center gap-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-3xl shadow-lg">
                  {activeStudent.avatar || '🎩'}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                    Alumno en Turno:
                  </span>
                  <h3 className="text-xl font-black text-white">{activeStudent.name}</h3>
                  <p className="text-xs text-gray-400">
                    Aciertos: {activeStudent.correctAnswers || 0} / {activeStudent.totalQuestions || 0} • {completedStudentIds.includes(activeStudent.id) ? '✓ Ya jugó en esta sesión' : 'Pendiente de jugar'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-black/40 border border-dashed border-gray-800 rounded-2xl text-center text-gray-300 text-xs space-y-1">
                <p className="font-bold text-amber-300 text-sm">🎲 Turno Pendiente de Sorteo</p>
                <p className="text-gray-400 text-xs">
                  Gira la ruleta de alumnos para elegir al participante del turno y desplegar las máquinas de juego.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 flex flex-wrap gap-2.5">
            {students.length > 0 && students.filter(s => !completedStudentIds.includes(s.id)).length === 0 ? (
              <div className="w-full space-y-2">
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300">
                  🎉 ¡Todos los alumnos del salón ya han sido elegidos en la sesión de hoy!
                </div>
                <div className="flex flex-wrap gap-2">
                  {onResetSessionRound && (
                    <button
                      onClick={() => {
                        sounds.playChips();
                        onResetSessionRound();
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      🔄 Iniciar Nueva Ronda
                    </button>
                  )}
                  {onCloseDailySession && (
                    <button
                      onClick={() => {
                        sounds.playTick();
                        if (!currentTeacher && onOpenAuthModal) {
                          onOpenAuthModal('cerrar y archivar la sesión diaria', onCloseDailySession);
                        } else {
                          onCloseDailySession();
                        }
                      }}
                      className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-amber-300 font-bold text-xs rounded-xl border border-gray-700 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>📋 Cerrar Sesión del Día</span>
                      {!currentTeacher && <span className="text-[10px]">🔒</span>}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  sounds.playChips();
                  if (onOpenSpinner) onOpenSpinner();
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-950/60 transition transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Disc3 className="w-4 h-4 text-yellow-300 animate-spin" />
                <span>🎲 GIRAR RULETA ({students.filter(s => !completedStudentIds.includes(s.id)).length} pendientes)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conditional Game Machines Panel: Hidden until a student falls in the initial roulette */}
      {!hasChosenTurnStudent ? (
        <div className="p-8 bg-gradient-to-b from-gray-950 via-gray-900 to-black border-2 border-dashed border-amber-500/30 rounded-3xl text-center space-y-4 shadow-xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 mx-auto flex items-center justify-center text-3xl animate-bounce">
            🎰
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white">
              Máquinas de Casino Ocultas
            </h3>
            <p className="text-xs md:text-sm text-gray-400 max-w-md mx-auto mt-1 leading-relaxed">
              Gira la ruleta de alumnos para seleccionar quién jugará en este turno. Al caer la bolita en el alumno elegido, <strong>el panel de juegos se desplegará automáticamente</strong> para que pruebe su suerte.
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playChips();
              if (onOpenSpinner) onOpenSpinner();
            }}
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-950/60 transition transform hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            <Disc3 className="w-4 h-4 text-yellow-300 animate-spin" />
            <span>🎲 Girar Ruleta de Alumnos</span>
          </button>
        </div>
      ) : (
        <div ref={gamesSectionRef} className="space-y-6 animate-fadeIn">
          {/* Turn Unfolded Banner */}
          <div className="p-5 bg-gradient-to-r from-purple-950/70 via-amber-950/40 to-black border-2 border-amber-500/60 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg">
                {activeStudent?.avatar || '🎩'}
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-400 tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  🎯 Turno Desbloqueado • ¡A Jugar!
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                  {activeStudent?.name}
                </h3>
                <p className="text-xs text-gray-300">
                  Configura tu apuesta y prueba tu suerte. <strong>¡Si tienes suerte te exonerarás de la pregunta!</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playChips();
                  if (onOpenSpinner) onOpenSpinner();
                }}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow"
                title="Sortear a otro alumno con la ruleta"
              >
                <Disc3 className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                <span>Sortear otro alumno ↻</span>
              </button>
            </div>
          </div>

          {/* The 3 Casino Machines Cards */}
          <div>
            <div className="text-center mb-5">
              <h3 className="text-xl md:text-2xl font-black text-white">
                🎰 Selecciona la Máquina de Juego
              </h3>
              <p className="text-xs text-gray-400">
                El alumno elegido configurará su apuesta y probará su suerte. Si gana, ¡se exonera de la pregunta!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Slots Machine Card */}
              <div
                onClick={() => handleLaunchMachine('slots')}
                className="bg-gradient-to-b from-red-950/40 via-gray-900 to-black border-2 border-red-500/50 hover:border-red-400 rounded-3xl p-6 shadow-xl transition-all transform hover:scale-[1.03] cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
                    🎰
                  </div>
                  <h4 className="text-lg font-black text-white mb-1 group-hover:text-red-300 transition">
                    Lucky Slots
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    El alumno elige su apuesta y tira de la palanca. <strong>¡Si coinciden 2 o 3 figuras queda EXONERADO!</strong> Si no hay coincidencia, responde el reto de inglés.
                  </p>
                </div>

                <div className="pt-3 border-t border-red-900/40 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                    Exoneración: Coincidencia
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1 group-hover:bg-red-500 transition">
                    Jugar <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Roulette Machine Card */}
              <div
                onClick={() => handleLaunchMachine('roulette')}
                className="bg-gradient-to-b from-blue-950/40 via-gray-900 to-black border-2 border-blue-500/50 hover:border-blue-400 rounded-3xl p-6 shadow-xl transition-all transform hover:scale-[1.03] cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
                    🎡
                  </div>
                  <h4 className="text-lg font-black text-white mb-1 group-hover:text-blue-300 transition">
                    Ruleta Vegas
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    La bolita corre por la pista giratoria. <strong>¡Si la bolilla acierta 2 de los 3 criterios queda EXONERADO!</strong> Si no, responde la pregunta de la categoría.
                  </p>
                </div>

                <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    Exoneración: 2 de 3 Aciertos
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1 group-hover:bg-blue-500 transition">
                    Jugar <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Blackjack Machine Card */}
              <div
                onClick={() => handleLaunchMachine('blackjack')}
                className="bg-gradient-to-b from-emerald-950/40 via-gray-900 to-black border-2 border-emerald-500/50 hover:border-emerald-400 rounded-3xl p-6 shadow-xl transition-all transform hover:scale-[1.03] cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
                    🃏
                  </div>
                  <h4 className="text-lg font-black text-white mb-1 group-hover:text-emerald-300 transition">
                    21 Blackjack
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    El alumno juega su mano contra el crupier. <strong>¡Si gana la mano o hace 21 queda EXONERADO!</strong> Si pierde o se pasa, responde el reto de inglés para salvarse.
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-900/40 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Exoneración: Vencer a Casa
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 group-hover:bg-emerald-500 transition">
                    Jugar <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
