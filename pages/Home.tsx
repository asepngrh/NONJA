import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { Drama, HistoryItem } from '../types';
import { Play, RefreshCw, AlertCircle } from 'lucide-react';

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="px-4 py-3">
    <h2 className="text-lg font-bold text-white border-l-4 border-primary pl-3">{title}</h2>
  </div>
);

const DramaCard: React.FC<{ drama: Drama | HistoryItem; onClick: () => void; isHistory?: boolean }> = ({ drama, onClick, isHistory }) => (
  <div 
    className="flex-shrink-0 w-32 mr-3 snap-start cursor-pointer active:scale-95 transition-transform"
    onClick={onClick}
  >
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-md">
      <img 
        src={drama.cover} 
        alt={isHistory ? (drama as HistoryItem).bookName : (drama as Drama).bookName} 
        className="w-full h-full object-cover" 
        loading="lazy"
        onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Cover';
        }}
      />
      {isHistory && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <div className="w-10 h-10 bg-primary/80 rounded-full flex items-center justify-center">
                <Play fill="white" size={16} className="text-white ml-1" />
            </div>
        </div>
      )}
      {!isHistory && (drama as Drama).score > 0 && (
        <div className="absolute top-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-yellow-400 font-bold border border-white/10">
          {(drama as Drama).score}
        </div>
      )}
    </div>
    <p className="mt-2 text-xs font-medium text-gray-200 truncate">
      {isHistory ? (drama as HistoryItem).bookName : (drama as Drama).bookName}
    </p>
    {isHistory && (
      <p className="text-[10px] text-primary font-bold">Ep {(drama as HistoryItem).chapterIndex + 1}</p>
    )}
  </div>
);

const SectionSkeleton = () => (
    <div className="flex overflow-x-auto px-4 py-2 gap-3 no-scrollbar">
        {[1,2,3,4].map(i => (
            <div key={i} className="flex-shrink-0 w-32">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse-fast"></div>
                <div className="h-3 bg-gray-800 rounded mt-2 w-3/4 animate-pulse-fast"></div>
            </div>
        ))}
    </div>
);

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [forYou, setForYou] = useState<Drama[]>([]);
  const [latest, setLatest] = useState<Drama[]>([]);
  const [rank, setRank] = useState<Drama[]>([]);
  
  const [loadingForYou, setLoadingForYou] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingRank, setLoadingRank] = useState(true);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [globalError, setGlobalError] = useState(false);

  const fetchAll = async () => {
    setGlobalError(false);
    
    // Load independently so one failure doesn't block others
    setLoadingForYou(true);
    api.getForYou().then(data => setForYou(data)).catch(() => {}).finally(() => setLoadingForYou(false));

    setLoadingLatest(true);
    api.getLatest().then(data => setLatest(data)).catch(() => {}).finally(() => setLoadingLatest(false));

    setLoadingRank(true);
    api.getRank().then(data => setRank(data)).catch(() => {}).finally(() => setLoadingRank(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Check if ALL failed to show global error
  useEffect(() => {
    if (!loadingForYou && !loadingLatest && !loadingRank) {
        if (forYou.length === 0 && latest.length === 0 && rank.length === 0) {
            setGlobalError(true);
        }
    }
  }, [loadingForYou, loadingLatest, loadingRank, forYou, latest, rank]);

  useEffect(() => {
    setHistory(storage.getHistory().slice(0, 10));
  }, []); 

  const openDetail = (bookId: string) => navigate(`/detail/${bookId}`);
  const resume = (bookId: string, idx: number) => navigate(`/watch/${bookId}/${idx}`);

  if (globalError) {
      return (
          <div className="flex flex-col items-center justify-center h-[80vh] gap-4 p-6 text-center">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-2">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold">Connection Issue</h3>
              <p className="text-gray-500 text-sm max-w-xs">Failed to load content. The server might be busy or your internet connection is unstable.</p>
              <button 
                onClick={fetchAll}
                className="flex items-center gap-2 px-8 py-3 bg-primary rounded-full text-sm font-bold active:scale-95 transition mt-4 shadow-lg shadow-red-900/20"
              >
                  <RefreshCw size={16} /> Retry Connection
              </button>
          </div>
      );
  }

  return (
    <div className="pb-10 min-h-screen bg-background">
        <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-white/5">
            <div className="flex items-center gap-1">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h1 className="text-xl font-black text-white tracking-widest ml-2">NONJE</h1>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white border border-white/10 shadow-inner">
               {storage.getUser()?.username.charAt(0).toUpperCase()}
            </div>
        </header>

        {history.length > 0 && (
            <div className="mb-6 mt-2">
                <SectionHeader title="Continue Watching" />
                <div className="flex overflow-x-auto px-4 gap-0 no-scrollbar pb-2">
                    {history.map(item => (
                        <DramaCard 
                            key={item.bookId} 
                            drama={item} 
                            isHistory 
                            onClick={() => resume(item.bookId, item.chapterIndex)} 
                        />
                    ))}
                </div>
            </div>
        )}

        <div className="mb-6">
            <SectionHeader title="For You" />
            {loadingForYou ? <SectionSkeleton /> : (
                <div className="flex overflow-x-auto px-4 gap-0 no-scrollbar pb-2 min-h-[160px]">
                    {forYou.length > 0 ? forYou.map(d => (
                        <DramaCard key={d.bookId} drama={d} onClick={() => openDetail(d.bookId)} />
                    )) : <div className="px-4 text-xs text-gray-600 italic flex items-center">No content available</div>}
                </div>
            )}
        </div>

        <div className="mb-6">
            <SectionHeader title="Latest Release" />
            {loadingLatest ? <SectionSkeleton /> : (
                <div className="flex overflow-x-auto px-4 gap-0 no-scrollbar pb-2 min-h-[160px]">
                    {latest.length > 0 ? latest.map(d => (
                        <DramaCard key={d.bookId} drama={d} onClick={() => openDetail(d.bookId)} />
                    )) : <div className="px-4 text-xs text-gray-600 italic flex items-center">No content available</div>}
                </div>
            )}
        </div>

        <div className="mb-6">
            <SectionHeader title="Popular Ranking" />
            {loadingRank ? <SectionSkeleton /> : (
                <div className="flex overflow-x-auto px-4 gap-0 no-scrollbar pb-2 min-h-[160px]">
                    {rank.length > 0 ? rank.map((d, i) => (
                         <div 
                         key={d.bookId}
                         className="flex-shrink-0 w-32 mr-3 snap-start cursor-pointer active:scale-95 transition-transform relative group"
                         onClick={() => openDetail(d.bookId)}
                       >
                         <div className="absolute -left-2 -bottom-4 text-8xl font-black text-white/5 z-0 group-hover:text-primary/20 transition-colors">
                            {i + 1}
                         </div>
                         <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 z-10 shadow-lg border border-white/5">
                           <img 
                                src={d.cover} 
                                alt={d.bookName} 
                                className="w-full h-full object-cover" 
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Cover';
                                }}
                           />
                         </div>
                         <p className="mt-2 text-xs font-medium text-gray-200 truncate relative z-10">{d.bookName}</p>
                       </div>
                    )) : <div className="px-4 text-xs text-gray-600 italic flex items-center">No ranking available</div>}
                </div>
            )}
        </div>
    </div>
  );
};