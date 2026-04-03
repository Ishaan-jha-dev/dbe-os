import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Plot {
  id: string;
  subject: string;
  treeStage: number; // 1-5
  healthPct: number; // 0-100
  lastWateredAt: string;
  tomatoesFromPlot: number;
  treeSkin: string;
}

export interface FarmState {
  totalTomatoesEarned: number;
  tomatoesBalance: number;
  streak: number;
  farmName: string;
  plots: Plot[];
  
  // Actions
  earnTomatoes: (amount: number, plotId?: string) => void;
  spendTomatoes: (amount: number) => boolean;
  waterPlot: (plotId: string) => void;
  unlockPlot: (subject: string) => void;
}

export const useFarmStore = create<FarmState>()(
  persist(
    (set, get) => ({
      totalTomatoesEarned: 0,
      tomatoesBalance: 0,
      streak: 1,
      farmName: "My Initial Farm",
      plots: [
        {
          id: "plot_general",
          subject: "General",
          treeStage: 1,
          healthPct: 100,
          lastWateredAt: new Date().toISOString(),
          tomatoesFromPlot: 0,
          treeSkin: "default"
        }
      ],
      
      earnTomatoes: (amount, plotId) => set((state) => {
        let updatedPlots = state.plots;
        if (plotId) {
          updatedPlots = state.plots.map(p => 
            p.id === plotId ? { ...p, tomatoesFromPlot: p.tomatoesFromPlot + amount, healthPct: Math.min(100, p.healthPct + 20) } : p
          );
        }
        return {
          totalTomatoesEarned: state.totalTomatoesEarned + amount,
          tomatoesBalance: state.tomatoesBalance + amount,
          plots: updatedPlots
        };
      }),
      
      spendTomatoes: (amount) => {
        const { tomatoesBalance } = get();
        if (tomatoesBalance >= amount) {
          set({ tomatoesBalance: tomatoesBalance - amount });
          return true;
        }
        return false;
      },
      
      waterPlot: (plotId) => set((state) => ({
        plots: state.plots.map(p => 
          p.id === plotId ? { ...p, healthPct: 100, lastWateredAt: new Date().toISOString() } : p
        )
      })),
      
      unlockPlot: (subject) => set((state) => ({
        plots: [...state.plots, {
          id: `plot_${subject.toLowerCase()}`,
          subject,
          treeStage: 1,
          healthPct: 100,
          lastWateredAt: new Date().toISOString(),
          tomatoesFromPlot: 0,
          treeSkin: "default"
        }]
      }))
    }),
    {
      name: 'dbe-farm-storage',
    }
  )
);
