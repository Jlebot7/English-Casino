import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentLobby from './components/StudentLobby';
import TeacherPortal from './components/TeacherPortal';
import LeaderboardModal from './components/LeaderboardModal';
import SettingsModal from './components/SettingsModal';
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

export default function App() {
  // App views: 'lobby' | 'teacher' | 'game'
  const [currentView, setCurrentView] = useState('lobby');

  // Player state
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

  // Load activities from Firebase or LocalStorage and merge with default ones
  const loadAllActivities = async () => {
    try {
      const customList = await getAllActivities();
      // Merge unique
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
      alert(`Room PIN "${pin}" was not found. Please double check the code!`);
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
      // Activity allows student to pick machine
      setShowMachinePicker(true);
      setCurrentView('game');
    }
  };

  // Game complete handler
  const handleFinishGame = async ({ gameId, correctAnswers, totalQuestions, finalChips }) => {
    try {
      await submitScore({
        pin: currentActivity?.pin || 'CASINO',
        gameId,
        playerNick,
        chips: finalChips,
        correctAnswers,
        totalQuestions,
        avatar: playerAvatar
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
          />
        )}

        {currentView === 'game' && currentActivity && (
          <div className="w-full">
            {showMachinePicker ? (
              <div className="max-w-xl mx-auto p-6 mt-8 bg-gradient-to-b from-gray-900 to-black border-2 border-amber-500 rounded-3xl text-center shadow-2xl animate-fadeIn">
                <h2 className="text-2xl font-black text-amber-300 mb-2">
                  Choose Your Casino Machine
                </h2>
                <p className="text-xs text-gray-300 mb-6">
                  Playing deck: <strong className="text-white">{currentActivity.title}</strong>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      sounds.playChips();
                      setActiveGameMachine('slots');
                      setShowMachinePicker(false);
                    }}
                    className="p-4 rounded-2xl bg-red-950/60 border-2 border-red-500/60 hover:border-red-400 text-center transition hover:scale-105"
                  >
                    <div className="text-3xl mb-1">🎰</div>
                    <h4 className="text-sm font-bold text-white">Lucky Slots</h4>
                    <p className="text-[10px] text-gray-400">Reels & Jackpots</p>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playChips();
                      setActiveGameMachine('roulette');
                      setShowMachinePicker(false);
                    }}
                    className="p-4 rounded-2xl bg-blue-950/60 border-2 border-blue-500/60 hover:border-blue-400 text-center transition hover:scale-105"
                  >
                    <div className="text-3xl mb-1">🎡</div>
                    <h4 className="text-sm font-bold text-white">Roulette</h4>
                    <p className="text-[10px] text-gray-400">Wheel of Fortune</p>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playChips();
                      setActiveGameMachine('blackjack');
                      setShowMachinePicker(false);
                    }}
                    className="p-4 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/60 hover:border-emerald-400 text-center transition hover:scale-105"
                  >
                    <div className="text-3xl mb-1">🃏</div>
                    <h4 className="text-sm font-bold text-white">21 Blackjack</h4>
                    <p className="text-[10px] text-gray-400">Card Strategy</p>
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
                  />
                )}

                {activeGameMachine === 'roulette' && (
                  <RouletteGame
                    activity={currentActivity}
                    chips={chips}
                    onUpdateChips={handleUpdateChips}
                    onFinishGame={handleFinishGame}
                    onBackToLobby={() => setCurrentView('lobby')}
                  />
                )}

                {activeGameMachine === 'blackjack' && (
                  <BlackjackGame
                    activity={currentActivity}
                    chips={chips}
                    onUpdateChips={handleUpdateChips}
                    onFinishGame={handleFinishGame}
                    onBackToLobby={() => setCurrentView('lobby')}
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
    </div>
  );
}
