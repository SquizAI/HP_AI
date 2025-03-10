import React, { useState, useEffect } from 'react';
import { DataAnalystState, DataVisualization as VisualizationType } from './DataAnalystMain';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, 
         CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DataVisualizationProps {
  state: DataAnalystState;
  updateState: (newState: Partial<DataAnalystState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Chart type definitions with properties
const CHART_TYPES = [
  {
    id: 'bar',
    name: 'Bar Chart',
    icon: '📊',
    description: 'Great for comparing values across categories',
    bestFor: ['Comparing categories', 'Showing distributions', 'Ranking data']
  },
  {
    id: 'line',
    name: 'Line Chart',
    icon: '📈',
    description: 'Perfect for showing trends over time',
    bestFor: ['Time series', 'Trend analysis', 'Continuous data']
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    icon: '🍩',
    description: 'Shows parts of a whole as percentages',
    bestFor: ['Composition data', 'Proportions', 'Small number of categories']
  },
  {
    id: 'scatter',
    name: 'Scatter Plot',
    icon: '✨',
    description: 'Visualizes relationships between two variables',
    bestFor: ['Correlation analysis', 'Distribution patterns', 'Outlier detection']
  },
];

// Schema for structured output from the AI
const VIZ_STRUCTURE_SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'Clear, descriptive title for the visualization'
    },
    chartType: {
      type: 'string',
      enum: ['bar', 'line', 'pie', 'scatter'],
      description: 'The type of chart that best represents this data'
    },
    description: {
      type: 'string',
      description: 'Brief description of what the visualization shows'
    },
    xAxis: {
      type: 'string',
      description: 'What the x-axis represents (for bar, line, scatter charts)'
    },
    yAxis: {
      type: 'string',
      description: 'What the y-axis represents (for bar, line, scatter charts)'
    },
    categories: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'The categories or labels for the data points'
    },
    values: {
      type: 'array',
      items: {
        type: 'number'
      },
      description: 'The numeric values for each category'
    },
    insights: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'Key insights that can be derived from this visualization (3-5 points)'
    }
  },
  required: ['title', 'chartType', 'description', 'insights']
};

