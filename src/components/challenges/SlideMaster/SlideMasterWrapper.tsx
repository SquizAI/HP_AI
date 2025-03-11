import React, { useEffect, useState } from 'react';
import SlidesMasterMain from './SlidesMasterMain';

/**
 * This wrapper component handles environment variable initialization
 * to prevent "process is not defined" errors in the browser
 */
const SlideMasterWrapper: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add process polyfill for browser environment if not already defined
    if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
      (window as any).process = { env: {} };
    }

    // Initialize environment variables in window.ENV for runtime access
    if (typeof window !== 'undefined' && typeof (window as any).ENV === 'undefined') {
      (window as any).ENV = {
        // These values are just defaults and would be replaced in production
        OPENAI_API_KEY: '',
        OPENAI_MODEL: 'gpt-4-turbo',
        DALLE_MODEL: 'dall-e-3',
        USE_MOCK_DATA: true
      };
    }

    // Mark component as ready to render main content
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return <SlidesMasterMain />;
};

export default SlideMasterWrapper; 