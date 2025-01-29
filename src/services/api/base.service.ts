import { API_CONFIG } from '@/config/api.config';

export class BaseApiService {
  protected static async fetchWithError(
    url: string,
    options?: RequestInit
  ): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  protected static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  protected static async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    return data as T;
  }
} 