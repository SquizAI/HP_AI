import React, { useState } from 'react';
import { SocialMediaStrategy, AudienceInsight } from './SocialMediaStrategistMain';

interface AudienceResearchProps {
  state: SocialMediaStrategy;
  updateState: (newState: Partial<SocialMediaStrategy>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Predefined audience segments
const AUDIENCE_SEGMENTS = [
  {
    id: 'young-professionals',
    name: 'Young Professionals',
    icon: '💼',
    demographics: '25-34 years, college educated, urban, early career',
    interests: ['Career development', 'Networking', 'Work-life balance', 'Urban lifestyle', 'Technology'],
    painPoints: ['Time constraints', 'Financial pressure', 'Career advancement', 'Stress management'],
    platforms: ['Instagram', 'LinkedIn', 'TikTok']
  },
  {
    id: 'parents',
    name: 'Parents',
    icon: '👪',
    demographics: '30-45 years, mix of education levels, suburban, family-focused',
    interests: ['Parenting tips', 'Family activities', 'Education', 'Health & wellness', 'Time-saving solutions'],
    painPoints: ['Time management', 'Budget constraints', 'Child safety', 'Work-life balance'],
    platforms: ['Facebook', 'Pinterest', 'YouTube', 'Instagram']
  },
  {
    id: 'executives',
    name: 'Business Executives',
    icon: '👔',
    demographics: '40-55 years, highly educated, urban, high income',
    interests: ['Business strategy', 'Leadership', 'Industry trends', 'Exclusive experiences', 'Wealth management'],
    painPoints: ['Information overload', 'Decision fatigue', 'Maintaining competitive edge', 'Time efficiency'],
    platforms: ['LinkedIn', 'Twitter', 'Facebook']
  },
  {
    id: 'gen-z',
    name: 'Gen Z',
    icon: '🎮',
    demographics: '18-24 years, digital natives, diverse locations, value-driven',
    interests: ['Social causes', 'Digital trends', 'Authentic content', 'Entertainment', 'Self-expression'],
    painPoints: ['Financial uncertainty', 'Mental health', 'Career path anxiety', 'Information authenticity'],
    platforms: ['TikTok', 'Instagram', 'YouTube', 'Twitch']
  },
  {
    id: 'retirees',
    name: 'Retirees & Seniors',
    icon: '🌴',
    demographics: '65+ years, varying education, mix of urban/suburban/rural',
    interests: ['Health & wellness', 'Travel', 'Family connections', 'Hobbies', 'Financial security'],
    painPoints: ['Health concerns', 'Technology learning curve', 'Fixed income management', 'Social isolation'],
    platforms: ['Facebook', 'YouTube', 'Pinterest']
  },
  {
    id: 'small-business',
    name: 'Small Business Owners',
    icon: '🏪',
    demographics: '35-55 years, self-employed, entrepreneurial, varied locations',
    interests: ['Business growth', 'Industry networking', 'Operational efficiency', 'Marketing strategies', 'Work-life balance'],
    painPoints: ['Limited resources', 'Time management', 'Customer acquisition', 'Competitive pressure'],
    platforms: ['LinkedIn', 'Facebook', 'Instagram', 'Twitter']
  }
];

const AudienceResearch: React.FC<AudienceResearchProps> = ({ state, updateState, onNext, onBack }) => {
  const [selectedSegments, setSelectedSegments] = useState<string[]>(
    state.audienceInsights.map(insight => insight.segment)
  );
  const [customSegment, setCustomSegment] = useState<AudienceInsight>({
    segment: '',
    demographics: '',
    interests: [],
    painPoints: [],
    platforms: []
  });
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInterestInput, setCustomInterestInput] = useState('');
  const [customPainPointInput, setCustomPainPointInput] = useState('');
  const [customPlatformInput, setCustomPlatformInput] = useState('');
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  
  // Toggle selection of a predefined segment
  const toggleSegment = (segmentId: string) => {
    if (selectedSegments.includes(segmentId)) {
      setSelectedSegments(selectedSegments.filter(id => id !== segmentId));
    } else {
      setSelectedSegments([...selectedSegments, segmentId]);
    }
  };
  
  // Handle custom segment field changes
  const handleCustomSegmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomSegment({
      ...customSegment,
      [e.target.name]: e.target.value
    });
  };
  
  // Add custom interest to the list
  const addCustomInterest = () => {
    if (customInterestInput.trim()) {
      setCustomSegment({
        ...customSegment,
        interests: [...customSegment.interests, customInterestInput.trim()]
      });
      setCustomInterestInput('');
    }
  };
  
  // Remove a custom interest
  const removeCustomInterest = (index: number) => {
    setCustomSegment({
      ...customSegment,
      interests: customSegment.interests.filter((_, i) => i !== index)
    });
  };
  
