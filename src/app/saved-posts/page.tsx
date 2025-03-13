'use client';

import { useEffect, useState } from 'react';
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { getAllOfflinePosts, isOffline } from '@/lib/offlineStorage';
import { Post } from '@/interfaces/post';
import Link from 'next/link';
import Image from 'next/image';
import DateFormatter from '@/app/_components/date-formatter';
import { useRouter } from 'next/navigation';

export default function SavedPostsPage() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [offline, setOffline] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Get all saved posts
    try {
      const posts = getAllOfflinePosts();
      setSavedPosts(posts);
    } catch (error) {
      console.error('Error loading saved posts:', error);
    } finally {
      setLoading(false);
    }
    
    // Check if offline
    setOffline(isOffline());
    
    // Add event listeners for online/offline events
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Function to refresh the posts list
  const refreshPosts = () => {
    try {
      const posts = getAllOfflinePosts();
      setSavedPosts(posts);
    } catch (error) {
      console.error('Error refreshing saved posts:', error);
    }
  };

  return (
    <main>
      <Container>
        <Header />
        <div className="py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight mb-4 md:mb-0">
              Saved Posts
            </h1>
            
            {!offline && savedPosts.length > 0 && (
              <button 
                onClick={refreshPosts}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </div>
          
          {offline && (
            <div className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 p-4 rounded-md mb-8">
              <p className="font-medium">You are currently offline</p>
              <p className="text-sm">Only saved posts are available</p>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-lg">Loading saved posts...</p>
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <h2 className="text-xl font-bold mb-2">No saved posts yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Save posts for offline reading to see them here
              </p>
              {!offline && (
                <Link 
                  href="/"
                  className="bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-3 px-12 lg:px-8 duration-200 transition-colors mb-6 lg:mb-0"
                >
                  Browse posts
                </Link>
              )}
            </div>
          ) : (
            <>
              <p className="text-lg mb-6">
                You have {savedPosts.length} post{savedPosts.length !== 1 ? 's' : ''} saved for offline reading.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPosts.map((post) => (
                  <Link 
                    key={post.slug} 
                    href={`/posts/${post.slug}`}
                    className="group border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.coverImage}
                        alt={`Cover Image for ${post.title}`}
                        className="object-cover object-center"
                        fill
                        priority={true}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                        {post.title}
                      </h3>
                      <div className="text-sm text-gray-500 mb-2">
                        <DateFormatter dateString={post.date} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
