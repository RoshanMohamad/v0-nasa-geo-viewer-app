// Type definitions for custom application types

/**
 * Extended type definitions for the NASA GeoViewer App
 */

// Global type augmentation
declare global {
  interface Window {
    // Add any global window properties if needed in the future
  }
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_NASA_API_KEY?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

export {};
