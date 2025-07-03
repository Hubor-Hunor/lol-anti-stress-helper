// src/windows/Background.tsx
import { useEffect, useState } from "react";
import { obtainWindow } from "../utils";

const REQUIRED_FEATURES = ['death', 'match_info', 'match_end'];
type DeathReason = 'greed' | 'badAwareness' | 'outplayed' | 'teamMistake';

export function Background() {
  const [localPlayerName] = useState<string | null>(null);
  const [deathTimestamps, setDeathTimestamps] = useState<number[]>([]);
  const [deathReasons, setDeathReasons] = useState<Record<DeathReason, number>>({
    greed: 0, badAwareness: 0, outplayed: 0, teamMistake: 0
  });
  const [personalGoal, setPersonalGoal] = useState<string>('');
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(
    () => Number(localStorage.getItem('consecutiveLosses')) || 0
  );

  useEffect(() => {
    localStorage.setItem('consecutiveLosses', String(consecutiveLosses));
  }, [consecutiveLosses]);

  useEffect(() => {
    console.log("BACKGROUND: Setting up game events...");
    overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, (result) => {
      if (result.success) {
        console.log("BACKGROUND: Successfully set required features.");
        overwolf.games.events.onNewEvents.addListener(handleGameEvent);
        console.log("BACKGROUND: Event listener for onNewEvents ADDED.");
      } else {
        console.error("BACKGROUND: Failed to set required features:", result);
      }
    });

    const handleManualEndGame = (event: any) => {
      console.log("BACKGROUND: Manual end game triggered with result:", event.detail.result);
      handleMatchEnd(event.detail.result);
    };

    const handleReasonSubmit = (event: any) => {
      const reason = event.detail.reason as DeathReason;
      console.log(`Reason submitted: ${reason}`);
      setDeathReasons(prev => ({ ...prev, [reason]: (prev[reason] || 0) + 1 }));
    };

    const handleSetGameData = (event: any) => {
      setPersonalGoal(event.detail.personalGoal);
    };

    const handleReset = () => {
      console.log("BACKGROUND: Resetting game state for new game.");
      setDeathTimestamps([]);
      setDeathReasons({ greed: 0, badAwareness: 0, outplayed: 0, teamMistake: 0 });
      setPersonalGoal('');
    };

    window.addEventListener('submit-death-reason', handleReasonSubmit);
    window.addEventListener('set-game-data', handleSetGameData);
    window.addEventListener('reset-game-state', handleReset);
    window.addEventListener('manual-end-game', handleManualEndGame);

    return () => {
      overwolf.games.events.onNewEvents.removeListener(handleGameEvent);
      window.removeEventListener('submit-death-reason', handleReasonSubmit);
      window.removeEventListener('set-game-data', handleSetGameData);
      window.removeEventListener('reset-game-state', handleReset);
      window.removeEventListener('manual-end-game', handleManualEndGame);
      console.log("BACKGROUND: Event listeners cleaned up.");
    };
  }, []);

  const handleGameEvent = (eventsInfo: overwolf.games.events.NewGameEvents) => {
    console.log("BACKGROUND: Received game event packet:", eventsInfo);
    for (const event of eventsInfo.events) {
      if (event.name === 'death' && event.data) {
        const eventData = JSON.parse(event.data);
        const victimName = eventData.victim_display_name || eventData.victim_name;
        if (localPlayerName && victimName === localPlayerName) {
          handleLocalPlayerDeath();
        }
      } else if (event.name === 'match_end' && event.data) {
        console.log("BACKGROUND: MATCH_END event detected!");
        const eventData = JSON.parse(event.data);
        handleMatchEnd(eventData.match_outcome);
      }
    }
  };

  const handleLocalPlayerDeath = async () => {
    const now = Date.now();
    const lastDeath = deathTimestamps.at(-1);
    let uiType = 'reflection';

    if (lastDeath && now - lastDeath < 90000) {
      uiType = 'tilt';
    }
    setDeathTimestamps(prev => [...prev, now]);

    try {
      const inGameWindow = await obtainWindow('in_game');
      inGameWindow.dispatchEvent(
        new CustomEvent('show-death-ui', { detail: { type: uiType } })
      );
    } catch (e) {
      console.error("Could not send death event to in-game window", e);
    }
  };

  const handleMatchEnd = async (result: 'Victory' | 'Defeat') => {
    let finalLosses = consecutiveLosses;
    if (result === 'Victory') {
      setConsecutiveLosses(0);
      finalLosses = 0;
    } else {
      const newLosses = consecutiveLosses + 1;
      setConsecutiveLosses(newLosses);
      finalLosses = newLosses;
    }

    try {
      const inGameWindow = await obtainWindow('in_game');
      inGameWindow.dispatchEvent(new CustomEvent('show-post-game', {
        detail: {
          totalDeaths: deathTimestamps.length,
          deathReasons: deathReasons,
          personalGoal: personalGoal,
          matchResult: result,
          consecutiveLosses: finalLosses
        }
      }));
    } catch(e) {
      console.error("Could not send post-game event to in-game window", e);
    }
  };

  return null;
}