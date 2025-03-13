'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAllOfflinePosts, cacheImportantAssets } from '@/lib/offlineStorage';
import { Post } from '@/interfaces/post';
import Link from 'next/link';
import Image from 'next/image';
import DateFormatter from '@/app/_components/date-formatter';
import { useOfflineDetection } from '@/lib/useOfflineDetection';

/**
 * This component provides navigation to saved posts when offline
 * and shows a notification when the user goes offline
 */
export function OfflineNavigator() {
  // Use our custom hook for more reliable offline detection
  const isOffline = useOfflineDetection();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showOfflineNotification, setShowOfflineNotification] = useState<boolean>(false);

  // Load saved posts when component mounts or when offline status changes
  useEffect(() => {
    loadSavedPosts();
    
    // Show notification when going offline
    if (isOffline) {
      setShowOfflineNotification(true);
      // Hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowOfflineNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setShowOfflineNotification(false);
    }
  }, [isOffline]);

  // Memoize the loadSavedPosts function to avoid unnecessary re-renders
  const loadSavedPosts = useCallback(() => {
    try {
      const posts = getAllOfflinePosts();
      setSavedPosts(posts);
    } catch (error) {
      console.error('Error loading saved posts:', error);
    }
  }, []);

  // Refresh cached content when going online
  useEffect(() => {
    if (!isOffline) {
      // When coming back online, refresh cached content
      cacheImportantAssets().catch(err => {
        console.error('Failed to refresh cached content:', err);
      });
    }
  }, [isOffline]);

  // Don't render the navigator button if there are no saved posts
  if (savedPosts.length === 0 && !showOfflineNotification) return null;

  return (
    <>
      {/* Offline notification */}
      {showOfflineNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md animate-fade-in-down">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="h-6 w-6 text-yellow-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">You are offline</p>
              <p className="text-sm">You can still access your saved posts.</p>
            </div>
            <button 
              onClick={() => setShowOfflineNotification(false)}
              className="ml-auto text-yellow-500 hover:text-yellow-700"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Saved posts navigator */}
      <div className="fixed bottom-16 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
          aria-label="Offline navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          
          {/* Badge showing number of saved posts */}
          {savedPosts.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {savedPosts.length}
            </span>
          )}
        </button>
        
        {isOpen && (
          <div className="absolute bottom-14 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Saved Posts</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {savedPosts.length > 0 ? (
              <>
                <div className="max-h-80 overflow-y-auto">
                  {savedPosts.map((post) => (
                    <Link 
                      key={post.slug} 
                      href={`/posts/${post.slug}`}
                      className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mb-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center">
                        <div className="relative h-12 w-12 flex-shrink-0 mr-3">
                          <Image
                            src={post.coverImage}
                            alt=""
                            className="object-cover rounded"
                            fill
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {post.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            <DateFormatter dateString={post.date} />
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link 
                    href="/saved-posts"
                    className="block text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    View All Saved Posts
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p>No saved posts yet.</p>
                <p className="mt-2 text-sm">Save posts to read them offline.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
