import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentLobby from './components/StudentLobby';
import TeacherPortal from './components/TeacherPortal';
import LeaderboardModal from './components/LeaderboardModal';
import SettingsModal from './components/SettingsModal';
import ClassroomRosterModal from './components/ClassroomRosterModal';
import ClassroomTurnBar from './components/ClassroomTurnBar';
import SlotsGame from './components/games/SlotsGame';
import RouletteGame from './components/games/RouletteGame';
import BlackjackGame from './components/games/BlackjackGame';

import { DEFAULT_ACTIVITIES } from './data/defaultActivities';
import { 
  getAllActivities, 
  getActivityByPinOrId, 
  submitScore 
} from './services/firebaseService';
import { sounds } from './utils/soundEffects';

const STORAGE_CHIPS_KEY = 'lucky_english_chips';
const STORAGE_NICK_KEY = 'lucky_english_nick';
const STORAGE_AVATAR_KEY = 'lucky_english_avatar';
const STORAGE_GROQ_KEY = 'lucky_english_groq_key';
const STORAGE_CLASSROOMS_KEY = 'lucky_english_classrooms';
const STORAGE_ACTIVE_CLASSROOM_KEY = 'lucky_english_active_classroom';

const INITIAL_DEFAULT_CLASSROOMS = [
  {
    id: 'room_1',
    name: '7° Básico A',
    description: 'Nivel Inicial / A2',
    students: [
      { id: 'std_1', name: 'Carlos Gómez', avatar: '🎩', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_2', name: 'Sofía Martínez', avatar: '👑', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_3', name: 'Mateo Silva', avatar: '🍀', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_4', name: 'Valentina Ríos', avatar: '💎', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
    ]
  },
  {
    id: 'room_2',
    name: '8° Básico B',
    description: 'Nivel Intermedio / B1',
    students: [
      { id: 'std_5', name: 'Lucas Herrera', avatar: '🦊', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_6', name: 'Camila Rojas', avatar: '⭐', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_7', name: 'Andrés Castro', avatar: '🚀', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_8', name: 'Isabella Cruz', avatar: '🐯', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
    ]
  },
  {
    id: 'room_3',
    name: 'Inglés Avanzado C1',
    description: 'Club de Conversación & Gramática',
    students: [
      { id: 'std_9', name: 'Daniela Paz', avatar: '🦁', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_10', name: 'Joaquín Morales', avatar: '🎲', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_11', name: 'Mariana Duarte', avatar: '👑', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
    ]
  }
];

export default function App() {
  // App views: 'lobby' | 'teacher' | 'game'
  const [currentView, setCurrentView] = useState('lobby');

  // Player state (solo mode)
  const [chips, setChips] = useState(() => {
    const saved = localStorage.getItem(STORAGE_CHIPS_KEY);
    return saved ? parseInt(saved, 10) : 1000;
  });
  const [playerNick, setPlayerNick] = useState(() => {
    return localStorage.getItem(STORAGE_NICK_KEY) || 'LuckyLearner';
  });
  const [playerAvatar, setPlayerAvatar] = useState(() => {
    return localStorage.getItem(STORAGE_AVATAR_KEY) || '🎩';
  });

  // Multi-Classroom state
  const [classrooms, setClassrooms] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CLASSROOMS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_DEFAULT_CLASSROOMS;
    } catch {
      return INITIAL_DEFAULT_CLASSROOMS;
    }
  });

  const [activeClassroomId, setActiveClassroomId] = useState(() => {
    return localStorage.getItem(STORAGE_ACTIVE_CLASSROOM_KEY) || 'room_1';
  });

  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  // Settings & Configuration
  const [groqApiKey, setGroqApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_GROQ_KEY) || '';
  });
  const [volume, setVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Activities
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [activeGameMachine, setActiveGameMachine] = useState('slots'); // 'slots' | 'roulette' | 'blackjack'
  const [showMachinePicker, setShowMachinePicker] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_CHIPS_KEY, chips.toString());
  }, [chips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_NICK_KEY, playerNick);
  }, [playerNick]);

  useEffect(() => {
    localStorage.setItem(STORAGE_AVATAR_KEY, playerAvatar);
  }, [playerAvatar]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CLASSROOMS_KEY, JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ACTIVE_CLASSROOM_KEY, activeClassroomId);
  }, [activeClassroomId]);

  // Current active classroom and its students
  const activeClassroom = classrooms.find(c => c.id === activeClassroomId) || classrooms[0] || {
    id: 'default',
    name: 'Mi Salón',
    students: []
  };

  const activeStudents = activeClassroom.students || [];
  const activeStudent = activeStudents.length > 0 ? (activeStudents[activeStudentIndex] || activeStudents[0]) : null;

  // Classroom handlers
  const handleSelectClassroom = (roomId) => {
    setActiveClassroomId(roomId);
    setActiveStudentIndex(0);
  };

  const handleCreateClassroom = (name) => {
    const newRoom = {
      id: `room_${Date.now()}`,
      name,
      description: 'Salón de clases',
      students: []
    };
    setClassrooms(prev => [...prev, newRoom]);
    setActiveClassroomId(newRoom.id);
    setActiveStudentIndex(0);
  };

  const handleDeleteClassroom = (roomId) => {
    const updated = classrooms.filter(c => c.id !== roomId);
    setClassrooms(updated);
    if (updated.length > 0) {
      setActiveClassroomId(updated[0].id);
      setActiveStudentIndex(0);
    }
  };

  const handleUpdateClassroomStudents = (classroomId, newStudents) => {
    setClassrooms(prev => prev.map(c => {
      if (c.id === classroomId) {
        return { ...c, students: newStudents };
      }
      return c;
    }));

    if (classroomId === activeClassroomId && activeStudentIndex >= newStudents.length) {
      setActiveStudentIndex(Math.max(0, newStudents.length - 1));
    }
  };

  const handleNextStudent = () => {
    if (activeStudents.length === 0) return;
    setActiveStudentIndex(prev => (prev + 1) % activeStudents.length);
  };

  const handleRandomStudent = () => {
    if (activeStudents.length === 0) return;
    const randIdx = Math.floor(Math.random() * activeStudents.length);
    setActiveStudentIndex(randIdx);
  };

  // Record individual score for student who took the turn in active classroom
  const handleRecordStudentScore = (studentId, chipDelta, isCorrect, countAsQuestion) => {
    setClassrooms(prev => prev.map(cls => {
      if (cls.id === activeClassroomId) {
        const updatedStudents = (cls.students || []).map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              chips: Math.max(0, (s.chips || 1000) + chipDelta),
              correctAnswers: (s.correctAnswers || 0) + (isCorrect ? 1 : 0),
              totalQuestions: (s.totalQuestions || 0) + (countAsQuestion ? 1 : 0)
            };
          }
          return s;
        });
        return { ...cls, students: updatedStudents };
      }
      return cls;
    }));
  };

  // Load activities from Firebase or LocalStorage and merge with default ones
  const loadAllActivities = async () => {
    try {
      const customList = await getAllActivities();
      const merged = [...customList];
      DEFAULT_ACTIVITIES.forEach(def => {
        if (!merged.some(m => m.id === def.id || m.pin === def.pin)) {
          merged.push(def);
        }
      });
      setActivities(merged);
    } catch (err) {
      console.warn('Could not load custom activities:', err);
    }
  };

  useEffect(() => {
    loadAllActivities();
  }, []);

  // Check URL parameters for direct PIN join (e.g. ?pin=VERB77)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pin = params.get('pin');
    if (pin) {
      handleJoinByPin(pin);
    }
  }, []);

  // Update chips helper
  const handleUpdateChips = (delta) => {
    setChips(prev => Math.max(0, prev + delta));
  };

  // Sound handlers
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const handleChangeVolume = (vol) => {
    setVolume(vol);
    sounds.setVolume(vol);
  };

  const handleSaveGroqKey = (key) => {
    setGroqApiKey(key);
    localStorage.setItem(STORAGE_GROQ_KEY, key);
  };

  // Join activity via PIN
  const handleJoinByPin = async (pin) => {
    sounds.playChips();
    const found = await getActivityByPinOrId(pin);
    if (found) {
      launchActivity(found);
    } else {
      sounds.playWrong();
      alert(`El PIN "${pin}" no fue encontrado. ¡Por favor verifica el código!`);
    }
  };

  // Launch activity
  const launchActivity = (activity) => {
    setCurrentActivity(activity);

    if (activity.gameType && ['slots', 'roulette', 'blackjack'].includes(activity.gameType)) {
      setActiveGameMachine(activity.gameType);
      setShowMachinePicker(false);
      setCurrentView('game');
    } else {
      setShowMachinePicker(true);
      setCurrentView('game');
    }
  };

  // Game complete handler
  const handleFinishGame = async ({ gameId, correctAnswers, totalQuestions, finalChips }) => {
    try {
      const scoringPlayer = activeStudent ? activeStudent.name : playerNick;
      const scoringAvatar = activeStudent ? activeStudent.avatar : playerAvatar;

      await submitScore({
        pin: currentActivity?.pin || 'CASINO',
        gameId,
        playerNick: scoringPlayer,
        chips: finalChips,
        correctAnswers,
        totalQuestions,
        avatar: scoringAvatar
      });
    } catch (err) {
      console.warn('Score submission error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        chips={chips}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        studentsCount={activeStudents.length}
        activeClassroomName={activeClassroom?.name}
        classroomsCount={classrooms.length}
        onOpenRosterModal={() => setIsRosterModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-12">
        {currentView === 'lobby' && (
          <StudentLobby
            activities={activities}
            playerNick={playerNick}
            setPlayerNick={setPlayerNick}
            playerAvatar={playerAvatar}
            setPlayerAvatar={setPlayerAvatar}
            chips={chips}
            onJoinPin={handleJoinByPin}
            onSelectActivity={launchActivity}
            classrooms={classrooms}
            activeClassroomId={activeClassroomId}
            onSelectClassroom={handleSelectClassroom}
            students={activeStudents}
            onOpenRosterModal={() => setIsRosterModalOpen(true)}
          />
        )}

        {currentView === 'teacher' && (
          <TeacherPortal
            groqApiKey={groqApiKey}
            activities={activities}
            onActivitySaved={(saved) => {
              loadAllActivities();
            }}
            onPlayActivity={launchActivity}
            onOpenSettings={() => setIsSettingsOpen(true)}
            classrooms={classrooms}
            activeClassroomId={activeClassroomId}
            onSelectClassroom={handleSelectClassroom}
            students={activeStudents}
            onOpenRosterModal={() => setIsRosterModalOpen(true)}
          />
        )}

        {currentView === 'game' && currentActivity && (
          <div className="w-full">
            {/* Classroom Turn Bar with Room Selector (Shown above games) */}
            <ClassroomTurnBar
              classrooms={classrooms}
              activeClassroomId={activeClassroomId}
              onSelectClassroom={handleSelectClassroom}
              students={activeStudents}
              activeStudent={activeStudent}
              onNextStudent={handleNextStudent}
              onRandomStudent={handleRandomStudent}
              onOpenRosterModal={() => setIsRosterModalOpen(true)}
            />

            {showMachinePicker ? (
              <div className="max-w-xl mx-auto p-6 mt-4 bg-gradient-to-b from-gray-900 to-black border-2 border-amber-500 rounded-3xl text-center shadow-2xl animate-fadeIn">
                <h2 className="text-2xl font-black text-amber-300 mb-2">
                  Elige la Máquina del Casino
                </h2>
                <p className="text-xs text-gray-300 mb-6">
                  Actividad seleccionada: <strong className="text-white">{currentActivity.title}</strong>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      sounds.playChips();
                      setActiveGameMachine('slots');
                      setShowMachinePicker(false);
                    }}
                    className="p-4 rounded-2xl bg-red-950/60 border-2 border-red-500/60 hover:border-red-400 text-center transition hover:scale-105 cursor-pointer"
                  >
                    <div className="text-3xl mb-1">🎰</div>
                    <h4 className="text-sm font-bold text-white">Lucky Slots</h4>
                    <p className="text-[10px] text-gray-400">Rodillos y Jackpots</p>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playChips();
                      setActiveGameMachine('roulette');
                      setShowMachinePicker(false);
                    }}
                    className="p-4 rounded-2xl bg-blue-950/60 border-2 border-blue-500/60 hover:border-blue-400 text-center transition hover:scale-105 cursor-pointer"
                  >
                    <div className="text-3xl mb-1">🎡</div>
                    <h4 className="text-sm font-bold text-white">Ruleta</h4>
                    <p className="text-[10px] text-gray-400">Ruleta de la Fortuna</p>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playChips();
                      setActiveGameMachine('blackjack');
                      setShowMachinePicker(false);
                    }}
                    className="p-4 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/60 hover:border-emerald-400 text-center transition hover:scale-105 cursor-pointer"
                  >
                    <div className="text-3xl mb-1">🃏</div>
                    <h4 className="text-sm font-bold text-white">21 Blackjack</h4>
                    <p className="text-[10px] text-gray-400">Cartas y Crupier</p>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {activeGameMachine === 'slots' && (
                  <SlotsGame
                    activity={currentActivity}
                    chips={chips}
                    onUpdateChips={handleUpdateChips}
                    onFinishGame={handleFinishGame}
                    onBackToLobby={() => setCurrentView('lobby')}
                    activeStudent={activeStudent}
                    onRecordStudentScore={handleRecordStudentScore}
                    onAdvanceStudentTurn={handleNextStudent}
                  />
                )}

                {activeGameMachine === 'roulette' && (
                  <RouletteGame
                    activity={currentActivity}
                    chips={chips}
                    onUpdateChips={handleUpdateChips}
                    onFinishGame={handleFinishGame}
                    onBackToLobby={() => setCurrentView('lobby')}
                    activeStudent={activeStudent}
                    onRecordStudentScore={handleRecordStudentScore}
                    onAdvanceStudentTurn={handleNextStudent}
                  />
                )}

                {activeGameMachine === 'blackjack' && (
                  <BlackjackGame
                    activity={currentActivity}
                    chips={chips}
                    onUpdateChips={handleUpdateChips}
                    onFinishGame={handleFinishGame}
                    onBackToLobby={() => setCurrentView('lobby')}
                    activeStudent={activeStudent}
                    onRecordStudentScore={handleRecordStudentScore}
                    onAdvanceStudentTurn={handleNextStudent}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        groqApiKey={groqApiKey}
        onSaveGroqKey={handleSaveGroqKey}
        volume={volume}
        onChangeVolume={handleChangeVolume}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentPin={currentActivity?.pin}
      />

      {/* Classroom & Student Roster Modal */}
      <ClassroomRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        classrooms={classrooms}
        activeClassroomId={activeClassroomId}
        onSelectClassroom={handleSelectClassroom}
        onCreateClassroom={handleCreateClassroom}
        onDeleteClassroom={handleDeleteClassroom}
        onUpdateStudents={handleUpdateClassroomStudents}
        activeStudentIndex={activeStudentIndex}
        onSelectActiveStudent={(idx) => setActiveStudentIndex(idx)}
        onRandomStudent={handleRandomStudent}
      />
    </div>
  );
}
