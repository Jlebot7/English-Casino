import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentLobby from './components/StudentLobby';
import TeacherPortal from './components/TeacherPortal';
import LeaderboardModal from './components/LeaderboardModal';
import SettingsModal from './components/SettingsModal';
import ClassroomRosterModal from './components/ClassroomRosterModal';
import ClassroomTurnBar from './components/ClassroomTurnBar';
import StudentSpinnerModal from './components/StudentSpinnerModal';
import SlotsGame from './components/games/SlotsGame';
import RouletteGame from './components/games/RouletteGame';
import BlackjackGame from './components/games/BlackjackGame';

import { DEFAULT_ACTIVITIES } from './data/defaultActivities';
import { 
  getAllActivities, 
  submitScore 
} from './services/firebaseService';
import { sounds } from './utils/soundEffects';

const STORAGE_CHIPS_KEY = 'lucky_english_chips';
const STORAGE_GROQ_KEY = 'lucky_english_groq_key';
const STORAGE_CLASSROOMS_KEY = 'lucky_english_classrooms';
const STORAGE_ACTIVE_CLASSROOM_ID_KEY = 'lucky_english_active_classroom_id';

const DEFAULT_INITIAL_CLASSROOMS = [
  {
    id: 'class_10a',
    name: 'Salón 10-A (Mañana)',
    students: [
      { id: 'std_1', name: 'Carlos Gómez', avatar: '🎩', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_2', name: 'Sofía Martínez', avatar: '👑', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_3', name: 'Mateo Silva', avatar: '🍀', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_4', name: 'Valentina Ríos', avatar: '💎', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_5', name: 'Lucas Herrera', avatar: '🚀', chips: 1000, correctAnswers: 0, totalQuestions: 0 }
    ]
  },
  {
    id: 'class_10b',
    name: 'Salón 10-B (Tarde)',
    students: [
      { id: 'std_6', name: 'Camila Torres', avatar: '🌸', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_7', name: 'Nicolás Castro', avatar: '⚡', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_8', name: 'Isabella Moreno', avatar: '⭐', chips: 1000, correctAnswers: 0, totalQuestions: 0 },
      { id: 'std_9', name: 'Daniel Pardo', avatar: '🦁', chips: 1000, correctAnswers: 0, totalQuestions: 0 }
    ]
  }
];

