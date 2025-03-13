import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserProgress, saveChallengeBizStrategy, calculateUserScore, updateLeaderboard, markChallengeAsCompleted } from '../../../utils/userDataManager'
import { ApiResponse } from '../../../services/openai'
import BusinessGoalSelection from './BusinessGoalSelection'
import MarketAnalysis from './MarketAnalysis'
import StrategyDevelopment from './StrategyDevelopment'
import StrategyAssessment from './StrategyAssessment'
import CompletionScreen from './CompletionScreen'
import IntroScreen from './IntroScreen'
import FinancialDataAnalysis from './FinancialDataAnalysis'
import { motion } from 'framer-motion'
import ChallengeHeader from '../../shared/ChallengeHeader'
import { PieChart } from 'lucide-react'

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
  industry: string;
  marketInsights: string[];
  selectedStrategies: string[];
  financialData: any;
  financialInsights: string[];
  aiRecommendation: string;
  userRecommendation: string;
  suggestedRecommendation: string;
  scenarioResults: any;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

const INITIAL_STATE: BizStrategyState = {
  businessGoal: '',
  businessType: '',
  industry: '',
  marketInsights: [],
  selectedStrategies: [],
  financialData: null,
  financialInsights: [],
  aiRecommendation: '',
  userRecommendation: '',
  suggestedRecommendation: '',
  scenarioResults: null,
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
};

// Challenge steps
export enum STEPS {
  INTRO = 'INTRO',
  FINANCIAL_ANALYSIS = 'FINANCIAL_ANALYSIS',
  MARKET_ANALYSIS = 'MARKET_ANALYSIS',
  STRATEGY_DEVELOPMENT = 'STRATEGY_DEVELOPMENT',
  STRATEGY_ASSESSMENT = 'STRATEGY_ASSESSMENT',
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
  const [state, setState] = useState<BizStrategyState>(INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.INTRO);
  const [funFact, setFunFact] = useState<string>('');
  const [userProgress, setUserProgress] = useUserProgress();
  
  // Add state for challenge completion and confetti
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress.completedChallenges.includes('challenge-3')
  );
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Check if challenge is already completed on mount
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-3')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  // Handle completing the challenge
  const handleCompleteChallenge = () => {
    // Check if user has completed the strategy assessment to mark as complete
    if (currentStep !== STEPS.STRATEGY_ASSESSMENT && !isCompleted) {
      alert('Please complete your strategy assessment before finishing the challenge.');
      return;
    }
    
    markChallengeAsCompleted('challenge-3');
    setIsCompleted(true);
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  // Set a random fun fact on initial load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * STRATEGY_FACTS.length);
    setFunFact(STRATEGY_FACTS[randomIndex]);
  }, []);

  const updateState = (newState: Partial<BizStrategyState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      // Save to localStorage whenever state changes
      saveChallengeBizStrategy(
        'challenge-3',
        updatedState.businessGoal,
        updatedState.businessType,
        updatedState.industry,
        updatedState.selectedStrategies,
        updatedState.scenarioResults
      );
      return updatedState;
    });
  };

  const nextStep = () => {
    switch (currentStep) {
      case STEPS.INTRO:
        setCurrentStep(STEPS.FINANCIAL_ANALYSIS);
        break;
      case STEPS.FINANCIAL_ANALYSIS:
        setCurrentStep(STEPS.MARKET_ANALYSIS);
        break;
      case STEPS.MARKET_ANALYSIS:
        setCurrentStep(STEPS.STRATEGY_DEVELOPMENT);
        break;
      case STEPS.STRATEGY_DEVELOPMENT:
        setCurrentStep(STEPS.STRATEGY_ASSESSMENT);
        break;
      default:
        break;
    }
  };

  const previousStep = () => {
    switch (currentStep) {
      case STEPS.FINANCIAL_ANALYSIS:
        setCurrentStep(STEPS.INTRO);
        break;
      case STEPS.MARKET_ANALYSIS:
        setCurrentStep(STEPS.FINANCIAL_ANALYSIS);
        break;
      case STEPS.STRATEGY_DEVELOPMENT:
        setCurrentStep(STEPS.MARKET_ANALYSIS);
        break;
      case STEPS.STRATEGY_ASSESSMENT:
        setCurrentStep(STEPS.STRATEGY_DEVELOPMENT);
        break;
      default:
        break;
    }
  };

  const getStepLabel = (step: STEPS): string => {
    switch (step) {
      case STEPS.INTRO:
        return "Introduction";
      case STEPS.FINANCIAL_ANALYSIS:
        return "1. Analyze Financial Data";
      case STEPS.MARKET_ANALYSIS:
        return "2. Market Analysis";
      case STEPS.STRATEGY_DEVELOPMENT:
        return "3. Strategy Development";
      case STEPS.STRATEGY_ASSESSMENT:
        return "4. Strategy Assessment";
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.INTRO:
        return <IntroScreen onNext={nextStep} />;
      case STEPS.FINANCIAL_ANALYSIS:
        return (
          <FinancialDataAnalysis
            state={state}
            updateState={updateState}
            onNext={nextStep}
          />
        );
      case STEPS.MARKET_ANALYSIS:
        return (
          <MarketAnalysis
            state={state}
            updateState={updateState}
            onNext={nextStep}
            onBack={previousStep}
          />
        );
      case STEPS.STRATEGY_DEVELOPMENT:
        return (
          <StrategyDevelopment
            state={state}
            updateState={updateState}
            onNext={nextStep}
            onBack={previousStep}
          />
        );
      case STEPS.STRATEGY_ASSESSMENT:
        return (
          <StrategyAssessment
            state={state}
            onBack={previousStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <ChallengeHeader
        title="Business Strategist Challenge"
        icon={<PieChart className="h-6 w-6 text-cyan-600" />}
        challengeId="challenge-3"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
      />
      
      {/* Progress indicator only shown after intro */}
      {currentStep !== STEPS.INTRO && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {Object.values(STEPS).filter(step => step !== STEPS.INTRO).map((step) => (
              <div 
                key={step}
                className={`text-sm ${
                  step === currentStep 
                    ? 'text-[#0097A7] font-medium' 
                    : 'text-gray-500'
                }`}
              >
                {getStepLabel(step as STEPS)}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#0097A7]"
              initial={{ width: '0%' }}
              animate={{ 
                width: currentStep === STEPS.FINANCIAL_ANALYSIS
                  ? '25%'
                  : currentStep === STEPS.MARKET_ANALYSIS
                  ? '50%'
                  : currentStep === STEPS.STRATEGY_DEVELOPMENT
                  ? '75%'
                  : currentStep === STEPS.STRATEGY_ASSESSMENT
                  ? '100%'
                  : '0%'
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
      
      {/* Current step component */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {renderStep()}
      </div>
    </div>
  );
};

export default BizStrategistMain; 