import React, { useState, useEffect, useCallback, useRef } from 'react';
import { saveChallengeSlidemaster, useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import PromptEditor from './PromptEditor';
import ThemeSelector from './ThemeSelector';
import CompletionScreen from './CompletionScreen';
import SlideEditor from './SlideEditor';
import { generatePresentationContent, parseContentIntoSlides } from '../../../utils/contentGenerator';
import { generateImage, generateMultipleImages, generateImageBatches, generateImagePromptFromSlide, getRemainingCredits, resetCredits } from '../../../utils/fluxImageGenerator';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { shouldUseMockData } from '../../../utils/envConfig';
import ImageInsightPanel from './ImageInsightPanel';
import './presentation-toast.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import OpenAI from 'openai';
import ChallengeHeader from '../../shared/ChallengeHeader';
import { PresentationIcon } from 'lucide-react';

/*
 * SLIDE MASTER CHALLENGE REDESIGN PLAN
 * 
 * Based on gamma.app with OpenAI integration
 * 
 * 1. UI Improvements:
 *    - Clean, modern interface with:
 *      - Left sidebar for navigation/steps
 *      - Right panel for options/settings/prompts
 *      - Main area for content preview
 *    - Soft gradients and shadows for visual appeal
 *    - Improved theme selection with visual previews
 * 
 * 2. Workflow Enhancements:
 *    - Simplified initial setup:
 *      - One-step input for getting started (title/topic)
 *      - Proper generation options in sidebar
 *      - Clearer progression between steps
 *    - Three starting methods:
 *      - Paste in text (outline or notes)
 *      - Generate from prompt
 *      - Import existing document
 * 
 * 3. OpenAI Integration:
 *    - API calls to OpenAI for:
 *      - Content generation with structured output
 *      - Formatting suggestions
 *      - Style recommendations
 *    - DALL-E for image generation:
 *      - Slide backgrounds
 *      - Relevant illustrations
 *      - Charts and graphics
 * 
 * 4. Interactive Editing:
 *    - Side-by-side editing:
 *      - Content on left
 *      - Settings/customization on right
 *    - Real-time preview updates
 *    - Quick settings toggles for:
 *      - Text density (brief/medium/detailed)
 *      - Tone selection
 *      - Format options
 *      - Language options
 * 
 * 5. Advanced Features:
 *    - Smart layouts that adapt to content
 *    - Theme generation based on content
 *    - One-click styling for consistency
 *    - Export options with quality settings
 */

// Step titles - streamlined workflow
const STEPS = {
  INPUT: 0,
  CONTENT_GENERATED: 1,
  SLIDES_PREVIEW: 2,
  EDIT: 3
};

// Create SlideType constant values for use in comparisons
const SlideTypeValues = {
  TITLE: 'title',
  CONTENT: 'content',
  TWO_COLUMN: 'twoColumn',
  IMAGE: 'image',
  QUOTE: 'quote',
  CHART: 'chart',
  TABLE: 'table',
  COMPARISON: 'comparison',
  TIMELINE: 'timeline',
  AGENDA: 'agenda',
  SECTION: 'section',
  CONCLUSION: 'conclusion',
  THANKYOU: 'thankyou'
} as const;

// Define types
export type SlideType = 
  | 'title'
  | 'content'
  | 'twoColumn'
  | 'image'
  | 'quote'
  | 'chart'
  | 'table'
  | 'comparison'
  | 'timeline'
  | 'agenda'
  | 'section'
  | 'conclusion'
  | 'thankyou';

export type TransitionType = 
  | 'none'
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'flip';

// Interfaces
export interface SlideContent {
  mainText?: string;
  bullets?: string[];
  quote?: string;
  source?: string;
  imageDescription?: string;
  generatedImageUrl?: string;
  chartData?: ChartData;
  tableData?: TableData;
  contactInfo?: string;
  imagePrompt?: string;
  title?: string;
  text?: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
  }[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  content: SlideContent;
  notes: string;
  imagePrompt?: string;
  generatedImageUrl?: string;
  transition?: TransitionType;
  background?: string;
}

export interface Theme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontTitle: string;
  fontBody: string;
  backgroundStyle: 'solid' | 'gradient' | 'image' | 'pattern';
  backgroundColor: string;
}

export interface SlideMasterState {
  // Presentation metadata
  title: string;
  purpose: string;
  targetAudience: string;
  audience?: string; // For backward compatibility
  lengthMinutes: number;
  presentationStyle: string;
  
  // Content structure
  slides: Slide[];
  theme: Theme;
  customColors: string[];
  visualElements?: string[];
  transition?: TransitionType;
  
  // Input content
  generatedPrompt: string;
  rawGeneratedContent: string; // Raw content with page breaks
  
  // Progress tracking
  currentStep: number;
  currentSlideIndex: number;
  isComplete: boolean;
  lastUpdated: string;
  
  // UI state
  isShowingThemeSelector: boolean;
  isGeneratingImages: boolean;
}

// Simplify to just 4 audience types
const AUDIENCE_TYPES = [
  'Business Executives',
  'Technical Professionals',
  'General Public',
  'Students'
];

// Create 3 distinct, visually appealing themes
const PRESENTATION_THEMES = [
  {
    name: 'Modern Professional',
    primaryColor: '#3b82f6',
    secondaryColor: '#1d4ed8',
    accentColor: '#38bdf8',
    fontTitle: 'Montserrat, sans-serif',
    fontBody: 'Inter, sans-serif',
    backgroundStyle: 'gradient' as 'gradient',
    backgroundColor: 'linear-gradient(120deg, #f8fafc 0%, #e0f2fe 100%)'
  },
  {
    name: 'Elegant Minimal',
    primaryColor: '#1e293b',
    secondaryColor: '#334155',
    accentColor: '#f59e0b',
    fontTitle: 'Playfair Display, serif',
    fontBody: 'Source Sans Pro, sans-serif',
    backgroundStyle: 'solid' as 'solid',
    backgroundColor: '#ffffff'
  },
  {
    name: 'Bold Impact',
    primaryColor: '#0f172a',
    secondaryColor: '#1e293b',
    accentColor: '#10b981',
    fontTitle: 'Poppins, sans-serif',
    fontBody: 'Open Sans, sans-serif',
    backgroundStyle: 'solid' as 'solid',
    backgroundColor: '#f8fafc'
  }
];

// AI suggested topics for quick selection
const AI_SUGGESTED_TOPICS = [
  'The Future of Artificial Intelligence in Business',
  'Climate Change: Challenges and Solutions',
  'Digital Transformation Strategies',
  'Emerging Technologies in Healthcare',
  'Effective Leadership in the Modern Workplace',
  'Sustainable Business Practices'
];

// Extend Window interface to add our toast functions
declare global {
  interface Window {
    createToastContainer: () => HTMLDivElement;
    showToast: (options: ToastOptions) => void;
    getToastIcon: (status: string) => string;
  }
}

// Simple toast notification system
interface ToastOptions {
  title: string;
  description: string;
  status: 'info' | 'success' | 'error' | 'warning';
  duration: number | undefined; 
  isClosable: boolean;
}

/**
 * Create a toast container if it doesn't exist
 */
