import api from './api';
import type {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
  ProjectAnalytics,
  ProjectTimelineEvent,
  ProjectInsight
} from '../types/project';
import type { ClassificationResult } from '../types/document';

const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (error && typeof error === 'object' && 'response' in error) {
    const errObj = error as { response?: { status?: number; data?: { detail?: string; message?: string } }; message?: string };
    const status = errObj.response?.status;
    const detail = errObj.response?.data?.detail || errObj.response?.data?.message;

    if (detail) {
      throw new Error(detail, { cause: error });
    }

    switch (status) {
      case 400:
        throw new Error('Invalid project request data.', { cause: error });
      case 401:
        throw new Error('Please log in again.', { cause: error });
      case 403:
        throw new Error('You do not have permission to access this project.', { cause: error });
      case 404:
        throw new Error('Project endpoint was not found.', { cause: error });
      case 422:
        throw new Error('Validation error. Please verify project information.', { cause: error });
      case 500:
        throw new Error('Server error while processing project request.', { cause: error });
    }
  } else if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message;
    if (message.includes('Network Error') || message.includes('ECONNREFUSED')) {
      throw new Error('Unable to connect to the backend.', { cause: error });
    }
  }
  throw new Error(defaultMessage, { cause: error });
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get('/api/projects');
    return response.data.projects || [];
  } catch (err) {
    return handleApiError(err, 'Failed to fetch user projects.');
  }
};

export const createProject = async (input: ProjectCreateInput): Promise<Project> => {
  try {
    const response = await api.post('/api/projects', input);
    return response.data.project;
  } catch (err) {
    return handleApiError(err, 'Project could not be created.');
  }
};

export const getProjectDetails = async (projectId: string): Promise<Project> => {
  try {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data.project;
  } catch (err) {
    return handleApiError(err, 'Failed to retrieve project details.');
  }
};

export const updateProject = async (projectId: string, input: ProjectUpdateInput): Promise<void> => {
  try {
    await api.put(`/api/projects/${projectId}`, input);
  } catch (err) {
    handleApiError(err, 'Failed to update project.');
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    await api.delete(`/api/projects/${projectId}`);
  } catch (err) {
    handleApiError(err, 'Failed to delete project.');
  }
};

export const uploadProjectDocuments = async (
  projectId: string,
  files: File[]
): Promise<ClassificationResult[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  try {
    const response = await api.post(`/api/projects/${projectId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.documents || [];
  } catch (err) {
    return handleApiError(err, 'Failed to upload project documents.');
  }
};

export const getProjectDocuments = async (projectId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/projects/${projectId}/documents`);
    return response.data.documents || [];
  } catch (err) {
    return handleApiError(err, 'Failed to fetch project documents.');
  }
};

export const deleteProjectDocument = async (projectId: string, documentId: string): Promise<void> => {
  try {
    await api.delete(`/api/projects/${projectId}/documents/${documentId}`);
  } catch (err) {
    handleApiError(err, 'Failed to delete document from project.');
  }
};

export const analyzeProject = async (projectId: string): Promise<any> => {
  try {
    const response = await api.post(`/api/projects/${projectId}/analyze`);
    return response.data;
  } catch (err) {
    return handleApiError(err, 'Failed to run project analysis.');
  }
};

export const getProjectAnalytics = async (projectId: string): Promise<ProjectAnalytics> => {
  try {
    const response = await api.get(`/api/projects/${projectId}/analytics`);
    return response.data;
  } catch (err) {
    return handleApiError(err, 'Failed to fetch project analytics.');
  }
};

export const getProjectTimeline = async (projectId: string): Promise<ProjectTimelineEvent[]> => {
  try {
    const response = await api.get(`/api/projects/${projectId}/timeline`);
    return response.data.timeline || [];
  } catch (err) {
    return handleApiError(err, 'Failed to fetch project timeline.');
  }
};

export const getProjectInsights = async (projectId: string): Promise<ProjectInsight[]> => {
  try {
    const response = await api.get(`/api/projects/${projectId}/insights`);
    return response.data.insights || [];
  } catch (err) {
    return handleApiError(err, 'Failed to fetch project insights.');
  }
};

export const downloadProjectReportPDF = async (projectId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('greenintel_token');
    const response = await api.get(`/api/projects/${projectId}/pdf-report`, {
      responseType: 'blob',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    const blob = new Blob([response.data], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `Project_Audit_Report_${projectId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    handleApiError(err, 'Failed to download project report PDF.');
  }
};

export const sendProjectChatMessage = async (
  projectId: string,
  message: string,
  history?: { role: string; content: string }[]
): Promise<{ answer: string; sources: any[]; documents: any[]; metadata: any }> => {
  try {
    const response = await api.post(`/api/projects/${projectId}/chat`, { message, history });
    return response.data;
  } catch (err) {
    return handleApiError(err, 'Unable to analyze the project right now. Please try again.');
  }
};

export const getProjectChatHistory = async (projectId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/projects/${projectId}/chat/history`);
    return response.data.history || [];
  } catch (err) {
    return handleApiError(err, 'Failed to fetch project chat history.');
  }
};

export const clearProjectChatHistory = async (projectId: string): Promise<void> => {
  try {
    await api.delete(`/api/projects/${projectId}/chat/history`);
  } catch (err) {
    handleApiError(err, 'Failed to clear project chat history.');
  }
};
