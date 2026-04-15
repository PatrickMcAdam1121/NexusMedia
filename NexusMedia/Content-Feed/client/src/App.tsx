import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/components/providers/AccessibilityProvider";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/layout/Navbar";

// Pages
import NotFound from "@/pages/not-found";
import { Landing } from "@/pages/Landing";
import { Home } from "@/pages/Home";
import { CreatePost } from "@/pages/CreatePost";
import { PostDetail } from "@/pages/PostDetail";

function ProtectedRoutes() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/post/new" component={CreatePost} />
              <Route path="/post/:id" component={PostDetail} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        {/* All routes default to landing if not authenticated */}
        <Route component={Landing} />
      </Switch>
    );
  }

  return <ProtectedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

export default App;
