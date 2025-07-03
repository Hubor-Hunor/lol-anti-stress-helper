// src/windows/InGame.tsx
import { useEffect, useState } from 'react'; // 'React' has been removed from this import
import { PreGame } from '../components/PreGame';
import { DeathReflection } from '../components/DeathReflection';
import { TiltReminder } from '../components/TiltReminder';
import { obtainWindow } from '../utils';

type GamePhase = 'pre-game' | 'in-game' | 'post-game';

export function InGame() {
  const [phase, setPhase] = useState<GamePhase>('pre-game');
  const [gameData, setGameData] = useState({ winCondition: '', personalGoal: '' });
  const [showDeathReflection, setShowDeathReflection] = useState(false);
  const [showTiltReminder, setShowTiltReminder] = useState(false);

  useEffect(() => {
    const handleShowUI = (event: any) => {
      if (event.detail.type === 'reflection') {
        setShowDeathReflection(true);
      } else if (event.detail.type === 'tilt') {
        setShowTiltReminder(true);
      }
    };
    window.addEventListener('show-death-ui', handleShowUI);

    return () => {
      window.removeEventListener('show-death-ui', handleShowUI);
    };
  }, []);

  const handleGameStart = (winCondition: string, personalGoal: string) => {
    console.log("Game starting with:", { winCondition, personalGoal });
    setGameData({ winCondition, personalGoal });
    setPhase('in-game');
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

  return (
    <main>
      <header className="app-header">
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
            <p className="placeholder-text">
              Waiting for game events...
            </p>
          </div>
        )}
      </div>

      {showDeathReflection && <DeathReflection onReasonSelected={handleReasonSelected} />}
      {showTiltReminder && <TiltReminder onClose={() => setShowTiltReminder(false)} />}
    </main>
  );
}