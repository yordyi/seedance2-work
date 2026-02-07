"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const videoGenerateSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(1000, "Prompt must be less than 1000 characters"),
  negative_prompt: z.string().max(500).optional(),
  duration: z.coerce.number().min(2).max(10).default(5),
  resolution: z.enum(["480p", "720p", "1080p"]).default("720p"),
  aspect_ratio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  seed: z.coerce.number().int().positive().optional(),
});

type VideoGenerateFormValues = z.infer<typeof videoGenerateSchema>;

export function VideoGenerateForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{
    success: boolean;
    taskId?: number;
    error?: string;
  } | null>(null);

  const form = useForm<VideoGenerateFormValues>({
    resolver: zodResolver(videoGenerateSchema),
    defaultValues: {
      prompt: "",
      negative_prompt: "",
      duration: 5,
      resolution: "720p",
      aspect_ratio: "16:9",
    },
  });

  async function onSubmit(data: VideoGenerateFormValues) {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/videos/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (response.ok) {
        setResult({ success: true, taskId: json.task?.id || json.taskId });
        form.reset();
      } else {
        setResult({ success: false, error: json.message || "Generation failed" });
      }
    } catch {
      setResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Video</CardTitle>
            <CardDescription>
              Describe the video you want to generate. Be specific about scenes, actions, camera angles, and style.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A cinematic shot of a golden retriever running through a sunlit meadow, slow motion, 4K quality, warm color grading..."
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the video scene in detail. Include style, camera movement, and mood.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="negative_prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negative Prompt (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="blurry, low quality, distorted, watermark..."
                          className="min-h-[60px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what you don't want in the video.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input type="number" min={2} max={10} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resolution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resolution</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            {...field}
                          >
                            <option value="480p">480p</option>
                            <option value="720p">720p (Standard)</option>
                            <option value="1080p">1080p (HD)</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aspect_ratio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aspect Ratio</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            {...field}
                          >
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                            <option value="1:1">1:1 (Square)</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="seed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seed (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Random seed for reproducibility"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Set a seed to reproduce the same video with the same prompt.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate Video"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p><strong>Be specific:</strong> "A red sports car drifting on a mountain road at sunset" works better than "a car driving".</p>
            <p><strong>Style keywords:</strong> Include terms like "cinematic", "aerial shot", "slow motion", "time-lapse".</p>
            <p><strong>Camera movement:</strong> Specify "pan left", "zoom in", "tracking shot", "dolly forward".</p>
            <p><strong>Mood &amp; lighting:</strong> Add "golden hour", "dramatic lighting", "neon glow", "foggy atmosphere".</p>
          </CardContent>
        </Card>

        {result && (
          <Card className={result.success ? "border-green-500/50" : "border-destructive/50"}>
            <CardContent className="pt-6">
              {result.success ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Video generation started!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Task #{result.taskId} has been queued. Check the{" "}
                    <a href="/gallery" className="underline hover:text-foreground">gallery</a>{" "}
                    for progress.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">Generation Failed</p>
                  <p className="text-sm text-muted-foreground">{result.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
