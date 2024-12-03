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
            const text = await file.text();
            const rows = text.split('\n').map(row => row.trim()).filter(Boolean);
            const headers = rows[0].toLowerCase().split(',').map(h => h.trim());
            
            const errors: CSVError[] = [];
            const validItems: Item[] = [];

            rows.slice(1)
                .filter(row => row.trim())
                .forEach((row, index) => {
                    try {
                        const values = row.split(',').map(v => v.trim());
                        const item: Record<string, any> = {};
                        
                        headers.forEach((header, idx) => {
                            item[header] = values[idx];
                        });

                        // Validate required fields
                        const missingFields = [];
                        if (!item.internal_item_name) missingFields.push('internal_item_name');
                        if (!item.type) missingFields.push('type');
                        if (!item.uom) missingFields.push('uom');

                        if (missingFields.length > 0) {
                            errors.push({
                                row: index + 2,
                                message: `Missing required fields: ${missingFields.join(', ')}`
                            });
                            return;
                        }

                        // Validate type
                        if (!['sell', 'purchase', 'component'].includes(item.type.toLowerCase())) {
                            errors.push({
                                row: index + 2,
                                message: `Invalid type: ${item.type}. Must be one of: sell, purchase, component`
                            });
                            return;
                        }

                        // Validate UoM
                        const normalizedUoM = item.uom.toLowerCase();
                        if (!['kgs', 'nos', 'kg', 'no'].includes(normalizedUoM)) {
                            errors.push({
                                row: index + 2,
                                message: `Invalid UoM: ${item.uom}. Must be one of: kgs, nos`
                            });
                            return;
                        }

                        // If all validations pass, create valid item
                        validItems.push({
                            id: crypto.randomUUID(),
                            internal_item_name: item.internal_item_name,
                            type: item.type.toLowerCase() as 'sell' | 'purchase' | 'component',
                            uom: normalizedUoM.startsWith('kg') ? 'kgs' : 'nos',
                            item_description: item.item_description || '',
                            tenant_id: 1,
                            created_by: 'current_user',
                            last_updated_by: 'current_user',
                            is_deleted: false,
                            customer_item_name: item.customer_item_name || '',
                            max_buffer: parseInt(item.max_buffer) || 0,
                            min_buffer: parseInt(item.min_buffer) || 0,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            additional_attributes: {
                                drawing_revision_number: parseInt(item.drawing_revision_number) || 0,
                                drawing_revision_date: item.drawing_revision_date || '',
                                avg_weight_needed: parseFloat(item.avg_weight_needed) || 0,
                                scrap_type: item.scrap_type || '',
                                shelf_floor_alternate_name: item.shelf_floor_alternate_name || ''
                            }
                        });
                    } catch (error) {
                        errors.push({
                            row: index + 2,
                            message: error instanceof Error ? error.message : 'Invalid row data'
                        });
                    }
                });

            if (errors.length > 0) {
                return { errors };
            }

            if (validItems.length === 0) {
                return {
                    errors: [{
                        row: 0,
                        message: 'No valid items found in CSV'
                    }]
                };
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}/items/upload`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(validItems)
            });

            const result = await response.json();
            
            if (!response.ok) {
                return { errors: result.errors || [{ row: 0, message: result.message }] };
            }

            return { items: result };
        } catch (error) {
            console.error('Error uploading items CSV:', error);
            return {
                errors: [{
                    row: 0,
                    message: error instanceof Error ? error.message : 'Failed to process CSV'
                }]
            };
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