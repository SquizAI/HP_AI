import React, { useState, useEffect, useRef } from 'react';
import { BizStrategyState } from './BizStrategistMain';

interface StrategyAssessmentProps {
  state: BizStrategyState;
  updateState: (newState: Partial<BizStrategyState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Mock AI analysis types
interface StrengthWeakness {
  point: string;
  explanation: string;
}

interface StrategyAlternative {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

interface RiskOpportunity {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
}

interface AIStrategyAnalysis {
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

// Mock function to generate AI analysis
const generateStrategyAnalysis = (state: BizStrategyState): Promise<AIStrategyAnalysis> => {
  // In a real implementation, this would call an AI API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a score between 65-95
      const overallScore = Math.floor(Math.random() * 31) + 65;
      const cohesionScore = Math.floor(Math.random() * 31) + 65;
      const feasibilityScore = Math.floor(Math.random() * 31) + 65;
      const innovationScore = Math.floor(Math.random() * 31) + 65;
      
      // Basic analysis based on selected elements
      const selectedCount = state.strategyElements.length;
      let summary = '';
      
      if (selectedCount <= 3) {
        summary = `Your strategy for ${state.businessGoal} in the ${state.industryContext} industry is focused but may benefit from considering additional strategic elements. The ${selectedCount} elements you've selected form a solid foundation, but a more comprehensive approach could help address potential blind spots.`;
      } else if (selectedCount <= 5) {
        summary = `You've developed a well-balanced strategy for ${state.businessGoal} in the ${state.industryContext} industry. With ${selectedCount} strategic elements, you've created a focused yet comprehensive approach that addresses key aspects of your business goals while maintaining feasibility.`;
      } else {
        summary = `Your strategy for ${state.businessGoal} in the ${state.industryContext} industry is comprehensive, covering ${selectedCount} strategic elements. While this provides broad coverage, consider prioritizing these elements to ensure focus and avoid spreading resources too thin during implementation.`;
      }
      
      // Example strengths and weaknesses
      const strengths: StrengthWeakness[] = [
        {
          point: "Strategic Alignment",
          explanation: `Your selected elements align well with your goal to ${state.businessGoal.toLowerCase()} in the ${state.industryContext} industry.`
        },
        {
          point: "Balance of Short and Long-term Thinking",
          explanation: "Your strategy balances immediate business needs with longer-term strategic positioning."
        }
      ];
      
      const weaknesses: StrengthWeakness[] = [
        {
          point: "Resource Intensity",
          explanation: "Implementing all selected elements simultaneously may strain resources. Consider a phased approach."
        }
      ];
      
      if (state.strategyElements.includes("Value Proposition Refinement")) {
        strengths.push({
          point: "Strong Customer Focus",
          explanation: "Your emphasis on value proposition refinement puts customer needs at the center of your strategy."
        });
      } else {
        weaknesses.push({
          point: "Limited Customer Perspective",
          explanation: "Consider adding elements that strengthen your value proposition from the customer's perspective."
        });
      }
      
      if (state.strategyElements.includes("Technology Integration Plan") || 
          state.strategyElements.includes("Digital Transformation Roadmap")) {
        strengths.push({
          point: "Tech-Forward Approach",
          explanation: "Your strategy appropriately recognizes the importance of technology in modern business success."
        });
      } else if (state.industryContext.toLowerCase().includes('tech')) {
        weaknesses.push({
          point: "Insufficient Tech Focus",
          explanation: "Given your industry, your strategy would benefit from stronger technology integration elements."
        });
      }
      
      // Risks and opportunities
      const risks: RiskOpportunity[] = [
        {
          title: "Execution Complexity",
          description: "The breadth of your strategy may create implementation challenges that could delay results.",
          impact: "medium",
          probability: "medium"
        },
        {
          title: "Market Shifts",
          description: "Rapid changes in the market may require strategy adjustments during implementation.",
          impact: "high",
          probability: "medium"
        }
      ];
      
      const opportunities: RiskOpportunity[] = [
        {
          title: "Competitive Differentiation",
          description: "Successfully executing this strategy could create meaningful differentiation from competitors.",
          impact: "high",
          probability: "medium"
        },
        {
          title: "Organizational Learning",
          description: "This strategic approach will build capabilities that can be leveraged for future initiatives.",
          impact: "medium",
          probability: "high"
        }
      ];
      
      // Strategic alternatives
      const alternatives: StrategyAlternative[] = [
        {
          title: "Phased Implementation Approach",
          description: "Rather than pursuing all strategic elements simultaneously, consider a phased approach that prioritizes elements with the highest impact-to-effort ratio first.",
          pros: ["Reduces resource strain", "Allows for learning and adjustment", "Delivers quicker wins"],
          cons: ["May delay full strategy benefits", "Requires more complex planning"]
        },
        {
          title: "Partnership-Focused Execution",
          description: "Consider leveraging strategic partnerships to execute elements that aren't core to your business strengths.",
          pros: ["Reduces internal resource requirements", "Brings in specialized expertise", "Can accelerate implementation"],
          cons: ["Introduces dependency on external parties", "Requires strong partnership management"]
        }
      ];
      
      // Execution tips
      const executionTips = [
        "Develop clear metrics for each strategic element to track progress and impact.",
        "Create a communication plan to ensure all stakeholders understand the strategy and their role in execution.",
        "Schedule regular strategy review sessions to assess progress and make necessary adjustments.",
        "Identify potential barriers to implementation early and develop mitigation plans."
      ];
      
      const analysis: AIStrategyAnalysis = {
        overallScore,
        cohesionScore,
        feasibilityScore,
        innovationScore,
        summary,
        strengths,
        weaknesses,
        risks,
        opportunities,
        alternatives,
        executionTips
      };
      
      resolve(analysis);
    }, 2000);
  });
};

