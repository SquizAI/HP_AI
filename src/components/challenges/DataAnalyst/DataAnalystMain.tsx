import React, { useState, useEffect } from 'react';
import { saveChallengeBizStrategy } from '../../../utils/userDataManager';
import DatasetSelection from './DatasetSelection';
import DataExploration from './DataExploration';
import DataVisualization from './DataVisualization';
import InsightGeneration from './InsightGeneration';
import CompletionScreen from './CompletionScreen';

// Data Analysis types
export interface DataInsight {
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
}

export interface DataVisualization {
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'custom';
  description: string;
  insights: string[];
  data?: any[]; // Optional array of data for visualization
}

// Main DataAnalyst state
export interface DataAnalystState {
  datasetName: string;
  datasetType: string;
  businessQuestion: string;
  explorationSummary: string;
  keyMetrics: string[];
  anomalies: string[];
  visualizations: DataVisualization[];
  insights: DataInsight[];
  actionItems: string[];
  userNotes: string;
  isComplete: boolean;
}

const INITIAL_STATE: DataAnalystState = {
  datasetName: '',
  datasetType: '',
  businessQuestion: '',
  explorationSummary: '',
  keyMetrics: [],
  anomalies: [],
  visualizations: [],
  insights: [],
  actionItems: [],
  userNotes: '',
  isComplete: false
};

// Challenge steps
enum STEPS {
  DATASET_SELECTION = 0,
  DATA_EXPLORATION = 1,
  DATA_VISUALIZATION = 2,
  INSIGHT_GENERATION = 3,
  COMPLETION = 4
}

// Fun data analysis facts to display
const ANALYSIS_FACTS = [
  "The term 'Big Data' was first used in 1997, long before it became a business buzzword.",
  "The average company only analyzes about 12% of the data they collect.",
  "Data Scientists spend 80% of their time cleaning and preparing data and only 20% analyzing it.",
  "Netflix saves $1 billion per year through data-driven customer retention strategies.",
  "Bad data costs U.S. businesses $3 trillion per year.",
  "90% of the world's data has been created in the last two years.",
  "Only 33% of companies effectively use data to make decisions.",
  "Amazon's recommendation engine drives 35% of their total sales.",
  "Companies that use data-driven decision making are 5% more productive and 6% more profitable.",
  "The global big data market is expected to reach $103 billion by 2027."
];

const DataAnalystMain: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.DATASET_SELECTION);
  const [state, setState] = useState<DataAnalystState>(INITIAL_STATE);
  const [funFact, setFunFact] = useState<string>('');
  
  // Set a random fun fact on initial load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ANALYSIS_FACTS.length);
    setFunFact(ANALYSIS_FACTS[randomIndex]);
  }, []);

  // Update state and save
  const updateState = (newState: Partial<DataAnalystState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      // Save to localStorage whenever state changes
      saveChallengeDataAnalyst(
        'challenge-10',
        updatedState
      );
      return updatedState;
    });
  };

  // Temporary function until we update userDataManager.ts
  const saveChallengeDataAnalyst = (
    challengeId: string,
    data: DataAnalystState
  ): void => {
    try {
      const userProgress = JSON.parse(localStorage.getItem('ai_hub_user_progress') || '{"completedChallenges":[],"challengeData":{},"lastActive":""}');
      
      if (!userProgress.challengeData[challengeId]) {
        userProgress.challengeData[challengeId] = {};
      }
      
      userProgress.challengeData[challengeId].dataAnalyst = {
        ...data,
        completedAt: new Date().toISOString()
      };
      
      userProgress.lastActive = new Date().toISOString();
      localStorage.setItem('ai_hub_user_progress', JSON.stringify(userProgress));
    } catch (error) {
      console.error('Error saving data analyst challenge data:', error);
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
        
        // Update completed challenges in userProgress
        try {
          const userProgress = JSON.parse(localStorage.getItem('ai_hub_user_progress') || '{"completedChallenges":[],"challengeData":{},"lastActive":""}');
          if (!userProgress.completedChallenges.includes('challenge-10')) {
            userProgress.completedChallenges.push('challenge-10');
            localStorage.setItem('ai_hub_user_progress', JSON.stringify(userProgress));
          }
        } catch (error) {
          console.error('Error updating completed challenges:', error);
        }
      }

      // Show a new fun fact when moving to the next step
      const randomIndex = Math.floor(Math.random() * ANALYSIS_FACTS.length);
      setFunFact(ANALYSIS_FACTS[randomIndex]);
      
      // Scroll to top
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous step
  const handleBack = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= STEPS.DATASET_SELECTION) {
      setCurrentStep(prevStep as STEPS);
      window.scrollTo(0, 0);
    }
  };

  // Restart the challenge
  const handleRestart = () => {
    setState(INITIAL_STATE);
    setCurrentStep(STEPS.DATASET_SELECTION);
    const randomIndex = Math.floor(Math.random() * ANALYSIS_FACTS.length);
    setFunFact(ANALYSIS_FACTS[randomIndex]);
    window.scrollTo(0, 0);
  };

  // Get step label based on current step
  const getStepLabel = (step: STEPS): string => {
    switch (step) {
      case STEPS.DATASET_SELECTION: return 'Select Dataset';
      case STEPS.DATA_EXPLORATION: return 'Explore Data';
      case STEPS.DATA_VISUALIZATION: return 'Create Visualizations';
      case STEPS.INSIGHT_GENERATION: return 'Generate Insights';
      case STEPS.COMPLETION: return 'Analysis Complete';
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
                      ? 'bg-[#6200EA]' 
                      : Number(step) === currentStep 
                        ? 'bg-[#B388FF]' 
                        : 'bg-gray-200'
                  }`}
                />
                <div 
                  className={`w-6 h-6 rounded-full absolute top-[-8px] ${
                    Number(step) <= currentStep ? 'bg-[#6200EA] text-white' : 'bg-gray-200 text-gray-500'
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
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="text-purple-600 text-xl mr-3">💡</div>
              <div>
                <h3 className="font-medium text-purple-800 mb-1">Data Insight</h3>
                <p className="text-purple-700 text-sm">{funFact}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Step content */}
      <div>
        {currentStep === STEPS.DATASET_SELECTION && (
          <DatasetSelection 
            state={state} 
            updateState={updateState} 
            onNext={handleNext} 
          />
        )}
        
        {currentStep === STEPS.DATA_EXPLORATION && (
          <DataExploration 
            state={state} 
            updateState={updateState} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        )}
        
        {currentStep === STEPS.DATA_VISUALIZATION && (
          <DataVisualization 
            state={state} 
            updateState={updateState} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        )}
        
        {currentStep === STEPS.INSIGHT_GENERATION && (
          <InsightGeneration 
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

export default DataAnalystMain; 