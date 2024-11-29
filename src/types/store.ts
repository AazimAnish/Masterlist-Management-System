import { SetupProgress } from './navigation';

export interface SetupStore {
  progress: SetupProgress;
  updateProgress: (step: keyof SetupProgress, value: number) => void;
  resetProgress: () => void;
}
