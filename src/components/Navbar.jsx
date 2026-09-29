import React from 'react';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  Settings, 
  Bot, 
  Home, 
  Coins,
  Users,
  Lock,
  LogOut
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Navbar({
  currentView,
  setCurrentView,
  chips = 1000,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenLeaderboard,
  studentsCount,
  onOpenRosterModal,
  currentTeacher,
  onOpenAuthModal,
  onLogoutTeacher
}) {
  return (
    <nav className="w-full bg-gray-950/80 backdrop-blur-md border-b border-amber-500/30 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div 
          onClick={() => {
            sounds.playChips();
            setCurrentView('lobby');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition transform">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-xl">
              🎰
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base md:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-100">
                LUCKY ENGLISH
              </span>
              <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest">
                VEGAS
              </span>
            </div>
            <p className="text-[10px] text-amber-200/60 hidden sm:block tracking-widest font-semibold uppercase">
              Casino Learning Machines
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1.5 bg-black/50 p-1 rounded-2xl border border-gray-800">
          <button
            onClick={() => {
              sounds.playTick();
              setCurrentView('lobby');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentView === 'lobby'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Lobby
          </button>

          <button
            onClick={() => {
              sounds.playTick();
              if (!currentTeacher && onOpenAuthModal) {
                onOpenAuthModal('acceder al Panel Docente');
              } else {
                setCurrentView('teacher');
              }
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentView === 'teacher'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>Panel Docente</span>
            {!currentTeacher && <Lock className="w-3 h-3 text-amber-400/70 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              sounds.playTick();
              if (!currentTeacher && onOpenAuthModal) {
                onOpenAuthModal('gestionar salones y alumnos');
              } else {
                onOpenRosterModal();
              }
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-800/60 transition flex items-center gap-1.5"
            title="Ingresar y gestionar nombres de estudiantes"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Alumnos ({studentsCount})</span>
            {!currentTeacher && <Lock className="w-3 h-3 text-amber-400/70 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              sounds.playTick();
              onOpenLeaderboard();
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-800/60 transition flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Clasificación
          </button>
        </div>

        {/* Right Tools (Teacher Profile, Chips, Mute, Settings) */}
        <div className="flex items-center gap-2">
          {/* Teacher Login / Profile Badge */}
          {currentTeacher ? (
            <div className="flex items-center gap-1.5 bg-purple-950/70 border border-purple-500/50 px-2.5 py-1.5 rounded-xl shadow">
              <span className="text-sm">👨‍🏫</span>
              <span className="text-xs font-bold text-purple-200 hidden sm:inline max-w-[120px] truncate" title={currentTeacher.email}>
                {currentTeacher.name || currentTeacher.email.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={() => {
                  sounds.playTick();
                  if (onLogoutTeacher) onLogoutTeacher();
                }}
                className="ml-1 p-1 hover:bg-purple-900/60 rounded-lg text-purple-300 hover:text-red-300 transition cursor-pointer"
                title="Cerrar sesión de docente"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                sounds.playTick();
                if (onOpenAuthModal) onOpenAuthModal('identificarte como docente registrado');
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-gray-950 font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
              title="Iniciar sesión como docente registrado"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Acceso Docente</span>
              <span className="sm:hidden">Docente</span>
            </button>
          )}

          {/* Chip Counter */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-300 tracking-wide">
              {(chips ?? 0).toLocaleString()}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isMuted
                ? 'bg-red-950/60 border-red-500/50 text-red-400'
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-amber-300'
            }`}
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTick();
              if (!currentTeacher && onOpenAuthModal) {
                onOpenAuthModal('modificar la configuración de API y base de datos');
              } else {
                onOpenSettings();
              }
            }}
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-amber-300 transition cursor-pointer relative"
            title="Ajustes (Groq API, Firebase, TTS)"
          >
            <Settings className="w-4 h-4" />
            {!currentTeacher && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
