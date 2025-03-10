import React, { useState, useEffect } from 'react';
import { BizStrategyState } from './BizStrategistMain';

interface StrategyDevelopmentProps {
  state: BizStrategyState;
  updateState: (newState: Partial<BizStrategyState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Strategy element types
type StrategyElementType = 'core' | 'marketing' | 'operational' | 'financial' | 'technology';

interface StrategyElement {
  id: string;
  type: StrategyElementType;
  title: string;
  description: string;
  selected: boolean;
}

// Generate strategy elements based on business goal and market analysis
const generateStrategyElements = (state: BizStrategyState): StrategyElement[] => {
  // This would typically come from an API call
  const baseElements: StrategyElement[] = [
    {
      id: 'value-proposition',
      type: 'core',
      title: 'Value Proposition Refinement',
      description: `Clearly articulate what makes your ${state.businessType.toLowerCase()} unique in the ${state.industryContext} industry and why customers should choose you over competitors.`,
      selected: false
    },
    {
      id: 'target-segments',
      type: 'core',
      title: 'Target Segment Prioritization',
      description: 'Identify and prioritize the most valuable customer segments based on market analysis and alignment with your business capabilities.',
      selected: false
    },
    {
      id: 'digital-marketing',
      type: 'marketing',
      title: 'Digital-First Marketing Strategy',
      description: 'Develop a comprehensive digital marketing approach with emphasis on content marketing, SEO, and targeted social media campaigns.',
      selected: false
    },
    {
      id: 'partnership-strategy',
      type: 'marketing',
      title: 'Strategic Partnership Network',
      description: 'Build relationships with complementary businesses to expand market reach, share resources, and create bundled offerings.',
      selected: false
    },
    {
      id: 'process-optimization',
      type: 'operational',
      title: 'Operational Process Optimization',
      description: 'Streamline core business processes to increase efficiency, reduce costs, and improve quality of deliverables.',
      selected: false
    },
    {
      id: 'talent-management',
      type: 'operational',
      title: 'Talent Acquisition & Development',
      description: 'Create a strategy for attracting, developing, and retaining key talent with the skills needed to execute your business goals.',
      selected: false
    },
    {
      id: 'pricing-strategy',
      type: 'financial',
      title: 'Dynamic Pricing Strategy',
      description: 'Implement a flexible pricing model that optimizes revenue while remaining competitive and reflecting your value proposition.',
      selected: false
    },
    {
      id: 'funding-strategy',
      type: 'financial',
      title: 'Growth Funding Strategy',
      description: 'Develop a plan for securing the financial resources needed to fund your growth initiatives and operational needs.',
      selected: false
    },
    {
      id: 'tech-integration',
      type: 'technology',
      title: 'Technology Integration Plan',
      description: 'Identify and implement key technologies that will drive efficiency, enhance customer experience, and create competitive advantages.',
      selected: false
    },
    {
      id: 'data-analytics',
      type: 'technology',
      title: 'Data-Driven Decision Framework',
      description: 'Build a framework for collecting, analyzing, and acting on data to drive continuous improvement and strategic decision-making.',
      selected: false
    }
  ];

  // Here you could add logic to suggest specific elements based on the business goal
  const goalSpecificElements: StrategyElement[] = [];
  
  if (state.businessGoal.toLowerCase().includes('growth') || state.businessGoal.toLowerCase().includes('expansion')) {
    goalSpecificElements.push({
      id: 'market-expansion',
      type: 'marketing',
      title: 'Geographic Expansion Plan',
      description: 'Develop a phased approach to entering new geographic markets, including market entry tactics, localization needs, and resource allocation.',
      selected: false
    });
  }
  
  if (state.businessGoal.toLowerCase().includes('acquisition')) {
    goalSpecificElements.push({
      id: 'customer-acquisition',
      type: 'marketing',
      title: 'Customer Acquisition Engine',
      description: 'Build a systematic approach to attracting and converting new customers with clear metrics, channels, and optimization processes.',
      selected: false
    });
  }
  
  if (state.businessGoal.toLowerCase().includes('cost') || state.businessGoal.toLowerCase().includes('profit')) {
    goalSpecificElements.push({
      id: 'cost-optimization',
      type: 'financial',
      title: 'Cost Structure Optimization',
      description: 'Analyze and optimize your cost structure to improve margins while maintaining or enhancing quality and customer satisfaction.',
      selected: false
    });
  }
  
  if (state.industryContext.toLowerCase().includes('tech') || state.businessGoal.toLowerCase().includes('digital')) {
    goalSpecificElements.push({
      id: 'digital-transformation',
      type: 'technology',
      title: 'Digital Transformation Roadmap',
      description: 'Create a comprehensive plan for leveraging digital technologies to transform key aspects of your business model and operations.',
      selected: false
    });
  }

  return [...baseElements, ...goalSpecificElements];
};

// Mock implementation of a custom strategy element
const generateCustomElement = (title: string, description: string): StrategyElement => {
  return {
    id: `custom-${Date.now()}`,
    type: 'core',
    title,
    description,
    selected: true
  };
};

const StrategyDevelopment: React.FC<StrategyDevelopmentProps> = ({ state, updateState, onNext, onBack }) => {
  const [strategyElements, setStrategyElements] = useState<StrategyElement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeType, setActiveType] = useState<StrategyElementType>('core');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);

  // Initialize strategy elements on component mount
  useEffect(() => {
    if (state.strategyElements && state.strategyElements.length > 0) {
      // If we already have strategy elements in state, convert them back to our format
      const savedElements = generateStrategyElements(state).map(element => {
        return {
          ...element,
          selected: state.strategyElements.includes(element.title)
        };
      });
      setStrategyElements(savedElements);
      setIsLoading(false);
    } else {
      // Otherwise generate new elements with a simulated delay
      setTimeout(() => {
        setStrategyElements(generateStrategyElements(state));
        setIsLoading(false);
      }, 1000);
    }
  }, []);

