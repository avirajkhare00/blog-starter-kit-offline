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
      const postUrl = `/posts/${post.slug}`;
      // Fetch the post page to cache it
      fetch(postUrl)
        .then(response => {
          // Open the cache and store the response
          caches.open('pages').then(cache => {
            cache.put(postUrl, response);
            console.log(`Post page for "${post.title}" cached for offline access`);
          });
        })
        .catch(err => {
          console.error('Failed to cache post page:', err);
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
 * Check if the browser is currently offline
 */
export const isOffline = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return !navigator.onLine;
};

/**
 * Check if a post is available offline
 */
export const isPostAvailableOffline = (slug: string): boolean => {
  return getOfflinePost(slug) !== null;
};

/**
 * Preload the saved posts page for offline access
 */
export const preloadSavedPostsPage = (): void => {
  if ('caches' in window) {
    fetch('/saved-posts')
      .then(response => {
        caches.open('pages').then(cache => {
          cache.put('/saved-posts', response);
          console.log('Saved posts page cached for offline access');
        });
      })
      .catch(err => {
        console.error('Failed to cache saved posts page:', err);
      });
  }
};
