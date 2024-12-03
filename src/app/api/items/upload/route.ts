import { NextRequest, NextResponse } from 'next/server';
import { Item } from '@/types/item';
import { CSVError } from '@/types/csv';

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

        items.forEach((item, index) => {
            try {
                // Validate required fields
                if (!item.internal_item_name || !item.type || !item.uom) {
                    errors.push({
                        row: index + 1,
                        message: 'Missing required fields'
                    });
                    return;
                }

                // Create valid item
                validItems.push({
                    ...item,
                    id: crypto.randomUUID(),
                    tenant_id: 1,
                    created_by: item.created_by || 'current_user',
                    last_updated_by: item.last_updated_by || 'current_user',
                    is_deleted: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                errors.push({
                    row: index + 1,
                    message: error instanceof Error ? error.message : 'Invalid item data'
                });
            }
        });

        if (errors.length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        return NextResponse.json(validItems);
    } catch (error) {
        console.error('Error processing items:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 