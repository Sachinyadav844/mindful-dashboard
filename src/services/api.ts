import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (data: { email: string; password: string }) => api.post('/auth/login', data);
export const register = (data: { name: string; email: string; password: string }) => api.post('/auth/register', data);
export const analyzeFace = (data: FormData) => api.post('/analyze_face', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const analyzeText = (data: { text: string }) => api.post('/analyze_text', data);
export const calculateScore = (data: object) => api.post('/calculate_score', data);
export const getRecommendation = () => api.get('/recommendation');
export const getTrendData = () => api.get('/trend_data');
export const getEmotionStats = () => api.get('/emotion_stats');
export const getHistory = () => api.get('/history');
export const saveAssessment = (data: object) => api.post('/save_assessment', data);
export const getJournalHistory = (filter?: string) => api.get('/journal/history', { params: { filter } });
export const exportReport = () => api.get('/export_report', { responseType: 'blob' });

export default api;