const StrategyAssessment: React.FC<StrategyAssessmentProps> = ({ state, updateState, onNext, onBack }) => {
  const [analysis, setAnalysis] = useState<AIStrategyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths' | 'risks' | 'alternatives' | 'execution'>('overview');
  const [userNotes, setUserNotes] = useState<string>(state.assessmentNotes || '');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Generate AI analysis on component mount
  useEffect(() => {
    if (state.analysis) {
      setAnalysis(state.analysis);
      setIsLoading(false);
    } else {
      generateStrategyAnalysis(state)
        .then(result => {
          setAnalysis(result);
          updateState({ analysis: result });
          setIsLoading(false);
        });
    }
  }, []);

  // Save notes periodically
  useEffect(() => {
    const saveNotes = () => {
      if (userNotes !== state.assessmentNotes) {
        updateState({ assessmentNotes: userNotes });
        setSaveStatus('Notes saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    };

    const interval = setInterval(saveNotes, 5000);
    return () => clearInterval(interval);
  }, [userNotes, state.assessmentNotes, updateState]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserNotes(e.target.value);
    setSaveStatus('');
  };

  const handleSaveNotes = () => {
    updateState({ assessmentNotes: userNotes });
    setSaveStatus('Notes saved');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleComplete = () => {
    updateState({ assessmentNotes: userNotes });
    onNext();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactProbabilityColor = (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-[#E0F7FA] to-[#E0F2F1] p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-[#0097A7]">
          AI Strategy Assessment
        </h2>
        <p className="text-gray-700 mt-2">
          Our AI has analyzed your strategy for {state.businessGoal} in the {state.industryContext} industry.
          Review the assessment, consider alternatives, and prepare for implementation.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-[#0097A7] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Our AI is analyzing your strategy...</p>
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex overflow-x-auto space-x-1 mb-6 border-b">
              <button
                className={`px-4 py-2 whitespace-nowrap ${
                  activeTab === 'overview' 
                    ? 'border-b-2 border-[#0097A7] text-[#0097A7] font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-4 py-2 whitespace-nowrap ${
                  activeTab === 'strengths' 
                    ? 'border-b-2 border-[#0097A7] text-[#0097A7] font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('strengths')}
              >
                Strengths & Weaknesses
              </button>
              <button
                className={`px-4 py-2 whitespace-nowrap ${
                  activeTab === 'risks' 
                    ? 'border-b-2 border-[#0097A7] text-[#0097A7] font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('risks')}
              >
                Risks & Opportunities
              </button>
              <button
                className={`px-4 py-2 whitespace-nowrap ${
                  activeTab === 'alternatives' 
                    ? 'border-b-2 border-[#0097A7] text-[#0097A7] font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('alternatives')}
              >
                Alternatives
              </button>
              <button
                className={`px-4 py-2 whitespace-nowrap ${
                  activeTab === 'execution' 
                    ? 'border-b-2 border-[#0097A7] text-[#0097A7] font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('execution')}
              >
                Execution Tips
              </button>
            </div>
            
            {/* Tab content */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Strategy Assessment</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}/100
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.cohesionScore)}`}>
                        {analysis.cohesionScore}/100
                      </div>
                      <div className="text-sm text-gray-600">Cohesion</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.feasibilityScore)}`}>
                        {analysis.feasibilityScore}/100
                      </div>
                      <div className="text-sm text-gray-600">Feasibility</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.innovationScore)}`}>
                        {analysis.innovationScore}/100
                      </div>
                      <div className="text-sm text-gray-600">Innovation</div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                    <p className="text-gray-700">{analysis.summary}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="text-blue-500 text-xl mr-3">💡</div>
                      <div>
                        <h4 className="font-medium text-blue-700 mb-1">AI Insight</h4>
                        <p className="text-blue-800 text-sm">
                          The most successful business strategies balance ambition with realism. Your strategy shows good 
                          potential, but remember that execution is where many strategies fail. Focus on clear ownership, 
                          measurable milestones, and regular progress reviews to maximize your chances of success.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'strengths' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Strengths & Weaknesses</h3>
                  <div className="mb-6">
                    <h4 className="font-medium text-green-600 flex items-center mb-3">
                      <span className="mr-2">💪</span> Strengths
                    </h4>
                    <div className="space-y-4">
                      {analysis.strengths.map((strength, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-1">{strength.point}</h5>
                          <p className="text-green-700 text-sm">{strength.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 flex items-center mb-3">
                      <span className="mr-2">⚠️</span> Weaknesses
                    </h4>
                    <div className="space-y-4">
                      {analysis.weaknesses.map((weakness, index) => (
                        <div key={index} className="bg-orange-50 p-4 rounded-lg">
                          <h5 className="font-medium text-orange-800 mb-1">{weakness.point}</h5>
                          <p className="text-orange-700 text-sm">{weakness.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'risks' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Risks & Opportunities</h3>
                  <div className="mb-6">
                    <h4 className="font-medium text-red-600 flex items-center mb-3">
                      <span className="mr-2">🚨</span> Risks
                    </h4>
                    <div className="space-y-4">
                      {analysis.risks.map((risk, index) => (
                        <div key={index} className="bg-red-50 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <h5 className="font-medium text-red-800">{risk.title}</h5>
                            <div className="flex space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getImpactProbabilityColor(risk.impact)}`}>
                                Impact: {risk.impact}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getImpactProbabilityColor(risk.probability)}`}>
                                Probability: {risk.probability}
                              </span>
                            </div>
                          </div>
                          <p className="text-red-700 text-sm">{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-indigo-600 flex items-center mb-3">
                      <span className="mr-2">✨</span> Opportunities
                    </h4>
                    <div className="space-y-4">
                      {analysis.opportunities.map((opportunity, index) => (
                        <div key={index} className="bg-indigo-50 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <h5 className="font-medium text-indigo-800">{opportunity.title}</h5>
                            <div className="flex space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getImpactProbabilityColor(opportunity.impact)}`}>
                                Impact: {opportunity.impact}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getImpactProbabilityColor(opportunity.probability)}`}>
                                Probability: {opportunity.probability}
                              </span>
                            </div>
                          </div>
                          <p className="text-indigo-700 text-sm">{opportunity.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'alternatives' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Strategic Alternatives</h3>
                  <p className="text-gray-600 mb-4">
                    Consider these alternative approaches that might complement or enhance your strategy.
                  </p>
                  <div className="space-y-6">
                    {analysis.alternatives.map((alternative, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">{alternative.title}</h4>
                        <p className="text-gray-700 mb-3">{alternative.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-green-600 mb-2">Pros</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {alternative.pros.map((pro, proIndex) => (
                                <li key={proIndex} className="text-sm text-gray-600">{pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-red-600 mb-2">Cons</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {alternative.cons.map((con, conIndex) => (
                                <li key={conIndex} className="text-sm text-gray-600">{con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'execution' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Execution Tips</h3>
                  <p className="text-gray-600 mb-4">
                    Use these tips to improve your chances of successful strategy implementation.
                  </p>
                  <div className="bg-yellow-50 p-5 rounded-lg mb-6">
                    <div className="flex">
                      <div className="text-yellow-600 text-xl mr-3">⚡</div>
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-2">Pro Tip</h4>
                        <p className="text-yellow-700 text-sm">
                          Only 30% of strategies are successfully executed. The difference between success and failure 
                          often comes down to clarity of goals, ownership of action items, and consistent follow-through.
                        </p>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {analysis.executionTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <div className="text-[#0097A7] mr-3">✓</div>
                        <p className="text-gray-700">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Your Strategy Notes</h3>
              <p className="text-gray-600 text-sm mb-4">
                Use this space to record your thoughts on the assessment and how you plan to implement your strategy.
              </p>
              <textarea
                ref={notesRef}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097A7] min-h-[250px]"
                placeholder="Record your thoughts here..."
                value={userNotes}
                onChange={handleNotesChange}
              ></textarea>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-green-600">{saveStatus}</span>
                <button
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  onClick={handleSaveNotes}
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Unable to generate analysis. Please try again.
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
          onClick={handleComplete}
        >
          Complete Challenge
        </button>
      </div>
    </div>
  );
};

export default StrategyAssessment; 