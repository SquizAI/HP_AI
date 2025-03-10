# AI Integration Implementation Guide

## Overview

The AI Integration component is responsible for communicating with external AI services like OpenAI (ChatGPT) and Google (Gemini), handling API calls, parsing responses, and providing error handling. This module ensures our learning platform can generate high-quality AI responses for all challenges while maintaining performance and reliability.

## Core Responsibilities

- Managing API connections to AI services
- Constructing effective prompts for different challenges
- Handling API responses and extracting relevant information
- Implementing error handling and fallback strategies
- Optimizing API usage through caching and rate limiting

## AI Service Architecture

### Main Service Interface

```javascript
// src/api/aiService.js

import axios from 'axios';
import { getPromptTemplate } from '../utils/promptTemplates';
import { parseAIResponse } from '../utils/responseParser';
import { createCache } from '../utils/apiCache';

// Initialize response cache
const responseCache = createCache({ maxSize: 100, ttl: 24 * 60 * 60 * 1000 }); // 24 hour cache

/**
 * Main AI service for sending prompts and receiving responses
 */
const aiService = {
  /**
   * Send a prompt to the AI and get a response
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Configuration options
   * @returns {Promise<string|Object>} - AI response
   */
  sendPrompt: async (prompt, options = {}) => {
    const {
      model = 'gpt-3.5-turbo',      // Default model
      service = 'openai',           // 'openai' or 'gemini'
      temperature = 0.7,            // Creativity level
      maxTokens = 500,              // Response length
      cacheKey = null,              // Custom cache key
      parseResult = true,           // Whether to parse the response
      systemMessage = null,         // System message for OpenAI
      retries = 2,                  // Number of retries on failure
    } = options;
    
    // Generate cache key if not provided
    const effectiveCacheKey = cacheKey || `${prompt}-${model}-${temperature}-${maxTokens}`;
    
    // Check cache first
    const cachedResponse = responseCache.get(effectiveCacheKey);
    if (cachedResponse) {
      console.log('Using cached AI response');
      return cachedResponse;
    }
    
    // Select appropriate service
    const sendRequest = service === 'openai' 
      ? sendOpenAIRequest 
      : sendGeminiRequest;
      
    let response;
    let attempts = 0;
    
    while (attempts <= retries) {
      try {
        // Send request to selected service
        response = await sendRequest(prompt, {
          model,
          temperature,
          maxTokens,
          systemMessage
        });
        
        // Store in cache
        responseCache.set(effectiveCacheKey, response);
        
        // Parse the response if requested
        return parseResult ? parseAIResponse(response, options) : response;
      } catch (error) {
        attempts++;
        console.error(`AI service error (attempt ${attempts}/${retries + 1}):`, error);
        
        // Throw error if we've exhausted retries
        if (attempts > retries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      }
    }
  },
  
  /**
   * Clear the response cache
   */
  clearCache: () => {
    responseCache.clear();
  }
};

/**
 * Send request to OpenAI API
 */
const sendOpenAIRequest = async (prompt, { model, temperature, maxTokens, systemMessage }) => {
  // Get API key from environment
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  
  // API endpoint
  const API_URL = 'https://api.openai.com/v1/chat/completions';
  
  // Default system message if not provided
  const defaultSystemMessage = 'You are a helpful assistant for business professionals learning to use AI effectively.';
  
  try {
    const response = await axios.post(
      API_URL,
      {
        model,
        messages: [
          { role: 'system', content: systemMessage || defaultSystemMessage },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to get response from OpenAI');
  }
};

/**
 * Send request to Google Gemini API
 */
const sendGeminiRequest = async (prompt, { temperature, maxTokens }) => {
  // Get API key from environment
  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  
  // API endpoint
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  
  try {
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to get response from Gemini');
  }
};

export default aiService;
```

## Prompt Engineering Utilities

Crafting effective prompts is crucial for getting high-quality AI responses. We'll implement a prompt template system:

```javascript
// src/utils/promptTemplates.js

/**
 * Collection of prompt templates for various challenges
 */
const promptTemplates = {
  // AI Trend Spotter Challenge
  trendSpotter: {
    industryTrends: `What are three emerging trends in {industry} that businesses should be aware of in the next 1-2 years? For each trend:
