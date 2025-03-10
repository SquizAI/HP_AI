import React, { useState, useEffect } from 'react';
import { SocialMediaStrategy, ContentItem } from './SocialMediaStrategistMain';

interface ContentPlanningProps {
  state: SocialMediaStrategy;
  updateState: (newState: Partial<SocialMediaStrategy>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Content types by platform
const CONTENT_TYPES = {
  instagram: [
    { type: 'Photo Post', icon: '📸' },
    { type: 'Carousel', icon: '🔄' },
    { type: 'Story', icon: '⭐' },
    { type: 'Reel', icon: '🎬' },
    { type: 'IGTV', icon: '📺' },
    { type: 'Guide', icon: '📋' }
  ],
  facebook: [
    { type: 'Text Post', icon: '📝' },
    { type: 'Photo Post', icon: '📸' },
    { type: 'Video Post', icon: '🎬' },
    { type: 'Link Share', icon: '🔗' },
    { type: 'Live Video', icon: '📹' },
    { type: 'Story', icon: '⭐' },
    { type: 'Event', icon: '📅' },
    { type: 'Poll', icon: '📊' }
  ],
  twitter: [
    { type: 'Tweet', icon: '📝' },
    { type: 'Thread', icon: '🧵' },
    { type: 'Poll', icon: '📊' },
    { type: 'Image Tweet', icon: '📸' },
    { type: 'Video Tweet', icon: '🎬' },
    { type: 'Quote Tweet', icon: '💬' }
  ],
  linkedin: [
    { type: 'Text Post', icon: '📝' },
    { type: 'Article', icon: '📰' },
    { type: 'Document', icon: '📄' },
    { type: 'Image Post', icon: '📸' },
    { type: 'Video Post', icon: '🎬' },
    { type: 'Poll', icon: '📊' },
    { type: 'Event', icon: '📅' }
  ],
  tiktok: [
    { type: 'Short Video', icon: '🎬' },
    { type: 'Duet', icon: '🎭' },
    { type: 'Stitch', icon: '🧵' },
    { type: 'Trending Challenge', icon: '🔥' },
    { type: 'Tutorial', icon: '📚' },
    { type: 'LIVE', icon: '📹' }
  ],
  youtube: [
    { type: 'Long-form Video', icon: '🎬' },
    { type: 'Short', icon: '📱' },
    { type: 'Live Stream', icon: '📹' },
    { type: 'Tutorial', icon: '📚' },
    { type: 'Product Review', icon: '⭐' },
    { type: 'Behind-the-Scenes', icon: '🎭' }
  ],
  pinterest: [
    { type: 'Pin', icon: '📌' },
    { type: 'Video Pin', icon: '🎬' },
    { type: 'Story Pin', icon: '📖' },
    { type: 'Product Pin', icon: '🛍️' },
    { type: 'Infographic', icon: '📊' }
  ],
  reddit: [
    { type: 'Text Post', icon: '📝' },
    { type: 'Link Post', icon: '🔗' },
    { type: 'Image Post', icon: '📸' },
    { type: 'Poll', icon: '📊' },
    { type: 'AMA', icon: '❓' }
  ]
};

// Default content types for custom platforms
const DEFAULT_CONTENT_TYPES = [
  { type: 'Text Post', icon: '📝' },
  { type: 'Image Post', icon: '📸' },
  { type: 'Video Post', icon: '🎬' }
];

// Content frequency suggestions
const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'Post every day', icon: '📆' },
  { value: '3-4-week', label: '3-4 times per week', description: 'Post regularly but not daily', icon: '🗓️' },
  { value: '1-2-week', label: '1-2 times per week', description: 'Post weekly', icon: '📅' },
  { value: 'bi-weekly', label: 'Bi-weekly', description: 'Post every other week', icon: '🔄' },
  { value: 'monthly', label: 'Monthly', description: 'Post once a month', icon: '📅' }
];

