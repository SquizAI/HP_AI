import React, { useState } from 'react';
import MediaUpload from './components/MediaUpload';
import EmotionAnalysisComponent from './components/EmotionAnalysis';
import Reflection from './components/Reflection';
import BusinessApplication from './components/BusinessApplication';

// Define steps for the challenge
enum STEPS {
  UPLOAD = 0,
  ANALYSIS = 1,
  REFLECTION = 2,
  APPLICATION = 3
}

// Define emotion types
type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral' | 'contempt';

// Define emotion analysis result
interface EmotionAnalysis {
  primaryEmotion: EmotionType;
  confidence: number;
  secondaryEmotions: Array<{
    emotion: EmotionType;
    confidence: number;
  }>;
  timestamp: string;
}

// Define application state
interface EmotionalInsightState {
  currentStep: STEPS;
  mediaSource: {
    type: 'video' | 'audio' | 'text' | null;
    url: string | null;
    content: string | null;
  };
  analysis: EmotionAnalysis | null;
  userReflection: {
    accuracy: 'high' | 'medium' | 'low' | null;
    reasons: string;
    businessApplication: string;
  };
  isLoading: boolean;
  error: string | null;
  apiKey: string;
}

// Initial state
const createInitialState = (): EmotionalInsightState => {
  return {
    currentStep: STEPS.UPLOAD,
    mediaSource: {
      type: null,
      url: null,
      content: null
    },
    analysis: null,
    userReflection: {
      accuracy: null,
      reasons: '',
      businessApplication: ''
    },
    isLoading: false,
    error: null,
    apiKey: 'YrjbSaArbGC5t8B2jizNGa5GZoDbqAQmvS2GSw8dvtjjBHG3' // Default API key
  };
};

const EmotionalInsightMain: React.FC = () => {
  const [state, setState] = useState<EmotionalInsightState>(createInitialState());
  
  // Update state helper function
  const updateState = (newState: Partial<EmotionalInsightState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };
  
  // Navigation helpers
  const goToNextStep = () => {
    if (state.currentStep < STEPS.APPLICATION) {
      updateState({ currentStep: state.currentStep + 1 });
    }
  };
  
  const goToPreviousStep = () => {
    if (state.currentStep > STEPS.UPLOAD) {
      updateState({ currentStep: state.currentStep - 1 });
    }
  };
  
  const goToStep = (step: STEPS) => {
    updateState({ currentStep: step });
  };
  
  // Handle media upload/input
  const handleMediaUpload = (type: 'video' | 'audio' | 'text', url: string | null, content: string | null) => {
    updateState({
      mediaSource: {
        type,
        url,
        content
      }
    });
    
    if (type && (url || content)) {
      analyzeEmotion(type, url, content);
    }
  };
  
  // Handle API key update
  const handleApiKeyUpdate = (apiKey: string) => {
    updateState({ apiKey });
  };
  
  // Handle emotional analysis
  const analyzeEmotion = async (type: 'video' | 'audio' | 'text', url: string | null, content: string | null) => {
    updateState({ isLoading: true, error: null });
    
    try {
      // In a real implementation, we would call the Hume AI API here
      // For now, we'll simulate a response with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response
      const mockAnalysis: EmotionAnalysis = {
        primaryEmotion: 'joy',
        confidence: 85,
        secondaryEmotions: [
          { emotion: 'surprise', confidence: 40 },
          { emotion: 'neutral', confidence: 25 }
        ],
        timestamp: new Date().toISOString()
      };
      
      updateState({ 
        analysis: mockAnalysis,
        isLoading: false
      });
      
      // Move to analysis step
      goToNextStep();
    } catch (error) {
      updateState({ 
        error: `Failed to analyze emotions: ${error instanceof Error ? error.message : String(error)}`,
        isLoading: false
      });
    }
  };
  
  // Handle reflection submission
  const handleReflectionSubmit = (accuracy: 'high' | 'medium' | 'low', reasons: string, businessApplication: string) => {
    updateState({
      userReflection: {
        accuracy,
        reasons,
        businessApplication
      }
    });
    
    goToNextStep();
  };
  
  // Handle restart
  const handleRestart = () => {
    setState(createInitialState());
  };
  
  // Render the current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case STEPS.UPLOAD:
        return (
          <MediaUpload
            onUpload={handleMediaUpload}
            onApiKeyUpdate={handleApiKeyUpdate}
            apiKey={state.apiKey}
            isLoading={state.isLoading}
          />
        );
      
      case STEPS.ANALYSIS:
        if (!state.analysis || !state.mediaSource.type) {
          return <div>Missing analysis data</div>;
        }
        
        return (
          <EmotionAnalysisComponent
            analysis={state.analysis}
            mediaType={state.mediaSource.type}
            mediaUrl={state.mediaSource.url}
            mediaContent={state.mediaSource.content}
            onContinue={goToNextStep}
            onReanalyze={() => goToStep(STEPS.UPLOAD)}
          />
        );
      
      case STEPS.REFLECTION:
        if (!state.analysis) {
          return <div>Missing analysis data</div>;
        }
        
        return (
          <Reflection
            analysis={state.analysis}
            onSubmit={handleReflectionSubmit}
            onBack={goToPreviousStep}
          />
        );
      
      case STEPS.APPLICATION:
        if (!state.analysis || !state.userReflection.accuracy) {
          return <div>Missing analysis or reflection data</div>;
        }
        
        return (
          <BusinessApplication
            analysis={state.analysis}
            userReflection={state.userReflection}
            onRestart={handleRestart}
            onBack={goToPreviousStep}
          />
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };
  
  // Render progress steps
  const renderProgressSteps = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {Object.values(STEPS).filter(step => typeof step === 'number').map((step: number) => (
          <React.Fragment key={step}>
            {/* Step button */}
            <button
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${state.currentStep === step
                  ? 'bg-blue-600 text-white'
                  : state.currentStep > step
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-200 text-gray-600'
                }
                ${state.currentStep > step ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
              onClick={() => {
                if (state.currentStep > step) {
                  goToStep(step as STEPS);
                }
              }}
              disabled={state.currentStep <= step}
            >
              {step + 1}
            </button>
            
            {/* Step label */}
            <div className="hidden sm:block ml-2 mr-8 text-sm">
              <div className={state.currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                {Object.keys(STEPS).find(key => STEPS[key as keyof typeof STEPS] === step)?.split('_').join(' ')}
              </div>
            </div>
            
            {/* Connector line */}
            {step < STEPS.APPLICATION && (
              <div className={`flex-grow h-1 mx-2 ${state.currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  // Main render
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
        AI Emotional Insight Challenge
      </h1>
      <p className="text-center text-gray-600 mb-10">
        Analyze emotions in media to understand how AI can enhance customer experiences and team well-being
      </p>
      
      {/* Progress steps */}
      {renderProgressSteps()}
      
      {/* Error message */}
      {state.error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{state.error}</p>
        </div>
      )}
      
      {/* Current step content */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default EmotionalInsightMain; 