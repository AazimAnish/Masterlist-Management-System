import { NextRequest, NextResponse } from 'next/server';
import { itemStore } from '../store';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = itemStore.findItem(params.id);
    
    if (!item || item.is_deleted) {
      return NextResponse.json(
        { message: `Item with ID ${params.id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = itemStore.deleteItem(params.id);
    
    if (!success) {
      return NextResponse.json(
        { message: `Item with ID ${params.id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Item deleted successfully',
      id: params.id
    });
  } catch (error) {
    return NextResponse.json(
      { message: `Failed to delete item with ID ${params.id}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const updatedItem = itemStore.updateItem(params.id, {
      ...data,
      last_updated_by: 'current_user',
      updatedAt: new Date().toISOString(),
    });

    if (!updatedItem) {
      return NextResponse.json(
        { message: `Item with ID ${params.id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update item' },
      { status: 500 }
    );
  }
}