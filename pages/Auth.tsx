import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    // Simulate auth
    storage.setUser({
      username,
      isGuest: false
    });
    navigate('/home');
  };

  const handleGuest = () => {
    storage.setUser({
      username: 'Guest',
      isGuest: true
    });
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-8 relative">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none"></div>
      
      <div className="z-10 w-full max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-gray-400 mb-8">
          {isLogin ? 'Enter your details to sign in' : 'Register to start streaming'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">USERNAME</label>
            <input
              type="text"
              className="w-full bg-surface border border-gray-700 rounded-lg p-4 focus:border-primary focus:outline-none transition text-white"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">EMAIL</label>
              <input
                type="email"
                className="w-full bg-surface border border-gray-700 rounded-lg p-4 focus:border-primary focus:outline-none transition text-white"
                placeholder="Enter email"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">PASSWORD</label>
            <input
              type="password"
              className="w-full bg-surface border border-gray-700 rounded-lg p-4 focus:border-primary focus:outline-none transition text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-4 rounded-lg mt-6 active:scale-95 transition-transform"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-white"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
          
          <div className="w-full border-t border-gray-800"></div>
          
          <button
            onClick={handleGuest}
            className="text-sm font-medium text-white px-6 py-2 border border-gray-600 rounded-full hover:bg-gray-800"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
