import React, { useState } from 'react';
import { BrainstormState } from './BrainstormBuddyMain';

// Problem category interface
interface ProblemCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Component props
interface ProblemDefinitionProps {
  state: BrainstormState;
  categories: ProblemCategory[];
  onProblemChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCategorySelect: (categoryId: string) => void;
  onGenerateIdeas: () => void;
  isGenerating: boolean;
  error?: string;
}

// Humorous AI tips for problem formulation
const AI_TIPS = [
  "Remember, if your problem statement sounds like a fortune cookie, it's too vague!",
  "Good problems are like good jokes - specific, relatable, and make people go 'Ah, I get it!'",
  "If aliens landed tomorrow and read your problem statement, would they understand it? No? Make it clearer!",
  "Describing your problem is like telling someone where it hurts. 'Everywhere' isn't helpful to the doctor—or the AI!",
  "A vague problem statement is like ordering 'food' at a restaurant. Be specific unless you enjoy surprise liver casserole!",
  "Remember: 'Make more money' is not a problem statement. 'How to monetize our cat video archive' is getting somewhere!"
];

const ProblemDefinition: React.FC<ProblemDefinitionProps> = ({
  state,
  categories,
  onProblemChange,
  onCategorySelect,
  onGenerateIdeas,
  isGenerating,
  error
}) => {
  const [showTip, setShowTip] = useState(false);
  const [tipIndex, setTipIndex] = useState(Math.floor(Math.random() * AI_TIPS.length));
  const [hasFocus, setHasFocus] = useState(false);
  
  // Rotate through AI tips
  const getNewTip = () => {
    const newIndex = (tipIndex + 1) % AI_TIPS.length;
    setTipIndex(newIndex);
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-orange-800 flex items-center">
          <span className="mr-2">🧠</span>
          Unleash Your Brain's Wildest Problems
        </h2>
        <p className="text-gray-700 mt-2">
          Let's turn your head-scratchers into ground-breaking solutions! The more specific your problem, the less chance our AI will think you're asking about time travel or perpetual motion machines.
        </p>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-lg text-red-800 animate-pulse">
          <div className="flex">
            <span className="text-xl mr-2">🚨</span>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="mb-8 relative">
        <label htmlFor="problem-statement" className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
          <span className="mr-2">🤔</span>
          What impossible-seeming problem keeps you up at night?
          <button 
            type="button"
            onClick={() => {
              setShowTip(!showTip);
              if (!showTip) getNewTip();
            }}
            className="ml-2 text-orange-500 hover:text-orange-600 focus:outline-none"
            aria-label="Show AI tip"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        </label>
        
        {showTip && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-3 shadow-md transform transition-all animate-fadeIn relative">
            <div className="absolute top-0 right-0 p-1">
              <button 
                onClick={() => setShowTip(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close tip"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">✨</div>
              <div>
                <h4 className="font-medium text-purple-800 mb-1">AI Brainstorm Tip</h4>
                <p className="text-purple-700">{AI_TIPS[tipIndex]}</p>
                <button 
                  onClick={getNewTip}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Another tip, please!
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className={`relative ${hasFocus ? 'transform scale-[1.01] transition-all' : ''}`}>
          <textarea
            id="problem-statement"
            className={`w-full border-2 ${hasFocus ? 'border-orange-400 shadow-lg' : 'border-gray-300 shadow-sm'} 
              rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-orange-500 
              transition-all duration-300 min-h-[150px] bg-gradient-to-br from-white to-orange-50
              text-lg`}
            placeholder="e.g., How might we reduce meeting fatigue while maintaining team collaboration? Or maybe: How can we make accounting fun without breaking any laws?"
            value={state.problemStatement}
            onChange={onProblemChange}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
          />
          <div className="absolute bottom-3 right-3 text-gray-400">
            <span className={`text-sm transition-opacity ${state.problemStatement.length > 10 ? 'opacity-100' : 'opacity-0'}`}>
              {state.problemStatement.length} characters
              {state.problemStatement.length < 20 && " (more detail helps!)"}
              {state.problemStatement.length > 100 && " (looking good!)"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">🎯</span>
          Pick Your Problem Flavor
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {categories.map(category => (
            <div
              key={category.id}
              className={`p-5 rounded-lg border-2 cursor-pointer transition-all transform hover:translate-y-[-5px] hover:shadow-xl ${
                state.ideaCategory === category.title 
                  ? 'border-orange-500 bg-orange-50 shadow-md' 
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="flex flex-col items-center mb-2 text-center">
                <span className="text-3xl mb-3">{category.icon}</span>
                <h4 className="font-medium text-gray-800 text-lg">{category.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-inner">
          <div className="flex items-start">
            <div className="text-blue-500 text-2xl mr-3">🔍</div>
            <div>
              <h4 className="font-medium text-blue-700 mb-1">Pro Tip From Captain Obvious</h4>
              <p className="text-blue-800 text-sm">
                The best problem statements are specific, actionable, and focused on outcomes rather than solutions. 
                Think of it like ordering pizza - "I want food" will get you something random, but 
                "I want a large pepperoni pizza with extra cheese" will get you exactly what you want!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          className={`px-6 py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 
            transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:scale-100 disabled:hover:shadow-none flex items-center`}
          onClick={onGenerateIdeas}
          disabled={isGenerating || !state.problemStatement || !state.ideaCategory}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Brain Cells Activating...
            </>
          ) : (
            <>
              <span className="mr-2">💫</span>
              Unleash Idea Tsunami!
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProblemDefinition; 