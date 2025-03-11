import React, { useState } from 'react';
import { SlideMasterState } from './SlidesMasterMain';

interface PromptEditorProps {
  state: SlideMasterState;
  updateState: (newState: Partial<SlideMasterState>) => void;
  onContinue: () => void;
  onBack: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  state,
  updateState,
  onContinue,
  onBack,
  onGenerate,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState(state.generatedPrompt || '');
  const [showExamples, setShowExamples] = useState(false);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleGenerate = () => {
    if (prompt.trim()) {
      updateState({ generatedPrompt: prompt });
      onGenerate(prompt);
    }
  };

  const examples = [
    "The future of artificial intelligence in healthcare",
    "Introduction to blockchain technology for beginners",
    "Managing remote teams effectively",
    "Climate change solutions for businesses",
    "Digital marketing strategies for small businesses"
  ];

  const setExample = (example: string) => {
    setPrompt(example);
    setShowExamples(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-500 text-white py-8 px-6 md:px-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Slide Master</h1>
        <p className="text-lg md:text-xl opacity-90">Create beautiful presentations in seconds with AI</p>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center px-4 py-12 max-w-4xl mx-auto">
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
            What would you like to create a presentation about?
          </h2>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Enter a topic or detailed description for your presentation..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setShowExamples(!showExamples)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showExamples ? 'Hide examples' : 'Show examples'}
              </button>
              
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`px-6 py-3 rounded-lg text-white font-medium ${
                  !prompt.trim() || isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : 'Generate Presentation'}
              </button>
            </div>
            
            {showExamples && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">Example prompts:</h3>
                <ul className="space-y-2">
                  {examples.map((example, index) => (
                    <li key={index}>
                      <button
                        onClick={() => setExample(example)}
                        className="text-left text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {example}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-gray-700 mb-4">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">1</div>
                </div>
                <h4 className="font-medium mb-1">Enter your topic</h4>
                <p className="text-sm text-gray-600">Describe what your presentation should cover</p>
              </div>
              <div className="p-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">2</div>
                </div>
                <h4 className="font-medium mb-1">AI generates slides</h4>
                <p className="text-sm text-gray-600">Our AI creates a complete presentation</p>
              </div>
              <div className="p-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">3</div>
                </div>
                <h4 className="font-medium mb-1">Customize & export</h4>
                <p className="text-sm text-gray-600">Make adjustments and export your slides</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromptEditor; 