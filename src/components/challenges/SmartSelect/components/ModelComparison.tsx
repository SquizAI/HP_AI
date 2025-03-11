import React from 'react';
import { BusinessScenario, ModelResponse, ModelType } from '../SmartSelectMain';

interface ModelComparisonProps {
  scenario: BusinessScenario | null;
  responses: Record<ModelType, ModelResponse | null>;
  modelDescriptions: Record<ModelType, {
    name: string;
    description: string;
    strengths: string[];
    limitations: string[];
  }>;
  isLoading: boolean;
  onGoBack?: () => void;
  onContinue: () => void;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  scenario,
  responses,
  modelDescriptions,
  isLoading,
  onGoBack,
  onContinue
}) => {
  if (!scenario) {
    return <div>No scenario selected</div>;
  }
  
  const basicResponse = responses.basic;
  const advancedResponse = responses.advanced;
  
  // Render the model response card
  const renderResponseCard = (modelType: ModelType, response: ModelResponse | null) => {
    const modelDesc = modelDescriptions[modelType];
    const modelName = response?.modelName || modelDesc.name;
    const modelDescription = modelDesc.description;
    const bgColor = modelType === 'basic' ? 'bg-blue-50' : 'bg-purple-50';
    const borderColor = modelType === 'basic' ? 'border-blue-200' : 'border-purple-200';
    const iconColor = modelType === 'basic' ? 'text-blue-600' : 'text-purple-600';
    const iconBgColor = modelType === 'basic' ? 'bg-blue-100' : 'bg-purple-100';
    
    return (
      <div className={`border ${borderColor} rounded-lg overflow-hidden ${bgColor}`}>
        {/* Model header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          <div className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center mr-4`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
              {modelType === 'basic' ? (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              ) : (
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              )}
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{modelName}</h3>
            <p className="text-sm text-gray-600">{modelDescription}</p>
          </div>
        </div>
        
        {/* Response content */}
        <div className="px-6 py-4">
          {isLoading && !response ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : response ? (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{response.response}</pre>
            </div>
          ) : (
            <p className="text-gray-500 italic">No response generated yet</p>
          )}
        </div>
        
        {/* Response metrics */}
        {response && (
          <div className="px-6 py-4 border-t border-gray-200 bg-white bg-opacity-50">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Response Time</p>
                <p className="text-sm font-medium text-gray-900">{response.responseTime}s</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Confidence</p>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded overflow-hidden mr-2">
                    <div 
                      className={`h-full ${modelType === 'basic' ? 'bg-blue-600' : 'bg-purple-600'}`}
                      style={{ width: `${response.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{response.confidence}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Generated</p>
                <p className="text-sm font-medium text-gray-900">{new Date(response.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Response Comparison</h2>
      <p className="text-gray-600 mb-4">
        Compare how different AI models respond to the same business prompt.
      </p>
      
      {/* Scenario details */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{scenario.title}</h3>
        
        <div className="flex items-center mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
            {scenario.category}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
            ${scenario.complexity === 'low' ? 'bg-green-100 text-green-800' :
              scenario.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}`}
          >
            {scenario.complexity.charAt(0).toUpperCase() + scenario.complexity.slice(1)} Complexity
          </span>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Business Prompt:</h4>
          <p className="text-gray-900">{scenario.prompt}</p>
        </div>
        
        <p className="text-xs text-gray-500">
          AI models will generate responses to this business scenario.
        </p>
      </div>
      
      {/* Model responses side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {renderResponseCard('basic', basicResponse)}
        {renderResponseCard('advanced', advancedResponse)}
      </div>
      
      {/* Explanation of differences */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Understanding the Differences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-base font-medium text-blue-700 flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {modelDescriptions.basic.name}
            </h4>
            <ul className="space-y-2 text-sm">
              {modelDescriptions.basic.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-medium text-purple-700 flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              {modelDescriptions.advanced.name}
            </h4>
            <ul className="space-y-2 text-sm">
              {modelDescriptions.advanced.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Scenarios
          </button>
        )}
        
        <button
          onClick={onContinue}
          disabled={!basicResponse || !advancedResponse || isLoading}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
            ${!basicResponse || !advancedResponse || isLoading ? 
              'bg-gray-300 cursor-not-allowed' : 
              'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
        >
          Analyze Differences
          <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}; 