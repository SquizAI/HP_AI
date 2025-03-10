import React, { useState, useEffect } from 'react';
import { SocialMediaStrategy } from './SocialMediaStrategistMain';

interface PlatformSelectionProps {
  state: SocialMediaStrategy;
  updateState: (newState: Partial<SocialMediaStrategy>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Platform data with detailed information
const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    description: 'Visual platform ideal for lifestyle, fashion, travel, and food brands. Strong for B2C with younger audiences.',
    demographics: 'Core: 18-34 years, slightly more female users',
    contentTypes: ['Photos', 'Stories', 'Reels', 'Carousels', 'IGTV'],
    bestFor: ['Visual storytelling', 'Brand aesthetics', 'Influencer marketing', 'Product showcases'],
    engagementLevel: 'High',
    timeCommitment: 'Medium-High',
    adOptions: ['Feed ads', 'Story ads', 'Reels ads', 'Shopping ads'],
    difficultyLevel: 'Medium'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    description: 'The largest social network with diverse demographics. Great for community building and local businesses.',
    demographics: 'Wide range, strongest in 25-54 years',
    contentTypes: ['Text posts', 'Images', 'Videos', 'Live streams', 'Stories', 'Groups'],
    bestFor: ['Community building', 'Events', 'Customer service', 'Local business promotion'],
    engagementLevel: 'Medium',
    timeCommitment: 'Medium',
    adOptions: ['Feed ads', 'Story ads', 'Marketplace ads', 'Video ads', 'Carousel ads'],
    difficultyLevel: 'Medium'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    description: 'Fast-paced platform for news, real-time updates, and trending conversations.',
    demographics: 'Core: 25-49 years, slightly more male users',
    contentTypes: ['Tweets (text)', 'Images', 'Short videos', 'Polls', 'Threads'],
    bestFor: ['Real-time updates', 'Customer service', 'Trending topics', 'Industry news'],
    engagementLevel: 'High',
    timeCommitment: 'High (requires frequent posting)',
    adOptions: ['Promoted tweets', 'Trend takeovers', 'Promoted accounts'],
    difficultyLevel: 'Medium-High'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    description: 'Professional network focused on B2B, recruitment, and thought leadership.',
    demographics: 'Core: 25-55 years, professionals, decision-makers',
    contentTypes: ['Articles', 'Text posts', 'Documents', 'Videos', 'Polls'],
    bestFor: ['B2B marketing', 'Thought leadership', 'Recruitment', 'Professional networking'],
    engagementLevel: 'Medium',
    timeCommitment: 'Low-Medium',
    adOptions: ['Sponsored content', 'Message ads', 'Text ads', 'Dynamic ads'],
    difficultyLevel: 'Low-Medium'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    description: 'Entertainment-focused short video platform with high organic reach potential.',
    demographics: 'Core: 16-24 years, Gen Z and young Millennials',
    contentTypes: ['Short videos', 'Live streams', 'Duets', 'Stitches'],
    bestFor: ['Trend participation', 'Authentic content', 'Brand personality', 'Creative challenges'],
    engagementLevel: 'Very High',
    timeCommitment: 'High',
    adOptions: ['In-feed ads', 'TopView ads', 'Branded hashtag challenges', 'Brand effects'],
    difficultyLevel: 'Medium-High'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '🎥',
    description: 'Video platform ideal for tutorials, long-form content, and educational material.',
    demographics: 'Broad reach across all age groups',
    contentTypes: ['Long videos', 'Short videos', 'Live streams', 'Series', 'Tutorials'],
    bestFor: ['Detailed tutorials', 'Product reviews', 'Behind-the-scenes', 'Educational content'],
    engagementLevel: 'Medium-High',
    timeCommitment: 'High',
    adOptions: ['Display ads', 'Overlay ads', 'Skippable video ads', 'Non-skippable video ads'],
    difficultyLevel: 'High'
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    description: 'Visual discovery platform for ideas, products, and inspiration.',
    demographics: 'Core: 25-44 years, predominantly female users',
    contentTypes: ['Pins (images)', 'Product pins', 'Video pins', 'Story pins'],
    bestFor: ['DIY/crafts', 'Home decor', 'Fashion', 'Food', 'Product discovery'],
    engagementLevel: 'Medium',
    timeCommitment: 'Low-Medium',
    adOptions: ['Standard pins', 'Shopping ads', 'Carousel ads', 'Video ads'],
    difficultyLevel: 'Low-Medium'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: '🤖',
    description: 'Community-driven platform organized by specific interest areas.',
    demographics: 'Core: 18-29 years, predominantly male users',
    contentTypes: ['Text posts', 'Images', 'Videos', 'Polls', 'AMAs'],
    bestFor: ['Niche communities', 'Direct feedback', 'Authentic engagement', 'Technical audiences'],
    engagementLevel: 'High',
    timeCommitment: 'Medium-High',
    adOptions: ['Promoted posts', 'Display ads', 'Trending takeovers'],
    difficultyLevel: 'High'
  }
];

