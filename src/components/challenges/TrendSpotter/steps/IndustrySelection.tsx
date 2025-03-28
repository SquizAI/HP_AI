import React, { useState } from 'react'
import { ChallengeState } from '../TrendSpotterMain'
import { getTrendsForIndustry, ApiResponse } from '../../../../services/openai'
import { staticTrendData } from '../../../../data/staticTrendData'

// Define the industry options with vibrant colors from the screenshot
const preloadedIndustries = [
  { id: 'ai-education', name: 'AI in Education', icon: '🎓', color: '#5CB2CC' },
  { id: 'remote-work', name: 'Remote Work Technology', icon: '💻', color: '#0097A7' },
  { id: 'retail', name: 'Future of Retail', icon: '🛍️', color: '#FF7F50' },
  { id: 'healthcare', name: 'Healthcare Innovation', icon: '🏥', color: '#5CB2CC' },
  { id: 'finance', name: 'Financial Technology', icon: '💰', color: '#0097A7' },
  { id: 'sustainability', name: 'Sustainable Business', icon: '🌱', color: '#FF7F50' }
]

interface IndustrySelectionProps {
  state: ChallengeState;
  updateState: (newState: Partial<ChallengeState>) => void;
  onNext: () => void;
}

const IndustrySelection: React.FC<IndustrySelectionProps> = ({ state, updateState, onNext }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingIndustry, setLoadingIndustry] = useState<string>('')
  const [customIndustry, setCustomIndustry] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false)
  
  // Handle industry selection
  const handleIndustrySelect = async (industryId: string, industryName: string) => {
    updateState({ 
      selectedIndustry: industryId,
      selectedIndustryName: industryName
    })
    
    // Check if we already have cached data
    if (state.trendsData[industryName]) {
      return
    }
    
    // If this is a standard industry, use preloaded data first
    const isPreloadedIndustry = Object.keys(staticTrendData.trends).includes(industryName)
    
    if (isPreloadedIndustry) {
      const preloadedTrends: ApiResponse = {
        data: staticTrendData.trends[industryName],
        source: 'static'
      }
      
      updateState({
        trendsData: {
          ...state.trendsData,
          [industryName]: preloadedTrends
        }
      })
      return
    }
    
    // Only fetch from API for custom/non-standard industries
    setIsLoading(true)
    setLoadingIndustry(industryId)
    
    try {
      const response = await getTrendsForIndustry(industryName)
      updateState({
        trendsData: {
          ...state.trendsData,
          [industryName]: response
        }
      })
    } catch (error) {
      console.error('Error fetching trends:', error)
    } finally {
      setIsLoading(false)
      setLoadingIndustry('')
    }
  }
  
  // Handle custom industry input
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomIndustry(e.target.value)
  }
  
  // Submit custom industry
  const handleCustomIndustrySubmit = async () => {
    if (!customIndustry.trim()) return
    
    // Create a custom ID
    const customId = `custom-${customIndustry.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    
    await handleIndustrySelect(customId, customIndustry)
  }
  
  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-[#E0F7FA] to-[#E0F2F1] p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-[#0097A7]">
          Step 1: Choose a Business Topic
        </h2>
        <p className="text-gray-700 mt-2">
          Select an industry or business area you'd like to explore for emerging trends.
          We have preloaded data for standard industries, or you can explore a custom topic.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {preloadedIndustries.map(industry => (
          <div 
            key={industry.id}
            className={`p-6 rounded-lg cursor-pointer transition-all transform hover:scale-105 border-2 ${
              state.selectedIndustry === industry.id 
                ? `border-[${industry.color}] bg-[#E0F7FA]` 
                : 'border-gray-200 hover:border-[#5CB2CC] bg-white'
            }`}
            onClick={() => handleIndustrySelect(industry.id, industry.name)}
            style={{
              boxShadow: state.selectedIndustry === industry.id 
                ? `0 4px 14px rgba(92, 178, 204, 0.2)` 
                : '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div 
                className="text-4xl mb-4 rounded-full w-16 h-16 flex items-center justify-center"
                style={{ 
                  backgroundColor: isLoading && loadingIndustry === industry.id 
                    ? '#E0F7FA' : `${industry.color}25` 
                }}
              >
                {isLoading && loadingIndustry === industry.id ? (
                  <div className="w-6 h-6 border-2 border-[#5CB2CC] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{industry.icon}</span>
                )}
              </div>
              <h3 className="font-bold text-lg mb-2">{industry.name}</h3>
              <p className="text-sm text-gray-600">
                {isLoading && loadingIndustry === industry.id 
                  ? 'Analyzing latest trends...' 
                  : `Using preloaded data for ${industry.name}`}
              </p>
            </div>
          </div>
        ))}
        
        {/* Custom topic option */}
        <div 
          className={`p-6 rounded-lg cursor-pointer transition-all hover:scale-105 border-2 border-dashed ${
            showCustomInput ? 'border-[#5CB2CC] bg-[#E0F7FA]' : 'border-gray-300 hover:border-gray-400 bg-white'
          }`}
          onClick={() => setShowCustomInput(true)}
        >
          <div className="flex flex-col items-center text-center">
            <div 
              className="text-4xl mb-4 rounded-full w-16 h-16 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(92, 178, 204, 0.1)' }}
            >
              {isLoading && customIndustry ? (
                <div className="w-6 h-6 border-2 border-[#5CB2CC] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>➕</span>
              )}
            </div>
            
            {showCustomInput ? (
              <div className="w-full">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2 text-center"
                  placeholder="Enter custom industry name"
                  value={customIndustry}
                  onChange={handleCustomInputChange}
                  autoFocus
                />
                <button
                  className="w-full bg-[#5CB2CC] text-white rounded-md py-1 px-3 text-sm disabled:opacity-50"
                  disabled={!customIndustry.trim() || isLoading}
                  onClick={handleCustomIndustrySubmit}
                >
                  {isLoading ? 'Loading...' : 'Explore Custom Topic'}
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-lg mb-2">Custom Topic</h3>
                <p className="text-sm text-gray-600">
                  Enter your own industry or topic to analyze
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {state.selectedIndustry && (
            <span>Selected: <span className="font-medium">{state.selectedIndustryName}</span></span>
          )}
        </div>
        
        <div className="flex space-x-3">
          {state.selectedIndustryName && state.trendsData[state.selectedIndustryName] && (
            <div className="text-xs text-gray-500 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              {state.trendsData[state.selectedIndustryName].source === 'static' ? 
                'Using preloaded data' : 
                'Using AI-generated data'}
            </div>
          )}
          
          <button
            className="px-6 py-2 bg-[#5CB2CC] text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4A90E2] transition-colors"
            disabled={!state.selectedIndustry || isLoading || !state.trendsData[state.selectedIndustryName]}
            onClick={onNext}
          >
            {isLoading ? 'Loading...' : 'Next: Discover Trends'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndustrySelection 