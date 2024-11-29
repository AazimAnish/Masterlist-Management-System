import { NavItem } from '@/types/navigation';
import { 
  Package, 
  Cog, 
  GitBranch, 
  ListChecks 
} from 'lucide-react';

export const setupSteps: NavItem[] = [
  {
    title: 'Items',
    path: '/items',
    icon: Package,
    progress: 0,
    isComplete: false,
  },
  {
    title: 'Processes',
    path: '/processes',
    icon: Cog,
    progress: 0,
    isComplete: false,
  },
  {
    title: 'Bill of Materials',
    path: '/bom',
    icon: GitBranch,
    progress: 0,
    isComplete: false,
  },
  {
    title: 'Process Steps',
    path: '/process-steps',
    icon: ListChecks,
    progress: 0,
    isComplete: false,
  },
];
