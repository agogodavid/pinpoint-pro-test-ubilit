import React from 'react';
import { ChevronLeft, ChevronRight, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReviewStore } from '@/hooks/use-review-store';
import { cn } from '@/lib/utils';
export function GuidedController() {
  // Strictly primitive selectors
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
      setActivePinIndex(null); 
      setTimeout(() => setActivePinIndex(targetIndex), 10);
    }
  };
  return (
    <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto">
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full shadow-2xl px-1.5 py-1.5 sm:px-3 sm:py-2 flex items-center justify-between sm:justify-start gap-1 sm:gap-4">
        {/* Mode Switcher */}
        <div className="flex bg-zinc-800/50 rounded-full p-1 shrink-0">
          <button
            onClick={() => setMode('review')}
            className={cn(
              "px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all",
              mode === 'review' ? "bg-indigo-600 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Review
          </button>
          <button
            onClick={() => setMode('setup')}
            className={cn(
              "px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all",
              mode === 'setup' ? "bg-indigo-600 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Setup
          </button>
        </div>
        {/* Navigation Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevPin}
            disabled={pinCount === 0 || activePinIndex === 0}
            className="rounded-full text-zinc-400 hover:text-white h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-[50px] sm:min-w-[80px] text-center">
            <span className="text-[10px] sm:text-sm font-mono text-zinc-100">
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
            className="rounded-full text-zinc-400 hover:text-white h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
        <div className="hidden sm:block w-px h-6 bg-zinc-800 mx-1" />
        <Button
          variant="default"
          size="sm"
          onClick={handleAutoFocus}
          className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white gap-2 px-3 sm:px-4 h-7 sm:h-8"
        >
          <Focus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden md:inline text-[10px] sm:text-xs">Focus</span>
        </Button>
      </div>
    </div>
  );
}