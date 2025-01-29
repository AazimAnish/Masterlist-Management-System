import { ProcessStep } from '@/types/process-step';
import { BaseApiService } from './base.service';

export class ProcessStepService extends BaseApiService {
  static async getProcessSteps(): Promise<ProcessStep[]> {
    const response = await this.fetchWithError('/api/process-steps');
    return this.handleResponse<ProcessStep[]>(response);
  }

  static async createProcessStep(data: Omit<ProcessStep, 'id'>): Promise<ProcessStep> {
    const response = await this.fetchWithError('/api/process-steps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<ProcessStep>(response);
  }

  static async updateProcessStep(id: string, data: ProcessStep): Promise<ProcessStep> {
    const response = await this.fetchWithError(`/api/process-steps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<ProcessStep>(response);
  }

  static async deleteProcessStep(id: string): Promise<void> {
    const response = await this.fetchWithError(`/api/process-steps/${id}`, {
      method: 'DELETE',
    });
    await this.handleResponse<void>(response);
  }
} 