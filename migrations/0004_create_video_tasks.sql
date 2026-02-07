-- Migration number: 0004    Video tasks for Seedance video generation platform
CREATE TABLE IF NOT EXISTS video_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
    duration INTEGER NOT NULL DEFAULT 5,
    resolution TEXT NOT NULL DEFAULT '720p' CHECK(resolution IN ('480p', '720p', '1080p')),
    aspect_ratio TEXT NOT NULL DEFAULT '16:9' CHECK(aspect_ratio IN ('16:9', '9:16', '1:1')),
    seed INTEGER,
    video_url TEXT,
    thumbnail_url TEXT,
    error_message TEXT,
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE INDEX idx_video_tasks_customer_id ON video_tasks(customer_id);
CREATE INDEX idx_video_tasks_status ON video_tasks(status);
CREATE INDEX idx_video_tasks_created_at ON video_tasks(created_at);

CREATE TRIGGER update_video_tasks_updated_at
    AFTER UPDATE ON video_tasks
    BEGIN
        UPDATE video_tasks
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
