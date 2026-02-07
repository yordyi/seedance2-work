export const VIDEO_TASK_QUERIES = {
  GET_ALL: `SELECT * FROM video_tasks ORDER BY created_at DESC`,
  GET_BY_ID: `SELECT * FROM video_tasks WHERE id = ?`,
  GET_BY_CUSTOMER: `SELECT * FROM video_tasks WHERE customer_id = ? ORDER BY created_at DESC`,
  GET_BY_STATUS: `SELECT * FROM video_tasks WHERE status = ? ORDER BY created_at DESC`,
  GET_STATS: `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
    FROM video_tasks
  `,
  INSERT: `
    INSERT INTO video_tasks (customer_id, prompt, negative_prompt, duration, resolution, aspect_ratio, seed, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `,
  UPDATE_STATUS: `UPDATE video_tasks SET status = ? WHERE id = ?`,
  UPDATE_COMPLETED: `
    UPDATE video_tasks
    SET status = 'completed', video_url = ?, thumbnail_url = ?, processing_completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  UPDATE_FAILED: `
    UPDATE video_tasks
    SET status = 'failed', error_message = ?, processing_completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  UPDATE_PROCESSING: `
    UPDATE video_tasks
    SET status = 'processing', processing_started_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
};

export interface VideoTask {
  id: number;
  customer_id: number | null;
  prompt: string;
  negative_prompt: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration: number;
  resolution: string;
  aspect_ratio: string;
  seed: number | null;
  video_url: string | null;
  thumbnail_url: string | null;
  error_message: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoTaskStats {
  total: number;
  completed: number;
  processing: number;
  pending: number;
  failed: number;
}

export interface CreateVideoTaskData {
  customer_id?: number | null;
  prompt: string;
  negative_prompt?: string;
  duration?: number;
  resolution?: string;
  aspect_ratio?: string;
  seed?: number;
}

export class VideoTaskService {
  private DB: D1Database;

  constructor(DB: D1Database) {
    this.DB = DB;
  }

  async getAll(): Promise<VideoTask[]> {
    const response = await this.DB.prepare(VIDEO_TASK_QUERIES.GET_ALL).all();
    if (response.success) {
      return response.results as VideoTask[];
    }
    return [];
  }

  async getById(id: number): Promise<VideoTask | null> {
    const response = await this.DB.prepare(VIDEO_TASK_QUERIES.GET_BY_ID).bind(id).first();
    return response as VideoTask | null;
  }

  async getByCustomer(customerId: number): Promise<VideoTask[]> {
    const response = await this.DB.prepare(VIDEO_TASK_QUERIES.GET_BY_CUSTOMER).bind(customerId).all();
    if (response.success) {
      return response.results as VideoTask[];
    }
    return [];
  }

  async getByStatus(status: string): Promise<VideoTask[]> {
    const response = await this.DB.prepare(VIDEO_TASK_QUERIES.GET_BY_STATUS).bind(status).all();
    if (response.success) {
      return response.results as VideoTask[];
    }
    return [];
  }

  async getStats(): Promise<VideoTaskStats> {
    const response = await this.DB.prepare(VIDEO_TASK_QUERIES.GET_STATS).first();
    if (response) {
      return response as VideoTaskStats;
    }
    return { total: 0, completed: 0, processing: 0, pending: 0, failed: 0 };
  }

  async create(data: CreateVideoTaskData): Promise<{ success: boolean; taskId: number }> {
    const response = await this.DB.prepare(VIDEO_TASK_QUERIES.INSERT)
      .bind(
        data.customer_id || null,
        data.prompt,
        data.negative_prompt || null,
        data.duration || 5,
        data.resolution || '720p',
        data.aspect_ratio || '16:9',
        data.seed || null,
      )
      .run();

    if (!response.success) {
      throw new Error('Failed to create video task');
    }

    return { success: true, taskId: response.meta.last_row_id };
  }

  async markProcessing(id: number): Promise<void> {
    await this.DB.prepare(VIDEO_TASK_QUERIES.UPDATE_PROCESSING).bind(id).run();
  }

  async markCompleted(id: number, videoUrl: string, thumbnailUrl?: string): Promise<void> {
    await this.DB.prepare(VIDEO_TASK_QUERIES.UPDATE_COMPLETED)
      .bind(videoUrl, thumbnailUrl || null, id)
      .run();
  }

  async markFailed(id: number, errorMessage: string): Promise<void> {
    await this.DB.prepare(VIDEO_TASK_QUERIES.UPDATE_FAILED)
      .bind(errorMessage, id)
      .run();
  }
}
