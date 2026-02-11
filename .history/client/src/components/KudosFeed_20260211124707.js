import React, { useState, useEffect } from 'react';
import { kudosAPI } from '../services/api';
import {
  subscribeToKudos,
  emitNewKudos,
} from '../services/socketService';
import '../styles/components.css';

const KudosFeed = ({ teamId, userId }) => {
  const [kudos, setKudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKudosMessage, setNewKudosMessage] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const loadKudos = async () => {
    try {
      setLoading(true);
      const res = await kudosAPI.getTeamKudos(teamId);
      setKudos(res.data);
    } catch (error) {
      console.error('Error loading kudos:', error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadKudos();

    // Subscribe to real-time kudos
    subscribeToKudos((data) => {
      setKudos((prev) => [data.kudos, ...prev]);
    });
  }, [teamId]);

  const handleSubmitKudos = async (e) => {
    e.preventDefault();
    if (!newKudosMessage.trim() || !toUserId) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const res = await kudosAPI.submitKudos(
        toUserId,
        newKudosMessage,
        isAnonymous
      );

      // Emit socket event for real-time update
      emitNewKudos(teamId, res.data._id);

      setNewKudosMessage('');
      setToUserId('');
      loadKudos();
    } catch (error) {
      console.error('Error submitting kudos:', error);
      alert('Error submitting kudos');
    }
  };

  if (loading) {
    return <div className="loading">Loading kudos feed...</div>;
  }

  return (
    <div className="kudos-container">
      <h2>🎉 Kudos Feed</h2>

      <form className="kudos-form" onSubmit={handleSubmitKudos}>
        <div className="form-group">
          <label>Send Kudos To</label>
          <input
            type="text"
            placeholder="Team member ID or name"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea
            placeholder="Share your appreciation..."
            value={newKudosMessage}
            onChange={(e) => setNewKudosMessage(e.target.value)}
            rows="3"
          />
        </div>
        <div className="form-group checkbox">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          <label>Send anonymously</label>
        </div>
        <button type="submit" className="btn-primary">
          Send Kudos
        </button>
      </form>

      <div className="kudos-feed">
        <h3>Recent Kudos</h3>
        {kudos.length === 0 ? (
          <p className="empty-message">No kudos yet. Be the first to share!</p>
        ) : (
          kudos.map((k) => (
            <div key={k._id} className="kudos-card">
              <div className="kudos-header">
                <span className="kudos-from">
                  {k.isAnonymous ? 'Anonymous' : k.fromUserId?.name || 'User'}
                </span>
                <span className="kudos-time">
                  {new Date(k.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="kudos-message">{k.message}</p>
              <div className="kudos-footer">
                Kudos to {k.toUserId?.name || 'team member'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KudosFeed;
