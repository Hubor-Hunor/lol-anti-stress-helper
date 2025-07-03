// src/windows/Background.tsx
import { useEffect, useState } from "react";
import { obtainWindow } from "../utils"; // 'sleep' has been removed from this import

const REQUIRED_FEATURES = ['death', 'match_info'];

export function Background() {
  const [localPlayerName, setLocalPlayerName] = useState<string | null>(null);
  const [deathTimestamps, setDeathTimestamps] = useState<number[]>([]);

  useEffect(() => {
    async function setupGameEvents() {
      const info = await new Promise<overwolf.games.events.GetInfoResult>(
        (resolve) => overwolf.games.events.getInfo(resolve)
      );

      const playerName = info.res?.match_info?.pseudo;
      if (playerName) {
        setLocalPlayerName(playerName);
        console.log(`Local player found: ${playerName}`);
      }

      overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, (result) => {
        if (result.success) {
          console.log("Successfully set required features.");
          overwolf.games.events.onNewEvents.addListener(handleGameEvent);
        } else {
          console.error("Failed to set required features:", result);
        }
      });
    }

    const handleReasonSubmit = (event: any) => {
      const reason = event.detail.reason;
      console.log(`Reason submitted: ${reason}`);
      // The 'deathReasons' state logic is removed for now, to be added in Phase 3
    };

    window.addEventListener('submit-death-reason', handleReasonSubmit);
    setupGameEvents();

    return () => {
      overwolf.games.events.onNewEvents.removeListener(handleGameEvent);
      window.removeEventListener('submit-death-reason', handleReasonSubmit);
    };
  }, []);

  const handleGameEvent = (eventsInfo: overwolf.games.events.NewGameEvents) => {
    for (const event of eventsInfo.events) {
      if (event.name === 'death' && event.data) {
        const eventData = JSON.parse(event.data);
        const victimName = eventData.victim_display_name || eventData.victim_name;

        if (localPlayerName && victimName === localPlayerName) {
          handleLocalPlayerDeath();
        }
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

  return null;
}