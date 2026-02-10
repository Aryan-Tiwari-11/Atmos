import React, { useState, useEffect } from 'react';
import { questionAPI } from '../services/api';
import {
  subscribeToNewQuestion,
  subscribeToQuestionUpvote,
  emitNewQuestion,
  emitQuestionUpvote,
} from '../services/socketService';
import '../styles/components.css';

const QAComponent = ({ teamId, userId, userRole }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [sessionId, setSessionId] = useState('live-meeting-1');
  const [selectedAnswer, setSelectedAnswer] = useState({});

  useEffect(() => {
    loadQuestions();

    // Subscribe to real-time question updates
    subscribeToNewQuestion((data) => {
      setQuestions((prev) => [data.question, ...prev]);
    });

    subscribeToQuestionUpvote((data) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === data.questionId
            ? { ...q, upvotes: data.upvotes }
            : q
        )
      );
    });
  }, [sessionId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await questionAPI.getSessionQuestions(sessionId);
      setQuestions(res.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      alert('Please enter a question');
      return;
    }

    try {
      const res = await questionAPI.submitQuestion(sessionId, newQuestion);
      emitNewQuestion(sessionId, teamId, res.data._id);
      setNewQuestion('');
      loadQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Error submitting question');
    }
  };

  const handleUpvote = async (questionId, currentUpvotes) => {
    try {
      const res = await questionAPI.upvoteQuestion(questionId);
      emitQuestionUpvote(sessionId, questionId, res.data.upvotes);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === questionId
            ? { ...q, upvotes: res.data.upvotes }
            : q
        )
      );
    } catch (error) {
      console.error('Error upvoting question:', error);
    }
  };

  const handleAnswerQuestion = async (questionId, answer) => {
    if (!answer.trim()) {
      alert('Please enter an answer');
      return;
    }

    try {
      const res = await questionAPI.answerQuestion(questionId, answer);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === questionId ? res.data : q
        )
      );
      setSelectedAnswer((prev) => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    } catch (error) {
      console.error('Error answering question:', error);
      alert('Error answering question');
    }
  };

  if (loading) {
    return <div className="loading">Loading Q&A session...</div>;
  }

  return (
    <div className="qa-container">
      <h2>💬 Live Q&A Session</h2>

      <div className="qa-session-info">
        <p>Session: {sessionId}</p>
      </div>

      {userRole !== 'Manager' && (
        <form className="question-form" onSubmit={handleSubmitQuestion}>
          <textarea
            placeholder="Ask your question here..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows="2"
          />
          <button type="submit" className="btn-primary">
            Submit Question
          </button>
        </form>
      )}

      <div className="questions-list">
        <h3>Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <p className="empty-message">No questions yet</p>
        ) : (
          questions.map((q) => (
            <div key={q._id} className="question-card">
              <div className="question-header">
                <p className="question-content">{q.content}</p>
                <span className="question-upvotes">
                  👍 {q.upvotes} upvotes
                </span>
              </div>

              <div className="question-actions">
                <button
                  onClick={() => handleUpvote(q._id, q.upvotes)}
                  className="btn-upvote"
                >
                  Upvote
                </button>
              </div>

              {q.isAnswered && (
                <div className="question-answer">
                  <p className="answer-label">Manager's Answer:</p>
                  <p className="answer-content">{q.answer}</p>
                </div>
              )}

              {userRole === 'Manager' && !q.isAnswered && (
                <div className="answer-form">
                  <textarea
                    placeholder="Your answer..."
                    value={selectedAnswer[q._id] || ''}
                    onChange={(e) =>
                      setSelectedAnswer((prev) => ({
                        ...prev,
                        [q._id]: e.target.value,
                      }))
                    }
                    rows="2"
                  />
                  <button
                    onClick={() =>
                      handleAnswerQuestion(q._id, selectedAnswer[q._id] || '')
                    }
                    className="btn-primary-small"
                  >
                    Answer
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QAComponent;
