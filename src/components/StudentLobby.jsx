import React, { useState } from 'react';
import { Sparkles, Trophy, Play, Users, ArrowRight, Dices, Gamepad2, Coins, UserCheck } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const AVATARS = ['🎩', '👑', '🍀', '🦊', '🤖', '💎', '🎲', '🦁'];

export default function StudentLobby({
  activities,
  playerNick,
  setPlayerNick,
  playerAvatar,
  setPlayerAvatar,
  chips,
  onJoinPin,
  onSelectActivity,
  students,
  onOpenRosterModal
}) {
  const [pinInput, setPinInput] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleJoinByPin = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setJoinError('Por favor ingresa un PIN de 6 dígitos.');
      sounds.playWrong();
      return;
    }

    sounds.playChips();
    onJoinPin(pinInput.trim().toUpperCase());
  };

  return (
    <div className="max-w-5xl mx-auto p-4 animate-fadeIn space-y-8">
      {/* Welcome Casino Hero Banner */}
      <div className="text-center py-6 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          The Educational English Casino
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-100 tracking-tight neon-text-gold my-2">
          LUCKY ENGLISH CASINO
        </h1>

        <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
          ¡Aprende inglés jugando en el casino! Gira los rodillos, desafía la ruleta y dobla la apuesta en el blackjack respondiendo preguntas pedagógicas.
        </p>

        {/* Classroom Mode Notice for Teachers */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={onOpenRosterModal}
            className={`px-4 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-2 shadow-lg ${
              students.length > 0
                ? 'bg-gradient-to-r from-purple-900/80 to-indigo-950 border-purple-500 text-purple-200 hover:scale-105'
                : 'bg-black/60 border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            {students.length > 0
              ? `👥 Modo Aula Activo: ${students.length} estudiantes cargados (Editar)`
              : '👨‍🏫 ¿Juegas en clase? Haz clic aquí para ingresar los nombres de tus alumnos'}
          </button>
        </div>
      </div>

      {/* Student Profile & Quick PIN Entry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Profile / Avatar Picker Card */}
        <div className="md:col-span-5 bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Perfil de Jugador
            </h3>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 mb-1">
                Tu Apodo o Nombre
              </label>
              <input
                type="text"
                value={playerNick}
                onChange={(e) => setPlayerNick(e.target.value)}
                placeholder="ej. CarlosG, LuckyDan..."
                maxLength={18}
                className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">
                Elige tu Avatar de la Suerte
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      sounds.playTick();
                      setPlayerAvatar(av);
                    }}
                    className={`h-12 rounded-xl text-2xl flex items-center justify-center border-2 transition transform active:scale-95 cursor-pointer ${
                      playerAvatar === av
                        ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/30 scale-105'
                        : 'bg-black/40 border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">Balance Inicial:</span>
            <span className="text-base font-black text-amber-400 flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              {chips.toLocaleString()} Fichas
            </span>
          </div>
        </div>

        {/* Enter Room PIN Card */}
        <div className="md:col-span-7 bg-gradient-to-br from-amber-950/40 via-gray-900 to-black border-2 border-amber-500/60 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-lg bg-amber-500 text-black font-black text-sm">
                PIN
              </span>
              <h3 className="text-lg font-bold text-white">Unirse a Partida de Clase</h3>
            </div>
            <p className="text-xs text-gray-300 mb-6">
              ¿Tu docente te dio un código de sala? Ingrésalo a continuación para ingresar al desafío:
            </p>

            <form onSubmit={handleJoinByPin} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  placeholder="INGRESA EL PIN (ej. VERB77)"
                  maxLength={8}
                  className="w-full bg-black/80 border-2 border-amber-500/60 focus:border-amber-400 rounded-xl px-4 py-3 text-lg md:text-xl text-center text-amber-300 font-black tracking-widest uppercase focus:outline-none shadow-inner"
                />
                {joinError && (
                  <p className="text-xs text-red-400 mt-1 font-medium">{joinError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-gray-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 hover:scale-[1.01] active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Entrar a la Máquina <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 text-[11px] text-gray-400 text-center">
            Acceso rápido sin contraseñas ni registros obligatorios.
          </div>
        </div>
      </div>

      {/* Featured Casino Machines / Quick Solo Play */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Dices className="w-5 h-5 text-amber-400" />
              Salón de Casino: Elige tu Máquina
            </h3>
            <p className="text-xs text-gray-400">
              Selecciona cualquier reto del salón o creado por tu docente
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activities.map((act) => {
            const isSlots = act.gameType === 'slots' || act.title.includes('Slots');
            const isRoulette = act.gameType === 'roulette' || act.title.includes('Roulette');
            const isBlackjack = act.gameType === 'blackjack' || act.title.includes('Blackjack');

            let bannerGradient = 'from-red-950 to-gray-900 border-red-500/40';
            let iconText = '🎰 TRAGAMONEDAS';
            if (isRoulette) {
              bannerGradient = 'from-blue-950 to-gray-900 border-blue-500/40';
              iconText = '🎡 RULETA';
            } else if (isBlackjack) {
              bannerGradient = 'from-emerald-950 to-gray-900 border-emerald-500/40';
              iconText = '🃏 BLACKJACK';
            }

            return (
              <div
                key={act.id || act.pin}
                className={`bg-gradient-to-b ${bannerGradient} border-2 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-transform`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-amber-300 border border-amber-500/30">
                      {iconText}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">
                      PIN: <span className="text-amber-300 font-mono">{act.pin}</span>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2 leading-snug">
                    {act.title}
                  </h4>

                  <p className="text-xs text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-3 pt-2 border-t border-gray-800">
                    <span>Nivel: <strong className="text-amber-400">{act.level || 'B1'}</strong></span>
                    <span>{act.questions?.length || 0} Preguntas</span>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playChips();
                      onSelectActivity(act);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Jugar Máquina
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
