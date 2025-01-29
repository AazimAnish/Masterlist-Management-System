import { BOMEntry, BOMWithDetails } from '@/types/bom';
import { Item } from '@/types/item';
import { API_CONFIG } from '@/config/api.config';
import { BaseApiService } from '@/services/api/base.service';
import { ItemsService } from '@/services/api/items.service';

export class BOMService extends BaseApiService {
  static async getBOMs(): Promise<BOMWithDetails[]> {
    const response = await this.fetchWithError('/api/bom');
    return this.handleResponse<BOMWithDetails[]>(response);
  }

  static async createBOM(data: Partial<BOMEntry>): Promise<BOMWithDetails> {
    const response = await this.fetchWithError('/api/bom', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<BOMWithDetails>(response);
  }

  static async updateBOM(id: string, data: Partial<BOMEntry>): Promise<BOMWithDetails> {
    const response = await this.fetchWithError(`/api/bom/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<BOMWithDetails>(response);
  }

  static async deleteBOM(id: string): Promise<void> {
    const response = await this.fetchWithError(`/api/bom/${id}`, {
      method: 'DELETE',
    });
    await this.handleResponse<void>(response);
  }

  static async uploadBOMCSV(file: File): Promise<BOMWithDetails[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.fetchWithError('/api/bom/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let the browser set the Content-Type for FormData
    });
    return this.handleResponse<BOMWithDetails[]>(response);
  }

  static async validatePendingItems(items: Item[]): Promise<Item[]> {
    const boms = await this.getBOMs();
    
    return items.filter(item => {
      const asItem = boms.filter(bom => bom.item_id === item.id);
      const asComponent = boms.filter(bom => bom.component_id === item.id);

      if (item.type === 'sell' && asItem.length === 0) {
        return true;
      }
      if (item.type === 'purchase' && asComponent.length === 0) {
        return true;
      }
      if (item.type === 'component' && 
          (asItem.length === 0 || asComponent.length === 0)) {
        return true;
      }
      return false;
    });
  }

  protected static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }
}
