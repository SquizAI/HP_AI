import React from 'react';
import { SlideMasterState } from './SlidesMasterMain';

interface CompletionScreenProps {
  state: SlideMasterState;
  onRestart: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  state,
  onRestart
}) => {
  // Calculate stats about the presentation
  const totalSlides = state.slides.length;
  const totalImages = state.slides.filter(slide => slide.type === 'image').length;
  const estimatedDuration = Math.ceil(totalSlides * 1.5); // Approx. 1.5 minutes per slide

  // Format options for exporting
  const exportFormats = [
    { id: 'pptx', name: 'PowerPoint (.pptx)', icon: '📊' },
    { id: 'pdf', name: 'PDF Document (.pdf)', icon: '📄' },
    { id: 'html', name: 'Web Presentation (.html)', icon: '🌐' },
    { id: 'json', name: 'JSON Data (.json)', icon: '📝' }
  ];

  // Handle export (in a real implementation, this would generate and download the file)
  const handleExport = (format: string) => {
    // Simulate export process
    alert(`In a real implementation, this would export the presentation as ${format}.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success message */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Presentation Created!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Your presentation "{state.title}" has been generated successfully.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalSlides}</div>
              <div className="text-sm text-gray-600">Total Slides</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{totalImages}</div>
              <div className="text-sm text-gray-600">Images</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{estimatedDuration}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Export Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
              {exportFormats.map(format => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  className="flex items-center justify-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-2xl">{format.icon}</span>
                  <span className="font-medium">{format.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Next steps */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">What would you like to do next?</h2>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Create New Presentation
            </button>
            <button
              onClick={() => window.location.href = '/challenges'}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Return to Challenges
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen; 