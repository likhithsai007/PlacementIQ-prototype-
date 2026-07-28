import axios from 'axios';
import { auth } from './firebase';

export const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  timeout: 30000,
});

// Attach Firebase token to every request
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      auth.signOut();
    }
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  },
);

// ─── API Functions ─────────────────────────────────────────────────────────────

export const api = {
  // Auth
  getMe: () => apiClient.get('/auth/me'),
  changePassword: () => apiClient.post('/auth/change-password'),
  revokeSessions: () => apiClient.post('/auth/revoke-sessions'),

  // Profile
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data: any) => apiClient.put('/profile', data),
  getCompleteness: () => apiClient.get('/profile/completeness'),
  
  // Profile Sections
  updatePersonal: (data: any) => apiClient.put('/profile/personal', data),
  updateAcademic: (data: any) => apiClient.put('/profile/academic', data),
  updateCareer: (data: any) => apiClient.put('/profile/career', data),
  updatePreferences: (data: any) => apiClient.put('/profile/preferences', data),

  // Skills
  addSkill: (data: any) => apiClient.post('/profile/skills', data),
  updateSkill: (id: string, data: any) => apiClient.put(`/profile/skills/${id}`, data),
  deleteSkill: (id: string) => apiClient.delete(`/profile/skills/${id}`),

  // Projects
  addProject: (data: any) => apiClient.post('/profile/projects', data),
  updateProject: (id: string, data: any) => apiClient.put(`/profile/projects/${id}`, data),
  deleteProject: (id: string) => apiClient.delete(`/profile/projects/${id}`),

  // Certificates
  addCertificate: (data: any) => apiClient.post('/profile/certificates', data),
  updateCertificate: (id: string, data: any) => apiClient.put(`/profile/certificates/${id}`, data),
  deleteCertificate: (id: string) => apiClient.delete(`/profile/certificates/${id}`),
  uploadCertificate: async (id: string, file: File) => {
    const form = new FormData();
    form.append('certificate', file);
    const token = await auth.currentUser?.getIdToken();
    return apiClient.post(`/profile/certificates/${id}/upload`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
  },

  // Resume
  getResume: () => apiClient.get('/resume'),
  uploadResume: async (file: File) => {
    const form = new FormData();
    form.append('resume', file);
    const token = await auth.currentUser?.getIdToken();
    return apiClient.post('/resume/upload', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      onUploadProgress: undefined,
    });
  },
  getResumeStatus: (jobId: string) => apiClient.get(`/resume/status/${jobId}`),
  chatWithResume: (message: string) => apiClient.post('/resume/chat', { message }),
  analyzeResume: (forceRefresh = false) => apiClient.post('/resume/analyze', { forceRefresh }),

  // GitHub
  getGitHub: () => apiClient.get('/github'),
  connectGitHub: (username: string) => apiClient.post('/github/connect', { username }),
  getGitHubStatus: (jobId: string) => apiClient.get(`/github/status/${jobId}`),
  analyzeGitHub: (forceRefresh = false) => apiClient.post('/github/analyze', { forceRefresh }),
  chatWithGitHub: (message: string) => apiClient.post('/github/chat', { message }),

  // Coding
  getCodingProfiles: () => apiClient.get('/coding'),
  connectCoding: (platform: string, username: string) =>
    apiClient.post('/coding/connect', { platform, username }),
  disconnectCoding: (platform: string) => apiClient.delete(`/coding/${platform}`),
  getCodingAnalysis: () => apiClient.get('/coding/analysis'),
  analyzeCodingProfiles: () => apiClient.post('/coding/analyze'),

  // Analysis
  getAnalyses: () => apiClient.get('/analysis'),
  getAnalysis: (id: string) => apiClient.get(`/analysis/${id}`),
  startAnalysis: () => apiClient.post('/analysis/start'),

  // Report
  getReport: (id: string) => apiClient.get(`/report/${id}`),
  getReportSummary: (id: string) => apiClient.get(`/report/${id}/summary`),

  // Dashboard
  getDashboard: () => apiClient.get('/dashboard'),
  getActivity: () => apiClient.get('/dashboard/activity'),
  getDashboardAnalysis: () => apiClient.get('/dashboard/analysis'),

  // Jobs
  getJobRecommendations: (params?: { analysisId?: string; location?: string; isRemote?: boolean; isHybrid?: boolean; jobType?: string; company?: string }) => {
    if (params?.analysisId) {
      return apiClient.get(`/jobs/recommendations/${params.analysisId}`);
    }
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '')
    );
    const qs = new URLSearchParams(filteredParams as any).toString();
    return apiClient.get(`/jobs/recommendations${qs ? '?' + qs : ''}`);
  },
  getJobHistory: () => apiClient.get('/jobs/history'),
  refreshJobRecommendations: (analysisId?: string) => 
    apiClient.post('/jobs/recommendations/refresh', { analysisId }),
  getJob: (id: string) => apiClient.get(`/jobs/${id}`),
  saveJob: (id: string, status: 'SAVED' | 'APPLY_LATER' | 'APPLIED') => apiClient.post(`/jobs/${id}/save`, { status }),
  getSavedJobs: () => apiClient.get('/jobs/saved'),
};
