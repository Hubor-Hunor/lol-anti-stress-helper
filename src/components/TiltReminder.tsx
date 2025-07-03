// src/components/TiltReminder.tsx
import React, { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
}

export const TiltReminder: React.FC<Props> = ({ onClose }) => {
  const [countdown, setCountdown] = useState(10); // Auto-close after 10 seconds

  useEffect(() => {
    if (countdown <= 0) {
      onClose();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onClose]);

  return (
    <div className="modal-backdrop">
      <div className="modal-content tilt-reminder">
        <h2>You are on tilt.</h2>
        <p>Take a deep breath. Play safe until your next item.</p>
        <button className="reason-button" onClick={onClose}>
          Got it ({countdown}s)
        </button>
      </div>
    </div>
  );
};