import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { PlayerProvider } from "@/components/player-context";
import { AudioPlayer } from "@/components/audio-player";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Pages
import HomePage from "@/pages/home";
import ExplorePage from "@/pages/explore";
import UploadPage from "@/pages/upload";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/upload" component={UploadPage} />
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
            <div className="min-h-screen bg-background text-foreground text-opacity-90 overflow-hidden flex flex-col selection:bg-primary/30">
              <Navigation />
              <main className="flex-1 relative">
                <Router />
              </main>
              <AudioPlayer />
            </div>
          </WouterRouter>
        </PlayerProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
