'use client';

import { useEffect, useState } from 'react';
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { cacheImportantAssets } from '@/lib/offlineStorage';
import { Post } from '@/interfaces/post';
import Image from 'next/image';
import DateFormatter from '@/app/_components/date-formatter';
import { useRouter } from 'next/navigation';
import { OfflineAwareLink } from '@/app/_components/offline-aware-link';
import { useOfflineStorage } from '@/lib/useOfflineStorage';

export default function SavedPostsPage() {
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const router = useRouter();
  
  // Use our new useOfflineStorage hook for better offline functionality
  const { 
    savedPosts, 
    isLoading, 
    isOffline, 
    removePost 
  } = useOfflineStorage();

  // When online, refresh cached content
  useEffect(() => {
    if (!isOffline) {
      cacheImportantAssets().catch(err => {
        console.error('Failed to refresh cached content:', err);
      });
    }
  }, [isOffline]);
  
  // Function to delete a post from offline storage
  const deletePost = async (slug: string) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      const success = await removePost(slug);
      if (success) {
        // Close the confirmation dialog
        setDeleteConfirmation(null);
      } else {
        console.error(`Failed to delete post ${slug}`);
      }
    } catch (error) {
      console.error(`Error deleting post ${slug}:`, error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Function to confirm post deletion
  const confirmDelete = (slug: string) => {
    setDeleteConfirmation(slug);
  };
  
  // Function to cancel deletion
  const cancelDelete = () => {
    setDeleteConfirmation(null);
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
            
            {!isOffline && Object.keys(savedPosts).length > 0 && (
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </div>
          
          {isOffline && (
            <div className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 p-4 rounded-md mb-8 flex items-center">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-300 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <p className="font-medium">You are currently offline</p>
                <p className="text-sm">Only saved posts are available</p>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-lg">Loading saved posts...</p>
            </div>
          ) : Object.keys(savedPosts).length === 0 ? (
            <div className="text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <h2 className="text-xl font-bold mb-2">No saved posts yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Save posts for offline reading to see them here
              </p>
              <OfflineAwareLink 
                href="/"
                className="bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-3 px-12 lg:px-8 duration-200 transition-colors mb-6 lg:mb-0"
              >
                {isOffline ? 'Return Home' : 'Browse posts'}
              </OfflineAwareLink>
            </div>
          ) : (
            <>
              <p className="text-lg mb-6">
                You have {Object.keys(savedPosts).length} post{Object.keys(savedPosts).length !== 1 ? 's' : ''} saved for offline reading.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(savedPosts).map((post) => (
                  <div key={post.slug} className="relative group border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    {/* Delete button */}
                    <button
                      onClick={() => confirmDelete(post.slug)}
                      className="absolute top-2 right-2 z-10 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Delete ${post.title}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    
                    <OfflineAwareLink 
                      href={`/posts/${post.slug}`}
                      className="block"
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
                    </OfflineAwareLink>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Delete confirmation modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Delete saved post?</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this post from your saved posts? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deletePost(deleteConfirmation)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="inline-block animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
