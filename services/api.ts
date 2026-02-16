import { Drama } from "../types";

const BASE_URL = "https://restxdb.onrender.com";

// Helper for handling fetch with timeout and strict method definition
async function fetchAPI(endpoint: string, options: RequestInit = {}, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const config: RequestInit = {
    method: 'GET', // Default strictly to GET as requested (curl -X GET)
    headers: {
      'Accept': 'application/json',
      // 'Content-Type': 'application/json' // Not needed for GET, but good practice if body exists
    },
    ...options,
    signal: controller.signal
  };

  try {
    // Construct full URL properly
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const response = await fetch(url, config);
    
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    console.warn(`Fetch failed for ${endpoint}:`, error);
    // Return null to indicate failure safely instead of crashing
    return null;
  }
}

// --- NORMALIZATION HELPERS ---

const normalizeDrama = (item: any): Drama => {
  if (!item) return createPlaceholderDrama();

  // Handle cases where item might be wrapped strictly
  const d = item.data || item;

  return {
    bookId: String(d.bookId || d.book_id || d.id || d.vod_id || `temp-${Math.random().toString(36).substr(2, 9)}`),
    bookName: d.bookName || d.book_name || d.name || d.title || d.vod_name || "Untitled Drama",
    cover: d.cover || d.img || d.image || d.thumb || d.picture || d.vod_pic || "https://via.placeholder.com/300x450?text=No+Cover",
    intro: d.intro || d.introduction || d.desc || d.description || d.content || d.vod_content || "No synopsis available for this title.",
    latestChapter: String(d.latestChapter || d.latest_chapter || d.vod_remarks || "0"),
    score: Number(d.score || d.vod_score || 0),
    tag: d.tag || d.category || d.type || d.vod_class || "",
    updateTime: d.updateTime || d.update_time || d.vod_time || ""
  };
};

const createPlaceholderDrama = (): Drama => ({
  bookId: `err-${Math.random()}`,
  bookName: "Unknown",
  cover: "",
  intro: "",
  latestChapter: "0",
  score: 0,
  tag: "",
  updateTime: ""
});

// Recursively find the first array in the object to use as list
const findArray = (obj: any): any[] => {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  
  // Common keys to check in order
  const keys = ['list', 'data', 'items', 'results', 'ranking', 'foryou', 'new', 'search'];
  
  for (const key of keys) {
    if (obj[key] && Array.isArray(obj[key])) {
      return obj[key];
    }
  }

  // Deep check: if obj.data is an object, check inside it
  if (obj.data && typeof obj.data === 'object') {
     return findArray(obj.data);
  }

  return [];
};

const extractList = (res: any): Drama[] => {
  const list = findArray(res);
  return list.map(normalizeDrama);
};

// ---------------------------

export const api = {
  // PING: Simple check
  ping: async () => {
    const start = Date.now();
    // Using a lightweight endpoint for ping
    const res = await fetchAPI('/api/rank/1?lang=in', { method: 'GET' }, 20000);
    if (!res) throw new Error("Server Unreachable");
    return Date.now() - start;
  },

  // HOME: FOR YOU
  // curl -X GET "https://restxdb.onrender.com/api/foryou/1?lang=in"
  getForYou: async (): Promise<Drama[]> => {
    const json = await fetchAPI('/api/foryou/1?lang=in');
    return extractList(json);
  },

  // HOME: LATEST
  // curl -X GET "https://restxdb.onrender.com/api/new/1?lang=in&pageSize=10"
  getLatest: async (): Promise<Drama[]> => {
    const json = await fetchAPI('/api/new/1?lang=in&pageSize=10');
    return extractList(json);
  },

  // HOME: RANK
  // curl -X GET "https://restxdb.onrender.com/api/rank/1?lang=in"
  getRank: async (): Promise<Drama[]> => {
    const json = await fetchAPI('/api/rank/1?lang=in');
    return extractList(json);
  },

  // EXPLORE: CLASSIFY
  // curl -X GET "/api/classify?lang=in&pageNo=1&genre=1357&sort=1"
  getClassify: async (page = 1, genre = 1357, sort = 1): Promise<Drama[]> => {
    const json = await fetchAPI(`/api/classify?lang=in&pageNo=${page}&genre=${genre}&sort=${sort}`);
    return extractList(json);
  },

  // SEARCH: SUGGEST
  // curl -X GET "/api/suggest/{keyword}?lang=in"
  getSuggest: async (keyword: string): Promise<string[]> => {
    if (!keyword.trim()) return [];
    const json = await fetchAPI(`/api/suggest/${encodeURIComponent(keyword)}?lang=in`);
    // Suggest usually returns array directly or inside data
    const list = findArray(json);
    return list.map(String); // Ensure strings
  },

  // SEARCH: RESULT
  // curl -X GET "/api/search/{keyword}/1?lang=in"
  search: async (keyword: string, page = 1): Promise<Drama[]> => {
    if (!keyword.trim()) return [];
    const json = await fetchAPI(`/api/search/${encodeURIComponent(keyword)}/${page}?lang=in`);
    return extractList(json);
  },

  // DETAIL: CHAPTERS
  // curl -X GET "/api/chapters/{bookId}?lang=in"
  getChapters: async (bookId: string): Promise<any> => {
    const json = await fetchAPI(`/api/chapters/${bookId}?lang=in`);
    // Return raw json, let Detail component handle specific structure parsing
    // But we ensure it's not null
    return json || { data: null };
  },

  // PLAYER: WATCH
  getVideoUrl: async (bookId: string, chapterIndex: number): Promise<string | null> => {
    try {
      // Step 1: GET (Setup)
      // curl -X GET ".../api/watch/{bookId}/{index}..."
      await fetchAPI(`/api/watch/${bookId}/${chapterIndex}?lang=in&source=search_result`);

      // Step 2: POST (Get Player)
      // curl -X POST ".../api/watch/player?lang=in" -d '{"bookId":...}'
      const res = await fetch(`${BASE_URL}/api/watch/player?lang=in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          bookId: String(bookId),
          chapterIndex: Number(chapterIndex),
          lang: "in"
        })
      });
      
      if (!res.ok) return null;
      const data = await res.json();
      
      // Handle response variations
      return data?.data?.url || data?.url || data?.data?.stream || null;
    } catch (error) {
      console.error("Failed to get video URL", error);
      return null;
    }
  }
};