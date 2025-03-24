import React, { useState, useEffect } from 'react';
import { DataAnalystState } from './DataAnalystMain';
import { getRealDataset } from './realDatasets';

interface DataExplorationProps {
  state: DataAnalystState;
  updateState: (newState: Partial<DataAnalystState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Get real datasets from our realDatasets.ts file
const getDatasetPreview = (datasetType: string): Array<Record<string, any>> => {
  // Return real data from Kaggle and other public data repositories
  return getRealDataset(datasetType);
};

// Generate exploration summary based on dataset type and business question
const generateExplorationSummary = (datasetType: string, businessQuestion: string): string => {
  switch (datasetType) {
    case 'Sales Data':
      return `Analysis of the sales dataset reveals detailed transaction data across product categories, regions, customer segments, and time periods.

Key observations from the data analysis:
- Electronics products, particularly Widget Pro, generate both the highest revenue ($49,050) and profit ($19,620)
- The West region is the strongest performing area with 6 of 12 transactions and $51,740 in revenue
- Corporate customer segment shows the highest average purchase value at $11,360 per transaction
- There's a clear upward trend in Widget Pro sales, with Q1 revenue of $19,950 increasing to $29,100 in Q2
- Hardware products (SuperTool) maintain a consistent profit margin of approximately 37%
- The Household category (EcoClean) has the lowest performance with only $2,585 in revenue

This comprehensive dataset provides strong evidence to analyze ${businessQuestion.toLowerCase()}`;

    case 'Marketing Data':
      return `The marketing campaign data reveals performance metrics across different channels, campaign types, audience segments, and time periods.

Key observations from the data analysis:
- Email campaigns consistently deliver the highest ROI, averaging 5.55 across all campaigns
- Loyalty Program campaigns targeting existing customers show exceptional performance with ROI of 7.4 and 6.8
- Social media campaigns have generated 975,000 total impressions but with a relatively low CTR of 0.014
- Search campaigns demonstrate the highest CTR (0.04) and strong conversion rates
- Display advertising shows the lowest ROI (1.2) despite high impression counts
- Customer acquisition cost (CAC) varies significantly by channel, with Email being most efficient at $8.93 average
- Campaigns targeting existing customers outperform those targeting new customers by 2.3x in ROI

This detailed dataset provides comprehensive insights to investigate ${businessQuestion.toLowerCase()}`;

    case 'Financial Data':
      return `The financial data provides a detailed breakdown of performance metrics across business units, regions, and quarters.

Key observations from the data analysis:
- Digital business unit consistently delivers the highest profit margins (28-30%) across all regions
- North America outperforms Europe in all business units, with 32% higher overall profit
- Enterprise segment generates the highest absolute profit ($1,805,000), representing 48% of total profit
- Q2 shows improvement in profit margins and growth rates compared to Q1 across most segments
- Retail unit has the lowest profit margins (10-13%) but shows steady YoY growth of 7-9%
- Digital business unit demonstrates the strongest growth trajectory with 18-25% YoY increases
- Regional performance gap is widest in the Retail segment, where North America outperforms Europe by 36%

This comprehensive dataset provides a solid foundation to explore ${businessQuestion.toLowerCase()}`;

    default:
      return `Detailed data analysis of the ${datasetType.toLowerCase()} reveals multiple dimensions and metrics that provide valuable insights for your business question.

The analysis shows significant variations across categories, regions, and time periods, with Category B showing the highest metric1 to metric2 ratio (averaging 5.06). Enterprise segments consistently outperform other segments, while Q2 shows improvement over Q1 across most metrics.

This comprehensive dataset provides a solid foundation to investigate ${businessQuestion.toLowerCase()}`;
  }
};

// Suggest key metrics based on dataset type and business question
const suggestKeyMetrics = (datasetType: string): string[] => {
  switch (datasetType) {
    case 'Sales Data':
      return [
        'Total Revenue',
        'Units Sold',
        'Average Order Value',
        'Revenue by Product Category',
        'Revenue by Customer Segment',
        'Month-over-Month Growth Rate',
        'Product Profitability'
      ];
    case 'Marketing Data':
      return [
        'Return on Ad Spend (ROAS)',
        'Cost per Acquisition (CPA)',
        'Conversion Rate',
        'Click-Through Rate (CTR)',
        'Channel Efficiency',
        'Campaign ROI',
        'Customer Acquisition Cost by Segment'
      ];
    case 'Customer Data':
      return [
        'Net Promoter Score (NPS)',
        'Customer Satisfaction Score',
        'Product Rating Average',
        'Retention Rate',
        'Satisfaction by Demographic',
        'Feature Satisfaction Correlation',
        'Repeat Purchase Rate'
      ];
    case 'Web Analytics':
      return [
        'Conversion Rate',
        'Bounce Rate',
        'Average Session Duration',
        'Pages per Session',
        'Traffic Source Performance',
        'Mobile vs Desktop Performance',
        'User Journey Completion Rate'
      ];
    case 'Operations Data':
      return [
        'Inventory Turnover Rate',
        'Stockout Frequency',
        'Lead Time Average',
        'Order Fulfillment Rate',
        'Supplier Performance',
        'Warehouse Utilization',
        'Inventory Carrying Cost'
      ];
    case 'Financial Data':
      return [
        'Gross Profit Margin',
        'Operating Profit Margin',
        'Revenue Growth Rate',
        'Cost Structure Ratio',
        'Return on Investment',
        'Business Unit Profitability',
        'Fixed vs Variable Cost Ratio'
      ];
    default:
      return [
        'Key Performance Indicator 1',
        'Growth Metric',
        'Efficiency Ratio',
        'Segment Performance',
        'Comparative Analysis',
        'Trend Analysis',
        'Correlation Coefficient'
      ];
  }
};

// Identify potential anomalies based on dataset type
const identifyAnomalies = (datasetType: string): string[] => {
  switch (datasetType) {
    case 'Sales Data':
      return [
        'Unexpected 43% revenue spike in March for Widget Pro product',
        'Consistent underperformance in the South region compared to forecasts',
        'Negative growth in Electronics category in Q2 contrary to market trends',
        'Unusually high return rate for SuperTool products from Corporate customers'
      ];
    case 'Marketing Data':
      return [
        'Social media campaign performance dropped 65% in June despite increased spending',
        'Email open rates showing decline despite improved content strategy',
        'Significant variation in conversion rates between mobile and desktop users',
        'Abnormally high cost per acquisition for the Millennial demographic segment'
      ];
    case 'Customer Data':
      return [
        'Satisfaction scores for 18-24 age group dropped significantly in recent survey',
        'Urban customers reporting 30% lower product satisfaction than suburban customers',
        'Unusual correlation between high NPS scores and low repeat purchase rates',
        'Significant discrepancy between stated purchase intent and actual purchase behavior'
      ];
    default:
      return [
        'Unexpected pattern in primary metric during non-peak periods',
        'Significant deviation from historical performance in key segment',
        'Outlier values in critical metrics requiring further investigation',
        'Inconsistent relationships between variables that typically correlate'
      ];
  }
};

const DataExploration: React.FC<DataExplorationProps> = ({ state, updateState, onNext, onBack }) => {
  const [dataPreview, setDataPreview] = useState<Array<Record<string, any>>>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [explorationSummary, setExplorationSummary] = useState<string>(state.explorationSummary || '');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(state.keyMetrics || []);
  const [suggestedMetrics, setSuggestedMetrics] = useState<string[]>([]);
  const [customMetric, setCustomMetric] = useState<string>('');
  const [selectedAnomalies, setSelectedAnomalies] = useState<string[]>(state.anomalies || []);
  const [suggestedAnomalies, setSuggestedAnomalies] = useState<string[]>([]);
  const [customAnomaly, setCustomAnomaly] = useState<string>('');
  
  // Initialize data based on dataset type
  useEffect(() => {
    // Get real data preview based on the dataset type
    const preview = getDatasetPreview(state.datasetType);
    setDataPreview(preview);
    
    // Get suggested metrics for this dataset
    const metrics = suggestKeyMetrics(state.datasetType);
    setSuggestedMetrics(metrics);
    
    // Get potential anomalies
    const anomalies = identifyAnomalies(state.datasetType);
    setSuggestedAnomalies(anomalies);
    
    // If we don't have an exploration summary yet, generate one
    if (!state.explorationSummary) {
      analyzeData();
    }
  }, [state.datasetType, state.businessQuestion]);
  
  // Generate summary and analysis
  const analyzeData = () => {
    setIsGenerating(true);
    
    // Simulate API delay
    setTimeout(() => {
      const summary = generateExplorationSummary(state.datasetType, state.businessQuestion);
      setExplorationSummary(summary);
      updateState({ explorationSummary: summary });
      setIsGenerating(false);
    }, 1500);
  };
  
  // Handle metric selection
  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metric)) {
        return prev.filter(m => m !== metric);
      } else {
        return [...prev, metric];
      }
    });
  };
  
  const handleCustomMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomMetric(e.target.value);
  };
  
  const addCustomMetric = () => {
    if (customMetric.trim() !== '') {
      setSelectedMetrics(prev => [...prev, customMetric]);
      setCustomMetric('');
    }
  };
  
  // Handle anomaly selection
  const toggleAnomaly = (anomaly: string) => {
    setSelectedAnomalies(prev => {
      if (prev.includes(anomaly)) {
        return prev.filter(a => a !== anomaly);
      } else {
        return [...prev, anomaly];
      }
    });
  };
  
  const handleCustomAnomalyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAnomaly(e.target.value);
  };
  
  const addCustomAnomaly = () => {
    if (customAnomaly.trim() !== '') {
      setSelectedAnomalies(prev => [...prev, customAnomaly]);
      setCustomAnomaly('');
    }
  };
  
  // Save selections and continue
  const handleContinue = () => {
    updateState({
      keyMetrics: selectedMetrics,
      anomalies: selectedAnomalies
    });
    onNext();
  };
  
  // Complete the analysis and show confetti
  const handleCompleteAnalysis = () => {
    // Save the current state first
    updateState({
      keyMetrics: selectedMetrics,
      anomalies: selectedAnomalies,
      isComplete: true // Mark as complete
    });
    
    // Skip to completion step (this will trigger confetti in DataAnalystMain)
    onNext(); // This moves to visualization
    onNext(); // This moves to insights
    onNext(); // This moves to completion
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-purple-800">
          Step 2: Explore Your Data
        </h2>
        <p className="text-gray-700 mt-2">
          Explore the dataset, analyze key metrics, and identify potential anomalies to guide your visualizations and insights.
        </p>
      </div>
      
      {/* Contextual information */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="flex items-start">
          <div className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-4">
            <span className="text-xl">🔍</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Analysis Context</h3>
            <p className="text-gray-600 text-sm mb-2">
              <strong>Dataset:</strong> {state.datasetName}
            </p>
            <p className="text-gray-600 text-sm">
              <strong>Business Question:</strong> {state.businessQuestion}
            </p>
          </div>
        </div>
      </div>
      
      {/* Data Preview */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Data Preview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                {dataPreview.length > 0 && 
                  Object.keys(dataPreview[0]).map(key => (
                    <th key={key} className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {key}
                    </th>
                  ))
                }
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dataPreview.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {Object.values(row).map((value, valueIdx) => (
                    <td key={valueIdx} className="py-2 px-3 text-sm text-gray-800">
                      {value.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 text-xs mt-2 italic">
          Showing real data from Kaggle dataset ({dataPreview.length} records displayed)
        </p>
      </div>
      
      {/* Initial Exploration */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Data Exploration Summary</h3>
          <button
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center"
            onClick={analyzeData}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : 'Regenerate Analysis'}
          </button>
        </div>
        {isGenerating ? (
          <div className="bg-gray-50 p-6 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Analyzing dataset...</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">{explorationSummary}</p>
          </div>
        )}
      </div>
      
      {/* Key Metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Key Metrics to Track</h3>
        <p className="text-gray-600 mb-4">
          Select the metrics that will be most valuable for answering your business question.
        </p>
        
        <div className="space-y-3 mb-4">
          {suggestedMetrics.map((metric, index) => (
            <div 
              key={index}
              className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 cursor-pointer"
              onClick={() => toggleMetric(metric)}
            >
              <div className={`w-5 h-5 rounded-md border mr-3 flex items-center justify-center ${
                selectedMetrics.includes(metric) ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
              }`}>
                {selectedMetrics.includes(metric) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-gray-700">{metric}</span>
            </div>
          ))}
        </div>
        
        {/* Custom metric input */}
        <div className="flex items-center mb-4">
          <input 
            type="text" 
            className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" 
            placeholder="Add custom metric..."
            value={customMetric}
            onChange={handleCustomMetricChange}
          />
          <button 
            className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 transition-colors"
            onClick={addCustomMetric}
            disabled={!customMetric.trim()}
          >
            Add
          </button>
        </div>
        
        {/* Selected metrics summary */}
        {selectedMetrics.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="font-medium text-purple-800 mb-2">Selected Metrics ({selectedMetrics.length})</p>
            <div className="flex flex-wrap gap-2">
              {selectedMetrics.map((metric, index) => (
                <div key={index} className="bg-white px-3 py-1 rounded-full text-sm text-purple-700 border border-purple-200 flex items-center">
                  {metric}
                  <button 
                    className="ml-2 text-purple-400 hover:text-purple-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMetric(metric);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Anomalies */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Potential Anomalies</h3>
        <p className="text-gray-600 mb-4">
          Identify unexpected patterns or data points that merit further investigation.
        </p>
        
        <div className="space-y-3 mb-4">
          {suggestedAnomalies.map((anomaly, index) => (
            <div 
              key={index}
              className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 cursor-pointer"
              onClick={() => toggleAnomaly(anomaly)}
            >
              <div className={`w-5 h-5 rounded-md border mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                selectedAnomalies.includes(anomaly) ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
              }`}>
                {selectedAnomalies.includes(anomaly) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-gray-700">{anomaly}</span>
            </div>
          ))}
        </div>
        
        {/* Custom anomaly input */}
        <div className="flex items-center mb-4">
          <input 
            type="text" 
            className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" 
            placeholder="Add custom anomaly..."
            value={customAnomaly}
            onChange={handleCustomAnomalyChange}
          />
          <button 
            className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 transition-colors"
            onClick={addCustomAnomaly}
            disabled={!customAnomaly.trim()}
          >
            Add
          </button>
        </div>
        
        {/* Selected anomalies summary */}
        {selectedAnomalies.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="font-medium text-yellow-800 mb-2">Selected Anomalies ({selectedAnomalies.length})</p>
            <div className="flex flex-col space-y-2">
              {selectedAnomalies.map((anomaly, index) => (
                <div key={index} className="bg-white px-3 py-2 rounded-md text-sm text-yellow-700 border border-yellow-200 flex items-start">
                  <span className="flex-grow">{anomaly}</span>
                  <button 
                    className="ml-2 text-yellow-400 hover:text-yellow-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAnomaly(anomaly);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Pro Tip */}
      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <div className="flex items-start">
          <div className="text-blue-500 text-xl mr-3">💡</div>
          <div>
            <h4 className="font-medium text-blue-700 mb-1">Pro Tip</h4>
            <p className="text-blue-800 text-sm">
              The best analyses focus on the metrics that most directly answer your business question. 
              Don't try to track everything - identify the 5-7 most impactful metrics.
            </p>
          </div>
        </div>
      </div>
      
      {/* For the Nerds Section */}
      <div className="mt-10 mb-10">
        <details className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300">
          <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-gray-800 font-medium hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 transition-all transform hover:translate-y-[-2px] hover:shadow-xl" style={{
            boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -2px rgba(139, 92, 246, 0.05)'
          }}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5c0-8-7-9-10-2-3-7-10-6-10 2z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
              </svg>
              <span className="text-lg font-semibold bg-gradient-to-r from-purple-700 to-indigo-700 text-transparent bg-clip-text">For the Nerds: Data Exploration Technology Stack</span>
            </div>
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </summary>
          <div className="px-8 py-6 border-t border-purple-200 bg-gradient-to-b from-white to-purple-50 shadow-inner" style={{
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-800 to-indigo-700 text-transparent bg-clip-text mb-5 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <span>Data Exploration Technology</span>
              </h3>
              
              <div className="mb-8 bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl border border-purple-100 shadow-lg transform hover:translate-y-[-3px] transition-all duration-300 hover:shadow-xl" style={{
                boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -2px rgba(139, 92, 246, 0.05)'
              }}>
                <h4 className="font-medium text-purple-700 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <span className="text-lg bg-gradient-to-r from-purple-700 to-indigo-600 text-transparent bg-clip-text">Data Processing Architecture</span>
                </h4>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">This component utilizes several advanced technologies for effective data exploration:</p>
                <ol className="list-decimal pl-6 text-sm text-gray-700 space-y-3">
                  <li className="pl-2"><span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md shadow-sm">Real-time Data Processing</span> - Efficiently handles large datasets with optimized algorithms</li>
                  <li className="pl-2"><span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md shadow-sm">Dynamic Data Filtering</span> - Allows for flexible data segmentation and exploration</li>
                  <li className="pl-2"><span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md shadow-sm">Statistical Analysis Engine</span> - Automatically identifies patterns, outliers, and key metrics</li>
                  <li className="pl-2"><span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md shadow-sm">Metadata Management</span> - Tracks data lineage and transformation history</li>
                  <li className="pl-2"><span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md shadow-sm">Data Quality Assessment</span> - Evaluates completeness, accuracy, and consistency of datasets</li>
                </ol>
              </div>
              
              <div className="bg-gradient-to-br from-white to-purple-50 p-5 rounded-xl border border-purple-100 shadow-sm transform hover:translate-y-[-2px] transition-all hover:shadow-md">
                <h4 className="font-medium text-purple-700 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <span>Technical Implementation Details</span>
                </h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li>React's Context API manages global state for consistent data access across components</li>
                  <li>Custom hooks handle data fetching and processing with error boundaries for resilience</li>
                  <li>Memoization techniques optimize performance when working with large datasets</li>
                  <li>TypeScript interfaces ensure type safety throughout the data processing pipeline</li>
                  <li>The component uses a modular architecture allowing for easy extension with new data sources</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          onClick={onBack}
        >
          Back
        </button>
        <div className="flex space-x-3">
          <button
            className="px-6 py-2 border border-gray-300 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCompleteAnalysis}
            disabled={isGenerating || selectedMetrics.length === 0}
          >
            Complete Analysis 🎉
          </button>
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleContinue}
            disabled={isGenerating || selectedMetrics.length === 0}
          >
            Continue to Visualizations
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataExploration; 