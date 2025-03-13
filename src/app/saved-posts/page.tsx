'use client';

import { useEffect, useState } from 'react';
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { getAllOfflinePosts, isOffline } from '@/lib/offlineStorage';
import { Post } from '@/interfaces/post';
import Link from 'next/link';
import Image from 'next/image';
import DateFormatter from '@/app/_components/date-formatter';

export default function SavedPostsPage() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [offline, setOffline] = useState<boolean>(false);

  useEffect(() => {
    // Get all saved posts
    const posts = getAllOfflinePosts();
    setSavedPosts(posts);
    
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

  return (
    <main>
      <Container>
        <Header />
        <div className="py-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight mb-4">
            Saved Posts
          </h1>
          
          {offline && (
            <div className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 p-4 rounded-md mb-8">
              <p className="font-medium">You are currently offline</p>
              <p className="text-sm">Only saved posts are available</p>
            </div>
          )}
          
          {savedPosts.length === 0 ? (
            <div className="text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <h2 className="text-xl font-bold mb-2">No saved posts yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Save posts for offline reading to see them here
              </p>
              <Link 
                href="/"
                className="bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-3 px-12 lg:px-8 duration-200 transition-colors mb-6 lg:mb-0"
              >
                Browse posts
              </Link>
            </div>
          ) : (
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
          )}
        </div>
      </Container>
    </main>
  );
}
