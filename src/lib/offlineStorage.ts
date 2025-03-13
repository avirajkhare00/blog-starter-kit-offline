/**
 * Utility functions for managing offline data
 * This helps with storing and retrieving blog posts when offline
 */

import { Post } from "@/interfaces/post";

const OFFLINE_POSTS_KEY = 'offline-blog-posts';

/**
 * Save a blog post to local storage for offline access
 */
export const savePostForOffline = (post: Post): void => {
  try {
    // Get existing posts from storage
    const existingPostsJSON = localStorage.getItem(OFFLINE_POSTS_KEY);
    const existingPosts: Record<string, Post> = existingPostsJSON 
      ? JSON.parse(existingPostsJSON) 
      : {};
    
    // Add or update the post
    existingPosts[post.slug] = post;
    
    // Save back to storage
    localStorage.setItem(OFFLINE_POSTS_KEY, JSON.stringify(existingPosts));
    
    console.log(`Post "${post.title}" saved for offline reading`);
  } catch (error) {
    console.error('Failed to save post for offline reading:', error);
  }
};

/**
 * Get a blog post from local storage
 */
export const getOfflinePost = (slug: string): Post | null => {
  try {
    const postsJSON = localStorage.getItem(OFFLINE_POSTS_KEY);
    if (!postsJSON) return null;
    
    const posts: Record<string, Post> = JSON.parse(postsJSON);
    return posts[slug] || null;
  } catch (error) {
    console.error('Failed to retrieve offline post:', error);
    return null;
  }
};

/**
 * Get all available offline posts
 */
export const getAllOfflinePosts = (): Post[] => {
  try {
    const postsJSON = localStorage.getItem(OFFLINE_POSTS_KEY);
    if (!postsJSON) return [];
    
    const posts: Record<string, Post> = JSON.parse(postsJSON);
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
