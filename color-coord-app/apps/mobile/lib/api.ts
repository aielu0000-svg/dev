import Constants from 'expo-constants';

// API URLを環境に応じて設定
// Webの場合はlocalhostを使用、モバイルの場合はマシンのIPを使用
const getApiBase = () => {
  // Expo Goでの開発時はdebuggerHostからホストを取得
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    return 'http://localhost:3000/api';
  }

  if (debuggerHost) {
    return `http://${debuggerHost}:3000/api`;
  }

  // フォールバック
  return 'http://localhost:3000/api';
};

const API_BASE = getApiBase();

export interface PaletteItem {
  hex: string;
  ratio: number;
  role: string;
}

export interface Code {
  id: string;
  illustration_url: string;
  palette: PaletteItem[];
  likes: number;
  source?: string;
  status?: string;
  created_at?: string;
}

export interface CodeDetail extends Code {
  categories: Category[];
  similarCodes: Code[];
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order?: number;
  children?: Category[];
}

export interface ColorSearchResult {
  searchColor: string;
  nearColors: string[];
  matchColors: string[];
  relatedCodes: Code[];
}

// Fetch popular codes
export async function fetchCodes(limit = 20, offset = 0): Promise<{ codes: Code[]; total: number }> {
  const res = await fetch(`${API_BASE}/codes?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch codes');
  return res.json();
}

// Fetch code detail
export async function fetchCodeDetail(id: string): Promise<CodeDetail> {
  const res = await fetch(`${API_BASE}/codes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch code detail');
  return res.json();
}

// Fetch categories
export async function fetchCategories(): Promise<{ categories: Category[] }> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

// Fetch codes by category
export async function fetchCodesByCategory(
  categoryId: string,
  limit = 20,
  offset = 0
): Promise<{ category: Category; codes: Code[]; total: number }> {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/codes?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch codes by category');
  return res.json();
}

// Search by color
export async function searchByColor(hex: string): Promise<ColorSearchResult> {
  const encodedHex = encodeURIComponent(hex);
  const res = await fetch(`${API_BASE}/colors/search?hex=${encodedHex}`);
  if (!res.ok) throw new Error('Failed to search by color');
  return res.json();
}

// お気に入り関連
export interface Favorite {
  id: string;
  codeId: string;
  createdAt: string;
}

// 閲覧履歴関連
export interface HistoryItem {
  codeId: string;
  viewedAt: string;
}
