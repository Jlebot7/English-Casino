import React from 'react';
import { Users, Dices, ChevronRight, Trophy, Sparkles, Coins } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ClassroomTurnBar({
  students,
  activeStudent,
  onNextStudent,
  onRandomStudent,
  onOpenRosterModal
}) {
  if (!students || students.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-4 px-4 py-2 bg-gray-900/60 border border-gray-800 rounded-2xl flex items-center justify-between text-xs backdrop-blur-sm">
        <span className="text-gray-400 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-amber-400" />
          ¿Juegas con tu clase? Puedes ingresar los nombres de tus estudiantes.
        </span>
        <button
          onClick={onOpenRosterModal}
          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-xs flex items-center gap-1 transition"
        >
          <Users className="w-3.5 h-3.5" /> Cargar Estudiantes
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 p-3 bg-gradient-to-r from-gray-950 via-amber-950/40 to-gray-950 border-2 border-amber-500/60 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
      {/* Current Student in Turn */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shadow-inner animate-bounce">
          {activeStudent?.avatar || '🎩'}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              🎯 Turno de Juego
            </span>
            <span className="text-xs text-gray-400">
              ({students.indexOf(activeStudent) + 1} de {students.length})
            </span>
          </div>
          <h4 className="text-base font-black text-white flex items-center gap-2">
            {activeStudent?.name || 'Estudiante'}
          </h4>
        </div>
      </div>

      {/* Student Personal Chips & Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-black/60 border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-inner mr-1">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-black text-amber-300">
            {activeStudent?.chips?.toLocaleString() || 1000} Fichas
          </span>
        </div>

        {/* Random Student Button */}
        <button
          onClick={() => {
            sounds.playTick();
            onRandomStudent();
          }}
          className="p-2 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
          title="Elegir al azar el próximo estudiante"
        >
          <Dices className="w-4 h-4 text-purple-300" />
          <span className="hidden sm:inline">Al Azar</span>
        </button>

        {/* Next Turn Button */}
        <button
          onClick={() => {
            sounds.playTick();
            onNextStudent();
          }}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black transition flex items-center gap-1 shadow-md shadow-amber-500/20"
          title="Pasar al siguiente estudiante"
        >
          <span>Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Manage Roster Button */}
        <button
          onClick={onOpenRosterModal}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-bold transition"
          title="Ver o modificar lista de estudiantes"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
