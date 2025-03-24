import React, { useState, useEffect } from 'react';
import BrandProfiling from './BrandProfiling';
import AudienceResearch from './AudienceResearch';
import PlatformSelection from './PlatformSelection';
import { saveChallengeSocialMedia, useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import ChallengeHeader from '../../shared/ChallengeHeader';
import { Share2, Brain } from 'lucide-react';
import Confetti from '../../shared/Confetti';

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
  // Initialize with a random fact but store it directly in the handleNext/handleRestart functions
  useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * SOCIAL_MEDIA_FACTS.length);
    return SOCIAL_MEDIA_FACTS[randomIndex];
  });
  
  // Add state for challenge completion and confetti
  const [userProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress.completedChallenges.includes('challenge-12')
  );
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Check if challenge is already completed on mount
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-12')) {
      setIsCompleted(true);
    }
    
    // Add keyframe animation for button glow effect
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-shadow-purple {
        0%, 100% { box-shadow: 0 0 0 0 rgba(126, 34, 206, 0.4); }
        50% { box-shadow: 0 0 0 15px rgba(126, 34, 206, 0); }
      }
      
      @keyframes gentle-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [userProgress]);
  
  // Update strategy state with new values
  const updateStrategy = (newValues: Partial<SocialMediaStrategy>) => {
    const updatedStrategy = { ...strategy, ...newValues };
    setStrategy(updatedStrategy);
    saveChallengeSocialMedia(updatedStrategy);
  };
  
  // Navigate to the next step
  const handleNext = () => {
    // Simplified to only go up to step 3 (which is now the completion screen)
    if (strategy.currentStep < 3) {
      updateStrategy({ 
        currentStep: strategy.currentStep + 1 
      });
      
      // We no longer need to update random facts since they're not being displayed
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
    setIsCompleted(false);
    
    // We no longer need to update random facts since they're not being displayed
  };
  
  // Handle completing the challenge - simplified to complete after platform selection
  const handleCompleteChallenge = () => {
    // Make sure brand name is filled out and at least one platform is selected
    if (!strategy.brandName || strategy.selectedPlatforms.length < 1) {
      alert('Please complete your brand profile and select at least one social media platform before completing the challenge.');
      return;
    }
    
    // Mark challenge as completed
    markChallengeAsCompleted('challenge-12');
    setIsCompleted(true);
    
    // Set strategy as complete and update in state
    updateStrategy({ 
      isComplete: true,
      currentStep: 3  // Keep the user on the platform selection step
    });
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    // Show completion confirmation
    alert('Challenge Completed! You have successfully created an AI-powered social media strategy.');
  };
  

  
  // Render the current step component - simplified steps
  const renderCurrentStep = () => {
    switch (strategy.currentStep) {
      case 0:
        return (
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Brand Profile</h2>
            <BrandProfiling 
              state={strategy} 
              updateState={updateStrategy} 
              onNext={handleNext} 
            />
          </div>
        );
      case 1:
        return (
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Target Audience</h2>
            <AudienceResearch 
              state={strategy} 
              updateState={updateStrategy} 
              onNext={handleNext} 
              onBack={handleBack} 
            />
          </div>
        );
      case 2:
        return (
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Analysis</h2>
            <div className="mb-6">
              <p className="text-gray-700">AI will analyze your brand profile and target audience to recommend the most effective platforms for your campaign.</p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleBack}
                className="px-5 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                View Recommendations
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Selection</h2>
            <div className="mb-4">
              <p className="text-gray-700">Select the platforms for your social media campaign based on AI recommendations.</p>
            </div>
            <PlatformSelection 
              state={strategy} 
              updateState={updateStrategy} 
              onNext={handleCompleteChallenge} 
              onBack={handleBack} 
            />
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Show confetti animation when challenge is completed */}
      {showConfetti && <Confetti active={showConfetti} />}
      
      <ChallengeHeader
        title="AI-Powered Social Campaign Builder: Crafting a Winning Strategy"
        icon={<Share2 className="h-6 w-6 text-purple-600" />}
        challengeId="challenge-12"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
      />
      
      <div className="flex mb-10">
        <div className="w-3/4 pr-8">
          {/* How AI Works for You section - enhanced styling */}
          <div className="mb-6 bg-gradient-to-r from-white to-purple-50 p-8 rounded-xl shadow-md border border-purple-100">
            <h3 className="text-lg font-semibold mb-3 text-purple-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              How AI Works for You:
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed pl-3 border-l-2 border-purple-200">
              A successful social media campaign starts with a strong brand identity and data-driven strategy. In this multi-step challenge, you'll use AI to define your brand, analyze your audience, and generate content ideas—ensuring your messaging is clear, consistent, and impactful.
            </p>
            <p className="text-gray-700 mb-3 leading-relaxed pl-3 border-l-2 border-purple-200">
              Step by step, AI will help you refine your brand voice, choose the right platforms, and create engaging content, just like top marketing teams do. Get ready to build a smart, AI-driven social campaign that connects with your audience!
            </p>
            
            <h3 className="text-lg font-semibold mb-3 mt-6 text-purple-700">Challenge Steps Quick View:</h3>
            <p className="text-gray-700 mb-3">There are 5 steps required to complete the Challenge.</p>
            <ul className="space-y-2 pl-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <span>Step 1: Define your Brand Basics, choose your Brand Personality, and set your Social Media Goals. Then continue to Audience Research as AI begins putting your plan together.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <span>Step 2: Select your Target Audience and click Get AI Audience Analysis to review the audience details.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <span>Step 3: Click Continue Platform Selection to see what AI recommends.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <span>Step 4: Review the AI-recommended platforms based on your brand input. Select the Social Media Platforms you want to include in your campaign.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <span>Step 5: Challenge Completed! Click Complete & Return!</span>
              </li>
            </ul>
          </div>
          
          {/* Challenge progress - only shown when in progress */}
          {strategy.currentStep > 0 && (
            <div className="mb-6 flex bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step} 
                  className={`flex-1 p-3 ${strategy.currentStep >= step - 1 ? 'bg-purple-50' : 'bg-gray-50'} 
                  ${strategy.currentStep === step - 1 ? 'border-b-2 border-purple-600' : ''}`}
                >
                  <div className="flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 
                      ${strategy.currentStep >= step - 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {step}
                    </div>
                    <span className={`text-sm ${strategy.currentStep >= step - 1 ? 'text-gray-800' : 'text-gray-500'}`}>
                      {step === 1 ? 'Brand Profile' : 
                       step === 2 ? 'Audience' : 
                       step === 3 ? 'AI Analysis' : 'Platform Selection'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Completed challenge panel */}
        {isCompleted && (
          <div className="w-1/4 bg-green-50 p-6 rounded-lg shadow-sm border border-green-100 self-start">
            <h3 className="text-lg font-semibold mb-2 text-green-800">Challenge Complete!</h3>
            <p className="text-sm text-gray-700 mb-4">You've successfully created a social media strategy.</p>
            <button
              onClick={handleRestart}
              className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
      
      {/* Confetti for challenge completion */}
      {showConfetti && <Confetti active={showConfetti} />}
      
      {/* For the Nerds Section */}
      <details className="mt-8 bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <summary className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 cursor-pointer flex items-center">
          <Brain className="h-5 w-5 text-purple-600 mr-2" />
          <span className="font-medium text-gray-900">For the Nerds: Technical Details</span>
        </summary>
        <div className="p-6 bg-white">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Social Media Campaign Builder Architecture</h3>
            
            <div>
              <h4 className="font-medium text-gray-800">Technical Implementation</h4>
              <p className="text-gray-700 mt-1">
                This challenge implements a multi-step social media campaign builder using React and TypeScript. The application follows a wizard-like interface pattern with state management for campaign configuration data across multiple steps.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800">AI Integration</h4>
              <p className="text-gray-700 mt-1">
                The system uses natural language processing techniques to analyze brand profiles and audience segments. It employs a recommendation engine that matches brand attributes and audience characteristics with optimal social media platforms using a weighted scoring algorithm.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800">Data Processing</h4>
              <p className="text-gray-700 mt-1">
                The application processes user input through a series of transformations that extract key attributes and map them to predefined platform characteristics. This includes sentiment analysis of brand descriptions, demographic segmentation of audience profiles, and content type classification.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800">State Management</h4>
              <p className="text-gray-700 mt-1">
                Campaign data is managed through a centralized state object that persists across navigation steps. The application implements a custom hook pattern for state updates with validation rules to ensure data integrity throughout the campaign creation process.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800">UI/UX Design Patterns</h4>
              <p className="text-gray-700 mt-1">
                The interface uses progressive disclosure techniques to manage complexity, revealing only the information relevant to each step. Micro-interactions and visual feedback are implemented to guide users through the campaign creation process, with accessibility considerations for keyboard navigation and screen readers.
              </p>
            </div>
          </div>
        </div>
      </details>
      
      {/* Restart button for completed challenge */}
      {isCompleted && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Start Over
          </button>
        </div>
      )}
      
      {/* Challenge Steps Quick View - enhanced styling */}
      <div className="bg-gradient-to-b from-white to-purple-50 shadow-lg rounded-xl p-8 mb-8 border border-purple-100">
        <h2 className="text-2xl font-bold mb-4 text-purple-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Challenge Steps Quick View
        </h2>
        <p className="text-gray-700 mb-6 font-medium border-b border-purple-200 pb-3">There are 5 steps required to complete the Challenge.</p>
        
        <ul className="space-y-4 text-gray-700">
          <li className="flex items-start p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
            <span className="font-medium"><span className="text-purple-700">Step 1:</span> Define your Brand Basics, choose your Brand Personality, and set your Social Media Goals. Then continue to Audience Research as AI begins putting your plan together.</span>
          </li>
          <li className="flex items-start p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
            <span className="font-medium"><span className="text-purple-700">Step 2:</span> Select your Target Audience and click Get AI Audience Analysis to review the audience details.</span>
          </li>
          <li className="flex items-start p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
            <span className="font-medium"><span className="text-purple-700">Step 3:</span> Click Continue Platform Selection to see what AI recommends.</span>
          </li>
          <li className="flex items-start p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
            <span className="font-medium"><span className="text-purple-700">Step 4:</span> Review the AI-recommended platforms based on your brand input. Select the Social Media Platforms you want to include in your campaign.</span>
          </li>
          <li className="flex items-start p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
            <span className="font-medium"><span className="text-purple-700">Step 5:</span> Challenge Completed! Click Complete & Return!</span>
          </li>
        </ul>
      </div>
      
      {/* Start Button has been removed */}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {renderCurrentStep()}
      </div>

      {/* For the Nerds - Technical Details */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <details className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <summary className="flex items-center justify-between cursor-pointer p-5 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-700" />
              <h3 className="text-lg font-semibold text-purple-800">For the Nerds - Technical Details</h3>
            </div>
            <div className="bg-white rounded-full p-1 shadow-sm">
              <svg className="h-5 w-5 text-purple-600 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          
          <div className="p-5 border-t border-gray-200 bg-white">
            <div className="prose max-w-none text-gray-600 text-sm space-y-4">
              <div>
                <h4 className="text-purple-700 font-medium">AI-Powered Social Media Strategy Technology</h4>
                <p>This challenge utilizes several advanced AI technologies for social media strategy development:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Natural Language Processing (NLP)</strong> - Analyzes brand descriptions and goals to extract key themes and positioning</li>
                  <li><strong>Audience Segmentation Algorithms</strong> - Identifies and categorizes target audiences based on demographic and psychographic data</li>
                  <li><strong>Platform-Specific Recommendation Systems</strong> - Matches brand attributes with optimal social media platforms</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-purple-700 font-medium">Audience Analysis Pipeline</h4>
                <p>The audience analysis process follows these technical steps:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li><strong>Demographic Data Processing</strong> - Parses user-provided audience characteristics</li>
                  <li><strong>Psychographic Inference</strong> - Uses ML models to infer deeper psychological traits from basic demographic inputs</li>
                  <li><strong>Interest Clustering</strong> - Groups related interests using semantic similarity algorithms</li>
                  <li><strong>Pain Point Extraction</strong> - Identifies audience challenges through sentiment analysis</li>
                  <li><strong>Platform Affinity Calculation</strong> - Computes statistical likelihood of platform usage by demographic segment</li>
                </ol>
              </div>
              
              <div>
                <h4 className="text-purple-700 font-medium">Content Strategy Generation</h4>
                <p>The content planning system leverages:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Temporal Pattern Recognition</strong> - Analyzes optimal posting times based on platform engagement data</li>
                  <li><strong>Content Type Classification</strong> - Categorizes content formats (video, image, text) by effectiveness for specific goals</li>
                  <li><strong>Topic Modeling</strong> - Uses Latent Dirichlet Allocation (LDA) to identify relevant content themes</li>
                  <li><strong>Engagement Prediction</strong> - Forecasts potential engagement metrics using regression models</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-purple-700 font-medium">Platform Selection Algorithm</h4>
                <p>The platform recommendation engine employs:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Multi-criteria Decision Analysis</strong> - Weighs multiple factors including audience presence, content fit, and goal alignment</li>
                  <li><strong>Bayesian Network Models</strong> - Calculates conditional probabilities of success across platforms</li>
                  <li><strong>ROI Estimation</strong> - Projects potential return based on industry benchmarks and engagement forecasts</li>
                  <li><strong>Cross-platform Synergy Analysis</strong> - Identifies complementary platform combinations</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-purple-700 font-medium">Technical Implementation</h4>
                <p>The application architecture includes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>React Component Architecture</strong> - Multi-step wizard interface with state persistence</li>
                  <li><strong>Adaptive Form Validation</strong> - Context-aware validation rules based on selected options</li>
                  <li><strong>Local Storage Caching</strong> - Preserves progress across sessions</li>
                  <li><strong>Dynamic Recommendation Generation</strong> - Real-time strategy adjustments based on user inputs</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default SocialMediaStrategistMain; 