1. Provide a clear, concise title (5-7 words)
2. Write a 1-2 sentence description of the trend
3. Explain its business impact in 1-2 sentences
4. Suggest one specific opportunity for businesses to capitalize on this trend

Format each trend as:
- Title: [trend title]
- Description: [trend description]
- Impact: [business impact]
- Opportunity: [specific opportunity]`,

    trendImpact: `What businesses or industries are likely to be impacted by the following trend in {industry}:
{trendTitle}
{trendDescription}

Provide 3-5 specific examples of how this trend might change business operations, create new opportunities, or disrupt existing models.`,

    // Extension activities
    industryDeepDive: `Identify 3-5 real companies currently leveraging the "{trendTitle}" trend in the {industry} industry. For each company:
1. Provide the company name
2. Briefly describe their core business
3. Explain specifically how they're implementing or benefiting from this trend
4. If possible, mention one measurable result or benefit they've seen`,
  },
  
  // AI Service Pro Challenge
  servicePro: {
    draftResponse: `Draft a professional, empathetic response to this customer complaint:

"{complaint}"

Your response should:
1. Acknowledge the customer's issue with empathy
2. Offer a clear solution or next steps
3. Provide any relevant policy information
4. End with a positive, forward-looking statement

The tone should be professional but warm.`,

    adjustTone: `Rewrite the following customer service response to be more {tone}:

"{response}"

Maintain all the key information and solution details, but adjust the language, formality, and style to match a {tone} tone.`,
  },
  
  // Additional challenge templates can be added here
};

/**
 * Get a prompt template and fill in any variables
 * @param {string} challengeId - The challenge ID
 * @param {string} promptType - The type of prompt within the challenge
 * @param {Object} variables - Variables to substitute in the template
 * @returns {string} - The completed prompt
 */
