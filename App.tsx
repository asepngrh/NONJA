import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Splash } from './pages/Splash';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Search } from './pages/Search';
import { Detail } from './pages/Detail';
import { PlayerPage } from './pages/PlayerPage';
import { MyList } from './pages/MyList';
import { Profile } from './pages/Profile';
import { storage } from './services/storage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = storage.getUser();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/auth" element={<Auth />} />
        
        <Route path="/*" element={
            <ProtectedRoute>
                <Layout>
                    <Routes>
                        <Route path="/home" element={<Home />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/detail/:id" element={<Detail />} />
                        <Route path="/mylist" element={<MyList />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </Layout>
            </ProtectedRoute>
        } />
        
        <Route path="/watch/:bookId/:index" element={
            <ProtectedRoute>
                <PlayerPage />
            </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
