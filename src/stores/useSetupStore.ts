import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SetupProgress } from '@/types/navigation';
import { SetupStore } from '@/types/store';

const initialProgress: SetupProgress = {
  items: 0,
  processes: 0,
  bom: 0,
  processSteps: 0,
};

export const useSetupStore = create<SetupStore>()(
  persist(
    (set) => ({
      progress: initialProgress,
      updateProgress: (step, value) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [step]: value,
          },
        })),
      resetProgress: () => set({ progress: initialProgress }),
    }),
    {
      name: 'setup-progress',
    }
  )
);
