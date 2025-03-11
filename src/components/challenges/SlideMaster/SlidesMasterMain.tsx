import React, { useState, useEffect, useCallback, useRef } from 'react';
import { saveChallengeSlidemaster, useUserProgress } from '../../../utils/userDataManager';
import PromptEditor from './PromptEditor';
import ThemeSelector from './ThemeSelector';
import CompletionScreen from './CompletionScreen';
import SlideEditor from './SlideEditor';
import { generatePresentationContent, parseContentIntoSlides } from '../../../utils/contentGenerator';
import { generateImage, generateImagePromptFromSlide, generateMultipleImages } from '../../../utils/imageGenerator';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { shouldUseMockData } from '../../../utils/envConfig';

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
  PROMPT: 0,        // Enter prompt and generate content
  THEME: 1,         // Select theme for presentation
  GENERATE_IMAGES: 2, // Generate images for slides
  EDIT: 3,          // Edit slides if needed
  EXPORT: 4,        // Export and complete
  LOADING: 5        // Loading state during processing
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

// Website theme-inspired themes
const THEMES: Theme[] = [
  {
    name: 'HP Professional Blue',
    primaryColor: '#0096D6',
    secondaryColor: '#00447C',
    accentColor: '#F3CD00',
    backgroundColor: '#FFFFFF',
    fontTitle: 'Arial, sans-serif',
    fontBody: 'Arial, sans-serif',
    backgroundStyle: 'solid'
  },
  {
    name: 'Modern Gradient',
    primaryColor: '#4F46E5',
    secondaryColor: '#7C3AED',
    accentColor: '#EC4899',
    backgroundColor: '#F9FAFB',
    fontTitle: 'Helvetica, sans-serif',
    fontBody: 'Helvetica, sans-serif',
    backgroundStyle: 'gradient'
  },
  {
    name: 'Clean Minimalist',
    primaryColor: '#1F2937',
    secondaryColor: '#4B5563',
    accentColor: '#22C55E',
    backgroundColor: '#F9FAFB',
    fontTitle: 'Inter, sans-serif',
    fontBody: 'Inter, sans-serif',
    backgroundStyle: 'solid'
  },
  {
    name: 'Bold Impact',
    primaryColor: '#18181B',
    secondaryColor: '#3F3F46',
    accentColor: '#EAB308',
    backgroundColor: '#FFFFFF',
    fontTitle: 'Montserrat, sans-serif',
    fontBody: 'Open Sans, sans-serif',
    backgroundStyle: 'solid'
  },
  {
    name: 'Vibrant Creative',
    primaryColor: '#7C3AED',
    secondaryColor: '#6366F1',
    accentColor: '#F97316',
    backgroundColor: '#FAFAFA',
    fontTitle: 'Poppins, sans-serif',
    fontBody: 'Roboto, sans-serif',
    backgroundStyle: 'gradient'
  }
];

// Helper function to create initial state
const createInitialState = (): SlideMasterState => {
  return {
    title: '',
    purpose: '',
    targetAudience: '',
    lengthMinutes: 15,
    presentationStyle: 'professional',
    
    slides: [],
    theme: THEMES[0], 
    customColors: [],
    visualElements: ['shadows', 'roundedCorners'],
    transition: 'fade',
    
    generatedPrompt: '',
    rawGeneratedContent: '',
    
    currentStep: STEPS.PROMPT,
    currentSlideIndex: 0,
    isComplete: false,
    lastUpdated: new Date().toISOString(),
    
    isShowingThemeSelector: false,
    isGeneratingImages: false
  };
};

// Import or implement the mock content generator function
function generateMockPresentationContent(prompt: string, style: string, audience: string): string {
  // Create a mock presentation based on the prompt
  const topic = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
   
  return `# ${topic}
## Your ${style} presentation for ${audience}

___

# Introduction to ${topic}
* Understanding the basics
* Why this matters to ${audience}
* Key objectives for this presentation
[IMAGE: An engaging opening image showing the main concept of ${topic} with a ${style} aesthetic]
[NOTES: Welcome everyone and introduce the topic with enthusiasm. Establish your credibility on this subject.]

___

# Agenda
* Background and Context
* Key Concepts
* Applications and Use Cases
* Benefits and Challenges
* Next Steps and Recommendations
[IMAGE: A clean organized roadmap or journey visual showing the presentation flow]
[NOTES: Briefly walk through what we'll cover today to set expectations.]

___

# Background and Context
* Historical development of ${topic}
* Current landscape and trends
* Relevance to ${audience}
[IMAGE: Timeline or evolution diagram showing how ${topic} has developed over time]
[NOTES: Provide enough context to ensure everyone has the foundational knowledge needed.]

___

# Key Concepts
* Fundamental principles
* Important terminology
* Core frameworks to understand
[IMAGE: Visual diagram showing the relationship between the key concepts of ${topic}]
[NOTES: Explain these concepts in simple terms with real-world examples that resonate with ${audience}.]

___

# Applications and Use Cases
* Real-world examples
* Success stories
* Potential opportunities
* How ${audience} can leverage this
[IMAGE: Collage of real application examples or implementation scenarios for ${topic}]
[NOTES: Share specific examples that are most relevant to this audience. Consider asking if anyone has experience with these applications.]

___

# Benefits and Challenges
* Advantages of implementation
* Potential obstacles to consider
* Strategies for overcoming challenges
* ROI considerations for ${audience}
[IMAGE: Balance scale or comparison chart showing the benefits versus challenges]
[NOTES: Be honest about the challenges while maintaining an optimistic tone about overcoming them.]

___

# Next Steps and Recommendations
* Practical implementation advice
* Resources for further learning
* Recommended timeline
* Support options
[IMAGE: Action plan or roadmap showing the path forward with clear steps]
[NOTES: Make these recommendations specific and actionable. Offer yourself as a resource for follow-up questions.]

___

# Thank You!
* Contact information
* Q&A session
* Additional resources
[IMAGE: Professional closing image with contact details and a thank you message in ${style} style]
[NOTES: Thank the audience for their time. Encourage questions and engagement after the presentation.]`;
}

