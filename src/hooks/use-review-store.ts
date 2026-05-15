import { create } from 'zustand';
import type { Pin, DocumentSession } from '@shared/types';
type Mode = 'setup' | 'review';
interface ReviewState {
  session: DocumentSession | null;
  mode: Mode;
  activePinIndex: number | null;
  isZooming: boolean;
  // Actions
  setSession: (session: DocumentSession) => void;
  setMode: (mode: Mode) => void;
  setActivePinIndex: (index: number | null) => void;
  addPin: (pin: Pin) => void;
  nextPin: () => void;
  prevPin: () => void;
  setIsZooming: (zooming: boolean) => void;
}
export const useReviewStore = create<ReviewState>((set) => ({
  session: null,
  mode: 'review',
  activePinIndex: null,
  isZooming: false,
  setSession: (session) => set({ session }),
  setMode: (mode) => set({ mode, activePinIndex: mode === 'review' ? 0 : null }),
  setActivePinIndex: (index) => set({ activePinIndex: index }),
  setIsZooming: (zooming) => set({ isZooming: zooming }),
  addPin: (pin) => set((state) => {
    if (!state.session) return state;
    return {
      session: {
        ...state.session,
        pins: [...state.session.pins, pin]
      }
    };
  }),
  nextPin: () => set((state) => {
    if (!state.session || state.activePinIndex === null) return state;
    const nextIndex = Math.min(state.activePinIndex + 1, state.session.pins.length - 1);
    return { activePinIndex: nextIndex };
  }),
  prevPin: () => set((state) => {
    if (!state.session || state.activePinIndex === null) return state;
    const prevIndex = Math.max(state.activePinIndex - 1, 0);
    return { activePinIndex: prevIndex };
  }),
}));