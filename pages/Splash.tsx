import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { storage } from '../services/storage';

export const Splash: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('Connecting to NONJE...');
  const [retryVisible, setRetryVisible] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const checkServer = async () => {
    setStatus('Connecting to NONJE...');
    setRetryVisible(false);
    
    // Safety timeout for "Slow response"
    // Render free tier can take up to 30-50s to wake up.
    const slowTimer = setTimeout(() => {
      setStatus('Waking up server... (this may take up to 30s)');
    }, 4000);

    try {
      await api.ping();
      clearTimeout(slowTimer);
      // Success
      const user = storage.getUser();
      navigate(user ? '/home' : '/auth');
    } catch (e) {
      clearTimeout(slowTimer);
      // Increase max attempts to handle Render cold start
      // Try 5 times. With 20s timeout in api.ts, this covers plenty of time.
      if (attempts < 5) {
        setStatus(`Server is sleeping... waking up (${attempts + 1}/5)`);
        setTimeout(() => {
          setAttempts(p => p + 1);
        }, 2000); // Wait 2s before next attempt
      } else {
        setStatus('Connection Failed. Server might be down.');
        setRetryVisible(true);
      }
    }
  };

  useEffect(() => {
    checkServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-red-900 opacity-50 z-0"></div>
      
      <div className="z-10 flex flex-col items-center space-y-6">
        <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.5)]">
            <span className="text-4xl font-bold text-white tracking-tighter">N</span>
        </div>
        
        <h1 className="text-3xl font-bold tracking-widest text-white">NONJE</h1>
        <p className="text-gray-400 text-sm tracking-wide">Nonton Aje</p>

        <div className="mt-8 h-8 flex flex-col items-center min-w-[200px]">
          {!retryVisible && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
          <p className="text-xs text-gray-500 text-center px-4 animate-pulse">{status}</p>
        </div>

        {retryVisible && (
          <button
            onClick={() => {
              setAttempts(0);
              // Trigger checkServer via useEffect by resetting attempts
            }}
            className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition active:scale-95"
          >
            Retry Connection
          </button>
        )}
      </div>
      
      <div className="absolute bottom-8 text-gray-600 text-[10px]">
        v1.0.1 • Network Optimized
      </div>
    </div>
  );
};