import React, { useState } from 'react';
import { BusinessScenario, ModelResponse, ModelType, UserAnalysis } from '../SmartSelectMain';

interface ComparisonAnalysisProps {
  scenario: BusinessScenario | null;
  responses: Record<ModelType, ModelResponse | null>;
  onSubmitAnalysis: (analysis: UserAnalysis) => void;
}

export const ComparisonAnalysis: React.FC<ComparisonAnalysisProps> = ({
  scenario,
  responses,
  onSubmitAnalysis
}) => {
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [reasonForSelection, setReasonForSelection] = useState('');
  const [keyDifferences, setKeyDifferences] = useState<string[]>(['', '']);
  const [notedStrengths, setNotedStrengths] = useState<string[]>(['']);
  const [notedWeaknesses, setNotedWeaknesses] = useState<string[]>(['']);
  
  if (!scenario) {
    return <div>No scenario selected</div>;
  }
  
  const basicResponse = responses.basic;
  const advancedResponse = responses.advanced;
  
  // Add or remove difference field
  const handleAddDifference = () => {
    setKeyDifferences([...keyDifferences, '']);
  };
  
  const handleRemoveDifference = (index: number) => {
    setKeyDifferences(keyDifferences.filter((_, i) => i !== index));
  };
  
  // Update difference at index
  const handleUpdateDifference = (index: number, value: string) => {
    const newDifferences = [...keyDifferences];
    newDifferences[index] = value;
    setKeyDifferences(newDifferences);
  };
  
  // Add or remove strength field
  const handleAddStrength = () => {
    setNotedStrengths([...notedStrengths, '']);
  };
  
  const handleRemoveStrength = (index: number) => {
    setNotedStrengths(notedStrengths.filter((_, i) => i !== index));
  };
  
  // Update strength at index
  const handleUpdateStrength = (index: number, value: string) => {
    const newStrengths = [...notedStrengths];
    newStrengths[index] = value;
    setNotedStrengths(newStrengths);
  };
  
  // Add or remove weakness field
  const handleAddWeakness = () => {
    setNotedWeaknesses([...notedWeaknesses, '']);
  };
  
  const handleRemoveWeakness = (index: number) => {
    setNotedWeaknesses(notedWeaknesses.filter((_, i) => i !== index));
  };
  
  // Update weakness at index
  const handleUpdateWeakness = (index: number, value: string) => {
    const newWeaknesses = [...notedWeaknesses];
    newWeaknesses[index] = value;
    setNotedWeaknesses(newWeaknesses);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedModel || !reasonForSelection || keyDifferences.some(d => d.trim() === '')) {
      alert('Please fill out all required fields');
      return;
    }
    
    // Filter out empty inputs
    const filteredStrengths = notedStrengths.filter(s => s.trim() !== '');
    const filteredWeaknesses = notedWeaknesses.filter(w => w.trim() !== '');
    
    // Create analysis object
    const analysis: UserAnalysis = {
      selectedModel,
      reasonForSelection,
      keyDifferences: keyDifferences.filter(d => d.trim() !== ''),
      notedStrengths: filteredStrengths.length > 0 ? filteredStrengths : ['None noted'],
      notedWeaknesses: filteredWeaknesses.length > 0 ? filteredWeaknesses : ['None noted']
    };
    
    onSubmitAnalysis(analysis);
  };
  
  // Render the model selection section
  const renderModelSelection = () => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">1. Select the Most Useful Response</h3>
        <p className="text-sm text-gray-600 mb-4">
          Which AI model's response would you rely on if you were making a real business decision?
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Basic AI Model */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer ${
              selectedModel === 'basic' 
                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedModel('basic')}
          >
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                {selectedModel === 'basic' && (
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-gray-900">{basicResponse?.modelName || 'Basic Model'}</h4>
                <p className="text-sm text-gray-500">Pattern-matching AI</p>
              </div>
            </div>
          </div>
          
          {/* Advanced AI Model */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer ${
              selectedModel === 'advanced' 
                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedModel('advanced')}
          >
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                {selectedModel === 'advanced' && (
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-gray-900">{advancedResponse?.modelName || 'Advanced Model'}</h4>
                <p className="text-sm text-gray-500">Reasoning-capable AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the reason for selection section
  const renderReasonForSelection = () => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">2. Explain Your Choice</h3>
        <p className="text-sm text-gray-600 mb-4">
          Why did you select this model's response? What makes it more useful for the business scenario?
        </p>
        
        <div className="mt-1">
          <textarea
            rows={3}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
            placeholder="This response is more useful because..."
            value={reasonForSelection}
            onChange={(e) => setReasonForSelection(e.target.value)}
          />
        </div>
      </div>
    );
  };
  
  // Render the key differences section
  const renderKeyDifferences = () => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">3. Identify Key Differences</h3>
        <p className="text-sm text-gray-600 mb-4">
          What are the most important differences you noticed between the two AI responses?
        </p>
        
        {keyDifferences.map((difference, index) => (
          <div key={index} className="flex items-start mt-3">
            <div className="w-full">
              <div className="flex items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Difference {index + 1}</span>
                {index > 0 && (
                  <button
                    type="button"
                    className="ml-2 text-xs text-red-600 hover:text-red-800"
                    onClick={() => handleRemoveDifference(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="e.g., The advanced model provides specific implementation steps while the basic model is more general"
                value={difference}
                onChange={(e) => handleUpdateDifference(index, e.target.value)}
              />
            </div>
          </div>
        ))}
        
        <button
          type="button"
          className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={handleAddDifference}
        >
          <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Another Difference
        </button>
      </div>
    );
  };
  
  // Render the strengths and weaknesses section
  const renderStrengthsWeaknesses = () => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">4. Strengths & Weaknesses (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Strengths of Your Chosen Model</h4>
            {notedStrengths.map((strength, index) => (
              <div key={index} className="flex items-start mt-2">
                <div className="w-full">
                  <div className="flex items-center mb-1">
                    <span className="text-xs text-gray-500">Strength {index + 1}</span>
                    {index > 0 && (
                      <button
                        type="button"
                        className="ml-2 text-xs text-red-600 hover:text-red-800"
                        onClick={() => handleRemoveStrength(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="e.g., Clear actionable recommendations"
                    value={strength}
                    onChange={(e) => handleUpdateStrength(index, e.target.value)}
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={handleAddStrength}
            >
              <svg className="-ml-0.5 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Strength
            </button>
          </div>
          
          {/* Weaknesses */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h4>
            {notedWeaknesses.map((weakness, index) => (
              <div key={index} className="flex items-start mt-2">
                <div className="w-full">
                  <div className="flex items-center mb-1">
                    <span className="text-xs text-gray-500">Weakness {index + 1}</span>
                    {index > 0 && (
                      <button
                        type="button"
                        className="ml-2 text-xs text-red-600 hover:text-red-800"
                        onClick={() => handleRemoveWeakness(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="e.g., Missing cost considerations"
                    value={weakness}
                    onChange={(e) => handleUpdateWeakness(index, e.target.value)}
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleAddWeakness}
            >
              <svg className="-ml-0.5 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Weakness
            </button>
          </div>
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Analysis</h2>
        <p className="text-gray-600">
          Now that you've compared the AI responses, share your analysis of which model provides more 
          valuable insights for this business scenario and why.
        </p>
      </div>
      
      {renderPrompt()}
      
      <form onSubmit={handleSubmit}>
        {renderModelSelection()}
        {renderReasonForSelection()}
        {renderKeyDifferences()}
        {renderStrengthsWeaknesses()}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Analysis
          </button>
        </div>
      </form>
    </div>
  );
}; 