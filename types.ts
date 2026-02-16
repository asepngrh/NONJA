export interface Drama {
  bookId: string;
  bookName: string;
  cover: string;
  intro: string;
  latestChapter: string;
  score?: number;
  tag?: string;
  author?: string;
  updateTime?: string;
}

export interface Chapter {
  chapterId: string;
  chapterName: string;
  chapterIndex: number;
  isVip?: number;
  updateTime?: number;
}

export interface DramaDetail extends Drama {
  chapters: Chapter[];
}

export interface User {
  username: string;
  email?: string;
  isGuest: boolean;
}

export interface HistoryItem {
  bookId: string;
  bookName: string;
  cover: string;
  chapterIndex: number;
  timestamp: number; // For resume playback
  lastWatchedAt: number;
}

export interface ApiListResponse {
  list: Drama[];
  total?: number;
}

export interface SearchResponse {
  list: Drama[];
}

export interface SuggestResponse {
  list: string[];
}
