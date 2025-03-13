import React, { useState } from 'react';
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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  if (!scenario) {
    return <div>No scenario selected</div>;
  }
  
  const basicResponse = responses.basic;
  const advancedResponse = responses.advanced;
  
  // Toggle tooltip visibility
  const toggleTooltip = (tooltipId: string | null) => {
    setActiveTooltip(tooltipId === activeTooltip ? null : tooltipId);
  };
  
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
      <div className={`border ${borderColor} rounded-lg overflow-hidden ${bgColor} shadow-sm hover:shadow-md transition-all duration-300`}>
        {/* Model header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          <div className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center mr-4 shadow-sm`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
              {modelType === 'basic' ? (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              ) : (
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              )}
            </svg>
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              {modelName}
              <button 
                className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none" 
                onClick={() => toggleTooltip(`model-${modelType}`)}
                aria-label={`Learn more about ${modelName}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {/* Model info tooltip */}
              {activeTooltip === `model-${modelType}` && (
                <div className="absolute z-10 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-4">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{modelName} Details</h4>
                    <button 
                      className="text-gray-400 hover:text-gray-600" 
                      onClick={() => setActiveTooltip(null)}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">{modelDescription}</p>
                  
                  <div className="mt-2">
                    <h5 className="text-xs font-medium text-gray-900">Strengths:</h5>
                    <ul className="mt-1 text-xs text-gray-600 space-y-1 pl-4 list-disc">
                      {modelDesc.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-2">
                    <h5 className="text-xs font-medium text-gray-900">Limitations:</h5>
                    <ul className="mt-1 text-xs text-gray-600 space-y-1 pl-4 list-disc">
                      {modelDesc.limitations.map((limitation, idx) => (
                        <li key={idx}>{limitation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </h3>
            <p className="text-sm text-gray-600">{modelDescription}</p>
          </div>
        </div>
        
        {/* Response content */}
        <div className="px-6 py-4 relative">
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
              
              {/* AI analysis indicator */}
              <div className="absolute top-4 right-6">
                <div className="relative group">
                  <div className={`rounded-full p-1 ${iconBgColor}`}>
                    <svg className={`h-4 w-4 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute z-10 right-0 transform translate-y-[-100%] mb-2 w-48 hidden group-hover:block">
                    <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 text-center">
                      {modelType === 'basic' ? 
                        "Generated with a focus on speed and conciseness" : 
                        "Generated with enhanced reasoning capabilities"
                      }
                      <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                        <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No response generated yet</p>
          )}
        </div>
        
        {/* Response metrics */}
        {response && (
          <div className="px-6 py-4 border-t border-gray-200 bg-white bg-opacity-50">
            <div className="grid grid-cols-3 gap-4">
              <div className="relative group">
                <p className="text-xs text-gray-500 flex items-center">
                  Response Time
                  <svg className="h-3 w-3 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </p>
                <p className="text-sm font-medium text-gray-900">{response.responseTime}s</p>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-2 w-48 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-xs rounded py-1 px-2">
                    Time taken to generate the complete response
                    <svg className="absolute text-gray-800 h-2 w-2 left-3 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                      <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <p className="text-xs text-gray-500 flex items-center">
                  Confidence
                  <svg className="h-3 w-3 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded overflow-hidden mr-2">
                    <div 
                      className={`h-full ${modelType === 'basic' ? 'bg-blue-600' : 'bg-purple-600'}`}
                      style={{ width: `${response.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{response.confidence}%</span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-2 w-48 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-xs rounded py-1 px-2">
                    Model's assessed confidence in its response
                    <svg className="absolute text-gray-800 h-2 w-2 left-3 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                      <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                    </svg>
                  </div>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Response Comparison</h2>
          <p className="text-gray-600">
            Compare how different AI models respond to the same business prompt.
          </p>
        </div>
        
        {/* Comparison tip */}
        <div className="mt-4 md:mt-0 md:ml-4 bg-blue-50 border border-blue-100 rounded-lg p-3 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Comparison Tip</h3>
              <p className="text-xs text-blue-700 mt-1">
                Pay attention to how each model structures its response, the level of detail provided, and the specific recommendations. Notice differences in reasoning depth and contextual understanding.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scenario details */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{scenario.title}</h3>
        
        <div className="flex items-center mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 border border-blue-200">
            {scenario.category}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${scenario.complexity === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
              scenario.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
              'bg-red-100 text-red-800 border-red-200'}`}
          >
            {scenario.complexity.charAt(0).toUpperCase() + scenario.complexity.slice(1)} Complexity
          </span>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            Business Prompt:
            <div className="relative ml-2 group">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              
              {/* Tooltip */}
              <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-60 hidden group-hover:block">
                <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 text-center">
                  This is the exact prompt that will be sent to each AI model
                  <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                  </svg>
                </div>
              </div>
            </div>
          </h4>
          <p className="text-gray-900">{scenario.prompt}</p>
        </div>
        
        <p className="text-xs text-gray-500">
          Both AI models analyze the same business scenario but may provide different insights based on their capabilities.
        </p>
      </div>
      
      {/* Model responses side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {renderResponseCard('basic', basicResponse)}
        {renderResponseCard('advanced', advancedResponse)}
      </div>
      
      {/* Explanation of differences */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Understanding the Differences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-base font-medium text-blue-700 flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {modelDescriptions.basic.name}
            </h4>
            <ul className="space-y-2 text-sm text-blue-700">
              {modelDescriptions.basic.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-blue-700 mb-1">Limitations:</h5>
              <ul className="space-y-1 text-sm text-blue-700 pl-7 list-disc">
                {modelDescriptions.basic.limitations.map((limitation, index) => (
                  <li key={index}>{limitation}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h4 className="text-base font-medium text-purple-700 flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              {modelDescriptions.advanced.name}
            </h4>
            <ul className="space-y-2 text-sm text-purple-700">
              {modelDescriptions.advanced.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-purple-700 mb-1">Limitations:</h5>
              <ul className="space-y-1 text-sm text-purple-700 pl-7 list-disc">
                {modelDescriptions.advanced.limitations.map((limitation, index) => (
                  <li key={index}>{limitation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Selection Guidance:</h4>
          <p className="text-sm text-gray-600">
            When choosing between AI models, consider your specific business needs. Do you need a quick, straightforward response, or a more nuanced analysis? Is speed more important than depth of reasoning? The next step will help you analyze the differences in more detail.
          </p>
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