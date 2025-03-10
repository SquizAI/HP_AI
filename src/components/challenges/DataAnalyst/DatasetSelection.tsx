import React, { useState } from 'react';
import { DataAnalystState } from './DataAnalystMain';

interface DatasetSelectionProps {
  state: DataAnalystState;
  updateState: (newState: Partial<DataAnalystState>) => void;
  onNext: () => void;
}

// Predefined dataset options
const DATASET_OPTIONS = [
  {
    id: 'sales',
    name: 'Sales Transactions',
    type: 'Sales Data',
    description: 'Historical sales data including product categories, regions, and customer segments.',
    icon: '📊'
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign Results',
    type: 'Marketing Data',
    description: 'Results from various marketing campaigns, including channels, spend, and conversion rates.',
    icon: '📣'
  },
  {
    id: 'customer',
    name: 'Customer Survey Responses',
    type: 'Customer Data',
    description: 'Customer satisfaction survey responses with demographic information and product ratings.',
    icon: '👥'
  },
  {
    id: 'website',
    name: 'Website Traffic Analytics',
    type: 'Web Analytics',
    description: 'Website traffic patterns, user behaviors, page performance, and conversion funnels.',
    icon: '🌐'
  },
  {
    id: 'inventory',
    name: 'Inventory and Supply Chain',
    type: 'Operations Data',
    description: 'Inventory levels, warehouse data, supplier performance, and delivery times.',
    icon: '📦'
  },
  {
    id: 'financial',
    name: 'Financial Performance',
    type: 'Financial Data',
    description: 'Revenue, costs, profit margins, and other financial metrics across business units.',
    icon: '💰'
  }
];

// Common business questions by dataset type
const BUSINESS_QUESTIONS: Record<string, string[]> = {
  'Sales Data': [
    'Which products are our top performers by revenue?',
    'Are there seasonal trends in our sales data?',
    'Which customer segments drive the most profit?',
    'Is there a correlation between discount level and order quantity?'
  ],
  'Marketing Data': [
    'Which marketing channels provide the best ROI?',
    'How does campaign performance vary by customer segment?',
    'What is the optimal frequency for our email campaigns?',
    'How do conversion rates compare across different campaigns?'
  ],
  'Customer Data': [
    'What factors most influence customer satisfaction?',
    'Are there demographic patterns in product preferences?',
    'How does satisfaction correlate with repeat purchases?',
    'Which product features receive the most positive feedback?'
  ],
  'Web Analytics': [
    'Which pages have the highest bounce rates?',
    'What is the typical user journey before conversion?',
    'How does mobile traffic compare to desktop in conversion rate?',
    'Which content drives the most engagement?'
  ],
  'Operations Data': [
    'Which products experience the most stockouts?',
    'How does supplier performance impact delivery times?',
    'What is the optimal inventory level for each product?',
    'Are there seasonal patterns in our inventory turnover?'
  ],
  'Financial Data': [
    'Which business units are most profitable?',
    'How have our profit margins changed over time?',
    'What are our main cost drivers and how are they trending?',
    'How does our financial performance compare to industry benchmarks?'
  ]
};

