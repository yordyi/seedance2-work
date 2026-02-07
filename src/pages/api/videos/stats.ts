import { VideoTaskService } from "@/lib/services/video_task";
import { validateApiTokenResponse } from "@/lib/api";

export async function GET({ locals, request }) {
  const { API_TOKEN, DB } = locals.runtime.env;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const videoTaskService = new VideoTaskService(DB);
  const stats = await videoTaskService.getStats();

  return Response.json({ stats });
}
