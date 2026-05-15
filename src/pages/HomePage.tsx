import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, FileText, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
export function HomePage() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const handleQuickUpload = async () => {
    setIsUploading(true);
    try {
      // Mock upload process
      const res = await api<{ id: string }>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          title: "Technical Schematic Review",
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
    <AppLayout container className="bg-zinc-50 dark:bg-[#09090b]">
      <ThemeToggle />
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero / Upload Zone */}
        <section className="text-center space-y-8 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            Precision Feedback Guided by AI
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
            Stop guessing. <br />
            <span className="text-indigo-600">Start Pinning.</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            PinPoint Pro turns static documents into interactive guided tours. 
            Drop pins, set focus, and gather structured feedback in seconds.
          </p>
          <div 
            onClick={handleQuickUpload}
            className="mt-12 group relative max-w-2xl mx-auto cursor-pointer"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all hover:border-indigo-400 dark:hover:border-indigo-500">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drop your document here</h3>
              <p className="text-zinc-500 dark:text-zinc-400">PDF, PNG, or JPEG supported (Max 50MB)</p>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 rounded-2xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              )}
            </div>
          </div>
        </section>
        {/* Recent Activity */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-400" />
              Recent Reviews
            </h2>
            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="group overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg transition-all">
                <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 relative">
                   <div className="absolute inset-0 flex items-center justify-center opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                      <FileText className="w-12 h-12" />
                   </div>
                </div>
                <div className="p-4 space-y-3">
                  <h4 className="font-semibold truncate">Q4 Project Roadmap v{i}.0</h4>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>12 Pins • 4 Comments</span>
                    <span>2h ago</span>
                  </div>
                  <Button variant="secondary" className="w-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Open Review
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            <button className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
              <Plus className="w-8 h-8 text-zinc-400 group-hover:text-indigo-500 mb-2" />
              <span className="text-zinc-500 font-medium">New Review</span>
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}