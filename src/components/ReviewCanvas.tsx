import React, { useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus } from 'lucide-react';
import { useReviewStore } from '@/hooks/use-review-store';
import { cn } from '@/lib/utils';
import type { Pin } from '@shared/types';
interface ReviewCanvasProps {
  documentUrl: string;
  onPinAdd?: (pin: Pin) => void;
}
export function ReviewCanvas({ documentUrl, onPinAdd }: ReviewCanvasProps) {
  const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);
  const mode = useReviewStore(s => s.mode);
  const session = useReviewStore(s => s.session);
  const activePinIndex = useReviewStore(s => s.activePinIndex);
  const setActivePinIndex = useReviewStore(s => s.setActivePinIndex);
  const pins = session?.pins ?? [];
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'setup') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newPin: Pin = {
      id: crypto.randomUUID(),
      x,
      y,
      prompt: "New feedback point",
      reactions: { THUMBS_UP: 0, THUMBS_DOWN: 0, CONFUSED: 0, EYES: 0, CELEBRATE: 0 },
      comments: [],
      createdAt: Date.now(),
    };
    if (onPinAdd) onPinAdd(newPin);
  };
  const centerOnPin = useCallback((pin: Pin, index: number) => {
    if (!transformComponentRef.current) return;
    const { zoomIn, setTransform } = transformComponentRef.current;
    // Smoothly pan and zoom to the pin context
    // We approximate the zoom based on container size
    setTransform(
      -(pin.x * 5) + 200, // rudimentary centering logic for 2x zoom
      -(pin.y * 5) + 200,
      2,
      600,
      "easeOut"
    );
    setActivePinIndex(index);
  }, [setActivePinIndex]);
  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-zinc-950 overflow-hidden rounded-xl border border-zinc-800">
      <TransformWrapper
        ref={transformComponentRef}
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        disabled={false}
      >
        <TransformComponent wrapperClassName="!w-full !h-full" contentClassName="!w-full !h-full flex items-center justify-center">
          <div 
            className="relative cursor-crosshair group"
            onClick={handleCanvasClick}
          >
            <img 
              src={documentUrl} 
              alt="Review Document" 
              className="max-w-full max-h-full object-contain pointer-events-none select-none shadow-2xl"
            />
            {/* Pins Overlay */}
            <div className="absolute inset-0">
              <AnimatePresence>
                {pins.map((pin, idx) => (
                  <motion.div
                    key={pin.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      x: `${pin.x}%`,
                      y: `${pin.y}%` 
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer",
                      activePinIndex === idx ? "z-20" : "z-10"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      centerOnPin(pin, idx);
                    }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                      activePinIndex === idx 
                        ? "bg-indigo-600 border-white scale-125 shadow-glow" 
                        : "bg-white border-indigo-600 hover:scale-110 shadow-sm"
                    )}>
                      {mode === 'setup' ? (
                        <span className={cn("text-[10px] font-bold", activePinIndex === idx ? "text-white" : "text-indigo-600")}>
                          {idx + 1}
                        </span>
                      ) : (
                        <MapPin className={cn("w-4 h-4", activePinIndex === idx ? "text-white" : "text-indigo-600")} />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
      {mode === 'setup' && (
        <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-700 text-xs text-zinc-300 flex items-center gap-2">
          <Plus className="w-3 h-3 text-indigo-400" />
          Click anywhere to drop a pin
        </div>
      )}
    </div>
  );
}