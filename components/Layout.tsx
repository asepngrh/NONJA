import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Search, List, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { icon: Home, label: 'Home', route: '/home' },
    { icon: Compass, label: 'Explore', route: '/explore' },
    { icon: Search, label: 'Search', route: '/search' },
    { icon: List, label: 'My List', route: '/mylist' },
    { icon: User, label: 'Profile', route: '/profile' },
  ];

  // Hide nav on player or splash or auth
  if (path === '/' || path === '/auth' || path.startsWith('/watch')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-800 pb-safe safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = path === item.route;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isFullScreen = location.pathname.startsWith('/watch');
  
  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <main className={`flex-1 ${!isFullScreen ? 'pb-20' : ''}`}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
