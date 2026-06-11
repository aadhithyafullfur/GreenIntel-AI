import axios from 'axios';
import type { ClassificationResult } from '../types/document';

// Read API URL from environment variables, or fallback to localhost:8000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

// Attach Authorization Token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('greenintel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Uploads a single document to the server for classification.
 * Tracks progress using the provided callback.
 */
export const uploadSingleDocument = async (
  file: File,
  onUploadProgress?: (progress: number) => void
): Promise<ClassificationResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ClassificationResult>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onUploadProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

/**
 * Uploads multiple documents in a single request.
 * Tracks overall progress using the provided callback.
 */
export const uploadMultipleDocuments = async (
  files: File[],
  onUploadProgress?: (progress: number) => void
): Promise<ClassificationResult[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file); // FastAPI expects 'files' matching parameter name
  });

  const response = await api.post<ClassificationResult[]>('/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onUploadProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

export default api;
