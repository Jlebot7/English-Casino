import React from 'react';
import { Users, Dices, ChevronRight, Trophy, Sparkles, Coins, School } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ClassroomTurnBar({
  classrooms = [],
  activeClassroomId,
  onSelectClassroom,
  students = [],
  activeStudent,
  onNextStudent,
  onRandomStudent,
  onOpenRosterModal
}) {
  const currentClassroom = classrooms.find(c => c.id === activeClassroomId) || classrooms[0];

  if (!students || students.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-4 px-4 py-2.5 bg-gray-900/80 border border-amber-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <School className="w-4 h-4 text-amber-400" />
          <span className="text-gray-300">
            Salón actual: <strong className="text-amber-300">{currentClassroom?.name || 'Mi Salón'}</strong> (Sin alumnos cargados)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {classrooms.length > 1 && (
            <select
              value={activeClassroomId}
              onChange={(e) => {
                sounds.playTick();
                onSelectClassroom(e.target.value);
              }}
              className="bg-black/60 border border-gray-700 text-amber-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.students?.length || 0})</option>
              ))}
            </select>
          )}

          <button
            onClick={onOpenRosterModal}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold text-xs flex items-center gap-1 transition shadow cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" /> Cargar Alumnos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 p-3 bg-gradient-to-r from-gray-950 via-amber-950/40 to-gray-950 border-2 border-amber-500/60 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
      {/* Current Classroom & Active Student in Turn */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shadow-inner animate-bounce">
          {activeStudent?.avatar || '🎩'}
        </div>

        <div>
          <div className="flex items-center gap-2">
            {/* Classroom Selector Dropdown */}
            {classrooms.length > 0 && (
              <select
                value={activeClassroomId}
                onChange={(e) => {
                  sounds.playTick();
                  onSelectClassroom(e.target.value);
                }}
                className="bg-black/70 border border-amber-500/50 text-amber-300 text-[11px] font-bold rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
                title="Cambiar de salón durante la partida"
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>🏫 {c.name} ({c.students?.length || 0})</option>
                ))}
              </select>
            )}

            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              🎯 Turno {students.indexOf(activeStudent) + 1} de {students.length}
            </span>
          </div>

          <h4 className="text-base font-black text-white flex items-center gap-2 mt-0.5">
            {activeStudent?.name || 'Estudiante'}
          </h4>
        </div>
      </div>

      {/* Student Personal Chips & Turn Controls */}
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
          className="p-2 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow cursor-pointer"
          title="Elegir al azar el próximo estudiante de este salón"
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
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black transition flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer"
          title="Pasar al siguiente estudiante"
        >
          <span>Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Manage Roster Button */}
        <button
          onClick={onOpenRosterModal}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          title="Gestionar salones y lista de alumnos"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
