-- Categories (main categories from spec)
INSERT OR IGNORE INTO categories (id, name, parent_id, sort_order) VALUES
  ('outer', 'アウター', NULL, 1),
  ('tops', 'トップス', NULL, 2),
  ('bottoms', 'ボトムス', NULL, 3),
  ('shoes', 'シューズ', NULL, 4),
  ('accessories', '小物', NULL, 5);

-- Sub-categories
INSERT OR IGNORE INTO categories (id, name, parent_id, sort_order) VALUES
  ('coat', 'コート', 'outer', 1),
  ('jacket', 'ジャケット', 'outer', 2),
  ('blouson', 'ブルゾン', 'outer', 3),
  ('cardigan', 'カーディガン', 'outer', 4),
  ('shirt', 'シャツ', 'tops', 1),
  ('tshirt', 'Tシャツ', 'tops', 2),
  ('knit', 'ニット', 'tops', 3),
  ('blouse', 'ブラウス', 'tops', 4),
  ('pants', 'パンツ', 'bottoms', 1),
  ('skirt', 'スカート', 'bottoms', 2),
  ('denim', 'デニム', 'bottoms', 3),
  ('shorts', 'ショートパンツ', 'bottoms', 4),
  ('sneakers', 'スニーカー', 'shoes', 1),
  ('boots', 'ブーツ', 'shoes', 2),
  ('loafers', 'ローファー', 'shoes', 3),
  ('bag', 'バッグ', 'accessories', 1),
  ('hat', '帽子', 'accessories', 2),
  ('scarf', 'マフラー・スカーフ', 'accessories', 3);