  // Add custom pain point to the list
  const addCustomPainPoint = () => {
    if (customPainPointInput.trim()) {
      setCustomSegment({
        ...customSegment,
        painPoints: [...customSegment.painPoints, customPainPointInput.trim()]
      });
      setCustomPainPointInput('');
    }
  };
  
  // Remove a custom pain point
  const removeCustomPainPoint = (index: number) => {
    setCustomSegment({
      ...customSegment,
      painPoints: customSegment.painPoints.filter((_, i) => i !== index)
    });
  };
  
  // Add custom platform to the list
  const addCustomPlatform = () => {
    if (customPlatformInput.trim()) {
      setCustomSegment({
        ...customSegment,
        platforms: [...customSegment.platforms, customPlatformInput.trim()]
      });
      setCustomPlatformInput('');
    }
  };
  
  // Remove a custom platform
  const removeCustomPlatform = (index: number) => {
    setCustomSegment({
      ...customSegment,
      platforms: customSegment.platforms.filter((_, i) => i !== index)
    });
  };
  
  // Submit custom segment
  const handleAddCustomSegment = () => {
    if (customSegment.segment && customSegment.demographics && 
        customSegment.interests.length > 0 && customSegment.platforms.length > 0) {
      setSelectedSegments([...selectedSegments, customSegment.segment]);
      setIsAddingCustom(false);
      // Reset custom segment form
      setCustomSegment({
        segment: '',
        demographics: '',
        interests: [],
        painPoints: [],
        platforms: []
      });
    }
  };
  
  // Generate AI audience analysis
  const generateAudienceAnalysis = () => {
    setIsGeneratingAnalysis(true);
    
    // Simulate API delay (in a real app, this would call an AI service)
    setTimeout(() => {
      setShowAIAnalysis(true);
      setIsGeneratingAnalysis(false);
    }, 2000);
  };
  
