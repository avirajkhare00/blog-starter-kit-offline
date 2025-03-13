'use client';

import { useState, useEffect } from 'react';
import { savePostForOffline, isPostAvailableOffline, removePostFromOfflineStorage } from '@/lib/offlineStorage';
import { Post } from '@/interfaces/post';
import { useOfflineDetection } from '@/lib/useOfflineDetection';

interface SaveOfflineButtonProps {
  post: Post;
  htmlContent?: string;
  className?: string;
}

/**
 * Button component that allows users to save/remove posts for offline reading
 */
export function SaveOfflineButton({ post, htmlContent, className = '' }: SaveOfflineButtonProps) {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const isOffline = useOfflineDetection();

  // Check if the post is already saved for offline reading
  useEffect(() => {
    setIsSaved(isPostAvailableOffline(post.slug));
  }, [post.slug]);

  const handleSaveToggle = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (isSaved) {
        // Remove post from offline storage
        await removePostFromOfflineStorage(post.slug);
        setIsSaved(false);
        showFeedbackMessage('Post removed from offline reading');
      } else {
        // Save post for offline reading
        savePostForOffline({ ...post, htmlContent });
        setIsSaved(true);
        showFeedbackMessage('Post saved for offline reading');
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      showFeedbackMessage('Failed to update offline status');
    } finally {
      setIsProcessing(false);
    }
  };

  const showFeedbackMessage = (message: string) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleSaveToggle}
        disabled={isProcessing || isOffline}
        className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isSaved
            ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800'
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800'
        } ${isOffline ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        aria-label={isSaved ? 'Remove from offline reading' : 'Save for offline reading'}
      >
        {isProcessing ? (
          <span className="inline-block animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full mr-2"></span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill={isSaved ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isSaved ? 0 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        )}
        {isSaved ? 'Saved Offline' : 'Save Offline'}
      </button>

      {/* Feedback message */}
      {showFeedback && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-10 animate-fade-in-down">
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}
