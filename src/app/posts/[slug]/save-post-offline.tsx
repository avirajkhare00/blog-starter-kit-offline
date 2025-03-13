'use client';

import { Post } from "@/interfaces/post";
import { SaveOfflineButton } from "@/app/_components/save-offline-button";
import { useOfflineDetection } from "@/lib/useOfflineDetection";
import { isPostAvailableOffline, preloadSavedPostsPage } from "@/lib/offlineStorage";
import { useState, useEffect } from "react";
import Link from "next/link";

interface SavePostForOfflineProps {
  post: Post & { htmlContent?: string };
}

/**
 * Enhanced component for saving posts for offline reading
 * Uses the new SaveOfflineButton component and provides additional offline context
 */
export function SavePostForOffline({ post }: SavePostForOfflineProps) {
  const isOffline = useOfflineDetection();
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    // Check if the post is already saved
    setIsSaved(isPostAvailableOffline(post.slug));
    
    // Preload the saved posts page for offline access
    if (!isOffline) {
      preloadSavedPostsPage();
    }
  }, [post.slug, isOffline]);

  return (
    <div className="mt-8">
      <div className="flex flex-col items-center space-y-4">
        {/* Show different UI based on offline status */}
        {isOffline ? (
          // Offline UI
          <div className="w-full max-w-lg">
            {isSaved ? (
              // Post is available offline
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Available Offline</h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>This post is saved for offline reading. You can access it anytime, even without an internet connection.</p>
                  </div>
                </div>
              </div>
            ) : (
              // Post is not available offline
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Offline Mode</h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>You are currently offline and this post has not been saved for offline reading.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Link to saved posts */}
            <div className="mt-4 text-center">
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
          </div>
        ) : (
          // Online UI with SaveOfflineButton
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <SaveOfflineButton post={post} htmlContent={post.htmlContent} />
            
            {isSaved && (
              <Link 
                href="/saved-posts"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                View all saved posts
              </Link>
            )}
          </div>
        )}
        
        {/* Offline reading tips */}
        {!isOffline && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-lg text-center">
            <p>Save this post to read it later, even when you're offline. Saved posts are stored on your device and can be accessed anytime.</p>
          </div>
        )}
      </div>
    </div>
  );
}
