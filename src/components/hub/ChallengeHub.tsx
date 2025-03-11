import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserProgress, markChallengeAsCompleted } from '../../utils/userDataManager'
import { CheckCircle, Award } from 'lucide-react'

const ChallengeHub: React.FC = () => {
  // Get user progress from localStorage
  const [userProgress, setUserProgress] = useUserProgress();
  const [completionMessage, setCompletionMessage] = useState<{challengeId: string, message: string} | null>(null);
  
  // Challenge data with exact labels from challenges.md
  const challenges = [
    {
      id: 'challenge-1',
      challengeNumber: 1,
      title: 'AI Trend Spotter',
      description: "Discover tomorrow's trends today—before your competitors' crystal ball starts working!",
      icon: '🔮',
      color: '#5CB2CC',
      path: '/challenge/trendspotter'
    },
    {
      id: 'challenge-2',
      challengeNumber: 2,
      title: 'AI Service Pro',
      description: "Turn IT headaches into high-fives with AI that actually understands your tech support woes.",
      icon: '🦸',
      color: '#FF7F50',
      path: '/challenge/servicepro'
    },
    {
      id: 'challenge-3',
      challengeNumber: 3,
      title: 'AI Biz Strategist',
      description: "Create business strategies so smart, your competition will think you hired MBA-wielding psychics.",
      icon: '🧠',
      color: '#0097A7',
      path: '/challenge/bizstrategist'
    },
    {
      id: 'challenge-4',
      challengeNumber: 4,
      title: 'AI Meeting Genius',
      description: "Make meetings so efficient, you'll actually look forward to them. (Yes, seriously!)",
      icon: '⏱️',
      color: '#5CB2CC',
      path: '/challenge/meetinggenius'
    },
    {
      id: 'challenge-5',
      challengeNumber: 5,
      title: 'AI Smart Select',
      description: "The dating app for business tools—swipe right on the AI that matches your needs perfectly.",
      icon: '🤖',
      color: '#0097A7',
      path: '/challenge/smartselect'
    },
    {
      id: 'challenge-6',
      challengeNumber: 6,
      title: 'AI Communication Coach',
      description: "Write emails so good they'll think you have a tiny Shakespeare in your keyboard.",
      icon: '✉️',
      color: '#FF7F50',
      path: '/challenge/communicationcoach'
    },
    {
      id: 'challenge-7',
      challengeNumber: 7,
      title: 'AI Slide Master',
      description: "Create presentations that make people forget they're watching slides, not a blockbuster movie.",
      icon: '🎬',
      color: '#5CB2CC',
      path: '/challenge/slidemaster'
    },
    {
      id: 'challenge-8',
      challengeNumber: 8,
      title: 'AI Policy Decoder',
      description: "Turn corporate jargon into actual human language—no legal degree required!",
      icon: '🔍',
      color: '#0097A7',
      path: '/challenge/policydecoder'
    },
    {
      id: 'challenge-9',
      challengeNumber: 9,
      title: 'AI Ad Creative Wizard',
      description: "Craft ads so engaging, people will voluntarily turn off their ad blockers. Magic!",
      icon: '✨',
      color: '#FF7F50',
      path: '/challenge/adcreative'
    },
    {
      id: 'challenge-10',
      challengeNumber: 10,
      title: 'AI Data Analyst',
      description: "Turn mountains of data into gold mines of insights—no statistician required!",
      icon: '📈',
      color: '#6200EA',
      path: '/challenge/dataanalyst'
    },
    {
      id: 'challenge-11',
      challengeNumber: 11,
      title: 'AI Brainstorm Buddy',
      description: "Generate brilliantly creative solutions to your toughest business challenges—faster than a room full of consultants!",
      icon: '💡',
      color: '#FF9800',
      path: '/challenge/brainstormbuddy'
    },
    {
      id: 'challenge-12',
      challengeNumber: 12,
      title: 'AI Social Media Strategist',
      description: "Build a comprehensive social media strategy with AI assistance that would make marketing agencies jealous.",
      icon: '📱',
      color: '#E91E63',
      path: '/challenge/social-media-strategist'
    },
    {
      id: 'challenge-13',
      challengeNumber: 13,
      title: 'AI Emotional Insight',
      description: "Analyze emotions in content and learn how emotion recognition can transform business interactions.",
      icon: '😊',
      color: '#4CAF50',
      path: '/challenge/emotional-insight'
    },
    {
      id: 'challenge-14',
      challengeNumber: 14,
      title: 'AI Global Communicator',
      description: "Break language barriers and navigate cross-cultural communication with AI that understands cultural nuances.",
      icon: '🌐',
      color: '#3F51B5',
      path: '/challenge/global-communicator'
    },
    {
      id: 'challenge-15',
      challengeNumber: 15,
      title: 'AI Content Transformer',
      description: "Transform plain content into engaging, interactive experiences that captivate your audience and leave a lasting impression.",
      icon: '✏️',
      color: '#8E44AD',
      path: '/challenge/content-transformer'
    }
  ]

  // Check if a challenge is implemented
  const isImplemented = (challengeId: string) => {
    return ['challenge-1', 'challenge-2', 'challenge-3', 'challenge-5', 'challenge-7', 'challenge-10', 'challenge-11', 'challenge-12', 'challenge-13', 'challenge-14', 'challenge-15'].includes(challengeId)
  }
  
  // Check if a challenge is completed
  const isCompleted = (challengeId: string) => {
    return userProgress.completedChallenges.includes(challengeId)
  }

  // Handle manual challenge completion
  const handleMarkAsCompleted = (challengeId: string, challengeName: string) => {
    const wasCompleted = markChallengeAsCompleted(challengeId);
    
    if (wasCompleted) {
      // Force a refresh of user progress state
      setUserProgress({
        ...userProgress,
        completedChallenges: [...userProgress.completedChallenges, challengeId]
      });
      
      // Show success message
      setCompletionMessage({
        challengeId,
        message: `${challengeName} marked as completed!`
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setCompletionMessage(null);
      }, 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12 text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#5CB2CC] to-[#FF7F50]">
          Level Up Your AI Superpowers
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Welcome to your AI training dojo! Complete challenges, earn bragging rights, 
          and become the colleague everyone secretly asks for help. No cape required.
        </p>
        <div className="mt-8 flex justify-center">
          <a href="#challenges" className="px-6 py-3 bg-[#5CB2CC] text-white rounded-lg text-lg font-medium hover:bg-[#4A90E2] transition-all hover:scale-105 shadow-md">
            Start Your Adventure
          </a>
        </div>
      </div>
      
      <div className="flex flex-col">
        <section id="challenges" className="flex-grow mb-12">
          <h2 className="mb-8 text-3xl font-bold text-center">
            <span className="text-gray-900">Choose Your </span> 
            <span className="text-[#FF7F50]">AI Adventure</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] border border-gray-100"
                style={{ borderTop: `4px solid ${challenge.color}` }}
              >
                <div className="p-6">
                  <div className="flex items-start mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-xl font-bold"
                      style={{ backgroundColor: challenge.color, color: 'white' }}
                    >
                      {challenge.challengeNumber}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        <span className="mr-2">{challenge.icon}</span>
                        {challenge.title}
                      </h3>
                      <p className="text-gray-600">{challenge.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        {isCompleted(challenge.id) && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle size={16} className="mr-1" /> Conquered!
                          </span>
                        )}
                        
                        {completionMessage && completionMessage.challengeId === challenge.id && (
                          <div className="text-sm text-green-600 font-medium animate-pulse">
                            {completionMessage.message}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {isImplemented(challenge.id) ? (
                          <>
                            <Link 
                              to={challenge.path}
                              className="px-5 py-2 bg-[#5CB2CC] text-white rounded-lg text-sm font-medium hover:bg-[#4A90E2] transition-all shadow-sm"
                            >
                              {isCompleted(challenge.id) ? "Play Again" : "Accept Challenge"}
                            </Link>
                          </>
                        ) : (
                          <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm italic flex items-center">
                            <span className="mr-1">🔜</span> Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Manual Complete Button */}
                    {isImplemented(challenge.id) && !isCompleted(challenge.id) && (
                      <button
                        onClick={() => handleMarkAsCompleted(challenge.id, challenge.title)}
                        className="w-full mt-2 px-4 py-2 border border-green-300 text-green-700 bg-green-50 rounded-lg text-sm font-medium hover:bg-green-100 transition-all flex items-center justify-center"
                      >
                        <Award size={16} className="mr-1" /> Mark as Completed
                      </button>
                    )}
                    
                    {/* Complete Challenge Button (for challenges that are being played) */}
                    {isImplemented(challenge.id) && isCompleted(challenge.id) && (
                      <div className="text-center text-sm text-green-800 mt-1">
                        <span className="flex items-center justify-center">
                          <Award size={16} className="mr-1" /> Challenge completed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="bg-gray-50 p-8 rounded-xl text-center mb-16 shadow-inner">
        <h2 className="text-2xl font-bold mb-4">Ready to become an AI wizard?</h2>
        <p className="text-gray-700 mb-6">New challenges added regularly. Come back often or risk your colleagues becoming more AI-savvy than you!</p>
        <div className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0097A7] hover:bg-[#00838F]">
          Start with Challenge #1
        </div>
      </div>
    </div>
  )
}

export default ChallengeHub 