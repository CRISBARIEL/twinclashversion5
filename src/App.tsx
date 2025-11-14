import { useState, useRef, useEffect } from 'react';
import { InitialScreen } from './components/InitialScreen';
import { GameShell } from './components/GameShell';
import { GameCore } from './components/GameCore';
import { DuelScene } from './components/DuelScene';
import { ChallengeScene } from './components/ChallengeScene';
import { WorldMap } from './components/WorldMap';
import { LevelSelector } from './components/LevelSelector';
import { loadFromSupabase } from './lib/progression';
import { soundManager } from './lib/sound';

type Screen = 'menu' | 'game' | 'daily' | 'challenge' | 'duel' | 'worldmap' | 'levelselect';

function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'duel') {
      return 'duel';
    }
    return 'menu';
  });
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedWorld, setSelectedWorld] = useState(1);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      await loadFromSupabase();
      setIsLoadingProgress(false);
    };

    initializeApp();
  }, []);
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-bold">Sincronizando progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {screen === 'menu' && (
        <InitialScreen
          onStartGame={() => {
            setSelectedLevel(1);
            setScreen('game');
          }}
          onStartDailyChallenge={handleStartDailyChallenge}
          onStartDuel={handleStartDuel}
        />
      )}
      {screen === 'worldmap' && (
        <WorldMap
          currentWorld={1}
          currentLevel={1}
          worldsCompleted={0}
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
          currentLevel={1}
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
        <DuelScene onBackToMenu={handleBackToMenu} />
      )}
    </>
  );
}

export default App;
