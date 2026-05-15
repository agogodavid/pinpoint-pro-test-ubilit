import { create } from 'zustand';
import type { Pin, DocumentSession } from '@shared/types';
import { toast } from 'sonner';
type Mode = 'setup' | 'review';
interface ReviewState {
  session: DocumentSession | null;
  mode: Mode;
  activePinIndex: number | null;
  selectedPinId: string | null;
  reviewerName: string | null;
  isZooming: boolean;
  isAutoScrolling: boolean;
  // Actions
  setSession: (session: DocumentSession) => void;
  setMode: (mode: Mode) => void;
  setActivePinIndex: (index: number | null) => void;
  setSelectedPinId: (id: string | null) => void;
  setReviewerName: (name: string | null) => void;
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
  reviewerName: null,
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
  setReviewerName: (name) => set({ reviewerName: name }),
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
    if (state.activePinIndex >= state.session.pins.length - 1) {
      toast.info("End of review tour");
      return state;
    }
    const nextIndex = state.activePinIndex + 1;
    setTimeout(() => set({ isAutoScrolling: false }), 600);
    return {
      activePinIndex: nextIndex,
      selectedPinId: state.session.pins[nextIndex].id,
      isAutoScrolling: true
    };
  }),
  prevPin: () => set((state) => {
    if (!state.session || state.activePinIndex === null) return state;
    if (state.activePinIndex <= 0) {
      toast.info("Start of review tour");
      return state;
    }
    const prevIndex = state.activePinIndex - 1;
    setTimeout(() => set({ isAutoScrolling: false }), 600);
    return {
      activePinIndex: prevIndex,
      selectedPinId: state.session.pins[prevIndex].id,
      isAutoScrolling: true
    };
  }),
}));