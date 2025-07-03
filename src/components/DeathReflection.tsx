// src/components/DeathReflection.tsx
import React from 'react';

const REASONS = {
  greed: 'Greed',
  badAwareness: 'Bad Map Awareness',
  outplayed: 'Outplayed 1v1',
  teamMistake: 'Team Mistake'
};

interface Props {
  onReasonSelected: (reason: keyof typeof REASONS) => void;
}

export const DeathReflection: React.FC<Props> = ({ onReasonSelected }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h4>Why did you die?</h4>
        {Object.entries(REASONS).map(([key, text]) => (
          <button
            key={key}
            className="reason-button"
            onClick={() => onReasonSelected(key as keyof typeof REASONS)}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};