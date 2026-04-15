import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId?: string;
  recipientName?: string;
  postId?: number;
}

export function DonateModal({ open, onOpenChange, recipientId, recipientName, postId }: DonateModalProps) {
  const [amount, setAmount] = useState('5');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Please enter a valid donation amount' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          recipientId,
          postId,
          type: postId ? 'tip' : 'donation',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Redirect to Stripe Checkout
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Failed to process donation' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" />
            Support {recipientName || 'the Developer'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Help support amazing creators by sending them a {postId ? 'tip for their work' : 'donation'}. Your support keeps the community thriving!
          </p>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="5.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl"
                min="1"
                step="0.01"
              />
              <span className="flex items-center text-muted-foreground">USD</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['5', '10', '20', '50'].map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? 'default' : 'outline'}
                onClick={() => setAmount(preset)}
                className="rounded-lg text-sm"
              >
                ${preset}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleDonate}
            disabled={isLoading}
            className="w-full rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><Heart className="w-4 h-4 mr-2" /> Support ${amount}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
