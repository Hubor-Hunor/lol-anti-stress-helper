import React, { useState } from 'react';

const PERSONAL_GOALS = [
  "Keep my CS above 7.0/min.",
  "Die less than 5 times.",
  "Place a control ward on every back.",
  "Track the enemy jungler's first clear.",
  "Mute anyone who is negative immediately."
];

interface PreGameProps {
  onGameStart: (winCondition: string, personalGoal: string) => void;
}

export const PreGame: React.FC<PreGameProps> = ({ onGameStart }) => {
  const [winCondition, setWinCondition] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string>("");

  const handleStart = () => {
    if (winCondition && selectedGoal) {
      onGameStart(winCondition, selectedGoal);
    } else {
      alert("Please define your win condition and select a personal goal.");
    }
  };

  return (
    <div className="phase-container">
      <h2>Pre-Game Ritual</h2>
      <p>Prime yourself for a focused game.</p>

      <div className="input-group">
        <label>What is your champion's primary job?</label>
        <input
          type="text"
          value={winCondition}
          onChange={(e) => setWinCondition(e.target.value)}
          placeholder="e.g., Peel for my ADC, Split-push top..."
        />
      </div>

      <div className="input-group">
        <label>Select ONE personal goal:</label>
        {PERSONAL_GOALS.map(goal => (
          <div key={goal} className="goal-option">
            <input
              type="radio"
              id={goal}
              name="personalGoal"
              value={goal}
              checked={selectedGoal === goal}
              onChange={() => setSelectedGoal(goal)}
            />
            <label htmlFor={goal}>{goal}</label>
          </div>
        ))}
      </div>

      <button onClick={handleStart} className="action-button">
        Lock In & Start Game
      </button>
    </div>
  );
};