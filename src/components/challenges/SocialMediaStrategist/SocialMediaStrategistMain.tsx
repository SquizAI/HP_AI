import React, { useState, useEffect } from 'react';

// Interfaces for state management
export interface SocialMediaStrategy {
  brandName: string;
  industry: string;
  targetAudience: string[];
  platforms: PlatformStrategy[];
  contentCalendar: ContentCalendarItem[];
  kpis: string[];
  audienceInsights: AudienceInsight[];
  isComplete: boolean;
}

export interface PlatformStrategy {
  platform: string;
  audience: string;
  contentTypes: string[];
  postFrequency: string;
  bestTimes: string[];
  goals: string[];
}

export interface ContentCalendarItem {
  id: string;
  title: string;
  description: string;
  platform: string;
  contentType: string;
  scheduledDate?: string;
  status: 'draft' | 'scheduled' | 'published';
  hashtags: string[];
  mediaType: 'image' | 'video' | 'carousel' | 'text' | 'link';
}

export interface AudienceInsight {
  segment: string;
  demographics: string;
  interests: string[];
  painPoints: string[];
  platforms: string[];
}

// Initial state
const INITIAL_STATE: SocialMediaStrategy = {
  brandName: '',
  industry: '',
  targetAudience: [],
  platforms: [],
  contentCalendar: [],
  kpis: [],
  audienceInsights: [],
  isComplete: false
};

// Challenge steps
enum STEPS {
  BRAND_PROFILING = 0,
  AUDIENCE_RESEARCH = 1,
  PLATFORM_SELECTION = 2,
  CONTENT_PLANNING = 3,
  STRATEGY_REVIEW = 4,
  COMPLETION = 5
}

// Social media facts to display during the challenge
const SOCIAL_MEDIA_FACTS = [
  "Over 4.9 billion people worldwide use social media in 2024, representing 60% of the global population.",
  "Users spend an average of 2 hours and 24 minutes per day on social media platforms.",
  "Instagram posts with at least one hashtag gain 12.6% more engagement than those without.",
  "Video content generates 1200% more shares than text and image content combined.",
  "The best time to post on LinkedIn is Tuesday through Thursday between 9 AM and noon.",
  "83% of consumers are more likely to purchase from brands they follow on social media.",
  "User-generated content has 4.5% higher conversion rates than non-UGC.",
  "Social media is the most relevant advertising channel for 50% of Gen Z.",
  "Pinterest users have 85% higher average order values than users from other social networks.",
  "Brands that post interactive content see 28% higher engagement rates.",
  "47% of social media marketers say developing strategies that align with business goals is their biggest challenge.",
  "75% of B2B businesses use social media as part of their marketing strategy.",
  "TikTok is the fastest growing social media platform, with a 45% increase in active users in 2023.",
  "Companies that use social selling see 45% more sales opportunities.",
  "93% of Twitter users who follow small-to-medium businesses plan to purchase from them."
];

