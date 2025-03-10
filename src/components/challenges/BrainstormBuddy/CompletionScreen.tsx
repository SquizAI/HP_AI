import React, { useEffect, useState } from 'react';
import { BrainstormState } from './BrainstormBuddyMain';

interface CompletionScreenProps {
  state: BrainstormState;
  onRestart: () => void;
}

// Funny achievement titles
const ACHIEVEMENT_TITLES = [
  "Master Idea Wrangler",
  "Certified Problem Obliterator",
  "Distinguished Thought Leader",
  "Professional Light Bulb Moment Generator",
  "Supreme Brainstorm Commander",
  "Elite Innovation Ninja"
];

// Humorous implementation tips
const IMPLEMENTATION_TIPS = [
  "Remember to actually implement this idea. Post-it notes on your colleague's forehead can help with this.",
  "For maximum impact, don't mention this was AI-assisted. Just nod mysteriously when asked how you came up with it.",
  "Implementation works best when you don't try to do everything at 4:55pm on a Friday.",
  "Success is 10% inspiration, 90% convincing others it was their idea all along.",
  "The best way to implement your idea is to start before you're ready. The second best way is to start anyway."
];

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  state,
  onRestart
}) => {
  const [achievementTitle, setAchievementTitle] = useState('');
  const [showConfetti, setShowConfetti] = useState(true);
  const [implementationTip, setImplementationTip] = useState('');
  
  useEffect(() => {
    // Get random achievement title
    const randomTitleIndex = Math.floor(Math.random() * ACHIEVEMENT_TITLES.length);
    setAchievementTitle(ACHIEVEMENT_TITLES[randomTitleIndex]);
    
    // Get random implementation tip
    const randomTipIndex = Math.floor(Math.random() * IMPLEMENTATION_TIPS.length);
    setImplementationTip(IMPLEMENTATION_TIPS[randomTipIndex]);
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative overflow-hidden">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="confetti-piece rounded-sm absolute top-0 left-[10%] w-2 h-5 bg-orange-500" style={{ transform: 'rotateZ(15deg)', animation: 'confetti-fall 3s linear infinite, confetti-shake 3s infinite' }}></div>
          <div className="confetti-piece rounded-sm absolute top-0 left-[20%] w-3 h-4 bg-yellow-500" style={{ transform: 'rotateZ(32deg)', animation: 'confetti-fall 3.5s linear infinite, confetti-shake 3.5s infinite' }}></div>
          <div className="confetti-piece rounded-sm absolute top-0 left-[30%] w-4 h-2 bg-green-500" style={{ transform: 'rotateZ(54deg)', animation: 'confetti-fall 4s linear infinite, confetti-shake 4s infinite' }}></div>
          <div className="confetti-piece rounded-sm absolute top-0 left-[40%] w-2 h-5 bg-blue-500" style={{ transform: 'rotateZ(139deg)', animation: 'confetti-fall 5s linear infinite, confetti-shake 5s infinite' }}></div>
          <div className="confetti-piece rounded-sm absolute top-0 left-[50%] w-3 h-4 bg-purple-500" style={{ transform: 'rotateZ(96deg)', animation: 'confetti-fall 4.7s linear infinite, confetti-shake 4.7s infinite' }}></div>
          <div className="confetti-piece rounded-sm absolute top-0 left-[60%] w-4 h-2 bg-red-500" style={{ transform: 'rotateZ(128deg)', animation: 'confetti-fall 6s linear infinite, confetti-shake 6s infinite' }}></div>
          <div className="confetti-piece rounded-sm absolute top-0 left-[70%] w-2 h-5 bg-pink-500" style={{ transform: 'rotateZ(47deg)', animation: 'confetti-fall 3.2s linear infinite, confetti-shake 3.2s infinite' }}></div>
          <div className="confetti-piece rounded-sm absolute top-0 left-[80%] w-3 h-4 bg-yellow-500" style={{ transform: 'rotateZ(117deg)', animation: 'confetti-fall 5.7s linear infinite, confetti-shake 5.7s infinite' }}></div>
          <div className="confetti-piece rounded-sm absolute top-0 left-[90%] w-4 h-2 bg-teal-500" style={{ transform: 'rotateZ(228deg)', animation: 'confetti-fall 3.8s linear infinite, confetti-shake 3.8s infinite' }}></div>
        </div>
      )}
      
      <div className="flex flex-col items-center mb-10 text-center relative z-10">
        <div className="mb-5 relative">
          <div className="inline-flex p-5 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 shadow-lg transform hover:rotate-12 transition-transform">
            <div className="text-orange-500 text-6xl animate-pulse">🎉</div>
          </div>
          <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/3">
            <div className="text-4xl animate-bounce">🏆</div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
            Challenge Complete!
          </span>
        </h1>
        <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium text-sm mb-3 transform -rotate-2">
          {achievementTitle}
        </div>
        <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
          You've successfully crafted a master plan that would make even the most seasoned project managers slow-clap in admiration.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transform hover:scale-[1.01] transition-transform">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-orange-500 mr-3">🧠</span>
          Your Brainstorm Victory Recap
        </h2>
        
        <div className="mb-6 relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-300 to-red-300"></div>
          <h3 className="text-lg font-medium text-gray-700 flex items-center mb-3">
            <span className="text-orange-500 mr-2">🎯</span> The Problem You Conquered
          </h3>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-orange-300 font-medium">
            "{state.problemStatement}"
          </p>
        </div>
        
        <div className="mb-6 relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 to-purple-300"></div>
          <h3 className="text-lg font-medium text-gray-700 flex items-center mb-3">
            <span className="text-blue-500 mr-2">💡</span> Your Million-Dollar Solution
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-300">
            <h4 className="font-medium text-gray-800 text-lg">{state.selectedIdea?.title}</h4>
            <p className="text-gray-700 mt-2">{state.selectedIdea?.description}</p>
          </div>
        </div>
        
        <div className="mb-6 relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-300 to-teal-300"></div>
          <h3 className="text-lg font-medium text-gray-700 flex items-center mb-3">
            <span className="text-green-500 mr-2">📋</span> Your World-Changing Plan
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-300">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-800 font-sans">
                {state.implementation.split('\n').slice(0, 15).join('\n')}...
              </pre>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => window.open(`data:text/plain;charset=utf-8,${encodeURIComponent(state.implementation)}`, '_blank')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download full plan
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 rounded-xl mb-8 border-2 border-orange-200 shadow-md">
        <h2 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
          <span className="mr-2">🚀</span>
          Next Steps to World Domination
        </h2>
        <div className="bg-white bg-opacity-60 p-4 rounded-lg mb-4">
          <p className="text-gray-800 font-medium italic">
            "{implementationTip}"
          </p>
        </div>
        <ul className="space-y-3">
          <li className="flex items-start text-gray-700">
            <span className="text-orange-500 mr-2">✓</span> 
            Share your brilliant plan with stakeholders (optional: bring snacks to increase approval odds by 73%)
          </li>
          <li className="flex items-start text-gray-700">
            <span className="text-orange-500 mr-2">✓</span> 
            Schedule follow-up sessions to track implementation progress (and take all the credit)
          </li>
          <li className="flex items-start text-gray-700">
            <span className="text-orange-500 mr-2">✓</span> 
            Put "Innovative Problem Solver" in your email signature and LinkedIn profile
          </li>
          <li className="flex items-start text-gray-700">
            <span className="text-orange-500 mr-2">✓</span> 
            Come back to solve another challenge when you need more brilliance
          </li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
        <button
          className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all hover:shadow-xl hover:scale-105 flex items-center justify-center"
          onClick={onRestart}
        >
          <span className="mr-2">⚡</span>
          Unleash More Brilliance!
        </button>
        <button
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all hover:border-gray-400 flex items-center justify-center"
          onClick={() => window.location.href = '/challenges'}
        >
          <span className="mr-2">🏠</span>
          Back to Challenge Hub
        </button>
      </div>
      
      {/* Add CSS keyframes for confetti animation */}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(90deg); }
        }
        @keyframes confetti-shake {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default CompletionScreen; 