import React, { useState } from 'react';
import { BusinessScenario } from '../SmartSelectMain';

interface ScenarioSelectionProps {
  scenarios: BusinessScenario[];
  onSelectScenario: (scenario: BusinessScenario) => void;
}

export const ScenarioSelection: React.FC<ScenarioSelectionProps> = ({
  scenarios,
  onSelectScenario
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null);
  
  // Get unique categories from scenarios
  const categories = Array.from(new Set(scenarios.map(s => s.category)));
  
  // Filter scenarios based on search term and filters
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = searchTerm === '' || 
      scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || scenario.category === selectedCategory;
    const matchesComplexity = selectedComplexity === null || scenario.complexity === selectedComplexity;
    
    return matchesSearch && matchesCategory && matchesComplexity;
  });
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedComplexity(null);
  };
  
  // Render a scenario card
  const renderScenarioCard = (scenario: BusinessScenario) => {
    const complexityColor = 
      scenario.complexity === 'low' ? 'bg-green-100 text-green-800' :
      scenario.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
      'bg-red-100 text-red-800';
    
    return (
      <div 
        key={scenario.id}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer"
        onClick={() => onSelectScenario(scenario)}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-medium text-gray-900 flex-grow">{scenario.title}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complexityColor}`}>
              {scenario.complexity.charAt(0).toUpperCase() + scenario.complexity.slice(1)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>
          
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {scenario.category}
            </span>
            <button
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onSelectScenario(scenario);
              }}
            >
              Select
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Scenario Selection</h2>
      <p className="text-gray-600 mb-8">
        Choose a business scenario to analyze how different AI models respond to the same prompt.
      </p>
      
      {/* Search and filter controls */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          {/* Search input */}
          <div className="flex-grow mb-4 md:mb-0">
            <label htmlFor="search" className="sr-only">Search scenarios</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search business scenarios"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Category filter */}
          <div className="mb-4 md:mb-0">
            <label htmlFor="category" className="sr-only">Category</label>
            <select
              id="category"
              name="category"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value === '' ? null : e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Complexity filter */}
          <div className="mb-4 md:mb-0">
            <label htmlFor="complexity" className="sr-only">Complexity</label>
            <select
              id="complexity"
              name="complexity"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedComplexity || ''}
              onChange={(e) => setSelectedComplexity(e.target.value === '' ? null : e.target.value)}
            >
              <option value="">All Complexity Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          {/* Reset button */}
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleResetFilters}
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* Scenario cards */}
      {filteredScenarios.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No scenarios found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          <button
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleResetFilters}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenarios.map(scenario => renderScenarioCard(scenario))}
        </div>
      )}
    </div>
  );
}; 