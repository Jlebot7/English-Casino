import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  Key, 
  Layers, 
  Check, 
  BookOpen, 
  Users, 
  School, 
  FileQuestion 
} from 'lucide-react';
import { generateEnglishQuiz, GROQ_MODELS, CHALLENGE_TYPES } from '../services/groqService';
import { saveActivity, deleteActivity, generateGamePin } from '../services/firebaseService';
import { sounds } from '../utils/soundEffects';

const GAME_TYPES = [
  { id: 'all', name: 'Todas las Máquinas (Elección en Sala)' },
  { id: 'slots', name: '🎰 Lucky Slots' },
  { id: 'roulette', name: '🎡 Ruleta Vegas' },
  { id: 'blackjack', name: '🃏 21 Blackjack' }
];

export default function TeacherPortal({
  groqApiKey,
  activities,
  onActivitySaved,
  onPlayActivity,
  onOpenSettings,
  classrooms = [],
  activeClassroomId,
  onSelectClassroom,
  students = [],
  onOpenRosterModal
}) {
  const currentClassroom = classrooms.find(c => c.id === activeClassroomId) || classrooms[0];
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'manage'

  // AI Generator Form State
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('B1');
  const [gameType, setGameType] = useState('all');
  const [challengeType, setChallengeType] = useState('random');
  const [questionCount, setQuestionCount] = useState(6);
  const [model, setModel] = useState('openai/gpt-oss-120b');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Current Activity under creation/editing
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  const [questions, setQuestions] = useState([]);
  const [generatedPin, setGeneratedPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generate with Groq AI
  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Por favor ingresa un tema para la actividad de inglés.');
      return;
    }

    if (!groqApiKey) {
      setAiError('Por favor configura tu Groq API Key primero en Ajustes.');
      onOpenSettings();
      return;
    }

    setIsGenerating(true);
    setAiError(null);
    sounds.playChips();

    try {
      const result = await generateEnglishQuiz({
        apiKey: groqApiKey,
        topic,
        level,
        questionCount: Number(questionCount),
        gameType,
        challengeType,
        model,
        customInstructions
      });

      setActivityTitle(result.title || `Vegas ${topic} Challenge`);
      setActivityDesc(result.description || `Práctica de ${topic} con juegos de casino.`);
      setQuestions(result.questions || []);
      setGeneratedPin(generateGamePin());
      sounds.playJackpot();
    } catch (err) {
      console.error(err);
      setAiError(err.message || 'Error al generar actividad con Groq.');
      sounds.playWrong();
    } finally {
      setIsGenerating(false);
    }
  };

  // Add a manual question
  const handleAddQuestion = () => {
    const newQ = {
      id: `q_${Date.now()}`,
      type: 'multiple_choice',
      question: '',
      promptInstructions: 'Responde la pregunta o di la frase en voz alta.',
      options: ['', '', '', ''],
      correctAnswer: '',
      modelAnswer: '',
      explanation: '',
      category: 'Grammar',
      points: 200
    };
    setQuestions([...questions, newQ]);
    sounds.playTick();
  };

  // Update question property
  const handleUpdateQuestion = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  // Update question option
  const handleUpdateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    const oldVal = updated[qIndex].options[optIndex];
    updated[qIndex].options[optIndex] = value;

    if (updated[qIndex].correctAnswer === oldVal) {
      updated[qIndex].correctAnswer = value;
    }
    setQuestions(updated);
  };

  // Delete question
  const handleDeleteQuestion = (qIndex) => {
    const updated = questions.filter((_, idx) => idx !== qIndex);
    setQuestions(updated);
    sounds.playTick();
  };

  // Save activity
  const handleSaveActivity = async () => {
    if (!activityTitle.trim()) {
      alert('Por favor asigna un título a la actividad.');
      return;
    }

    if (questions.length === 0) {
      alert('Por favor agrega al menos una pregunta o genera con la IA.');
      return;
    }

    setIsSaving(true);
    sounds.playChips();

    try {
      const pin = generatedPin || generateGamePin();
      const activityData = {
        title: activityTitle,
        description: activityDesc,
        level,
        category: topic || 'English Challenge',
        gameType,
        challengeType,
        pin,
        questions,
        createdAt: Date.now()
      };

      const saved = await saveActivity(activityData);
      setGeneratedPin(saved.pin || pin);
      setSaveSuccess(true);
      sounds.playJackpot();

      if (onActivitySaved) {
        onActivitySaved(saved);
      }

      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Error guardando la actividad: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete activity
  const handleDeleteActivity = async (activityId) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;

    try {
      await deleteActivity(activityId);
      sounds.playTick();
      if (onActivitySaved) {
        onActivitySaved();
      }
    } catch (err) {
      alert('Error eliminando la actividad: ' + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fadeIn space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <School className="w-3.5 h-3.5 text-amber-400" />
            Panel Docente • Generador Pedagógico
          </div>
          <h2 className="text-2xl font-black text-white">
            Creación & Configuración de Actividades
          </h2>
          <p className="text-xs text-gray-400">
            Diseña retos de inglés con IA Groq (opción múltiple, completar, afirmativo, negativo, preguntas)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Generador IA
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Layers className="w-4 h-4" /> Mis Actividades ({activities.length})
          </button>

          <button
            onClick={onOpenRosterModal}
            className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-gradient-to-r from-purple-900/80 to-indigo-950 border border-purple-500/50 text-purple-200 hover:text-white hover:scale-105 cursor-pointer"
            title="Ingresar y gestionar nombres de estudiantes del salón"
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Alumnos ({students.length})</span>
          </button>
        </div>
      </div>

      {/* Tab: Create / AI Generator */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* AI Generation Box */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-amber-950/40 border border-amber-500/40 rounded-3xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Generador Inteligente Groq IA
              </span>
              {!groqApiKey && (
                <button
                  onClick={onOpenSettings}
                  className="text-xs text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 rounded-lg border border-amber-500/40 flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" /> Configurar Groq API Key
                </button>
              )}
            </div>

            {aiError && (
              <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200">
                {aiError}
              </div>
            )}

            <form onSubmit={handleGenerateAI} className="space-y-4">
              {/* English Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Tema o Punto Gramatical en Inglés *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="ej. Past Simple & Irregular Verbs, Daily Routines, Travel, Conditionals..."
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                    required
                  />
                </div>

                {/* Challenge Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    Tipo de Ejercicio / Desafío:
                  </label>
                  <select
                    value={challengeType}
                    onChange={(e) => setChallengeType(e.target.value)}
                    className="w-full bg-black/60 border border-amber-500/50 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none"
                  >
                    {CHALLENGE_TYPES.map(ct => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CEFR Level, Target Machine, Question Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Nivel CEFR
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="A1">A1 Beginner</option>
                    <option value="A2">A2 Elementary</option>
                    <option value="B1">B1 Intermediate</option>
                    <option value="B2">B2 Upper Intermediate</option>
                    <option value="C1">C1 Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Máquina de Casino
                  </label>
                  <select
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  >
                    {GAME_TYPES.map(gt => (
                      <option key={gt.id} value={gt.id}>{gt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Cantidad de Desafíos
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value={4}>4 Preguntas (Partida Rápida)</option>
                    <option value={6}>6 Preguntas (Estándar)</option>
                    <option value={8}>8 Preguntas (Extendido)</option>
                    <option value={10}>10 Preguntas (Gran Casino)</option>
                  </select>
                </div>
              </div>

              {/* Model and Custom Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Modelo de Groq IA
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  >
                    {GROQ_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Instrucciones Especiales del Docente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="ej. Enfatizar verbos irregulares comunes, usar vocabulario de viajes..."
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-gray-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Generando Actividad con Groq...' : '⚡ Generar Actividad con IA'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Activity Review & Manual Customization Section */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Detalles y Desafíos de la Actividad ({questions.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Revisa, personaliza o agrega preguntas antes de jugar en clase
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddQuestion}
                  className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Agregar Desafío
                </button>

                <button
                  onClick={handleSaveActivity}
                  disabled={isSaving || questions.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Guardando...' : 'Guardar Actividad'}
                </button>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-xl animate-fadeIn flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                ¡Actividad guardada exitosamente! Ya está lista para ser jugada en el proyector.
              </div>
            )}

            {/* Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Título de la Actividad
                </label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="ej. Las Vegas Irregular Verbs Jackpot"
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Descripción o Instrucción
                </label>
                <input
                  type="text"
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="ej. Practica el pasado simple y participios con la ruleta y las tragaperras"
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-2xl">
                <FileQuestion className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm font-semibold mb-1">No hay preguntas cargadas todavía.</p>
                <p className="text-xs text-gray-500">
                  Usa el Generador de IA arriba o haz clic en "Agregar Desafío" para redactar manualmente.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="bg-black/50 border border-gray-800 rounded-2xl p-4 relative group space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                            #{qIdx + 1} Desafío
                          </span>

                          {/* Question Type Selector */}
                          <select
                            value={q.type || 'multiple_choice'}
                            onChange={(e) => handleUpdateQuestion(qIdx, 'type', e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-xs text-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400"
                          >
                            <option value="multiple_choice">📝 Opción Múltiple</option>
                            <option value="fill_blank">✏️ Completar Espacios</option>
                            <option value="sentence_affirmative">➕ Frase Afirmativa</option>
                            <option value="sentence_negative">➖ Frase Negativa</option>
                            <option value="sentence_question">❓ Formular Pregunta</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleDeleteQuestion(qIdx)}
                          className="text-gray-500 hover:text-red-400 p-1 transition"
                          title="Eliminar desafío"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Prompt / Question Text */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1">
                          Pregunta o Claves en Inglés:
                        </label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                          placeholder="ej. She ____ (go) to Paris last summer. O [we / visit / friends]"
                          className="w-full bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>

                      {/* Instructions for Student */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1">
                          Instrucción para el Alumno (en español):
                        </label>
                        <input
                          type="text"
                          value={q.promptInstructions || ''}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'promptInstructions', e.target.value)}
                          placeholder="ej. Di en voz alta una oración afirmativa en pasado simple con:"
                          className="w-full bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-gray-200 focus:outline-none"
                        />
                      </div>

                      {/* If multiple choice: Options */}
                      {q.options && q.options.length >= 2 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2 bg-gray-900/60 p-2 rounded-xl border border-gray-800">
                              <input
                                type="radio"
                                name={`correct_${qIdx}`}
                                checked={q.correctAnswer === opt && opt !== ''}
                                onChange={() => handleUpdateQuestion(qIdx, 'correctAnswer', opt)}
                                className="accent-emerald-500 cursor-pointer"
                                title="Marcar como respuesta correcta"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                placeholder={`Opción ${String.fromCharCode(65 + optIdx)}`}
                                className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Model Answer for Oral Challenges */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                            Respuesta / Frase Modelo Esperada:
                          </label>
                          <input
                            type="text"
                            value={q.modelAnswer || q.correctAnswer || ''}
                            onChange={(e) => {
                              handleUpdateQuestion(qIdx, 'modelAnswer', e.target.value);
                              handleUpdateQuestion(qIdx, 'correctAnswer', e.target.value);
                            }}
                            placeholder="ej. She went to Paris last summer."
                            className="w-full bg-emerald-950/30 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-400 mb-1">
                            Regla / Explicación Educativa:
                          </label>
                          <input
                            type="text"
                            value={q.explanation || ''}
                            onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                            placeholder="ej. 'Go' es un verbo irregular cuyo pasado simple es 'went'."
                            className="w-full bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Manage Activities */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Actividades Disponibles</h3>
            <span className="text-xs text-gray-400">Total: {activities.length} actividades</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((act) => (
              <div
                key={act.id}
                className="bg-black/40 border border-gray-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Nivel {act.level || 'B1'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {act.questions?.length || 0} preguntas
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white mb-1">{act.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{act.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Máquina: <strong>{act.gameType || 'Todas'}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPlayActivity && onPlayActivity(act)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs rounded-xl shadow transition hover:scale-105 cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" /> Jugar
                    </button>

                    <button
                      onClick={() => handleDeleteActivity(act.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition cursor-pointer"
                      title="Eliminar actividad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
