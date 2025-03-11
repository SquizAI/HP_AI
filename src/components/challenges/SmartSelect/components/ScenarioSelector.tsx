import React from 'react';
import { BusinessScenario } from '../SmartSelectMain';

interface ScenarioSelectorProps {
  scenarios: BusinessScenario[];
  onSelectScenario: (scenario: BusinessScenario) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ scenarios, onSelectScenario }) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Select a Business Scenario</h2>
        <p className="text-gray-600">
          Choose a business scenario to analyze. We'll show you how different AI models respond to the same prompt,
          helping you understand which model might be better suited for different types of business questions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onSelectScenario(scenario)}
          >
            <div className="flex items-center mb-2">
              <CategoryIcon category={scenario.category} />
              <span className="text-xs font-medium text-gray-500 ml-2">{scenario.category}</span>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                scenario.complexity === 'low' ? 'bg-green-100 text-green-800' :
                scenario.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {scenario.complexity.charAt(0).toUpperCase() + scenario.complexity.slice(1)} Complexity
              </span>
            </div>
            
            <h3 className="font-medium text-gray-900 mb-1">{scenario.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
            
            <div className="bg-gray-50 border border-gray-100 rounded p-3 text-sm text-gray-700 mb-3 font-mono">
              {scenario.prompt.length > 150 ? `${scenario.prompt.substring(0, 150)}...` : scenario.prompt}
            </div>
            
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={(e) => {
                e.stopPropagation();
                onSelectScenario(scenario);
              }}
            >
              Select This Scenario
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">About This Challenge</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This challenge demonstrates how different AI models approach the same business scenario, showing
                the differences between basic pattern-matching AI and more sophisticated reasoning-capable models.
              </p>
              <p className="mt-2">
                After selecting a scenario, you'll see responses from different AI models and have the opportunity
                to analyze which would be more useful for a real business decision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for category icons
const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  switch (category.toLowerCase()) {
    case 'strategy':
      return (
        <svg className="h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      );
    case 'marketing':
      return (
        <svg className="h-4 w-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
      );
    case 'operations':
      return (
        <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );
    case 'human resources':
      return (
        <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      );
    case 'customer success':
      return (
        <svg className="h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
  }
}; 