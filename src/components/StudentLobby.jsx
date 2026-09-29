import React from 'react';
import { Sparkles, Trophy, Play, Users, Disc3, Dices, Gamepad2, Coins, School, ArrowRight, Flame } from 'lucide-react';
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
  onOpenSpinner,
  onOpenRosterModal,
  onOpenTeacherPortal
}) {
  const currentClassroom = classrooms.find(c => c.id === activeClassroomId) || classrooms[0];

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
                onClick={onOpenRosterModal}
                className="text-xs text-amber-400 hover:underline font-bold"
              >
                Gestionar Salones
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
              onClick={onOpenRosterModal}
              className="text-xs text-gray-300 hover:text-white font-semibold flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver lista de alumnos ({students.length})</span>
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
                Sorteo de Participantes
              </span>

              {activeStudent && (
                <span className="text-xs font-mono font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                  💰 {activeStudent.chips || 1000} Fichas
                </span>
              )}
            </div>

            {activeStudent ? (
              <div className="p-4 bg-black/40 border border-purple-500/30 rounded-2xl flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-3xl shadow-lg">
                  {activeStudent.avatar || '🎩'}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                    Alumno en Turno:
                  </span>
                  <h3 className="text-xl font-black text-white">{activeStudent.name}</h3>
                  <p className="text-xs text-gray-400">
                    Aciertos: {activeStudent.correctAnswers || 0} / {activeStudent.totalQuestions || 0}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl text-center text-gray-400 text-xs">
                Aún no has seleccionado un estudiante para este turno.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                sounds.playChips();
                if (onOpenSpinner) onOpenSpinner();
              }}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-950/60 transition transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Disc3 className="w-4 h-4 text-yellow-300 animate-spin" />
              <span>🎲 GIRAR RULETA DE ALUMNOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Educational Topic / Activity Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-950/30 via-gray-900 to-black border-2 border-amber-500/40 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Actividad / Tema Activo:</span>
            <h4 className="text-base font-black text-white">
              {currentActivity?.title || 'Irregular Verbs Jackpot'}
            </h4>
            <p className="text-xs text-gray-400">
              {currentActivity?.questions?.length || 6} desafíos preparados • Nivel {currentActivity?.level || 'B1'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Activity Selector Dropdown */}
          {activities.length > 1 && (
            <select
              value={currentActivity?.id || ''}
              onChange={(e) => {
                const act = activities.find(a => a.id === e.target.value);
                if (act && onSelectActivity) onSelectActivity(act);
              }}
              className="bg-black/60 border border-gray-700 text-xs text-gray-200 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            >
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onOpenTeacherPortal}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            👨‍🏫 Panel Docente (IA Groq)
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
                El alumno apuesta a un color (Rojo, Negro o Jackpot Dorado). <strong>¡Si la bolilla acierta su predicción queda EXONERADO!</strong> Si no, responde la pregunta de la categoría.
              </p>
            </div>

            <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                Exoneración: Acierto Color
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
  );
}
