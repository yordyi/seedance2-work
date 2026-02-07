"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VideoTask } from "@/lib/services/video_task";

const statusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "default" as const;
    case "processing":
      return "secondary" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "processing":
      return "Processing";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
};

function VideoTaskCard({ task }: { task: VideoTask }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted flex items-center justify-center relative">
        {task.status === "completed" && task.video_url ? (
          <video
            src={task.video_url}
            controls
            className="w-full h-full object-cover"
            poster={task.thumbnail_url || undefined}
          />
        ) : task.status === "processing" ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Generating...</span>
          </div>
        ) : task.status === "failed" ? (
          <div className="flex flex-col items-center gap-2 text-destructive">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span className="text-sm">Failed</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-sm">Queued</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={statusVariant(task.status)}>{statusLabel(task.status)}</Badge>
        </div>
      </div>
      <CardContent className="p-4 space-y-2">
        <p className="text-sm line-clamp-2">{task.prompt}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{task.resolution}</span>
          <span>·</span>
          <span>{task.aspect_ratio}</span>
          <span>·</span>
          <span>{task.duration}s</span>
        </div>
        {task.error_message && (
          <p className="text-xs text-destructive">{task.error_message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {new Date(task.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardContent>
    </Card>
  );
}

export function VideoGallery({ tasks }: { tasks: VideoTask[] }) {
  const [filter, setFilter] = React.useState<string>("all");

  const filteredTasks = filter === "all"
    ? tasks
    : tasks.filter((t) => t.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {["all", "completed", "processing", "pending", "failed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <p className="text-sm">No videos found</p>
            <a href="/generate" className="text-sm underline mt-1 hover:text-foreground">
              Generate your first video
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <VideoTaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
