import { useState } from "react";
import { useGetFeed, useListFollows, useUnfollowUser, getGetFeedQueryKey, getListFollowsQueryKey } from "@workspace/api-client-react";
import { usePlayer } from "@/components/player-context";
import { useUsername } from "@/hooks/use-username";
import { useQueryClient } from "@tanstack/react-query";
import { Play, MapPin, Clock, Heart, Headphones, UserMinus, Users, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Recording } from "@workspace/api-client-react";

function SetUsernamePrompt({ onSet }: { onSet: (name: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,180,255,0.15)]">
          <Radio size={36} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Choose your handle</h1>
        <p className="text-muted-foreground mb-8">
          Pick a name to use across SoundMap. This is how others will see you when you share recordings.
        </p>
        <form
          className="flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onSet(value.trim());
          }}
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. maria_silva"
            className="bg-card/60 border-white/10 text-lg h-12 flex-1"
            data-testid="input-username"
          />
          <Button
            type="submit"
            disabled={!value.trim()}
            className="h-12 px-6"
            data-testid="button-set-username"
          >
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}

function FeedRecordingCard({ recording, index }: { recording: Recording; index: number }) {
  const { playRecording, activeRecording } = usePlayer();
  const isPlaying = activeRecording?.id === recording.id;

  return (
    <Card
      className={cn(
        "group bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden cursor-pointer relative",
        isPlaying ? "border-primary/50 shadow-[0_0_20px_rgba(0,180,255,0.1)]" : "hover:shadow-lg"
      )}
      onClick={() => playRecording(recording)}
      style={{ animationDelay: `${index * 80}ms` }}
      data-testid={`card-recording-${recording.id}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardContent className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shrink-0",
                isPlaying
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,180,255,0.4)]"
                  : "bg-white/5 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}
            >
              {isPlaying ? (
                <Headphones size={16} className="animate-pulse" />
              ) : (
                <Play size={16} className="fill-current ml-0.5" />
              )}
            </div>
            <div>
              <p className="text-xs text-primary font-mono font-semibold">{recording.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(recording.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs bg-white/5 px-2 py-1 rounded-full">
            <Heart size={12} className="text-pink-500" />
            <span>{recording.likes}</span>
          </div>
        </div>

        <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">
          {recording.title}
        </h3>

        {recording.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recording.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin size={12} className="opacity-60" />
          <span>{recording.location}</span>
        </div>

        {recording.tags && recording.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
            {recording.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 rounded-md text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FollowingPill({
  name,
  followerName,
}: {
  name: string;
  followerName: string;
}) {
  const queryClient = useQueryClient();
  const unfollow = useUnfollowUser();

  const handleUnfollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    unfollow.mutate(
      { data: { followerName, followingName: name } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFollowsQueryKey({ followerName }) });
          queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey({ followerName }) });
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2 bg-card/60 border border-white/10 rounded-full px-3 py-1.5 text-sm">
      <span className="font-mono text-primary">{name}</span>
      <button
        onClick={handleUnfollow}
        disabled={unfollow.isPending}
        className="text-muted-foreground hover:text-destructive transition-colors"
        title="Unfollow"
        data-testid={`button-unfollow-${name}`}
      >
        <UserMinus size={14} />
      </button>
    </div>
  );
}

export default function FeedPage() {
  const { username, setUsername } = useUsername();
  const queryClient = useQueryClient();

  const { data: feed, isLoading: isLoadingFeed } = useGetFeed(
    { followerName: username ?? "" },
    { query: { enabled: !!username, queryKey: getGetFeedQueryKey({ followerName: username ?? "" }) } }
  );

  const { data: follows, isLoading: isLoadingFollows } = useListFollows(
    { followerName: username ?? "" },
    { query: { enabled: !!username, queryKey: getListFollowsQueryKey({ followerName: username ?? "" }) } }
  );

  if (!username) {
    return <SetUsernamePrompt onSet={setUsername} />;
  }

  const followingNames = follows?.map((f) => f.followingName) ?? [];

  return (
    <div className="min-h-screen pt-24 pb-32 px-6 overflow-y-auto bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Radio size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Tuned in as</p>
              <p className="font-bold text-primary font-mono">{username}</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mt-4">Your Signal Feed</h1>
          <p className="text-muted-foreground mt-2">
            Recordings from the explorers you follow.
          </p>
        </header>

        {followingNames.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Following
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {isLoadingFollows ? (
                <Skeleton className="h-8 w-32 rounded-full bg-white/5" />
              ) : (
                followingNames.map((name) => (
                  <FollowingPill key={name} name={name} followerName={username} />
                ))
              )}
            </div>
          </div>
        )}

        {isLoadingFeed ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[180px] rounded-xl bg-white/5" />
            ))}
          </div>
        ) : !feed || feed.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-card/60 border border-white/5 flex items-center justify-center mx-auto mb-6">
              <Radio size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No signals yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              {followingNames.length === 0
                ? "Head to the Explore page and follow some explorers to see their recordings here."
                : "The people you follow haven't posted any recordings yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {feed.map((recording, i) => (
              <FeedRecordingCard key={recording.id} recording={recording} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
