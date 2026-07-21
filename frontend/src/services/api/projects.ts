import { apiFetch } from './api';
import type { ActiveProject } from '@/types';

export async function fetchActiveProjects(): Promise<ActiveProject[]> {
  return await apiFetch<ActiveProject[]>('/api/v1/projects/{session_id}', {
    method: 'GET',
  });
}

export async function saveActiveProjects(projects: ActiveProject[]): Promise<ActiveProject[]> {
  return await apiFetch<ActiveProject[]>('/api/v1/projects/{session_id}', {
    method: 'PUT',
    body: JSON.stringify(projects),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
