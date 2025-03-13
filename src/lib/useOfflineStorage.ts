'use client';

import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/interfaces/post';
import { 
  savePostForOffline, 
  removePostFromOfflineStorage, 
  isPostAvailableOffline, 
  getAllOfflinePosts 
} from './offlineStorage';
import { useOfflineDetection } from './useOfflineDetection';

/**
 * Custom hook for managing offline storage operations
 * Provides methods and state for saving, removing, and checking posts in offline storage
 */
export function useOfflineStorage() {
  const [savedPosts, setSavedPosts] = useState<Record<string, Post>>({});
  const [isLoading, setIsLoading] = useState(true);
  const isOffline = useOfflineDetection();

  // Load all saved posts on mount
  useEffect(() => {
    const loadSavedPosts = () => {
      try {
        const posts = getAllOfflinePosts();
        // Convert array to record if needed
        if (Array.isArray(posts)) {
          const postsRecord: Record<string, Post> = {};
          posts.forEach(post => {
            postsRecord[post.slug] = post;
          });
          setSavedPosts(postsRecord);
        } else {
          setSavedPosts(posts);
        }
      } catch (error) {
        console.error('Error loading saved posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedPosts();
    
    // Refresh saved posts when coming back online
    const handleOnline = () => {
      loadSavedPosts();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  /**
   * Save a post for offline reading
   */
  const savePost = useCallback((post: Post & { htmlContent?: string }) => {
    try {
      savePostForOffline(post);
      setSavedPosts(prev => ({
        ...prev,
        [post.slug]: post
      }));
      return true;
    } catch (error) {
      console.error('Error saving post for offline:', error);
      return false;
    }
  }, []);

  /**
   * Remove a post from offline storage
   */
  const removePost = useCallback(async (slug: string) => {
    try {
      await removePostFromOfflineStorage(slug);
      setSavedPosts(prev => {
        const newPosts = { ...prev };
        delete newPosts[slug];
        return newPosts;
      });
      return true;
    } catch (error) {
      console.error('Error removing post from offline storage:', error);
      return false;
    }
  }, []);

  /**
   * Check if a post is available offline
   */
  const isPostSaved = useCallback((slug: string) => {
    return isPostAvailableOffline(slug);
  }, []);

  /**
   * Get the count of saved posts
   */
  const getSavedPostsCount = useCallback(() => {
    return Object.keys(savedPosts).length;
  }, [savedPosts]);

  return {
    savedPosts,
    isLoading,
    isOffline,
    savePost,
    removePost,
    isPostSaved,
    getSavedPostsCount
  };
}
