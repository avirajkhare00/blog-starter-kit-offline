'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isOffline, isPostAvailableOffline, cacheImportantAssets } from '@/lib/offlineStorage';
import { useOfflineDetection } from '@/lib/useOfflineDetection';

interface OfflineAwareLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  fallbackHref?: string;
  prefetch?: boolean; // Whether to prefetch the link content
}

/**
 * A Link component that is aware of offline status and redirects to
 * fallback pages when the target is not available offline.
 */
export function OfflineAwareLink({ 
  href, 
  children, 
  className = '', 
  fallbackHref = '/saved-posts',
  prefetch = false
}: OfflineAwareLinkProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isCurrentlyOffline = useOfflineDetection(); // Use the hook for more reliable detection
  const [isAvailableOffline, setIsAvailableOffline] = useState<boolean | null>(null);
  
  // Set isClient to true when component mounts and check offline availability
  useEffect(() => {
    setIsClient(true);
    
    // Check if this is a post link and if it's available offline
    const postMatch = href.match(/\/posts\/([^\/]+)/);
    if (postMatch) {
      const slug = postMatch[1];
      setIsAvailableOffline(isPostAvailableOffline(slug));
    }
  }, [href]);
  
  // Prefetch the content if requested
  useEffect(() => {
    if (prefetch && !isCurrentlyOffline && href.startsWith('/posts/')) {
      // Prefetch the content by adding it to the cache
      const prefetchContent = async () => {
        try {
          await fetch(href, { cache: 'force-cache' });
          console.log(`Prefetched ${href} for potential offline use`);
        } catch (error) {
          console.error(`Failed to prefetch ${href}:`, error);
        }
      };
      
      prefetchContent();
    }
  }, [href, isCurrentlyOffline, prefetch]);
  
  // If not yet mounted on client, render a regular link
  if (!isClient) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  
  const handleClick = (e: React.MouseEvent) => {
    // If we're online and this is a post, try to cache it for later offline use
    if (!isCurrentlyOffline && href.startsWith('/posts/')) {
      // Don't await this, let it happen in the background
      setTimeout(() => cacheImportantAssets(), 100);
      return; // Continue with normal navigation
    }
    
    // Only handle special navigation if we're offline
    if (isCurrentlyOffline || isOffline()) { // Use both detection methods for reliability
      // Check if this is a post link
      const postMatch = href.match(/\/posts\/([^\/]+)/);
      if (postMatch) {
        const slug = postMatch[1];
        // Check if the post is available offline
        if (!isPostAvailableOffline(slug)) {
          e.preventDefault();
          // Navigate to fallback page
          router.push(fallbackHref);
        }
      }
    }
  };
  
  // Add visual indication for offline availability if we're offline
  const linkClass = `${className} ${isCurrentlyOffline && href.startsWith('/posts/') ? 
    (isAvailableOffline ? 'offline-available' : 'offline-unavailable') : ''}`.trim();
  
  return (
    <Link href={href} className={linkClass} onClick={handleClick}>
      {children}
      {isCurrentlyOffline && href.startsWith('/posts/') && isAvailableOffline === false && (
        <span className="inline-block ml-1 text-xs text-red-500">
          (unavailable offline)
        </span>
      )}
    </Link>
  );
}