-- Sample codes (outfits) with likes >= 100
-- More varied color combinations based on real fashion trends
INSERT OR IGNORE INTO codes (id, illustration_url, palette, likes, source, status) VALUES
  -- ネイビー×ホワイト×ベージュ（定番）
  ('code001', '/images/code001.png', '[{"hex":"#1A1A2E","ratio":0.4,"role":"outer"},{"hex":"#FFFFFF","ratio":0.3,"role":"tops"},{"hex":"#F5F5DC","ratio":0.3,"role":"bottoms"}]', 2450, 'wear', 'active'),
  -- ブラック×グレー×ホワイト（モノトーン）
  ('code002', '/images/code002.png', '[{"hex":"#000000","ratio":0.35,"role":"outer"},{"hex":"#808080","ratio":0.35,"role":"tops"},{"hex":"#FFFFFF","ratio":0.3,"role":"bottoms"}]', 1980, 'wear', 'active'),
  -- キャメル×ホワイト×デニムブルー
  ('code003', '/images/code003.png', '[{"hex":"#D4A574","ratio":0.4,"role":"outer"},{"hex":"#FFFFFF","ratio":0.3,"role":"tops"},{"hex":"#4169E1","ratio":0.3,"role":"bottoms"}]', 1870, 'wear', 'active'),
  -- オリーブ×ベージュ×ブラウン
  ('code004', '/images/code004.png', '[{"hex":"#556B2F","ratio":0.35,"role":"outer"},{"hex":"#F5F5DC","ratio":0.35,"role":"tops"},{"hex":"#8B4513","ratio":0.3,"role":"bottoms"}]', 1650, 'wear', 'active'),
  -- グレー×ピンク×ホワイト
  ('code005', '/images/code005.png', '[{"hex":"#808080","ratio":0.35,"role":"outer"},{"hex":"#FFC0CB","ratio":0.35,"role":"tops"},{"hex":"#FFFFFF","ratio":0.3,"role":"bottoms"}]', 1520, 'wear', 'active'),
  -- ネイビー×ボルドー×グレー
  ('code006', '/images/code006.png', '[{"hex":"#1A1A2E","ratio":0.4,"role":"outer"},{"hex":"#722F37","ratio":0.3,"role":"tops"},{"hex":"#808080","ratio":0.3,"role":"bottoms"}]', 1450, 'wear', 'active'),
  -- ベージュ×ブラウン×ホワイト
  ('code007', '/images/code007.png', '[{"hex":"#F5F5DC","ratio":0.4,"role":"outer"},{"hex":"#8B4513","ratio":0.3,"role":"tops"},{"hex":"#FFFFFF","ratio":0.3,"role":"bottoms"}]', 1380, 'wear', 'active'),
  -- ブラック×レッド×デニム
  ('code008', '/images/code008.png', '[{"hex":"#000000","ratio":0.35,"role":"outer"},{"hex":"#E74C3C","ratio":0.35,"role":"tops"},{"hex":"#4169E1","ratio":0.3,"role":"bottoms"}]', 1290, 'wear', 'active'),
  -- ライトブルー×ホワイト×ベージュ
  ('code009', '/images/code009.png', '[{"hex":"#87CEEB","ratio":0.35,"role":"tops"},{"hex":"#FFFFFF","ratio":0.35,"role":"outer"},{"hex":"#F5F5DC","ratio":0.3,"role":"bottoms"}]', 1150, 'wear', 'active'),
  -- グリーン×ホワイト×ブラック
  ('code010', '/images/code010.png', '[{"hex":"#228B22","ratio":0.4,"role":"outer"},{"hex":"#FFFFFF","ratio":0.3,"role":"tops"},{"hex":"#000000","ratio":0.3,"role":"bottoms"}]', 1080, 'wear', 'active'),
  -- マスタード×ネイビー×グレー
  ('code011', '/images/code011.png', '[{"hex":"#FFDB58","ratio":0.35,"role":"tops"},{"hex":"#1A1A2E","ratio":0.35,"role":"outer"},{"hex":"#808080","ratio":0.3,"role":"bottoms"}]', 980, 'wear', 'active'),
  -- パープル×グレー×ホワイト
  ('code012', '/images/code012.png', '[{"hex":"#800080","ratio":0.35,"role":"tops"},{"hex":"#808080","ratio":0.35,"role":"outer"},{"hex":"#FFFFFF","ratio":0.3,"role":"bottoms"}]', 920, 'wear', 'active'),
  -- ターコイズ×ベージュ×ブラウン
  ('code013', '/images/code013.png', '[{"hex":"#40E0D0","ratio":0.35,"role":"tops"},{"hex":"#F5F5DC","ratio":0.35,"role":"outer"},{"hex":"#8B4513","ratio":0.3,"role":"bottoms"}]', 850, 'wear', 'active'),
  -- オレンジ×ホワイト×ネイビー
  ('code014', '/images/code014.png', '[{"hex":"#FFA500","ratio":0.35,"role":"tops"},{"hex":"#FFFFFF","ratio":0.35,"role":"outer"},{"hex":"#1A1A2E","ratio":0.3,"role":"bottoms"}]', 780, 'wear', 'active'),
  -- カーキ×ベージュ×ホワイト
  ('code015', '/images/code015.png', '[{"hex":"#6B8E23","ratio":0.4,"role":"outer"},{"hex":"#F5F5DC","ratio":0.3,"role":"tops"},{"hex":"#FFFFFF","ratio":0.3,"role":"bottoms"}]', 720, 'wear', 'active'),
  -- ブラック×ホワイト×レッド（アクセント）
  ('code016', '/images/code016.png', '[{"hex":"#000000","ratio":0.4,"role":"outer"},{"hex":"#FFFFFF","ratio":0.35,"role":"tops"},{"hex":"#E74C3C","ratio":0.25,"role":"accessories"}]', 680, 'wear', 'active'),
  -- ネイビー×ストライプ×ベージュ
  ('code017', '/images/code017.png', '[{"hex":"#1A1A2E","ratio":0.4,"role":"outer"},{"hex":"#4682B4","ratio":0.3,"role":"tops"},{"hex":"#F5F5DC","ratio":0.3,"role":"bottoms"}]', 620, 'wear', 'active'),
  -- グレー×ネイビー×ホワイト
  ('code018', '/images/code018.png', '[{"hex":"#808080","ratio":0.35,"role":"outer"},{"hex":"#1A1A2E","ratio":0.35,"role":"tops"},{"hex":"#FFFFFF","ratio":0.3,"role":"bottoms"}]', 580, 'wear', 'active'),
  -- ブラウン×クリーム×オリーブ
  ('code019', '/images/code019.png', '[{"hex":"#8B4513","ratio":0.4,"role":"outer"},{"hex":"#FFFDD0","ratio":0.3,"role":"tops"},{"hex":"#556B2F","ratio":0.3,"role":"bottoms"}]', 520, 'wear', 'active'),
  -- イエロー×デニム×ホワイト
  ('code020', '/images/code020.png', '[{"hex":"#FFFF00","ratio":0.3,"role":"tops"},{"hex":"#4169E1","ratio":0.4,"role":"bottoms"},{"hex":"#FFFFFF","ratio":0.3,"role":"outer"}]', 480, 'wear', 'active'),
  -- ピンク×グレー×ブラック
  ('code021', '/images/code021.png', '[{"hex":"#FFC0CB","ratio":0.35,"role":"tops"},{"hex":"#808080","ratio":0.35,"role":"outer"},{"hex":"#000000","ratio":0.3,"role":"bottoms"}]', 450, 'wear', 'active'),
  -- ネイビー×イエロー×ホワイト
  ('code022', '/images/code022.png', '[{"hex":"#1A1A2E","ratio":0.4,"role":"outer"},{"hex":"#FFFF00","ratio":0.3,"role":"tops"},{"hex":"#FFFFFF","ratio":0.3,"role":"bottoms"}]', 420, 'wear', 'active'),
  -- ボルドー×ベージュ×ブラック
  ('code023', '/images/code023.png', '[{"hex":"#722F37","ratio":0.35,"role":"tops"},{"hex":"#F5F5DC","ratio":0.35,"role":"outer"},{"hex":"#000000","ratio":0.3,"role":"bottoms"}]', 380, 'wear', 'active'),
  -- ライトグレー×ホワイト×ブルー
  ('code024', '/images/code024.png', '[{"hex":"#D3D3D3","ratio":0.4,"role":"outer"},{"hex":"#FFFFFF","ratio":0.3,"role":"tops"},{"hex":"#4169E1","ratio":0.3,"role":"bottoms"}]', 350, 'wear', 'active'),
  -- テラコッタ×ベージュ×ブラウン
  ('code025', '/images/code025.png', '[{"hex":"#E2725B","ratio":0.35,"role":"tops"},{"hex":"#F5F5DC","ratio":0.35,"role":"outer"},{"hex":"#8B4513","ratio":0.3,"role":"bottoms"}]', 320, 'wear', 'active'),
  -- サックスブルー×ホワイト×ネイビー
  ('code026', '/images/code026.png', '[{"hex":"#4682B4","ratio":0.35,"role":"tops"},{"hex":"#FFFFFF","ratio":0.35,"role":"outer"},{"hex":"#1A1A2E","ratio":0.3,"role":"bottoms"}]', 280, 'wear', 'active'),
  -- オフホワイト×ベージュ×キャメル
  ('code027', '/images/code027.png', '[{"hex":"#FAF9F6","ratio":0.35,"role":"tops"},{"hex":"#F5F5DC","ratio":0.35,"role":"outer"},{"hex":"#D4A574","ratio":0.3,"role":"bottoms"}]', 250, 'wear', 'active'),
  -- チャコール×ホワイト×ブラック
  ('code028', '/images/code028.png', '[{"hex":"#36454F","ratio":0.4,"role":"outer"},{"hex":"#FFFFFF","ratio":0.3,"role":"tops"},{"hex":"#000000","ratio":0.3,"role":"bottoms"}]', 220, 'wear', 'active'),
  -- ミントグリーン×ホワイト×グレー
  ('code029', '/images/code029.png', '[{"hex":"#98FF98","ratio":0.35,"role":"tops"},{"hex":"#FFFFFF","ratio":0.35,"role":"outer"},{"hex":"#808080","ratio":0.3,"role":"bottoms"}]', 180, 'wear', 'active'),
  -- コーラル×ネイビー×ホワイト
  ('code030', '/images/code030.png', '[{"hex":"#FF7F50","ratio":0.35,"role":"tops"},{"hex":"#1A1A2E","ratio":0.35,"role":"outer"},{"hex":"#FFFFFF","ratio":0.3,"role":"bottoms"}]', 150, 'wear', 'active');

