-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Codes (outfits) table
CREATE TABLE IF NOT EXISTS codes (
  id TEXT PRIMARY KEY,
  illustration_url TEXT NOT NULL,
  palette TEXT NOT NULL, -- JSON array of {hex, ratio, role}
  likes INTEGER DEFAULT 0,
  source TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
  created_at TEXT DEFAULT (datetime('now')),
  processed_at TEXT
);

-- Code-Category junction table
CREATE TABLE IF NOT EXISTS code_categories (
  code_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (code_id, category_id),
  FOREIGN KEY (code_id) REFERENCES codes(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Color pairs (compatibility) table
CREATE TABLE IF NOT EXISTS color_pairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_hex TEXT NOT NULL,
  match_hex TEXT NOT NULL,
  score REAL DEFAULT 1.0,
  season_tag TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(base_hex, match_hex)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_codes_status ON codes(status);
CREATE INDEX IF NOT EXISTS idx_codes_likes ON codes(likes DESC);
CREATE INDEX IF NOT EXISTS idx_color_pairs_base ON color_pairs(base_hex);