// Component implementation
const SlidesMasterMain: React.FC = () => {
  // Get user progress
  const [userProgress, setUserProgress] = useUserProgress();
  
  // Component state
  const [state, setState] = useState<SlideMasterState>(createInitialState());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load saved state from local storage on initial mount
  useEffect(() => {
    const savedState = localStorage.getItem('slidesMasterState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setState(parsedState);
      } catch (e) {
        console.error('Error loading saved state:', e);
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
  
  // Step 1: Generate presentation content from prompt
  const generatePresentation = async (prompt: string, style: string, audience: string) => {
    try {
      setError(null);
      setIsGenerating(true);
      updateState({ currentStep: STEPS.LOADING });
      
      console.log(`Generating presentation for prompt: "${prompt}"`);
      
      // Call the OpenAI API to generate presentation content
      const content = await generatePresentationContent(prompt, style, audience);
      
      // If we got content back (either real or mock), proceed
      if (content) {
        // Parse the generated content into structured slides
        const slides = parseContentIntoSlides(content);
        
        // Update presentation metadata
        const presentationTitle = slides[0]?.title || 'Generated Presentation';
        
        // Update state with the generated content and move to theme selection
        updateState({
          title: presentationTitle,
          slides,
          rawGeneratedContent: content,
          generatedPrompt: prompt,
          currentStep: STEPS.THEME,  // Move directly to theme selection
          presentationStyle: style,
          targetAudience: audience,
        });
      } else {
        throw new Error("No content was generated. Please try again with a different prompt.");
      }
      
      setIsGenerating(false);
    } catch (error: any) {
      console.error("Error generating presentation:", error);
      
      // Provide a specific error message to the user
      let errorMessage = "Failed to generate presentation. Please try again with a different prompt.";
      if (error?.message) {
        // If there's a readable error message, show it to the user
        if (error.message.includes('API key')) {
          errorMessage = "The OpenAI API key is not configured. Using mock data instead.";
          
          // We'll try to use mock data as a fallback
          try {
            const mockContent = generateMockPresentationContent(prompt, style, audience);
            const slides = parseContentIntoSlides(mockContent);
            const presentationTitle = slides[0]?.title || 'Mock Presentation';
            
            updateState({
              title: presentationTitle,
              slides,
              rawGeneratedContent: mockContent,
              generatedPrompt: prompt,
              currentStep: STEPS.THEME,
              presentationStyle: style,
              targetAudience: audience,
            });
            
            setIsGenerating(false);
            return; // Exit early after successful mock generation
          } catch (mockError) {
            console.error("Error generating mock presentation:", mockError);
            errorMessage = "Failed to generate presentation content. Please try again later.";
          }
        }
      }
      
      setError(errorMessage);
      updateState({ currentStep: STEPS.PROMPT });
      setIsGenerating(false);
    }
  };
  
  // Step 2: Select theme for the presentation
  const selectTheme = (theme: Theme) => {
    updateState({ 
      theme,
      currentStep: STEPS.GENERATE_IMAGES,
      isShowingThemeSelector: false 
    });
    
    // Automatically start generating images after theme selection
    generateImagesForSlides();
  };
  
  // Step 3: Generate images for slides
  const generateImagesForSlides = async () => {
    try {
      setError(null);
      updateState({ 
        isGeneratingImages: true,
        currentStep: STEPS.LOADING
      });

      // Find slides with image prompts but no generated images
      const slidesToGenerateImages = state.slides.filter(
        slide => slide.imagePrompt && !slide.generatedImageUrl
      );

      if (slidesToGenerateImages.length === 0) {
        // No images to generate, move to edit step
        updateState({ 
          isGeneratingImages: false,
          currentStep: STEPS.EDIT
        });
        return;
      }

      console.log(`Generating images for ${slidesToGenerateImages.length} slides`);
      
      // Extract image prompts
      const imagePrompts = slidesToGenerateImages.map(slide => slide.imagePrompt || '');

      // Generate images using DALL-E API
      const imageUrls = await generateMultipleImages(imagePrompts, {
        size: 'large',
        style: state.presentationStyle === 'professional' ? 'professional' : 'natural'
      });

      // Update slides with generated image URLs
      const updatedSlides = [...state.slides];
      slidesToGenerateImages.forEach((slide, index) => {
        const slideIndex = updatedSlides.findIndex(s => s.id === slide.id);
        if (slideIndex !== -1 && imageUrls[index]) {
          updatedSlides[slideIndex] = {
            ...updatedSlides[slideIndex],
            generatedImageUrl: imageUrls[index]
          };
        }
      });

      // Update state and move to edit step
      updateState({ 
        slides: updatedSlides,
        isGeneratingImages: false,
        currentStep: STEPS.EDIT
      });
    } catch (error) {
      console.error("Error generating images:", error);
      setError("Failed to generate images. You can continue without images or try again.");
      updateState({ 
        isGeneratingImages: false,
        currentStep: STEPS.EDIT // Still proceed to edit step
      });
    }
  };
  
  // Navigation functions
  const handleNext = () => {
    updateState({ currentStep: state.currentStep + 1 });
  };
  
  const handleBack = () => {
    updateState({ currentStep: state.currentStep - 1 });
  };
  
  const handleComplete = () => {
    try {
      // Mark the challenge as complete in user progress
      setUserProgress((prev: any) => {
        const newProgress = { ...prev };
        
        if (!newProgress.challenges) {
          newProgress.challenges = {};
        }
        
        newProgress.challenges.slidemaster = {
          ...newProgress.challenges.slidemaster,
          completed: true,
          completedAt: new Date().toISOString()
        };
        
        // Save challenge data with required parameters
        saveChallengeSlidemaster(
          'slidemaster',  // challengeId
          state.title || 'Untitled Presentation',  // presentationTitle
          state.theme.name || 'default',  // theme
          state.slides.length,  // totalSlides
          state.slides.filter(slide => slide.generatedImageUrl).length  // generatedImages
        );
        
        return newProgress;
      });
      
      updateState({ 
        isComplete: true,
        currentStep: STEPS.EXPORT
      });
    } catch (error) {
      console.error("Error completing challenge:", error);
    }
  };
  
  const handleRestart = () => {
    setState(createInitialState());
  };
  
  const toggleThemeSelector = () => {
    updateState({ isShowingThemeSelector: !state.isShowingThemeSelector });
  };
  
  // Render the current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case STEPS.PROMPT:
        return (
          <PromptEditor
            state={state}
            updateState={updateState}
            onGenerate={generatePresentation}
            isGenerating={isGenerating}
          />
        );
      
      case STEPS.THEME:
        return (
          <ThemeSelector
            themes={THEMES}
            selectedTheme={state.theme}
            onSelectTheme={selectTheme}
            presentationTitle={state.title}
            onBack={() => updateState({ currentStep: STEPS.PROMPT })}
          />
        );
      
      case STEPS.LOADING:
        // Show loading indicator while generating content or images
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4">
            <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="text-xl font-bold text-gray-800 mt-6 mb-2">
                {state.isGeneratingImages 
                  ? "Generating Images with DALL-E" 
                  : "Creating Your Presentation"}
              </h2>
              <p className="text-gray-600">
                {state.isGeneratingImages
                  ? "We're generating custom images for your slides. This may take a moment..."
                  : "Our AI is crafting your presentation. Please wait..."}
              </p>
            </div>
          </div>
        );
      
      case STEPS.EDIT:
        return (
          <SlideEditor
            state={state}
            updateState={updateState}
            onNext={handleComplete}
            onBack={() => updateState({ currentStep: STEPS.THEME })}
          />
        );
      
      case STEPS.EXPORT:
        return (
          <CompletionScreen
            state={state}
            onRestart={handleRestart}
          />
        );
      
      default:
        return (
          <div className="text-center p-8">
            <p className="text-red-600">Unknown step: {state.currentStep}</p>
            <button
              onClick={handleRestart}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Start Over
            </button>
          </div>
        );
    }
  };
  
  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Error message display */}
      {error && (
        <div className="fixed top-4 inset-x-0 mx-auto max-w-md z-50">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md shadow-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Theme selector overlay */}
      {state.isShowingThemeSelector && (
        <ThemeSelector
          themes={THEMES}
          selectedTheme={state.theme}
          onSelectTheme={selectTheme}
          presentationTitle={state.title}
          onBack={toggleThemeSelector}
        />
      )}
      
      {/* Main content */}
      <div className="container mx-auto">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default SlidesMasterMain; 