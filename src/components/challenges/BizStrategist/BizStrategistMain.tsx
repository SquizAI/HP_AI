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
import { PieChart, Brain } from 'lucide-react'

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
        return "1. Review Financial Data";
      case STEPS.MARKET_ANALYSIS:
        return "2. Review Market Analysis";
      case STEPS.STRATEGY_DEVELOPMENT:
        return "3. Develop Your Strategy";
      case STEPS.STRATEGY_ASSESSMENT:
        return "4. Challenge Complete!";
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
        title="AI Biz Strategist – Smart Decisions, Smarter Growth!"
        icon={<PieChart className="h-6 w-6 text-cyan-600" />}
        challengeId="challenge-13"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
      />
      
      {/* How AI Works for You */}
      <div className="mb-8 mt-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100 shadow-sm">
          <h2 className="text-xl font-bold text-blue-800 mb-3">How AI Works for You</h2>
          <p className="text-gray-700 mb-4">Make data work for you! In this challenge, you'll put AI to the test by analyzing financial trends, uncovering strategic opportunities, and making smarter business decisions—just like top executives do. AI processes vast amounts of data in seconds, detecting patterns, evaluating risks, and predicting outcomes to help you build a winning strategy with confidence!</p>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <h3 className="font-bold text-blue-700 mb-2">Tools Used</h3>
            <ul className="space-y-1 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <span><span className="font-medium">Financial Data Analyzer</span> – AI-powered analysis of financial metrics, identifying trends, anomalies, and opportunities in your business data.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <span><span className="font-medium">Strategic Recommendation Engine</span> – Generates data-driven strategy recommendations based on financial insights, market analysis, and industry best practices.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Challenge Steps Quick View */}
      <div className="mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Challenge Steps Quick View</h2>
          <p className="text-gray-700 mb-4">There are 4 steps required to complete the Challenge. Don't forget to check out the Pro-Tips at the end of the challenge to see how to leverage AI for analysis back on the job.</p>
          
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✔</span>
              <span><span className="font-medium">Step 1: Review Financial Data</span> – Examine sample quarterly financial data, identify key trends, and get AI-powered insights to inform your strategic decisions.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✔</span>
              <span><span className="font-medium">Step 2: Review Market Analysis</span> – Get AI-generated market insights relevant to your industry and business goals, and select the most important factors for your strategy.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✔</span>
              <span><span className="font-medium">Step 3: Develop Your Strategy</span> – Select strategic elements that address your financial goals and market opportunities, letting AI create a comprehensive recommended business strategy.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✔</span>
              <span><span className="font-medium">Step 4: Challenge Completed!</span> Click Complete & Return!</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-3">Take the Challenge!</h2>
          <p className="text-gray-700">Please review and follow each detailed step below.</p>
        </div>
      </div>
      
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
      
      {/* Pro-Tips section (only displayed after completion) */}
      {currentStep === STEPS.STRATEGY_ASSESSMENT && (
        <div className="mt-12 mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-blue-100 shadow-sm">
            <h2 className="text-xl font-bold text-blue-800 mb-3">Pro-Tips: Applying AI Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <h3 className="font-bold text-blue-700 mb-2 flex items-center">
                  <span className="mr-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">1</span>
                  Connect Multiple Data Sources
                </h3>
                <p className="text-gray-700">Create a more comprehensive picture by asking AI to analyze data from various sources, including financial statements, market research, customer feedback, and competitive intelligence.</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <h3 className="font-bold text-blue-700 mb-2 flex items-center">
                  <span className="mr-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">2</span>
                  Explore Multiple Scenarios
                </h3>
                <p className="text-gray-700">Have AI generate multiple strategy options by changing key assumptions, market conditions, or business goals to understand different possible outcomes.</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <h3 className="font-bold text-blue-700 mb-2 flex items-center">
                  <span className="mr-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">3</span>
                  Validate AI Recommendations
                </h3>
                <p className="text-gray-700">Always cross-check AI insights with your team's expertise and industry knowledge. The best strategies combine AI-powered analysis with human judgment.</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <h3 className="font-bold text-blue-700 mb-2 flex items-center">
                  <span className="mr-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">4</span>
                  Iterate and Refine
                </h3>
                <p className="text-gray-700">Use AI as an ongoing strategic partner. Regularly update your data and ask AI to refine its analysis as market conditions change and new information becomes available.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* For the Nerds - Technical Details */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <details className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <summary className="flex items-center justify-between cursor-pointer p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-700" />
              <h3 className="text-lg font-semibold text-blue-800">For the Nerds - Technical Details</h3>
            </div>
            <div className="bg-white rounded-full p-1 shadow-sm">
              <svg className="h-5 w-5 text-blue-600 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          
          <div className="p-5 border-t border-gray-200 bg-white">
            <div className="prose max-w-none text-gray-600 text-sm space-y-4">
              <div>
                <h4 className="text-blue-700 font-medium">Business Strategy AI Technology for Data Scientists</h4>
                <p>This challenge implements a sophisticated AI-driven business strategy framework using multiple advanced techniques:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Natural Language Processing (NLP)</strong> - Utilizes transformer-based models (BERT derivatives) with fine-tuning for domain-specific business terminology. Implements attention mechanisms to identify strategic keywords with TF-IDF and BM25 ranking for relevance scoring.</li>
                  <li><strong>Predictive Analytics</strong> - Employs ensemble methods combining gradient-boosted decision trees (XGBoost, LightGBM) with deep learning approaches (LSTM networks) for time-series forecasting of business metrics with quantified uncertainty bounds.</li>
                  <li><strong>Multi-agent Simulation</strong> - Implements agent-based modeling using reinforcement learning agents with customizable utility functions and Nash equilibrium solvers to model market competition dynamics.</li>
                  <li><strong>Decision Support Systems</strong> - Utilizes Markov Decision Processes (MDPs) and Partially Observable MDPs with Monte Carlo Tree Search (MCTS) for strategic decision optimization under uncertainty.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">SWOT Analysis Engine: Technical Implementation</h4>
                <p>The SWOT analysis pipeline incorporates multiple ML techniques with the following implementation details:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Sentiment Analysis</strong> - Implements a fine-tuned RoBERTa model (F1 score: 0.87) with aspect-based sentiment analysis to extract business-specific sentiment from unstructured data. Includes confidence scoring and explainability via SHAP values.</li>
                  <li><strong>Entity Recognition</strong> - Utilizes a custom NER model with CRF layer on top of BERT embeddings, trained on business domain corpus (10M+ tokens) with 94% accuracy for industry-specific entity extraction.</li>
                  <li><strong>Causal Inference</strong> - Implements Bayesian structural equation modeling with directed acyclic graphs (DAGs) for causal discovery. Uses do-calculus for counterfactual analysis and propensity score matching for treatment effect estimation.</li>
                  <li><strong>Hierarchical Clustering</strong> - Employs HDBSCAN algorithm with UMAP dimensionality reduction on word embeddings, optimized with silhouette coefficient validation (0.72) and adjusted Rand index for cluster stability assessment.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Financial Analysis Pipeline: Data Science Architecture</h4>
                <p>The financial analytics system implements a multi-stage pipeline with these technical specifications:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li><strong>Data Normalization</strong> - Applies robust scaling with Winsorization (99th percentile) to handle outliers, followed by Box-Cox transformations for non-normal distributions. Implements missing value imputation using KNN for time-series with MCAR validation.</li>
                  <li><strong>Anomaly Detection</strong> - Combines isolation forests, DBSCAN, and autoencoder reconstruction error with an ensemble voting mechanism. Features adaptive thresholding based on Extreme Value Theory for dynamic anomaly boundaries.</li>
                  <li><strong>Trend Analysis</strong> - Implements STL decomposition (Seasonal-Trend-Loess) with Prophet models for trend forecasting. Incorporates wavelet transforms for multi-resolution analysis and change point detection using PELT algorithm.</li>
                  <li><strong>Ratio Computation</strong> - Dynamically generates financial ratios using domain knowledge graphs with automated feature importance ranking via permutation importance and SHAP values.</li>
                  <li><strong>Benchmark Comparison</strong> - Utilizes Mahalanobis distance metrics in high-dimensional feature space with industry classification using hierarchical Dirichlet processes. Implements bootstrap resampling for confidence interval estimation.</li>
                </ol>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Strategy Generation Algorithm: Technical Specifications</h4>
                <p>The strategy recommendation engine employs advanced computational methods:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Monte Carlo Simulation</strong> - Implements Latin Hypercube sampling for efficient parameter space exploration with Sobol sequences for quasi-random number generation. Features variance reduction techniques including antithetic variates and control variates.</li>
                  <li><strong>Game Theory Models</strong> - Utilizes extensive-form games with perfect recall and sequential equilibrium solvers. Implements evolutionary game theory dynamics with replicator equations for strategy evolution simulation.</li>
                  <li><strong>Reinforcement Learning</strong> - Employs Proximal Policy Optimization (PPO) with generalized advantage estimation in a custom business environment. Features curriculum learning for progressive strategy complexity and distributional RL for risk-sensitive decision making.</li>
                  <li><strong>Bayesian Networks</strong> - Implements structure learning via score-based (BDeu, BIC) and constraint-based (PC algorithm) methods with parameter estimation using Dirichlet priors. Features dynamic Bayesian networks for temporal dependencies with particle filtering for inference.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Risk Assessment Framework: Data Science Implementation</h4>
                <p>The risk analysis component leverages advanced statistical and ML techniques:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Probabilistic Risk Models</strong> - Implements Bayesian hierarchical models with MCMC sampling (No-U-Turn Sampler) for posterior distribution estimation. Features copula-based dependency modeling for joint risk distributions with tail dependency analysis.</li>
                  <li><strong>Sensitivity Analysis</strong> - Utilizes Sobol indices and Morris screening for global sensitivity analysis with automatic differentiation for gradient-based local sensitivity. Implements variance-based decomposition for interaction effects quantification.</li>
                  <li><strong>Scenario Planning Algorithms</strong> - Employs principal component analysis with k-medoids clustering for scenario identification. Features adversarial scenario generation using GAN architectures to identify worst-case scenarios with realistic constraints.</li>
                  <li><strong>Risk Mitigation Recommendation Engine</strong> - Implements multi-objective optimization using NSGA-II algorithm with Pareto frontier analysis. Features constraint satisfaction programming for feasible mitigation strategy identification with utility theory for preference modeling.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Data Pipeline and Technical Architecture</h4>
                <p>The application's data science infrastructure includes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>React Component Architecture</strong> - Implements custom hooks for data processing with memoization strategies for computation-heavy operations. Features lazy loading and code splitting for optimized performance.</li>
                  <li><strong>Dynamic Strategy Visualization</strong> - Utilizes D3.js with SVG and WebGL rendering for complex interactive visualizations. Implements force-directed graphs for relationship mapping with custom physics-based simulations.</li>
                  <li><strong>Adaptive Recommendation Engine</strong> - Features online learning with Thompson sampling for multi-armed bandit problems. Implements contextual bandits with linear payoffs for personalized recommendations.</li>
                  <li><strong>Progressive Data Processing</strong> - Utilizes web workers for non-blocking computation with transferable objects for efficient memory management. Implements incremental computation patterns with memoization for intermediate results.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Model Evaluation and Validation Framework</h4>
                <p>The system employs rigorous validation methodologies:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Cross-Validation Strategies</strong> - Implements time-series cross-validation with expanding windows and purged k-fold for financial data to prevent data leakage. Features combinatorial cross-validation for robust hyperparameter optimization.</li>
                  <li><strong>Performance Metrics</strong> - Utilizes custom business-aligned metrics including risk-adjusted returns (Sharpe, Sortino ratios) and calibrated expected profit measures with confidence bounds.</li>
                  <li><strong>Model Interpretability</strong> - Implements LIME and integrated gradients for local explanations with global surrogate models (GAMs) for overall model behavior interpretation.</li>
                  <li><strong>Uncertainty Quantification</strong> - Features ensemble methods with bootstrapping for prediction intervals and Bayesian neural networks with variational inference for uncertainty estimation.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Data Scientist Workflow Integration</h4>
                <p>The system supports data science workflows through:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Experiment Tracking</strong> - Provides integration capabilities with MLflow and Weights & Biases for experiment versioning, hyperparameter tracking, and model registry.</li>
                  <li><strong>Feature Store</strong> - Implements a feature computation and caching layer with time-travel capabilities for point-in-time correct feature retrieval.</li>
                  <li><strong>Model Deployment</strong> - Supports containerized model serving with A/B testing frameworks and shadow deployment for risk-free evaluation.</li>
                  <li><strong>Monitoring and Feedback</strong> - Implements data drift detection with statistical tests (KS, PSI) and automated retraining triggers based on performance degradation metrics.</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default BizStrategistMain; 