  const handleElementToggle = (id: string) => {
    setStrategyElements(elements => 
      elements.map(element => 
        element.id === id ? { ...element, selected: !element.selected } : element
      )
    );
  };

  const handleCustomTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTitle(e.target.value);
  };

  const handleCustomDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomDescription(e.target.value);
  };

  const handleAddCustomElement = () => {
    if (customTitle.trim() && customDescription.trim()) {
      const newElement = generateCustomElement(customTitle, customDescription);
      setStrategyElements([...strategyElements, newElement]);
      setCustomTitle('');
      setCustomDescription('');
      setShowCustomForm(false);
    }
  };

  const handleContinue = () => {
    const selectedElements = strategyElements
      .filter(element => element.selected)
      .map(element => element.title);
    
    if (selectedElements.length > 0) {
      updateState({ strategyElements: selectedElements });
      onNext();
    }
  };

  const getTypeLabel = (type: StrategyElementType): string => {
    switch (type) {
      case 'core': return 'Core Strategy';
      case 'marketing': return 'Marketing';
      case 'operational': return 'Operations';
      case 'financial': return 'Financial';
      case 'technology': return 'Technology';
      default: return 'Strategy';
    }
  };

  const getTypeIcon = (type: StrategyElementType): string => {
    switch (type) {
      case 'core': return '🎯';
      case 'marketing': return '📣';
      case 'operational': return '⚙️';
      case 'financial': return '💰';
      case 'technology': return '💻';
      default: return '📋';
    }
  };

  // Get elements of the currently selected type
  const filteredElements = strategyElements.filter(element => element.type === activeType);
  
  // Count how many elements are selected
  const selectedCount = strategyElements.filter(element => element.selected).length;

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-[#E0F7FA] to-[#E0F2F1] p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-[#0097A7]">
          Strategy Development for {state.businessGoal}
        </h2>
        <p className="text-gray-700 mt-2">
          Select the key strategic elements that will help your {state.businessType.toLowerCase()} 
          achieve its goal in the {state.industryContext} industry. Choose at least 3-5 elements.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-[#0097A7] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Generating strategic recommendations...</p>
        </div>
      ) : (
        <div>
          {/* Category tabs */}
          <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
            {(['core', 'marketing', 'operational', 'financial', 'technology'] as StrategyElementType[]).map(type => (
              <button
                key={type}
                className={`px-4 py-2 rounded-full flex items-center whitespace-nowrap ${
                  activeType === type 
                    ? 'bg-[#0097A7] text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveType(type)}
              >
                <span className="mr-2">{getTypeIcon(type)}</span>
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
          
          {/* Strategy elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {filteredElements.map(element => (
              <div
                key={element.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  element.selected 
                    ? 'border-[#0097A7] bg-[#E0F7FA] shadow-md' 
                    : 'border-gray-200 bg-white hover:border-[#0097A7] hover:shadow-sm'
                }`}
                onClick={() => handleElementToggle(element.id)}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 border flex items-center justify-center mr-3 mt-1 ${
                    element.selected 
                      ? 'bg-[#0097A7] border-[#0097A7] text-white' 
                      : 'border-gray-300'
                  }`}>
                    {element.selected && '✓'}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">{element.title}</h3>
                    <p className="text-sm text-gray-600">{element.description}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add custom strategy element button */}
            <div
              className={`p-4 rounded-lg border border-dashed border-gray-300 transition-all cursor-pointer hover:border-[#0097A7] hover:bg-gray-50 ${
                showCustomForm ? 'hidden' : 'flex'
              } items-center justify-center`}
              onClick={() => setShowCustomForm(true)}
            >
              <div className="text-center">
                <div className="text-2xl text-gray-400 mb-2">+</div>
                <p className="text-sm text-gray-600">Add Custom Strategy Element</p>
              </div>
            </div>
          </div>
          
          {/* Custom strategy element form */}
          {showCustomForm && (
            <div className="bg-white p-4 rounded-lg border border-[#0097A7] mb-6">
              <h3 className="font-medium text-[#0097A7] mb-3">Add Custom Strategy Element</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strategy Title
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097A7]"
                    placeholder="e.g., Customer Loyalty Program"
                    value={customTitle}
                    onChange={handleCustomTitleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strategy Description
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097A7] min-h-[80px]"
                    placeholder="Describe your custom strategy element..."
                    value={customDescription}
                    onChange={handleCustomDescriptionChange}
                  ></textarea>
                </div>
                <div className="flex space-x-3">
                  <button
                    className="px-4 py-2 bg-[#0097A7] text-white rounded-md font-medium hover:bg-[#00838F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddCustomElement}
                    disabled={!customTitle.trim() || !customDescription.trim()}
                  >
                    Add Element
                  </button>
                  <button
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() => setShowCustomForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Selected count and tip */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-start">
            <div className="text-xl mr-3">📋</div>
            <div>
              <p className="text-gray-700">
                <span className="font-medium">{selectedCount} strategy elements selected</span> 
                {selectedCount < 3 && (
                  <span className="text-orange-500"> (we recommend selecting at least 3)</span>
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                The most effective strategies are focused and coherent. Select elements that work well together and directly support your business goal.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        <button
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="px-6 py-2 bg-[#0097A7] text-white rounded-md font-medium hover:bg-[#00838F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleContinue}
          disabled={isLoading || selectedCount === 0}
        >
          Continue to Strategy Assessment
        </button>
      </div>
    </div>
  );
};

export default StrategyDevelopment; 