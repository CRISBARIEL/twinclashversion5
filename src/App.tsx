import { useState, useRef, useEffect } from 'react';
import { SimpleInitialScreen } from './components/SimpleInitialScreen';
import { InitialScreen } from './components/InitialScreen';
import { GameShell } from './components/GameShell';
import { GameCore } from './components/GameCore';
import { DuelMenu } from './components/duel/DuelMenu';
import { ChallengeScene } from './components/ChallengeScene';
import { WorldMap } from './components/WorldMap';
import { LevelSelector } from './components/LevelSelector';
import { AudioUploader } from './components/AudioUploader';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AdminPush } from './components/AdminPush';
import { NotificationButton } from './components/NotificationButton';
import { loadFromSupabase, getCurrentLevel } from './lib/progression';
import { soundManager } from './lib/sound';
import { initializeFirebase } from './lib/firebase';
import { AlertCircle } from 'lucide-react';
import { LanguageContext, useLanguageState } from './hooks/useLanguage';

type Screen = 'simple' | 'menu' | 'game' | 'daily' | 'challenge' | 'duel' | 'worldmap' | 'levelselect' | 'upload' | 'privacy' | 'adminpush';

function App() {
  const languageState = useLanguageState();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_') || supabaseKey.includes('your_')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertCircle size={48} className="text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-800 text-center mb-4">
            Configuración Incompleta
          </h1>
          <div className="space-y-4 text-gray-700">
            <p className="text-center">
              Faltan las variables de entorno de Supabase. Por favor configura:
            </p>
            <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
              <div className="mb-2">
                <span className="text-red-600 font-bold">VITE_SUPABASE_URL</span>
                <div className="text-xs text-gray-600 mt-1">
                  {supabaseUrl ? '✓ Configurada' : '✗ Faltante'}
                </div>
              </div>
              <div>
                <span className="text-red-600 font-bold">VITE_SUPABASE_ANON_KEY</span>
                <div className="text-xs text-gray-600 mt-1">
                  {supabaseKey ? '✓ Configurada' : '✗ Faltante'}
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm">
              <p className="font-semibold text-blue-800 mb-2">Para desarrollo local:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Crea un archivo <code className="bg-blue-100 px-1 rounded">.env</code></li>
                <li>Agrega tus credenciales de Supabase</li>
                <li>Reinicia el servidor de desarrollo</li>
              </ol>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 text-sm">
              <p className="font-semibold text-green-800 mb-2">Para producción:</p>
              <ol className="list-decimal list-inside space-y-1 text-green-700">
                <li>Configura las variables en tu plataforma de hosting</li>
                <li>Verifica que los nombres sean exactos</li>
                <li>Realiza un nuevo deploy</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const [screen, setScreen] = useState<Screen>(() => {
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');

    if (pathname === '/terms') {
      return 'privacy';
    }
    if (pathname === '/admin/push') {
      return 'adminpush';
    }
    if (mode === 'duel') {
      return 'duel';
    }
    if (mode === 'upload') {
      return 'upload';
    }
    if (mode === 'privacy') {
      return 'privacy';
    }
    return 'simple';
  });
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedWorld, setSelectedWorld] = useState(1);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [clientId] = useState(() => {
    let id = localStorage.getItem('clientId');
    if (!id) {
      id = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('clientId', id);
    }
    return id;
  });

  useEffect(() => {
    const initializeApp = async () => {
      await loadFromSupabase();
      const currentLevel = getCurrentLevel();
      console.log('[App] Loaded current level from storage:', currentLevel);
      setSelectedLevel(currentLevel);
      setIsLoadingProgress(false);

      initializeFirebase();
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if ((screen === 'simple' || screen === 'menu') && !isLoadingProgress) {
      soundManager.playStartMusic();
    }
  }, [screen, isLoadingProgress]);
  // removed custom photo feature

  const handleStartGame = (level: number) => {
    setSelectedLevel(level);
    setScreen('game');
  };

  const handleStartDailyChallenge = () => {
    setScreen('challenge');
  };

  const handleStartDuel = () => {
    setScreen('duel');
  };

  const handleBackToMenu = () => {
    soundManager.stopLevelMusic();
    soundManager.playStartMusic();
    setScreen('menu');
  };


  // removed custom photo feature

  if (isLoadingProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-xl font-bold">Sincronizando progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={languageState}>
      <NotificationButton />
      {screen === 'simple' && (
        <SimpleInitialScreen
          onStartLevel1={() => {
            setSelectedLevel(1);
            setScreen('game');
          }}
          onContinueLevel={(level) => {
            setSelectedLevel(level);
            setScreen('game');
          }}
          onStartDuel={handleStartDuel}
        />
      )}
      {screen === 'menu' && (
        <InitialScreen
          onStartGame={() => {
            setSelectedLevel(1);
            setScreen('game');
          }}
          onContinueGame={(level) => {
            setSelectedLevel(level);
            setScreen('game');
          }}
          onShowWorldMap={() => setScreen('worldmap')}
          onStartDailyChallenge={handleStartDailyChallenge}
          onStartDuel={handleStartDuel}
        />
      )}
      {screen === 'worldmap' && (
        <WorldMap
          currentWorld={Math.ceil(selectedLevel / 5)}
          currentLevel={selectedLevel}
          worldsCompleted={Math.max(0, Math.ceil(selectedLevel / 5) - 1)}
          onSelectWorld={(world) => {
            setSelectedWorld(world);
            setScreen('levelselect');
          }}
          onBackToMenu={() => {
            soundManager.stopLevelMusic();
            soundManager.playStartMusic();
            setScreen('menu');
          }}
        />
      )}
      {screen === 'levelselect' && (
        <LevelSelector
          world={selectedWorld}
          currentLevel={selectedLevel}
          onSelectLevel={(levelId) => {
            setSelectedLevel(levelId);
            setScreen('game');
          }}
          onBack={() => setScreen('worldmap')}
        />
      )}
      {screen === 'game' && (
        <GameShell
          key={selectedLevel}
          initialLevel={selectedLevel}
          onBackToMenu={handleBackToMenu}
          onShowWorldMap={() => setScreen('worldmap')}
        />
      )}
      {screen === 'challenge' && (
        <ChallengeScene onBackToMenu={handleBackToMenu} />
      )}
      {screen === 'duel' && (
        <DuelMenu onBack={handleBackToMenu} clientId={clientId} />
      )}
      {screen === 'upload' && (
        <AudioUploader />
      )}
      {screen === 'privacy' && (
        <PrivacyPolicy onBack={() => setScreen('simple')} />
      )}
      {screen === 'adminpush' && (
        <AdminPush onBack={() => setScreen('simple')} />
      )}
    </LanguageContext.Provider>
  );
}

export default App;
