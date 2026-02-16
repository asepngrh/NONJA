import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { DramaDetail } from '../types';
import { ChevronLeft, Heart, Play, Clock, Star, Calendar, Tag } from 'lucide-react';

export const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<DramaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [resumeIndex, setResumeIndex] = useState<number>(-1);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!id) return;
    
    // Check local storage states
    setIsFav(storage.isFavorite(id));
    const history = storage.getHistoryItem(id);
    if (history) {
        setResumeIndex(history.chapterIndex);
    }
    
    const fetchData = async () => {
      try {
        const res = await api.getChapters(id);
        
        if (mounted.current) {
          // Robust Data Extraction
          const rawData = res.data || res;
          
          // Find chapters array recursively if needed
          let chaptersList: any[] = [];
          if (Array.isArray(rawData)) chaptersList = rawData;
          else if (rawData.chapters && Array.isArray(rawData.chapters)) chaptersList = rawData.chapters;
          else if (rawData.chapterList && Array.isArray(rawData.chapterList)) chaptersList = rawData.chapterList;
          else if (rawData.list && Array.isArray(rawData.list)) chaptersList = rawData.list;
          else if (rawData.data && Array.isArray(rawData.data)) chaptersList = rawData.data;

          // Normalize
          const normalizedData: DramaDetail = {
              bookId: rawData.bookId || rawData.id || id,
              bookName: rawData.bookName || rawData.title || rawData.name || "Unknown Title",
              cover: rawData.cover || rawData.img || rawData.thumb || rawData.picture || rawData.image || "https://via.placeholder.com/300x450?text=No+Cover",
              intro: rawData.intro || rawData.introduction || rawData.brief || rawData.desc || rawData.description || rawData.content || "No synopsis available.",
              latestChapter: rawData.latestChapter || String(chaptersList.length),
              score: rawData.score,
              tag: rawData.tag || rawData.type || rawData.category,
              updateTime: rawData.updateTime,
              chapters: chaptersList
          };
          
          setData(normalizedData);
        }
      } catch (e) {
        console.error("Detail load error", e);
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleFav = () => {
    if (!data) return;
    const newVal = storage.toggleFavorite(data);
    setIsFav(newVal);
  };

  const playEpisode = (index: number) => {
    if (!data) return;
    storage.saveHistory({
       bookId: data.bookId,
       bookName: data.bookName,
       cover: data.cover,
       chapterIndex: index,
       timestamp: 0,
       lastWatchedAt: Date.now()
    });
    setResumeIndex(index);
    navigate(`/watch/${data.bookId}/${index}`, { state: { bookName: data.bookName } });
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500">Loading Drama...</p>
        </div>
      );
  }

  if (!data) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
            <p className="text-gray-400 mb-4">Could not load drama details.</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-surface rounded-full text-sm">Go Back</button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background pb-safe relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <img src={data.cover} className="w-full h-full object-cover opacity-20 blur-3xl scale-125" alt="" />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-black/60"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex items-center p-4 sticky top-0 z-20">
            <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition active:scale-95"
            >
               <ChevronLeft className="text-white" size={24} />
            </button>
        </div>

        <div className="px-5 pt-2 flex gap-5 items-start">
             <div className="w-36 flex-shrink-0 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                 <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-gray-800 relative">
                    <img 
                        src={data.cover} 
                        className="w-full h-full object-cover" 
                        alt={data.bookName}
                        onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.onerror = null;
                            t.src = 'https://via.placeholder.com/300x450?text=No+Image';
                        }} 
                    />
                 </div>
             </div>

             <div className="flex-1 min-w-0 flex flex-col pt-1">
                 <h1 className="text-xl font-black text-white leading-tight mb-3 drop-shadow-md">
                    {data.bookName}
                 </h1>
                 
                 <div className="flex flex-wrap gap-2 text-[10px] font-bold mb-4">
                     {(data.score ?? 0) > 0 && (
                        <span className="flex items-center gap-1 text-black bg-yellow-400 px-1.5 py-0.5 rounded shadow-sm">
                           <Star size={10} fill="black" /> {data.score}
                        </span>
                     )}
                     {data.tag && (
                        <span className="flex items-center gap-1 bg-white/10 text-gray-200 border border-white/10 px-2 py-0.5 rounded backdrop-blur-sm">
                           <Tag size={10} /> {data.tag}
                        </span>
                     )}
                     {data.updateTime && (
                        <span className="flex items-center gap-1 text-gray-400">
                           <Calendar size={10} /> {data.updateTime}
                        </span>
                     )}
                 </div>

                 <div 
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)} 
                    className="relative group cursor-pointer"
                 >
                    <p className={`text-xs text-gray-300 leading-relaxed ${!showFullSynopsis ? 'line-clamp-4' : ''} transition-all duration-300`}>
                        {data.intro}
                    </p>
                    {data.intro.length > 100 && (
                        <div className="mt-1 flex items-center gap-1">
                             <span className="text-[10px] font-bold text-primary group-hover:underline">
                                {showFullSynopsis ? 'Show Less' : 'Read More'}
                             </span>
                        </div>
                    )}
                 </div>
             </div>
        </div>

        <div className="px-5 py-6">
             <div className="flex gap-3">
                 <button 
                    onClick={() => playEpisode(resumeIndex !== -1 ? resumeIndex : 0)} 
                    className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_4px_14px_rgba(229,9,20,0.4)]"
                 >
                    {resumeIndex !== -1 ? <Clock size={20} /> : <Play size={20} fill="currentColor" />}
                    {resumeIndex !== -1 ? `Resume Ep ${resumeIndex + 1}` : 'Play Episode 1'}
                 </button>
                 
                 <button 
                    onClick={toggleFav} 
                    className="flex-none w-14 bg-surface/50 backdrop-blur rounded-xl flex items-center justify-center text-gray-300 border border-white/10 active:scale-95 transition-transform hover:bg-gray-700"
                 >
                    <Heart size={24} fill={isFav ? "#E50914" : "none"} className={isFav ? "text-primary" : ""} />
                 </button>
             </div>
        </div>

        <div className="px-5 pb-4 flex-1">
             <div className="flex items-center justify-between mb-4 border-t border-white/5 pt-4">
                <h3 className="font-bold text-gray-200 text-sm">Episodes</h3>
                <span className="text-xs text-gray-500 bg-surface px-2 py-1 rounded-md">{data.chapters?.length || 0} eps</span>
             </div>
             
             {(!data.chapters || data.chapters.length === 0) ? (
                <div className="text-center py-10 text-gray-500 text-xs bg-surface/30 rounded-xl border border-white/5 border-dashed">
                    No episodes available.
                </div>
             ) : (
                 <div className="grid grid-cols-5 gap-3 pb-20">
                     {data.chapters.map((ep, idx) => {
                         const isCurrent = idx === resumeIndex;
                         return (
                             <button 
                                key={ep.chapterId || idx} 
                                onClick={() => playEpisode(idx)}
                                className={`
                                    relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all
                                    ${isCurrent 
                                        ? 'bg-surface border border-primary text-primary shadow-[0_0_15px_rgba(229,9,20,0.2)]' 
                                        : 'bg-surface/50 text-gray-300 hover:bg-surface border border-transparent'
                                    }
                                `}
                             >
                                {idx + 1}
                                {isCurrent && (
                                    <div className="absolute top-1 right-1 flex space-x-1">
                                         <span className="block w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                    </div>
                                )}
                             </button>
                         );
                     })}
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};