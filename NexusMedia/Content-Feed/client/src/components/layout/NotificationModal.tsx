import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell } from 'lucide-react';

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationModal({ open, onOpenChange }: NotificationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <p className="font-semibold text-foreground mb-1">Welcome to Nexus!</p>
            <p className="text-sm text-muted-foreground">You'll see notifications here when someone purchases your work, donates, or comments on your posts.</p>
          </div>
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No new notifications yet</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