// Content theme ideas
const CONTENT_THEMES = [
  { theme: 'Educational', examples: ['How-to guides', 'Industry insights', 'Tips and tricks'] },
  { theme: 'Inspirational', examples: ['Success stories', 'Motivational quotes', 'Aspirational imagery'] },
  { theme: 'Entertainment', examples: ['Humor', 'Behind-the-scenes', 'Fun facts'] },
  { theme: 'Promotional', examples: ['Product features', 'Special offers', 'New releases'] },
  { theme: 'User-generated', examples: ['Customer testimonials', 'Reviews', 'User spotlights'] },
  { theme: 'Community-building', examples: ['Questions to followers', 'Polls', 'Contests'] },
  { theme: 'Storytelling', examples: ['Brand story', 'Employee spotlights', 'Case studies'] },
  { theme: 'Trending Topics', examples: ['Industry news', 'Current events', 'Holidays'] }
];

const ContentPlanning: React.FC<ContentPlanningProps> = ({ state, updateState, onNext, onBack }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>(state.contentCalendar || []);
  const [isEditingItem, setIsEditingItem] = useState<boolean>(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1);
  const [showAIRecommendations, setShowAIRecommendations] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<ContentItem>({
    platform: '',
    contentType: '',
    topic: '',
    timing: '',
    description: ''
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Effect to check if we have content items for each selected platform
  useEffect(() => {
    if (state.selectedPlatforms && state.selectedPlatforms.length > 0 && !selectedPlatform) {
      setSelectedPlatform(state.selectedPlatforms[0]);
    }
  }, [state.selectedPlatforms, selectedPlatform]);
  
  // Get content types for a specific platform
  const getContentTypesForPlatform = (platformId: string) => {
    if (platformId.startsWith('custom-')) {
      return DEFAULT_CONTENT_TYPES;
    }
    
    // @ts-ignore - We know the key might not exist
    return CONTENT_TYPES[platformId] || DEFAULT_CONTENT_TYPES;
  };
  
  // Get platform name from ID
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
  
  // Start creating/editing a content item
  const handleAddItem = (platformId: string = selectedPlatform) => {
    setEditForm({
      platform: platformId,
      contentType: '',
      topic: '',
      timing: '',
      description: ''
    });
    setIsEditingItem(true);
    setCurrentItemIndex(-1);
  };
  
  // Edit an existing content item
  const handleEditItem = (index: number) => {
    setEditForm(contentItems[index]);
    setIsEditingItem(true);
    setCurrentItemIndex(index);
  };
  
  // Delete a content item
  const handleDeleteItem = (index: number) => {
    const newItems = [...contentItems];
    newItems.splice(index, 1);
    setContentItems(newItems);
  };
  
  // Handle changes to form fields
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Save the current content item
  const handleSaveItem = () => {
    if (currentItemIndex >= 0) {
      // Update existing item
      const newItems = [...contentItems];
      newItems[currentItemIndex] = editForm;
      setContentItems(newItems);
    } else {
      // Add new item
      setContentItems([...contentItems, editForm]);
    }
    
    setIsEditingItem(false);
    setEditForm({
      platform: '',
      contentType: '',
      topic: '',
      timing: '',
      description: ''
    });
    setCurrentItemIndex(-1);
  };
  
  // Generate AI content recommendations
  const generateRecommendations = () => {
    setIsGenerating(true);
    
    // Simulate API delay
    setTimeout(() => {
      setShowAIRecommendations(true);
      setIsGenerating(false);
    }, 2000);
  };
  
  // Add a recommended content item to the plan
  const addRecommendation = (recommendation: any) => {
    const newItem: ContentItem = {
      platform: recommendation.platform,
      contentType: recommendation.contentType,
      topic: recommendation.topic,
      timing: recommendation.timing,
      description: recommendation.description
    };
    
    setContentItems([...contentItems, newItem]);
  };
  
  // Complete content planning and move to the next step
  const handleComplete = () => {
    updateState({
      contentCalendar: contentItems,
      isComplete: true
    });
    
    onNext();
  };
  
  // Check if we have at least one content item for each selected platform
  const hasContentForAllPlatforms = () => {
    if (!state.selectedPlatforms || state.selectedPlatforms.length === 0) {
      return false;
    }
    
    return state.selectedPlatforms.every(platformId => 
      contentItems.some(item => item.platform === platformId)
    );
  };
  
  // Gets items for the currently selected platform
  const getPlatformItems = () => {
    return contentItems.filter(item => item.platform === selectedPlatform);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-purple-800 mb-2">
          Plan Your Content Strategy
        </h2>
        <p className="text-gray-700">
          Create a content plan for each platform, defining what types of content you'll share and when.
        </p>
      </div>
      
      {/* Platforms and Progress Summary */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-8">
        <h3 className="font-medium text-gray-800 mb-3">Your Selected Platforms</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          {state.selectedPlatforms && state.selectedPlatforms.map((platformId, index) => {
            const hasPlatformContent = contentItems.some(item => item.platform === platformId);
            
            return (
              <button
                key={platformId}
                className={`px-4 py-2 rounded-md ${
                  selectedPlatform === platformId 
                    ? 'bg-purple-600 text-white' 
                    : hasPlatformContent
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                } transition-colors`}
                onClick={() => setSelectedPlatform(platformId)}
              >
                {hasPlatformContent && <span className="mr-2">✓</span>}
                {getPlatformName(platformId)}
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {hasContentForAllPlatforms() 
              ? '✅ You have content planned for all platforms!' 
              : '⚠️ Add content for each platform before completing'}
          </div>
          <div className="flex space-x-3">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'list' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'calendar' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>
      
      {/* Platform-specific Content Planning */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            {getPlatformName(selectedPlatform)} Content Plan
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={() => handleAddItem()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              + Add Content
            </button>
            <button
              onClick={generateRecommendations}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>AI Recommendations</>
              )}
            </button>
          </div>
        </div>
        
        {/* Content Creation/Editing Form */}
        {isEditingItem && (
          <div className="bg-white p-5 rounded-lg border border-purple-200 mb-6">
            <h3 className="font-medium text-purple-800 mb-4">
              {currentItemIndex >= 0 ? 'Edit Content Item' : 'Create New Content Item'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="contentType"
                  value={editForm.contentType}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select a content type...</option>
                  {getContentTypesForPlatform(editForm.platform).map((type) => (
                    <option key={type.type} value={type.type}>
                      {type.icon} {type.type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posting Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  name="timing"
                  value={editForm.timing}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select frequency...</option>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Topic/Theme <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="topic"
                value={editForm.topic}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., Product showcases, Industry tips, Behind-the-scenes"
                required
              />
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Suggested themes:</p>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_THEMES.slice(0, 6).map((theme) => (
                    <button
                      key={theme.theme}
                      type="button"
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200"
                      onClick={() => setEditForm({...editForm, topic: theme.theme})}
                    >
                      {theme.theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 h-24"
                placeholder="Describe the content you'll create and how it aligns with your goals..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditingItem(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                disabled={!editForm.contentType || !editForm.topic || !editForm.timing || !editForm.description}
              >
                {currentItemIndex >= 0 ? 'Update Item' : 'Add to Plan'}
              </button>
            </div>
          </div>
        )}
        
        {/* List View of Content Items */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {getPlatformItems().length > 0 ? (
              <div className="divide-y divide-gray-100">
                {getPlatformItems().map((item, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        {getContentTypesForPlatform(item.platform).find(t => t.type === item.contentType)?.icon || '📄'}
                        <h4 className="font-medium text-gray-800 ml-2">{item.contentType}</h4>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditItem(contentItems.findIndex(i => i === item))}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(contentItems.findIndex(i => i === item))}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Topic/Theme:</p>
                        <p className="text-gray-800">{item.topic}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Posting Schedule:</p>
                        <p className="text-gray-800">
                          {FREQUENCY_OPTIONS.find(f => f.value === item.timing)?.label || item.timing}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm">
                      <p className="text-gray-500 mb-1">Description:</p>
                      <p className="text-gray-800">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No content items added yet for {getPlatformName(selectedPlatform)}</p>
                <button
                  onClick={() => handleAddItem()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Add Your First Content Item
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center font-medium text-gray-700 p-2 bg-gray-50 rounded">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2 h-64">
              {Array.from({ length: 28 }).map((_, i) => {
                // For demo purposes, just populate a few days
                const hasContent = i === 1 || i === 8 || i === 15 || i === 22;
                
                return (
                  <div 
                    key={i}
                    className={`border rounded-md p-1 min-h-16 ${
                      hasContent ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-xs text-gray-500 text-right mb-1">{i + 1}</div>
                    
                    {hasContent && (
                      <div className="text-xs p-1 bg-purple-100 rounded text-purple-800 mb-1">
                        {i === 1 && 'Photo Post'}
                        {i === 8 && 'Story'}
                        {i === 15 && 'Carousel'}
                        {i === 22 && 'Video Post'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <p className="text-center text-xs text-gray-500 mt-3">
              This is a simplified calendar view for planning purposes.
              For full calendar scheduling, consider using a dedicated content calendar tool.
            </p>
          </div>
        )}
      </div>
      
      {/* AI Recommendations */}
      {showAIRecommendations && (
        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 mb-8">
          <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center">
            <span className="mr-2">🧠</span>
            AI Content Recommendations
          </h3>
          
          <p className="text-gray-700 mb-4">
            Based on your brand personality ({state.brandPersonality}) and target audience,
            here are some content ideas for {getPlatformName(selectedPlatform)}:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              {
                contentType: getContentTypesForPlatform(selectedPlatform)[0]?.type || 'Post',
                topic: 'Behind-the-Scenes',
                timing: '1-2-week',
                description: 'Show your audience how your products are made or services are delivered. This adds authenticity and builds trust with your audience.',
                platform: selectedPlatform
              },
              {
                contentType: getContentTypesForPlatform(selectedPlatform)[1]?.type || 'Post',
                topic: 'User-Generated Content',
                timing: '1-2-week',
                description: 'Feature content created by your customers or community. This increases engagement and provides social proof for your brand.',
                platform: selectedPlatform
              },
              {
                contentType: getContentTypesForPlatform(selectedPlatform)[2]?.type || 'Post',
                topic: 'Industry Tips',
                timing: '1-2-week',
                description: 'Share valuable tips related to your industry. This positions your brand as a thought leader and provides value to your audience.',
                platform: selectedPlatform
              },
              {
                contentType: getContentTypesForPlatform(selectedPlatform)[0]?.type || 'Post',
                topic: 'Success Stories',
                timing: 'bi-weekly',
                description: 'Highlight success stories from customers who have benefited from your products or services. This demonstrates value and builds credibility.',
                platform: selectedPlatform
              }
            ].map((recommendation, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-indigo-800">{recommendation.topic}</h4>
                  <button
                    onClick={() => addRecommendation(recommendation)}
                    className="text-sm px-3 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
                  >
                    Add to Plan
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Content Type:</span> {recommendation.contentType}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Frequency:</span> {FREQUENCY_OPTIONS.find(f => f.value === recommendation.timing)?.label}
                </p>
                <p className="text-sm text-gray-600">
                  {recommendation.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <h4 className="font-medium text-indigo-800 mb-2">Content Mix Recommendation</h4>
            <p className="text-sm text-gray-700 mb-3">
              For optimal engagement on {getPlatformName(selectedPlatform)}, we recommend this content mix:
            </p>
            
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                40% Educational
              </div>
              <div className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full flex items-center">
                <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                30% Entertaining
              </div>
              <div className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full flex items-center">
                <span className="w-4 h-4 bg-purple-500 rounded-full mr-2"></span>
                20% Inspirational
              </div>
              <div className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                <span className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
                10% Promotional
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Strategy Tips */}
      <div className="bg-purple-50 p-5 rounded-lg border border-purple-100 mb-8">
        <h3 className="font-medium text-purple-800 mb-2 flex items-center">
          <span className="mr-2">💡</span>
          Content Strategy Tips
        </h3>
        <ul className="space-y-1 text-purple-800">
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            Follow the 80/20 rule: 80% value-adding content, 20% promotional content.
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            Repurpose content across platforms to maximize efficiency.
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            Be consistent with your posting schedule to build audience expectations.
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            Track engagement to understand what content resonates with your audience.
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
          onClick={handleComplete}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          disabled={!hasContentForAllPlatforms()}
        >
          Complete Strategy
        </button>
      </div>
    </div>
  );
};

export default ContentPlanning; 