  // Complete audience research and move to next step
  const handleContinue = () => {
    // Build audience insights from selected segments
    const audienceInsights: AudienceInsight[] = selectedSegments.map(segmentId => {
      const predefinedSegment = AUDIENCE_SEGMENTS.find(segment => segment.id === segmentId);
      
      if (predefinedSegment) {
        return {
          segment: predefinedSegment.name,
          demographics: predefinedSegment.demographics,
          interests: predefinedSegment.interests,
          painPoints: predefinedSegment.painPoints,
          platforms: predefinedSegment.platforms
        };
      }
      
      // If it's not a predefined segment, it must be a custom one
      // In a real implementation, you'd store and retrieve custom segments
      return {
        segment: segmentId,
        demographics: 'Custom audience demographics',
        interests: ['Interest 1', 'Interest 2'],
        painPoints: ['Pain point 1', 'Pain point 2'],
        platforms: ['Platform 1', 'Platform 2']
      };
    });
    
    // Update the main state with audience insights
    updateState({
      audienceInsights,
      // Extract platforms from audience segments for later use
      targetAudience: audienceInsights.map(insight => insight.segment)
    });
    
    onNext();
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">
          Identify Your Target Audience
        </h2>
        <p className="text-gray-700">
          Understanding who you're trying to reach is critical to creating relevant content and selecting the right platforms.
        </p>
      </div>
      
      {/* Brand Context Reminder */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-8">
        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
          <span className="text-blue-500 mr-2">🏢</span>
          Your Brand Context
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Brand Name:</p>
            <p className="font-medium text-gray-700">{state.brandName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Industry:</p>
            <p className="font-medium text-gray-700">{state.industry}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Brand Personality:</p>
            <p className="font-medium text-gray-700">{state.brandPersonality}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Primary Goals:</p>
            <div className="flex flex-wrap gap-2">
              {state.goals.map((goalId) => (
                <span key={goalId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {goalId}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Audience Segments Selection */}
      {!isAddingCustom && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Select Your Target Audience Segments
            </h3>
            <button
              onClick={() => setIsAddingCustom(true)}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
            >
              + Add Custom Segment
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {AUDIENCE_SEGMENTS.map((segment) => (
              <div
                key={segment.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedSegments.includes(segment.id) 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-200'
                }`}
                onClick={() => toggleSegment(segment.id)}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{segment.icon}</span>
                  <h3 className="font-medium text-gray-800">{segment.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Demographics:</span> {segment.demographics}
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Key Interests:</p>
                    <div className="flex flex-wrap gap-1">
                      {segment.interests.slice(0, 3).map((interest, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {interest}
                        </span>
                      ))}
                      {segment.interests.length > 3 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          +{segment.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Top Platforms:</p>
                    <div className="flex flex-wrap gap-1">
                      {segment.platforms.map((platform, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Custom Audience Form */}
      {isAddingCustom && (
        <div className="mb-8 bg-white p-6 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-blue-800">
              Define Custom Audience Segment
            </h3>
            <button
              onClick={() => setIsAddingCustom(false)}
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              ← Back to Predefined Segments
            </button>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="segment"
                value={customSegment.segment}
                onChange={handleCustomSegmentChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Tech-savvy Millennials"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Demographics <span className="text-red-500">*</span>
              </label>
              <textarea
                name="demographics"
                value={customSegment.demographics}
                onChange={handleCustomSegmentChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-20"
                placeholder="Describe age range, education, location, income level, etc."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interests <span className="text-red-500">*</span>
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={customInterestInput}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Sustainable living"
                />
                <button
                  onClick={addCustomInterest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  disabled={!customInterestInput.trim()}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {customSegment.interests.map((interest, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
                    {interest}
                    <button
                      onClick={() => removeCustomInterest(index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {customSegment.interests.length === 0 && (
                <p className="text-xs text-gray-500">Add at least one interest</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pain Points
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={customPainPointInput}
                  onChange={(e) => setCustomPainPointInput(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Lack of time"
                />
                <button
                  onClick={addCustomPainPoint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  disabled={!customPainPointInput.trim()}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {customSegment.painPoints.map((painPoint, index) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full flex items-center">
                    {painPoint}
                    <button
                      onClick={() => removeCustomPainPoint(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Platforms <span className="text-red-500">*</span>
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={customPlatformInput}
                  onChange={(e) => setCustomPlatformInput(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Instagram"
                />
                <button
                  onClick={addCustomPlatform}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  disabled={!customPlatformInput.trim()}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {customSegment.platforms.map((platform, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                    {platform}
                    <button
                      onClick={() => removeCustomPlatform(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {customSegment.platforms.length === 0 && (
                <p className="text-xs text-gray-500">Add at least one platform</p>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={handleAddCustomSegment}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={
                  !customSegment.segment ||
                  !customSegment.demographics ||
                  customSegment.interests.length === 0 ||
                  customSegment.platforms.length === 0
                }
              >
                Add Custom Segment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Segments Summary */}
      {selectedSegments.length > 0 && !isAddingCustom && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Your Selected Audience Segments
            </h3>
            <button
              onClick={generateAudienceAnalysis}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
              disabled={isGeneratingAnalysis}
            >
              {isGeneratingAnalysis ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>Get AI Audience Analysis</>
              )}
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <ul className="divide-y divide-gray-100">
              {selectedSegments.map((segmentId) => {
                const segment = AUDIENCE_SEGMENTS.find(s => s.id === segmentId);
                return segment ? (
                  <li key={segmentId} className="py-3 flex items-start">
                    <span className="text-2xl mr-3">{segment.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-800">{segment.name}</h4>
                      <p className="text-sm text-gray-600">{segment.demographics}</p>
                    </div>
                    <button
                      onClick={() => toggleSegment(segmentId)}
                      className="ml-auto text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        </div>
      )}
      
      {/* AI Audience Analysis */}
      {showAIAnalysis && selectedSegments.length > 0 && (
        <div className="mb-8 bg-indigo-50 p-6 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center">
            <span className="mr-2">🧠</span>
            AI Audience Analysis
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-indigo-700 mb-2">Cross-Segment Insights</h4>
              <p className="text-gray-700 mb-2">
                Based on your selected audience segments, here are key patterns and opportunities:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Your audiences primarily use <span className="font-medium">Instagram, LinkedIn, and Facebook</span>, making these platforms essential to your strategy.</li>
                <li>Common interests across segments include <span className="font-medium">technology, lifestyle content, and professional development</span>.</li>
                <li>Primary pain points to address include <span className="font-medium">time constraints, information overload, and balancing priorities</span>.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-indigo-700 mb-2">Content Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Create visual tutorials and guides that solve specific pain points</li>
                <li>Develop concise, actionable content that respects your audience's time constraints</li>
                <li>Focus on authentic storytelling that aligns with your brand personality</li>
                <li>Use a mix of educational and entertaining content to engage different segments</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-indigo-700 mb-2">Engagement Opportunities</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Morning (7-9am) and evening (7-10pm) appear to be optimal posting times</li>
                <li>Interactive content like polls and questions will resonate across segments</li>
                <li>Highlight customer stories and testimonials to build trust</li>
                <li>Create segment-specific campaigns for targeted reach</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Pro Tips */}
      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-8">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center">
          <span className="mr-2">💡</span>
          Pro Tips
        </h3>
        <ul className="space-y-1 text-blue-800">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Select 2-3 audience segments to keep your strategy focused and manageable.
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Understanding audience pain points helps create content that solves real problems.
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Different segments may require different content approaches and posting schedules.
          </li>
        </ul>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={selectedSegments.length === 0}
        >
          Continue to Platform Selection
        </button>
      </div>
    </div>
  );
};

export default AudienceResearch; 