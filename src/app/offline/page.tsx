'use client';

import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { useEffect, useState } from "react";
import { getAllOfflinePosts } from "@/lib/offlineStorage";
import { Post } from '@/interfaces/post';
import Link from "next/link";
import Image from "next/image";
import DateFormatter from "@/app/_components/date-formatter";

export default function OfflinePage() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  
  useEffect(() => {
    // Get all saved posts when the component mounts
    try {
      const posts = getAllOfflinePosts();
      setSavedPosts(posts);
    } catch (error) {
      console.error('Error loading saved posts:', error);
    }
  }, []);

  return (
    <main>
      <Container>
        <Header />
        <div className="py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 px-4 py-2 rounded-md mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>You are currently offline</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight mb-6">
              Offline Mode
            </h1>
            
            <p className="text-lg md:text-xl mb-4 max-w-2xl mx-auto">
              It looks like you&apos;re not connected to the internet. Only previously saved content is available.
            </p>
            
            <div className="flex justify-center space-x-4 mb-12">
              <Link 
                href="/"
                className="bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-3 px-8 duration-200 transition-colors"
              >
                Go to Homepage
              </Link>
              
              <Link 
                href="/saved-posts"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 duration-200 transition-colors"
              >
                View Saved Posts
              </Link>
            </div>
          </div>
          
          {savedPosts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Your Saved Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPosts.slice(0, 3).map((post) => (
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
              
              {savedPosts.length > 3 && (
                <div className="text-center mt-8">
                  <Link 
                    href="/saved-posts"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all {savedPosts.length} saved posts
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {savedPosts.length === 0 && (
            <div className="text-center bg-gray-50 dark:bg-gray-800 p-8 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <h2 className="text-xl font-bold mb-2">No saved posts yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                When you&apos;re back online, save posts for offline reading to access them anytime.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Look for the &quot;Save for offline reading&quot; button on any blog post.
              </p>
            </div>
          )}
          
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Offline Tips</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Save your favorite posts when online to read them later</li>
              <li>All images and content of saved posts will be available offline</li>
              <li>Your internet connection will be automatically detected when it returns</li>
              <li>New content will be available once you&apos;re back online</li>
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}

export const metadata = {
  title: 'Offline | Blog',
  description: 'You are currently offline - Access your saved blog posts',
};
