import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { Drama } from '../types';

export const MyList: React.FC = () => {
  const navigate = useNavigate();
  const [favs, setFavs] = useState<Drama[]>([]);

  useEffect(() => {
    setFavs(storage.getFavorites());
  }, []);

  return (
    <div className="min-h-screen bg-background pb-safe">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-20 px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-bold">My List</h2>
      </div>

      {favs.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
           <p>No favorites yet.</p>
           <button onClick={() => navigate('/explore')} className="mt-4 px-6 py-2 bg-surface rounded-full text-sm">Find Content</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 p-4">
          {favs.map(d => (
            <div key={d.bookId} onClick={() => navigate(`/detail/${d.bookId}`)} className="cursor-pointer active:opacity-80">
              <div className="aspect-[2/3] rounded bg-gray-800 overflow-hidden mb-2 relative">
                <img src={d.cover} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-[10px] text-gray-300 line-clamp-1">{d.bookName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
