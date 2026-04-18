-- Rate limiting and usage tracking for AI requests

CREATE TABLE IF NOT EXISTS ai_request_log (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model         text        NOT NULL,
  tokens_used   integer     NOT NULL DEFAULT 0,
  duration_ms   integer     NOT NULL DEFAULT 0,
  success       boolean     NOT NULL DEFAULT true,
  error_message text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for rate limiting queries (user + time range)
CREATE INDEX idx_ai_request_log_user_time
  ON ai_request_log (user_id, created_at DESC);

-- RLS: users can read their own logs, service role can insert
ALTER TABLE ai_request_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI logs"
  ON ai_request_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert AI logs"
  ON ai_request_log FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE ai_request_log IS
  'Tracks AI API usage per user for rate limiting, cost monitoring, and debugging';
