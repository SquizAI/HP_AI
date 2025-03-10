import React, { useState } from 'react';
import BrandProfiling from './BrandProfiling';
import AudienceResearch from './AudienceResearch';
import PlatformSelection from './PlatformSelection';
import ContentPlanning from './ContentPlanning';
import CompletionScreen from './CompletionScreen';
import { saveChallengeSocialMedia } from '../../../utils/userDataManager';

// Interfaces for state management
export interface SocialMediaStrategy {
  brandName: string;
  industry: string;
  description: string;
  brandPersonality: string;
  brandPersonalityTraits: string[];
  goals: string[];
  targetAudience: string[];
  audienceInsights: AudienceInsight[];
  selectedPlatforms: string[];
  platformPriorities: {[key: string]: number};
  contentCalendar: ContentItem[];
  currentStep: number;
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

export interface ContentItem {
  platform: string;
  contentType: string;
  topic: string;
  timing: string;
  description: string;
}

// Initial state for the Social Media Strategy
const INITIAL_STATE: SocialMediaStrategy = {
  brandName: '',
  industry: '',
  description: '',
  brandPersonality: '',
  brandPersonalityTraits: [],
  goals: [],
  targetAudience: [],
  audienceInsights: [],
  selectedPlatforms: [],
  platformPriorities: {},
  contentCalendar: [],
  currentStep: 0,
  isComplete: false
};

// Step titles
const STEPS = [
  'Brand Profiling',
  'Audience Research',
  'Platform Selection',
  'Content Planning',
  'Strategy Complete'
];

// Fun facts about social media marketing
const SOCIAL_MEDIA_FACTS = [
  "92% of marketers say social media is important to their business",
  "Social media usage has increased by 13.2% since 2020",
  "The average person spends 2 hours and 27 minutes on social media daily",
  "LinkedIn generates 277% more leads than Facebook and Twitter",
  "Instagram users spend an average of 30 minutes per day on the platform",
  "90% of Instagram users follow at least one business account",
  "TikTok was the most downloaded app in 2020 with 850 million installations",
  "Pinterest drives 33% more traffic to shopping sites than Facebook"
];

const SocialMediaStrategistMain: React.FC = () => {
  const [strategy, setStrategy] = useState<SocialMediaStrategy>(INITIAL_STATE);
  const [randomFact, setRandomFact] = useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * SOCIAL_MEDIA_FACTS.length);
    return SOCIAL_MEDIA_FACTS[randomIndex];
  });
  
  // Update strategy state with new values
  const updateStrategy = (newValues: Partial<SocialMediaStrategy>) => {
    const updatedStrategy = { ...strategy, ...newValues };
    setStrategy(updatedStrategy);
    saveChallengeSocialMedia(updatedStrategy);
  };
  
  // Navigate to the next step
  const handleNext = () => {
    if (strategy.currentStep < STEPS.length - 1) {
      updateStrategy({ 
        currentStep: strategy.currentStep + 1 
      });
      
      // Show a new random fact
      const randomIndex = Math.floor(Math.random() * SOCIAL_MEDIA_FACTS.length);
      setRandomFact(SOCIAL_MEDIA_FACTS[randomIndex]);
    }
  };
  
  // Navigate to the previous step
  const handleBack = () => {
    if (strategy.currentStep > 0) {
      updateStrategy({ 
        currentStep: strategy.currentStep - 1 
      });
    }
  };
  
  // Restart the challenge
  const handleRestart = () => {
    setStrategy(INITIAL_STATE);
    
    // Show a new random fact
    const randomIndex = Math.floor(Math.random() * SOCIAL_MEDIA_FACTS.length);
    setRandomFact(SOCIAL_MEDIA_FACTS[randomIndex]);
  };
  
  // Render the current step component
  const renderCurrentStep = () => {
    switch (strategy.currentStep) {
      case 0:
        return (
          <BrandProfiling 
            state={strategy} 
            updateState={updateStrategy} 
            onNext={handleNext} 
          />
        );
      case 1:
        return (
          <AudienceResearch 
            state={strategy} 
            updateState={updateStrategy} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        );
      case 2:
        return (
          <PlatformSelection 
            state={strategy} 
            updateState={updateStrategy} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        );
      case 3:
        return (
          <ContentPlanning 
            state={strategy} 
            updateState={updateStrategy} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        );
      case 4:
        return (
          <CompletionScreen 
            state={strategy} 
            onRestart={handleRestart} 
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-2">
          AI Social Media Strategist
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create a comprehensive social media strategy tailored to your brand, audience, and business goals.
        </p>
      </div>
      
      {/* Progress bar - Don't show on the completion step */}
      {strategy.currentStep < STEPS.length - 1 && (
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex justify-between mb-2">
            {STEPS.slice(0, -1).map((step, index) => (
              <div 
                key={index} 
                className={`text-xs font-medium ${
                  index <= strategy.currentStep ? 'text-indigo-600' : 'text-gray-500'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${(strategy.currentStep / (STEPS.length - 2)) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Current step content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {renderCurrentStep()}
      </div>
      
      {/* Fun fact - only show on non-completion steps */}
      {strategy.currentStep < STEPS.length - 1 && (
        <div className="max-w-2xl mx-auto bg-indigo-50 p-4 rounded-lg text-center">
          <p className="text-indigo-800 text-sm font-medium">
            <span className="font-bold">Social Media Fact:</span> {randomFact}
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialMediaStrategistMain; 