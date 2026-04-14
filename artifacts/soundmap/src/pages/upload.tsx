import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateRecording } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, MapPin, Send, Loader2, Upload, Square, CircleDot, Trash2, CheckCircle2, Play, Pause, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsername } from "@/hooks/use-username";


const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  location: z.string().min(2, "Location is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  authorName: z.string().min(2, "Name is required"),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AudioMode = "idle" | "recording" | "recorded" | "uploading" | "ready";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function AudioPicker({ onAudioReady }: { onAudioReady: (url: string) => void }) {
  const { toast } = useToast();
  const [mode, setMode] = useState<AudioMode>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadBlob = useCallback(async (blob: Blob, name: string) => {
    setMode("uploading");
    try {
      const formData = new FormData();
      formData.append("audio", blob, name);
      const res = await fetch(`/api/upload-audio`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { audioUrl: url } = await res.json();
      setAudioUrl(url);
      setMode("ready");
      onAudioReady(url);
    } catch {
      toast({ title: "Upload failed", description: "Could not upload audio.", variant: "destructive" });
      setMode("idle");
    }
  }, [onAudioReady, toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setMode("recorded");
        const localUrl = URL.createObjectURL(blob);
        setAudioUrl(localUrl);
        setFileName("recording.webm");
        uploadBlob(blob, "recording.webm");
      };

      mr.start();
      setMode("recording");
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast({ title: "Microphone access denied", description: "Please allow microphone access to record.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const localUrl = URL.createObjectURL(file);
    setAudioUrl(localUrl);
    uploadBlob(file, file.name);
  };

  const handleReset = () => {
    setMode("idle");
    setAudioUrl(null);
    setFileName(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    if (fileInputRef.current) fileInputRef.current.value = "";
    onAudioReady("");
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  return (
    <div className="space-y-4">
      {mode === "idle" && (
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={startRecording}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-white/10 bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
              <CircleDot size={22} className="text-red-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">Record Audio</p>
              <p className="text-xs text-muted-foreground mt-0.5">Use your microphone</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-white/10 bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Upload size={22} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">Upload File</p>
              <p className="text-xs text-muted-foreground mt-0.5">MP3, WAV, OGG…</p>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {mode === "recording" && (
        <div className="flex flex-col items-center gap-5 p-8 rounded-xl border border-red-500/30 bg-red-500/5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
              <Mic size={28} className="text-red-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-red-400">{formatDuration(recordingTime)}</p>
            <p className="text-sm text-muted-foreground mt-1">Recording in progress…</p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={stopRecording}
            className="gap-2"
          >
            <Square size={16} />
            Stop Recording
          </Button>
        </div>
      )}

      {(mode === "uploading" || mode === "recorded" || mode === "ready") && (
        <div className={cn(
          "flex items-center gap-4 p-5 rounded-xl border transition-all duration-300",
          mode === "ready"
            ? "border-primary/40 bg-primary/5"
            : "border-white/10 bg-background/50"
        )}>
          {mode === "uploading" && (
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          )}
          {mode === "ready" && (
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors"
            >
              {isPlaying ? <Pause size={18} className="text-primary" /> : <Play size={18} className="text-primary ml-0.5" />}
            </button>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName ?? "audio file"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "uploading" ? "Uploading…" : "Ready to submit"}
            </p>
          </div>

          {mode === "ready" && (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-primary" />
              <button
                type="button"
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
        </div>
      )}
    </div>
  );
}

function PhotoPicker({ onPhotoReady }: { onPhotoReady: (url: string | null) => void }) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch(`/api/upload-photo`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const { photoUrl } = await res.json();
      onPhotoReady(photoUrl);
    } catch {
      toast({ title: "Photo upload failed", description: "Could not upload photo.", variant: "destructive" });
      setPreview(null);
      onPhotoReady(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoReady(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      {!preview ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group w-full flex flex-col items-center gap-3 p-8 rounded-xl border border-dashed border-white/20 bg-background/30 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
            <ImagePlus size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">Add a place photo</p>
            <p className="text-xs text-muted-foreground mt-0.5">Optional — shown as the post thumbnail</p>
          </div>
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video">
          <img src={preview} alt="Location preview" className="w-full h-full object-cover" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          )}
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-red-500/80 flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          )}
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

export default function UploadPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { username } = useUsername();
  const createMutation = useCreateRecording();
  const [isLocating, setIsLocating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      latitude: 0,
      longitude: 0,
      authorName: username ?? "",
      tags: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!audioUrl) {
      toast({ title: "No audio", description: "Please record or upload an audio file first.", variant: "destructive" });
      return;
    }

    try {
      const tagsArray = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [];

      await createMutation.mutateAsync({
        data: { ...data, audioUrl, photoUrl: photoUrl ?? undefined, tags: tagsArray },
      });

      toast({ title: "Transmission successful", description: "Your audio has been pinned to the map." });
      navigate("/");
    } catch {
      toast({ title: "Failed to upload", description: "There was a problem pinning your audio. Please try again.", variant: "destructive" });
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", Number(position.coords.latitude.toFixed(6)));
          form.setValue("longitude", Number(position.coords.longitude.toFixed(6)));
          setIsLocating(false);
          toast({ title: "Location found", description: "Coordinates updated successfully." });
        },
        () => {
          setIsLocating(false);
          toast({ title: "Location error", description: "Could not access your location.", variant: "destructive" });
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-48 px-6 overflow-y-auto bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background relative">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/4 translate-y-1/4" />

      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 shadow-[0_0_30px_rgba(0,180,255,0.2)]">
            <CircleDot size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Record a Signal</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Pin an audio recording to the map and let others experience this location through sound.
          </p>
        </header>

        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                  <Mic className="text-primary" size={20} /> Audio
                </h3>
                <AudioPicker onAudioReady={setAudioUrl} />
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                  <ImagePlus className="text-primary" size={20} /> Place Photo
                  <span className="ml-auto text-xs font-normal text-muted-foreground">Optional</span>
                </h3>
                <PhotoPicker onPhotoReady={setPhotoUrl} />
              </div>

              <div className="space-y-6 pt-4">
                <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                  <MapPin className="text-primary" size={20} /> Location
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Location Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Shibuya Crossing, Tokyo" className="bg-background/50 border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" className="bg-background/50 border-white/10 font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" className="bg-background/50 border-white/10 font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10 gap-2"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                >
                  {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                  {isLocating ? "Acquiring coordinates…" : "Use Current Location"}
                </Button>
              </div>

              <div className="space-y-6 pt-4">
                <h3 className="text-xl font-bold border-b border-white/10 pb-4">Recording Details</h3>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Rain on a tin roof" className="bg-background/50 border-white/10 text-lg py-6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the atmosphere, time of day, or how it felt to be there…"
                          className="bg-background/50 border-white/10 min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="authorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Audio Explorer" className="bg-background/50 border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="city, rain, night (comma separated)" className="bg-background/50 border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full py-6 text-lg font-bold gap-3 shadow-[0_0_20px_rgba(0,180,255,0.3)] hover:shadow-[0_0_30px_rgba(0,180,255,0.5)] transition-shadow"
                  disabled={createMutation.isPending || !audioUrl}
                >
                  {createMutation.isPending ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={24} />
                      Transmit to Atlas
                    </>
                  )}
                </Button>
                {!audioUrl && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    Record or upload audio above to enable submission
                  </p>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
