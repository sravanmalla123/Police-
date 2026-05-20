import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function loginUser(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function fetchOfficers() {
  const response = await api.get('/auth/officers');
  return response.data;
}

export async function fetchMyReports(lang = 'original') {
  const response = await api.get('/reports/my', { params: { lang } });
  return response.data;
}

export async function submitReport(payload) {
  const response = await api.post('/reports', payload);
  return response.data;
}

export async function fetchAdminReports(params) {
  const response = await api.get('/reports', { params });
  return response.data;
}

export async function updateReportStatus(reportId, status) {
  const response = await api.patch(`/reports/${reportId}/status`, { status });
  return response.data;
}

export async function assignOfficerToReport(reportId, assignedOfficer) {
  const response = await api.patch(`/reports/${reportId}/assign`, { assignedOfficer });
  return response.data;
}

export async function fetchBulletins() {
  const response = await api.get('/reports/bulletins');
  return response.data;
}

export async function broadcastBulletin(message, severity) {
  const response = await api.post('/reports/bulletins', { message, severity });
  return response.data;
}

export default api;
