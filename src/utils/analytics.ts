/**
 * Google Analytics 4 / Google Tag Manager Data Layer utility
 * 
 * Pushes events to window.dataLayer for GTM to process.
 * Phase 1: Minimal implementation for mentor_prompt event.
 */

declare global {
  interface Window {
    dataLayer: any[];
  }
}

/**
 * Initialize the Data Layer if it doesn't exist
 */
const ensureDataLayer = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
  }
};

/**
 * Push a custom event to the Data Layer
 * 
 * @param eventName - Event name (e.g., 'mentor_prompt')
 * @param params - Optional event parameters
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  
  try {
    ensureDataLayer();
    
    const eventData: Record<string, any> = {
      event: eventName,
      ...params
    };
    
    window.dataLayer.push(eventData);
  } catch (error) {
    // Silently fail - analytics should never break the app
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics tracking error:', error);
    }
  }
};

