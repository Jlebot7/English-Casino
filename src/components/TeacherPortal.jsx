import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Share2, 
  Play, 
  Key, 
  HelpCircle, 
  Layers, 
  Check, 
  Copy, 
  BookOpen, 
  Settings as SettingsIcon,
  Bot,
  Users,
  School
} from 'lucide-react';
import { generateEnglishQuiz, GROQ_MODELS } from '../services/groqService';
import { saveActivity, deleteActivity, generateGamePin } from '../services/firebaseService';
import { sounds } from '../utils/soundEffects';

const CEFR_LEVELS = ['A1 Beginner', 'A2 Elementary', 'B1 Intermediate', 'B2 Upper-Intermediate', 'C1 Advanced'];
const GAME_TYPES = [
  { id: 'all', name: 'All Machines (Lobby choice)' },
  { id: 'slots', name: '🎰 Lucky Slots' },
  { id: 'roulette', name: '🎡 Roulette of Fortune' },
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
  const [questionCount, setQuestionCount] = useState(6);
  const [model, setModel] = useState('llama-3.1-8b-instant');
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
  const [copiedPin, setCopiedPin] = useState(false);

  // Generate with Groq AI
  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Please enter a topic for the activity.');
      return;
    }

    if (!groqApiKey) {
      setAiError('Please configure your Groq API Key first.');
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
        model,
        customInstructions
      });

      setActivityTitle(result.title || `Vegas ${topic} Challenge`);
      setActivityDesc(result.description || `Practice ${topic} with casino games!`);
      setQuestions(result.questions || []);
      setGeneratedPin(generateGamePin());
      sounds.playJackpot();
    } catch (err) {
      console.error(err);
      setAiError(err.message || 'Failed to generate quiz. Check your API key.');
      sounds.playWrong();
    } finally {
      setIsGenerating(false);
    }
  };

  // Add a manual question
  const handleAddQuestion = () => {
    const newQ = {
      id: `q_${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
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

    // If this option was selected as correct answer, update correctAnswer string too
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
      alert('Please provide a title for the activity.');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question.');
      return;
    }

    // Verify each question has a valid correct answer
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Question #${i + 1} cannot have an empty question prompt.`);
        return;
      }
      if (!q.correctAnswer.trim()) {
        alert(`Please select the correct answer for question #${i + 1}.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const activityData = {
        title: activityTitle,
        description: activityDesc,
        level,
        category: topic || 'English',
        gameType,
        pin: generatedPin || generateGamePin(),
        questions: questions
      };

      const saved = await saveActivity(activityData);
      setGeneratedPin(saved.pin);
      setSaveSuccess(true);
      sounds.playJackpot();

      if (onActivitySaved) {
        onActivitySaved(saved);
      }

      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert('Error saving activity: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?pin=${generatedPin}`;
    navigator.clipboard.writeText(url);
    setCopiedPin(true);
    sounds.playCoin();
    setTimeout(() => setCopiedPin(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 animate-fadeIn">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-amber-400" />
            Teacher Activity Creator
          </h2>
          <p className="text-xs text-gray-400">
            Design English casino challenges with Groq AI or manual creation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Generator
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Layers className="w-4 h-4" /> Mis Actividades ({activities.length})
          </button>

          <button
            onClick={onOpenRosterModal}
            className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-gradient-to-r from-purple-900/80 to-indigo-950 border border-purple-500/50 text-purple-200 hover:text-white hover:scale-105"
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
          <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Groq AI Instant Activity Generator
              </span>
              {!groqApiKey && (
                <button
                  onClick={onOpenSettings}
                  className="text-xs text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 rounded-lg border border-amber-500/40 flex items-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" /> Set Groq API Key
                </button>
              )}
            </div>

            {aiError && (
              <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200">
                {aiError}
              </div>
            )}

            <form onSubmit={handleGenerateAI} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    English Topic or Grammar Point *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Past Continuous vs Simple Past, Job Interview Idioms..."
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      CEFR Level
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
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
                      Target Machine
                    </label>
                    <select
                      value={gameType}
                      onChange={(e) => setGameType(e.target.value)}
                      className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                    >
                      {GAME_TYPES.map(gt => (
                        <option key={gt.id} value={gt.id}>{gt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value={4}>4 Questions (Quick Spin)</option>
                    <option value={6}>6 Questions (Standard)</option>
                    <option value={8}>8 Questions (Extended)</option>
                    <option value={10}>10 Questions (High Roller)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Groq Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    {GROQ_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Specific Focus (Optional)
                  </label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. emphasize false friends or British vs US"
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-gray-950 font-black text-sm uppercase rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating with Groq AI...' : 'Generate Casino Activity'}
                </button>
              </div>
            </form>
          </div>

          {/* Activity Editor & Review */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Activity Details & Questions ({questions.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Review and customize before sharing with students
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddQuestion}
                  className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>

                <button
                  onClick={handleSaveActivity}
                  disabled={isSaving || questions.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. Vegas Irregular Verbs Bonanza"
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Activity Description
                </label>
                <input
                  type="text"
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="Short summary for your students"
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Generated PIN Share Banner */}
            {generatedPin && (
              <div className="p-4 bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 bg-black/80 border border-amber-400 rounded-xl">
                    <span className="text-xs text-gray-400 block font-semibold">ROOM PIN</span>
                    <span className="text-xl font-black text-amber-300 tracking-widest">{generatedPin}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Direct Game Link Available</p>
                    <p className="text-[11px] text-gray-400">Students can join using this PIN or clicking the link</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition"
                  >
                    {copiedPin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPin ? 'Link Copied!' : 'Copy Share Link'}
                  </button>

                  <button
                    onClick={() => onPlayActivity && onPlayActivity({
                      title: activityTitle,
                      description: activityDesc,
                      pin: generatedPin,
                      gameType,
                      questions
                    })}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5" /> Test Play
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-2xl">
                <p className="text-gray-500 text-sm mb-2">No questions yet.</p>
                <p className="text-xs text-gray-600">Use the Groq AI Generator above or click "Add Question" to begin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="bg-black/40 border border-gray-800 rounded-xl p-4 relative group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        #{qIdx + 1} Question
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(qIdx)}
                        className="text-gray-500 hover:text-red-400 p-1 transition"
                        title="Remove question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                      placeholder="Question prompt..."
                      className="w-full bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-lg px-3 py-2 text-sm text-white mb-3"
                    />

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 bg-gray-900/60 p-2 rounded-lg border border-gray-800">
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.correctAnswer === opt && opt !== ''}
                            onChange={() => handleUpdateQuestion(qIdx, 'correctAnswer', opt)}
                            title="Mark as correct answer"
                            className="text-amber-500 focus:ring-amber-400"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            className="w-full bg-transparent text-xs text-gray-200 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                      placeholder="Educational explanation (revealed after student answers)..."
                      className="w-full bg-gray-900 border border-gray-800 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs text-gray-300"
                    />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((act) => (
              <div
                key={act.id}
                className="bg-gray-900 border border-gray-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      PIN: {act.pin}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold">
                      {act.questions?.length || 0} Questions
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{act.title}</h4>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">{act.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <span className="text-[11px] text-gray-500 uppercase font-semibold">
                    {act.level || 'All levels'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPlayActivity && onPlayActivity(act)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg flex items-center gap-1 shadow transition"
                    >
                      <Play className="w-3.5 h-3.5" /> Play
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm(`Delete activity "${act.title}"?`)) {
                          await deleteActivity(act.id);
                          if (onActivitySaved) onActivitySaved(null);
                        }
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition"
                      title="Delete activity"
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
