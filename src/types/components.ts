import { NavItem } from "./navigation";
import { PendingItemsByType } from "./pending";

export interface ProgressIndicatorProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface SidebarNavItemProps {
  item: NavItem;
  isDisabled?: boolean;
}

export interface PendingItemsProps {
  items: PendingItemsByType;
}
