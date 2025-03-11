import React, { useState } from 'react';
import { BusinessScenario, ModelResponse, ModelType, UserAnalysis } from '../SmartSelectMain';

interface FollowupQuestionsProps {
  scenario: BusinessScenario | null;
  responses: Record<ModelType, ModelResponse | null>;
  followupResponses: Record<ModelType, string | null>;
  userAnalysis: UserAnalysis | null;
  onAskFollowup: (question: string) => void;
  onRestart: () => void;
  isLoading: boolean;
}

export const FollowupQuestions: React.FC<FollowupQuestionsProps> = ({
  scenario,
  responses,
  followupResponses,
  userAnalysis,
  onAskFollowup,
  onRestart,
  isLoading
}) => {
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [hasAskedEthicsQuestion, setHasAskedEthicsQuestion] = useState(false);
  
  if (!scenario || !userAnalysis) {
    return <div>Missing scenario or analysis data</div>;
  }
  
  const basicResponse = responses.basic;
  const advancedResponse = responses.advanced;
  
  const handleAskFollowup = () => {
    if (followupQuestion.trim() === '') return;
    
    onAskFollowup(followupQuestion);
    
    // Check if it's an ethics question
    if (
      followupQuestion.toLowerCase().includes('ethics') || 
      followupQuestion.toLowerCase().includes('ethical') ||
      followupQuestion.toLowerCase().includes('risk') ||
      followupQuestion.toLowerCase().includes('bias')
    ) {
      setHasAskedEthicsQuestion(true);
    }
  };
  
  const handleAskEthicsQuestion = () => {
    const ethicsQuestion = `What are the potential risks or ethical concerns with using AI for business decision-making in this ${scenario.title.toLowerCase()} scenario?`;
    setFollowupQuestion(ethicsQuestion);
    onAskFollowup(ethicsQuestion);
    setHasAskedEthicsQuestion(true);
  };
  
  // Render the analysis summary
  const renderAnalysisSummary = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Analysis Summary</h3>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">Preferred AI Model:</h4>
          <p className="mt-1 text-sm text-gray-900">
            {userAnalysis.selectedModel === 'basic' ? 
              (basicResponse?.modelName || 'Basic AI Model') : 
              (advancedResponse?.modelName || 'Advanced AI Model')}
          </p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">Reason for Selection:</h4>
          <p className="mt-1 text-sm text-gray-900">{userAnalysis.reasonForSelection}</p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">Key Differences Identified:</h4>
          <ul className="mt-1 text-sm text-gray-900 list-disc pl-5 space-y-1">
            {userAnalysis.keyDifferences.map((difference, index) => (
              <li key={index}>{difference}</li>
            ))}
          </ul>
        </div>
        
        {(userAnalysis.notedStrengths.length > 0 && userAnalysis.notedStrengths[0] !== 'None noted') && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700">Noted Strengths:</h4>
            <ul className="mt-1 text-sm text-gray-900 list-disc pl-5 space-y-1">
              {userAnalysis.notedStrengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        )}
        
        {(userAnalysis.notedWeaknesses.length > 0 && userAnalysis.notedWeaknesses[0] !== 'None noted') && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Areas for Improvement:</h4>
            <ul className="mt-1 text-sm text-gray-900 list-disc pl-5 space-y-1">
              {userAnalysis.notedWeaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // Render the followup question section
  const renderFollowupQuestion = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ask a Follow-up Question</h3>
          <p className="text-sm text-gray-600 mb-4">
            Test the AI models further by asking a follow-up question related to this business scenario.
          </p>
          
          <div className="mb-4">
            <textarea
              rows={3}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
              placeholder="Example: What are the potential risks of implementing these recommendations?"
              value={followupQuestion}
              onChange={(e) => setFollowupQuestion(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <button
              type="button"
              onClick={handleAskFollowup}
              disabled={followupQuestion.trim() === '' || isLoading}
              className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                ${followupQuestion.trim() === '' || isLoading ? 
                  'bg-gray-300 cursor-not-allowed' : 
                  'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {isLoading ? 'Processing...' : 'Ask Question'}
            </button>
            
            {!hasAskedEthicsQuestion && (
              <button
                type="button"
                onClick={handleAskEthicsQuestion}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Try the Ethics Challenge Question
              </button>
            )}
          </div>
        </div>
        
        {(followupResponses.basic || followupResponses.advanced) && (
          <div className="border-t border-gray-200">
            <div className="bg-gray-50 px-6 py-4">
              <h4 className="text-base font-medium text-gray-900 mb-2">AI Responses to Your Question</h4>
              
              {/* Basic AI Response */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h5 className="text-sm font-medium text-gray-900">{basicResponse?.modelName || 'Basic AI Model'}</h5>
                </div>
                
                <div className="pl-8 text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                  {isLoading && !followupResponses.basic ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ) : followupResponses.basic ? (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans">{followupResponses.basic}</pre>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Ask a question to see the response</p>
                  )}
                </div>
              </div>
              
              {/* Advanced AI Response */}
              <div>
                <div className="flex items-center mb-2">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <h5 className="text-sm font-medium text-gray-900">{advancedResponse?.modelName || 'Advanced AI Model'}</h5>
                </div>
                
                <div className="pl-8 text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                  {isLoading && !followupResponses.advanced ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ) : followupResponses.advanced ? (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans">{followupResponses.advanced}</pre>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Ask a question to see the response</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render the challenge completion section
  const renderCompletion = () => {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-center mb-2">Challenge Complete!</h3>
        <p className="text-center mb-4">
          You've successfully compared how different AI models respond to a business scenario and analyzed their differences.
          This skill will help you select the right AI tool for different business tasks.
        </p>
        
        <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
          <h4 className="font-medium mb-2">Key Takeaways:</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>
                Basic AI models provide quick, pattern-based responses ideal for straightforward questions.
              </span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>
                Advanced AI models use reasoning capabilities to provide more nuanced, contextual responses for complex scenarios.
              </span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>
                Consider the complexity of your business question when selecting which AI model to use.
              </span>
            </li>
          </ul>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onRestart}
            className="px-6 py-2 border border-white text-white font-medium rounded-md hover:bg-white hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-600 focus:ring-white transition-colors"
          >
            Try Another Scenario
          </button>
        </div>
      </div>
    );
  };
  
  // Render the prompt information
  const renderPrompt = () => {
    return (
      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Business Scenario:</h3>
          <p className="text-gray-600 text-sm">{scenario.prompt}</p>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Follow-up Questions</h2>
        <p className="text-gray-600">
          Now you can ask additional questions to both AI models to further explore their capabilities.
          Try asking about risks, ethics, or implementation details related to this scenario.
        </p>
      </div>
      
      {renderPrompt()}
      {renderAnalysisSummary()}
      {renderFollowupQuestion()}
      {renderCompletion()}
    </div>
  );
}; 