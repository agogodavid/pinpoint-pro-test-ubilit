import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, MoreHorizontal, LayoutList, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReviewCanvas } from '@/components/ReviewCanvas';
import { GuidedController } from '@/components/GuidedController';
import { PinFeedbackPopover } from '@/components/PinFeedbackPopover';
import { useReviewStore } from '@/hooks/use-review-store';
import { api } from '@/lib/api-client';
import type { DocumentSession, Pin } from '@shared/types';
import { toast } from 'sonner';
export function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const session = useReviewStore(s => s.session);
  const setSession = useReviewStore(s => s.setSession);
  const addPinToStore = useReviewStore(s => s.addPin);
  const selectedPinId = useReviewStore(s => s.selectedPinId);
  const setSelectedPinId = useReviewStore(s => s.setSelectedPinId);
  const activePinIndex = useReviewStore(s => s.activePinIndex);
  const setActivePinIndex = useReviewStore(s => s.setActivePinIndex);
  useEffect(() => {
    async function loadSession() {
      if (!id) return;
      try {
        const data = await api<DocumentSession>(`/api/sessions/${id}`);
        setSession(data);
      } catch (err) {
        toast.error("Failed to load session");
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [id, setSession, navigate]);
  const handleAddPin = async (pin: Pin) => {
    if (!id) return;
    try {
      await api(`/api/sessions/${id}/pins`, {
        method: 'POST',
        body: JSON.stringify(pin)
      });
      addPinToStore(pin);
      toast.success("Pin placed");
    } catch (err) {
      toast.error("Failed to save pin");
    }
  };
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }
  return (
    <AppLayout container={false} className="h-screen bg-zinc-950 overflow-hidden">
      {/* Header Bar */}
      <header className="h-16 flex items-center justify-between px-6 bg-zinc-900/50 border-b border-zinc-800 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-4 w-px bg-zinc-800" />
          <h1 className="text-sm font-semibold text-zinc-100 max-w-[200px] truncate">
            {session?.title || "Untitled Review"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-2">
                <LayoutList className="w-4 h-4" />
                Index
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[350px] bg-zinc-950 border-zinc-800 p-0">
              <SheetHeader className="p-6 border-b border-zinc-800">
                <SheetTitle className="text-zinc-100">Review Summary</SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-4">
                {session?.pins.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => setActivePinIndex(idx)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      activePinIndex === idx 
                        ? 'bg-indigo-600/10 border-indigo-500 shadow-glow shadow-indigo-500/20' 
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Pin #{idx + 1}</span>
                      <span className="text-[10px] text-zinc-500">{p.comments.length} comments</span>
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-1">{p.prompt || "No prompt description available."}</p>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>
      {/* Main Content Area */}
      <div className="relative flex h-[calc(100vh-64px)] w-full overflow-hidden">
        <main className="relative flex-1 p-6 flex flex-col items-center justify-center">
          {session && (
            <ReviewCanvas
              documentUrl={session.documentUrl}
              onPinAdd={handleAddPin}
            />
          )}
          <GuidedController />
        </main>
        {/* Selected Pin Side Panel */}
        {selectedPinId && (
          <aside className="w-[350px] bg-zinc-900/50 border-l border-zinc-800 flex flex-col relative z-40">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-zinc-500 hover:text-white z-50"
              onClick={() => setSelectedPinId(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <PinFeedbackPopover />
          </aside>
        )}
      </div>
    </AppLayout>
  );
}