import React, { useState } from 'react';
import { useReviewStore } from '@/hooks/use-review-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Send, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ReactionType, Comment } from '@shared/types';
const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: 'THUMBS_UP', emoji: '👍' },
  { type: 'CELEBRATE', emoji: '🎉' },
  { type: 'EYES', emoji: '👀' },
  { type: 'CONFUSED', emoji: '😕' },
  { type: 'THUMBS_DOWN', emoji: '👎' },
];
export function PinFeedbackPopover() {
  const session = useReviewStore(s => s.session);
  const selectedPinId = useReviewStore(s => s.selectedPinId);
  const updatePinInStore = useReviewStore(s => s.updatePin);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!selectedPinId || !session) return null;
  const pin = session.pins.find(p => p.id === selectedPinId);
  if (!pin) return null;
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const newComment: Comment = {
        id: crypto.randomUUID(),
        userId: 'currentUser',
        userName: 'Reviewer',
        text: commentText.trim(),
        timestamp: Date.now(),
      };
      await api(`/api/sessions/${session.id}/pins/${pin.id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ comment: newComment })
      });
      updatePinInStore(pin.id, {
        comments: [...pin.comments, newComment]
      });
      setCommentText('');
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleAddReaction = async (type: ReactionType) => {
    try {
      await api(`/api/sessions/${session.id}/pins/${pin.id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ reaction: type })
      });
      updatePinInStore(pin.id, {
        reactions: {
          ...pin.reactions,
          [type]: (pin.reactions[type] || 0) + 1
        }
      });
      toast.success("Reaction added");
    } catch (err) {
      toast.error("Failed to add reaction");
    }
  };
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">Feedback Point</h3>
        <p className="text-xs text-zinc-400 italic">"{pin.prompt || 'No prompt set'}"</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {pin.comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-500">No comments yet. Be the first!</p>
            </div>
          ) : (
            pin.comments.map(c => (
              <div key={c.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">{c.userName}</span>
                  <span className="text-[10px] text-zinc-500">
                    {formatDistanceToNow(c.timestamp)} ago
                  </span>
                </div>
                <p className="text-sm text-zinc-200">{c.text}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 space-y-4">
        <div className="flex items-center justify-between gap-1">
          {REACTIONS.map(r => (
            <button
              key={r.type}
              onClick={() => handleAddReaction(r.type)}
              className="flex-1 flex flex-col items-center gap-1 p-1 hover:bg-zinc-800 rounded transition-colors group"
            >
              <span className="text-lg group-hover:scale-125 transition-transform">{r.emoji}</span>
              <span className="text-[10px] text-zinc-500">{pin.reactions[r.type] || 0}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type a comment..."
            className="h-9 text-xs bg-zinc-800 border-zinc-700 text-zinc-100"
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <Button
            size="icon"
            variant="default"
            disabled={!commentText.trim() || isSubmitting}
            onClick={handleAddComment}
            className="h-9 w-9 bg-indigo-600 hover:bg-indigo-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}