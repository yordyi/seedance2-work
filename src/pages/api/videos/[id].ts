import { VideoTaskService } from "@/lib/services/video_task";
import { validateApiTokenResponse } from "@/lib/api";

export async function GET({ params, locals, request }) {
  const { API_TOKEN, DB } = locals.runtime.env;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const videoTaskService = new VideoTaskService(DB);
  const task = await videoTaskService.getById(Number(params.id));

  if (task) {
    return Response.json({ task });
  } else {
    return Response.json(
      { message: "Video task not found" },
      { status: 404 },
    );
  }
}
