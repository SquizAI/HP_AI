// Real implementation for DALL-E image generation
import { getOpenAIKey, shouldUseMockData, getDALLEModel } from './envConfig';

export interface ImageGenerationOptions {
  size?: '1024x1024' | '1792x1024' | '1024x1792' | '1024x1024';
  style?: 'natural' | 'vivid';
  quality?: 'standard' | 'hd';
  model?: 'dall-e-3' | 'dall-e-2';
}

// Fallback placeholder images only for error conditions
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d', // Tech/laptop
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809', // Abstract
  'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107', // Data/business
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f', // Team/people
];

/**
 * Generate an image using OpenAI DALL-E API based on a prompt
 */
export async function generateImage(
  prompt: string, 
  options: ImageGenerationOptions = {}
): Promise<string> {
  console.log(`Generating image with prompt: "${prompt}"`);
  
  try {
    // Get the API key - if not available, use mock images
    const apiKey = getOpenAIKey();
    if (!apiKey || apiKey === 'not-a-real-key' || apiKey === '%REACT_APP_OPENAI_API_KEY%' || shouldUseMockData()) {
      console.log('Using mock image because API key is not properly configured');
      return getMockImage(prompt);
    }

    // Enhance the prompt to get better results
    const enhancedPrompt = enhanceImagePrompt(prompt);
    
    // Prepare API call
    const model = options.model || getDALLEModel() || 'dall-e-3';
    const size = options.size || '1024x1024';
    const style = options.style || 'vivid';
    const quality = options.quality || 'standard';
    
    // DALL-E 3 API requires a different approach than DALL-E 2
    // Using the endpoint directly to ensure correct parameters
    const url = 'https://api.openai.com/v1/images/generations';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    // Request body with all proper parameters
    const body = {
      model: model,
      prompt: enhancedPrompt,
      n: 1,
      size: size,
      style: style,
      quality: quality,
      response_format: "url"
    };
    
    console.log(`Making DALL-E API call with model: ${model}, size: ${size}`);
    
    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json();
      console.error('DALL-E API error:', errorData);
      throw new Error(`DALL-E API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    console.log('DALL-E API response received successfully');
    
    // Return the image URL
    if (data.data && data.data.length > 0 && data.data[0].url) {
      return data.data[0].url;
    } else {
      throw new Error('No image URL returned from DALL-E API');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    // Fall back to mock images on error
    return getMockImage(prompt);
  }
}

/**
 * Generate multiple images based on an array of prompts
 */
export async function generateMultipleImages(prompts: string[]): Promise<string[]> {
  try {
    const imagePromises = prompts.map(prompt => generateImage(prompt));
    return await Promise.all(imagePromises);
  } catch (error) {
    console.error('Error generating multiple images:', error);
    // Return mock images
    return prompts.map(prompt => getMockImage(prompt));
  }
}

/**
 * Generate an image prompt based on slide content
 */
export function generateImagePromptFromSlide(slideTitle: string, slideContent: string): string {
  const basePrompt = `${slideTitle} ${slideContent}`;
  return enhanceImagePrompt(basePrompt);
}

/**
 * Enhance an image prompt with additional details to get better results
 */
function enhanceImagePrompt(prompt: string): string {
  // High-quality image prompting techniques for DALL-E 3
  // This helps ensure better image quality and adherence to prompts
  
  // Check if the prompt is already detailed
  if (prompt.length > 100) return prompt;
  
  // Basic improvement for short prompts
  let enhancedPrompt = prompt;
  
  // Add style specification if not present
  if (!prompt.toLowerCase().includes("style") && !prompt.toLowerCase().includes("design")) {
    enhancedPrompt += ", in a professional presentation style";
  }
  
  // Add quality indicators
  if (!prompt.toLowerCase().includes("high quality") && !prompt.toLowerCase().includes("detailed")) {
    enhancedPrompt += ", high-quality image with clear details";
  }
  
  // Add lighting/composition guidance
  if (!prompt.toLowerCase().includes("lighting") && !prompt.toLowerCase().includes("composition")) {
    enhancedPrompt += ", well-composed with balanced lighting";
  }
  
  return enhancedPrompt;
}

/**
 * Get a mock image URL based on the prompt
 */
function getMockImage(prompt: string): string {
  // List of stock placeholder images
  const placeholderImages = [
    'https://images.unsplash.com/photo-1661956602926-db6b25f75947?q=80&w=870&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?q=80&w=387&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1496065187959-7f07b8353c55?q=80&w=870&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=870&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=870&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=870&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=388&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522152302542-71a8e5172aa1?q=80&w=829&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=870&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=870&auto=format&fit=crop'
  ];
  
  // Deterministic-ish selection based on the prompt
  const hash = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % placeholderImages.length;
  
  return placeholderImages[index];
}

export default {
  generateImage,
  generateMultipleImages,
  generateImagePromptFromSlide
}; 