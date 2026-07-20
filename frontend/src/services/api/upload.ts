import { apiFetch, setSessionId } from './api';

export interface UploadResponse {
  success: boolean;
  session_id: string;
  profile_created: boolean;
  chunks_created: number;
}

export async function uploadResumeFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await apiFetch<UploadResponse>('/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (response.success && response.session_id) {
    setSessionId(response.session_id);
  }
  
  return response;
}
