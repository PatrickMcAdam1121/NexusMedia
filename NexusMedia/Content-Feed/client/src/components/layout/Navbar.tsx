import { useState } from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { AccessibilityMenu } from "./AccessibilityMenu";
import { NotificationModal } from "./NotificationModal";
import { DonateModal } from "./DonateModal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, Bell, Heart } from "lucide-react";

export function Navbar() {
  const { user, logout, isLoggingOut } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="rounded-xl" />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setNotificationOpen(true)}
              className="rounded-xl text-muted-foreground hover:text-foreground relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDonateOpen(true)}
              className="rounded-xl text-muted-foreground hover:text-accent"
              title="Donate to developer"
            >
              <Heart className="w-5 h-5" />
            </Button>

            <AccessibilityMenu />

            <div className="h-8 w-[1px] bg-border hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {user?.firstName || "User"}
                </p>
                <p className="text-xs text-muted-foreground uppercase">{user?.role}</p>
              </div>
              <Avatar className="w-9 h-9 border border-border/50 ring-2 ring-background shadow-sm">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 hidden sm:flex"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <NotificationModal open={notificationOpen} onOpenChange={setNotificationOpen} />
      <DonateModal open={donateOpen} onOpenChange={setDonateOpen} />
    </>
  );
}
