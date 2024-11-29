export type PendingItem = {
  id: string;
  title: string;
  type: 'items' | 'processes' | 'bom' | 'processSteps';
  description: string;
  dependencies?: string[];
  path: string;
};

export type PendingItemsByType = {
  [K in PendingItem['type']]: PendingItem[];
};
