import React, { useRef, useCallback, useEffect } from 'react';
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
  const setSelectedPinId = useReviewStore(s => s.setSelectedPinId);
  const pins = session?.pins ?? [];
  const centerOnPin = useCallback((pin: Pin, index: number) => {
    if (!transformComponentRef.current) return;
    const { setTransform } = transformComponentRef.current;
    // Calculate transform to center the pin (pin coordinates are 0-100%)
    // We target a specific scale and then adjust x/y to center the percentage point
    const zoomLevel = 2.5;
    const wrapper = transformComponentRef.current.instance.wrapperComponent;
    if (!wrapper) return;
    const { clientWidth, clientHeight } = wrapper;
    const targetX = (clientWidth / 2) - (pin.x / 100 * clientWidth * zoomLevel);
    const targetY = (clientHeight / 2) - (pin.y / 100 * clientHeight * zoomLevel);
    setTransform(targetX, targetY, zoomLevel, 600, "easeOut");
    setActivePinIndex(index);
    setSelectedPinId(pin.id);
  }, [setActivePinIndex, setSelectedPinId]);
  // Sync zoom when activePinIndex changes externally
  useEffect(() => {
    if (activePinIndex !== null && pins[activePinIndex]) {
      centerOnPin(pins[activePinIndex], activePinIndex);
    }
  }, [activePinIndex, pins, centerOnPin]);
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
  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden rounded-xl border border-zinc-800">
      <TransformWrapper
        ref={transformComponentRef}
        initialScale={1}
        minScale={0.2}
        maxScale={8}
        centerOnInit
      >
        <TransformComponent 
          wrapperClass="!w-full !h-full" 
          contentClass="!w-full !h-full flex items-center justify-center"
        >
          <div
            className="relative cursor-crosshair group flex items-center justify-center"
            onClick={handleCanvasClick}
            style={{ width: '100%', height: '100%' }}
          >
            <img
              src={documentUrl}
              alt="Review Document"
              className="max-w-full max-h-full object-contain pointer-events-none select-none shadow-2xl"
            />
            {/* Pins Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <AnimatePresence>
                {pins.map((pin, idx) => (
                  <motion.div
                    key={pin.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      left: `${pin.x}%`,
                      top: `${pin.y}%`
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer",
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
                        ? "bg-indigo-600 border-white scale-125 shadow-glow shadow-indigo-500/50"
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