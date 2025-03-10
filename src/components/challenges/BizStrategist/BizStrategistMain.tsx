import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserProgress, saveChallengeBizStrategy, calculateUserScore, updateLeaderboard } from '../../../utils/userDataManager'
import { ApiResponse } from '../../../services/openai'
import BusinessGoalSelection from './BusinessGoalSelection'
import MarketAnalysis from './MarketAnalysis'
import StrategyDevelopment from './StrategyDevelopment'
import StrategyAssessment from './StrategyAssessment'
import CompletionScreen from './CompletionScreen'

// Strategy Analysis types
export interface StrengthWeakness {
  point: string;
  explanation: string;
}

export interface StrategyAlternative {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface RiskOpportunity {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
}

export interface AIStrategyAnalysis {
  overallScore: number;
  cohesionScore: number;
  feasibilityScore: number;
  innovationScore: number;
  summary: string;
  strengths: StrengthWeakness[];
  weaknesses: StrengthWeakness[];
  risks: RiskOpportunity[];
  opportunities: RiskOpportunity[];
  alternatives: StrategyAlternative[];
  executionTips: string[];
}

// Main BizStrategy state
export interface BizStrategyState {
  businessGoal: string;
  businessType: string;
  industryContext: string;
  marketAnalysisReport: string;
  marketKeyInsights: string[];
  strategyElements: string[];
  analysis: AIStrategyAnalysis | null;
  assessmentNotes: string;
  isComplete: boolean;
}

const INITIAL_STATE: BizStrategyState = {
  businessGoal: '',
  businessType: '',
  industryContext: '',
  marketAnalysisReport: '',
  marketKeyInsights: [],
  strategyElements: [],
  analysis: null,
  assessmentNotes: '',
  isComplete: false
};

// Challenge steps
enum STEPS {
  GOAL_SELECTION = 0,
  MARKET_ANALYSIS = 1,
  STRATEGY_DEVELOPMENT = 2,
  STRATEGY_ASSESSMENT = 3,
  COMPLETION = 4
}

// Fun business strategy facts to display
const STRATEGY_FACTS = [
  "Only 30% of executives report their companies' strategies deliver the expected results.",
  "Companies that have clearly articulated, well-communicated strategies typically outperform their competitors by 304%.",
  "The average company changes strategic direction every 2.7 years.",
  "70% of strategic failures are due to poor execution, not poor strategy.",
  "More than 60% of organizations don't link their budgets to strategy.",
  "McKinsey found that companies with a clear 'strategic identity' have 3x higher returns to shareholders.",
  "The most successful companies spend 10-30% of their time reassessing strategy.",
  "Companies that actively seek customer feedback during strategy development have a 45% higher success rate.",
  "Strategy is the #1 leadership challenge according to 40% of CEOs.",
  "Businesses with a documented strategy are 538% more likely to be successful than those without."
];

const BizStrategistMain: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.GOAL_SELECTION);
  const [state, setState] = useState<BizStrategyState>(INITIAL_STATE);
  const [funFact, setFunFact] = useState<string>('');
  
  // Set a random fun fact on initial load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * STRATEGY_FACTS.length);
    setFunFact(STRATEGY_FACTS[randomIndex]);
  }, []);

  // Update state and save
  const updateState = (newState: Partial<BizStrategyState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      // Save to localStorage whenever state changes
      saveChallengeBizStrategy(
        'challenge-3',
        updatedState.businessGoal,
        updatedState.businessType,
        updatedState.industryContext,
        updatedState.strategyElements,
        updatedState.assessmentNotes
      );
      return updatedState;
    });
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
      const randomIndex = Math.floor(Math.random() * STRATEGY_FACTS.length);
      setFunFact(STRATEGY_FACTS[randomIndex]);
      
      // Scroll to top
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous step
  const handleBack = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= STEPS.GOAL_SELECTION) {
      setCurrentStep(prevStep as STEPS);
      window.scrollTo(0, 0);
    }
  };

  // Restart the challenge
  const handleRestart = () => {
    setState(INITIAL_STATE);
    setCurrentStep(STEPS.GOAL_SELECTION);
    const randomIndex = Math.floor(Math.random() * STRATEGY_FACTS.length);
    setFunFact(STRATEGY_FACTS[randomIndex]);
    window.scrollTo(0, 0);
  };

  // Get step label based on current step
  const getStepLabel = (step: STEPS): string => {
    switch (step) {
      case STEPS.GOAL_SELECTION: return 'Define Business Goal';
      case STEPS.MARKET_ANALYSIS: return 'Market Analysis';
      case STEPS.STRATEGY_DEVELOPMENT: return 'Strategy Development';
      case STEPS.STRATEGY_ASSESSMENT: return 'Strategy Assessment';
      case STEPS.COMPLETION: return 'Challenge Complete';
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
                      ? 'bg-[#0097A7]' 
                      : Number(step) === currentStep 
                        ? 'bg-[#B2EBF2]' 
                        : 'bg-gray-200'
                  }`}
                />
                <div 
                  className={`w-6 h-6 rounded-full absolute top-[-8px] ${
                    Number(step) <= currentStep ? 'bg-[#0097A7] text-white' : 'bg-gray-200 text-gray-500'
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
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="text-yellow-600 text-xl mr-3">💡</div>
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">Business Strategy Fact</h3>
                <p className="text-yellow-700 text-sm">{funFact}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Step content */}
      <div>
        {currentStep === STEPS.GOAL_SELECTION && (
          <BusinessGoalSelection 
            state={state} 
            updateState={updateState} 
            onNext={handleNext} 
          />
        )}
        
        {currentStep === STEPS.MARKET_ANALYSIS && (
          <MarketAnalysis 
            state={state} 
            updateState={updateState} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        )}
        
        {currentStep === STEPS.STRATEGY_DEVELOPMENT && (
          <StrategyDevelopment 
            state={state} 
            updateState={updateState} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        )}
        
        {currentStep === STEPS.STRATEGY_ASSESSMENT && (
          <StrategyAssessment 
            state={state} 
            updateState={updateState} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        )}
        
        {currentStep === STEPS.COMPLETION && (
          <CompletionScreen 
            state={state} 
            restartChallenge={handleRestart} 
          />
        )}
      </div>
    </div>
  );
};

export default BizStrategistMain; 