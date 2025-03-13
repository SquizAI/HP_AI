import React, { useState, useEffect } from 'react';
import BrandProfiling from './BrandProfiling';
import AudienceResearch from './AudienceResearch';
import PlatformSelection from './PlatformSelection';
import ContentPlanning from './ContentPlanning';
import CompletionScreen from './CompletionScreen';
import { saveChallengeSocialMedia, useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import ChallengeHeader from '../../shared/ChallengeHeader';
import { Share2 } from 'lucide-react';

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
  
  // Add state for challenge completion and confetti
  const [userProgress, setUserProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress.completedChallenges.includes('challenge-4')
  );
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Check if challenge is already completed on mount
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-4')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
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
  
  // Handle completing the challenge
  const handleCompleteChallenge = () => {
    // Make sure we have enough content to complete
    if (!strategy.brandName || strategy.contentCalendar.length < 2) {
      alert('Please complete your brand profile and add at least 2 content items to your calendar before completing the challenge.');
      return;
    }
    
    markChallengeAsCompleted('challenge-4');
    setIsCompleted(true);
    
    // Set strategy as complete and update in state
    updateStrategy({ isComplete: true });
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
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
    <div className="max-w-6xl mx-auto p-4">
      <ChallengeHeader
        title="Social Media Strategist Challenge"
        icon={<Share2 className="h-6 w-6 text-purple-600" />}
        challengeId="challenge-4"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
      />
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default SocialMediaStrategistMain; 