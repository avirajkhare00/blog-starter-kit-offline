'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAllOfflinePosts, getOfflinePost } from '@/lib/offlineStorage';
import { useOfflineDetection } from '@/lib/useOfflineDetection';
import { Post } from '@/interfaces/post';

/**
 * This component handles offline navigation by checking if the requested
 * path is available offline and redirecting to the appropriate page.
 */
export function OfflineFallback() {
  const router = useRouter();
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);
  const isOffline = useOfflineDetection();

  useEffect(() => {
    // Only run this logic once on initial load
    if (!initialized && typeof window !== 'undefined') {
      setInitialized(true);
      
      // Check if we're offline
      if (isOffline) {
        // Don't redirect if already on offline page, saved-posts page, or home
        if (pathname === '/offline' || pathname === '/saved-posts' || pathname === '/') {
          return;
        }
        
        // Check if this is a post page
        const postSlugMatch = pathname.match(/\/posts\/([^\/]+)/);
        if (postSlugMatch) {
          const slug = postSlugMatch[1];
          // Check if this post is available offline
          const post = getOfflinePost(slug);
          if (post) {
            // Post is available offline, no need to redirect
            return;
          }
        }
        
        // Check if we have any saved posts
        const savedPosts = getAllOfflinePosts();
        
        if (savedPosts.length > 0) {
          // We have saved posts, redirect to saved-posts page
          router.replace('/saved-posts');
        } else {
          // No saved posts, redirect to offline page
          router.replace('/offline');
        }
      }
    }
  }, [pathname, router, initialized]);

  // This component doesn't render anything
  return null;
}
