import { useState } from "react";
import { Headphones, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.error ?? "Something went wrong", variant: "destructive" });
        return;
      }

      onLogin(data.username);
      toast({ title: mode === "login" ? "Welcome back!" : "Account created!" });
    } catch {
      toast({ title: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,180,255,0.3)]">
            <Headphones size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-mono tracking-widest uppercase text-white">
            SoundMap
          </h1>
          <p className="text-muted-foreground mt-2 text-center">
            Explore the world through sound
          </p>
        </div>

        {/* Card */}
        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-6">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Username</label>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. sonic_explorer"
                className="bg-background/50 border-white/10"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background/50 border-white/10"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-5 font-bold gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-medium"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}