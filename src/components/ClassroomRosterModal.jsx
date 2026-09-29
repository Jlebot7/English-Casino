import React, { useState } from 'react';
import { Users, Plus, Trash2, X, Trophy, Dices, RotateCcw, Sparkles, Coins, School, Edit2, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const AVATARS = ['🎩', '👑', '🍀', '🦊', '🤖', '💎', '🎲', '🦁', '⭐', '🚀', '🎯', '🐯', '⚡', '🌸', '🐬'];

export default function ClassroomRosterModal({
  isOpen,
  onClose,
  classrooms = [],
  activeClassroomId,
  onSelectClassroom,
  onCreateClassroom,
  onDeleteClassroom,
  students = [],
  onUpdateStudents,
  activeStudentIndex,
  onSelectActiveStudent,
  onOpenSpinner
}) {
  const [singleName, setSingleName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [showAddClassroom, setShowAddClassroom] = useState(false);

  if (!isOpen) return null;

  const currentClassroom = classrooms.find(c => c.id === activeClassroomId) || classrooms[0];

  // Add single student to active classroom
  const handleAddSingle = (e) => {
    e.preventDefault();
    if (!singleName.trim()) return;

    const newStudent = {
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: singleName.trim(),
      avatar: AVATARS[students.length % AVATARS.length],
      chips: 1000,
      correctAnswers: 0,
      totalQuestions: 0
    };

    onUpdateStudents([...students, newStudent]);
    setSingleName('');
    sounds.playChips();
  };

  // Add bulk students
  const handleAddBulk = () => {
    if (!bulkText.trim()) return;

    const names = bulkText
      .split(/[\n,;]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) return;

    const newStudents = names.map((name, idx) => ({
      id: `std_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      avatar: AVATARS[(students.length + idx) % AVATARS.length],
      chips: 1000,
      correctAnswers: 0,
      totalQuestions: 0
    }));

    onUpdateStudents([...students, ...newStudents]);
    setBulkText('');
    setShowBulkInput(false);
    sounds.playJackpot();
  };

  // Remove student
  const handleRemoveStudent = (id) => {
    const updated = students.filter(s => s.id !== id);
    onUpdateStudents(updated);
    sounds.playTick();
  };

  // Reset chips to 1000
  const handleResetScores = () => {
    if (confirm('¿Reiniciar las fichas y estadísticas de todos los estudiantes de este salón a 1,000?')) {
      const reset = students.map(s => ({
        ...s,
        chips: 1000,
        correctAnswers: 0,
        totalQuestions: 0
      }));
      onUpdateStudents(reset);
      sounds.playCoin();
    }
  };

  // Create new classroom
  const handleCreateClassroomSubmit = (e) => {
    e.preventDefault();
    if (!newClassroomName.trim()) return;
    if (onCreateClassroom) {
      onCreateClassroom(newClassroomName.trim());
      setNewClassroomName('');
      setShowAddClassroom(false);
      sounds.playChips();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-amber-500/80 rounded-3xl p-5 md:p-6 max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              Gestión de Salones y Estudiantes
            </h3>
            <p className="text-xs text-gray-400">
              Selecciona el salón de clases activo, agrega alumnos o sortea con la ruleta
            </p>
          </div>
        </div>

        {/* Classroom Selector Pills */}
        <div className="bg-black/50 p-3 rounded-2xl border border-gray-800 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-amber-400" />
              Elegir Salón de Clases:
            </span>

            <button
              onClick={() => setShowAddClassroom(!showAddClassroom)}
              className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo Salón
            </button>
          </div>

          {showAddClassroom && (
            <form onSubmit={handleCreateClassroomSubmit} className="flex gap-2 pt-1 animate-fadeIn">
              <input
                type="text"
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
                placeholder="Nombre del salón (ej. 10-A Mañana, Inglés Básico 2)..."
                className="flex-1 bg-gray-900 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-xl shadow hover:bg-amber-400 transition"
              >
                Crear
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {classrooms.map((c) => {
              const isSelected = c.id === activeClassroomId;
              return (
                <div key={c.id} className="flex items-center">
                  <button
                    onClick={() => {
                      sounds.playTick();
                      if (onSelectClassroom) onSelectClassroom(c.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-black'
                        : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700'
                    }`}
                  >
                    <span>🏫 {c.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-black/30 text-black' : 'bg-black/40 text-amber-400'
                    }`}>
                      {c.students?.length || 0}
                    </span>
                  </button>

                  {classrooms.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el salón "${c.name}" y todos sus alumnos?`)) {
                          if (onDeleteClassroom) onDeleteClassroom(c.id);
                        }
                      }}
                      className="ml-1 p-1 text-gray-600 hover:text-red-400 transition"
                      title="Eliminar este salón"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Methods: Single Add vs Bulk Paste */}
        <div className="bg-black/50 p-3.5 rounded-2xl border border-gray-800 mb-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">
              Alumnos de <strong className="text-amber-300">{currentClassroom?.name || 'Salón Activo'}</strong> ({students.length})
            </span>
            <button
              onClick={() => setShowBulkInput(!showBulkInput)}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              {showBulkInput ? '← Agregar de a uno' : '📋 Pegar lista completa (Excel / Comas)'}
            </button>
          </div>

          {!showBulkInput ? (
            <form onSubmit={handleAddSingle} className="flex gap-2">
              <input
                type="text"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                placeholder="Nombre del alumno (ej. Sofía Martínez, Juan Pérez)..."
                className="flex-1 bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-1 shadow transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Pega aquí los nombres de tus estudiantes (uno por línea o separados por comas)...\nEjemplo:\nCarlos Gómez\nAna Morales\nMateo Silva\nValentina Ríos`}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white focus:outline-none font-sans"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkInput(false)}
                  className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddBulk}
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs rounded-lg shadow hover:scale-105 transition"
                >
                  Importar Estudiantes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls for Turn Picker */}
        {students.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenSpinner) onOpenSpinner();
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" /> 🎲 Sortear con Ruleta de Alumnos
              </button>

              <button
                onClick={handleResetScores}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                title="Reiniciar fichas"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Fichas
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm(`¿Vaciar la lista de alumnos de ${currentClassroom?.name}?`)) {
                  onUpdateStudents([]);
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 font-semibold p-1"
            >
              Vaciar Lista
            </button>
          </div>
        )}

        {/* Students Roster & Score List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {students.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-2xl">
              <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-300 text-sm font-semibold">No hay estudiantes en este salón aún.</p>
              <p className="text-xs text-gray-500 mt-1">
                Escribe un nombre arriba o pega la lista de alumnos para comenzar el modo por turnos.
              </p>
            </div>
          ) : (
            students.map((student, idx) => {
              const isActive = idx === activeStudentIndex;
              const accuracy = student.totalQuestions > 0
                ? Math.round((student.correctAnswers / student.totalQuestions) * 100)
                : 0;

              return (
                <div
                  key={student.id || idx}
                  onClick={() => {
                    sounds.playTick();
                    if (onSelectActiveStudent) onSelectActiveStudent(idx);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.01]'
                      : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{student.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{student.name}</h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-black uppercase tracking-wider animate-pulse">
                            Turno Actual
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {student.correctAnswers} / {student.totalQuestions} aciertos ({accuracy}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-400 flex items-center justify-end gap-1">
                        <Coins className="w-3.5 h-3.5 text-yellow-400" />
                        {student.chips?.toLocaleString() || 1000}
                      </span>
                      <span className="text-[10px] text-gray-500">Fichas</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStudent(student.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition"
                      title="Eliminar estudiante"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between items-center">
          <span className="text-[11px] text-gray-400">
            Haz clic en cualquier alumno para asignarle el turno de juego.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl text-xs shadow transition hover:scale-105 cursor-pointer"
          >
            Listo para Jugar
          </button>
        </div>
      </div>
    </div>
  );
}
