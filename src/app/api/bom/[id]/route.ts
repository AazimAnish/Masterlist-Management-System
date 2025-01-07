import { NextRequest, NextResponse } from 'next/server';
import { bomStore } from '../store';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bom = bomStore.findBOM(params.id);
    
    if (!bom) {
      return NextResponse.json(
        { message: `BOM with ID ${params.id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(bom);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch BOM' },
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
    const updatedBOM = bomStore.updateBOM(params.id, {
      ...data,
      last_updated_by: 'system_user',
      updatedAt: new Date().toISOString(),
    });

    if (!updatedBOM) {
      return NextResponse.json(
        { message: `BOM with ID ${params.id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBOM);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update BOM' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = bomStore.deleteBOM(params.id);
    
    if (!success) {
      return NextResponse.json(
        { message: `BOM with ID ${params.id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'BOM deleted successfully',
      id: params.id 
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete BOM' },
      { status: 500 }
    );
  }
} 