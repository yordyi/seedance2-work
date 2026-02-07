// This is a wrapper file for exporting both the Astro application as well as
// the workflow classes. This is necessary because Astro does not allow
// us to manually export non-Astro stuff as part of the bundle file.
import astroEntry, { pageMap } from "./_worker.js/index.js";
import { VideoGenerationWorkflow } from "../src/workflows/video_generation_workflow.js";
export default astroEntry;
export { VideoGenerationWorkflow, pageMap };
