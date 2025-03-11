import React, { useState, useEffect } from 'react';
import { useUserProgress } from '../../../utils/userDataManager';

// Define state interface
export interface ContentTransformerState {
  // Content metadata
  title: string;
  contentType: string;
  targetAudience: string;
  goalType: string;
  
  // Content data
  originalContent: string;
  transformedContent: string;
  contentBlocks: ContentBlock[];
  
  // Transformation settings
  transformationOptions: TransformationOptions;
  selectedTransformations: string[];
  
  // Progress tracking
  currentStep: number;
  isComplete: boolean;
  lastUpdated: string;
}

// Content block interface
export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'interactive' | 'quiz';
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    quizOptions?: string[];
    quizAnswer?: number;
  };
}

// Transformation options interface
export interface TransformationOptions {
  toneOptions: string[];
  formatOptions: string[];
  interactivityOptions: string[];
  visualOptions: string[];
}

// Step definitions
const STEPS = {
  SETUP: 0,
  CONTENT_INPUT: 1,
  TRANSFORMATION: 2,
  PREVIEW: 3,
  EXPORT: 4
};

// Sample transformation options
const defaultTransformationOptions: TransformationOptions = {
  toneOptions: [
    'Professional',
    'Conversational', 
    'Educational',
    'Persuasive',
    'Inspirational',
    'Technical',
    'Humorous'
  ],
  formatOptions: [
    'Article',
    'Tutorial',
    'Slide Deck',
    'Interactive Guide',
    'FAQ',
    'Checklist',
    'Story'
  ],
  interactivityOptions: [
    'Quizzes',
    'Interactive Elements',
    'Decision Points',
    'Expandable Sections',
    'Progress Tracking',
    'User Input Fields'
  ],
  visualOptions: [
    'Illustrations',
    'Infographics',
    'Charts and Graphs',
    'Icons',
    'Photographs',
    'Animations'
  ]
};

// Content tips
const CONTENT_TIPS = [
  "Break complex ideas into digestible sections to improve understanding",
  "Use visuals to complement your text and enhance engagement",
  "Add interactive elements like quizzes to increase retention",
  "Consider your audience's prior knowledge when presenting information",
  "Create a logical flow of ideas from introduction to conclusion",
  "Use examples and case studies to illustrate abstract concepts",
  "Incorporate white space and visual breaks to prevent information overload"
];

// Helper function to create initial state
const createInitialState = (): ContentTransformerState => {
  return {
    title: '',
    contentType: '',
    targetAudience: '',
    goalType: '',
    originalContent: '',
    transformedContent: '',
    contentBlocks: [],
    transformationOptions: defaultTransformationOptions,
    selectedTransformations: [],
    currentStep: STEPS.SETUP,
    isComplete: false,
    lastUpdated: new Date().toISOString()
  };
};

