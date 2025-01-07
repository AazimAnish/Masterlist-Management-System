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
            // Validate required fields
            if (!data.internal_item_name || !data.type || !data.uom) {
                throw new Error('Missing required fields');
            }

            // Validate scrap_type for sell items
            if (data.type === 'sell' && !data.additional_attributes?.scrap_type) {
                throw new Error('Scrap type is required for sell items');
            }

            // Validate min_buffer for sell and purchase items
            if ((data.type === 'sell' || data.type === 'purchase') && typeof data.min_buffer === 'undefined') {
                throw new Error('Min buffer is required for sell and purchase items');
            }

            // Validate max_buffer >= min_buffer when both are defined
            if (typeof data.max_buffer !== 'undefined' && typeof data.min_buffer !== 'undefined' && data.max_buffer < data.min_buffer) {
                throw new Error('Max buffer must be greater than or equal to min buffer');
            }

            const minBuffer = typeof data.min_buffer !== 'undefined' ? data.min_buffer : 0;
            const maxBuffer = typeof data.max_buffer !== 'undefined' ? data.max_buffer : minBuffer;

            const response = await fetch(`${API_CONFIG.BASE_URL}/items`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    ...data,
                    tenant_id: 1, // Default tenant ID
                    created_by: 'current_user',
                    last_updated_by: 'current_user',
                    is_deleted: false,
                    min_buffer: minBuffer,
                    max_buffer: maxBuffer,
                }),
            });

            return this.handleResponse<Item>(response);
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    }

    static async updateItem(id: string, data: ItemFormData): Promise<Item> {
        try {
            // Validate required fields
            if (!data.internal_item_name || !data.type || !data.uom) {
                throw new Error('Missing required fields');
            }

            // Validate scrap_type for sell items
            if (data.type === 'sell' && !data.additional_attributes?.scrap_type) {
                throw new Error('Scrap type is required for sell items');
            }

            // Validate min_buffer for sell and purchase items
            if ((data.type === 'sell' || data.type === 'purchase') && typeof data.min_buffer === 'undefined') {
                throw new Error('Min buffer is required for sell and purchase items');
            }

            // Validate max_buffer >= min_buffer when both are defined
            if (typeof data.max_buffer !== 'undefined' && typeof data.min_buffer !== 'undefined' && data.max_buffer < data.min_buffer) {
                throw new Error('Max buffer must be greater than or equal to min buffer');
            }

            const minBuffer = typeof data.min_buffer !== 'undefined' ? data.min_buffer : 0;
            const maxBuffer = typeof data.max_buffer !== 'undefined' ? data.max_buffer : minBuffer;

            const response = await fetch(`${API_CONFIG.BASE_URL}/items/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    ...data,
                    last_updated_by: 'current_user',
                    min_buffer: minBuffer,
                    max_buffer: maxBuffer,
                }),
            });

            return this.handleResponse<Item>(response);
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    }

    static async deleteItem(id: string): Promise<{ message: string; id: string }> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/items/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            return this.handleResponse<{ message: string; id: string }>(response);
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    }

    static async uploadItemsCSV(file: File): Promise<{ items?: Item[], errors?: CSVError[] }> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_CONFIG.BASE_URL}/items/upload`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const result = await this.handleResponse<{ items?: Item[], errors?: CSVError[] }>(response);

            // If there are errors, format them for better user feedback
            if (result.errors && result.errors.length > 0) {
                result.errors = result.errors.map(error => ({
                    ...error,
                    suggestion: this.getErrorSuggestion(error),
                }));
            }

            return result;
        } catch (error) {
            console.error('Error uploading CSV:', error);
            throw error;
        }
    }

    private static getErrorSuggestion(error: CSVError): string {
        switch (error.field) {
            case 'internal_item_name':
                return 'Ensure the item name is unique and not empty';
            case 'type':
                return 'Type must be one of: sell, purchase, component';
            case 'uom':
                return 'UoM must be one of: kgs, nos';
            case 'scrap_type':
                return 'Scrap type is required for sell items';
            case 'min_buffer':
                return 'Min buffer is required for sell and purchase items';
            case 'max_buffer':
                return 'Max buffer must be greater than or equal to min buffer';
            default:
                return 'Please check the field value and try again';
        }
    }

    private static mapItemType(category: string | undefined): 'sell' | 'purchase' | 'component' {
        switch (category?.toLowerCase()) {
            case 'sell':
                return 'sell';
            case 'purchase':
                return 'purchase';
            case 'component':
                return 'component';
            default:
                throw new Error('Invalid item type');
        }
    }

    private static mapUoM(quantity: string | undefined): 'kgs' | 'nos' {
        switch (quantity?.toLowerCase()) {
            case 'kgs':
                return 'kgs';
            case 'nos':
                return 'nos';
            default:
                throw new Error('Invalid UoM');
        }
    }

    static async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        return response.json();
    }

    protected static async fetchWithError(
        url: string,
        options?: RequestInit
    ): Promise<Response> {
        const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...(options?.headers || {}),
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        return response;
    }

    protected static getHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }
} 