// store/useCounterStore.ts
import { create } from 'zustand';


export const useCounterStore = create((set) => ({
  hydration : false,
  setHydration: (value) => set({hydration : value}),
 
}));