const ContentTransformerMain: React.FC = () => {
  // Get user progress
  const [userProgress, setUserProgress] = useUserProgress();
  
  // Component state
  const [state, setState] = useState<ContentTransformerState>(createInitialState());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTip, setCurrentTip] = useState<string>(CONTENT_TIPS[0]);
  
  // Load saved state from local storage on initial mount
  useEffect(() => {
    const savedState = localStorage.getItem('contentTransformerState');
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
    localStorage.setItem('contentTransformerState', JSON.stringify(state));
  }, [state]);
  
  // Update state
  const updateState = (newState: Partial<ContentTransformerState>) => {
    setState(prevState => ({
      ...prevState,
      ...newState,
      lastUpdated: new Date().toISOString()
    }));
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
    // In a real app, this would save completion data to the server
    const updatedProgress = { ...userProgress };
    if (!updatedProgress.completedChallenges.includes('challenge-14')) {
      updatedProgress.completedChallenges.push('challenge-14');
    }
    updatedProgress.lastActive = new Date().toISOString();
    setUserProgress(updatedProgress);
    
    updateState({ isComplete: true });
  };
  
  // Restart challenge
  const handleRestart = () => {
    setState(createInitialState());
  };
  
  // Get a new tip
  const getNewTip = () => {
    const currentIndex = CONTENT_TIPS.indexOf(currentTip);
    const nextIndex = (currentIndex + 1) % CONTENT_TIPS.length;
    setCurrentTip(CONTENT_TIPS[nextIndex]);
  };
  
  // Transform content with AI
  const transformContent = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // In a real app, this would make an API call to an AI service
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create sample content blocks based on original content
      const contentSample = state.originalContent.trim();
      if (!contentSample) {
        throw new Error("Please provide some content to transform");
      }
      
      // Generate paragraphs from content
      const paragraphs = contentSample.split('\n\n').filter(p => p.trim());
      
      // Create content blocks
      const contentBlocks: ContentBlock[] = paragraphs.map((paragraph, index) => {
        // Every third block, create something other than text
        if (index % 3 === 1 && state.selectedTransformations.includes('Illustrations')) {
          return {
            id: `block-${Date.now()}-${index}`,
            type: 'image',
            content: paragraph,
            metadata: {
              title: `Visual ${index + 1}`,
              description: paragraph.substring(0, 100) + (paragraph.length > 100 ? '...' : ''),
              imageUrl: 'https://via.placeholder.com/600x400?text=AI+Generated+Image'
            }
          };
        } else if (index % 4 === 2 && state.selectedTransformations.includes('Quizzes')) {
          return {
            id: `block-${Date.now()}-${index}`,
            type: 'quiz',
            content: paragraph,
            metadata: {
              title: `Quick Check ${index + 1}`,
              description: 'Test your understanding',
              quizOptions: [
                'Option A: First possible answer',
                'Option B: Second possible answer',
                'Option C: Third possible answer',
                'Option D: Fourth possible answer'
              ],
              quizAnswer: 2 // C is correct (0-indexed)
            }
          };
        } else {
          return {
            id: `block-${Date.now()}-${index}`,
            type: 'text',
            content: paragraph
          };
        }
      });
      
      // Update state with transformed content
      updateState({ 
        contentBlocks,
        transformedContent: contentSample
      });
    } catch (err) {
      console.error('Error transforming content:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Get step label
  const getStepLabel = (step: number): string => {
    switch (step) {
      case STEPS.SETUP:
        return 'Setup';
      case STEPS.CONTENT_INPUT:
        return 'Content Input';
      case STEPS.TRANSFORMATION:
        return 'Transformation';
      case STEPS.PREVIEW:
        return 'Preview';
      case STEPS.EXPORT:
        return 'Export';
      default:
        return `Step ${step + 1}`;
    }
  };
  
  // Render current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case STEPS.SETUP:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Content Transformer Setup</h2>
            <p className="mb-6 text-gray-600">
              Let's set up your content transformation project. Fill in the details below to get started.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
              <input
                type="text"
                value={state.title}
                onChange={(e) => updateState({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a title for your content transformation project"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
              <select
                value={state.contentType}
                onChange={(e) => updateState({ contentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select content type</option>
                <option value="article">Article</option>
                <option value="blog">Blog Post</option>
                <option value="documentation">Documentation</option>
                <option value="educational">Educational Content</option>
                <option value="marketing">Marketing Material</option>
                <option value="technical">Technical Content</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                value={state.targetAudience}
                onChange={(e) => updateState({ targetAudience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select target audience</option>
                <option value="general">General Audience</option>
                <option value="technical">Technical Professionals</option>
                <option value="executives">Business Executives</option>
                <option value="beginners">Beginners/Novices</option>
                <option value="students">Students</option>
                <option value="developers">Developers</option>
                <option value="marketers">Marketers</option>
              </select>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">Transformation Goal</label>
              <select
                value={state.goalType}
                onChange={(e) => updateState({ goalType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select transformation goal</option>
                <option value="educate">Educate and Inform</option>
                <option value="engage">Increase Engagement</option>
                <option value="simplify">Simplify Complex Information</option>
                <option value="persuade">Persuade and Convert</option>
                <option value="entertain">Entertain and Delight</option>
                <option value="instruct">Provide Step-by-Step Instruction</option>
              </select>
            </div>
            
            <div className="flex justify-between">
              <div></div>
              <button
                onClick={handleNext}
                disabled={!state.title || !state.contentType || !state.targetAudience || !state.goalType}
                className={`px-6 py-2 rounded-md ${
                  state.title && state.contentType && state.targetAudience && state.goalType
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Content Input
              </button>
            </div>
          </div>
        );
        
      case STEPS.CONTENT_INPUT:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Enter Your Content</h2>
            <p className="mb-6 text-gray-600">
              Paste or write the content you want to transform. This can be an article, blog post, documentation, or any text content.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Content</label>
              <textarea
                value={state.originalContent}
                onChange={(e) => updateState({ originalContent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste or write your content here..."
                rows={12}
              />
            </div>
            
            <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Content Tip</h3>
                  <p className="mt-1 text-sm text-blue-600">{currentTip}</p>
                  <button 
                    onClick={getNewTip}
                    className="mt-2 text-xs text-blue-700 hover:text-blue-900 underline"
                  >
                    Show another tip
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!state.originalContent.trim()}
                className={`px-6 py-2 rounded-md ${
                  state.originalContent.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Transformation
              </button>
            </div>
          </div>
        );
        
      case STEPS.TRANSFORMATION:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Choose Transformation Options</h2>
            <p className="mb-6 text-gray-600">
              Select how you want to transform your content to achieve your goal of "{state.goalType}" for your "{state.targetAudience}" audience.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-medium mb-3">Tone Options</h3>
                <div className="space-y-2">
                  {state.transformationOptions.toneOptions.map(option => (
                    <label key={`tone-${option}`} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={state.selectedTransformations.includes(option)}
                        onChange={() => {
                          const newSelected = state.selectedTransformations.includes(option)
                            ? state.selectedTransformations.filter(item => item !== option)
                            : [...state.selectedTransformations, option];
                          updateState({ selectedTransformations: newSelected });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Format Options</h3>
                <div className="space-y-2">
                  {state.transformationOptions.formatOptions.map(option => (
                    <label key={`format-${option}`} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={state.selectedTransformations.includes(option)}
                        onChange={() => {
                          const newSelected = state.selectedTransformations.includes(option)
                            ? state.selectedTransformations.filter(item => item !== option)
                            : [...state.selectedTransformations, option];
                          updateState({ selectedTransformations: newSelected });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Interactivity Options</h3>
                <div className="space-y-2">
                  {state.transformationOptions.interactivityOptions.map(option => (
                    <label key={`interactive-${option}`} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={state.selectedTransformations.includes(option)}
                        onChange={() => {
                          const newSelected = state.selectedTransformations.includes(option)
                            ? state.selectedTransformations.filter(item => item !== option)
                            : [...state.selectedTransformations, option];
                          updateState({ selectedTransformations: newSelected });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Visual Options</h3>
                <div className="space-y-2">
                  {state.transformationOptions.visualOptions.map(option => (
                    <label key={`visual-${option}`} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={state.selectedTransformations.includes(option)}
                        onChange={() => {
                          const newSelected = state.selectedTransformations.includes(option)
                            ? state.selectedTransformations.filter(item => item !== option)
                            : [...state.selectedTransformations, option];
                          updateState({ selectedTransformations: newSelected });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <button
                onClick={transformContent}
                disabled={isGenerating || state.selectedTransformations.length === 0}
                className={`w-full py-3 px-4 rounded-md font-medium ${
                  isGenerating || state.selectedTransformations.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Transforming Your Content...
                  </span>
                ) : (
                  'Transform My Content'
                )}
              </button>
              
              {error && (
                <div className="mt-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={state.contentBlocks.length === 0}
                className={`px-6 py-2 rounded-md ${
                  state.contentBlocks.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Preview Transformed Content
              </button>
            </div>
          </div>
        );
        
      case STEPS.PREVIEW:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Preview Transformed Content</h2>
            <p className="mb-6 text-gray-600">
              Review your transformed content below. You can go back to make changes if needed.
            </p>
            
            <div className="mb-8 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-800">{state.title}</h3>
                <p className="text-sm text-gray-500">
                  {state.contentType} for {state.targetAudience} audience
                </p>
              </div>
              
              <div className="p-6">
                {state.contentBlocks.length > 0 ? (
                  <div className="space-y-6">
                    {state.contentBlocks.map((block) => (
                      <div key={block.id} className="border rounded-lg overflow-hidden">
                        {block.type === 'text' && (
                          <div className="p-4">
                            <p className="text-gray-800">{block.content}</p>
                          </div>
                        )}
                        
                        {block.type === 'image' && (
                          <div>
                            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
                              <h4 className="text-sm font-medium text-gray-700">{block.metadata?.title || 'Image'}</h4>
                            </div>
                            <div className="p-4">
                              <img 
                                src={block.metadata?.imageUrl || 'https://via.placeholder.com/600x400?text=Image'} 
                                alt={block.metadata?.description || 'Content image'} 
                                className="w-full h-auto rounded-md mb-2"
                              />
                              {block.metadata?.description && (
                                <p className="text-sm text-gray-500 italic">{block.metadata.description}</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {block.type === 'quiz' && (
                          <div>
                            <div className="bg-indigo-50 border-b border-indigo-100 px-3 py-2">
                              <h4 className="text-sm font-medium text-indigo-700">{block.metadata?.title || 'Quick Quiz'}</h4>
                            </div>
                            <div className="p-4">
                              <p className="text-gray-800 mb-3">{block.content}</p>
                              <div className="space-y-2">
                                {block.metadata?.quizOptions?.map((option, index) => (
                                  <label key={`option-${index}`} className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`quiz-${block.id}`}
                                      value={index}
                                      className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No content blocks available. Go back to transform your content.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continue to Export
              </button>
            </div>
          </div>
        );
        
      case STEPS.EXPORT:
        return (
          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-lg shadow-lg text-center mb-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-xl">
                You've successfully transformed your content
              </p>
              <div className="text-3xl font-bold mt-4 mb-6">
                "{state.title}"
              </div>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Your content is now ready to engage your audience with a more interactive and visually appealing experience.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Transformation Summary</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{state.contentBlocks.length}</div>
                  <div className="text-sm text-gray-600">Content Blocks</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {state.contentBlocks.filter(block => block.type === 'image').length}
                  </div>
                  <div className="text-sm text-gray-600">Visual Elements</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {state.contentBlocks.filter(block => block.type === 'quiz').length}
                  </div>
                  <div className="text-sm text-gray-600">Interactive Elements</div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">{state.selectedTransformations.length}</div>
                  <div className="text-sm text-gray-600">Transformations Applied</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => {
                  // In a real app, this would download a file
                  alert('Content exported as HTML (this would download a file in a real app)');
                }}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export as HTML
              </button>
              
              <button
                onClick={() => {
                  // In a real app, this would share the content
                  alert('Content shared (this would open sharing options in a real app)');
                }}
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Content
              </button>
              
              <button
                onClick={handleComplete}
                className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete Challenge
              </button>
            </div>
            
            <div className="text-center">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg font-medium transition inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Start a New Transformation
              </button>
            </div>
          </div>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };
  
  // Progress step indicators
  const renderProgressSteps = () => {
    const steps = Object.values(STEPS);
    
    return (
      <div className="mb-8">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              {/* Step circle */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  state.currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {state.currentStep > step ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <span>{step + 1}</span>
                )}
              </div>
              
              {/* Step label */}
              <div className="hidden sm:block ml-2 mr-8 text-sm">
                <div className={state.currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                  {getStepLabel(step)}
                </div>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`flex-grow h-1 ${state.currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">AI Content Transformer</h1>
      <p className="text-center text-gray-600 mb-8">
        Transform your plain content into engaging, interactive experiences
      </p>
      
      {renderProgressSteps()}
      {renderCurrentStep()}
    </div>
  );
};

export default ContentTransformerMain; 