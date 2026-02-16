import { HistoryItem, User, Drama } from "../types";

const KEYS = {
  USER: 'nonje_user',
  FAVORITES: 'nonje_favorites',
  HISTORY: 'nonje_history',
  SEARCH_HISTORY: 'nonje_search_history'
};

export const storage = {
  getUser: (): User | null => {
    const u = localStorage.getItem(KEYS.USER);
    return u ? JSON.parse(u) : null;
  },
  setUser: (user: User) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(KEYS.USER),

  getFavorites: (): Drama[] => {
    const f = localStorage.getItem(KEYS.FAVORITES);
    return f ? JSON.parse(f) : [];
  },
  toggleFavorite: (drama: Drama) => {
    const favs = storage.getFavorites();
    const exists = favs.find(d => d.bookId === drama.bookId);
    let newFavs;
    if (exists) {
      newFavs = favs.filter(d => d.bookId !== drama.bookId);
    } else {
      newFavs = [drama, ...favs];
    }
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(newFavs));
    return !exists;
  },
  isFavorite: (bookId: string): boolean => {
    const favs = storage.getFavorites();
    return !!favs.find(d => d.bookId === bookId);
  },

  getHistory: (): HistoryItem[] => {
    const h = localStorage.getItem(KEYS.HISTORY);
    return h ? JSON.parse(h) : [];
  },
  saveHistory: (item: HistoryItem) => {
    const history = storage.getHistory();
    // Remove existing entry for this book
    const filtered = history.filter(h => h.bookId !== item.bookId);
    // Add new to top
    const newHistory = [item, ...filtered].slice(0, 50); // Keep last 50
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(newHistory));
  },
  getHistoryItem: (bookId: string): HistoryItem | undefined => {
    return storage.getHistory().find(h => h.bookId === bookId);
  },

  getSearchHistory: (): string[] => {
    const s = localStorage.getItem(KEYS.SEARCH_HISTORY);
    return s ? JSON.parse(s) : [];
  },
  addSearchHistory: (term: string) => {
    let history = storage.getSearchHistory();
    history = [term, ...history.filter(t => t !== term)].slice(0, 10);
    localStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(history));
  },
  clearSearchHistory: () => localStorage.removeItem(KEYS.SEARCH_HISTORY)
};