-- Code-Category relationships
INSERT OR IGNORE INTO code_categories (code_id, category_id) VALUES
  ('code001', 'outer'), ('code001', 'coat'), ('code001', 'tops'), ('code001', 'shirt'), ('code001', 'bottoms'), ('code001', 'pants'),
  ('code002', 'outer'), ('code002', 'jacket'), ('code002', 'tops'), ('code002', 'tshirt'), ('code002', 'bottoms'), ('code002', 'pants'),
  ('code003', 'outer'), ('code003', 'coat'), ('code003', 'tops'), ('code003', 'shirt'), ('code003', 'bottoms'), ('code003', 'denim'),
  ('code004', 'outer'), ('code004', 'jacket'), ('code004', 'tops'), ('code004', 'knit'), ('code004', 'bottoms'), ('code004', 'pants'),
  ('code005', 'outer'), ('code005', 'cardigan'), ('code005', 'tops'), ('code005', 'blouse'), ('code005', 'bottoms'), ('code005', 'skirt'),
  ('code006', 'outer'), ('code006', 'coat'), ('code006', 'tops'), ('code006', 'knit'), ('code006', 'bottoms'), ('code006', 'pants'),
  ('code007', 'outer'), ('code007', 'coat'), ('code007', 'tops'), ('code007', 'tshirt'), ('code007', 'bottoms'), ('code007', 'pants'),
  ('code008', 'outer'), ('code008', 'jacket'), ('code008', 'tops'), ('code008', 'tshirt'), ('code008', 'bottoms'), ('code008', 'denim'),
  ('code009', 'outer'), ('code009', 'cardigan'), ('code009', 'tops'), ('code009', 'shirt'), ('code009', 'bottoms'), ('code009', 'pants'),
  ('code010', 'outer'), ('code010', 'blouson'), ('code010', 'tops'), ('code010', 'tshirt'), ('code010', 'bottoms'), ('code010', 'pants'),
  ('code011', 'outer'), ('code011', 'jacket'), ('code011', 'tops'), ('code011', 'knit'), ('code011', 'bottoms'), ('code011', 'pants'),
  ('code012', 'outer'), ('code012', 'cardigan'), ('code012', 'tops'), ('code012', 'knit'), ('code012', 'bottoms'), ('code012', 'skirt'),
  ('code013', 'outer'), ('code013', 'jacket'), ('code013', 'tops'), ('code013', 'tshirt'), ('code013', 'bottoms'), ('code013', 'pants'),
  ('code014', 'outer'), ('code014', 'shirt'), ('code014', 'tops'), ('code014', 'tshirt'), ('code014', 'bottoms'), ('code014', 'pants'),
  ('code015', 'outer'), ('code015', 'blouson'), ('code015', 'tops'), ('code015', 'shirt'), ('code015', 'bottoms'), ('code015', 'pants'),
  ('code016', 'outer'), ('code016', 'coat'), ('code016', 'tops'), ('code016', 'tshirt'), ('code016', 'accessories'), ('code016', 'bag'),
  ('code017', 'outer'), ('code017', 'jacket'), ('code017', 'tops'), ('code017', 'shirt'), ('code017', 'bottoms'), ('code017', 'pants'),
  ('code018', 'outer'), ('code018', 'coat'), ('code018', 'tops'), ('code018', 'knit'), ('code018', 'bottoms'), ('code018', 'pants'),
  ('code019', 'outer'), ('code019', 'jacket'), ('code019', 'tops'), ('code019', 'shirt'), ('code019', 'bottoms'), ('code019', 'pants'),
  ('code020', 'outer'), ('code020', 'cardigan'), ('code020', 'tops'), ('code020', 'tshirt'), ('code020', 'bottoms'), ('code020', 'denim'),
  ('code021', 'outer'), ('code021', 'cardigan'), ('code021', 'tops'), ('code021', 'blouse'), ('code021', 'bottoms'), ('code021', 'pants'),
  ('code022', 'outer'), ('code022', 'jacket'), ('code022', 'tops'), ('code022', 'tshirt'), ('code022', 'bottoms'), ('code022', 'pants'),
  ('code023', 'outer'), ('code023', 'coat'), ('code023', 'tops'), ('code023', 'knit'), ('code023', 'bottoms'), ('code023', 'pants'),
  ('code024', 'outer'), ('code024', 'coat'), ('code024', 'tops'), ('code024', 'shirt'), ('code024', 'bottoms'), ('code024', 'denim'),
  ('code025', 'outer'), ('code025', 'cardigan'), ('code025', 'tops'), ('code025', 'blouse'), ('code025', 'bottoms'), ('code025', 'pants'),
  ('code026', 'outer'), ('code026', 'shirt'), ('code026', 'tops'), ('code026', 'tshirt'), ('code026', 'bottoms'), ('code026', 'pants'),
  ('code027', 'outer'), ('code027', 'coat'), ('code027', 'tops'), ('code027', 'knit'), ('code027', 'bottoms'), ('code027', 'pants'),
  ('code028', 'outer'), ('code028', 'coat'), ('code028', 'tops'), ('code028', 'tshirt'), ('code028', 'bottoms'), ('code028', 'pants'),
  ('code029', 'outer'), ('code029', 'cardigan'), ('code029', 'tops'), ('code029', 'tshirt'), ('code029', 'bottoms'), ('code029', 'pants'),
  ('code030', 'outer'), ('code030', 'jacket'), ('code030', 'tops'), ('code030', 'tshirt'), ('code030', 'bottoms'), ('code030', 'pants');

