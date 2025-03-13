/**
 * Utility functions for managing offline data
 * This helps with storing and retrieving blog posts when offline
 */

import { Post } from "@/interfaces/post";

const OFFLINE_POSTS_KEY = 'offline-blog-posts';

// Define a type for our stored post that includes HTML content
interface StoredPost extends Post {
  htmlContent?: string;
}

/**
 * Save a blog post to local storage for offline access
 */
export const savePostForOffline = (post: Post & { htmlContent?: string }): void => {
  try {
    // Get existing posts from storage
    const existingPostsJSON = localStorage.getItem(OFFLINE_POSTS_KEY);
    const existingPosts: Record<string, StoredPost> = existingPostsJSON 
      ? JSON.parse(existingPostsJSON) 
      : {};
    
    // Add or update the post
    // Make sure we store the HTML content for offline viewing
    existingPosts[post.slug] = {
      ...post,
      // If htmlContent is provided, use it for offline viewing
      content: post.htmlContent || post.content
    };
    
    // Save back to storage
    localStorage.setItem(OFFLINE_POSTS_KEY, JSON.stringify(existingPosts));
    
    // Also cache the post page in the Cache API for offline access
    if ('caches' in window) {
      // Cache multiple URLs related to this post
      const urlsToCache = [
        `/posts/${post.slug}`,
        post.coverImage, // Cache the cover image
        `/assets/blog/authors/${post.author.picture.split('/').pop()}` // Cache author image
      ];
      
      // Open the cache
      caches.open('blog-content').then(cache => {
        // Cache each URL
        urlsToCache.forEach(url => {
          fetch(url)
            .then(response => {
              cache.put(url, response.clone());
              console.log(`Cached ${url} for offline access`);
            })
            .catch(err => {
              console.error(`Failed to cache ${url}:`, err);
            });
        });
      });
      
      // Also cache the saved-posts page and offline page
      caches.open('pages').then(cache => {
        const pagesToCache = [
          '/saved-posts',
          '/offline'
        ];
        
        pagesToCache.forEach(url => {
          fetch(url)
            .then(response => {
              cache.put(url, response.clone());
              console.log(`Cached ${url} for offline access`);
            })
            .catch(err => {
              console.error(`Failed to cache ${url}:`, err);
            });
        });
      });
    }
    
    console.log(`Post "${post.title}" saved for offline reading`);
  } catch (error) {
    console.error('Failed to save post for offline reading:', error);
  }
};

/**
 * Get a blog post from local storage
 */
export const getOfflinePost = (slug: string): StoredPost | null => {
  try {
    const postsJSON = localStorage.getItem(OFFLINE_POSTS_KEY);
    if (!postsJSON) return null;
    
    const posts: Record<string, StoredPost> = JSON.parse(postsJSON);
    return posts[slug] || null;
  } catch (error) {
    console.error('Failed to retrieve offline post:', error);
    return null;
  }
};

/**
 * Get all available offline posts
 */
export const getAllOfflinePosts = (): StoredPost[] => {
  try {
    const postsJSON = localStorage.getItem(OFFLINE_POSTS_KEY);
    if (!postsJSON) return [];
    
    const posts: Record<string, StoredPost> = JSON.parse(postsJSON);
    return Object.values(posts).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Failed to retrieve offline posts:', error);
    return [];
  }
};

/**
 * Preload the saved posts page for offline access
 */
export const preloadSavedPostsPage = (): void => {
  if ('caches' in window) {
    // Pages to cache for offline access
    const pagesToCache = [
      '/saved-posts',
      '/offline',
      '/' // Also cache the home page
    ];
    
    // Open the cache
    caches.open('pages').then(cache => {
      // Cache each page
      pagesToCache.forEach(url => {
        fetch(url)
          .then(response => {
            cache.put(url, response.clone());
            console.log(`Cached ${url} for offline access`);
          })
          .catch(err => {
            console.error(`Failed to cache ${url}:`, err);
          });
      });
    });
    
    // Also cache important assets
    caches.open('static-assets').then(cache => {
      const assetsToCache = [
        '/manifest.json',
        '/favicon/favicon.ico',
        '/favicon/android-chrome-192x192.png',
        '/favicon/android-chrome-512x512.png'
      ];
      
      assetsToCache.forEach(url => {
        fetch(url)
          .then(response => {
            cache.put(url, response.clone());
          })
          .catch(err => {
            console.error(`Failed to cache ${url}:`, err);
          });
      });
    });
  }
};

