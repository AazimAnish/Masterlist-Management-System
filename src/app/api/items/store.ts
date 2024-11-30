import { Item } from '@/types/item';

// Create a singleton store for items
declare global {
  var __items: Item[];
}

if (!global.__items) {
  global.__items = [];
}

export const itemStore = {
  getItems: () => global.__items,
  addItem: (item: Item) => {
    global.__items.push(item);
    return item;
  },
  updateItem: (id: string, data: Partial<Item>) => {
    const index = global.__items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    global.__items[index] = { ...global.__items[index], ...data };
    return global.__items[index];
  },
  deleteItem: (id: string) => {
    const index = global.__items.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    global.__items[index] = {
      ...global.__items[index],
      is_deleted: true,
      updatedAt: new Date().toISOString(),
    };
    return true;
  },
  findItem: (id: string) => global.__items.find(item => item.id === id),
}; 