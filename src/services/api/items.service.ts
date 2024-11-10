import { BaseApiService } from './base.service';
import { API_CONFIG } from '@/config/api.config';
import { Item, ItemFormData } from '@/types/item';
import { CSVParseResult, CSVError } from '@/types/csv';
import { parseCSV } from '@/utils/csv';

export class ItemsService extends BaseApiService {
    static async getItems(): Promise<Item[]> {
        try {
            const response = await this.fetchWithError(API_CONFIG.ENDPOINTS.ITEMS);
            const data = await response.json();
            // Filter out soft-deleted items
            return Array.isArray(data) ? data.filter(item => !item.is_deleted) : [];
        } catch (error) {
            console.error('Error fetching items:', error);
            throw error;
        }
    }

    static async createItem(data: ItemFormData): Promise<Item> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/items`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    ...data,
                    created_by: 'current_user',
                    last_updated_by: 'current_user',
                    tenant_id: 1, // TODO: Get from context
                    is_deleted: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }),
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error creating item:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to create item');
        }
    }

    static async updateItem(id: string, data: ItemFormData): Promise<Item> {
        try {
            const response = await this.fetchWithError(`${API_CONFIG.ENDPOINTS.ITEMS}/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    ...data,
                    last_updated_by: 'current_user',
                    updatedAt: new Date().toISOString(),
                }),
                cache: 'no-store'
            });
            return response.json();
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    }

    static async deleteItem(id: string): Promise<{ message: string; id: string }> {
        try {
            // First check if the item exists
            const items = await this.getItems();
            const itemExists = items.some(item => item.id === id);
            
            if (!itemExists) {
                throw new Error(`Item with ID ${id} not found`);
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}/items/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to delete item. Status: ${response.status}`);
            }

            const result = await response.json();
            return {
                message: result.message || 'Item deleted successfully',
                id: id
            };
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error instanceof Error 
                ? error 
                : new Error(`Failed to delete item with ID ${id}`);
        }
    }

    static async uploadItemsCSV(file: File): Promise<{ items?: Item[], errors?: CSVError[] }> {
        try {
            const parseResult = await parseCSV<Item>(file);
            
            if (parseResult.errors.length > 0) {
                return { errors: parseResult.errors };
            }

            // Send the transformed data to the API
            const response = await fetch(`${API_CONFIG.BASE_URL}/items/upload`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(parseResult.data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to upload items');
            }

            const result = await response.json();
            return { items: result };
        } catch (error) {
            console.error('Error uploading items:', error);
            throw error;
        }
    }

    private static mapItemType(category: string | undefined): 'sell' | 'purchase' | 'component' {
        if (!category) return 'sell';
        
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('electronic')) return 'sell';
        if (categoryLower.includes('component')) return 'component';
        return 'purchase';
    }

    private static mapUoM(quantity: string | undefined): 'kgs' | 'nos' {
        if (!quantity) return 'nos';
        return !isNaN(Number(quantity)) ? 'nos' : 'kgs';
    }

    // Helper method to handle API responses
    static async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `API Error: ${response.status}`;
            
            if (response.status === 404) {
                throw new Error('Resource not found');
            }
            
            throw new Error(errorMessage);
        }
        return response.json();
    }

    protected static async fetchWithError(
        url: string,
        options?: RequestInit
    ): Promise<Response> {
        const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
            ...options,
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `API Error: ${response.status}`);
        }

        return response;
    }

    protected static getHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
        };
    }
} 