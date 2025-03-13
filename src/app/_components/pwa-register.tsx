'use client';

import { useEffect } from 'react';

// Define types for Workbox events
interface WorkboxEvent {
  type: string;
  [key: string]: any;
}

interface WaitingEvent extends WorkboxEvent {
  wasWaitingBeforeRegister?: boolean;
}

interface WorkboxInstance {
  addEventListener(event: string, callback: (event: WorkboxEvent) => void): void;
  register(): void;
  messageSkipWaiting(): void;
}

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox as WorkboxInstance;
      
      // Add event listeners to handle PWA lifecycle events
      wb.addEventListener('installed', (event: WorkboxEvent) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      wb.addEventListener('controlling', (event: WorkboxEvent) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      wb.addEventListener('activated', (event: WorkboxEvent) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
      // NOTE: MUST set skipWaiting to false in next.config.js pwa object
      // https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
      const promptNewVersionAvailable = (event: WaitingEvent) => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.
        if (
          confirm(
            'A newer version of this web app is available. Reload to update?'
          )
        ) {
          wb.addEventListener('controlling', (event: WorkboxEvent) => {
            window.location.reload();
          });

          // Send a message to the waiting service worker, instructing it to activate.
          wb.messageSkipWaiting();
        } else {
          console.log(
            'User rejected to reload the web app, keep using old version. New version will be automatically loaded when the app is reopened.'
          );
        }
      };

      wb.addEventListener('waiting', promptNewVersionAvailable);

      // Register the service worker after event listeners have been added
      wb.register();
    }
  }, []);

  return null;
}

// Add TypeScript interface for Workbox
declare global {
  interface Window {
    workbox: WorkboxInstance;
  }
}
