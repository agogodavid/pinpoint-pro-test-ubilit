import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReviewCanvas } from '@/components/ReviewCanvas';
import { GuidedController } from '@/components/GuidedController';
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
      <header className="h-16 flex items-center justify-between px-6 bg-zinc-900/50 border-b border-zinc-800">
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
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>
      {/* Main Canvas Area */}
      <main className="relative p-6 h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        {session && (
          <ReviewCanvas 
            documentUrl={session.documentUrl} 
            onPinAdd={handleAddPin}
          />
        )}
        <GuidedController />
      </main>
    </AppLayout>
  );
}