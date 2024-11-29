import { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  path: string;
  icon: LucideIcon;
  progress: number;
  isComplete: boolean;
};

export type SetupProgress = {
  items: number;
  processes: number;
  bom: number;
  processSteps: number;
};
