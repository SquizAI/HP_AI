import React, { useState } from 'react';
import { BrainstormState } from './BrainstormBuddyMain';

interface ImplementationPlanProps {
  state: BrainstormState;
  onComplete: () => void;
  onBack: () => void;
}

// Define a type for formatted line
interface FormattedLine {
  type: 'empty' | 'h1' | 'h2' | 'h3' | 'list-item' | 'paragraph';
  content: string;
}

// Fun implementation plan facts
const IMPLEMENTATION_FACTS = [
  "With this plan, you'll be 87% more likely to impress your boss than with a simple email saying 'I have ideas'.",
  "This might be the first implementation plan in history that doesn't include the phrase 'synergize cross-functional teams'.",
  "Studies show that people who follow structured implementation plans are 42% less likely to spend meetings saying 'we should really do something about that'.",
  "Warning: Implementation of brilliant ideas may lead to promotion, recognition, or being asked to lead even more projects.",
  "A good implementation plan is like a GPS for your idea—except it won't randomly tell you to 'turn right' into a lake."
];

const ImplementationPlan: React.FC<ImplementationPlanProps> = ({
  state,
  onComplete,
  onBack
}) => {
  const [factIndex, setFactIndex] = useState(Math.floor(Math.random() * IMPLEMENTATION_FACTS.length));
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  
  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Get a new random fact
  const getNewFact = () => {
    const newIndex = (factIndex + 1) % IMPLEMENTATION_FACTS.length;
    setFactIndex(newIndex);
  };
  
  // Format implementation text with markdown-like styling
  const formatImplementation = (text: string): FormattedLine[] => {
    if (!text) return [];
    
    const lines = text.trim().split('\n');
    const formattedLines: FormattedLine[] = [];
    
    let inList = false;
    
    for (const line of lines) {
      if (line.trim() === '') {
        formattedLines.push({ type: 'empty', content: '' });
        inList = false;
      } else if (line.startsWith('# ')) {
        formattedLines.push({ type: 'h1', content: line.substring(2) });
        inList = false;
      } else if (line.startsWith('## ')) {
        formattedLines.push({ type: 'h2', content: line.substring(3) });
        inList = false;
      } else if (line.startsWith('### ')) {
        formattedLines.push({ type: 'h3', content: line.substring(4) });
        inList = false;
      } else if (line.startsWith('- ')) {
        formattedLines.push({ type: 'list-item', content: line.substring(2) });
        inList = true;
      } else {
        formattedLines.push({ type: 'paragraph', content: line });
        inList = false;
      }
    }
    
    return formattedLines;
  };
  
  const formattedImplementation = formatImplementation(state.implementation);

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-orange-800 flex items-center">
          <span className="mr-2">🚀</span>
          Your Master Plan to World Domination (or at least Problem Solving)
        </h2>
        <p className="text-gray-700 mt-2">
          Behold the detailed roadmap for your brilliant idea! Follow these steps and you'll be the office hero in no time.
        </p>
      </div>
      
      <div className="mb-6 p-5 bg-white border-2 border-blue-100 rounded-lg shadow-md">
        <h3 className="font-medium text-gray-800 text-lg mb-3 flex items-center">
          <span className="text-blue-500 text-xl mr-2">💡</span>
          The Brilliant Idea You Selected:
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-purple-100">
          <h4 className="font-semibold text-gray-800 text-lg">{state.selectedIdea?.title}</h4>
          <p className="text-gray-700 mt-2">{state.selectedIdea?.description}</p>
        </div>
      </div>
      
      <div className="absolute top-8 right-8 transform rotate-12 bg-orange-500 text-white py-1 px-3 rounded-lg shadow-md opacity-90 text-sm font-bold z-10">
        APPROVED!
      </div>
      
      <div className="mb-8">
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-md relative">
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-6">
            <div className="flex items-start">
              <div className="text-blue-500 text-2xl mr-3">🎬</div>
              <div>
                <h4 className="font-medium text-blue-700 mb-1">Implementation Insight</h4>
                <p className="text-blue-800 text-sm">
                  {IMPLEMENTATION_FACTS[factIndex]}
                </p>
                <button 
                  onClick={getNewFact}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Another nugget of wisdom, please!
                </button>
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
              <p className="italic text-orange-800 text-sm">
                Dear brilliant mind, your implementation plan is ready! Click on section headers to expand/collapse sections.
                This 30-day plan will transform your ideas into reality. May your gantt charts never be delayed and your stakeholders always be aligned!
              </p>
            </div>
            
            <div className="space-y-4">
              {formattedImplementation.map((line, index) => {
                if (line.type === 'h1') {
                  return (
                    <h1 key={index} className="text-2xl font-bold text-gray-800 border-b-2 border-orange-200 pb-2 mt-6">
                      {line.content}
                    </h1>
                  );
                } else if (line.type === 'h2') {
                  return (
                    <h2 key={index} className="text-xl font-semibold text-gray-800 mt-6 flex items-center">
                      <span className="mr-2">📍</span>
                      {line.content}
                    </h2>
                  );
                } else if (line.type === 'h3') {
                  const sectionId = `section-${index}`;
                  return (
                    <div key={index} className="mt-4">
                      <button 
                        className="text-lg font-medium text-gray-800 hover:text-orange-600 flex items-center justify-between w-full bg-gray-50 p-3 rounded-lg border border-gray-200"
                        onClick={() => toggleSection(sectionId)}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">🔍</span>
                          {line.content}
                        </div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 transform transition-transform ${isExpanded[sectionId] ? 'rotate-180' : ''}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  );
                } else if (line.type === 'list-item') {
                  const prevLine = formattedImplementation[index - 1];
                  const isSectionCollapsed = prevLine && 
                                            prevLine.type === 'h3' && 
                                            !isExpanded[`section-${index - 1}`];
                  
                  const isInCollapsedSection = formattedImplementation
                    .slice(0, index)
                    .some((l, i) => l.type === 'h3' && !isExpanded[`section-${i}`]);
                  
                  if (isInCollapsedSection) {
                    return null;
                  }
                  
                  return (
                    <div key={index} className="flex items-start ml-4 my-2">
                      <span className="text-orange-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{line.content}</span>
                    </div>
                  );
                } else if (line.type === 'paragraph') {
                  const isInCollapsedSection = formattedImplementation
                    .slice(0, index)
                    .some((l, i) => l.type === 'h3' && !isExpanded[`section-${i}`]);
                  
                  if (isInCollapsedSection) {
                    return null;
                  }
                  
                  return (
                    <p key={index} className="text-gray-700 my-2">
                      {line.content}
                    </p>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="bg-green-50 p-5 rounded-lg border border-green-100 shadow-inner">
          <div className="flex items-start">
            <div className="text-green-500 text-2xl mr-3">🚀</div>
            <div>
              <h4 className="font-medium text-green-700 mb-1">Success Secret</h4>
              <p className="text-green-800 text-sm">
                The most successful implementations start with small wins to build momentum. Like snowballs of success! 
                Begin with a pilot group of cool people who won't panic if things get weird, then expand when you've 
                worked out all the embarrassing bugs. Remember: Rome wasn't built in a day, but they were definitely 
                laying bricks every hour.
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
          Back to Ideas
        </button>
        <button
          className="px-6 py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-all hover:shadow-lg hover:scale-105 flex items-center"
          onClick={onComplete}
        >
          <span className="mr-2">🏆</span>
          Mission Accomplished!
        </button>
      </div>
    </div>
  );
};

export default ImplementationPlan; 