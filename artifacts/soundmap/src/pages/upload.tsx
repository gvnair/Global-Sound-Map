import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateRecording } from "@workspace/api-client-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, MapPin, Link2, Send, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  audioUrl: z.string().url("Must be a valid URL to an audio file"),
  location: z.string().min(2, "Location is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  authorName: z.string().min(2, "Name is required"),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateRecording();
  const [isLocating, setIsLocating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      audioUrl: "",
      location: "",
      latitude: 0,
      longitude: 0,
      authorName: "",
      tags: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const tagsArray = data.tags 
        ? data.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];

      await createMutation.mutateAsync({
        data: {
          ...data,
          tags: tagsArray,
        }
      });

      toast({
        title: "Transmission successful",
        description: "Your audio has been pinned to the map.",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Failed to upload",
        description: "There was a problem pinning your audio. Please try again.",
        variant: "destructive",
      });
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
          toast({
            title: "Location found",
            description: "Coordinates updated successfully.",
          });
        },
        (error) => {
          setIsLocating(false);
          toast({
            title: "Location error",
            description: "Could not access your location.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-32 px-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/4 translate-y-1/4"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 shadow-[0_0_30px_rgba(0,180,255,0.2)]">
            <Mic size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Share a Signal</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Pin an audio recording to the map and let others experience this location through sound.
          </p>
        </header>

        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                  <Link2 className="text-primary" /> Audio Source
                </h3>
                
                <FormField
                  control={form.control}
                  name="audioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direct Audio URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/audio.mp3" className="bg-background/50 border-white/10 focus:border-primary/50" {...field} />
                      </FormControl>
                      <FormDescription>
                        Paste a direct link to an .mp3, .wav, or other supported audio file.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6 pt-4">
                <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                  <MapPin className="text-primary" /> Location Details
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
                  {isLocating ? "Acquiring coordinates..." : "Use Current Location"}
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
                          placeholder="Describe the atmosphere, time of day, or how it felt to be there..." 
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
                  disabled={createMutation.isPending}
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
              </div>

            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
