import React, { useState, useEffect } from 'react';
import { saveChallengeSlidemaster, useUserProgress } from '../../../utils/userDataManager';
import PresentationSetup from './PresentationSetup';
import SlideContentCreation from './SlideContentCreation';
import VisualCustomization from './VisualCustomization';
import PresentationPreview from './PresentationPreview';
import CompletionScreen from './CompletionScreen';
import LandingPage from './LandingPage';
import PasteContent from './PasteContent';
import PromptEditor from './PromptEditor';
import ThemeSelector from './ThemeSelector';

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

// Define interfaces for state management
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
  slideTemplates: SlideTemplate[];
  selectedTemplate: string;
  theme: Theme;
  customColors: string[];
  visualElements?: string[];
  transition?: TransitionType;
  
  // Input content
  pastedContent?: string;
  generatedPrompt?: string;
  importedFileUrl?: string;
  
  // Progress tracking
  currentStep: number;
  currentSlideIndex: number;
  isComplete: boolean;
  lastUpdated: string;
  
  // New properties for the landing page and content input methods
  contentMethod?: string; // 'paste', 'generate', 'import'
  isShowingThemeSelector: boolean;
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

export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  slideTypes: SlideType[];
  example: string;
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

// Initial slide templates
const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: 'business',
    name: 'Professional Business',
    description: 'Clean and corporate style with a focus on clarity and professionalism',
    slideTypes: ['title', 'agenda', 'content', 'twoColumn', 'chart', 'quote', 'conclusion'],
    example: 'business-example.jpg'
  },
  {
    id: 'creative',
    name: 'Creative Storytelling',
    description: 'Visually rich presentation focused on narrative and engagement',
    slideTypes: ['title', 'image', 'quote', 'comparison', 'content', 'conclusion'],
    example: 'creative-example.jpg'
  },
  {
    id: 'academic',
    name: 'Academic/Research',
    description: 'Structured presentation with emphasis on data and findings',
    slideTypes: ['title', 'agenda', 'content', 'chart', 'table', 'twoColumn', 'conclusion'],
    example: 'academic-example.jpg'
  },
  {
    id: 'pitch',
    name: 'Startup Pitch',
    description: 'Impactful presentation designed to sell an idea or product',
    slideTypes: ['title', 'content', 'chart', 'quote', 'image', 'conclusion'],
    example: 'pitch-example.jpg'
  },
  {
    id: 'minimal',
    name: 'Minimalist',
    description: 'Clean design with plenty of white space and focus on essential content',
    slideTypes: ['title', 'content', 'image', 'quote', 'conclusion'],
    example: 'minimal-example.jpg'
  }
];

// Initial theme options
const INITIAL_THEMES: Theme[] = [
  {
    name: 'Professional Blue',
    primaryColor: '#1A4B8C',
    secondaryColor: '#2D6CC0',
    accentColor: '#F39237',
    backgroundColor: '#FFFFFF',
    fontTitle: 'Arial, sans-serif',
    fontBody: 'Arial, sans-serif',
    backgroundStyle: 'solid'
  },
  {
    name: 'Modern Dark',
    primaryColor: '#333333',
    secondaryColor: '#555555',
    accentColor: '#4CAF50',
    backgroundColor: '#F5F5F5',
    fontTitle: 'Helvetica, sans-serif',
    fontBody: 'Helvetica, sans-serif',
    backgroundStyle: 'solid'
  },
  {
    name: 'Creative Purple',
    primaryColor: '#6200EA',
    secondaryColor: '#B388FF',
    accentColor: '#FF5722',
    backgroundColor: '#FAFAFA',
    fontTitle: 'Georgia, serif',
    fontBody: 'Verdana, sans-serif',
    backgroundStyle: 'gradient'
  }
];

// Presentation tips
const PRESENTATION_TIPS = [
  "The average audience attention span is about 10 minutes before engagement drops",
  "Using images increases retention by 65% compared to text-only slides",
  "The ideal slide has no more than 6 bullet points with 6 words per bullet",
  "Practice your presentation at least 3-5 times before delivering it",
  "93% of communication effectiveness is determined by nonverbal cues",
  "Color psychology matters: blue builds trust, orange creates enthusiasm, green suggests growth",
  "Stories are 22 times more memorable than facts alone",
  "Eye contact with your audience increases perceived trustworthiness by 40%",
  "Presentations with clear structure are 40% more likely to achieve their objectives",
  "Including a surprising fact or statistic increases audience attention by 30%"
];

// Step titles - simplified workflow
const STEPS = {
  PROMPT: 0,
  PREVIEW: 1,
  THEME: 2,
  EXPORT: 3
};

