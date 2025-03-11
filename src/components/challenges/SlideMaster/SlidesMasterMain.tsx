import React, { useState, useEffect, useCallback, useRef } from 'react';
import { saveChallengeSlidemaster, useUserProgress } from '../../../utils/userDataManager';
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

// Simple toast notification system
interface ToastOptions {
  title: string;
  description: string;
  status: 'info' | 'success' | 'error' | 'warning';
  duration: number | undefined; // Changed to number | undefined instead of number | null
  isClosable: boolean;
}

/**
 * Show a toast notification
 */
function showToast(options: ToastOptions): void {
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

// Component implementation
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
  const [remainingCredits, setRemainingCredits] = useState(getRemainingCredits());
  const [selectedStyle, setSelectedStyle] = useState('corporate');
  const [cachedImages, setCachedImages] = useState<Record<string, string>>({});
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [showInsightPanel, setShowInsightPanel] = useState(false);
  
  // Modal controls for preview and style selection
  const [previewOpen, setPreviewOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  
  const onPreviewOpen = () => setPreviewOpen(true);
  const onPreviewClose = () => setPreviewOpen(false);
  const onStyleOpen = () => setStyleOpen(true);
  const onStyleClose = () => setStyleOpen(false);

  const toastIdRef = useRef<any>();
  
  const [isContentGenerated, setIsContentGenerated] = useState(false);
  const [isSlidesGenerated, setIsSlidesGenerated] = useState(false);
  
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
  
  // Updated showLoadingToast function with proper typing
  const showLoadingToast = (options: { title: string; description: string }) => {
    toastIdRef.current = showToast({
      title: options.title,
      description: options.description,
      status: 'info',
      duration: 9000, // Using a long duration instead of undefined
      isClosable: false
    });
  };
  
  // Fix the generatePresentationContent function
  const generatePresentationContent = async (topic: string, audience: string) => {
    try {
      setIsGenerating(true);
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

      // Generate the content
      let generatedContent = '';
      if (shouldUseMockData()) {
        generatedContent = generateMockPresentationContent(topic, state.presentationStyle, audience);
      } else {
        // Use the imported function or mock data as fallback
        try {
          // Try to call the imported function
          const content = await generatePresentationContent(topic, audience);
          generatedContent = content || generateMockPresentationContent(topic, state.presentationStyle, audience);
        } catch (error) {
          console.error("Error generating content:", error);
          generatedContent = generateMockPresentationContent(topic, state.presentationStyle, audience);
        }
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
        description: "Your presentation content is ready. You can now generate slides!",
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

  // Parse the raw content into structured slides
  const parseContentIntoSlides = (content: string): Slide[] => {
    // Simple implementation - replace with proper parsing logic
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

  // Generate images for all slides using our optimized image API
  const generateImagesForSlides = async (slides: Slide[]) => {
    updateState({ isGeneratingImages: true });
    
    try {
      const updatedSlides = [...slides];
      let successCount = 0;
      
      // Process each slide sequentially but be selective about which slides get images
      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];
        
        // Only generate images for specific slides:
        // - Title slide (as background)
        // - Content slides with charts, data, or complex concepts
        // - Skip generic slides that don't need visual aid
        const needsImage = 
          slide.type === 'title' || // Always give title slide an image
          i === 1 || // Second slide often needs a visual
          (i !== 0 && i !== updatedSlides.length - 1 && i % 2 === 0); // Some content slides
          
        if (!needsImage) {
          continue;
        }
        
        try {
          // Create different prompts based on slide type
          const basePrompt = slide.imagePrompt || slide.title;
          let enhancedPrompt = '';
          
          if (slide.type === 'title') {
            enhancedPrompt = `Beautiful, abstract background image for a presentation title slide about "${basePrompt}". Professional, corporate style. Subtle pattern, not too busy.`;
          } else if (slide.content.imageDescription) {
            enhancedPrompt = `Clear informational image showing: ${slide.content.imageDescription}. Professional presentation style, clean design.`;
          } else {
            enhancedPrompt = `Relevant visual aid for a presentation about "${basePrompt}". Simple, clean design suitable for a ${state.targetAudience} audience. ${slide.content.bullets?.length ? `Illustrating concepts like: ${slide.content.bullets.slice(0, 2).join(", ")}` : ''}`;
          }
          
          // Add style context
          enhancedPrompt += ` Style: ${state.theme.name}, Color scheme using ${state.theme.primaryColor} and ${state.theme.accentColor}.`;
          
          // Call the optimized image generation API
          const imageUrl = await generateImage(enhancedPrompt, { useIdeogram: true });
          
          if (imageUrl) {
            updatedSlides[i] = {
              ...slide,
              generatedImageUrl: imageUrl
            };
            successCount++;
          }
        } catch (error) {
          console.error(`Error generating image for slide ${i + 1}:`, error);
        }
        
        // Update progress after each successful image generation
        updateState({ slides: [...updatedSlides] });
      }
      
      if (successCount > 0) {
        showToast({
          title: 'Images Generated',
          description: `Created ${successCount} images for your presentation.`,
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error generating images:', error);
      showToast({
        title: 'Image Generation Issue',
        description: 'There was a problem creating some images. Your presentation may have placeholders.',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
    } finally {
      updateState({ isGeneratingImages: false });
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

  // Render function based on current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case STEPS.INPUT:
        return (
          <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Simple AI Presentation Generator</h1>
                <p className="mt-2 text-lg text-gray-600">Create a 6-slide presentation in seconds with AI assistance</p>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                {/* Topic Input */}
                <div className="mb-6">
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                    What would you like to create a presentation about?
                  </label>
                  <textarea
                    id="topic"
                    rows={3}
                    value={state.generatedPrompt}
                    onChange={(e) => updateState({ generatedPrompt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your presentation topic here..."
                    disabled={isGenerating}
                  />
                  
                  {/* AI Topic Enhancement */}
                  <div className="mt-2">
                    <button
                      onClick={enhanceTopic}
                      disabled={!state.generatedPrompt || isGenerating}
                      className={`text-sm px-3 py-1 rounded-md ${
                        !state.generatedPrompt || isGenerating
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      ✨ Enhance with AI
                    </button>
                  </div>
                </div>
                
                {/* AI Suggested Topics */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Or select a suggested topic:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AI_SUGGESTED_TOPICS.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => selectSuggestedTopic(topic)}
                        disabled={isGenerating}
                        className="text-left px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Audience Selection - Simplified to 4 options */}
                <div className="mb-6">
                  <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                    Select your target audience:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AUDIENCE_TYPES.map((audienceType, index) => (
                      <div
                        key={index}
                        onClick={() => !isGenerating && updateState({ targetAudience: audienceType, audience: audienceType })}
                        className={`px-3 py-3 border rounded-md text-center cursor-pointer transition-all ${
                          state.targetAudience === audienceType 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-sm font-medium">{audienceType}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Theme Selection - Just 3 enhanced themes */}
                <div className="mb-8">
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a presentation theme:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PRESENTATION_THEMES.map((theme, index) => (
                      <div
                        key={index}
                        onClick={() => !isGenerating && selectTheme(theme)}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          state.theme.name === theme.name 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div 
                          className="h-24 flex flex-col justify-center p-4" 
                          style={{ 
                            background: theme.backgroundStyle === 'gradient' 
                              ? theme.backgroundColor 
                              : theme.backgroundColor,
                            color: theme.name === 'Modern Professional' ? theme.primaryColor : theme.name === 'Elegant Minimal' ? theme.primaryColor : theme.name === 'Bold Impact' ? theme.primaryColor : '#111827'
                          }}
                        >
                          <h3 className="font-bold mb-2" style={{ fontFamily: theme.fontTitle, color: theme.primaryColor }}>
                            {theme.name}
                          </h3>
                          <p className="text-sm opacity-90" style={{ fontFamily: theme.fontBody, color: theme.secondaryColor }}>
                            Sample presentation text
                          </p>
                          <div 
                            className="w-16 h-1 mt-2 rounded-full" 
                            style={{ backgroundColor: theme.accentColor }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Generate Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => generatePresentationContent(state.generatedPrompt, state.targetAudience)}
                    disabled={!state.generatedPrompt || isGenerating}
                    className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white ${
                      !state.generatedPrompt || isGenerating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all'
                    }`}
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Presentation...
                      </div>
                    ) : (
                      'Generate 6-Slide Presentation'
                    )}
                  </button>
                </div>
              </div>
            </div>
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
                  onClick={() => alert("This would export your presentation as a PDF or PowerPoint file.")}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all"
                >
                  Export Presentation
                </button>
                <button
                  onClick={() => window.open(`/preview/${state.title.replace(/\s+/g, '-').toLowerCase()}`, '_blank')}
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

  return (
    <div className="slide-master-container min-h-screen">
      {renderCurrentStep()}
    </div>
  );
};

export default SlidesMasterMain; 