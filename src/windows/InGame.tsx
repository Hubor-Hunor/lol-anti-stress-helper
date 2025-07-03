// src/windows/InGame.tsx
import { useEffect, useState } from 'react';
import { PreGame } from '../components/PreGame';
import { PostGame, PostGameProps } from '../components/PostGame';
import { DeathReflection } from '../components/DeathReflection';
import { TiltReminder } from '../components/TiltReminder';
import { obtainWindow } from '../utils';

type GamePhase = 'pre-game' | 'in-game' | 'post-game';

export function InGame() {
  const [phase, setPhase] = useState<GamePhase>('pre-game');
  const [gameData, setGameData] = useState({ winCondition: '', personalGoal: '' });
  const [postGameData, setPostGameData] = useState<Omit<PostGameProps, 'onNewGame'> | null>(null);
  const [showDeathReflection, setShowDeathReflection] = useState(false);
  const [showTiltReminder, setShowTiltReminder] = useState(false);
  const [showDebug, setShowDebug] = useState(true);

  useEffect(() => {
    const handleShowDeathUI = (event: any) => {
      if (event.detail.type === 'reflection') {
        setShowDeathReflection(true);
      } else if (event.detail.type === 'tilt') {
        setShowTiltReminder(true);
      }
    };

    const handleShowPostGame = (event: any) => {
      setPostGameData(event.detail);
      setPhase('post-game');
    };

    window.addEventListener('show-death-ui', handleShowDeathUI);
    window.addEventListener('show-post-game', handleShowPostGame);

    return () => {
      window.removeEventListener('show-death-ui', handleShowDeathUI);
      window.removeEventListener('show-post-game', handleShowPostGame);
    };
  }, []);

  const handleGameStart = async (winCondition: string, personalGoal: string) => {
    setGameData({ winCondition, personalGoal });
    setPhase('in-game');
    try {
      const backgroundWindow = await obtainWindow('background');
      backgroundWindow.dispatchEvent(
        new CustomEvent('set-game-data', { detail: { personalGoal } })
      );
    } catch(e) {
      console.error("Could not send game data to background window", e);
    }
  };

  const handleReasonSelected = async (reason: string) => {
    setShowDeathReflection(false);
    try {
      const backgroundWindow = await obtainWindow('background');
      backgroundWindow.dispatchEvent(
        new CustomEvent('submit-death-reason', { detail: { reason } })
      );
    } catch (e) {
      console.error("Could not send reason to background window", e);
    }
  };
  
  const handleManualEnd = async (result: 'Victory' | 'Defeat') => {
    try {
      const backgroundWindow = await obtainWindow('background');
      backgroundWindow.dispatchEvent(
        new CustomEvent('manual-end-game', { detail: { result } })
      );
    } catch(e) {
      console.error("Could not send manual end game event to background window", e);
    }
  };

  const handleNewGame = async () => {
    setPhase('pre-game');
    setPostGameData(null);
    try {
      const backgroundWindow = await obtainWindow('background');
      backgroundWindow.dispatchEvent(new CustomEvent('reset-game-state'));
    } catch(e) {
      console.error("Could not send reset event to background window", e);
    }
  };

  return (
    <main>
      <header className="app-header" onDoubleClick={() => setShowDebug(!showDebug)}>
        <h1>The Mental Edge</h1>
      </header>
      <div className="content">
        {phase === 'pre-game' && <PreGame onGameStart={handleGameStart} />}
        
        {phase === 'in-game' && (
          <div className="phase-container">
            <h2>Game in Progress</h2>
            <p><strong>Your Job:</strong> {gameData.winCondition}</p>
            <p><strong>Your Goal:</strong> {gameData.personalGoal}</p>
            <hr />
            <p className="placeholder-text">Waiting for game events...</p>
          </div>
        )}

        {phase === 'post-game' && postGameData && (
          <PostGame {...postGameData} onNewGame={handleNewGame} />
        )}
      </div>

      {phase === 'in-game' && true && (
        <div className="debug-controls">
          <p>Debug Controls (double-click header to hide)</p>
          <button onClick={() => handleManualEnd('Victory')}>Trigger Victory</button>
          <button onClick={() => handleManualEnd('Defeat')}>Trigger Defeat</button>
        </div>
      )}

      {showDeathReflection && <DeathReflection onReasonSelected={handleReasonSelected} />}
      {showTiltReminder && <TiltReminder onClose={() => setShowTiltReminder(false)} />}
    </main>
  );
}