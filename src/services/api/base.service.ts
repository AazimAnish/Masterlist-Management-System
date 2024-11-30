import { API_CONFIG } from '@/config/api.config';

export class BaseApiService {
  protected static async fetchWithError(
    url: string,
    options?: RequestInit
  ): Promise<Response> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, options);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }
    return response;
  }

  protected static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Add any auth headers if needed
      // 'Authorization': `Bearer ${getToken()}`,
    };
  }

  protected static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    return response.json();
  }
} 