const PlatformSelection: React.FC<PlatformSelectionProps> = ({ state, updateState, onNext, onBack }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(state.selectedPlatforms || []);
  const [platformPriorities, setPlatformPriorities] = useState<{[key: string]: number}>({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [customPlatformName, setCustomPlatformName] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  
  // Initial recommendation based on brand info and audience
  useEffect(() => {
    // This would normally be an API call to an AI service
    // For demo purposes, we're using a simple algorithm to recommend platforms
    const recommendPlatforms = () => {
      let recommendedPlatforms: string[] = [];
      
      // Check industry type
      if (state.industry) {
        const industry = state.industry.toLowerCase();
        
        if (industry.includes('fashion') || industry.includes('beauty') || industry.includes('food') || industry.includes('travel')) {
          recommendedPlatforms.push('instagram', 'pinterest');
        }
        
        if (industry.includes('tech') || industry.includes('software') || industry.includes('b2b')) {
          recommendedPlatforms.push('linkedin', 'twitter');
        }
        
        if (industry.includes('education') || industry.includes('tutorial')) {
          recommendedPlatforms.push('youtube');
        }
        
        if (industry.includes('entertainment') || industry.includes('music') || industry.includes('creative')) {
          recommendedPlatforms.push('tiktok', 'instagram');
        }
      }
      
      // Check audience demographics
      const targetAudiences = state.targetAudience || [];
      
      if (targetAudiences.some(a => a.toLowerCase().includes('young') || a.toLowerCase().includes('gen z'))) {
        if (!recommendedPlatforms.includes('tiktok')) recommendedPlatforms.push('tiktok');
        if (!recommendedPlatforms.includes('instagram')) recommendedPlatforms.push('instagram');
      }
      
      if (targetAudiences.some(a => a.toLowerCase().includes('professional') || a.toLowerCase().includes('business'))) {
        if (!recommendedPlatforms.includes('linkedin')) recommendedPlatforms.push('linkedin');
      }
      
      if (targetAudiences.some(a => a.toLowerCase().includes('parent') || a.toLowerCase().includes('family'))) {
        if (!recommendedPlatforms.includes('facebook')) recommendedPlatforms.push('facebook');
        if (!recommendedPlatforms.includes('pinterest')) recommendedPlatforms.push('pinterest');
      }
      
      // If no specific recommendations, suggest general platforms
      if (recommendedPlatforms.length === 0) {
        recommendedPlatforms = ['instagram', 'facebook'];
      }
      
      // Limit to top 3
      return recommendedPlatforms.slice(0, 3);
    };
    
    setRecommendations(recommendPlatforms());
  }, [state.industry, state.targetAudience]);
  
  // Toggle platform selection
  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(id => id !== platformId));
      
      // Also remove from priorities
      const newPriorities = {...platformPriorities};
      delete newPriorities[platformId];
      setPlatformPriorities(newPriorities);
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
      
      // Set default priority
      setPlatformPriorities({
        ...platformPriorities,
        [platformId]: selectedPlatforms.length + 1
      });
    }
  };
  
  // Handle priority change
  const handlePriorityChange = (platformId: string, priority: number) => {
    setPlatformPriorities({
      ...platformPriorities,
      [platformId]: priority
    });
  };
  
  // Generate AI recommendations
  const generateRecommendations = () => {
    setIsGeneratingRecommendations(true);
    
    // Simulate API delay
    setTimeout(() => {
      setShowRecommendations(true);
      setIsGeneratingRecommendations(false);
    }, 2000);
  };
  
  // Add custom platform
  const handleAddCustomPlatform = () => {
    if (customPlatformName.trim()) {
      const customId = 'custom-' + customPlatformName.toLowerCase().replace(/\s+/g, '-');
      togglePlatform(customId);
      setCustomPlatformName('');
      setIsAddingCustom(false);
    }
  };
  
  // Continue to next step
  const handleContinue = () => {
    // Sort platforms by priority
    const prioritizedPlatforms = [...selectedPlatforms].sort((a, b) => 
      (platformPriorities[a] || 999) - (platformPriorities[b] || 999)
    );
    
    updateState({
      selectedPlatforms: prioritizedPlatforms,
      platformPriorities: platformPriorities
    });
    
    onNext();
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-2">
          Select Your Social Media Platforms
        </h2>
        <p className="text-gray-700">
          Choose the platforms that align with your brand personality, goals, and where your audience is most active.
        </p>
      </div>
      
      {/* Audience and Brand Reminder */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-8">
        <h3 className="font-medium text-gray-800 mb-3">Your Strategy Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Brand Personality:</p>
            <p className="font-medium text-gray-700">{state.brandPersonality || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Target Audience:</p>
            <div className="flex flex-wrap gap-2">
              {state.targetAudience && state.targetAudience.length > 0 ? (
                state.targetAudience.map((audience, index) => (
                  <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    {audience}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No audience segments selected</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Recommendations */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Platform Recommendations
          </h3>
          <button
            onClick={generateRecommendations}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
            disabled={isGeneratingRecommendations}
          >
            {isGeneratingRecommendations ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>Detailed Analysis</>
            )}
          </button>
        </div>
        
        {/* Simple recommendations (always visible) */}
        <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200 mb-4">
          <p className="text-gray-700 mb-3">
            Based on your brand and audience, these platforms may be a good fit:
          </p>
          <div className="flex flex-wrap gap-3">
            {recommendations.map(platformId => {
              const platform = PLATFORMS.find(p => p.id === platformId);
              return platform ? (
                <div 
                  key={platform.id}
                  className={`flex items-center px-4 py-2 rounded-full cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <span className="mr-2">{platform.icon}</span>
                  {platform.name}
                </div>
              ) : null;
            })}
          </div>
        </div>
        
        {/* Detailed AI analysis */}
        {showRecommendations && (
          <div className="bg-white p-5 rounded-lg border border-indigo-200 mb-4">
            <h3 className="font-medium text-indigo-800 mb-3 flex items-center">
              <span className="mr-2">🧠</span>
              Detailed Platform Analysis
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-indigo-700 mb-1">Primary Recommendation</h4>
                <p className="text-gray-700 mb-2">
                  Based on your brand personality ({state.brandPersonality}) and audience segments, we recommend:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mb-3">
                  {recommendations.map(platformId => {
                    const platform = PLATFORMS.find(p => p.id === platformId);
                    return platform ? (
                      <li key={platform.id}>
                        <span className="font-medium">{platform.icon} {platform.name}</span>: {platform.bestFor.slice(0, 2).join(', ')}
                      </li>
                    ) : null;
                  })}
                </ul>
                <p className="text-gray-600 text-sm italic">
                  We suggest focusing on 2-3 platforms for an effective strategy, rather than spreading resources too thin.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-indigo-700 mb-1">Content Alignment</h4>
                <p className="text-gray-700 mb-1">
                  Your brand traits align well with these content types:
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Visual storytelling</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Behind-the-scenes</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Educational content</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Community engagement</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-indigo-700 mb-1">Platform Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-indigo-50">
                        <th className="px-4 py-2 text-left">Platform</th>
                        <th className="px-4 py-2 text-left">Time Required</th>
                        <th className="px-4 py-2 text-left">Difficulty</th>
                        <th className="px-4 py-2 text-left">Audience Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recommendations.map(platformId => {
                        const platform = PLATFORMS.find(p => p.id === platformId);
                        return platform ? (
                          <tr key={platform.id}>
                            <td className="px-4 py-3">{platform.icon} {platform.name}</td>
                            <td className="px-4 py-3">{platform.timeCommitment}</td>
                            <td className="px-4 py-3">{platform.difficultyLevel}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: (platformId === recommendations[0] ? '90%' : platformId === recommendations[1] ? '75%' : '60%') }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs text-gray-600">
                                  {platformId === recommendations[0] ? 'High' : platformId === recommendations[1] ? 'Medium' : 'Fair'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : null;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Platform Selection */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            All Available Platforms
          </h3>
          <button
            onClick={() => setIsAddingCustom(true)}
            className="px-3 py-1 text-sm text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 transition-colors"
          >
            + Add Custom Platform
          </button>
        </div>
        
        {isAddingCustom && (
          <div className="bg-white p-4 rounded-lg border border-indigo-200 mb-4">
            <h4 className="font-medium text-indigo-800 mb-3">Add Custom Platform</h4>
            <div className="flex items-center">
              <input
                type="text"
                value={customPlatformName}
                onChange={(e) => setCustomPlatformName(e.target.value)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Threads, Bluesky, etc."
              />
              <button
                onClick={handleAddCustomPlatform}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                disabled={!customPlatformName.trim()}
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingCustom(false)}
                className="ml-2 px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLATFORMS.map(platform => (
            <div
              key={platform.id}
              className={`p-4 border rounded-lg transition-all cursor-pointer ${
                selectedPlatforms.includes(platform.id)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => togglePlatform(platform.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{platform.icon}</span>
                  <h3 className="font-medium text-gray-800">{platform.name}</h3>
                </div>
                {selectedPlatforms.includes(platform.id) && (
                  <div className="flex items-center">
                    <label className="text-xs text-gray-500 mr-2">Priority:</label>
                    <select
                      value={platformPriorities[platform.id] || 999}
                      onChange={(e) => handlePriorityChange(platform.id, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()} // Prevent toggling when clicking on select
                      className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                    >
                      {selectedPlatforms.map((_, index) => (
                        <option key={index} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {platform.description}
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Best For:</p>
                  <div className="flex flex-wrap gap-1">
                    {platform.bestFor.slice(0, 3).map((use, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {use}
                      </span>
                    ))}
                    {platform.bestFor.length > 3 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        +{platform.bestFor.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Demographics:</p>
                  <p className="text-xs text-gray-600">{platform.demographics}</p>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Time: {platform.timeCommitment}</span>
                  <span>Engagement: {platform.engagementLevel}</span>
                  <span>Difficulty: {platform.difficultyLevel}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Custom platforms */}
          {selectedPlatforms
            .filter(id => id.startsWith('custom-'))
            .map(platformId => (
              <div
                key={platformId}
                className="p-4 border border-indigo-500 bg-indigo-50 rounded-lg"
                onClick={() => togglePlatform(platformId)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🌐</span>
                    <h3 className="font-medium text-gray-800">
                      {platformId.replace('custom-', '').replace(/-/g, ' ')}
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <label className="text-xs text-gray-500 mr-2">Priority:</label>
                    <select
                      value={platformPriorities[platformId] || 999}
                      onChange={(e) => handlePriorityChange(platformId, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()} // Prevent toggling when clicking on select
                      className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                    >
                      {selectedPlatforms.map((_, index) => (
                        <option key={index} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Custom platform added by user
                </p>
              </div>
            ))}
        </div>
      </div>
      
      {/* Summary of Selected Platforms */}
      {selectedPlatforms.length > 0 && (
        <div className="mb-8 bg-white p-5 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-3">
            Your Selected Platforms ({selectedPlatforms.length})
          </h3>
          
          <div className="space-y-3">
            {[...selectedPlatforms]
              .sort((a, b) => (platformPriorities[a] || 999) - (platformPriorities[b] || 999))
              .map(platformId => {
                const platform = PLATFORMS.find(p => p.id === platformId);
                const isCustom = platformId.startsWith('custom-');
                
                return (
                  <div key={platformId} className="flex items-center justify-between p-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 mr-3">
                        {platformPriorities[platformId] || '?'}
                      </div>
                      {isCustom ? (
                        <span className="font-medium text-gray-800">
                          {platformId.replace('custom-', '').replace(/-/g, ' ')}
                        </span>
                      ) : platform ? (
                        <span className="font-medium text-gray-800">
                          {platform.icon} {platform.name}
                        </span>
                      ) : null}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlatform(platformId);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      
      {/* Pro Tips */}
      <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100 mb-8">
        <h3 className="font-medium text-indigo-800 mb-2 flex items-center">
          <span className="mr-2">💡</span>
          Pro Tips
        </h3>
        <ul className="space-y-1 text-indigo-800">
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            Focus on 2-3 platforms maximum for a focused, effective strategy.
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            Prioritize platforms where your audience is most active and engaged.
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            Consider your content creation capacity when selecting platforms.
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
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          disabled={selectedPlatforms.length === 0}
        >
          Continue to Content Planning
        </button>
      </div>
    </div>
  );
};

export default PlatformSelection; 