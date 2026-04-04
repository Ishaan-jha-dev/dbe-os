import { create } from 'zustand';
import { getFarmState, updateTomatoes, spendTomatoesAction, waterPlotAction, unlockPlotAction } from '@/actions/farm';

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
  isInitialized: boolean;
  totalTomatoesEarned: number;
  tomatoesBalance: number;
  streak: number;
  farmName: string;
  plots: Plot[];
  
  // Actions
  fetchFarmData: () => Promise<void>;
  earnTomatoes: (amount: number, plotId?: string) => void;
  spendTomatoes: (amount: number) => Promise<boolean>;
  waterPlot: (plotId: string) => void;
  unlockPlot: (subject: string) => Promise<void>;
}

export const useFarmStore = create<FarmState>()((set, get) => ({
  isInitialized: false,
  totalTomatoesEarned: 0,
  tomatoesBalance: 0,
  streak: 1,
  farmName: "My Initial Farm",
  plots: [],
  
  fetchFarmData: async () => {
    try {
      const data = await getFarmState();
      set({
        isInitialized: true,
        totalTomatoesEarned: data.totalTomatoesEarned,
        tomatoesBalance: data.tomatoesBalance,
        streak: data.streak,
        farmName: data.farmName,
        plots: data.plots
      });
    } catch (e) {
      console.error("Failed to fetch farm state", e);
    }
  },

  earnTomatoes: (amount, plotId) => {
    // Optimistic Update
    set((state) => {
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
    });

    // Background Sync
    updateTomatoes(amount, plotId).catch(console.error);
  },
  
  spendTomatoes: async (amount) => {
    const { tomatoesBalance } = get();
    if (tomatoesBalance >= amount) {
      // Optimistic
      set({ tomatoesBalance: tomatoesBalance - amount });
      
      const success = await spendTomatoesAction(amount);
      if (!success) { // Revert if server fails
        set({ tomatoesBalance: tomatoesBalance });
        return false;
      }
      return true;
    }
    return false;
  },
  
  waterPlot: (plotId) => {
    // Optimistic
    set((state) => ({
      plots: state.plots.map(p => 
        p.id === plotId ? { ...p, healthPct: 100, lastWateredAt: new Date().toISOString() } : p
      )
    }));

    // Background Sync
    waterPlotAction(plotId).catch(console.error);
  },
  
  unlockPlot: async (subject) => {
    try {
      // We must wait for server so we get the accurate Prisma ID
      const newPlot = await unlockPlotAction(subject);
      set((state) => ({
        plots: [...state.plots, newPlot]
      }));
    } catch (e) {
      console.error("Failed to unlock plot", e);
    }
  }
}));
