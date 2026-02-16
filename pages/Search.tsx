import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { Drama } from '../types';
import { Search as SearchIcon, X, ArrowUpLeft } from 'lucide-react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Drama[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<'history' | 'suggest' | 'result'>('history');

  useEffect(() => {
    setHistory(storage.getSearchHistory());
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      if (mode !== 'result') {
        // Fetch suggestions
        api.getSuggest(debouncedQuery).then(list => {
           setSuggestions(list);
           setMode('suggest');
        }).catch(() => {});
      }
    } else {
      setMode('history');
      setSuggestions([]);
    }
  }, [debouncedQuery, mode]);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    setQuery(term);
    setMode('result');
    storage.addSearchHistory(term);
    setHistory(storage.getSearchHistory());
    
    try {
      const list = await api.search(term);
      setResults(list);
    } catch (e) {
      console.error(e);
      setResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background z-20 px-4 py-3 border-b border-gray-800 flex items-center gap-3">
        <div className="flex-1 relative">
           <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
           <input 
             value={query}
             onChange={e => {
                setQuery(e.target.value);
                if (e.target.value === '') setMode('history');
             }}
             onKeyDown={e => e.key === 'Enter' && performSearch(query)}
             placeholder="Search Chinese Drama..."
             className="w-full bg-surface rounded-full pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-600"
             autoFocus
           />
           {query && (
             <button onClick={() => { setQuery(''); setMode('history'); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={16} className="text-gray-500" />
             </button>
           )}
        </div>
        <span onClick={() => performSearch(query)} className="text-primary text-sm font-bold cursor-pointer">Search</span>
      </div>

      <div className="p-4">
        {mode === 'history' && (
          <div>
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xs font-bold text-gray-400">RECENT SEARCHES</h3>
               <button onClick={() => { storage.clearSearchHistory(); setHistory([]); }} className="text-[10px] text-gray-500">CLEAR</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map(item => (
                <span 
                  key={item} 
                  onClick={() => performSearch(item)}
                  className="px-3 py-1.5 bg-surface rounded-lg text-xs text-gray-300 active:bg-gray-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {mode === 'suggest' && (
          <div className="space-y-4">
            {suggestions.map((item, i) => (
              <div key={i} onClick={() => performSearch(item)} className="flex items-center gap-3 text-sm text-gray-300 py-1">
                 <SearchIcon size={14} className="text-gray-600" />
                 <span>{item}</span>
                 <ArrowUpLeft size={14} className="ml-auto text-gray-600 -rotate-45" />
              </div>
            ))}
          </div>
        )}

        {mode === 'result' && (
           <div className="space-y-4">
             {results.map(d => (
               <div key={d.bookId} onClick={() => navigate(`/detail/${d.bookId}`)} className="flex gap-3">
                  <div className="w-24 aspect-[2/3] bg-gray-800 rounded overflow-hidden flex-shrink-0">
                     <img src={d.cover} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                     <h3 className="font-bold text-sm mb-1">{d.bookName}</h3>
                     <p className="text-xs text-gray-400 line-clamp-2">{d.intro}</p>
                     <div className="mt-2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded w-fit">
                       {d.tag || 'Drama'}
                     </div>
                  </div>
               </div>
             ))}
             {results.length === 0 && <div className="text-center text-gray-500 mt-10">No results found</div>}
           </div>
        )}
      </div>
    </div>
  );
};