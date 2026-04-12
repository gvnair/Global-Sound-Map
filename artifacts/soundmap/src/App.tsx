import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { PlayerProvider } from "@/components/player-context";
import { AudioPlayer } from "@/components/audio-player";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Pages
import HomePage from "@/pages/home";
import ExplorePage from "@/pages/explore";
import UploadPage from "@/pages/upload";
import FeedPage from "@/pages/feed";
import ProfilePage from "@/pages/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <div className="h-screen flex bg-background text-foreground selection:bg-primary/30">
              <Sidebar />
               <div className="flex-1 flex flex-col min-w-0 relative overflow-y-auto pb-16 md:pb-0">
                <main className="flex-1 relative overflow-hidden">
                  <Router />
                </main>
                <AudioPlayer />
              </div>
            </div>
          </WouterRouter>
        </PlayerProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
