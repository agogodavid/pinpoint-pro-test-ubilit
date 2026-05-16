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
    <AppLayout container={false} className="relative min-h-screen bg-gradient-to-br from-fuchsia-50 via-indigo-50 to-pink-50 dark:from-indigo-950 dark:via-purple-900 dark:to-fuchsia-950 overflow-hidden">
      {/* Decorative blurred background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-400/30 dark:bg-purple-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-400/30 dark:bg-pink-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-[500px] h-[500px] bg-indigo-400/30 dark:bg-indigo-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-blob animation-delay-4000"></div>

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="space-y-12">
          <section className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/10 text-fuchsia-700 dark:text-fuchsia-300 text-sm font-semibold shadow-sm backdrop-blur-md animate-fade-in hover:scale-105 transition-transform cursor-default">
              <Sparkles className="w-4 h-4 text-pink-500 dark:text-pink-400" />
              Precision Feedback & Document Guided Tours
            </div>
            <div className="flex justify-center gap-2 items-center">
               <Button variant="ghost" className="text-xs h-7 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-full px-4 backdrop-blur-sm" onClick={() => navigate('/join')}>
                 Have a code? Join Session
               </Button>
               <span className="text-indigo-300 dark:text-indigo-700 select-none">•</span>
               <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center h-7 px-2 font-medium">Codenamed Access Enabled</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              Updated locally <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient">
                Actually Matters.
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Turn complex technical drawings and roadmap documents into <span className="text-indigo-600 dark:text-indigo-400 font-semibold">interactive</span> guided tours.
            </p>
            <div
              onClick={handleQuickUpload}
              className="mt-14 group relative max-w-xl mx-auto cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200" />
              <div className="relative flex flex-col items-center justify-center p-12 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl rounded-3xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent pointer-events-none" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Upload New Document</h3>
                <p className="text-base text-slate-600 dark:text-slate-300">Click to start a collaborative review session</p>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-3xl z-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent shadow-md" />
                  </div>
                )}
              </div>
            </div>
          </section>
          <section className="space-y-8 mt-16 relative z-10">
            <div className="flex items-center justify-between bg-white/40 dark:bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Recent Sessions
              </h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : sessions.length === 0 ? (
              <Card className="p-16 text-center border border-white/40 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-md shadow-xl rounded-3xl">
                <div className="w-20 h-20 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No reviews yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">Upload your first document or join an existing session with a code to get started.</p>
                <div className="flex items-center justify-center gap-4">
                  <Button onClick={handleQuickUpload} className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-4 h-4" /> Start Review
                  </Button>
                  <Button onClick={() => navigate('/join')} variant="outline" className="gap-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl">Join Session</Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sessions.map((s) => (
                  <Card key={s.id} className="group overflow-hidden border border-white/50 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-lg hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col rounded-3xl">
                    <div className="aspect-video bg-indigo-50 dark:bg-black/50 relative overflow-hidden border-b border-white/20 dark:border-white/5">
                       <img src={s.documentUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                       <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-lg hover:scale-110 transition-transform"
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(s.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-white truncate mb-2">{s.title}</h4>
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400">
                             <Sparkles className="w-3 h-3" />
                             {s.pins?.length || 0} Pins • {s.pins?.reduce((acc, p) => acc + p.comments.length, 0)} Comments
                          </span>
                          <span>{formatDistanceToNow(s.createdAt)} ago</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate(`/review/${s.id}`)}
                        className="w-full bg-slate-100 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white text-slate-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:text-white transition-all duration-300 rounded-xl h-12 shadow-sm hover:shadow-md"
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