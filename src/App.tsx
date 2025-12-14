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
import { RewardButton } from './components/RewardButton';
import { loadFromSupabase, getCurrentLevel } from './lib/progression';
import { soundManager } from './lib/sound';
import { initializeFirebase } from './lib/firebase';

type Screen = 'simple' | 'menu' | 'game' | 'daily' | 'challenge' | 'duel' | 'worldmap' | 'levelselect' | 'upload';

function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'duel') {
      return 'duel';
    }
    if (mode === 'upload') {
      return 'upload';
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
    setScreen('simple');
  };


  // removed custom photo feature

  if (isLoadingProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-bold">Sincronizando progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
            setScreen('simple');
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
      {screen === 'game' && <RewardButton currentLevel={selectedLevel} />}
    </>
  );
}

export default App;