// Helper function to create initial state
const createInitialState = (): SlideMasterState => {
  return {
    title: '',
    purpose: '',
    targetAudience: '',
    lengthMinutes: 15,
    presentationStyle: '',
    
    slides: [],
    slideTemplates: SLIDE_TEMPLATES,
    selectedTemplate: SLIDE_TEMPLATES[0].id,
    theme: INITIAL_THEMES[0], // Using the first theme as default
    customColors: [],
    visualElements: ['shadows', 'roundedCorners'],
    transition: 'fade',
    
    generatedPrompt: '',
    isShowingThemeSelector: false,
    
    currentStep: STEPS.PROMPT,
    currentSlideIndex: 0,
    isComplete: false,
    lastUpdated: new Date().toISOString()
  };
};

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
        setState(JSON.parse(savedState));
      } catch (err) {
        console.error('Error loading saved state:', err);
      }
    }
  }, []);
  
  // Save state to local storage on state changes
  useEffect(() => {
    localStorage.setItem('slidesMasterState', JSON.stringify(state));
  }, [state]);
  
  // Update state
  const updateState = (newState: Partial<SlideMasterState>) => {
    setState(prevState => ({
      ...prevState,
      ...newState,
      lastUpdated: new Date().toISOString()
    }));
  };
  
  // Generate presentation from prompt
  const generatePresentation = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // In a real implementation, this would call OpenAI API
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Example slide structure for demo
      const slideTypes = ['title', 'content', 'content', 'image', 'content', 'chart', 'content', 'conclusion'];
      const slideTitles = [
        'Introduction',
        'Key Concepts',
        'Important Features',
        'Visual Representation',
        'Best Practices',
        'Data Analysis',
        'Implementation Steps',
        'Summary & Next Steps'
      ];
      
      // Generate slides based on the prompt
      const newSlides = slideTypes.map((type, index) => ({
        id: `slide-${Date.now()}-${index}`,
        type: type as SlideType,
        title: slideTitles[index],
        content: generateSlideContent(type as SlideType, prompt, index),
        notes: `Speaker notes for slide ${index + 1}: ${slideTitles[index]}`,
        transition: 'fade' as TransitionType
      }));
      
      // Set the title and other metadata based on the prompt
      const presentationTitle = `${prompt.charAt(0).toUpperCase() + prompt.slice(1)}`;
      
      // Update state with generated content
      updateState({
        title: presentationTitle,
        slides: newSlides,
        generatedPrompt: prompt,
        currentStep: STEPS.PREVIEW
      });
    } catch (err) {
      console.error('Error generating presentation:', err);
      setError('Failed to generate presentation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper to generate content for each slide type
  const generateSlideContent = (type: SlideType, prompt: string, index: number): SlideContent => {
    switch (type) {
      case 'title':
        return {
          mainText: `A comprehensive presentation about ${prompt}`
        };
      case 'content':
        return {
          mainText: '',
          bullets: [
            `Key point about ${prompt} - item ${index}.1`,
            `Supporting detail for ${prompt} - item ${index}.2`,
            `Important consideration about ${prompt} - item ${index}.3`,
            `Notable aspect of ${prompt} - item ${index}.4`
          ]
        };
      case 'image':
        return {
          mainText: `Visual representation of ${prompt}`,
          imageDescription: `${prompt} visualization`,
          // In a real implementation, this would be generated with DALL-E
          generatedImageUrl: 'https://via.placeholder.com/800x450?text=AI+Generated+Image'
        };
      case 'chart':
        return {
          mainText: 'Data Analysis',
          chartData: {
            type: 'bar',
            labels: ['Category A', 'Category B', 'Category C', 'Category D'],
            datasets: [
              {
                label: 'Data Series 1',
                data: [12, 19, 8, 15],
                backgroundColor: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B']
              }
            ]
          }
        };
      case 'conclusion':
        return {
          mainText: '',
          bullets: [
            `Summary of key points about ${prompt}`,
            `Main takeaways from this presentation`,
            `Recommended next steps`,
            `Thank you for your attention! Questions?`
          ]
        };
      default:
        return { mainText: `Content for ${type} slide` };
    }
  };
  
  // Navigate to next step
  const handleNext = () => {
    updateState({ currentStep: state.currentStep + 1 });
  };
  
  // Navigate to previous step
  const handleBack = () => {
    updateState({ currentStep: state.currentStep - 1 });
  };
  
  // Mark challenge as complete
  const handleComplete = () => {
    // Mark challenge as complete in user progress
    const updatedProgress = { ...userProgress };
    if (!updatedProgress.completedChallenges.includes('challenge-7')) {
      updatedProgress.completedChallenges.push('challenge-7');
    }
    updatedProgress.lastActive = new Date().toISOString();
    setUserProgress(updatedProgress);
    
    // Save slide master data
    saveChallengeSlidemaster(
      'slidemaster',
      state.title,
      state.theme.name,
      state.slides.length,
      state.slides.filter(slide => slide.type === 'image').length
    );
    
    // Mark as complete in state
    updateState({ isComplete: true, currentStep: STEPS.EXPORT });
  };
  
  // Restart the challenge
  const handleRestart = () => {
    setState(createInitialState());
  };
  
  // Toggle theme selector
  const toggleThemeSelector = () => {
    updateState({ isShowingThemeSelector: !state.isShowingThemeSelector });
  };
  
  // Render current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case STEPS.PROMPT:
        return (
          <PromptEditor
            state={state}
            updateState={updateState}
            onContinue={() => {}}
            onBack={() => {}}
            onGenerate={generatePresentation}
            isGenerating={isGenerating}
          />
        );
        
      case STEPS.PREVIEW:
        return renderPreviewStep();
        
      case STEPS.EXPORT:
        return (
          <CompletionScreen
            state={state}
            onRestart={handleRestart}
          />
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };
  
  // Render preview step
  const renderPreviewStep = () => {
    return (
      <div className="flex flex-col h-screen">
        <div className="bg-gray-100 border-b border-gray-200 p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">{state.title}</h1>
          <div className="flex space-x-4">
            <button
              onClick={toggleThemeSelector}
              className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Change Theme
            </button>
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
            >
              Export Presentation
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-auto">
          <PresentationPreview
            state={state}
            updateState={updateState}
            onNext={handleComplete}
            onBack={() => updateState({ currentStep: STEPS.PROMPT })}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-screen bg-gray-50">
      {renderCurrentStep()}
      
      {/* Theme Selector Modal */}
      {state.isShowingThemeSelector && (
        <ThemeSelector
          state={state}
          updateState={updateState}
          onClose={toggleThemeSelector}
        />
      )}
      
      {/* Error message */}
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default SlidesMasterMain; 