'use client';

import { useEffect, useState } from 'react';

/**
 * A hook to detect online/offline status with improved reliability
 * @returns {boolean} isOffline - Whether the user is currently offline
 */
export function useOfflineDetection(): boolean {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  
  useEffect(() => {
    // Function to check if we're offline
    const checkOfflineStatus = () => {
      // navigator.onLine is not always reliable, so we'll do an additional check
      if (!navigator.onLine) {
        setIsOffline(true);
        return;
      }
      
      // If navigator.onLine says we're online, do a fetch test to confirm
      // This helps in cases where the browser thinks it's online but can't actually reach the network
      fetch('/manifest.json', { 
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
        .then(() => {
          // We successfully fetched, so we're online
          setIsOffline(false);
        })
        .catch(() => {
          // Failed to fetch, likely offline
          setIsOffline(true);
        });
    };
    
    // Set initial state
    checkOfflineStatus();
    
    // Add event listeners for online/offline events
    const handleOnline = () => {
      // When we get an online event, verify with a fetch
      fetch('/manifest.json', { 
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
        .then(() => setIsOffline(false))
        .catch(() => setIsOffline(true));
    };
    
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set up a periodic check (every 30 seconds)
    const intervalId = setInterval(checkOfflineStatus, 30000);
    
    // Clean up event listeners and interval
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);
  
  return isOffline;
}
