// src/components/PostGame.tsx
import React, { useEffect, useState } from 'react';

// A simple helper to check if the goal was met
const checkGoalSuccess = (goal: string, totalDeaths: number): boolean => {
  if (goal.includes('less than 5')) {
    return totalDeaths < 5;
  }
  // We can add more goal checks here later
  return false; 
};

export interface PostGameProps {
  totalDeaths: number;
  deathReasons: Record<string, number>;
  personalGoal: string;
  matchResult: 'Victory' | 'Defeat';
  consecutiveLosses: number;
  onNewGame: () => void;
}

const LossStreakTimer: React.FC<{ onTimerEnd: () => void }> = ({ onTimerEnd }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimerEnd();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onTimerEnd]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="lockout-timer">
      <h2>You're on a loss streak.</h2>
      <p>Take a break. Stand up, get some water.</p>
      <div className="timer-display">{minutes}:{seconds.toString().padStart(2, '0')}</div>
    </div>
  )
}


export const PostGame: React.FC<PostGameProps> = (props) => {
  const { totalDeaths, deathReasons, personalGoal, matchResult, consecutiveLosses, onNewGame } = props;
  const wasGoalMet = checkGoalSuccess(personalGoal, totalDeaths);
  const [showLockout, setShowLockout] = useState(consecutiveLosses >= 2);

  return (
    <div className="phase-container post-game">
      <h2 className={matchResult.toLowerCase()}>{matchResult}</h2>
      
      <div className="summary-section">
        <h3>Personal Goal</h3>
        <p>Your goal was: "{personalGoal}"</p>
        <p>You died {totalDeaths} times.</p>
        <p>Result: <span className={wasGoalMet ? 'success' : 'failure'}>
            {wasGoalMet ? 'Success!' : 'Failed'}
          </span>
        </p>
      </div>

      <div className="summary-section">
        <h3>Death Pattern Analysis</h3>
        {Object.entries(deathReasons).map(([reason, count]) => (
          <div key={reason} className="death-reason-row">
            <span>{reason.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
            <span>{count}</span>
          </div>
        ))}
      </div>

      {showLockout ? (
        <LossStreakTimer onTimerEnd={() => setShowLockout(false)} />
      ) : (
        <button onClick={onNewGame} className="action-button">
          New Game
        </button>
      )}
    </div>
  );
};