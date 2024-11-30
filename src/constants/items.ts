export const ITEM_TYPES = ['sell', 'purchase', 'component'] as const;
export const UOM_TYPES = ['kgs', 'nos'] as const;

export type ItemType = (typeof ITEM_TYPES)[number];
export type UoMType = (typeof UOM_TYPES)[number]; 