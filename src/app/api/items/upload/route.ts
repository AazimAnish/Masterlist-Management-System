import { NextRequest, NextResponse } from 'next/server';
import { Item } from '@/types/item';
import { CSVError } from '@/types/csv';
import { itemStore } from '../store';

export async function POST(request: NextRequest) {
    try {
        const items = await request.json();
        
        if (!Array.isArray(items)) {
            return NextResponse.json(
                { message: 'Invalid data format' },
                { status: 400 }
            );
        }

        const errors: CSVError[] = [];
        const validItems: Item[] = [];
        const existingItems = itemStore.getItems();

        for (const [index, item] of items.entries()) {
            try {
                // Check for unique internal_item_name + tenant combination
                const isDuplicate = existingItems.some(
                    existing => 
                        existing.internal_item_name === item.internal_item_name &&
                        existing.tenant_id === item.tenant_id &&
                        !existing.is_deleted
                );

                if (isDuplicate) {
                    errors.push({
                        row: index + 1,
                        message: `Duplicate internal_item_name for tenant ${item.tenant_id}`,
                        field: 'internal_item_name'
                    });
                    continue;
                }

                // Validate required fields
                if (!item.internal_item_name || !item.type || !item.uom) {
                    errors.push({
                        row: index + 1,
                        message: 'Missing required fields',
                        field: 'required_fields'
                    });
                    continue;
                }

                // Validate scrap_type for sell items
                if (item.type === 'sell' && !item.additional_attributes?.scrap_type) {
                    errors.push({
                        row: index + 1,
                        message: 'Scrap type is required for sell items',
                        field: 'scrap_type'
                    });
                    continue;
                }

                // Validate min_buffer for sell and purchase items
                if ((item.type === 'sell' || item.type === 'purchase') && item.min_buffer === null) {
                    errors.push({
                        row: index + 1,
                        message: 'Min buffer is required for sell and purchase items',
                        field: 'min_buffer'
                    });
                    continue;
                }

                // Validate max_buffer >= min_buffer
                if (item.max_buffer !== null && item.min_buffer !== null && item.max_buffer < item.min_buffer) {
                    errors.push({
                        row: index + 1,
                        message: 'Max buffer must be greater than or equal to min buffer',
                        field: 'max_buffer'
                    });
                    continue;
                }

                // Create valid item with system-generated fields
                validItems.push({
                    ...item,
                    id: crypto.randomUUID(),
                    tenant_id: item.tenant_id || 1,
                    created_by: 'system_user',
                    last_updated_by: 'system_user',
                    is_deleted: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    min_buffer: item.min_buffer ?? 0,
                    max_buffer: item.max_buffer ?? 0,
                });
            } catch (error) {
                errors.push({
                    row: index + 1,
                    message: error instanceof Error ? error.message : 'Invalid item data'
                });
            }
        }

        if (errors.length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        // Store the valid items
        const savedItems = itemStore.addItems(validItems);
        
        return NextResponse.json(savedItems);
    } catch (error) {
        console.error('Error processing items:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 