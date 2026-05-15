import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useReviewStore } from '@/hooks/use-review-store';
import { cn } from '@/lib/utils';
import type { Pin } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
interface ReviewCanvasProps {
  documentUrl: string;
  onPinAdd?: (pin: Pin) => void;
}
export function ReviewCanvas({ documentUrl, onPinAdd }: ReviewCanvasProps) {
  const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, pctX: 0, pctY: 0 });
  // Strictly primitive selectors
  const mode = useReviewStore(s => s.mode);
  const session = useReviewStore(s => s.session);
  const setSession = useReviewStore(s => s.setSession);
  const activePinIndex = useReviewStore(s => s.activePinIndex);
  const setActivePinIndex = useReviewStore(s => s.setActivePinIndex);
  const setSelectedPinId = useReviewStore(s => s.setSelectedPinId);
  const isAutoScrolling = useReviewStore(s => s.isAutoScrolling);
  const pins = useMemo(() => session?.pins ?? [], [session?.pins]);
  const centerOnPin = useCallback((pin: Pin, index: number) => {
    if (!transformComponentRef.current) return;
    const { setTransform } = transformComponentRef.current;
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
  useEffect(() => {
    if (activePinIndex !== null && pins[activePinIndex]) {
      centerOnPin(pins[activePinIndex], activePinIndex);
    }
  }, [activePinIndex, pins, centerOnPin]);
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'setup') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: e.clientX, y: e.clientY, pctX, pctY });
  };
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'setup' || isAutoScrolling) return;
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
  const handleDeletePin = async (e: React.MouseEvent, pinId: string) => {
    e.stopPropagation();
    if (!session) return;
    try {
      const updatedPins = session.pins.filter(p => p.id !== pinId);
      await api(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ pins: updatedPins })
      });
      setSession({ ...session, pins: updatedPins });
      setSelectedPinId(null);
      setActivePinIndex(null);
      toast.success("Pin removed");
    } catch (err) {
      toast.error("Failed to delete pin");
    }
  };
  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden rounded-xl border border-zinc-800">
      <TransformWrapper
        ref={transformComponentRef}
        initialScale={1}
        minScale={0.2}
        maxScale={8}
        centerOnInit
        disabled={isAutoScrolling}
      >
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full !h-full flex items-center justify-center"
        >
          <div
            className={cn(
              "relative group flex items-center justify-center",
              mode === 'setup' ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
            )}
            onMouseMove={handleCanvasMouseMove}
            onClick={handleCanvasClick}
            style={{ width: '100%', height: '100%' }}
          >
            <img
              src={documentUrl}
              alt="Review Document"
              className="max-w-full max-h-full object-contain pointer-events-none select-none shadow-2xl"
            />
            <div className="absolute inset-0 pointer-events-none">
              <AnimatePresence>
                {pins.map((pin, idx) => (
                  <motion.div
                    key={pin.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: activePinIndex === idx ? 1.25 : 1,
                      opacity: 1,
                      left: `${pin.x}%`,
                      top: `${pin.y}%`
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer",
                      activePinIndex === idx ? "z-20" : "z-10"
                    )}
                    onMouseEnter={() => setHoveredPin(pin.id)}
                    onMouseLeave={() => setHoveredPin(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      centerOnPin(pin, idx);
                    }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                      activePinIndex === idx
                        ? "bg-indigo-600 border-white shadow-[0_0_20px_rgba(79,70,229,0.8)]"
                        : "bg-white border-indigo-600 hover:scale-110 shadow-sm"
                    )}>
                      {activePinIndex === idx && (
                        <motion.div
                          layoutId="pulse"
                          className="absolute inset-0 rounded-full bg-indigo-400 opacity-20"
                          animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      )}
                      {mode === 'setup' ? (
                        <span className={cn("text-[10px] font-bold relative z-10", activePinIndex === idx ? "text-white" : "text-indigo-600")}>
                          {idx + 1}
                        </span>
                      ) : (
                        <MapPin className={cn("w-4 h-4 relative z-10", activePinIndex === idx ? "text-white" : "text-indigo-600")} />
                      )}
                    </div>
                    <AnimatePresence>
                      {mode === 'setup' && (hoveredPin === pin.id || activePinIndex === idx) && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          onClick={(e) => handleDeletePin(e, pin.id)}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 p-1 bg-red-600 text-white rounded-md shadow-lg hover:bg-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
      <AnimatePresence>
        {mode === 'setup' && (
          <>
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-700 text-xs text-zinc-300 flex items-center gap-2 shadow-2xl z-10"
            >
              <Plus className="w-3 h-3 text-indigo-400" />
              Click to drop a pin
            </motion.div>
            <motion.div
              className="fixed pointer-events-none z-[100] px-2 py-1 bg-indigo-600/90 text-white text-[10px] font-mono rounded shadow-xl"
              style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
            >
              X:{mousePos.pctX.toFixed(1)}% Y:{mousePos.pctY.toFixed(1)}%
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}