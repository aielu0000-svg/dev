-- コーデテーブルに新しいカラムを追加
ALTER TABLE codes ADD COLUMN original_url TEXT;
ALTER TABLE codes ADD COLUMN style TEXT DEFAULT 'standard' CHECK (style IN ('standard', 'sketch', 'minimal', 'detailed'));
ALTER TABLE codes ADD COLUMN season_tags TEXT; -- JSON array
ALTER TABLE codes ADD COLUMN scene_tags TEXT; -- JSON array
ALTER TABLE codes ADD COLUMN processing_time INTEGER; -- milliseconds

-- コレクション（お気に入り）テーブル
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- コレクションアイテム
CREATE TABLE IF NOT EXISTS collection_items (
  collection_id TEXT NOT NULL,
  code_id TEXT NOT NULL,
  added_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (collection_id, code_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE CASCADE
);

-- 処理履歴テーブル
CREATE TABLE IF NOT EXISTS processing_history (
  id TEXT PRIMARY KEY,
  code_id TEXT,
  original_filename TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  current_step TEXT,
  progress INTEGER DEFAULT 0, -- 0-100
  style TEXT DEFAULT 'standard',
  error_message TEXT,
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE SET NULL
);

-- 色説明テーブル（配色の理由）
CREATE TABLE IF NOT EXISTS color_explanations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_hex TEXT NOT NULL,
  match_hex TEXT NOT NULL,
  explanation TEXT NOT NULL,
  harmony_type TEXT, -- complementary, analogous, triadic, etc.
  UNIQUE(base_hex, match_hex)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_collections_created ON collections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processing_history_status ON processing_history(status);
CREATE INDEX IF NOT EXISTS idx_processing_history_started ON processing_history(started_at DESC);
