import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { PlayerProvider } from "@/components/player-context";
import { AudioPlayer } from "@/components/audio-player";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";

const queryClient = new QueryClient();

import HomePage from "@/pages/home";
import ExplorePage from "@/pages/explore";
import UploadPage from "@/pages/upload";
import FeedPage from "@/pages/feed";
import ProfilePage from "@/pages/profile";

const STORAGE_KEY = "soundmap_username";
const PASSWORD_KEY = "soundmap_authed";

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
  const [authed, setAuthed] = useState<boolean>(() => {
    return !!localStorage.getItem(PASSWORD_KEY);
  });

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleLogin = (username: string) => {
    localStorage.setItem(STORAGE_KEY, username);
    localStorage.setItem(PASSWORD_KEY, "true");
    setAuthed(true);
  };

  if (!authed) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LoginPage onLogin={handleLogin} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <div className="min-h-screen flex bg-background text-foreground selection:bg-primary/30">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 relative overflow-y-auto pb-16 md:pb-0">
                <main className="flex-1 relative overflow-y-auto">
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