'use client';

import { Post } from "@/interfaces/post";
import { savePostForOffline, isPostAvailableOffline, preloadSavedPostsPage } from "@/lib/offlineStorage";
import { useState, useEffect } from "react";
import Link from "next/link";

interface SavePostForOfflineProps {
  post: Post & { htmlContent?: string };
}

export function SavePostForOffline({ post }: SavePostForOfflineProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if the post is already saved
    setIsSaved(isPostAvailableOffline(post.slug));
    
    // Set initial online status
    setIsOnline(navigator.onLine);
    
    // Add event listeners for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Preload the saved posts page for offline access
    if (navigator.onLine) {
      preloadSavedPostsPage();
    }
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [post.slug]);

  const handleSaveForOffline = () => {
    // Save the post with the HTML content
    savePostForOffline({
      ...post,
      // Store the HTML content in the content field for offline use
      content: post.htmlContent || post.content
    });
    setIsSaved(true);
    
    // Also preload the saved posts page
    preloadSavedPostsPage();
  };

  if (!isOnline && isSaved) {
    return (
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-md mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>This post is available offline</span>
        </div>
        <Link 
          href="/saved-posts"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          View all saved posts
        </Link>
      </div>
    );
  }

  if (!isOnline && !isSaved) {
    return (
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded-md mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>You're offline and this post is not available offline</span>
        </div>
        <Link 
          href="/saved-posts"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          View all saved posts
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 text-center">
      {!isSaved ? (
        <button
          onClick={handleSaveForOffline}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Save for offline reading
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Saved for offline reading</span>
          </div>
          <Link 
            href="/saved-posts"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            View all saved posts
          </Link>
        </div>
      )}
    </div>
  );
}
