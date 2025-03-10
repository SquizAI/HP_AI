import React from 'react';
import { BrainstormState, Idea } from './BrainstormBuddyMain';

interface IdeaGenerationProps {
  state: BrainstormState;
  onSelectIdea: (idea: Idea) => void;
  onGenerateImplementation: () => void;
  onBack: () => void;
  isGenerating: boolean;
  error?: string;
}

// Fun ratings for ideas
const IDEA_RATINGS = [
  "Genius Level: Einstein would be jealous!",
  "Game-Changer: You might want to patent this one!",
  "Eureka Moment: Archimedes would be proud!",
  "Mind = Blown: This could rewrite the rulebook!",
  "Revolutionary: The committee will see you now!",
  "Bold Move: Fortune favors the brave!"
];

const IdeaGeneration: React.FC<IdeaGenerationProps> = ({
  state,
  onSelectIdea,
  onGenerateImplementation,
  onBack,
  isGenerating,
  error
}) => {
  // Get a random rating for an idea
  const getRandomRating = () => {
    const randomIndex = Math.floor(Math.random() * IDEA_RATINGS.length);
    return IDEA_RATINGS[randomIndex];
  };
  
  return (
    <div>
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-orange-800 flex items-center">
          <span className="mr-2">✨</span>
          Behold, the Fruits of Our Collective Genius!
        </h2>
        <p className="text-gray-700 mt-2">
          Our AI and your brain cells collaborated on these brilliant ideas. Pick one that speaks to your soul (or at least your quarterly goals).
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
      
      <div className="mb-6 p-5 bg-white border-2 border-blue-100 rounded-lg shadow-md">
        <h3 className="font-medium text-gray-800 text-lg flex items-center mb-3">
          <span className="text-blue-500 text-xl mr-2">🧩</span>
          The Problem You're Solving:
        </h3>
        <p className="text-gray-700 text-lg font-medium bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-purple-100">
          "{state.problemStatement}"
        </p>
        <p className="text-sm text-gray-500 mt-3 italic">
          Category: <span className="font-medium">{state.ideaCategory}</span> • Generated ideas: <span className="font-medium">{state.ideas.length}</span>
        </p>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <span className="text-orange-500 text-xl mr-2">💡</span>
          Choose Your Destiny (aka an Idea Worth Implementing)
        </h3>
        <div className="space-y-8">
          {state.ideas.map((idea, index) => (
            <div 
              key={idea.id} 
              className={`bg-white p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-xl 
                ${idea.isSelected 
                  ? 'border-orange-500 bg-orange-50 shadow-md transform scale-[1.02]' 
                  : 'border-gray-200 hover:border-orange-300'
                }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-shrink-0 p-4 bg-orange-100 rounded-lg text-center w-16 h-16 flex items-center justify-center transform rotate-3">
                  <span className="text-2xl">{['🚀', '💡', '⚡️', '🔮', '🎯', '🧠', '✨'][index % 7]}</span>
                </div>
                
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center mb-2">
                    <h4 className="font-medium text-gray-800 text-xl mr-3">{idea.title}</h4>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {getRandomRating()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 text-lg">{idea.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <h5 className="font-medium text-green-700 mb-2 flex items-center">
                        <span className="mr-1">👍</span> Pros
                      </h5>
                      <ul className="space-y-2">
                        {idea.pros.map((pro, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span className="text-gray-700">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <h5 className="font-medium text-red-700 mb-2 flex items-center">
                        <span className="mr-1">👎</span> Cons
                      </h5>
                      <ul className="space-y-2">
                        {idea.cons.map((con, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-600 mr-2">•</span>
                            <span className="text-gray-700">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <button
                    className={`px-5 py-3 rounded-md font-medium transition-all flex items-center 
                      ${idea.isSelected 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'border-2 border-orange-400 text-orange-500 hover:bg-orange-50'
                      }`}
                    onClick={() => onSelectIdea(idea)}
                  >
                    {idea.isSelected ? (
                      <>
                        <span className="mr-2">✅</span>
                        This One Sparks Joy!
                      </>
                    ) : 'Select This Brilliant Idea'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-inner">
          <div className="flex items-start">
            <div className="text-blue-500 text-2xl mr-3">💭</div>
            <div>
              <h4 className="font-medium text-blue-700 mb-1">Selection Strategy 101</h4>
              <p className="text-blue-800 text-sm">
                Choosing an idea is like picking a Netflix show – don't overthink it! The best solutions balance immediate 
                feasibility ("Can we actually do this without breaking physics?") with long-term impact ("Will this still 
                seem smart next quarter?"). When in doubt, go with the one that made you say "Huh, that could actually work!"
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          className="px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all hover:border-gray-400 flex items-center"
          onClick={onBack}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Drawing Board
        </button>
        <button
          className={`px-6 py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 
            transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:scale-100 disabled:hover:shadow-none flex items-center`}
          onClick={onGenerateImplementation}
          disabled={!state.selectedIdea || isGenerating}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Planning in Progress...
            </>
          ) : (
            <>
              <span className="mr-2">🔮</span>
              Create Master Plan!
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default IdeaGeneration; 