export default function App() {
  // App views: 'lobby' | 'teacher' | 'game'
  const [currentView, setCurrentView] = useState('lobby');

  // Player chips (pool / table)
  const [chips, setChips] = useState(() => {
    const saved = localStorage.getItem(STORAGE_CHIPS_KEY);
    return saved ? parseInt(saved, 10) : 1000;
  });

  // Multiple Classrooms (Salones)
  const [classrooms, setClassrooms] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CLASSROOMS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_INITIAL_CLASSROOMS;
    } catch {
      return DEFAULT_INITIAL_CLASSROOMS;
    }
  });

  const [activeClassroomId, setActiveClassroomId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_ACTIVE_CLASSROOM_ID_KEY);
    return saved || 'class_10a';
  });

  // Active classroom & students
  const activeClassroom = classrooms.find(c => c.id === activeClassroomId) || classrooms[0] || { id: 'default', name: 'Salón', students: [] };
  const students = activeClassroom.students || [];

  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const activeStudent = students.length > 0 ? (students[activeStudentIndex] || students[0]) : null;

  // Modals
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isSpinnerOpen, setIsSpinnerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Settings & Configuration
  const [groqApiKey, setGroqApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_GROQ_KEY) || '';
  });
  const [volume, setVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);

  // Activities
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [currentActivity, setCurrentActivity] = useState(DEFAULT_ACTIVITIES[0]);
  const [activeGameMachine, setActiveGameMachine] = useState('slots'); // 'slots' | 'roulette' | 'blackjack'

  // Persist State
  useEffect(() => {
    localStorage.setItem(STORAGE_CHIPS_KEY, chips.toString());
  }, [chips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CLASSROOMS_KEY, JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ACTIVE_CLASSROOM_ID_KEY, activeClassroomId);
  }, [activeClassroomId]);

  // Turn Navigation
  const handleNextStudent = () => {
    if (students.length === 0) return;
    setActiveStudentIndex(prev => (prev + 1) % students.length);
  };

  const handleRandomStudent = () => {
    if (students.length === 0) return;
    const randIdx = Math.floor(Math.random() * students.length);
    setActiveStudentIndex(randIdx);
  };

  // Classroom Management Handlers
  const handleSelectClassroom = (id) => {
    setActiveClassroomId(id);
    setActiveStudentIndex(0);
  };

  const handleCreateClassroom = (name) => {
    const newClass = {
      id: `class_${Date.now()}`,
      name,
      students: []
    };
    setClassrooms(prev => [...prev, newClass]);
    setActiveClassroomId(newClass.id);
    setActiveStudentIndex(0);
  };

  const handleDeleteClassroom = (id) => {
    if (classrooms.length <= 1) {
      alert('Debe quedar al menos un salón de clases.');
      return;
    }
    const updated = classrooms.filter(c => c.id !== id);
    setClassrooms(updated);
    if (activeClassroomId === id) {
      setActiveClassroomId(updated[0].id);
      setActiveStudentIndex(0);
    }
  };

  // Update students of the active classroom
  const handleUpdateStudents = (newStudentsList) => {
    setClassrooms(prev => prev.map(c => {
      if (c.id === activeClassroomId) {
        return { ...c, students: newStudentsList };
      }
      return c;
    }));

    if (activeStudentIndex >= newStudentsList.length) {
      setActiveStudentIndex(Math.max(0, newStudentsList.length - 1));
    }
  };

  // Record individual score for student who took the turn
  const handleRecordStudentScore = (studentId, chipDelta, isCorrect, countAsQuestion) => {
    setClassrooms(prev => prev.map(c => {
      if (c.id === activeClassroomId) {
        return {
          ...c,
          students: c.students.map(s => {
            if (s.id === studentId) {
              return {
                ...s,
                chips: Math.max(0, (s.chips || 1000) + chipDelta),
                correctAnswers: (s.correctAnswers || 0) + (isCorrect ? 1 : 0),
                totalQuestions: (s.totalQuestions || 0) + (countAsQuestion ? 1 : 0)
              };
            }
            return s;
          })
        };
      }
      return c;
    }));
  };

  // Load activities from Firebase or LocalStorage
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
      if (!currentActivity && merged.length > 0) {
        setCurrentActivity(merged[0]);
      }
    } catch (err) {
      console.warn('Could not load custom activities:', err);
    }
  };

  useEffect(() => {
    loadAllActivities();
  }, []);

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

  // Launch a game machine
  const handleLaunchGame = (machineType) => {
    setActiveGameMachine(machineType);
    setCurrentView('game');
  };

  // When a student is chosen by the roulette spinner
  const handleStudentSelectedFromSpinner = (chosenStudent) => {
    const idx = students.findIndex(s => s.id === chosenStudent.id);
    if (idx !== -1) {
      setActiveStudentIndex(idx);
    }
  };

  // Game complete handler
  const handleFinishGame = async ({ gameId, correctAnswers, totalQuestions, finalChips }) => {
    try {
      const scoringPlayer = activeStudent ? activeStudent.name : 'Estudiante';
      const scoringAvatar = activeStudent ? activeStudent.avatar : '🎩';

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
        studentsCount={students.length}
        onOpenRosterModal={() => setIsRosterModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-12">
        {currentView === 'lobby' && (
          <StudentLobby
            activities={activities}
            currentActivity={currentActivity}
            onSelectActivity={(act) => setCurrentActivity(act)}
            onLaunchGame={handleLaunchGame}
            classrooms={classrooms}
            activeClassroomId={activeClassroomId}
            onSelectClassroom={handleSelectClassroom}
            students={students}
            activeStudent={activeStudent}
            onOpenSpinner={() => setIsSpinnerOpen(true)}
            onOpenRosterModal={() => setIsRosterModalOpen(true)}
            onOpenTeacherPortal={() => setCurrentView('teacher')}
          />
        )}

        {currentView === 'teacher' && (
          <TeacherPortal
            groqApiKey={groqApiKey}
            activities={activities}
            onActivitySaved={(saved) => {
              loadAllActivities();
              if (saved) setCurrentActivity(saved);
            }}
            onPlayActivity={(act) => {
              setCurrentActivity(act);
              if (act.gameType && ['slots', 'roulette', 'blackjack'].includes(act.gameType)) {
                setActiveGameMachine(act.gameType);
              }
              setCurrentView('game');
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            classrooms={classrooms}
            activeClassroomId={activeClassroomId}
            onSelectClassroom={handleSelectClassroom}
            students={students}
            onOpenRosterModal={() => setIsRosterModalOpen(true)}
          />
        )}

        {currentView === 'game' && currentActivity && (
          <div className="w-full">
            {/* Classroom Turn Bar (Shown above games) */}
            <ClassroomTurnBar
              students={students}
              activeStudent={activeStudent}
              onNextStudent={handleNextStudent}
              onRandomStudent={handleRandomStudent}
              onOpenSpinner={() => setIsSpinnerOpen(true)}
              onOpenRosterModal={() => setIsRosterModalOpen(true)}
            />

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
          </div>
        )}
      </main>

      {/* Classroom Roster & Salones Modal */}
      <ClassroomRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        classrooms={classrooms}
        activeClassroomId={activeClassroomId}
        onSelectClassroom={handleSelectClassroom}
        onCreateClassroom={handleCreateClassroom}
        onDeleteClassroom={handleDeleteClassroom}
        students={students}
        onUpdateStudents={handleUpdateStudents}
        activeStudentIndex={activeStudentIndex}
        onSelectActiveStudent={(idx) => setActiveStudentIndex(idx)}
        onOpenSpinner={() => setIsSpinnerOpen(true)}
      />

      {/* Student Luck Wheel / Spinner Modal */}
      <StudentSpinnerModal
        isOpen={isSpinnerOpen}
        onClose={() => setIsSpinnerOpen(false)}
        students={students}
        activeClassroomName={activeClassroom?.name}
        onStudentSelected={handleStudentSelectedFromSpinner}
        onOpenRosterModal={() => setIsRosterModalOpen(true)}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        students={students}
        pin={currentActivity?.pin}
      />

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
    </div>
  );
}