export const getPromptTemplate = (challengeId, promptType, variables = {}) => {
  // Get the requested template
  const template = promptTemplates[challengeId]?.[promptType];
  
  if (!template) {
    console.error(`Prompt template not found for ${challengeId}.${promptType}`);
    return '';
  }
  
  // Replace variables in template with format {variableName}
  let filledTemplate = template;
  Object.entries(variables).forEach(([key, value]) => {
    filledTemplate = filledTemplate.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return filledTemplate;
};
```

## Response Parsing Utilities

Different challenges need different types of structured data from AI responses:

```javascript
// src/utils/responseParser.js

/**
 * Parse AI responses into structured data
 * @param {string} response - Raw AI response text
 * @param {Object} options - Parsing options
 * @returns {Object|Array|string} - Parsed response
 */
export const parseAIResponse = (response, options = {}) => {
  const { 
    format = 'text',         // 'text', 'json', 'trends', 'bullets', etc.
    removeLineBreaks = false
  } = options;
  
  // Just return text if that's all we need
  if (format === 'text') {
    return removeLineBreaks ? response.replace(/\n/g, ' ') : response;
  }
  
  // Handle different response formats
  switch (format) {
    case 'json':
      try {
        // Try to extract JSON if it exists in the response
        const jsonMatch = response.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) || 
                         response.match(/({[\s\S]*})/) ||
                         [null, response];
        return JSON.parse(jsonMatch[1]);
      } catch (error) {
        console.error('Failed to parse JSON from AI response:', error);
        return { error: 'JSON parsing failed', rawResponse: response };
      }
      
    case 'trends':
      return parseTrendsFormat(response);
      
    case 'bullets':
      return parseBulletPoints(response);
      
    // Add more format parsers as needed
    
    default:
      console.warn(`Unknown response format: ${format}, returning raw text`);
      return response;
  }
};

/**
 * Parse a response in the trends format
 */
const parseTrendsFormat = (response) => {
  // Basic regex pattern to extract trend sections
  const trendPattern = /Title:\s*([^\n]+)(?:[\s\S]*?)Description:\s*([^\n]+)(?:[\s\S]*?)Impact:\s*([^\n]+)(?:[\s\S]*?)Opportunity:\s*([^\n]+)/g;
  
  const trends = [];
  let match;
  let counter = 0;
  
  // Extract each trend section
  while ((match = trendPattern.exec(response)) !== null && counter < 10) {
    trends.push({
      id: counter + 1,
      title: match[1].trim(),
      description: match[2].trim(),
      impact: match[3].trim(),
      opportunity: match[4].trim()
    });
    counter++;
  }
  
  // Fallback if regex fails to extract trends
  if (trends.length === 0) {
    // Try to split by numbered sections
    const sections = response.split(/\d+\.\s+/).filter(Boolean);
    
    sections.forEach((section, i) => {
      const lines = section.trim().split('\n').filter(Boolean);
      trends.push({
        id: i + 1,
        title: lines[0]?.trim() || `Trend ${i + 1}`,
        description: lines[1]?.trim() || '',
        impact: lines[2]?.trim() || '',
        opportunity: lines[3]?.trim() || ''
      });
    });
  }
  
  return trends;
};

/**
 * Parse bullet points from a response
 */
const parseBulletPoints = (response) => {
  // Split by bullet point markers and filter empty lines
  const bullets = response
    .split(/[\n•\-\*]+/)
    .map(line => line.trim())
    .filter(Boolean);
    
  return bullets;
};
```

## Response Caching Utility

To optimize API usage and improve performance, we'll implement a caching system:

```javascript
// src/utils/apiCache.js

/**
 * Create a cache for API responses
 * @param {Object} options - Cache configuration
 * @returns {Object} - Cache methods
 */
export const createCache = (options = {}) => {
  const {
    maxSize = 100,  // Maximum number of items in cache
    ttl = 3600000   // Time to live in milliseconds (default: 1 hour)
  } = options;
  
  // Cache storage
  const cache = new Map();
  
  // Store access timestamps for LRU eviction
  const timestamps = new Map();
  
  /**
   * Set an item in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to store
   */
  const set = (key, value) => {
    // Evict oldest item if at capacity
    if (cache.size >= maxSize && !cache.has(key)) {
      const oldestKey = Array.from(timestamps.entries())
        .sort(([, timeA], [, timeB]) => timeA - timeB)[0][0];
      
      cache.delete(oldestKey);
      timestamps.delete(oldestKey);
    }
    
    // Store value and timestamp
    cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
    
    timestamps.set(key, Date.now());
  };
  
  /**
   * Get an item from the cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  const get = (key) => {
    const item = cache.get(key);
    
    // Return null if item doesn't exist or is expired
    if (!item || item.expires < Date.now()) {
      if (item) {
        // Clean up expired item
        cache.delete(key);
        timestamps.delete(key);
      }
      return null;
    }
    
    // Update access timestamp (for LRU)
    timestamps.set(key, Date.now());
    
    return item.value;
  };
  
  /**
   * Clear the entire cache
   */
  const clear = () => {
    cache.clear();
    timestamps.clear();
  };
  
  return { set, get, clear };
};
```

## React Hooks for AI Integration

To make it easy to use the AI service in React components, we'll create custom hooks:

```javascript
// src/hooks/useAI.js

import { useState, useCallback } from 'react';
import aiService from '../api/aiService';

/**
 * Hook for easy AI integration in components
 * @param {Object} options - Configuration options
 * @returns {Object} - Hook methods and state
 */
export const useAI = (options = {}) => {
  const {
    defaultModel = 'gpt-3.5-turbo',
    defaultService = 'openai', 
    defaultTemperature = 0.7,
    defaultMaxTokens = 500
  } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  
  /**
   * Send a prompt to the AI
   * @param {string} prompt - The prompt to send
   * @param {Object} customOptions - Options for this specific request
   * @returns {Promise<any>} - The AI response
   */
  const sendPrompt = useCallback(async (prompt, customOptions = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await aiService.sendPrompt(prompt, {
        model: customOptions.model || defaultModel,
        service: customOptions.service || defaultService,
        temperature: customOptions.temperature || defaultTemperature,
        maxTokens: customOptions.maxTokens || defaultMaxTokens,
        ...customOptions
      });
      
      setResponse(result);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to get AI response';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [defaultModel, defaultService, defaultTemperature, defaultMaxTokens]);
  
  /**
   * Get a prompt from the template system and fill in variables
   * @param {string} challengeId - Challenge ID
   * @param {string} promptType - Prompt type
   * @param {Object} variables - Template variables
   * @returns {string} - Completed prompt
   */
  const getPrompt = useCallback((challengeId, promptType, variables = {}) => {
    const { getPromptTemplate } = require('../utils/promptTemplates');
    return getPromptTemplate(challengeId, promptType, variables);
  }, []);
  
  /**
   * Reset the state
   */
  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);
  
  return {
    isLoading,
    error,
    response,
    sendPrompt,
    getPrompt,
    reset
  };
};
```

## Using the AI Service in a Challenge Component

Here's how the AI service would be used in a challenge step component:

```jsx
// src/features/challenges/trendSpotter/steps/TrendSpotterPrompt.jsx

import React, { useEffect } from 'react';
import { useAI } from '../../../../hooks/useAI';
import Button from '../../../../components/common/Button';
import LoadingIndicator from '../../../../components/common/LoadingIndicator';
import ErrorMessage from '../../../../components/common/ErrorMessage';

const TrendSpotterPrompt = ({ 
  state, 
  updateState, 
  onComplete 
}) => {
  // Use the AI hook
  const { 
    isLoading, 
    error, 
    response, 
    sendPrompt,
    getPrompt
  } = useAI();
  
  // Generate prompt when component mounts or industry changes
  useEffect(() => {
    if (state.selectedIndustry) {
      const prompt = getPrompt('trendSpotter', 'industryTrends', {
        industry: state.selectedIndustry.name
      });
      
      updateState({ prompt });
    }
  }, [state.selectedIndustry, getPrompt, updateState]);
  
  // Handle sending prompt to AI
  const handleSendPrompt = async () => {
    try {
      const result = await sendPrompt(state.prompt, {
        format: 'trends',  // Parse into trends format
        temperature: 0.7   // Set creativity level
      });
      
      // Update state with parsed trends
      updateState({ trends: result });
      
      // Move to next step
      onComplete();
    } catch (err) {
      // Error already set by the hook
      console.error("Failed to get trends:", err);
    }
  };
  
  return (
    <div className="prompt-builder">
      <div className="instruction">
        <h2>Your AI Prompt</h2>
        <p>We've built a prompt to help you discover emerging trends in {state.selectedIndustry.name}.</p>
      </div>
      
      <div className="prompt-preview">
        <h3>AI Prompt:</h3>
        <div className="prompt-box">
          {state.prompt}
        </div>
      </div>
      
      <div className="action-section">
        <Button 
          onClick={handleSendPrompt}
          disabled={isLoading}
          className="primary-button"
        >
          {isLoading ? 'Analyzing Trends...' : 'Send to AI'}
        </Button>
        
        {isLoading && (
          <LoadingIndicator message="AI is analyzing industry trends..." />
        )}
        
        {error && (
          <ErrorMessage message={error} />
        )}
      </div>
      
      <div className="tip-section">
        <h3>Prompt Tip:</h3>
        <p>This prompt asks for specific, timebound trends with business impacts to ensure you get actionable results.</p>
      </div>
    </div>
  );
};

export default TrendSpotterPrompt;
```

## Error Handling Strategy

Our AI service should implement a robust error handling strategy:

1. **Retries with exponential backoff** for transient API errors
2. **Fallback content** when API services are unreachable
3. **User-friendly error messages** that don't expose API details
4. **Logging** for debugging and monitoring

## API Key Management

Secure handling of API keys is crucial:

```javascript
// .env.example
REACT_APP_OPENAI_API_KEY=your_openai_key_here
REACT_APP_GEMINI_API_KEY=your_gemini_key_here

// .gitignore
.env
```

For production, consider using environment variables in your deployment platform rather than embedding keys in the application.

## Multi-Model Strategy

Our system should be able to use different AI models based on the context:

| Challenge | Model | Reasoning |
|-----------|-------|-----------|
| AI Trend Spotter | GPT-3.5 or Gemini Pro | Good at identifying trends |
| AI Biz Strategist | GPT-4 (if available) | Better for complex reasoning |
| AI Service Pro | GPT-3.5 | Sufficient for customer service responses |

This strategy can be updated based on performance and cost considerations.

## Implementation Steps

1. Set up AI service integration with OpenAI
2. Implement response parsing utilities
3. Create caching mechanism
4. Develop prompt template system
5. Add React hooks for component integration
6. Implement error handling and retries
7. Add support for Google Gemini
8. Create fallback content for offline/error scenarios
9. Implement model selection logic
10. Test with various challenge scenarios

## Technical Considerations

### Rate Limiting

Both OpenAI and Google implement rate limits on their APIs:

```javascript
// Example rate limiting middleware
const rateLimiter = {
  tokens: 50,             // Available tokens
  refillRate: 5,          // Tokens added per second
  lastRefill: Date.now(), // Last token refill time
  
  async acquire() {
    // Refill tokens based on time elapsed
    const now = Date.now();
    const timeElapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(50, this.tokens + timeElapsed * this.refillRate);
    this.lastRefill = now;
    
    // If no tokens available, wait
    if (this.tokens < 1) {
      const waitTime = (1 - this.tokens) / this.refillRate * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquire();
    }
    
    // Consume a token
    this.tokens -= 1;
    return true;
  }
};

// Usage in aiService
const sendOpenAIRequest = async (...args) => {
  await rateLimiter.acquire();
  // ... rest of function
};
```

### Cost Management

AI API calls incur costs based on token usage. We should implement strategies to minimize costs:

1. **Caching** to avoid redundant API calls
2. **Token counting** to estimate costs before sending requests
3. **Prompt optimization** to reduce token usage
4. **Tiered model selection** based on complexity needs

### Fallback Strategies

For scenarios where AI services are unavailable:

```javascript
// Fallback content for offline use
const fallbackResponses = {
  'trendSpotter-industryTrends-healthcare': [
    {
      id: 1,
      title: 'AI-Powered Diagnostic Tools',
      description: 'Advanced imaging analysis reducing diagnosis time in healthcare',
      impact: 'Potential to detect conditions earlier and reduce diagnostic errors by 30-40%',
      opportunity: 'Integration with existing hospital systems for seamless workflows'
    },
    // More pre-defined fallback trends
  ],
  // Other pre-defined responses
};

// Modified sendPrompt function with fallbacks
const sendPrompt = async (prompt, options = {}) => {
  try {
    // Regular API call logic
    // ...
  } catch (error) {
    console.error('API Error, using fallback:', error);
    
    // Generate fallback key
    const fallbackKey = options.fallbackKey || 
      `${options.challengeId}-${options.promptType}-${options.variables?.industry || 'general'}`;
    
    // Return fallback if available
    if (fallbackResponses[fallbackKey]) {
      return fallbackResponses[fallbackKey];
    }
    
    // Re-throw if no fallback
    throw error;
  }
};
```

## Testing Strategy

### Unit Tests

```javascript
// Example test for aiService
describe('AI Service', () => {
  test('should send prompt to OpenAI', async () => {
    // Mock axios
    axios.post.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: 'Test response' } }]
      }
    });
    
    const response = await aiService.sendPrompt('Test prompt');
    expect(response).toBe('Test response');
    
    // Verify API call
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('openai'),
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ content: 'Test prompt' })
        ])
      }),
      expect.any(Object)
    );
  });
  
  test('should use cache for repeated prompts', async () => {
    // Setup cache test
    // ...
  });
});
```

### Integration Tests

Test the integration with challenge components:

```javascript
test('TrendSpotterPrompt should send prompt and handle response', async () => {
  // Mock AI hook
  jest.mock('../../../../hooks/useAI', () => ({
    useAI: () => ({
      isLoading: false,
      error: null,
      sendPrompt: jest.fn().mockResolvedValue([
        { id: 1, title: 'Test Trend', description: 'Description', impact: 'Impact', opportunity: 'Opportunity' }
      ]),
      getPrompt: jest.fn().mockReturnValue('Test prompt')
    })
  }));
  
  // Render component with mocked hooks
  // Simulate user actions
  // Verify state updates
});
```

## Dependencies

- Axios for API requests
- Environment variables for secure key management
- React for component integration
- Jest for testing

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/introduction)
- [Google Gemini API Documentation](https://ai.google.dev/docs) 