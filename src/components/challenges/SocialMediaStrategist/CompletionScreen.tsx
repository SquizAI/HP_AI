import React, { useEffect, useState } from 'react';
import { SocialMediaStrategy } from './SocialMediaStrategistMain';

interface CompletionScreenProps {
  state: SocialMediaStrategy;
  onRestart: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ state, onRestart }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    // Trigger confetti animation on component mount
    setShowConfetti(true);
    
    // Clean up confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Helper to get platform name from ID
  const getPlatformName = (platformId: string) => {
    if (platformId.startsWith('custom-')) {
      return platformId.replace('custom-', '').replace(/-/g, ' ');
    }
    
    const platformNames: {[key: string]: string} = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      pinterest: 'Pinterest',
      reddit: 'Reddit'
    };
    
    return platformNames[platformId] || platformId;
  };
  
  // Get top content themes from content calendar
  const getTopContentThemes = () => {
    if (!state.contentCalendar || state.contentCalendar.length === 0) {
      return ['No content themes defined'];
    }
    
    const themeCount: {[key: string]: number} = {};
    
    state.contentCalendar.forEach(item => {
      themeCount[item.topic] = (themeCount[item.topic] || 0) + 1;
    });
    
    return Object.entries(themeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme]) => theme);
  };
  
  // Get strategy rating based on completeness
  const getStrategyRating = () => {
    let score = 0;
    
    // Brand details
    if (state.brandName && state.industry && state.description) score += 20;
    
    // Audience definition
    if (state.audienceInsights && state.audienceInsights.length > 0) score += 20;
    
    // Platform selection
    if (state.selectedPlatforms && state.selectedPlatforms.length > 0) {
      score += Math.min(20, state.selectedPlatforms.length * 5);
    }
    
    // Content planning
    if (state.contentCalendar && state.contentCalendar.length > 0) {
      score += Math.min(40, state.contentCalendar.length * 5);
    }
    
    // Cap at 100
    return Math.min(100, score);
  };
  
  const strategyRating = getStrategyRating();
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="confetti-container">
            {Array.from({ length: 150 }).map((_, i) => (
              <div 
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-lg text-white text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Congratulations! 🎉</h1>
        <p className="text-xl">
          You've completed your social media strategy for {state.brandName || 'your brand'}
        </p>
      </div>
      
      {/* Strategy Summary Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Your Strategy Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Brand Profile</h3>
            <div className="space-y-2">
              <p><span className="font-medium text-gray-600">Brand Name:</span> {state.brandName}</p>
              <p><span className="font-medium text-gray-600">Industry:</span> {state.industry}</p>
              <p><span className="font-medium text-gray-600">Personality:</span> {state.brandPersonality}</p>
              <div>
                <p className="font-medium text-gray-600">Key Brand Traits:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {state.brandPersonalityTraits.map((trait, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Audience Segments</h3>
            {state.audienceInsights && state.audienceInsights.length > 0 ? (
              <div className="space-y-3">
                {state.audienceInsights.map((insight, index) => (
                  <div key={index} className="p-2 bg-blue-50 border border-blue-100 rounded">
                    <p className="font-medium text-blue-800">{insight.segment}</p>
                    <p className="text-sm text-gray-600">{insight.demographics}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No audience insights defined</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Platform Strategy</h3>
          
          {state.selectedPlatforms && state.selectedPlatforms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {state.selectedPlatforms.map((platformId, index) => {
                const contentItems = state.contentCalendar.filter(item => item.platform === platformId);
                const platformName = getPlatformName(platformId);
                
                return (
                  <div key={platformId} className="p-3 bg-gray-50 border border-gray-200 rounded">
                    <div className="font-medium text-gray-800 mb-1">{index + 1}. {platformName}</div>
                    <p className="text-sm text-gray-600 mb-1">
                      {contentItems.length} content items planned
                    </p>
                    {contentItems.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Top content type: {
                          Object.entries(
                            contentItems.reduce((acc: {[key: string]: number}, item) => {
                              acc[item.contentType] = (acc[item.contentType] || 0) + 1;
                              return acc;
                            }, {})
                          )
                          .sort(([, a], [, b]) => b - a)
                          .map(([type]) => type)[0]
                        }
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No platforms selected</p>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Content Strategy</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-600 mb-2">Top Content Themes</h4>
              <div className="space-y-2">
                {getTopContentThemes().map((theme, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm mr-2">
                      {index + 1}
                    </span>
                    <span className="text-gray-800">{theme}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-600 mb-2">Content Calendar</h4>
              <div className="p-3 bg-green-50 border border-green-100 rounded">
                <p className="text-green-800">
                  <span className="font-medium">{state.contentCalendar.length}</span> content items planned across <span className="font-medium">{state.selectedPlatforms.length}</span> platforms
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Strategy Strength</h3>
          
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full ${
                strategyRating >= 80 ? 'bg-green-500' : 
                strategyRating >= 60 ? 'bg-blue-500' : 
                strategyRating >= 40 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${strategyRating}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Needs work</span>
            <span className={`font-medium ${
              strategyRating >= 80 ? 'text-green-600' : 
              strategyRating >= 60 ? 'text-blue-600' : 
              strategyRating >= 40 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {strategyRating}% - {
                strategyRating >= 80 ? 'Excellent Strategy!' : 
                strategyRating >= 60 ? 'Good Strategy' : 
                strategyRating >= 40 ? 'Developing Strategy' : 
                'Basic Framework'
              }
            </span>
            <span className="text-gray-600">Comprehensive</span>
          </div>
        </div>
      </div>
      
      {/* Next Steps */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
          <span className="mr-2">🚀</span>
          Next Steps
        </h2>
        
        <ul className="space-y-3 text-blue-800">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">1.</span>
            <div>
              <p className="font-medium">Set Up Your Content Calendar</p>
              <p className="text-sm text-blue-700">
                Transfer your strategy to a dedicated content calendar tool or spreadsheet with specific dates.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">2.</span>
            <div>
              <p className="font-medium">Create Content Templates</p>
              <p className="text-sm text-blue-700">
                Develop templates for each content type to streamline your creation process.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">3.</span>
            <div>
              <p className="font-medium">Set Up Analytics</p>
              <p className="text-sm text-blue-700">
                Ensure you have analytics in place to measure the performance of your content.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">4.</span>
            <div>
              <p className="font-medium">Review and Adjust Regularly</p>
              <p className="text-sm text-blue-700">
                Plan to review your strategy's performance every 1-3 months and make adjustments as needed.
              </p>
            </div>
          </li>
        </ul>
      </div>
      
      {/* Fun Fact */}
      <div className="bg-purple-50 p-5 rounded-lg border border-purple-100 mb-8">
        <h3 className="font-medium text-purple-800 mb-2 flex items-center">
          <span className="mr-2">🎯</span>
          Social Media Strategy Fact
        </h3>
        <p className="text-purple-800">
          Brands that implement a documented social media strategy are 538% more likely to report success 
          than those without a strategy. You're now among the top marketers taking a strategic approach!
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Create Another Strategy
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">🖨️</span>
          Print Strategy
        </button>
      </div>
      
      {/* CSS for confetti animation */}
      <style>
        {`
          .confetti-container {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1000;
          }
          
          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #f00;
            opacity: 0.7;
            animation: fall 5s linear infinite;
          }
          
          @keyframes fall {
            0% {
              transform: translateY(-100px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CompletionScreen; 