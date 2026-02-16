import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Drama } from '../types';
import { ArrowDownUp, Check, ChevronDown } from 'lucide-react';

const GENRES = [
  { id: 1357, label: 'All' },
  { id: 1359, label: 'Romance' },
  { id: 1363, label: 'Action' },
  { id: 1361, label: 'Costume' },
  { id: 1365, label: 'Modern' },
  { id: 1367, label: 'Short' },
];

const SORTS = [
  { id: 1, label: 'Popular' },
  { id: 2, label: 'Latest' },
];

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<Drama[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState(1357);
  const [sort, setSort] = useState(1);
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const loadData = async (pageNum: number, isRefresh = false) => {
    if (loading && !isRefresh) return;
    
    setLoading(true);
    try {
      if (isRefresh) setList([]);
      
      const newData = await api.getClassify(pageNum, genre, sort);
      
      if (mounted.current) {
          setList(prev => isRefresh ? newData : [...prev, ...newData]);
          setPage(pageNum);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1, true);
  }, [genre, sort]);

  return (
    <div className="min-h-screen bg-background pb-safe flex flex-col">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-30 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Explore</h2>
            
            <div className="relative">
                <button 
                    onClick={() => setShowSortMenu(!showSortMenu)} 
                    className="flex items-center gap-1 text-xs font-bold bg-surface px-3 py-1.5 rounded-full text-gray-300 active:scale-95 transition"
                >
                    <ArrowDownUp size={14} />
                    <span>{SORTS.find(s => s.id === sort)?.label}</span>
                    <ChevronDown size={14} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>

                {showSortMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-surface border border-gray-700 rounded-lg shadow-xl z-40 w-32 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        {SORTS.map(s => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setSort(s.id);
                                    setShowSortMenu(false);
                                }}
                                className="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-gray-700 flex items-center justify-between"
                            >
                                {s.label}
                                {sort === s.id && <Check size={14} className="text-primary" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="px-4 pb-3 flex overflow-x-auto gap-2 no-scrollbar">
            {GENRES.map(g => (
                <button
                    key={g.id}
                    onClick={() => setGenre(g.id)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition ${
                        genre === g.id 
                        ? 'bg-primary border-primary text-white' 
                        : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                >
                    {g.label}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1">
        {loading && list.length === 0 ? (
           <div className="grid grid-cols-3 gap-3 p-4">
              {[...Array(9)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-gray-800 rounded animate-pulse"></div>
              ))}
           </div>
        ) : (
            <div className="grid grid-cols-3 gap-3 p-4">
                {list.map((d, idx) => (
                <div key={`${d.bookId}-${idx}`} onClick={() => navigate(`/detail/${d.bookId}`)} className="cursor-pointer active:opacity-80">
                    <div className="aspect-[2/3] rounded bg-gray-800 overflow-hidden mb-2 relative">
                         <img src={d.cover} alt={d.bookName} className="w-full h-full object-cover" loading="lazy" />
                         {d.score > 0 && <div className="absolute top-1 right-1 bg-black/60 px-1 text-[8px] text-yellow-400 rounded font-bold">{d.score}</div>}
                    </div>
                    <p className="text-[10px] text-gray-300 line-clamp-2 leading-tight">{d.bookName}</p>
                </div>
                ))}
            </div>
        )}

        {!loading && list.length === 0 && (
            <div className="p-10 text-center text-gray-500 text-sm">
                No results found.
            </div>
        )}

        {!loading && list.length > 0 && (
            <div className="p-4 flex justify-center pb-20">
                <button onClick={() => loadData(page + 1)} className="px-6 py-2 bg-surface rounded-full text-xs font-bold text-gray-300 hover:bg-gray-700 active:scale-95 transition">
                    Load More
                </button>
            </div>
        )}
      </div>
    </div>
  );
};