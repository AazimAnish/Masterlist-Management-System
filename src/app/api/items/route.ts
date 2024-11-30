import { NextRequest, NextResponse } from 'next/server';
import { Item, ItemFormData } from '@/types/item';
import { itemStore } from './store';

export async function GET() {
  try {
    const items = itemStore.getItems().filter(item => !item.is_deleted);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ItemFormData = await request.json();

    if (!data.internal_item_name || !data.type || !data.uom) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      tenant_id: 1,
      created_by: 'current_user',
      last_updated_by: 'current_user',
      is_deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const item = itemStore.addItem(newItem);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create item' },
      { status: 500 }
    );
  }
} 