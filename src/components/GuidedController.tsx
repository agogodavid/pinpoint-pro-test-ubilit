import React from 'react';
import { ChevronLeft, ChevronRight, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReviewStore } from '@/hooks/use-review-store';
import { cn } from '@/lib/utils';
export function GuidedController() {
  const mode = useReviewStore(s => s.mode);
  const setMode = useReviewStore(s => s.setMode);
  const session = useReviewStore(s => s.session);
  const activePinIndex = useReviewStore(s => s.activePinIndex);
  const setActivePinIndex = useReviewStore(s => s.setActivePinIndex);
  const nextPin = useReviewStore(s => s.nextPin);
  const prevPin = useReviewStore(s => s.prevPin);
  if (!session) return null;
  const pinCount = session.pins.length;
  const handleAutoFocus = () => {
    if (pinCount > 0) {
      const targetIndex = activePinIndex ?? 0;
      setActivePinIndex(null); // Force a reset to trigger the useEffect in Canvas
      setTimeout(() => setActivePinIndex(targetIndex), 10);
    }
  };
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full shadow-2xl px-2 py-2 flex items-center gap-1 sm:gap-4">
        {/* Mode Switcher */}
        <div className="flex bg-zinc-800 rounded-full p-1 mr-2">
          <button
            onClick={() => setMode('review')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
              mode === 'review' ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Review
          </button>
          <button
            onClick={() => setMode('setup')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
              mode === 'setup' ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Setup
          </button>
        </div>
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevPin}
            disabled={pinCount === 0 || activePinIndex === 0}
            className="rounded-full text-zinc-400 hover:text-white h-8 w-8"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-[80px] text-center">
            <span className="text-sm font-mono text-zinc-100">
              {pinCount > 0 ? (activePinIndex ?? 0) + 1 : 0}
              <span className="text-zinc-500 mx-1">/</span>
              {pinCount}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextPin}
            disabled={pinCount === 0 || activePinIndex === pinCount - 1}
            className="rounded-full text-zinc-400 hover:text-white h-8 w-8"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="w-px h-6 bg-zinc-800 mx-1" />
        <Button
          variant="default"
          size="sm"
          onClick={handleAutoFocus}
          className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white gap-2 px-4 h-8"
        >
          <Focus className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Auto-Focus</span>
        </Button>
      </div>
    </div>
  );
}