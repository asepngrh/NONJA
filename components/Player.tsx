import React, { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../services/api';
import { ChevronLeft, SkipBack, SkipForward, Play, Pause, AlertCircle, RefreshCw, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

interface PlayerProps {
  bookId: string;
  chapterIndex: number;
  title?: string; // Add Title Prop
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const Player: React.FC<PlayerProps> = ({ bookId, chapterIndex, title, onNext, onPrev, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  // Auto Play state
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [showNextPrompt, setShowNextPrompt] = useState(false);

  // Initialize Player (Step 1 & 2 from prompts)
  const initPlayer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const videoUrl = await api.getVideoUrl(bookId, chapterIndex);
      if (videoUrl) {
        setUrl(videoUrl);
      } else {
        throw new Error("Source unavailable");
      }
    } catch (e) {
      setError("Playback failed.");
      if (retryCount < 2) {
          // Stream reliability auto-retry
          setTimeout(() => {
              setRetryCount(p => p + 1);
              initPlayer();
          }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [bookId, chapterIndex, retryCount]);

  useEffect(() => {
    setRetryCount(0); // Reset retry on new episode
    setShowNextPrompt(false); // Reset prompt
    initPlayer();
  }, [bookId, chapterIndex]);

  // Video Event Handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
        setDuration(videoRef.current.duration);
        // Auto play
        videoRef.current.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (autoPlayNext) {
      onNext();
    } else {
      setShowNextPrompt(true);
      setControlsVisible(false); // Hide standard controls to show prompt cleanly
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Double tap simulation
  const lastTapRef = useRef<number>(0);
  const handleTouch = (e: React.TouchEvent) => {
    // Show controls on tap if not showing next prompt
    if (!showNextPrompt && !error) {
        setControlsVisible(true);
        if (videoRef.current) {
            if (controlsTimer.current) clearTimeout(controlsTimer.current);
            controlsTimer.current = setTimeout(() => setControlsVisible(false), 3000);
        }
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        // Double tap logic
        const touchX = e.changedTouches[0].clientX;
        const width = window.innerWidth;
        if (touchX < width / 3) seek(-10);
        else if (touchX > (width * 2) / 3) seek(10);
    }
    lastTapRef.current = now;
  };

  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
      // Hide controls initially after 3s
      if (!showNextPrompt && !error) {
        controlsTimer.current = setTimeout(() => setControlsVisible(false), 3000);
      }
      return () => { if(controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [showNextPrompt, error]);

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouch}
        onClick={() => {
            if (!showNextPrompt && !error) {
                setControlsVisible(true);
                if(controlsTimer.current) clearTimeout(controlsTimer.current);
                controlsTimer.current = setTimeout(() => setControlsVisible(false), 3000);
            }
        }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-white flex-col gap-2 bg-black">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium animate-pulse">Buffering...</span>
        </div>
      )}

      {error && !loading && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-white space-y-6 p-6 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-2 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <AlertCircle size={40} className="text-red-500" />
            </div>
            
            <div className="space-y-2">
                <h3 className="text-xl font-bold">Playback Error</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                    {error === 'Stream error' 
                        ? 'The video stream was interrupted or the format is not supported.' 
                        : 'Unable to load this episode. The server might be busy or the resource is missing.'}
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
                <button 
                    onClick={initPlayer} 
                    className="w-full py-3.5 bg-white text-black rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition"
                >
                    <RefreshCw size={18} /> Try Again
                </button>
                
                <button 
                    onClick={onNext} 
                    className="w-full py-3.5 bg-surface border border-gray-700 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition"
                >
                    <SkipForward size={18} /> Play Next Episode
                </button>
            </div>
            
            <button onClick={onClose} className="text-xs text-gray-500 underline mt-4 hover:text-gray-300">
                Return to Details
            </button>
        </div>
      )}

      {url && !error && (
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-contain"
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={() => setError('Stream error')}
        />
      )}

      {/* Next Episode Prompt */}
      {showNextPrompt && !loading && !error && (
        <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
             <div className="text-center space-y-2">
                <h3 className="text-white font-bold text-xl">Episode Finished</h3>
                <p className="text-gray-400 text-sm">Up Next: Episode {chapterIndex + 2}</p>
             </div>
             
             <button 
                onClick={onNext} 
                className="px-8 py-3 bg-primary text-white rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition active:scale-95"
             >
                 <Play fill="currentColor" size={20} /> Play Next
             </button>
             
             <div className="flex gap-6">
                 <button 
                    onClick={() => { 
                        setShowNextPrompt(false); 
                        seek(-duration); // reset to 0
                        if (videoRef.current) {
                            videoRef.current.play();
                            setIsPlaying(true);
                        }
                    }} 
                    className="text-gray-300 text-sm hover:text-white"
                 >
                     Replay
                 </button>
                 <button onClick={onClose} className="text-gray-300 text-sm hover:text-white">
                     Close
                 </button>
             </div>
        </div>
      )}

      {/* Controls Overlay */}
      {controlsVisible && !loading && !error && !showNextPrompt && (
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-4 z-20">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={onClose} className="flex-shrink-0"><ChevronLeft color="white" /></button>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-white font-bold text-sm truncate max-w-[200px]">{title || 'Unknown Title'}</span>
                        <span className="text-gray-300 text-[10px]">Episode {chapterIndex + 1}</span>
                    </div>
                </div>
                
                <div className="flex gap-4 items-center flex-shrink-0">
                    <button 
                       onClick={(e) => { e.stopPropagation(); setAutoPlayNext(!autoPlayNext); }} 
                       className="flex items-center gap-2 text-xs font-medium text-white/90 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md hover:bg-black/60 transition"
                    >
                       <span>Auto Play</span>
                       {autoPlayNext ? <ToggleRight className="text-primary" size={20} /> : <ToggleLeft className="text-gray-400" size={20} />}
                    </button>
                    <Settings color="white" size={20} />
                </div>
            </div>

            {/* Center Play Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-8 items-center">
                 <button onClick={() => seek(-10)}><SkipBack color="white" size={32} /></button>
                 <button onClick={togglePlay} className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur">
                     {isPlaying ? <Pause fill="white" size={32} /> : <Play fill="white" size={32} className="ml-1" />}
                 </button>
                 <button onClick={() => seek(10)}><SkipForward color="white" size={32} /></button>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] text-gray-300 font-mono">
                    <span>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
                    <span>{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
                </div>
                <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden relative">
                    <div 
                        className="h-full bg-primary absolute left-0 top-0"
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-2">
                    <button onClick={onPrev} className="text-xs text-white disabled:opacity-50" disabled={chapterIndex === 0}>Prev Ep</button>
                    <button onClick={onNext} className="text-xs text-white">Next Ep</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};