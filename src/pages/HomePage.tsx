import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, FileText, ArrowRight, Sparkles, Clock, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import type { DocumentSession } from '@shared/types';
export function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const { data: sessionsResponse, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api<{ items: DocumentSession[] }>('/api/sessions')
  });
  const sessions = sessionsResponse?.items ?? [];
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/sessions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success("Review deleted");
    }
  });
  const handleQuickUpload = async () => {
    setIsUploading(true);
    try {
      const res = await api<DocumentSession>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          title: "New Review Session",
          documentUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=2000",
          creatorId: "user-1"
        })
      });
      toast.success("Document uploaded!");
      navigate(`/review/${res.id}`);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <AppLayout container={false} className="bg-zinc-50 dark:bg-[#09090b] min-h-screen">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="space-y-12">
          <section className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium animate-fade-in">
              <Sparkles className="w-3 h-3" />
              Precision Feedback & Document Guided Tours
            </div>
            <div className="flex justify-center gap-2">
               <Button variant="ghost" className="text-xs h-7 text-muted-foreground hover:text-indigo-500" onClick={() => navigate('/join')}>
                 Have a code? Join Session
               </Button>
               <span className="text-zinc-300 dark:text-zinc-800 select-none">•</span>
               <span className="text-xs text-muted-foreground flex items-center h-7 px-2">Codenamed Access Enabled</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground">
              Feedback that <br />
              <span className="text-indigo-600">Actually Matters.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Turn complex technical drawings and roadmap documents into interactive guided tours.
            </p>
            <div
              onClick={handleQuickUpload}
              className="mt-12 group relative max-w-xl mx-auto cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
              <div className="relative flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all hover:border-indigo-400">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Upload New Document</h3>
                <p className="text-sm text-muted-foreground">Click to start a review session</p>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                )}
              </div>
            </div>
          </section>
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Recent Sessions
              </h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : sessions.length === 0 ? (
              <Card className="p-12 text-center border-dashed bg-transparent">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No reviews yet</h3>
                <p className="text-sm text-muted-foreground mb-6">Upload your first document or join an existing session with a code.</p>
                <div className="flex items-center justify-center gap-4">
                  <Button onClick={handleQuickUpload} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Start Review
                  </Button>
                  <Button onClick={() => navigate('/join')} variant="ghost" className="gap-2">Join Session</Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((s) => (
                  <Card key={s.id} className="group overflow-hidden border-border bg-card hover:shadow-lg transition-all flex flex-col">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                       <img src={s.documentUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt="" />
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(s.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-semibold text-card-foreground truncate">{s.title}</h4>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                          <span>{s.pins?.length || 0} Pins • {s.pins?.reduce((acc, p) => acc + p.comments.length, 0)} Comments</span>
                          <span>{formatDistanceToNow(s.createdAt)} ago</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate(`/review/${s.id}`)}
                        variant="secondary"
                        className="w-full group-hover:bg-indigo-600 group-hover:text-white transition-colors h-9"
                      >
                        Open Review
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}