/**
 * Check if the browser is currently offline
 * Note: This is a simple check and may not be reliable in all cases.
 * For more reliable detection, use the useOfflineDetection hook in client components.
 */
export const isOffline = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return !navigator.onLine;
};

/**
 * Check if a specific post is available offline by its slug
 */
export const isPostAvailableOffline = (slug: string): boolean => {
  try {
    const postsJSON = localStorage.getItem(OFFLINE_POSTS_KEY);
    if (!postsJSON) return false;
    
    const posts: Record<string, StoredPost> = JSON.parse(postsJSON);
    return !!posts[slug];
  } catch (error) {
    console.error('Failed to check if post is available offline:', error);
    return false;
  }
};

/**
 * Remove a post from offline storage
 * @param slug The slug of the post to remove
 * @returns A promise that resolves when the post has been removed
 */
export const removePostFromOfflineStorage = async (slug: string): Promise<void> => {
  try {
    // Get existing posts from storage
    const postsJSON = localStorage.getItem(OFFLINE_POSTS_KEY);
    if (!postsJSON) return;
    
    const posts: Record<string, StoredPost> = JSON.parse(postsJSON);
    
    // Check if the post exists
    if (!posts[slug]) return;
    
    // Get the post's cover image URL before deleting
    const postToDelete = posts[slug];
    const coverImageUrl = postToDelete.coverImage;
    
    // Remove the post from the collection
    delete posts[slug];
    
    // Save back to storage
    localStorage.setItem(OFFLINE_POSTS_KEY, JSON.stringify(posts));
    
    // Also remove the post from the Cache API if available
    if ('caches' in window) {
      try {
        const cache = await caches.open('blog-content');
        
        // URLs to remove from cache
        const urlsToRemove = [
          `/posts/${slug}`,
          coverImageUrl
        ];
        
        // Remove each URL from the cache
        await Promise.all(urlsToRemove.map(url => cache.delete(url)));
        
        console.log(`Removed post ${slug} from cache`);
      } catch (cacheError) {
        console.error('Error removing post from cache:', cacheError);
        // Continue even if cache removal fails
      }
    }
    
    console.log(`Successfully removed post ${slug} from offline storage`);
  } catch (error) {
    console.error('Error removing post from offline storage:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

/**
 * Cache important pages and assets for offline access
 */
export const cacheImportantAssets = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      // Pages to cache for offline access
      const pagesToCache = [
        '/saved-posts',
        '/offline',
        '/' // Also cache the home page
      ];
      
      // Get all saved posts to cache their URLs as well
      const savedPosts = getAllOfflinePosts();
      const postUrlsToCache = savedPosts.map(post => `/posts/${post.slug}`);
      
      // Combine all pages to cache
      const allPagesToCache = [...pagesToCache, ...postUrlsToCache];
      
      // Open the cache
      const pageCache = await caches.open('pages-cache');
      
      // Cache each page
      const pagePromises = allPagesToCache.map(async (url) => {
        try {
          const response = await fetch(url, { cache: 'no-store' });
          if (response.ok) {
            await pageCache.put(url, response.clone());
            console.log(`Cached ${url} for offline access`);
          }
        } catch (err) {
          console.error(`Failed to cache ${url}:`, err);
        }
      });
      
      // Also cache important assets
      const assetsToCache = [
        '/manifest.json',
        '/favicon/favicon.ico',
        '/favicon/android-chrome-192x192.png',
        '/favicon/android-chrome-512x512.png',
        // Add CSS and JS assets
        ...Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map(link => (link as HTMLLinkElement).href)
          .filter(href => href.startsWith(window.location.origin))
          .map(href => new URL(href).pathname),
        ...Array.from(document.querySelectorAll('script[src]'))
          .map(script => (script as HTMLScriptElement).src)
          .filter(src => src.startsWith(window.location.origin))
          .map(src => new URL(src).pathname)
      ];
      
      const assetCache = await caches.open('static-assets-cache');
      
      const assetPromises = assetsToCache.map(async (url) => {
        try {
          const response = await fetch(url, { cache: 'no-store' });
          if (response.ok) {
            await assetCache.put(url, response.clone());
            console.log(`Cached asset ${url} for offline access`);
          }
        } catch (err) {
          console.error(`Failed to cache asset ${url}:`, err);
        }
      });
      
      // Wait for all caching operations to complete
      await Promise.allSettled([...pagePromises, ...assetPromises]);
      
      console.log('Completed caching important assets for offline access');
    } catch (error) {
      console.error('Error caching assets for offline access:', error);
    }
  } else {
    console.warn('Cache API not available in this browser');
  }
};
