type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    VIDEO_GENERATION_WORKFLOW: Workflow;
    DB: D1Database;
  }
}
