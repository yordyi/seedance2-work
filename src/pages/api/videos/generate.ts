import { VideoTaskService } from "@/lib/services/video_task";

export async function POST({ locals, request }) {
  const { DB, VIDEO_GENERATION_WORKFLOW } = locals.runtime.env;

  const videoTaskService = new VideoTaskService(DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { prompt, negative_prompt, duration, resolution, aspect_ratio, seed } = body;

  if (!prompt || typeof prompt !== "string" || prompt.length < 10) {
    return Response.json(
      { message: "Prompt is required and must be at least 10 characters" },
      { status: 400 },
    );
  }

  try {
    const result = await videoTaskService.create({
      prompt,
      negative_prompt,
      duration: duration || 5,
      resolution: resolution || "720p",
      aspect_ratio: aspect_ratio || "16:9",
      seed,
    });

    const task = await videoTaskService.getById(result.taskId);

    // Trigger the VideoGenerationWorkflow for async processing
    try {
      await VIDEO_GENERATION_WORKFLOW.create({
        id: `video-task-${result.taskId}`,
        params: {
          taskId: result.taskId,
          prompt,
          negative_prompt,
          duration: duration || 5,
          resolution: resolution || "720p",
          aspect_ratio: aspect_ratio || "16:9",
          seed,
        },
      });
    } catch (workflowError) {
      // Workflow trigger failure is non-fatal — task is still created
      console.error("Failed to trigger workflow:", workflowError);
    }

    return Response.json(
      {
        message: "Video generation task created",
        task,
        taskId: result.taskId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create video task:", error);
    return Response.json(
      { message: "Failed to create video generation task" },
      { status: 500 },
    );
  }
}
