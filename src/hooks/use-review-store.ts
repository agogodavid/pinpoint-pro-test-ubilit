import { create } from 'zustand';
import type { Pin, DocumentSession } from '@shared/types';
type Mode = 'setup' | 'review';
interface ReviewState {
  session: DocumentSession | null;
  mode: Mode;
  activePinIndex: number | null;
  selectedPinId: number | string | null;
  isZooming: boolean;
  isAutoScrolling: boolean;
  // Actions
  setSession: (session: DocumentSession) => void;
  setMode: (mode: Mode) => void;
  setActivePinIndex: (index: number | null) => void;
  setSelectedPinId: (id: number | string | null) => void;
  addPin: (pin: Pin) => void;
  updatePin: (pinId: string, updates: Partial<Pin>) => void;
  nextPin: () => void;
  prevPin: () => void;
  setIsZooming: (zooming: boolean) => void;
  setIsAutoScrolling: (scrolling: boolean) => void;
}
export const useReviewStore = create<ReviewState>((set) => ({
  session: null,
  mode: 'review',
  activePinIndex: null,
  selectedPinId: null,
  isZooming: false,
  isAutoScrolling: false,
  setSession: (session) => set({ session }),
  setMode: (mode) => set({
    mode,
    activePinIndex: mode === 'review' ? 0 : null,
    selectedPinId: null
  }),
  setActivePinIndex: (index) => set({ activePinIndex: index }),
  setSelectedPinId: (id) => set({ selectedPinId: id }),
  setIsZooming: (zooming) => set({ isZooming: zooming }),
  setIsAutoScrolling: (scrolling) => set({ isAutoScrolling: scrolling }),
  addPin: (pin) => set((state) => {
    if (!state.session) return state;
    return {
      session: {
        ...state.session,
        pins: [...state.session.pins, pin]
      }
    };
  }),
  updatePin: (pinId, updates) => set((state) => {
    if (!state.session) return state;
    const newPins = state.session.pins.map(p =>
      p.id === pinId ? { ...p, ...updates } : p
    );
    return {
      session: { ...state.session, pins: newPins }
    };
  }),
  nextPin: () => set((state) => {
    if (!state.session || state.activePinIndex === null) return state;
    const nextIndex = Math.min(state.activePinIndex + 1, state.session.pins.length - 1);
    // Manage transition lock
    setTimeout(() => set({ isAutoScrolling: false }), 600);
    return { 
      activePinIndex: nextIndex, 
      selectedPinId: state.session.pins[nextIndex].id,
      isAutoScrolling: true
    };
  }),
  prevPin: () => set((state) => {
    if (!state.session || state.activePinIndex === null) return state;
    const prevIndex = Math.max(state.activePinIndex - 1, 0);
    setTimeout(() => set({ isAutoScrolling: false }), 600);
    return { 
      activePinIndex: prevIndex, 
      selectedPinId: state.session.pins[prevIndex].id,
      isAutoScrolling: true
    };
  }),
}));