import React, { useState, useEffect } from 'react';
import { BizStrategyState } from './BizStrategistMain';

interface MarketAnalysisProps {
  state: BizStrategyState;
  updateState: (newState: Partial<BizStrategyState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// This would normally be fetched from an API, but for simplicity we'll define it here
const generateMarketAnalysis = (industry: string, businessGoal: string, businessType: string): string => {
  // In a real implementation, this would be fetched from the OpenAI API
  return `# Market Analysis for ${businessGoal} in ${industry}

## Industry Overview
The ${industry} industry is currently experiencing significant transformation due to technological advancements, changing consumer preferences, and evolving regulatory landscapes. ${businessType} businesses need to adapt to these changes to remain competitive.

## Key Market Trends
1. **Digital Transformation**: Companies are increasingly adopting digital technologies to streamline operations and enhance customer experiences.
2. **Sustainability Focus**: Growing consumer and regulatory pressure for environmentally sustainable practices.
3. **Personalization**: Customers expect tailored products and services that meet their specific needs.

## Competitive Landscape
- **Market Leaders**: Established players with strong brand recognition and extensive resources
- **Emerging Disruptors**: Innovative startups leveraging new technologies to challenge traditional models
- **Adjacent Competitors**: Companies from related industries expanding into this space

## Market Opportunities
- Underserved customer segments seeking specialized solutions
- Growing demand for integrated, end-to-end solutions
- International markets with similar needs but less competitive saturation

## Potential Threats
- Rapidly changing technology landscape requiring continuous adaptation
- Increasing regulatory scrutiny and compliance requirements
- Economic uncertainty affecting customer spending patterns

## SWOT Analysis for ${businessType} in ${industry}
- **Strengths**: Agility, specialized expertise, innovative approaches
- **Weaknesses**: Limited resources, smaller market reach, less established brand
- **Opportunities**: Niche market segments, strategic partnerships, technology leverage
- **Threats**: Larger competitors, market volatility, customer acquisition challenges`;
};

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ state, updateState, onNext, onBack }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisGenerated, setAnalysisGenerated] = useState<boolean>(false);
  const [marketAnalysis, setMarketAnalysis] = useState<string>(state.marketAnalysis || '');
  const [userInput, setUserInput] = useState<string>('');

  // Generate analysis when component mounts if we don't already have one
  useEffect(() => {
    if (!state.marketAnalysis && state.businessGoal && state.industryContext) {
      generateAnalysis();
    } else if (state.marketAnalysis) {
      setAnalysisGenerated(true);
      setMarketAnalysis(state.marketAnalysis);
    }
  }, []);

  const generateAnalysis = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an API
      setTimeout(() => {
        const analysis = generateMarketAnalysis(
          state.industryContext,
          state.businessGoal,
          state.businessType
        );
        
        setMarketAnalysis(analysis);
        updateState({ marketAnalysis: analysis });
        setAnalysisGenerated(true);
        setIsLoading(false);
      }, 1500); // Simulate API delay
    } catch (error) {
      console.error('Error generating market analysis:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const handleAddToAnalysis = () => {
    if (!userInput.trim()) return;
    
    const updatedAnalysis = `${marketAnalysis}\n\n## Additional Insights (User Added)\n${userInput}`;
    setMarketAnalysis(updatedAnalysis);
    updateState({ marketAnalysis: updatedAnalysis });
    setUserInput('');
  };

  const handleRegenerateAnalysis = () => {
    generateAnalysis();
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-[#E0F7FA] to-[#E0F2F1] p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-[#0097A7]">
          Market Analysis for {state.businessGoal}
        </h2>
        <p className="text-gray-700 mt-2">
          Understanding the market landscape is crucial for developing an effective strategy.
          Review the analysis below and add your own insights if needed.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-[#0097A7] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Analyzing market trends and competitive landscape...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {analysisGenerated && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-800">
                  Market Analysis Report
                </h3>
                <button
                  className="text-[#0097A7] hover:text-[#00838F] text-sm font-medium"
                  onClick={handleRegenerateAnalysis}
                >
                  Regenerate Analysis
                </button>
              </div>
              <div className="p-4">
                <div className="prose max-w-none">
                  {marketAnalysis.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-semibold mt-4 mb-2">{line.substring(3)}</h2>;
                    } else if (line.startsWith('- ')) {
                      return <li key={index} className="ml-4">{line.substring(2)}</li>;
                    } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                      return <div key={index} className="ml-4 mb-1">{line}</div>;
                    } else if (line === '') {
                      return <br key={index} />;
                    } else {
                      return <p key={index} className="mb-2">{line}</p>;
                    }
                  })}
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">
              Add Your Own Market Insights
            </h3>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#0097A7] min-h-[100px]"
              placeholder="Share your own insights about the market, competitors, or industry trends..."
              value={userInput}
              onChange={handleInputChange}
            ></textarea>
            <div className="flex justify-end mt-2">
              <button
                className="px-4 py-2 bg-[#0097A7] text-white rounded-md font-medium hover:bg-[#00838F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToAnalysis}
                disabled={!userInput.trim()}
              >
                Add to Analysis
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="mr-2">💡</span> Pro Tip
            </h3>
            <p className="text-blue-700">
              A good market analysis considers both external factors (market size, trends, competition) and internal factors (your strengths, weaknesses, unique value proposition). Add any specific insights about your position in the market!
            </p>
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
          className="px-6 py-2 bg-[#0097A7] text-white rounded-md font-medium hover:bg-[#00838F] transition-colors"
          onClick={onNext}
          disabled={isLoading || !analysisGenerated}
        >
          Continue to Strategy Development
        </button>
      </div>
    </div>
  );
};

export default MarketAnalysis; 