const SocialMediaStrategistMain: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.BRAND_PROFILING);
  const [state, setState] = useState<SocialMediaStrategy>(INITIAL_STATE);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [funFact, setFunFact] = useState<string>('');
  
  // Load a random social media fact when the component mounts
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SOCIAL_MEDIA_FACTS.length);
    setFunFact(SOCIAL_MEDIA_FACTS[randomIndex]);
  }, []);
  
  // Update state and save
  const updateState = (newState: Partial<SocialMediaStrategy>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      // Save to localStorage
      saveChallengeSocialMedia(
        'challenge-12',
        updatedState
      );
      return updatedState;
    });
  };
  
  // Temporary function until we update userDataManager.ts
  const saveChallengeSocialMedia = (
    challengeId: string,
    data: SocialMediaStrategy
  ): void => {
    try {
      const userProgress = JSON.parse(localStorage.getItem('ai_hub_user_progress') || '{"completedChallenges":[],"challengeData":{},"lastActive":""}');
      
      if (!userProgress.challengeData[challengeId]) {
        userProgress.challengeData[challengeId] = {};
      }
      
      userProgress.challengeData[challengeId].socialMedia = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // If the challenge is complete, add it to completed challenges
      if (data.isComplete && !userProgress.completedChallenges.includes(challengeId)) {
        userProgress.completedChallenges.push(challengeId);
      }
      
      userProgress.lastActive = new Date().toISOString();
      localStorage.setItem('ai_hub_user_progress', JSON.stringify(userProgress));
    } catch (error) {
      console.error('Error saving social media challenge data:', error);
    }
  };
  
  // Navigate to next step
  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= STEPS.COMPLETION) {
      setCurrentStep(nextStep as STEPS);
      
      // If moving to completion, mark challenge as complete
      if (nextStep === STEPS.COMPLETION) {
        updateState({ isComplete: true });
      }
      
      // Show a new fun fact when moving to the next step
      const randomIndex = Math.floor(Math.random() * SOCIAL_MEDIA_FACTS.length);
      setFunFact(SOCIAL_MEDIA_FACTS[randomIndex]);
      
      // Scroll to top
      window.scrollTo(0, 0);
    }
  };
  
  // Navigate to previous step
  const handleBack = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= STEPS.BRAND_PROFILING) {
      setCurrentStep(prevStep as STEPS);
      window.scrollTo(0, 0);
    }
  };
  
  // Restart the challenge
  const handleRestart = () => {
    setState(INITIAL_STATE);
    setCurrentStep(STEPS.BRAND_PROFILING);
    const randomIndex = Math.floor(Math.random() * SOCIAL_MEDIA_FACTS.length);
    setFunFact(SOCIAL_MEDIA_FACTS[randomIndex]);
    window.scrollTo(0, 0);
  };
  
  // Get step label based on current step
  const getStepLabel = (step: STEPS): string => {
    switch (step) {
      case STEPS.BRAND_PROFILING: return 'Brand Profiling';
      case STEPS.AUDIENCE_RESEARCH: return 'Audience Research';
      case STEPS.PLATFORM_SELECTION: return 'Platform Selection';
      case STEPS.CONTENT_PLANNING: return 'Content Planning';
      case STEPS.STRATEGY_REVIEW: return 'Strategy Review';
      case STEPS.COMPLETION: return 'Strategy Complete';
    }
  };
  
  return (
    <div className="container mx-auto max-w-5xl">
      {/* Progress steps */}
      {currentStep < STEPS.COMPLETION && (
        <div className="px-6 py-4">
          <div className="mb-2 flex justify-between text-sm text-gray-500">
            <span>Start</span>
            <span>Complete</span>
          </div>
          <div className="flex mb-6">
            {Object.values(STEPS).filter(step => typeof step === 'number' && step < STEPS.COMPLETION).map((step) => (
              <div key={step} className="flex-1 relative">
                <div 
                  className={`h-2 ${
                    Number(step) < currentStep 
                      ? 'bg-blue-500' 
                      : Number(step) === currentStep 
                        ? 'bg-blue-300' 
                        : 'bg-gray-200'
                  }`}
                />
                <div 
                  className={`w-6 h-6 rounded-full absolute top-[-8px] ${
                    Number(step) <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  } flex items-center justify-center text-xs font-medium`}
                  style={{ left: step === 0 ? 0 : '50%', transform: step === 0 ? 'none' : 'translateX(-50%)' }}
                >
                  {Number(step) + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-gray-800">{getStepLabel(currentStep)}</h2>
            <p className="text-sm text-gray-500">Step {currentStep + 1} of {STEPS.COMPLETION}</p>
          </div>
        </div>
      )}
      
      {/* Fun fact box */}
      {currentStep < STEPS.COMPLETION && (
        <div className="px-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="text-blue-500 text-xl mr-3">💡</div>
              <div>
                <h3 className="font-medium text-blue-800 mb-1">Social Media Fact</h3>
                <p className="text-blue-700 text-sm">{funFact}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Step content */}
      <div className="px-6">
        {/* This is where each step component will be rendered */}
        {/* We'll create these components in separate files */}
        <div className="bg-gray-100 p-8 rounded-lg text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Social Media Strategist Challenge
          </h2>
          <p className="text-gray-600">
            Build a comprehensive social media strategy with the help of AI.
            <br />
            This challenge is currently being built. Check back soon!
          </p>
        </div>
        
        {/* Temporary navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            onClick={handleBack}
            disabled={currentStep === STEPS.BRAND_PROFILING}
          >
            Back
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={handleNext}
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStrategistMain; 