import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import { useReviewStore } from '@/hooks/use-review-store';
import { toast } from 'sonner';
import type { DocumentSession } from '@shared/types';
export function JoinPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setReviewerName = useReviewStore(s => s.setReviewerName);
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsLoading(true);
    try {
      const session = await api<DocumentSession>(`/api/sessions/by-codename/${code.trim().toUpperCase()}`);
      setReviewerName(code.trim().toUpperCase());
      toast.success("Session joined successfully");
      navigate(`/review/${session.id}`);
    } catch (err) {
      toast.error("Invalid or expired session code");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Mesh Background Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <KeyRound className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Codenamed Access</h1>
          <p className="text-zinc-400 text-sm">Enter the reference code shared by the session creator</p>
        </div>
        <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Session Codename
              </label>
              <Input
                id="code"
                placeholder="SILVER-FOX-92"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="h-14 text-center text-lg font-mono tracking-[0.2em] bg-zinc-950 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all uppercase"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Join Review
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </Card>
        <p className="mt-8 text-center text-zinc-500 text-xs">
          Guest reviews are anonymous and temporary.
        </p>
      </div>
    </div>
  );
}