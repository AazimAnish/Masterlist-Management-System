import { BOMEntry, BOMWithDetails } from '@/types/bom';
import { Item } from '@/types/item';
import { API_CONFIG } from '@/config/api.config';
import { BaseApiService } from '@/services/api/base.service';
import { ItemsService } from '@/services/api/items.service';

export class BOMService extends BaseApiService {
  static async getBOMs(): Promise<BOMWithDetails[]> {
    try {
      const response = await this.fetchWithError(API_CONFIG.ENDPOINTS.BOM);
      return this.handleResponse<BOMWithDetails[]>(response);
    } catch (error) {
      console.error('Error fetching BOMs:', error);
      throw error;
    }
  }

  static async createBOM(data: Partial<BOMEntry>): Promise<BOMWithDetails> {
    try {
      // Validate required fields
      if (!data.item_id || !data.component_id || !data.quantity) {
        throw new Error('Missing required fields');
      }

      // Validate quantity range
      if (data.quantity < 1 || data.quantity > 100) {
        throw new Error('Quantity must be between 1 and 100');
      }

      // Get items for validation
      const items = await ItemsService.getItems();
      const item = items.find(i => i.id === data.item_id);
      const component = items.find(i => i.id === data.component_id);

      // Validate item existence
      if (!item || !component) {
        throw new Error('Referenced items do not exist');
      }

      // Validate item type constraints
      if (item.type === 'purchase') {
        throw new Error('Purchase items cannot be used as main items in BOM');
      }

      if (component.type === 'sell') {
        throw new Error('Sell items cannot be used as components in BOM');
      }

      // Check for duplicate combinations
      const existingBOMs = await this.getBOMs();
      const isDuplicate = existingBOMs.some(
        bom => bom.item_id === data.item_id && 
              bom.component_id === data.component_id
      );

      if (isDuplicate) {
        throw new Error('This item and component combination already exists');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/bom`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...data,
          created_by: 'current_user',
          last_updated_by: 'current_user',
          is_active: true,
        }),
      });

      return this.handleResponse<BOMWithDetails>(response);
    } catch (error) {
      console.error('Error creating BOM:', error);
      throw error;
    }
  }

  static async updateBOM(id: string, data: Partial<BOMEntry>): Promise<BOMWithDetails> {
    try {
      // Validate required fields
      if (!data.item_id || !data.component_id || !data.quantity) {
        throw new Error('Missing required fields');
      }

      // Validate quantity range
      if (data.quantity < 1 || data.quantity > 100) {
        throw new Error('Quantity must be between 1 and 100');
      }

      // Get items for validation
      const items = await ItemsService.getItems();
      const item = items.find(i => i.id === data.item_id);
      const component = items.find(i => i.id === data.component_id);

      // Validate item existence
      if (!item || !component) {
        throw new Error('Referenced items do not exist');
      }

      // Validate item type constraints
      if (item.type === 'purchase') {
        throw new Error('Purchase items cannot be used as main items in BOM');
      }

      if (component.type === 'sell') {
        throw new Error('Sell items cannot be used as components in BOM');
      }

      // Check for duplicate combinations (excluding current BOM)
      const existingBOMs = await this.getBOMs();
      const isDuplicate = existingBOMs.some(
        bom => bom.id !== id && 
              bom.item_id === data.item_id && 
              bom.component_id === data.component_id
      );

      if (isDuplicate) {
        throw new Error('This item and component combination already exists');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/bom/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...data,
          last_updated_by: 'current_user',
        }),
      });

      return this.handleResponse<BOMWithDetails>(response);
    } catch (error) {
      console.error('Error updating BOM:', error);
      throw error;
    }
  }

  static async deleteBOM(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/bom/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      await this.handleResponse<void>(response);
    } catch (error) {
      console.error('Error deleting BOM:', error);
      throw error;
    }
  }

  static async uploadBOMCSV(file: File): Promise<BOMWithDetails[]> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_CONFIG.BASE_URL}/bom/upload`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      return this.handleResponse<BOMWithDetails[]>(response);
    } catch (error) {
      console.error('Error uploading BOM CSV:', error);
      throw error;
    }
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
