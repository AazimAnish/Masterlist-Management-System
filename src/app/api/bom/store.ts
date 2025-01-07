import { BOMEntry } from '@/types/bom';

// Create a singleton store for BOM entries
declare global {
  var __boms: BOMEntry[];
}

// Initialize with sample data
if (!global.__boms) {
  global.__boms = [
    {
      id: '1',
      item_id: '1',
      component_id: '2',
      quantity: 10,
      created_by: 'system_user',
      last_updated_by: 'system_user',
      createdAt: '2024-02-01T12:00:00Z',
      updatedAt: '2024-02-01T12:00:00Z'
    },
    {
      id: '2',
      item_id: '1',
      component_id: '3',
      quantity: 5,
      created_by: 'system_user',
      last_updated_by: 'system_user',
      createdAt: '2024-02-01T12:05:00Z',
      updatedAt: '2024-02-01T12:05:00Z'
    },
    {
      id: '3',
      item_id: '3',
      component_id: '2',
      quantity: 2,
      created_by: 'system_user',
      last_updated_by: 'system_user',
      createdAt: '2024-02-01T12:10:00Z',
      updatedAt: '2024-02-01T12:10:00Z'
    },
    {
      id: '4',
      item_id: '4',
      component_id: '2',
      quantity: 8,
      created_by: 'system_user',
      last_updated_by: 'system_user',
      createdAt: '2024-02-01T12:15:00Z',
      updatedAt: '2024-02-01T12:15:00Z'
    }
  ];
}

export const bomStore = {
  getBOMs: () => global.__boms,
  addBOM: (bom: BOMEntry) => {
    global.__boms.push(bom);
    return bom;
  },
  addBOMs: (boms: BOMEntry[]) => {
    global.__boms.push(...boms);
    return boms;
  },
  updateBOM: (id: string, data: Partial<BOMEntry>) => {
    const index = global.__boms.findIndex(bom => bom.id === id);
    if (index === -1) return null;
    
    global.__boms[index] = { ...global.__boms[index], ...data };
    return global.__boms[index];
  },
  deleteBOM: (id: string) => {
    const index = global.__boms.findIndex(bom => bom.id === id);
    if (index === -1) return false;
    
    global.__boms.splice(index, 1);
    return true;
  },
  findBOM: (id: string) => global.__boms.find(bom => bom.id === id),
}; 