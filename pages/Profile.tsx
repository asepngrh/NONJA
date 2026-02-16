import React from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { User, LogOut, Trash2, Moon, ChevronRight } from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = storage.getUser();

  const handleLogout = () => {
    storage.clearUser();
    navigate('/auth');
  };

  const clearCache = () => {
     localStorage.removeItem('nonje_search_history');
     localStorage.removeItem('nonje_history');
     alert('Cache Cleared');
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
        <div className="p-6 flex flex-col items-center border-b border-gray-800">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-4 border-2 border-primary">
                <User size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold">{user?.username || 'Guest'}</h2>
            <p className="text-sm text-gray-500">{user?.isGuest ? 'Limited Access' : 'Premium Member'}</p>
        </div>

        <div className="p-4 space-y-4">
            <div className="bg-surface rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <Moon size={20} className="text-gray-400" />
                        <span className="text-sm">Dark Mode</span>
                    </div>
                    <div className="w-10 h-5 bg-primary rounded-full relative">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                </div>
                <button onClick={clearCache} className="w-full flex items-center justify-between p-4 active:bg-gray-700">
                    <div className="flex items-center gap-3">
                        <Trash2 size={20} className="text-gray-400" />
                        <span className="text-sm">Clear Cache</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                </button>
            </div>

            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-4 bg-surface rounded-lg text-red-500 text-sm font-bold active:bg-gray-700"
            >
                <LogOut size={18} />
                Logout
            </button>

            <div className="text-center text-[10px] text-gray-600 mt-8">
                NONJE v1.0.0 (Web Build)
            </div>
        </div>
    </div>
  );
};
