import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (name, email, password, role, teamId) =>
    api.post('/auth/register', { name, email, password, role, teamId }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Team endpoints
export const teamAPI = {
  createTeam: (name, companyId, description) =>
    api.post('/teams/create', { name, companyId, description }),
  getTeam: (teamId) =>
    api.get(`/teams/${teamId}`),
  getMyTeams: () =>
    api.get('/teams/user/my-teams'),
};

// Kudos endpoints
export const kudosAPI = {
  submitKudos: (toUserId, message, isAnonymous) =>
    api.post('/kudos/submit', { toUserId, message, isAnonymous }),
  getTeamKudos: (teamId) =>
    api.get(`/kudos/team/${teamId}`),
};

// Pulse endpoints
export const pulseAPI = {
  submitPulse: (status, notes) =>
    api.post('/pulse/submit', { status, notes }),
  getAggregatedPulse: (teamId) =>
    api.get(`/pulse/team/${teamId}/aggregated`),
};

// Questions endpoints
export const questionAPI = {
  submitQuestion: (sessionId, content) =>
    api.post('/questions/submit', { sessionId, content }),
  upvoteQuestion: (questionId) =>
    api.post(`/questions/${questionId}/upvote`),
  getSessionQuestions: (sessionId) =>
    api.get(`/questions/session/${sessionId}`),
  answerQuestion: (questionId, answer) =>
    api.post(`/questions/${questionId}/answer`, { answer }),
};

export default api;
