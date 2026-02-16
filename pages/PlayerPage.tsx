import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Player } from '../components/Player';
import { api } from '../services/api';

export const PlayerPage: React.FC = () => {
    const { bookId, index } = useParams<{ bookId: string; index: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Attempt to get title from navigation state
    const [title, setTitle] = useState<string>(location.state?.bookName || '');
    const chapterIndex = parseInt(index || '0', 10);

    // If title is missing (direct access), fetch it
    useEffect(() => {
        if (!title && bookId) {
            api.getChapters(bookId).then(res => {
                const rawData = res.data || res;
                const fetchedTitle = rawData.bookName || rawData.title || rawData.name;
                if (fetchedTitle) setTitle(fetchedTitle);
            }).catch(console.error);
        }
    }, [bookId, title]);

    const handleNext = () => {
        navigate(`/watch/${bookId}/${chapterIndex + 1}`, { replace: true, state: { bookName: title } });
    };

    const handlePrev = () => {
        if (chapterIndex > 0) {
            navigate(`/watch/${bookId}/${chapterIndex - 1}`, { replace: true, state: { bookName: title } });
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    if (!bookId) return null;

    return (
        <Player 
            bookId={bookId} 
            chapterIndex={chapterIndex} 
            title={title}
            onNext={handleNext} 
            onPrev={handlePrev}
            onClose={handleClose}
        />
    );
};