function createToastContainer(): HTMLDivElement {
  if (typeof window.createToastContainer === 'function') {
    return window.createToastContainer();
  }
  
  let container = document.getElementById('toast-container') as HTMLDivElement;
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-3';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast notification
 */
function showToast(options: ToastOptions): any {
  // Use the global window function if available
  if (typeof window.showToast === 'function') {
    window.showToast(options);
    return null;
  }
  
  // Create or access the toast container
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = createToastContainer();
  }
  
  // Create a new toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${options.status} ${options.isClosable ? 'closable' : ''}`;
  
  // Add the title and description
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-title">${options.title}</div>
      <div class="toast-description">${options.description}</div>
    </div>
    ${options.isClosable ? '<button class="toast-close">&times;</button>' : ''}
  `;
  
  // Add close button functionality
  if (options.isClosable) {
    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        toast.classList.add('toast-exit');
        setTimeout(() => {
          toast.remove();
        }, 300);
      });
    }
  }
  
  // Add to the container
  toastContainer.appendChild(toast);
  
  // Auto dismiss after duration if specified
  if (options.duration) {
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-exit');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }
    }, options.duration);
  }
  
  return toast;
}

// Add OpenAI client instance
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-fallback-key',  // Use Vite's environment variable format
  dangerouslyAllowBrowser: true
});

// Helper function to create initial state
const createInitialState = (): SlideMasterState => {
  return {
    title: '',
    purpose: '',
    targetAudience: AUDIENCE_TYPES[0],
    audience: AUDIENCE_TYPES[0], // For backward compatibility
    lengthMinutes: 15,
    presentationStyle: 'professional',
    
    slides: [],
    theme: PRESENTATION_THEMES[0],
    customColors: [],
    
    generatedPrompt: '',
    rawGeneratedContent: '',
    
    currentStep: STEPS.INPUT,
    currentSlideIndex: 0,
    isComplete: false,
    lastUpdated: new Date().toISOString(),
    
    isShowingThemeSelector: false,
    isGeneratingImages: false
  };
};

// Import or implement the mock content generator function
function generateMockPresentationContent(prompt: string, style: string, audience: string): string {
  // Generate a mock presentation with 6 slides
  return `
Slide 1: Introduction to ${prompt}
• Welcome to our presentation on ${prompt}
• Today we'll explore key aspects and implications
• Prepared specifically for ${audience}

Slide 2: Current Landscape
• The market for ${prompt} is growing at 12% annually
• Major challenges include adoption and integration
• Recent innovations are changing how we approach this topic
• Image: Overview of the ${prompt} ecosystem with connected elements

Slide 3: Key Benefits and Opportunities
• Improves productivity by up to 30%
• Creates new opportunities for growth and innovation
• Reduces costs while increasing quality of outcomes
• Enables better decision-making through data insights
• Image: Visual representation of benefits with ascending chart and growth indicators

Slide 4: Implementation Strategies
• Phase 1: Assessment and planning
• Phase 2: Pilot program implementation
• Phase 3: Scaling and optimization
• Phase 4: Continuous improvement
• Image: Strategic implementation roadmap with milestone indicators

Slide 5: Case Studies
• Company A achieved 45% ROI within 6 months
• Organization B successfully transformed their operations
• Small businesses have seen particular success in adoption
• Image: Success stories illustrated with before/after comparisons

Slide 6: Conclusion and Next Steps
• ${prompt} represents a significant opportunity
• The time to act is now to stay competitive
• We recommend starting with a strategic assessment
• Questions and discussion
`;
}

// Fix the structured output typing - move this to the top with other interfaces
export interface OpenAISlide {
  type: string;
  title: string;
  subtitle?: string;
  content: {
    bullets: string[];
  };
  imagePrompt?: string;
  notes?: string;
}

export interface OpenAIPresentationResponse {
  title: string;
  slides: OpenAISlide[];
}

// Find and update the loading indicator
// ... existing code ...

// Now fix the generateImagesForSlides function to correctly update the slide images

// Move the main component code right after all interface declarations
const SlidesMasterMain: React.FC = () => {
  const navigate = useNavigate();
  // Replaced Chakra UI toast with our simple toast implementation
  const toast = showToast;
  
  // Get user progress
  const [userProgress, setUserProgress] = useUserProgress();
  
  // Component state
  const [state, setState] = useState<SlideMasterState>(createInitialState());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlides, setGeneratedSlides] = useState<any[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(null);
  const [imageProgress, setImageProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStep, setExportStep] = useState<'preparing' | 'exporting' | 'complete'>('preparing');
  const [exportMethod, setExportMethod] = useState<'pdf' | 'pptx'>('pdf');
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState('');
  const [totalSlidesToProcess, setTotalSlidesToProcess] = useState(0);
  const [currentProcessingSlide, setCurrentProcessingSlide] = useState(0);
  const [analysisStage, setAnalysisStage] = useState<'initializing' | 'processing' | 'generating' | 'analyzing' | 'finishing'>('initializing');
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);
  const [isContentGenerated, setIsContentGenerated] = useState(false);
  const [isSlidesGenerated, setIsSlidesGenerated] = useState(false);
  
  // Add state for challenge completion and confetti
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress.completedChallenges.includes('challenge-6')
  );
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Check if challenge is already completed on mount
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-6')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  useEffect(() => {
    // Load saved state from localStorage if available
    const savedState = localStorage.getItem('slidesMasterState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setState(parsedState);
        
        // Set appropriate generation flags based on saved state
        if (parsedState.rawGeneratedContent) {
          setIsContentGenerated(true);
        }
        
        if (parsedState.slides && parsedState.slides.length > 0) {
          setIsSlidesGenerated(true);
        }
      } catch (e) {
        console.error('Error parsing saved state:', e);
      }
    }
  }, []);
  
  // Save state to local storage when it changes
  useEffect(() => {
    localStorage.setItem('slidesMasterState', JSON.stringify(state));
  }, [state]);
  
  // Update state helper function
  const updateState = (newState: Partial<SlideMasterState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState, lastUpdated: new Date().toISOString() };
      return updated;
    });
  };
  
  // Helper function for loading toasts
  const showLoadingToast = (options: { title: string; description: string }) => {
    toastIdRef.current = showToast({
      title: options.title,
      description: options.description,
      status: 'info',
      duration: 9000, // Using a long duration instead of undefined
      isClosable: false
    });
  };
  
  // Fix image generation params
  const imageParams = { 
    useIdeogram: true,
    width: 1024,
    height: 768,
    quality: "hd" as "hd", // Type cast to specific literal type
    style: "professional"
  };

  // Update the generatePresentationContentLocal function with proper typing
  const generatePresentationContentLocal = async (topic: string, audience: string) => {
    try {
      setIsGenerating(true);
      
      // Force real data usage
      if (typeof window !== 'undefined' && window.ENV) {
        window.ENV.USE_MOCK_DATA = false;
      }
      
      showLoadingToast({
        title: "Generating Content",
        description: "Creating presentation content from your topic...",
      });

      // Update the state with the topic and audience
      updateState({
        title: topic,
        targetAudience: audience,
        audience: audience, // For backward compatibility
      });

      let generatedContent = '';
      
      // Use OpenAI for content generation instead of mock data
      try {
        // Create system prompt for structured output
        const systemPrompt = `You are an expert presentation designer who creates well-structured, professional presentations.
Generate a 6-slide presentation about the requested topic for the specified audience.
Each slide should have a clear title and 3-5 bullet points of content.
For the title slide, include a compelling subtitle.
For other slides, include suggestions for relevant visuals.

The presentation should follow this structure:
1. Title slide with subtitle
2. Introduction/Overview
3. Main concept/Problem statement
4. Benefits/Solutions
5. Examples/Case studies
6. Conclusion with call to action

Your response MUST follow this EXACT JSON format:
{
  "title": "Overall Presentation Title",
  "slides": [
    {
      "type": "title",
      "title": "Title of Slide 1",
      "subtitle": "Optional subtitle for first slide",
      "content": {
        "bullets": ["Point 1", "Point 2", "Point 3"]
      },
      "imagePrompt": "Detailed description for AI image generation"
    },
    {
      "type": "content",
      "title": "Title of Slide 2",
      "content": {
        "bullets": ["Point 1", "Point 2", "Point 3", "Point 4"]
      },
      "imagePrompt": "Detailed description for AI image generation"
    }
    // Remaining slides with similar structure
  ]
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `Create a professional presentation about "${topic}" for an audience of "${audience}". Please ensure each slide has a clear title, relevant bullet points, and a detailed image prompt. Make the content engaging, informative, and visually descriptive.`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        // Parse the JSON response
        const structuredOutput = JSON.parse(response.choices[0].message.content || '{}') as OpenAIPresentationResponse;
        
        // Convert structured output to the expected raw format for backward compatibility
        generatedContent = `Slide 1: ${structuredOutput.slides[0].title}
${structuredOutput.slides[0].subtitle ? '• ' + structuredOutput.slides[0].subtitle : ''}
${structuredOutput.slides[0].content.bullets.map((bullet: string) => '• ' + bullet).join('\n')}

Slide 2: ${structuredOutput.slides[1].title}
${structuredOutput.slides[1].content.bullets.map((bullet: string) => '• ' + bullet).join('\n')}
${structuredOutput.slides[1].imagePrompt ? 'Image: ' + structuredOutput.slides[1].imagePrompt : ''}

Slide 3: ${structuredOutput.slides[2].title}
${structuredOutput.slides[2].content.bullets.map((bullet: string) => '• ' + bullet).join('\n')}
${structuredOutput.slides[2].imagePrompt ? 'Image: ' + structuredOutput.slides[2].imagePrompt : ''}

Slide 4: ${structuredOutput.slides[3].title}
${structuredOutput.slides[3].content.bullets.map((bullet: string) => '• ' + bullet).join('\n')}
${structuredOutput.slides[3].imagePrompt ? 'Image: ' + structuredOutput.slides[3].imagePrompt : ''}

Slide 5: ${structuredOutput.slides[4].title}
${structuredOutput.slides[4].content.bullets.map((bullet: string) => '• ' + bullet).join('\n')}
${structuredOutput.slides[4].imagePrompt ? 'Image: ' + structuredOutput.slides[4].imagePrompt : ''}

Slide 6: ${structuredOutput.slides[5].title}
${structuredOutput.slides[5].content.bullets.map((bullet: string) => '• ' + bullet).join('\n')}
${structuredOutput.slides[5].imagePrompt ? 'Image: ' + structuredOutput.slides[5].imagePrompt : ''}`;

        // Store the structured data for direct use
        setStructuredSlideData(structuredOutput.slides);
        
        // Update title from the OpenAI response
        updateState({
          title: structuredOutput.title || topic,
        });
        
        } catch (error) {
        console.error("Error calling OpenAI:", error);
        // Fallback to mock data if OpenAI call fails
          generatedContent = generateMockPresentationContent(topic, state.presentationStyle, audience);
      }

      // Update the state with the generated content
      updateState({
        rawGeneratedContent: generatedContent,
        generatedPrompt: topic,
      });

      setIsContentGenerated(true);
      setIsGenerating(false);

      showToast({
        title: "Content Generated",
        description: "Your AI-powered presentation content is ready. You can now generate slides!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Move to the content generated step
      updateState({ currentStep: STEPS.CONTENT_GENERATED });
    } catch (error) {
      console.error("Error generating presentation:", error);
      setIsGenerating(false);
      showToast({
        title: "Generation Failed",
        description: "There was an error generating your presentation. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Restore missing parseContentIntoSlides function
  const parseContentIntoSlides = (content: string): Slide[] => {
    // If we have structured data from OpenAI, use that directly
    if (structuredSlideData && structuredSlideData.length > 0) {
      return structuredSlideData.map((slideData, index) => {
        return {
          id: `slide-${index + 1}`,
          type: slideData.type as SlideType,
          title: slideData.title,
          content: {
            bullets: slideData.content.bullets,
            imageDescription: slideData.imagePrompt,
          },
          notes: slideData.notes || '',
          imagePrompt: slideData.imagePrompt,
        };
      });
    }
    
    // Otherwise, use the existing parsing logic as fallback
    const slideDelimiter = /Slide \d+:?/gi;
    const slideTexts = content.split(slideDelimiter).filter(text => text.trim().length > 0);
    
    // If we don't get enough slides, make sure we return exactly 6
    const processedSlides = slideTexts.slice(0, Math.min(6, slideTexts.length));
    
    // If we have fewer than 6 slides, add empty slides to make up the difference
    while (processedSlides.length < 6) {
      processedSlides.push(` Additional Slide ${processedSlides.length + 1}\n• Add your content here\n• Customize this slide`);
    }
    
    return processedSlides.map((slideText, index) => {
      const lines = slideText.trim().split('\n').filter(line => line.trim().length > 0);
      
      // Get the title (first line, or fallback)
      const titleLine = lines[0]?.trim() || `Slide ${index + 1}`;
      // Clean up any bullet points from title
      const title = titleLine.replace(/^[•\-*]\s*/, '');
      
      // Extract bullets (lines that start with - or • or *)
      const bullets = lines
        .filter(line => line.trim().match(/^[•\-*]/))
        .map(line => line.trim().replace(/^[•\-*]\s*/, ''));
      
      // Extract image description if present
      const imageDescRegex = /image:(.+?)(?:\n|$)/i;
      const imageDescMatch = slideText.match(imageDescRegex);
      const imageDescription = imageDescMatch ? imageDescMatch[1].trim() : '';
      
      // Determine slide type based on index
      let slideType: SlideType = 'content';
      if (index === 0) {
        slideType = 'title';
      } else if (index === processedSlides.length - 1) {
        slideType = 'conclusion';
      }
      
      return {
        id: `slide-${index + 1}`,
        type: slideType,
        title,
        content: {
          bullets,
          imageDescription,
        },
        notes: '',
        imagePrompt: imageDescription || title,
      };
    });
  };

  // Generate slides from the already generated content
  const generateSlides = () => {
    try {
      setIsGenerating(true);
      showLoadingToast({
        title: "Creating Slides",
        description: "Turning your content into beautiful slides...",
      });

      // Parse the content into slides
      const slides = parseContentIntoSlides(state.rawGeneratedContent);
      
      // Update the state with the slides
      updateState({
        slides: slides,
        currentStep: STEPS.SLIDES_PREVIEW
      });

      setIsSlidesGenerated(true);
      setIsGenerating(false);

      showToast({
        title: "Slides Created",
        description: "Your presentation slides are ready!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Automatically generate images for slides after a brief delay
      setTimeout(() => {
        if (slides.length > 0) {
          generateImagesForSlides(slides);
        }
      }, 1000);
      
        } catch (error) {
      console.error("Error creating slides:", error);
      setIsGenerating(false);
        showToast({
        title: "Slide Creation Failed",
        description: "There was an error creating your slides. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle regenerating a specific image
  const handleRegenerateImage = async (index: number) => {
    if (state.isGeneratingImages || !state.slides[index]) return;
    
    updateState({ isGeneratingImages: true });
    
    try {
      const slide = state.slides[index];
      const basePrompt = slide.imagePrompt || slide.title;
      const enhancedPrompt = `High quality, professional image for a presentation slide about "${basePrompt}". ${
        slide.type === 'title' ? 'Make it visually striking and attention-grabbing.' : 
        slide.type === 'conclusion' ? 'Create a summary or forward-looking visual.' : 
        'Show clear visual elements related to the topic.'
      } Style: ${state.theme.name}, Audience: ${state.targetAudience}`;
      
      const imageUrl = await generateImage(enhancedPrompt, { useIdeogram: true });
      
      if (imageUrl) {
        const updatedSlides = [...state.slides];
        updatedSlides[index] = {
          ...slide,
          generatedImageUrl: imageUrl
        };
        
        updateState({ slides: updatedSlides });
        
        showToast({
          title: 'Image Regenerated',
          description: 'Your slide image has been successfully updated.',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
      showToast({
        title: 'Regeneration Failed',
        description: 'Could not regenerate the image. Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    } finally {
      updateState({ isGeneratingImages: false });
    }
  };

  // Handle selecting a theme
  const selectTheme = (theme: Theme) => {
    updateState({ theme });
  };

  // Handle selecting an AI suggested topic
  const selectSuggestedTopic = (topic: string) => {
    updateState({ generatedPrompt: topic });
  };

  // Handle enhancing the user's topic
  const enhanceTopic = () => {
    if (!state.generatedPrompt) return;
    
    const enhancedTopic = `${state.generatedPrompt}: Key trends, challenges, and future opportunities for ${state.targetAudience}.`;
    updateState({ generatedPrompt: enhancedTopic });
  };

  // Reset to the first step
  const handleRestart = () => {
    setState(createInitialState());
  };
  
  // In the SlidesMasterMain component, add a state for the current edited slide
  const [currentEditingSlide, setCurrentEditingSlide] = useState<number | null>(null);
  
  // Add function to handle slide editing
  const handleEditSlide = (index: number) => {
    setCurrentEditingSlide(index);
    updateState({ currentStep: STEPS.EDIT });
  };
  
  // Add function to save edited slide
  const handleSaveSlide = (index: number, updatedSlide: Slide) => {
    const updatedSlides = [...state.slides];
    updatedSlides[index] = updatedSlide;
    
    updateState({ 
      slides: updatedSlides,
      currentStep: STEPS.SLIDES_PREVIEW 
    });
    
    setCurrentEditingSlide(null);
    
    showToast({
      title: 'Slide Updated',
      description: 'Your changes have been saved.',
      status: 'success',
      duration: 2000,
      isClosable: true
    });
  };
  
  // Add function to cancel slide editing
  const handleCancelEdit = () => {
    setCurrentEditingSlide(null);
    updateState({ currentStep: STEPS.SLIDES_PREVIEW });
  };

  // Add a function to handle fullscreen presentation - GAMMA.APP STYLE
  const handleFullscreenPresentation = () => {
    if (!state.slides || state.slides.length === 0) {
      showToast({
        title: "No Slides Available",
        description: "Please generate slides first before presenting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Create a simple fullscreen presentation window
    const presentationWindow = window.open('', '_blank', 'fullscreen=yes');
    if (!presentationWindow) {
      showToast({
        title: "Could Not Open Presentation",
        description: "Please allow pop-ups for this site to use the presentation feature.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Generate theme-specific CSS variables
    const themeVars = {
      primary: state.theme.primaryColor,
      secondary: state.theme.secondaryColor,
      accent: state.theme.accentColor,
      background: state.theme.backgroundColor,
      fontTitle: state.theme.fontTitle,
      fontBody: state.theme.fontBody,
    };

    // Inject HTML/CSS/JS for a gamma-style presentation
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${state.title} - Presentation</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: ${themeVars.primary};
            --secondary: ${themeVars.secondary};
            --accent: ${themeVars.accent};
            --background: ${themeVars.background};
            --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
            --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            overflow: hidden;
            font-family: ${themeVars.fontBody};
            background: var(--background);
            color: var(--secondary);
          }
          
          * {
            box-sizing: border-box;
          }
          
          .slides-container {
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            position: relative;
          }
          
          .slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            opacity: 0;
            pointer-events: none;
            transition: var(--transition);
            padding: 4rem;
            transform: translateY(50px);
            overflow: hidden;
          }
          
          .slide.active {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
            z-index: 2;
          }
          
          .slide.previous {
            transform: translateX(-100%);
            opacity: 0;
            z-index: 1;
          }
          
          .slide.next {
            transform: translateX(100%);
            opacity: 0;
            z-index: 1;
          }
          
          .slide-inner {
            max-width: 1200px;
            margin: 0 auto;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          .slide-header {
            margin-bottom: 2rem;
            position: relative;
            z-index: 5;
          }
          
          .slide-title {
            font-family: ${themeVars.fontTitle};
            color: var(--primary);
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            line-height: 1.2;
            position: relative;
          }
          
          .slide-title:after {
            content: '';
            position: absolute;
            bottom: -0.5rem;
            left: 0;
            width: 5rem;
            height: 0.25rem;
            background: var(--accent);
            border-radius: 4px;
          }
          
          .slide-content {
            flex: 1;
            display: flex;
            position: relative;
            z-index: 5;
          }
          
          .title-slide .slide-title {
            font-size: 4.5rem;
            margin-top: auto;
            margin-bottom: 2rem;
          }
          
          .title-slide .slide-subtitle {
            font-size: 1.8rem;
            color: var(--secondary);
            margin-bottom: auto;
            opacity: 0.9;
          }
          
          .content-wrapper {
            flex: 1;
            display: flex;
            ${state.theme.name === 'Modern Professional' ? 'flex-direction: row;' : 'flex-direction: column;'}
          }
          
          .text-content {
            flex: ${state.theme.name === 'Modern Professional' ? '0.5' : '1'};
            padding-right: ${state.theme.name === 'Modern Professional' ? '2rem' : '0'};
          }
          
          .image-container {
            flex: ${state.theme.name === 'Modern Professional' ? '0.5' : '1'};
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            position: relative;
            ${state.theme.name === 'Modern Professional' ? '' : 'margin-top: 2rem;'}
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
          }
          
          .slide-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: cover;
            border-radius: 0.5rem;
            transition: transform 0.5s ease;
            transform-origin: center;
            filter: ${state.theme.name === 'Bold Impact' ? 'saturate(1.2)' : 'none'};
          }
          
          .active .slide-img {
            animation: subtle-zoom 10s ease infinite alternate;
          }
          
          @keyframes subtle-zoom {
            from { transform: scale(1); }
            to { transform: scale(1.05); }
          }
          
          .bullet-points {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .bullet-point {
            display: flex;
            font-size: 1.5rem;
            line-height: 1.4;
            color: var(--secondary);
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.5s ease;
            transition-delay: calc(var(--i) * 0.1s);
          }
          
          .bullet-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.8rem;
            height: 1.8rem;
            border-radius: 50%;
            background: var(--accent);
            color: white;
            margin-right: 1rem;
            flex-shrink: 0;
          }
          
          .active .bullet-point {
            opacity: 1;
            transform: translateY(0);
          }
          
          .slide-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
            opacity: 0.1;
          }
          
          .title-slide .slide-background {
            opacity: 0.2;
          }
          
          .controls {
            position: fixed;
            bottom: 2rem;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 2rem;
            z-index: 10;
          }
          
          .nav-buttons {
            display: flex;
            gap: 1rem;
          }
          
          .control-btn {
            padding: 0.7rem 1.5rem;
            background: rgba(255, 255, 255, 0.9);
            color: var(--primary);
            border: none;
            border-radius: 2rem;
            cursor: pointer;
            font-weight: 500;
            box-shadow: var(--shadow-md);
            transition: var(--transition);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .control-btn:hover {
            background: var(--primary);
            color: white;
          }
          
          .slide-indicator {
            display: flex;
            align-items: center;
            font-size: 0.9rem;
            color: var(--secondary);
            background: rgba(255, 255, 255, 0.9);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            box-shadow: var(--shadow-md);
          }
          
          .progress-container {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 0.35rem;
            background: rgba(0, 0, 0, 0.1);
            z-index: 10;
          }
          
          .progress-bar {
            height: 100%;
            background: var(--accent);
            width: 0;
            transition: width 0.3s ease;
          }
          
          .slide-dots {
            display: flex;
            gap: 0.5rem;
            margin-left: 1rem;
          }
          
          .slide-dot {
            width: 0.6rem;
            height: 0.6rem;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.2);
            transition: var(--transition);
          }
          
          .slide-dot.active {
            background: var(--accent);
            transform: scale(1.3);
          }
          
          .theme-${state.theme.name.toLowerCase().replace(/\s+/g, '-')} .slide-title {
            ${state.theme.name === 'Elegant Minimal' ? 'border-bottom: 1px solid var(--accent); padding-bottom: 1rem;' : ''}
          }
          
          .theme-${state.theme.name.toLowerCase().replace(/\s+/g, '-')} .bullet-icon {
            ${state.theme.name === 'Elegant Minimal' ? 'background: transparent; border: 1px solid var(--accent); color: var(--primary);' : ''}
            ${state.theme.name === 'Bold Impact' ? 'background: var(--primary); color: white;' : ''}
          }
          
          /* Animations for elements as slides become active */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .active .slide-title {
            animation: fadeInUp 0.6s ease forwards;
          }
          
          .active .slide-subtitle {
            animation: fadeInUp 0.6s ease 0.2s forwards;
            opacity: 0;
          }
          
          .active .image-container {
            animation: fadeInUp 0.6s ease 0.3s forwards;
            opacity: 0;
          }
          
          /* Keyboard navigation hint */
          .keyboard-hint {
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 255, 255, 0.9);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.8rem;
            color: var(--secondary);
            box-shadow: var(--shadow-sm);
            opacity: 0.7;
            transition: opacity 0.3s ease;
          }
          
          .keyboard-hint:hover {
            opacity: 1;
          }
        </style>
      </head>
      <body class="theme-${state.theme.name.toLowerCase().replace(/\s+/g, '-')}">
        <div class="slides-container">
          ${state.slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : index === 1 ? 'next' : ''} ${slide.type === 'title' ? 'title-slide' : ''}" id="slide-${index}">
              ${slide.generatedImageUrl ? `<img src="${slide.generatedImageUrl}" alt="${slide.title}" class="slide-background">` : ''}
              <div class="slide-inner">
                <div class="slide-header">
                  <h1 class="slide-title">${slide.title}</h1>
                  ${slide.type === 'title' && index === 0 ? `<p class="slide-subtitle">Prepared for ${state.targetAudience}</p>` : ''}
                </div>
                <div class="slide-content">
                  ${slide.type === 'title' ? `
                    <!-- Title slide layout -->
                    <div class="title-content">
                      ${slide.content.bullets && slide.content.bullets.length > 0 ? `
                        <div class="bullet-points">
                          ${slide.content.bullets.map((bullet, i) => `
                            <p style="--i: ${i};" class="title-bullet">${bullet}</p>
                          `).join('')}
                        </div>
                      ` : ''}
                    </div>
                  ` : `
                    <!-- Content slide layout -->
                    <div class="content-wrapper">
                      <div class="text-content">
                        ${slide.content.bullets && slide.content.bullets.length > 0 ? `
                          <div class="bullet-points">
                            ${slide.content.bullets.map((bullet, i) => `
                              <div style="--i: ${i};" class="bullet-point">
                                <span class="bullet-icon">${i + 1}</span>
                                <span>${bullet}</span>
                              </div>
                            `).join('')}
                          </div>
                        ` : ''}
                      </div>
                      ${slide.generatedImageUrl ? `
                        <div class="image-container">
                          <img src="${slide.generatedImageUrl}" alt="${slide.title}" class="slide-img">
                        </div>
                      ` : ''}
                    </div>
                  `}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="progress-container">
          <div class="progress-bar" id="progress-bar" style="width: ${100 / state.slides.length}%;"></div>
        </div>
        
        <div class="controls">
          <div class="slide-indicator">
            <span id="current-slide">1</span>/<span id="total-slides">${state.slides.length}</span>
            <div class="slide-dots" id="slide-dots">
              ${state.slides.map((_, i) => `<div class="slide-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
            </div>
          </div>
          <div class="nav-buttons">
            <button class="control-btn" id="prev-btn">← Previous</button>
            <button class="control-btn" id="next-btn">Next →</button>
            <button class="control-btn" id="exit-btn">Exit</button>
          </div>
        </div>
        
        <div class="keyboard-hint">
          Use arrow keys to navigate • ESC to exit
        </div>
        
        <script>
          let currentSlide = 0;
          const totalSlides = ${state.slides.length};
          const slides = document.querySelectorAll('.slide');
          const progressBar = document.getElementById('progress-bar');
          const currentSlideEl = document.getElementById('current-slide');
          const dots = document.querySelectorAll('.slide-dot');
          
          // Update slide classes based on current position
          function updateSlides() {
            slides.forEach((slide, index) => {
              slide.classList.remove('active', 'previous', 'next');
              if (index === currentSlide) {
                slide.classList.add('active');
              } else if (index < currentSlide) {
                slide.classList.add('previous');
              } else {
                slide.classList.add('next');
              }
            });
            
            // Update progress bar
            progressBar.style.width = ((currentSlide + 1) / totalSlides * 100) + '%';
            
            // Update current slide indicator
            currentSlideEl.textContent = currentSlide + 1;
            
            // Update dots
            dots.forEach((dot, index) => {
              dot.classList.toggle('active', index === currentSlide);
            });
          }
          
          // Next slide function
          function nextSlide() {
            if (currentSlide < totalSlides - 1) {
              currentSlide++;
              updateSlides();
            }
          }
          
          // Previous slide function
          function prevSlide() {
            if (currentSlide > 0) {
              currentSlide--;
              updateSlides();
            }
          }
          
          // Set up event listeners
          document.getElementById('next-btn').addEventListener('click', nextSlide);
          document.getElementById('prev-btn').addEventListener('click', prevSlide);
          document.getElementById('exit-btn').addEventListener('click', () => {
            window.close();
          });
          
          // Keyboard navigation
          document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
              nextSlide();
            } else if (e.key === 'ArrowLeft') {
              prevSlide();
            } else if (e.key === 'Escape') {
              window.close();
            }
          });
          
          // Click on dots to navigate
          dots.forEach(dot => {
            dot.addEventListener('click', () => {
              const index = parseInt(dot.getAttribute('data-index'));
              if (!isNaN(index)) {
                currentSlide = index;
                updateSlides();
              }
            });
          });
          
          // Click anywhere on right half to advance, left half to go back
          document.addEventListener('click', (e) => {
            const x = e.clientX;
            const width = window.innerWidth;
            
            // Only trigger if not clicking on a button
            if (!e.target.closest('button') && !e.target.closest('.slide-dot')) {
              if (x > width / 2) {
                nextSlide();
              } else {
                prevSlide();
              }
            }
          });
          
          // Initial activation of bullets for first slide
          setTimeout(() => {
            const activeBullets = document.querySelectorAll('.slide.active .bullet-point');
            activeBullets.forEach(bullet => {
              bullet.style.opacity = '1';
              bullet.style.transform = 'translateY(0)';
            });
          }, 500);
        </script>
      </body>
      </html>
    `;
    
    presentationWindow.document.write(html);
    presentationWindow.document.close();
  };

  // Render function based on current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case STEPS.INPUT:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-extrabold text-indigo-900 mb-2"
                >
                  AI Presentation Generator
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-indigo-700"
                >
                  Create beautiful, professional presentations in seconds
                </motion.p>
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"
                ></motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-xl overflow-hidden"
              >
                <div className="p-8">
                  {/* Topic Input - Enhanced */}
                  <div className="mb-8">
                    <label htmlFor="topic" className="block text-lg font-medium text-gray-800 mb-3">
                    What would you like to create a presentation about?
                  </label>
                    <div className="relative">
                  <textarea
                    id="topic"
                    rows={3}
                    value={state.generatedPrompt}
                    onChange={(e) => updateState({ generatedPrompt: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700 bg-indigo-50 bg-opacity-30"
                        placeholder="Enter your presentation topic or paste an outline..."
                    disabled={isGenerating}
                  />
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="absolute -top-2 -right-2"
                      >
                    <button
                      onClick={enhanceTopic}
                      disabled={!state.generatedPrompt || isGenerating}
                          className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        !state.generatedPrompt || isGenerating
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-md transition-all'
                      }`}
                    >
                          <span className="mr-1">✨</span> Enhance with AI
                    </button>
                      </motion.div>
                  </div>
                </div>
                
                  {/* AI Suggested Topics - Redesigned */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                      </svg>
                      Suggested Topics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {AI_SUGGESTED_TOPICS.map((topic, index) => (
                        <motion.button
                        key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        onClick={() => selectSuggestedTopic(topic)}
                        disabled={isGenerating}
                          className="text-left px-4 py-3 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:border-indigo-300 group"
                      >
                          <span className="text-sm font-medium group-hover:text-indigo-700 transition-colors">{topic}</span>
                        </motion.button>
                    ))}
                  </div>
                </div>
                
                  {/* Audience Selection - Redesigned with icons */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                      </svg>
                      Target Audience
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {AUDIENCE_TYPES.map((audienceType, index) => {
                        // Define icons for each audience type
                        const iconPath = index === 0 ? "M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" :
                                    index === 1 ? "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" :
                                    index === 2 ? "M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" :
                                    "M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z";
                        
                        return (
                          <motion.div
                        key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                        onClick={() => !isGenerating && updateState({ targetAudience: audienceType, audience: audienceType })}
                            className={`cursor-pointer rounded-xl transition-all ${
                          state.targetAudience === audienceType 
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md' 
                                : 'bg-white border border-indigo-100 hover:border-indigo-300 text-gray-700'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                            <div className="p-5 flex flex-col items-center text-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                                state.targetAudience === audienceType 
                                  ? 'bg-white bg-opacity-20' 
                                  : 'bg-indigo-100'
                              }`}>
                                <svg className={`w-6 h-6 ${
                                  state.targetAudience === audienceType 
                                    ? 'text-white' 
                                    : 'text-indigo-500'
                                }`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d={iconPath}></path>
                                </svg>
                      </div>
                              <span className="font-medium">{audienceType}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
                
                  {/* Theme Selection - Completely redesigned */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd"></path>
                      </svg>
                      Presentation Theme
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {PRESENTATION_THEMES.map((theme, index) => (
                        <motion.div
                        key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + (0.1 * index) }}
                        onClick={() => !isGenerating && selectTheme(theme)}
                          className={`cursor-pointer rounded-xl overflow-hidden transition-all ${
                          state.theme.name === theme.name 
                              ? 'ring-4 ring-indigo-300 transform scale-105 shadow-lg' 
                              : 'shadow hover:shadow-md border border-gray-100'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div 
                          style={{ 
                            background: theme.backgroundStyle === 'gradient' 
                              ? theme.backgroundColor 
                                : theme.backgroundColor
                          }}
                            className="relative h-48"
                        >
                            {/* Preview of slide with theme */}
                            <div className="absolute inset-0 p-6 flex flex-col">
                              <h4 className="text-lg font-bold mb-2" style={{ fontFamily: theme.fontTitle, color: theme.primaryColor }}>
                            {theme.name}
                              </h4>
                          <div 
                                className="w-12 h-1 mb-3 rounded-full" 
                            style={{ backgroundColor: theme.accentColor }}
                          ></div>
                              <div className="flex-1">
                                <div className="space-y-2">
                                  <div className="flex items-start">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5" style={{ backgroundColor: theme.accentColor, color: 'white' }}>1</span>
                                    <p className="text-sm" style={{ fontFamily: theme.fontBody, color: theme.secondaryColor }}>
                                      Professional slide design
                                    </p>
                        </div>
                                  <div className="flex items-start">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5" style={{ backgroundColor: theme.accentColor, color: 'white' }}>2</span>
                                    <p className="text-sm" style={{ fontFamily: theme.fontBody, color: theme.secondaryColor }}>
                                      Beautiful typography
                                    </p>
                      </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Selected indicator */}
                            {state.theme.name === theme.name && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                        </motion.div>
                    ))}
                  </div>
                </div>
                
                  {/* Generate Button - Enhanced */}
                  <div className="flex justify-center mt-12">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => generatePresentationContentLocal(state.generatedPrompt, state.targetAudience)}
                    disabled={!state.generatedPrompt || isGenerating}
                      className={`px-8 py-4 rounded-xl font-medium text-lg ${
                      !state.generatedPrompt || isGenerating
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all'
                    }`}
                  >
                    {isGenerating ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                          Creating Your Presentation...
                      </div>
                    ) : (
                        <>
                          <span className="mr-2">✨</span> Generate Professional Presentation
                        </>
                    )}
                    </motion.button>
                </div>
              </div>
              </motion.div>
            </motion.div>
          </div>
        );
      
      case STEPS.CONTENT_GENERATED:
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Content Generated for "{state.title}"</h2>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Generated Content:</h3>
                <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{state.rawGeneratedContent}</pre>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => updateState({ currentStep: STEPS.INPUT })}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Back to Input
                </button>
                <button
                  onClick={generateSlides}
                  disabled={isGenerating}
                  className={`px-6 py-2 ${
                    isGenerating 
                      ? "bg-blue-300 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-md transition-colors`}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-pulse">Generating Slides...</span>
                    </>
                  ) : (
                    "Generate Slides"
                  )}
                </button>
              </div>
            </div>
          </div>
        );
        
      case STEPS.SLIDES_PREVIEW:
        return (
          <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">{state.title}</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateState({ currentStep: STEPS.INPUT })}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back to Settings
                  </button>
                  <button
                    onClick={handleRestart}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Create New
                  </button>
                </div>
              </div>
              
              {/* Slides Grid - Limited to 6 slides maximum */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {state.slides.map((slide, index) => (
                  <div 
                    key={slide.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    {/* Slide Header - Updated and improved styling */}
                    <div 
                      className="p-4 border-b" 
                      style={{ 
                        background: state.theme.backgroundColor,
                        color: state.theme.primaryColor,
                        fontFamily: state.theme.fontTitle 
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold truncate text-lg" style={{ color: state.theme.primaryColor }}>
                          {slide.title}
                        </h3>
                        <span className="text-xs py-0.5 px-2 rounded-full bg-gray-100" style={{ color: state.theme.secondaryColor }}>
                          Slide {index + 1}
                        </span>
                      </div>
                      <div 
                        className="w-12 h-1 mt-2 rounded-full" 
                        style={{ backgroundColor: state.theme.accentColor }}
                      ></div>
                    </div>
                    
                    {/* Slide Content with Image if available */}
                    <div className="relative">
                      {slide.generatedImageUrl ? (
                        <div className="relative">
                          <img 
                            src={slide.generatedImageUrl} 
                            alt={slide.title} 
                            className={`w-full ${slide.type === 'title' ? 'h-40 object-cover' : 'h-32 object-contain bg-gray-50 p-2'}`}
                          />
                          {/* Image attribution or info */}
                          <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5">
                            AI Generated
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-20 bg-gray-50 flex items-center justify-center">
                          <p className="text-gray-400 text-sm">No image needed</p>
                        </div>
                      )}
                      
                      {/* Slide Content - Bullets and text */}
                      <div 
                        className="p-4" 
                        style={{ 
                          fontFamily: state.theme.fontBody,
                          color: state.theme.secondaryColor 
                        }}
                      >
                        {slide.content.bullets && slide.content.bullets.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {slide.content.bullets.map((bullet, i) => (
                              <li key={i} className="text-sm">{bullet}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">No bullet points</p>
                        )}
                      </div>
                      
                      {/* Actions buttons */}
                      <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 flex justify-between">
                        <button
                          onClick={() => handleEditSlide(index)}
                          className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Edit Content
                        </button>
                        <button
                          onClick={() => handleRegenerateImage(index)}
                          disabled={state.isGeneratingImages}
                          className="text-sm px-3 py-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                        >
                          {state.isGeneratingImages ? 'Generating...' : 'Refresh Image'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Presentation Actions */}
              <div className="flex justify-center space-x-4 mb-8">
                <button
                  onClick={handleExport}
                  className="px-6 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-md flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Export Presentation
                </button>
                <button
                  onClick={handleFullscreenPresentation}
                  className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md"
                >
                  Present Fullscreen
                </button>
              </div>
              
              {/* Preview of Presentation Mode */}
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
                  <span className="font-medium">Presentation Preview</span>
                  <span className="text-xs text-gray-400">Press "Present Fullscreen" to start the presentation</span>
                </div>
                <div 
                  className="aspect-video relative overflow-hidden"
                  style={{ 
                    background: state.theme.backgroundColor,
                  }}
                >
                  {state.slides.length > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                      <h2 
                        className="text-3xl font-bold mb-6 text-center"
                        style={{ 
                          fontFamily: state.theme.fontTitle,
                          color: state.theme.primaryColor 
                        }}
                      >
                        {state.slides[0].title}
                      </h2>
                      
                      {state.slides[0].generatedImageUrl && (
                        <div className="absolute inset-0 z-0 opacity-10">
                          <img 
                            src={state.slides[0].generatedImageUrl} 
                            alt="Background" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div 
                        className="z-10 text-center max-w-2xl"
                        style={{ 
                          fontFamily: state.theme.fontBody,
                          color: state.theme.secondaryColor 
                        }}
                      >
                        {state.slides[0].content.bullets && state.slides[0].content.bullets.length > 0 && (
                          <p className="text-xl">{state.slides[0].content.bullets[0]}</p>
                        )}
                      </div>
                      
                      <div 
                        className="absolute bottom-8 left-0 right-0 flex justify-center"
                      >
                        <div 
                          className="h-1 w-16 rounded-full"
                          style={{ backgroundColor: state.theme.accentColor }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        
      case STEPS.EDIT:
        // Add a slide editing interface
        if (currentEditingSlide !== null && state.slides[currentEditingSlide]) {
          const currentSlide = state.slides[currentEditingSlide];
          
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Edit Slide {currentEditingSlide + 1}</h1>
            <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
                    Cancel
            </button>
          </div>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
                  {/* Editing Form */}
                  <div className="p-6">
                    <div className="mb-4">
                      <label htmlFor="slideTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Slide Title
                      </label>
                      <input
                        id="slideTitle"
                        type="text"
                        value={currentSlide.title}
                        onChange={(e) => {
                          const updatedSlides = [...state.slides];
                          updatedSlides[currentEditingSlide] = {
                            ...currentSlide,
                            title: e.target.value
                          };
                          updateState({ slides: updatedSlides });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bullet Points
                      </label>
                      <div className="space-y-2">
                        {currentSlide.content.bullets?.map((bullet, idx) => (
                          <div key={idx} className="flex items-start">
                            <span className="mt-2 mr-2">•</span>
                            <textarea
                              value={bullet}
                              onChange={(e) => {
                                const updatedSlides = [...state.slides];
                                const updatedBullets = [...(currentSlide.content.bullets || [])];
                                updatedBullets[idx] = e.target.value;
                                
                                updatedSlides[currentEditingSlide] = {
                                  ...currentSlide,
                                  content: {
                                    ...currentSlide.content,
                                    bullets: updatedBullets
                                  }
                                };
                                updateState({ slides: updatedSlides });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              rows={2}
                            />
                            <button
                              onClick={() => {
                                const updatedSlides = [...state.slides];
                                const updatedBullets = [...(currentSlide.content.bullets || [])];
                                updatedBullets.splice(idx, 1);
                                
                                updatedSlides[currentEditingSlide] = {
                                  ...currentSlide,
                                  content: {
                                    ...currentSlide.content,
                                    bullets: updatedBullets
                                  }
                                };
                                updateState({ slides: updatedSlides });
                              }}
                              className="ml-2 mt-2 text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
            </div>
                        ))}
                        
            <button 
                          onClick={() => {
                            const updatedSlides = [...state.slides];
                            const updatedBullets = [...(currentSlide.content.bullets || []), ''];
                            
                            updatedSlides[currentEditingSlide] = {
                              ...currentSlide,
                              content: {
                                ...currentSlide.content,
                                bullets: updatedBullets
                              }
                            };
                            updateState({ slides: updatedSlides });
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          + Add Bullet Point
            </button>
          </div>
        </div>
                    
                    <div className="mb-4">
                      <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-700 mb-1">
                        Image Description (for AI generation)
                      </label>
                      <textarea
                        id="imagePrompt"
                        value={currentSlide.imagePrompt || ''}
                        onChange={(e) => {
                          const updatedSlides = [...state.slides];
                          updatedSlides[currentEditingSlide] = {
                            ...currentSlide,
                            imagePrompt: e.target.value
                          };
                          updateState({ slides: updatedSlides });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Describe the image you want for this slide..."
                      />
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Slide Preview</h3>
                    
                    <div 
                      className="border border-gray-300 rounded-md overflow-hidden"
                      style={{
                        background: state.theme.backgroundColor,
                      }}
                    >
                      <div 
                        className="p-4 border-b" 
                        style={{ 
                          color: state.theme.primaryColor,
                          fontFamily: state.theme.fontTitle 
                        }}
                      >
                        <h3 className="font-bold" style={{ color: state.theme.primaryColor }}>
                          {currentSlide.title}
                        </h3>
                        <div 
                          className="w-12 h-1 mt-1 rounded-full" 
                          style={{ backgroundColor: state.theme.accentColor }}
                        ></div>
                      </div>
                      
                      <div 
                        className="p-4" 
                        style={{ 
                          fontFamily: state.theme.fontBody,
                          color: state.theme.secondaryColor 
                        }}
                      >
                        {currentSlide.content.bullets && currentSlide.content.bullets.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {currentSlide.content.bullets.map((bullet, i) => (
                              <li key={i}>{bullet}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No bullet points</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleRegenerateImage(currentEditingSlide)}
                        disabled={state.isGeneratingImages}
                        className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {state.isGeneratingImages ? 'Generating...' : 'Generate New Image'}
                      </button>
                      <button
                        onClick={() => handleSaveSlide(currentEditingSlide, state.slides[currentEditingSlide])}
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
      </div>
            </div>
          );
        }
        return null;
      
      default:
        return <div>Invalid step</div>;
    }
  };

  // Add state for export modal
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Component for export options modal
  const ExportModal = () => {
    if (!showExportOptions) return null;

  return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a3 3 0 01-3-3v3h3zM3 10a3 3 0 013-3h3v3H3z"></path>
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Export Your Presentation
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Choose a format to export your presentation. PDF is recommended for sharing and printing.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowExportOptions(false);
                  exportToPDF();
                }}
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-3 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              >
                Export as PDF
                <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExportOptions(false);
                  exportToPPTX();
                }}
                className="inline-flex justify-center w-full rounded-md border border-indigo-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              >
                Export as Portable Format
                <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.293.293l5.414 5.414a1 1 0 001.414-1.414L15 3h-3zM3 10a3 3 0 013-3h3v3H3z"></path>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowExportOptions(false)}
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm sm:col-span-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add function to handle export options
  const handleExport = () => {
    if (!state.slides || state.slides.length === 0) {
      showToast({
        title: "No Slides Available",
        description: "Please generate slides first before exporting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setShowExportOptions(true);
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!state.slides || state.slides.length === 0) {
      showToast({
        title: "No Slides Available",
        description: "Please generate slides first before exporting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      showLoadingToast({
        title: "Exporting Presentation",
        description: "Preparing your PDF...",
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Create a temporary div to render slides for export
      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'absolute';
      exportContainer.style.left = '-9999px';
      exportContainer.style.width = '1280px'; // Set a consistent width for better quality
      document.body.appendChild(exportContainer);

      for (let i = 0; i < state.slides.length; i++) {
        const slide = state.slides[i];
        
        // Create slide HTML
        exportContainer.innerHTML = `
          <div style="width: 1280px; height: 720px; padding: 40px; background: ${state.theme.backgroundColor};">
            <div style="max-width: 1200px; margin: 0 auto; height: 100%;">
              <div style="margin-bottom: 2rem;">
                <h1 style="font-family: ${state.theme.fontTitle}; color: ${state.theme.primaryColor}; font-size: 48px; margin-bottom: 16px; line-height: 1.2;">${slide.title}</h1>
                <div style="width: 80px; height: 4px; background-color: ${state.theme.accentColor}; border-radius: 4px;"></div>
              </div>
              <div style="display: flex; ${state.theme.name === 'Modern Professional' ? 'flex-direction: row;' : 'flex-direction: column;'}">
                <div style="flex: ${state.theme.name === 'Modern Professional' ? '0.5' : '1'}; padding-right: ${state.theme.name === 'Modern Professional' ? '2rem' : '0'};">
                  ${slide.content.bullets && slide.content.bullets.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                      ${slide.content.bullets.map((bullet, idx) => `
                        <div style="display: flex; font-size: 24px; line-height: 1.4; color: ${state.theme.secondaryColor};">
                          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: ${state.theme.accentColor}; color: white; margin-right: 12px;">${idx + 1}</span>
                          <span>${bullet}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
                ${slide.generatedImageUrl ? `
                  <div style="flex: ${state.theme.name === 'Modern Professional' ? '0.5' : '1'}; display: flex; justify-content: center; align-items: center; margin-top: ${state.theme.name === 'Modern Professional' ? '0' : '32px'};">
                    <img src="${slide.generatedImageUrl}" alt="${slide.title}" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);" />
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;

        // Convert to canvas and add to PDF
        const canvas = await html2canvas(exportContainer.firstChild as HTMLElement, {
          scale: 1,
          useCORS: true,
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210); // A4 landscape dimensions

        // Update progress
        showLoadingToast({
          title: "Exporting Presentation",
          description: `Processing slide ${i + 1} of ${state.slides.length}...`,
        });
      }

      // Clean up
      document.body.removeChild(exportContainer);
      
      // Save the PDF
      pdf.save(`${state.title.replace(/\s+/g, '_')}.pdf`);

      showToast({
        title: "Export Complete",
        description: "Your presentation has been saved as a PDF",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      showToast({
        title: "Export Failed",
        description: "There was an error exporting your presentation. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Export to PowerPoint-like format (PPTX)
  const exportToPPTX = () => {
    if (!state.slides || state.slides.length === 0) {
      showToast({
        title: "No Slides Available",
        description: "Please generate slides first before exporting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      showLoadingToast({
        title: "Preparing Export",
        description: "Creating presentation file...",
      });

      // Create a presentation structure in JSON
      const presentationData = {
        title: state.title,
        theme: {
          name: state.theme.name,
          primaryColor: state.theme.primaryColor,
          secondaryColor: state.theme.secondaryColor,
          accentColor: state.theme.accentColor,
          fontTitle: state.theme.fontTitle,
          fontBody: state.theme.fontBody,
          backgroundColor: state.theme.backgroundColor
        },
        slides: state.slides.map(slide => ({
          title: slide.title,
          type: slide.type,
          bullets: slide.content.bullets || [],
          imageUrl: slide.generatedImageUrl || null,
          notes: slide.notes || ""
        }))
      };

      // Convert to JSON and save as a file
      const jsonStr = JSON.stringify(presentationData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      saveAs(blob, `${state.title.replace(/\s+/g, '_')}.json`);

      showToast({
        title: "Export Complete",
        description: "Your presentation has been saved as a portable format",
        status: "success", 
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error exporting presentation:", error);
      showToast({
        title: "Export Failed",
        description: "There was an error exporting your presentation. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fix the type definitions for the LoadingIndicator component
  // Global loading progress indicator for image generation
  interface LoadingIndicatorProps {
    currentSlide: number;
    totalSlides: number;
    message: string;
  }

  const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ currentSlide, totalSlides, message }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <div className="mb-4 text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <h3 className="text-lg font-semibold">{message}</h3>
          <p className="text-gray-600">Processing slide {currentSlide} of {totalSlides}</p>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentSlide / totalSlides) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const generateImagesForSlides = async (slides: Slide[]) => {
    updateState({ isGeneratingImages: true });
    
    try {
      // Force real data usage
      if (typeof window !== 'undefined' && window.ENV) {
        window.ENV.USE_MOCK_DATA = false;
      }
      
      const updatedSlides = [...slides];
      let successCount = 0;
      
      // Count total slides that need image generation
      const slidesToProcess = updatedSlides.filter(slide => 
        slide.type !== SlideTypeValues.TITLE && !slide.generatedImageUrl
      );
      setTotalSlidesToProcess(slidesToProcess.length);
      setCurrentProcessingSlide(0);
      
      showToast({
        title: "Generating Images",
        description: "Creating visuals for your slides...",
        status: "info",
        duration: 5000,
        isClosable: true,
      });

      let processedCount = 0;
      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];
        
        // Skip image generation for title slides or slides that already have images
        if (slide.type === SlideTypeValues.TITLE || (slide.generatedImageUrl && slide.generatedImageUrl.startsWith('http'))) {
          continue;
        }
        
        try {
          // Update processing progress
          processedCount++;
          setCurrentProcessingSlide(processedCount);
          setProcessingMessage(`Generating image for "${slide.title}"`);
          
          // Generate a prompt based on slide content
          let prompt = "";
          
          if (slide.imagePrompt) {
            prompt = slide.imagePrompt;
          } else {
            // Create a prompt based on slide content and type
            const basePrompt = slide.title || slide.content.mainText || state.generatedPrompt;
            
            if (slide.type === SlideTypeValues.IMAGE) {
              prompt = `High quality, professional image for a presentation slide about "${basePrompt}". Make it visually striking and attention-grabbing. Style: ${state.theme.name}, Audience: ${state.targetAudience}`;
            } else if (slide.type === SlideTypeValues.CHART) {
              prompt = `Professional visualization representing data about "${basePrompt}". Style: ${state.theme.name}, Audience: ${state.targetAudience}`;
            } else {
              prompt = `Professional image related to "${basePrompt}" for a business presentation. Style: ${state.theme.name}, Audience: ${state.targetAudience}`;
            }
          }
          
          // Generate the image
          const imageUrl = await generateImage(prompt);
          
          if (imageUrl) {
            updatedSlides[i] = {
              ...slide,
              generatedImageUrl: imageUrl
            };
            successCount++;
            
            // Update state after each successful image generation
            updateState({
              slides: [...updatedSlides],
              isGeneratingImages: true // Keep true until all done
            });
          }
        } catch (error) {
          console.error(`Error generating image for slide ${i + 1}:`, error);
        }
      }
      
      // Reset progress tracking and update final state
      setCurrentProcessingSlide(0);
      setTotalSlidesToProcess(0);
      
      updateState({
        slides: updatedSlides,
        isGeneratingImages: false
      });
      
      showToast({
        title: `${successCount} Images Generated`,
        description: "Your presentation now has visuals!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error("Error generating images:", error);
      
      // Reset progress tracking on error
      setCurrentProcessingSlide(0);
      setTotalSlidesToProcess(0);
      
      updateState({ isGeneratingImages: false });
      
      showToast({
        title: "Image Generation Failed",
        description: "There was an error generating images. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Add an AI enhance button in the slides preview section
  const renderSlidesPreview = () => {
    return (
      <div className="slides-preview-container">
        <div className="slides-preview-header">
          <h2>Your Presentation</h2>
          <div className="slides-preview-actions">
            <button 
              className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-md transition-all"
              onClick={() => generateImagesForSlides(state.slides)}
            >
              <span className="mr-1">✨</span> Enhance with AI
            </button>
            <button 
              className="action-button"
              onClick={handleExport}
              disabled={state.slides.length === 0}
            >
              Export
            </button>
            <button 
              className="action-button secondary"
              onClick={handleRestart}
            >
              Start Over
            </button>
          </div>
        </div>
        <div className="slides-preview-content">
          {/* Add your slides preview content here */}
        </div>
      </div>
    );
  };

  // Handle completing the challenge
  const handleCompleteChallenge = () => {
    // Check if user has completed enough of the presentation to mark as complete
    if (state.slides.length < 3) {
      alert('Please create at least 3 slides before completing the challenge.');
      return;
    }
    
    if (!state.title || state.title.trim() === '') {
      alert('Please add a title to your presentation before completing.');
      return;
    }
    
    markChallengeAsCompleted('challenge-6');
    setIsCompleted(true);
    
    // Update state to mark as complete
    updateState({ isComplete: true });
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <ChallengeHeader
        title="AI Slide Master Challenge"
        icon={<PresentationIcon className="h-6 w-6 text-purple-600" />}
        challengeId="challenge-6"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
      />
      
      <div className="bg-white shadow-md rounded-lg p-6">
      {renderCurrentStep()}
      </div>
      
      {/* Export Modal */}
      {isExportModalOpen && <ExportModal />}
    </div>
  );
};

export default SlidesMasterMain; 