-- Color pairs from spec (section 6) + expanded from popular outfits
-- Neutral colors
INSERT OR IGNORE INTO color_pairs (base_hex, match_hex, score) VALUES
  -- Black combinations
  ('#000000', '#FFFFFF', 1.0), ('#000000', '#808080', 1.0), ('#000000', '#F5F5DC', 1.0),
  ('#000000', '#D4A574', 1.0), ('#000000', '#E74C3C', 1.0), ('#000000', '#4169E1', 0.9),
  ('#000000', '#FFC0CB', 0.85), ('#000000', '#1A1A2E', 0.8),
  -- White combinations
  ('#FFFFFF', '#000000', 1.0), ('#FFFFFF', '#1A1A2E', 1.0), ('#FFFFFF', '#808080', 1.0),
  ('#FFFFFF', '#F5F5DC', 1.0), ('#FFFFFF', '#4169E1', 1.0), ('#FFFFFF', '#D4A574', 0.95),
  ('#FFFFFF', '#87CEEB', 0.95), ('#FFFFFF', '#228B22', 0.9), ('#FFFFFF', '#E74C3C', 0.9),
  ('#FFFFFF', '#FFC0CB', 0.9), ('#FFFFFF', '#FFFF00', 0.85), ('#FFFFFF', '#FFA500', 0.85),
  -- Gray combinations
  ('#808080', '#FFFFFF', 1.0), ('#808080', '#000000', 1.0), ('#808080', '#1A1A2E', 1.0),
  ('#808080', '#FFC0CB', 1.0), ('#808080', '#4169E1', 1.0), ('#808080', '#F5F5DC', 0.95),
  ('#808080', '#800080', 0.9), ('#808080', '#FFDB58', 0.85),
  -- Navy combinations
  ('#1A1A2E', '#FFFFFF', 1.0), ('#1A1A2E', '#808080', 1.0), ('#1A1A2E', '#F5F5DC', 1.0),
  ('#1A1A2E', '#87CEEB', 1.0), ('#1A1A2E', '#722F37', 1.0), ('#1A1A2E', '#D4A574', 0.95),
  ('#1A1A2E', '#FFFF00', 0.9), ('#1A1A2E', '#FFA500', 0.9), ('#1A1A2E', '#E74C3C', 0.85),
  ('#1A1A2E', '#FF7F50', 0.85), ('#1A1A2E', '#4682B4', 0.9),
  -- Beige combinations
  ('#F5F5DC', '#FFFFFF', 1.0), ('#F5F5DC', '#8B4513', 1.0), ('#F5F5DC', '#1A1A2E', 1.0),
  ('#F5F5DC', '#556B2F', 1.0), ('#F5F5DC', '#000000', 1.0), ('#F5F5DC', '#D4A574', 0.95),
  ('#F5F5DC', '#722F37', 0.9), ('#F5F5DC', '#40E0D0', 0.85), ('#F5F5DC', '#E2725B', 0.85),
  -- Camel combinations
  ('#D4A574', '#FFFFFF', 1.0), ('#D4A574', '#1A1A2E', 1.0), ('#D4A574', '#4169E1', 0.95),
  ('#D4A574', '#F5F5DC', 0.95), ('#D4A574', '#000000', 0.9),
  -- Warm colors
  ('#E74C3C', '#000000', 1.0), ('#E74C3C', '#FFFFFF', 1.0), ('#E74C3C', '#1A1A2E', 1.0),
  ('#E74C3C', '#4169E1', 0.9), ('#E74C3C', '#808080', 0.85),
  ('#FFA500', '#FFFFFF', 1.0), ('#FFA500', '#F5F5DC', 1.0), ('#FFA500', '#1A1A2E', 1.0),
  ('#FFA500', '#8B4513', 0.9), ('#FFA500', '#556B2F', 0.85),
  ('#FFFF00', '#FFFFFF', 1.0), ('#FFFF00', '#1A1A2E', 1.0), ('#FFFF00', '#808080', 0.95),
  ('#FFFF00', '#4169E1', 0.9), ('#FFFF00', '#000000', 0.85),
  ('#FFC0CB', '#808080', 1.0), ('#FFC0CB', '#FFFFFF', 1.0), ('#FFC0CB', '#1A1A2E', 0.95),
  ('#FFC0CB', '#000000', 0.9), ('#FFC0CB', '#F5F5DC', 0.85),
  -- Cool colors
  ('#4169E1', '#FFFFFF', 1.0), ('#4169E1', '#808080', 1.0), ('#4169E1', '#F5F5DC', 1.0),
  ('#4169E1', '#D4A574', 0.95), ('#4169E1', '#E74C3C', 0.9), ('#4169E1', '#000000', 0.9),
  ('#87CEEB', '#FFFFFF', 1.0), ('#87CEEB', '#1A1A2E', 1.0), ('#87CEEB', '#808080', 0.95),
  ('#87CEEB', '#F5F5DC', 0.9),
  ('#228B22', '#FFFFFF', 1.0), ('#228B22', '#F5F5DC', 1.0), ('#228B22', '#000000', 1.0),
  ('#228B22', '#8B4513', 0.9),
  ('#556B2F', '#F5F5DC', 1.0), ('#556B2F', '#FFFFFF', 1.0), ('#556B2F', '#8B4513', 1.0),
  ('#556B2F', '#D4A574', 0.95), ('#556B2F', '#FFFDD0', 0.9),
  ('#800080', '#FFFFFF', 1.0), ('#800080', '#808080', 1.0), ('#800080', '#F5F5DC', 0.9),
  ('#800080', '#000000', 0.85),
  -- Accent colors
  ('#722F37', '#FFFFFF', 1.0), ('#722F37', '#000000', 1.0), ('#722F37', '#1A1A2E', 1.0),
  ('#722F37', '#F5F5DC', 0.95), ('#722F37', '#808080', 0.9),
  ('#FFDB58', '#1A1A2E', 1.0), ('#FFDB58', '#FFFFFF', 1.0), ('#FFDB58', '#8B4513', 0.95),
  ('#FFDB58', '#808080', 0.9),
  ('#40E0D0', '#FFFFFF', 1.0), ('#40E0D0', '#F5F5DC', 1.0), ('#40E0D0', '#1A1A2E', 0.95),
  ('#40E0D0', '#8B4513', 0.9),
  -- Additional popular combinations from outfit data
  ('#6B8E23', '#F5F5DC', 1.0), ('#6B8E23', '#FFFFFF', 1.0), -- カーキ
  ('#36454F', '#FFFFFF', 1.0), ('#36454F', '#000000', 0.9), -- チャコール
  ('#E2725B', '#F5F5DC', 1.0), ('#E2725B', '#8B4513', 0.95), -- テラコッタ
  ('#4682B4', '#FFFFFF', 1.0), ('#4682B4', '#1A1A2E', 0.95), -- サックスブルー
  ('#FF7F50', '#1A1A2E', 1.0), ('#FF7F50', '#FFFFFF', 0.95), -- コーラル
  ('#98FF98', '#FFFFFF', 1.0), ('#98FF98', '#808080', 0.9), -- ミントグリーン
  ('#D3D3D3', '#FFFFFF', 1.0), ('#D3D3D3', '#4169E1', 0.95), -- ライトグレー
  ('#FAF9F6', '#F5F5DC', 1.0), ('#FAF9F6', '#D4A574', 0.95), -- オフホワイト
  ('#FFFDD0', '#556B2F', 1.0), ('#FFFDD0', '#8B4513', 0.95); -- クリーム
