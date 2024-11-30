import { BOMEntry, BOMWithDetails } from '@/types/bom';
import { Item } from '@/types/item';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class BOMService {
  static async getBOMs(): Promise<BOMWithDetails[]> {
    try {
      const [bomResponse, itemsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/bom`, { next: { revalidate: 60 } }), // Cache for 60 seconds
        fetch(`${API_BASE_URL}/items`, { next: { revalidate: 60 } })
      ]);

      if (!bomResponse.ok || !itemsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [boms, items]: [BOMEntry[], Item[]] = await Promise.all([
        bomResponse.json(),
        itemsResponse.json()
      ]);

      return boms.map(bom => {
        const item = items.find(i => i.id === bom.item_id);
        const component = items.find(i => i.id === bom.component_id);
        
        if (!item || !component) {
          throw new Error(`Item or component not found for BOM ${bom.id}`);
        }

        return {
          ...bom,
          item: {
            internal_item_name: item.internal_item_name,
            type: item.type,
          },
          component: {
            internal_item_name: component.internal_item_name,
            type: component.type,
          },
        };
      });
    } catch (error) {
      console.error('Error fetching BOMs:', error);
      throw error;
    }
  }

  static async createBOM(data: Omit<BOMEntry, 'id'>): Promise<BOMWithDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/bom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          created_by: 'current_user', // Replace with actual user
          last_updated_by: 'current_user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        cache: 'no-store' // Disable cache for mutations
      });

      if (!response.ok) {
        throw new Error('Failed to create BOM');
      }

      const newBOM: BOMEntry = await response.json();

      // Fetch item details
      const [item, component] = await Promise.all([
        fetch(`${API_BASE_URL}/items/${newBOM.item_id}`).then(res => res.json()),
        fetch(`${API_BASE_URL}/items/${newBOM.component_id}`).then(res => res.json()),
      ]);

      return {
        ...newBOM,
        item: {
          internal_item_name: item.internal_item_name,
          type: item.type,
        },
        component: {
          internal_item_name: component.internal_item_name,
          type: component.type,
        },
      };
    } catch (error) {
      console.error('Error creating BOM:', error);
      throw error;
    }
  }

  static async updateBOM(id: string, data: BOMEntry): Promise<BOMWithDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/bom/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          last_updated_by: 'current_user',
          updatedAt: new Date().toISOString(),
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to update BOM');
      }

      const updatedBOM: BOMEntry = await response.json();

      // Fetch item details
      const [item, component] = await Promise.all([
        fetch(`${API_BASE_URL}/items/${updatedBOM.item_id}`).then(res => res.json()),
        fetch(`${API_BASE_URL}/items/${updatedBOM.component_id}`).then(res => res.json()),
      ]);

      return {
        ...updatedBOM,
        item: {
          internal_item_name: item.internal_item_name,
          type: item.type,
        },
        component: {
          internal_item_name: component.internal_item_name,
          type: component.type,
        },
      };
    } catch (error) {
      console.error('Error updating BOM:', error);
      throw error;
    }
  }

  static async deleteBOM(id: string): Promise<{ message: string; id: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/bom/${id}`, {
        method: 'DELETE',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to delete BOM');
      }

      return response.json();
    } catch (error) {
      console.error('Error deleting BOM:', error);
      throw error;
    }
  }

  static async uploadBOMCSV(file: File): Promise<BOMWithDetails[]> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/bom/upload`, {
        method: 'POST',
        body: formData,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to upload BOM CSV');
      }

      const data: BOMEntry[] = await response.json();

      // Fetch items for the uploaded BOMs
      const itemIds = new Set([...data.map(bom => bom.item_id), ...data.map(bom => bom.component_id)]);
      const itemsResponse = await fetch(`${API_BASE_URL}/items`);
      const items: Item[] = await itemsResponse.json();

      return data.map(bom => {
        const item = items.find(i => i.id === bom.item_id);
        const component = items.find(i => i.id === bom.component_id);

        if (!item || !component) {
          throw new Error(`Item or component not found for BOM ${bom.id}`);
        }

        return {
          ...bom,
          item: {
            internal_item_name: item.internal_item_name,
            type: item.type,
          },
          component: {
            internal_item_name: component.internal_item_name,
            type: component.type,
          },
        };
      });
    } catch (error) {
      console.error('Error uploading BOM CSV:', error);
      throw error;
    }
  }
}
