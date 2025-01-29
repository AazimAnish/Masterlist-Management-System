import { Item, ItemFormData } from '@/types/item';
import { BaseApiService } from './base.service';

export class ItemService extends BaseApiService {
  static async getItems(): Promise<Item[]> {
    const response = await this.fetchWithError('/api/items');
    return this.handleResponse<Item[]>(response);
  }

  static async createItem(data: ItemFormData): Promise<Item> {
    const response = await this.fetchWithError('/api/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<Item>(response);
  }

  static async updateItem(id: string, data: ItemFormData): Promise<Item> {
    const response = await this.fetchWithError(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<Item>(response);
  }

  static async deleteItem(id: string): Promise<{ message: string; id: string }> {
    const response = await this.fetchWithError(`/api/items/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse<{ message: string; id: string }>(response);
  }

  static async uploadItemsCSV(file: File): Promise<{ items?: Item[], errors?: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.fetchWithError('/api/items/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let the browser set the Content-Type for FormData
    });
    return this.handleResponse<{ items?: Item[], errors?: any[] }>(response);
  }
} 