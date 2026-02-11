import React, { useState } from 'react';
import { pulseAPI } from '../services/api';
import { emitPulseSubmitted } from '../services/socketService';
import '../styles/components.css';

const PulseModal = ({ onClose, teamId }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (selectedStatus) => {
    try {
      setLoading(true);
      await pulseAPI.submitPulse(selectedStatus, notes);

      // Emit socket event for real-time update
      emitPulseSubmitted(teamId, selectedStatus);

      alert(`Pulse check submitted: ${selectedStatus}`);
      onClose();
    } catch (error) {
      console.error('Error submitting pulse:', error);
      alert('Error submitting pulse check');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>How are you feeling?</h3>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="pulse-options">
          <button
            className="pulse-btn light"
            onClick={() => handleSubmit('Light')}
            disabled={loading}
          >
            <span className="emoji">☀️</span>
            <span>Light</span>
            <small>Manageable workload</small>
          </button>
          <button
            className="pulse-btn good"
            onClick={() => handleSubmit('Good')}
            disabled={loading}
          >
            <span className="emoji">😊</span>
            <span>Good</span>
            <small>Balanced and focused</small>
          </button>
          <button
            className="pulse-btn heavy"
            onClick={() => handleSubmit('Heavy')}
            disabled={loading}
          >
            <span className="emoji">🔥</span>
            <span>Heavy</span>
            <small>Overwhelmed or stressed</small>
          </button>
        </div>

        <div className="form-group">
          <label>Additional Notes (optional)</label>
          <textarea
            placeholder="Share anything you'd like (stays anonymous)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
          />
        </div>

        <p className="pulse-info">Your response will be completely anonymous</p>
      </div>
    </div>
  );
};

export default PulseModal;
