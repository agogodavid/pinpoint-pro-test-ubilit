import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { generateCodename } from '@/lib/codename';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
interface ShareDialogProps {
  sessionId: string;
  currentCodename?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (codename: string) => void;
}
export function ShareDialog({ sessionId, currentCodename, isOpen, onOpenChange, onUpdate }: ShareDialogProps) {
  const [codename, setCodename] = useState(currentCodename || "");
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const handleGenerate = async () => {
    const newCode = generateCodename();
    setIsUpdating(true);
    try {
      await api(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ codename: newCode })
      });
      setCodename(newCode);
      onUpdate(newCode);
      toast.success("Codename updated");
    } catch (err) {
      toast.error("Failed to update codename");
    } finally {
      setIsUpdating(false);
    }
  };
  const copyToClipboard = () => {
    const url = `${window.location.origin}/review/${sessionId}${codename ? `?ref=${codename}` : ''}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard");
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            Share Session
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Generate a unique codename for anonymous feedback sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label>Anonymous Mode</Label>
              <p className="text-xs text-zinc-500">Enable codenames for reviewers</p>
            </div>
            <Switch 
              checked={!!codename} 
              onCheckedChange={(checked) => !checked ? setCodename("") : handleGenerate()} 
            />
          </div>
          {codename && (
            <div className="space-y-2">
              <Label htmlFor="codename">Active Codename</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="codename"
                  value={codename}
                  readOnly
                  className="bg-zinc-800 border-zinc-700 font-mono text-indigo-400"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleGenerate}
                  disabled={isUpdating}
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  <RefreshCw className={cn("w-4 h-4", isUpdating && "animate-spin")} />
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Sharing Link</Label>
            <div className="flex items-center gap-2">
              <Input
                value={`${window.location.origin.replace(/^https?:\/\//, '')}/review/${sessionId}`}
                readOnly
                className="bg-zinc-800 border-zinc-700 text-xs text-zinc-400"
              />
              <Button 
                onClick={copyToClipboard}
                className="bg-indigo-600 hover:bg-indigo-500 shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="ml-2">Copy</span>
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <p className="text-[10px] text-zinc-500 italic">
            Reviewers with this link can leave pins and comments.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}