const DatasetSelection: React.FC<DatasetSelectionProps> = ({ state, updateState, onNext }) => {
  const [selectedDataset, setSelectedDataset] = useState<string>(state.datasetName || '');
  const [customDatasetName, setCustomDatasetName] = useState<string>('');
  const [customDatasetType, setCustomDatasetType] = useState<string>('');
  const [isCustomDataset, setIsCustomDataset] = useState<boolean>(false);
  const [businessQuestion, setBusinessQuestion] = useState<string>(state.businessQuestion || '');
  const [selectedPredefinedQuestion, setSelectedPredefinedQuestion] = useState<string>('');
  const [isCustomQuestion, setIsCustomQuestion] = useState<boolean>(!BUSINESS_QUESTIONS[state.datasetType]?.includes(state.businessQuestion) && state.businessQuestion !== '');

  // Handle selecting a predefined dataset
  const handleDatasetSelect = (datasetId: string) => {
    const dataset = DATASET_OPTIONS.find(d => d.id === datasetId);
    if (dataset) {
      setSelectedDataset(datasetId);
      setIsCustomDataset(false);
      updateState({
        datasetName: dataset.name,
        datasetType: dataset.type
      });
      
      // Reset business question if dataset type changes
      if (state.datasetType !== dataset.type) {
        setBusinessQuestion('');
        setSelectedPredefinedQuestion('');
        setIsCustomQuestion(false);
      }
    }
  };

  // Handle custom dataset inputs
  const handleCustomDatasetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDatasetName(e.target.value);
  };

  const handleCustomDatasetTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDatasetType(e.target.value);
  };

  const handleCustomDatasetSubmit = () => {
    if (customDatasetName.trim() && customDatasetType.trim()) {
      setIsCustomDataset(true);
      updateState({
        datasetName: customDatasetName,
        datasetType: customDatasetType
      });
      
      // Reset business question for custom dataset
      setBusinessQuestion('');
      setSelectedPredefinedQuestion('');
    }
  };

  // Handle business question selection and changes
  const handlePredefinedQuestionSelect = (question: string) => {
    setSelectedPredefinedQuestion(question);
    setBusinessQuestion(question);
    setIsCustomQuestion(false);
    updateState({ businessQuestion: question });
  };

  const handleCustomQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBusinessQuestion(e.target.value);
    updateState({ businessQuestion: e.target.value });
  };

  const handleToggleCustomQuestion = () => {
    setIsCustomQuestion(!isCustomQuestion);
    if (!isCustomQuestion) {
      setSelectedPredefinedQuestion('');
    } else if (BUSINESS_QUESTIONS[state.datasetType] && BUSINESS_QUESTIONS[state.datasetType].length > 0) {
      setBusinessQuestion('');
    }
  };

  // Check if form is complete
  const isFormComplete = () => {
    return (
      ((selectedDataset && !isCustomDataset) || 
       (isCustomDataset && customDatasetName && customDatasetType)) && 
      businessQuestion.trim() !== ''
    );
  };

  // Handle continue to next step
  const handleContinue = () => {
    if (isFormComplete()) {
      onNext();
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-purple-800">
          Step 1: Select Your Dataset
        </h2>
        <p className="text-gray-700 mt-2">
          Choose a dataset and define the business question you want to analyze. This will guide your analysis throughout the challenge.
        </p>
      </div>
      
      {/* Dataset Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Select Dataset</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {DATASET_OPTIONS.map(dataset => (
            <div
              key={dataset.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedDataset === dataset.id && !isCustomDataset
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
              }`}
              onClick={() => handleDatasetSelect(dataset.id)}
            >
              <div className="flex items-start">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 ${
                  selectedDataset === dataset.id && !isCustomDataset
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-gray-100 text-gray-600'
                } flex items-center justify-center mr-3 text-xl`}>
                  {dataset.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">{dataset.name}</h4>
                  <p className="text-sm text-gray-600">{dataset.description}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Custom Dataset Option */}
          <div
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              isCustomDataset
                ? 'border-purple-500 bg-purple-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
            }`}
            onClick={() => setIsCustomDataset(true)}
          >
            <div className="flex items-start">
              <div className={`w-10 h-10 rounded-full flex-shrink-0 ${
                isCustomDataset
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-gray-100 text-gray-600'
              } flex items-center justify-center mr-3 text-xl`}>
                ✨
              </div>
              <div className="flex-grow">
                <h4 className="font-medium text-gray-800 mb-1">Custom Dataset</h4>
                {!isCustomDataset ? (
                  <p className="text-sm text-gray-600">Define your own dataset for analysis.</p>
                ) : (
                  <div className="mt-2 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dataset Name
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Employee Performance Data"
                        value={customDatasetName}
                        onChange={handleCustomDatasetNameChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dataset Type
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., HR Data"
                        value={customDatasetType}
                        onChange={handleCustomDatasetTypeChange}
                      />
                    </div>
                    <button
                      className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors"
                      onClick={handleCustomDatasetSubmit}
                      disabled={!customDatasetName.trim() || !customDatasetType.trim()}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Business Question */}
      {(selectedDataset || isCustomDataset) && state.datasetType && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Define Business Question</h3>
          
          {!isCustomQuestion && BUSINESS_QUESTIONS[state.datasetType] && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                Select a common business question for {state.datasetType}:
              </p>
              <div className="space-y-3">
                {BUSINESS_QUESTIONS[state.datasetType].map((question, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer ${
                      selectedPredefinedQuestion === question
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => handlePredefinedQuestionSelect(question)}
                  >
                    <p className="text-gray-700">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center mb-3">
            <button
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center focus:outline-none"
              onClick={handleToggleCustomQuestion}
            >
              <span className="mr-2">{isCustomQuestion ? "Use predefined question" : "Create custom question"}</span>
              {isCustomQuestion ? "↶" : "✎"}
            </button>
          </div>
          
          {isCustomQuestion && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Define your own business question to analyze:
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                placeholder="e.g., How does employee satisfaction correlate with productivity in our organization?"
                value={businessQuestion}
                onChange={handleCustomQuestionChange}
              ></textarea>
            </div>
          )}
        </div>
      )}
      
      {/* Pro Tip */}
      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <div className="flex items-start">
          <div className="text-blue-500 text-xl mr-3">💡</div>
          <div>
            <h4 className="font-medium text-blue-700 mb-1">Pro Tip</h4>
            <p className="text-blue-800 text-sm">
              The more specific your business question, the more actionable your analysis will be. 
              Good questions are specific, measurable, and directly related to business outcomes.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          className="px-6 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleContinue}
          disabled={!isFormComplete()}
        >
          Continue to Data Exploration
        </button>
      </div>
    </div>
  );
};

export default DatasetSelection; 