import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveChallengeDataAnalyst, useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import DatasetSelection from './DatasetSelection';
import DataExploration from './DataExploration';
import DataVisualization from './DataVisualization';
import InsightGeneration from './InsightGeneration';
import CompletionScreen from './CompletionScreen';
import ChallengeHeader from '../../shared/ChallengeHeader';
import { BarChart, ArrowLeft, ChevronRight, Database, TrendingUp, Lightbulb, Award, Home, Brain } from 'lucide-react';
import Confetti from '../../shared/Confetti';

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
  selectedChartType?: string; // Added to track user-selected chart type
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
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.DATASET_SELECTION);
  const [state, setState] = useState<DataAnalystState>(INITIAL_STATE);
  const [funFact, setFunFact] = useState<string>('');
  
  // User progress tracking for completion
  const [userProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress.completedChallenges.includes('challenge-15')
  );
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Set a random fun fact on initial load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ANALYSIS_FACTS.length);
    setFunFact(ANALYSIS_FACTS[randomIndex]);
  }, []);

  // Ensure we scroll to top whenever the step changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
  }, [currentStep]);

  // Update state and save
  const updateState = (newState: Partial<DataAnalystState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      // Save to localStorage whenever state changes
      saveChallengeDataAnalyst(
        'challenge-15',
        updatedState
      );
      return updatedState;
    });
  };

  // Using the standardized saveChallengeDataAnalyst function from userDataManager.ts

  // Navigate to next step
  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= STEPS.COMPLETION) {
      setCurrentStep(nextStep as STEPS);
      
      // If moving to completion, mark challenge as complete and show confetti
      if (nextStep === STEPS.COMPLETION) {
        updateState({ isComplete: true });
        
        // Mark challenge as completed using standard function
        markChallengeAsCompleted('challenge-15');
        setIsCompleted(true);
        
        // Show confetti celebration
        setShowConfetti(true);
        
        // Hide confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
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
    } else {
      // Navigate back to the previous page in browser history
      window.history.back();
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

  // Handle completing the challenge
  const handleCompleteChallenge = () => {
    // Update state to mark as complete
    updateState({ isComplete: true });
    
    // Mark in user progress using the correct challenge ID from ChallengeHubNew.tsx
    markChallengeAsCompleted('challenge-15');
    setIsCompleted(true);
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    // Move to completion step
    setCurrentStep(STEPS.COMPLETION);
    window.scrollTo(0, 0);
  };

  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Show confetti animation when challenge is completed */}
      {showConfetti && <Confetti active={showConfetti} />}
      
      <ChallengeHeader
        title="AI Data Analyst – Unlock Insights with AI-Powered Analytics"
        icon={<BarChart className="h-6 w-6 text-purple-600" />}
        challengeId="challenge-15"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
      />
      
      {/* Main content area */}
      <div className="mt-4">
        {/* How AI Works section */}
        {currentStep === STEPS.DATASET_SELECTION && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 text-purple-600 mr-2" /> 
              How AI Works for You
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                AI is revolutionizing data analysis by spotting trends, uncovering patterns, and generating insights faster than ever. Using a variety of AI-driven tools, it can summarize data, detect anomalies, make predictions, and even suggest business strategies—all without manual number-crunching.
              </p>
              <p className="text-gray-700">
                In this challenge, you will leverage the power of AI to do the heavy lifting! See first-hand how AI supports smart decision-making by analyzing data, highlighting key takeaways, and helping businesses turn raw numbers into actionable insights.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <Database className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="text-md font-medium text-gray-800">Data Processing</h3>
                  </div>
                  <p className="text-sm text-gray-600">AI can analyze massive datasets quickly, identifying patterns and correlations that would take humans much longer to discover.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="text-md font-medium text-gray-800">Predictive Analytics</h3>
                  </div>
                  <p className="text-sm text-gray-600">Machine learning models can forecast trends and predict future outcomes based on historical data patterns.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="text-md font-medium text-gray-800">Actionable Insights</h3>
                  </div>
                  <p className="text-sm text-gray-600">AI transforms raw data into strategic recommendations, helping businesses make informed decisions faster.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Challenge Steps Quick View */}
        {currentStep === STEPS.DATASET_SELECTION && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <ChevronRight className="h-5 w-5 text-purple-600 mr-2" /> 
              Challenge Steps Quick View
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <div>
                  <h3 className="text-md font-medium text-gray-800">Step 1: Load and review your dataset</h3>
                  <p className="text-sm text-gray-600">Let AI analyze key trends in your selected dataset.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <div>
                  <h3 className="text-md font-medium text-gray-800">Step 2: Identify anomalies and patterns</h3>
                  <p className="text-sm text-gray-600">Discover insights through AI-generated analysis.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <div>
                  <h3 className="text-md font-medium text-gray-800">Step 3: Generate AI-powered recommendations</h3>
                  <p className="text-sm text-gray-600">Get actionable strategies based on the data.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <div>
                  <h3 className="text-md font-medium text-gray-800">Step 4: Challenge Completed!</h3>
                  <p className="text-sm text-gray-600">Click Complete & Return!</p>
                </div>
              </div>
            </div>
            
            {/* Take the Challenge prompt */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-center">
                <button 
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors shadow-sm flex items-center"
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                  Take the Challenge
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
        
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

        {/* Back button for steps after the first one */}
        {currentStep > STEPS.DATASET_SELECTION && currentStep < STEPS.COMPLETION && (
          <div className="px-6 mb-4">
            <button
              onClick={handleBack}
              className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to {getStepLabel(currentStep - 1 as STEPS)}
            </button>
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
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
      
      {/* For the Nerds Section */}
      <div className="mt-8 mb-8">
        <details className="bg-gray-50 border border-gray-200 rounded-lg">
          <summary className="px-6 py-4 cursor-pointer flex items-center text-gray-800 font-medium hover:bg-gray-100 transition-colors">
            <Brain className="h-5 w-5 text-purple-600 mr-2" />
            For the Nerds: Inside the AI Data Analysis Engine
          </summary>
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Technical Architecture</h3>
              
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-purple-700 mb-2">Data Processing Pipeline</h4>
                <p className="text-sm text-gray-700 mb-3">Our data analysis engine implements a multi-stage processing pipeline that transforms raw data into actionable insights:</p>
                <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
                  <li><span className="font-medium">Data Ingestion Layer</span> - Handles multiple data formats (CSV, JSON, SQL) through a unified ETL process using Apache Airflow for orchestration</li>
                  <li><span className="font-medium">Data Cleaning & Preprocessing</span> - Implements automated data quality checks, missing value imputation using MICE algorithm, and outlier detection via Isolation Forest</li>
                  <li><span className="font-medium">Feature Engineering</span> - Dynamically generates features using domain-specific transformations and automated feature selection via recursive feature elimination</li>
                  <li><span className="font-medium">Analysis Engine</span> - Employs ensemble methods combining statistical tests, machine learning models, and deep learning techniques based on data characteristics</li>
                  <li><span className="font-medium">Insight Generation</span> - Uses NLG (Natural Language Generation) techniques to convert statistical findings into human-readable insights</li>
                </ol>
              </div>
              
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-purple-700 mb-2">Model Architecture</h4>
                <p className="text-sm text-gray-700 mb-3">The core analysis engine employs a hybrid approach combining multiple model types:</p>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li><span className="font-medium">Statistical Models</span> - ARIMA for time series forecasting, Bayesian inference for probability estimation</li>
                  <li><span className="font-medium">Machine Learning Models</span> - Gradient Boosting (XGBoost/LightGBM) for structured data, Random Forest for feature importance</li>
                  <li><span className="font-medium">Deep Learning</span> - LSTM networks for sequential data, Transformer-based models for complex pattern recognition</li>
                  <li><span className="font-medium">Anomaly Detection</span> - Isolation Forest, One-Class SVM, and Autoencoders working in ensemble for robust outlier identification</li>
                </ul>
                <p className="text-sm text-gray-700 mt-3">Model selection is automated using a meta-learning approach that evaluates dataset characteristics to determine the optimal algorithm combination.</p>
              </div>
              
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-purple-700 mb-2">Visualization Engine</h4>
                <p className="text-sm text-gray-700 mb-3">Our visualization system uses a decision tree algorithm to automatically select the most appropriate chart types:</p>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li>Data cardinality, distribution type, and relationship analysis determine optimal visualization</li>
                  <li>Chart rendering uses D3.js with React integration via custom hooks for responsive design</li>
                  <li>Color schemes are algorithmically selected for optimal data perception and accessibility</li>
                  <li>Interactive elements employ WebGL for handling large datasets with minimal performance impact</li>
                </ul>
                <p className="text-sm text-gray-700 mt-3">The visualization layer implements the Grammar of Graphics principles, allowing for compositional creation of complex visualizations from simple building blocks.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-purple-700 mb-2">Performance Metrics & Optimization</h4>
                <p className="text-sm text-gray-700 mb-3">The system is continuously benchmarked against industry standards:</p>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li>Processing throughput: 50-100MB/s on standard hardware</li>
                  <li>Model training leverages distributed computing via Ray framework</li>
                  <li>Insight quality measured via human evaluation studies with domain experts</li>
                  <li>Memory optimization through incremental processing and data streaming</li>
                  <li>GPU acceleration for deep learning components using CUDA and TensorRT</li>
                </ul>
                <p className="text-sm text-gray-700 mt-3">The entire pipeline is containerized using Docker with Kubernetes orchestration for scalability, with built-in monitoring via Prometheus and Grafana dashboards.</p>
              </div>
            </div>
          </div>
        </details>
      </div>
      
      {/* Back to Challenge Hub Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Challenge Hub
        </button>
      </div>
    </div>
  );
};

export default DataAnalystMain;
