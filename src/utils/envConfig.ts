/**
 * Environment Configuration Utility
 * 
 * This utility provides a safe way to access environment variables in browser context
 * It handles fallbacks and provides type safety for configuration values
 */

// Extend Window interface to include ENV property
declare global {
  interface Window {
    ENV?: {
      OPENAI_API_KEY?: string;
      OPENAI_MODEL?: string;
      DALLE_MODEL?: string;
      API_ENDPOINT?: string;
      USE_MOCK_DATA?: boolean;
    };
    process?: any;
  }
}

interface EnvConfig {
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  DALLE_MODEL: string;
  API_ENDPOINT: string;
  USE_MOCK_DATA: boolean;
}

// For development, we can use a global ENV object
if (typeof window !== 'undefined' && !window.ENV) {
  window.ENV = {
    OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
    OPENAI_MODEL: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o-2024-08-06',
    DALLE_MODEL: process.env.REACT_APP_DALLE_MODEL || 'dall-e-3',
    API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT || 'https://api.openai.com/v1',
    USE_MOCK_DATA: process.env.REACT_APP_USE_MOCK_DATA === 'true' || false
  };
}

/**
 * Gets a configuration value from the appropriate source based on environment
 * Checks window.ENV first (for runtime injection), then process.env (for build-time)
 * Falls back to defaults for development
 */
export function getConfig(): EnvConfig {
  // For security in production, these values should be properly injected at runtime 
  // or proxied through your backend service
  
  const defaultConfig: EnvConfig = {
    OPENAI_API_KEY: 'not-a-real-key',  // Default to true to use mock data
    OPENAI_MODEL: 'gpt-4o-2024-08-06',
    DALLE_MODEL: 'dall-e-3',
    API_ENDPOINT: 'https://api.openai.com/v1',
    USE_MOCK_DATA: true  // Default to true to use mock data
  };

  // Check for window.ENV (runtime injection)
  // @ts-ignore - window.ENV might not exist in all contexts
  const windowEnv = typeof window !== 'undefined' && window.ENV ? window.ENV : {};
  
  // Check for process.env (build-time injection)
  const processEnv = {
    OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY,
    OPENAI_MODEL: process.env.REACT_APP_OPENAI_MODEL,
    DALLE_MODEL: process.env.REACT_APP_DALLE_MODEL,
    API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT,
    USE_MOCK_DATA: process.env.REACT_APP_USE_MOCK_DATA === 'true',
  };
  
  // Combine sources with precedence: window.ENV > process.env > defaults
  return {
    OPENAI_API_KEY: windowEnv.OPENAI_API_KEY || processEnv.OPENAI_API_KEY || defaultConfig.OPENAI_API_KEY,
    OPENAI_MODEL: windowEnv.OPENAI_MODEL || processEnv.OPENAI_MODEL || defaultConfig.OPENAI_MODEL,
    DALLE_MODEL: windowEnv.DALLE_MODEL || processEnv.DALLE_MODEL || defaultConfig.DALLE_MODEL,
    API_ENDPOINT: windowEnv.API_ENDPOINT || processEnv.API_ENDPOINT || defaultConfig.API_ENDPOINT,
    USE_MOCK_DATA: windowEnv.USE_MOCK_DATA !== undefined 
      ? windowEnv.USE_MOCK_DATA 
      : (processEnv.USE_MOCK_DATA !== undefined ? processEnv.USE_MOCK_DATA : defaultConfig.USE_MOCK_DATA)
  };
}

/**
 * Helper to safely access the OpenAI API key
 * In production, this should be handled through a backend proxy
 */
export function getOpenAIKey(): string {
  try {
    const config = getConfig();
    return config.OPENAI_API_KEY;
  } catch (error) {
    console.warn('Failed to retrieve OpenAI API key:', error);
    return '';
  }
}

/**
 * Helper to determine if mock data should be used
 */
export function shouldUseMockData(): boolean {
  try {
    const config = getConfig();
    // Always use mock data for development or without a valid key
    if (config.USE_MOCK_DATA || !config.OPENAI_API_KEY || config.OPENAI_API_KEY === 'not-a-real-key' || config.OPENAI_API_KEY === '%REACT_APP_OPENAI_API_KEY%') {
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Error checking mock data flag:', error);
    return true; // Default to mock data on error
  }
}

/**
 * Get the configured OpenAI model
 */
export function getOpenAIModel(): string {
  try {
    return getConfig().OPENAI_MODEL;
  } catch (error) {
    console.warn('Error getting OpenAI model:', error);
    return 'gpt-4-turbo';
  }
}

/**
 * Get the configured DALL-E model
 */
export function getDALLEModel(): string {
  try {
    return getConfig().DALLE_MODEL;
  } catch (error) {
    console.warn('Error getting DALL-E model:', error);
    return 'dall-e-3';
  }
}

export default {
  getConfig,
  getOpenAIKey,
  shouldUseMockData,
  getOpenAIModel,
  getDALLEModel
}; 