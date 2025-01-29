import { Process } from '@/types/process';
import { BaseApiService } from './base.service';

export class ProcessService extends BaseApiService {
  static async getProcesses(): Promise<Process[]> {
    const response = await this.fetchWithError('/api/processes');
    return this.handleResponse<Process[]>(response);
  }

  static async createProcess(data: Omit<Process, 'id'>): Promise<Process> {
    const response = await this.fetchWithError('/api/processes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<Process>(response);
  }

  static async updateProcess(id: string, data: Process): Promise<Process> {
    const response = await this.fetchWithError(`/api/processes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<Process>(response);
  }

  static async deleteProcess(id: string): Promise<void> {
    const response = await this.fetchWithError(`/api/processes/${id}`, {
      method: 'DELETE',
    });
    await this.handleResponse<void>(response);
  }
} 