// Sample data generator for visualizations
const generateSampleData = (chartType: string, categories: string[] = []): any[] => {
  // If no categories provided, generate some
  const defaultCategories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
  const useCategories = categories.length > 0 ? categories : defaultCategories;
  
  switch(chartType) {
    case 'bar':
      return useCategories.map(category => ({
        name: category,
        value: Math.floor(Math.random() * 1000) + 100,
      }));
    
    case 'line':
      return Array.from({ length: 12 }, (_, i) => ({
        name: `Month ${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 100,
      }));
    
    case 'pie':
      return useCategories.map(category => ({
        name: category,
        value: Math.floor(Math.random() * 100) + 20,
      }));
      
    case 'scatter':
      return Array.from({ length: 20 }, (_, i) => ({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        z: Math.floor(Math.random() * 40) + 5, // Size value
        name: `Point ${i + 1}`,
      }));
      
    default:
      return useCategories.map(category => ({
        name: category,
        value: Math.floor(Math.random() * 1000) + 100,
      }));
  }
};

// CHART_COLORS for consistent styling
const CHART_COLORS = ['#6200EA', '#B388FF', '#651FFF', '#7C4DFF', '#3D5AFE', '#536DFE'];

// Chart Renderer Component
const ChartRenderer: React.FC<{ type: string, height?: number, data?: any[] }> = ({ 
  type, 
  height = 300,
  data = [] 
}) => {
  // Generate data if none provided
  const chartData = data.length > 0 ? data : generateSampleData(type);
  
  switch(type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#6200EA" name="Value" />
          </BarChart>
        </ResponsiveContainer>
      );
      
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#6200EA" activeDot={{ r: 8 }} name="Value" />
          </LineChart>
        </ResponsiveContainer>
      );
      
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
      
    case 'scatter':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="X Value" />
            <YAxis type="number" dataKey="y" name="Y Value" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Data Points" data={chartData} fill="#6200EA" />
          </ScatterChart>
        </ResponsiveContainer>
      );
      
    default:
      return <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">No chart data available</div>;
  }
};

// Mock idea generation function (would be replaced with AI API call)
const generateVisualization = (
  datasetType: string, 
  businessQuestion: string, 
  metrics: string[], 
  anomalies: string[]
): Promise<VisualizationType> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Generate random chart type
      const chartTypes = ['bar', 'line', 'pie', 'scatter'];
      const randomTypeIndex = Math.floor(Math.random() * chartTypes.length);
      const chartType = chartTypes[randomTypeIndex];
      
      // Generate categories based on dataset type
      let categories: string[] = [];
      if (datasetType.includes('sales')) {
        categories = ['Electronics', 'Clothing', 'Home Goods', 'Books', 'Toys'];
      } else if (datasetType.includes('marketing')) {
        categories = ['Social Media', 'Email', 'SEO', 'PPC', 'Content'];
      } else if (datasetType.includes('customer')) {
        categories = ['New', 'Returning', 'Loyal', 'At Risk', 'Lost'];
      } else {
        categories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
      }
      
      // Generate insights based on chart type and business question
      const insights = [
        `Key insight related to ${businessQuestion}.`,
        `Notable pattern in the ${metrics[0] || 'primary metric'}.`,
        `Comparison between different ${categories[0]} and ${categories[1]}.`
      ];
      
      if (anomalies.length > 0) {
        insights.push(`Anomaly detected: ${anomalies[0]}`);
      }
      
      const visualization: VisualizationType = {
        title: `Analysis of ${datasetType} for ${businessQuestion}`,
        type: chartType as any,
        description: `This visualization shows the relationship between key metrics in your ${datasetType} dataset.`,
        insights: insights,
        // Add sample data for the chart
        data: generateSampleData(chartType, categories)
      };
      
      resolve(visualization);
    }, 2000);
  });
};

// Update the DataVisualization interface
interface VisualizationProps extends VisualizationType {
  data?: any[];
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ state, updateState, onNext, onBack }) => {
  const [visualizations, setVisualizations] = useState<VisualizationProps[]>(state.visualizations || []);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentViz, setCurrentViz] = useState<VisualizationProps | null>(null);
  const [selectedChartType, setSelectedChartType] = useState<string>('');
  const [showAiHelper, setShowAiHelper] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  
  // Generate a visualization based on the dataset and metrics
  const generateViz = async () => {
    setIsGenerating(true);
    
    try {
      const newViz = await generateVisualization(
        state.datasetType,
        state.businessQuestion,
        state.keyMetrics,
        state.anomalies
      );
      
      setCurrentViz(newViz);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating visualization:', error);
      setIsGenerating(false);
    }
  };
  
  // Add the current visualization to the list
  const addVisualization = () => {
    if (currentViz) {
      setVisualizations(prev => [...prev, currentViz]);
      setCurrentViz(null);
      setSelectedChartType('');
      setCustomTitle('');
      setCustomDescription('');
    }
  };
  
  // Add a custom visualization
  const addCustomVisualization = () => {
    if (customTitle && customDescription && selectedChartType) {
      const newViz: VisualizationProps = {
        title: customTitle,
        type: selectedChartType as any,
        description: customDescription,
        insights: [],
        data: generateSampleData(selectedChartType)
      };
      
      setVisualizations(prev => [...prev, newViz]);
      setSelectedChartType('');
      setCustomTitle('');
      setCustomDescription('');
    }
  };
  
  // Remove a visualization from the list
  const removeVisualization = (index: number) => {
    setVisualizations(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle chart type selection
  const handleChartTypeSelect = (chartId: string) => {
    setSelectedChartType(chartId);
  };
  
  // Handle AI prompt input
  const handleAiPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(e.target.value);
  };
  
  // Generate a visualization from AI prompt
  const generateFromPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // In a real implementation, this would call an OpenAI API with function calling
    // to generate structured visualization data
    setTimeout(() => {
      const chartTypes = ['bar', 'line', 'pie', 'scatter'];
      const randomTypeIndex = Math.floor(Math.random() * chartTypes.length);
      const chartType = chartTypes[randomTypeIndex];
      
      const newViz: VisualizationProps = {
        title: `Analysis of ${state.datasetType} for ${state.businessQuestion}`,
        type: chartType as any,
        description: 'Custom visualization generated from your prompt.',
        insights: [
          'Custom insight based on your prompt.',
          'Additional insight derived from data analysis.',
          'Key observation related to your business question.'
        ],
        data: generateSampleData(chartType)
      };
      
      setCurrentViz(newViz);
      setIsGenerating(false);
      setShowAiHelper(false);
    }, 2000);
  };
  
  // Save visualizations and continue
  const handleContinue = () => {
    updateState({
      visualizations: visualizations.map(viz => ({
        title: viz.title,
        type: viz.type,
        description: viz.description,
        insights: viz.insights,
        data: viz.data || []
      }))
    });
    onNext();
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-purple-800">
          Step 3: Create Visualizations
        </h2>
        <p className="text-gray-700 mt-2">
          Create meaningful visualizations to help understand patterns and trends in your data.
        </p>
      </div>
      
      {/* Dataset and metrics context */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="flex items-start">
          <div className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-4">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Analysis Context</h3>
            <p className="text-gray-600 text-sm mb-2">
              <strong>Dataset:</strong> {state.datasetName}
            </p>
            <p className="text-gray-600 text-sm mb-2">
              <strong>Key Metrics:</strong> {state.keyMetrics.join(', ')}
            </p>
          </div>
        </div>
      </div>
      
      {/* AI Helper Toggle */}
      <div className="mb-8">
        <button
          className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          onClick={() => setShowAiHelper(!showAiHelper)}
        >
          <span className="mr-2">✨</span>
          {showAiHelper ? 'Hide AI Helper' : 'Show AI Helper'}
        </button>
        
        {showAiHelper && (
          <div className="mt-4 bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-medium text-purple-800 mb-3">AI Visualization Helper</h3>
            <p className="text-gray-600 mb-4">
              Tell the AI what you want to visualize, and it will generate a structured visualization for you.
            </p>
            
            <div className="mb-4">
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                placeholder="Describe what you want to visualize. For example: 'Create a bar chart showing revenue by product category with a focus on seasonal trends.'"
                value={aiPrompt}
                onChange={handleAiPromptChange}
              ></textarea>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <div className="text-blue-500 text-xl mr-3">💡</div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-1">AI Helper Tips</h4>
                  <p className="text-blue-800 text-sm">
                    For best results, specify:
                  </p>
                  <ul className="text-blue-800 text-sm list-disc pl-5 mt-1">
                    <li>The specific chart type you want (bar, line, pie, scatter)</li>
                    <li>What data you want to see visualized</li>
                    <li>What relationships or patterns you're interested in</li>
                    <li>Any specific metrics to highlight</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-500 text-sm mb-3">
                <strong>Output Structure:</strong> All visualizations will be generated with a consistent structure including title, chart type, description, and key insights.
              </p>
              <pre className="bg-gray-800 text-green-300 p-3 rounded-md text-xs overflow-x-auto">
                {JSON.stringify(VIZ_STRUCTURE_SCHEMA, null, 2)}
              </pre>
            </div>
            
            <button
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors flex items-center"
              onClick={generateFromPrompt}
              disabled={isGenerating || !aiPrompt.trim()}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>Generate Visualization</>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Chart type selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Choose Visualization Type</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {CHART_TYPES.map((chart) => (
            <div
              key={chart.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedChartType === chart.id 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
              }`}
              onClick={() => handleChartTypeSelect(chart.id)}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl mb-2">{chart.icon}</span>
                <h4 className="font-medium text-gray-800">{chart.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{chart.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={generateViz}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin inline-block mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Recommended Visualization'
            )}
          </button>
          
          <button
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            onClick={() => setSelectedChartType('custom')}
          >
            Create Custom Chart
          </button>
        </div>
      </div>
      
      {/* Custom chart form */}
      {selectedChartType === 'custom' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Custom Visualization</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visualization Title
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Revenue by Product Category"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chart Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={selectedChartType}
                onChange={(e) => setSelectedChartType(e.target.value)}
              >
                <option value="">Select chart type</option>
                {CHART_TYPES.map(chart => (
                  <option key={chart.id} value={chart.id}>{chart.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                placeholder="Briefly describe what this visualization shows"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
          
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={addCustomVisualization}
            disabled={!customTitle || !customDescription || !selectedChartType}
          >
            Add Visualization
          </button>
        </div>
      )}
      
      {/* Current visualization preview */}
      {currentViz && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Generated Visualization</h3>
          
          <div className="mb-6">
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h4 className="text-xl font-medium text-gray-800 mb-2">{currentViz.title}</h4>
              <p className="text-gray-600 mb-4">{currentViz.description}</p>
              
              <div className="h-80 mt-4">
                <ChartRenderer type={currentViz.type} data={currentViz.data} />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Key Insights</h4>
              <ul className="space-y-2">
                {currentViz.insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors"
              onClick={addVisualization}
            >
              Add to Visualizations
            </button>
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => setCurrentViz(null)}
            >
              Discard
            </button>
          </div>
        </div>
      )}
      
      {/* Saved visualizations */}
      {visualizations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Your Visualizations ({visualizations.length})</h3>
          
          <div className="space-y-6">
            {visualizations.map((viz, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-800">{viz.title}</h4>
                    <p className="text-sm text-gray-600">{viz.description}</p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-red-500 text-xl"
                    onClick={() => removeVisualization(index)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="h-64 my-4">
                  <ChartRenderer type={viz.type} data={viz.data} height={250} />
                </div>
                
                {viz.insights.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h5 className="font-medium text-sm text-purple-800 mb-2">Key Insights:</h5>
                    <ul className="text-sm space-y-1">
                      {viz.insights.slice(0, 2).map((insight, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                      {viz.insights.length > 2 && (
                        <li className="text-purple-600 text-xs mt-1">
                          +{viz.insights.length - 2} more insights
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Pro Tip */}
      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <div className="flex items-start">
          <div className="text-blue-500 text-xl mr-3">💡</div>
          <div>
            <h4 className="font-medium text-blue-700 mb-1">Pro Tip</h4>
            <p className="text-blue-800 text-sm">
              Different chart types tell different stories. Bar charts are great for comparisons, line charts for trends over time, 
              pie charts for composition, and scatter plots for relationships between variables. Choose the chart type that best 
              communicates your data insights.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="px-6 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleContinue}
          disabled={isGenerating || visualizations.length === 0}
        >
          Continue to Insights
        </button>
      </div>
    </div>
  );
};

export default DataVisualization; 