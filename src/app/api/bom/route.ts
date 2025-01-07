import { NextRequest, NextResponse } from 'next/server';
import { bomStore } from './store';
import { BOMEntry } from '@/types/bom';

export async function GET() {
  try {
    const boms = bomStore.getBOMs();
    return NextResponse.json(boms);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch BOMs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const newBOM: BOMEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      created_by: data.created_by || 'system_user',
      last_updated_by: data.last_updated_by || 'system_user',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };

    const bom = bomStore.addBOM(newBOM);
    return NextResponse.json(bom, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create BOM' },
      { status: 500 }
    );
  }
} 