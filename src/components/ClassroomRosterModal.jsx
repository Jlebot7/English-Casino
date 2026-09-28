import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  X, 
  Trophy, 
  Dices, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Coins, 
  School, 
  FolderPlus,
  Edit2
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const AVATARS = ['🎩', '👑', '🍀', '🦊', '🤖', '💎', '🎲', '🦁', '⭐', '🚀', '🎯', '🐯'];

export default function ClassroomRosterModal({
  isOpen,
  onClose,
  classrooms,
  activeClassroomId,
  onSelectClassroom,
  onCreateClassroom,
  onDeleteClassroom,
  onUpdateStudents,
  activeStudentIndex,
  onSelectActiveStudent,
  onRandomStudent
}) {
  const [singleName, setSingleName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  // New classroom state
  const [showNewClassroomForm, setShowNewClassroomForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  if (!isOpen) return null;

  const currentClassroom = classrooms.find(c => c.id === activeClassroomId) || classrooms[0] || {
    id: 'default',
    name: 'Mi Salón',
    students: []
  };

  const students = currentClassroom.students || [];

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

    onUpdateStudents(currentClassroom.id, [...students, newStudent]);
    setSingleName('');
    sounds.playChips();
  };

  // Add bulk students from comma or newline separated list
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

    onUpdateStudents(currentClassroom.id, [...students, ...newStudents]);
    setBulkText('');
    setShowBulkInput(false);
    sounds.playJackpot();
  };

  // Remove student from active classroom
  const handleRemoveStudent = (id) => {
    const updated = students.filter(s => s.id !== id);
    onUpdateStudents(currentClassroom.id, updated);
    sounds.playTick();
  };

  // Reset all students' chips to 1000 in active classroom
  const handleResetScores = () => {
    if (confirm(`¿Reiniciar las fichas de los alumnos de "${currentClassroom.name}" a 1,000?`)) {
      const reset = students.map(s => ({
        ...s,
        chips: 1000,
        correctAnswers: 0,
        totalQuestions: 0
      }));
      onUpdateStudents(currentClassroom.id, reset);
      sounds.playCoin();
    }
  };

  // Create new classroom
  const handleCreateNewClassroom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    onCreateClassroom(newRoomName.trim());
    setNewRoomName('');
    setShowNewClassroomForm(false);
    sounds.playJackpot();
  };

  // Delete current classroom
  const handleDeleteCurrentClassroom = () => {
    if (classrooms.length <= 1) {
      alert('Debes mantener al menos un salón creado.');
      return;
    }
    if (confirm(`¿Eliminar el salón "${currentClassroom.name}" y todos sus alumnos?`)) {
      onDeleteClassroom(currentClassroom.id);
      sounds.playTick();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-amber-500/80 rounded-3xl p-6 max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              Gestión de Salones y Estudiantes
            </h3>
            <p className="text-xs text-gray-400">
              Organiza tus alumnos por grados, cursos o grupos para jugar por turnos en el casino
            </p>
          </div>
        </div>

        {/* Classroom Tabs Selector & Creator */}
        <div className="bg-black/60 p-3 rounded-2xl border border-gray-800 mb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-amber-400" />
              Selecciona el Salón Activo:
            </span>

            <button
              onClick={() => setShowNewClassroomForm(!showNewClassroomForm)}
              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-1 shadow transition cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Nuevo Salón</span>
            </button>
          </div>

          {/* Form to create classroom */}
          {showNewClassroomForm && (
            <form onSubmit={handleCreateNewClassroom} className="p-3 bg-gray-900 border border-amber-500/40 rounded-xl flex gap-2 animate-fadeIn">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Nombre del nuevo salón (ej. 9° Grado B, Inglés Intensivo)..."
                className="flex-1 bg-black/60 border border-gray-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow"
              >
                Guardar Salón
              </button>
              <button
                type="button"
                onClick={() => setShowNewClassroomForm(false)}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs hover:bg-gray-700"
              >
                Cancelar
              </button>
            </form>
          )}

          {/* Classroom Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {classrooms.map((cls) => {
              const isSelected = cls.id === currentClassroom.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => {
                    sounds.playTick();
                    onSelectClassroom(cls.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-amber-400/50'
                  }`}
                >
                  <span>{cls.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-black text-amber-300' : 'bg-black/50 text-gray-400'
                  }`}>
                    {cls.students?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Active Classroom Banner & Controls */}
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-black text-white">
              Salón: <span className="text-amber-400">{currentClassroom.name}</span>
            </h4>
            <span className="text-xs text-gray-400">
              ({students.length} estudiantes)
            </span>
          </div>

          {classrooms.length > 1 && (
            <button
              onClick={handleDeleteCurrentClassroom}
              className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
              title="Eliminar este salón"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar Salón
            </button>
          )}
        </div>

        {/* Input Methods: Single Add vs Bulk Paste */}
        <div className="bg-black/50 p-3.5 rounded-2xl border border-gray-800 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">
              {showBulkInput ? `Pegar lista de alumnos para ${currentClassroom.name}` : `Agregar alumno a ${currentClassroom.name}`}
            </span>
            <button
              onClick={() => setShowBulkInput(!showBulkInput)}
              className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
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
                placeholder={`Pega aquí los nombres de tus estudiantes...\nEjemplo:\nCarlos Gómez\nAna Morales\nMateo Silva\nValentina Ríos`}
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white focus:outline-none font-sans"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkInput(false)}
                  className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddBulk}
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs rounded-lg shadow hover:scale-105 transition cursor-pointer"
                >
                  Importar Estudiantes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls for Turn Picker */}
        {students.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={onRandomStudent}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" /> Elegir Al Azar 🎲
              </button>

              <button
                onClick={handleResetScores}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="Reiniciar fichas"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Fichas a 1000
              </button>
            </div>
          </div>
        )}

        {/* Students Roster & Score List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {students.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-2xl">
              <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm font-semibold">No hay estudiantes en {currentClassroom.name}.</p>
              <p className="text-xs text-gray-500 mt-1">
                Escribe un nombre arriba o pega la lista de alumnos para comenzar el modo por turnos en este salón.
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
                    onSelectActiveStudent(idx);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border-2 transition cursor-pointer ${
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
                      title="Eliminar estudiante de este salón"
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
        <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
          <span className="text-[11px] text-gray-400">
            Salón seleccionado: <strong className="text-amber-300">{currentClassroom.name}</strong>
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
