import React, { useState } from 'react';
import { SlideMasterState } from './SlidesMasterMain';

interface CompletionScreenProps {
  state: SlideMasterState;
  onRestart: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  state,
  onRestart
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'pptx' | 'images'>('pptx');
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  
  // Simulate export functionality
  const handleExport = () => {
    setExporting(true);
    
    // Simulate export delay
    setTimeout(() => {
      setExporting(false);
      setExportComplete(true);
      
      // Reset export complete status after 3 seconds
      setTimeout(() => {
        setExportComplete(false);
      }, 3000);
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Presentation Complete!</h1>
          <p className="text-xl text-gray-600">
            Your AI-generated presentation is ready to download or share
          </p>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Presentation summary */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-8">
            <h2 className="text-2xl font-bold mb-4">{state.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5">
                <span className="font-medium">{state.slides.length}</span> Slides
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5">
                <span className="font-medium">{state.slides.filter(slide => slide.generatedImageUrl).length}</span> Images
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5">
                <span className="font-medium">{state.theme.name}</span> Theme
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5">
                <span className="font-medium">{state.presentationStyle}</span> Style
              </div>
            </div>
          </div>
          
          {/* Export options */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  exportFormat === 'pptx' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setExportFormat('pptx')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">PowerPoint</h4>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Export as PowerPoint (.pptx) for editing in Microsoft PowerPoint</p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  exportFormat === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setExportFormat('pdf')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">PDF</h4>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Export as PDF for easy sharing and printing</p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  exportFormat === 'images' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setExportFormat('images')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Images</h4>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Export as individual PNG images for each slide</p>
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <button
                onClick={handleExport}
                disabled={exporting}
                className={`px-6 py-3 rounded-md text-white font-medium flex items-center ${
                  exporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : exportComplete ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Download Complete!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export as {exportFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
            
            {/* Export information */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">What's included in your export?</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>All {state.slides.length} slides with your content and formatting</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Generated images embedded directly in your presentation</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Speaker notes for each slide to help with your presentation</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Custom {state.theme.name} theme with your chosen colors and fonts</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={onRestart}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Start Over
            </button>
            <div className="text-sm text-gray-500 flex items-center">
              <span>Presentation created with AI - Powered by HP AI Challenge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen; 