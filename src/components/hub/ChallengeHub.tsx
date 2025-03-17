import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserProgress, markChallengeAsCompleted } from '../../utils/userDataManager'
import { CheckCircle, Award, XCircle, Video, Mic, Filter, RotateCcw } from 'lucide-react'

// Custom CSS for hiding scrollbars but allowing scrolling
const scrollStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* Internet Explorer and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari, Opera */
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .modality-pill {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      font-size: 0.65rem;
    }
    
    .skill-level-pill {
      font-size: 0.65rem;
      padding: 0.15rem 0.5rem;
    }
    
    .filter-pill {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      font-size: 0.7rem;
    }
  }
`;

// Define modality types and their colors
const modalityTypes = {
  voice: { name: 'Voice/Audio', color: '#2E7D32', icon: '🎙️' },
  visual: { name: 'Visual/Image', color: '#673AB7', icon: '🖼️' },
  business: { name: 'Business/Strategy', color: '#0097A7', icon: '🧠' },
  biometrics: { name: 'Biometrics', color: '#607D8B', icon: '👤' },
  text: { name: 'Text/Image', color: '#00796B', icon: '📝' },
  language: { name: 'Language/Translation', color: '#3F51B5', icon: '🌐' },
  model: { name: 'Model Comparison', color: '#0097A7', icon: '🤖' },
  sentiment: { name: 'Sentiment/Analysis', color: '#4CAF50', icon: '😊' },
  marketing: { name: 'Marketing/Strategy', color: '#E91E63', icon: '📱' },
  security: { name: 'Security/Privacy', color: '#E91E63', icon: '🔒' },
  presentation: { name: 'Presentation/Content', color: '#5CB2CC', icon: '🎬' },
  generation: { name: 'Visual/Generation', color: '#8E44AD', icon: '✨' },
  analytics: { name: 'Analytics/Insights', color: '#6200EA', icon: '📈' },
  agent: { name: 'Multi-Agent Systems', color: '#6366F1', icon: '🕵️‍♂️' }
}

// Define skill levels and their colors
const skillLevels = {
  beginner: { name: 'Beginner', color: '#4CAF50' },
  intermediate: { name: 'Intermediate', color: '#3F51B5' },
  advanced: { name: 'Advanced', color: '#6200EA' }
}

const ChallengeHub: React.FC = () => {
  // Get user progress from localStorage
  const [userProgress, setUserProgress] = useUserProgress();
  const [completionMessage, setCompletionMessage] = useState<{challengeId: string, message: string, isCompleted: boolean} | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Standard challenges with new ordering and numbering
  const challenges = [
    {
      id: 'challenge-10',
      challengeNumber: 1,
      title: 'AI Dictation Wizard',
      description: "Transform speech to text, translate to any language, and convert back to voice—all with powerful AI.",
      icon: '🎙️',
      color: '#2E7D32',
      path: '/challenge/dictation-wizard',
      skillLevel: 'beginner',
      modality: 'voice'
    },
    {
      id: 'challenge-creative-vision',
      challengeNumber: 2,
      title: 'Creative Vision AI',
      description: "Transform your ideas into stunning visuals with AI-powered text-to-image generation.",
      icon: '✨',
      color: '#8E44AD',
      path: '/challenge/creative-vision',
      skillLevel: 'intermediate',
      modality: 'generation'
    },
    {
      id: 'challenge-11',
      challengeNumber: 3,
      title: 'AI Image Classifier',
      description: "Instantly classify images, detect objects, and extract visual insights using AI vision technologies.",
      icon: '🔍',
      color: '#5E35B1',
      path: '/challenge/image-classifier',
      skillLevel: 'beginner',
      modality: 'visual'
    },
    {
      id: 'challenge-1',
      challengeNumber: 4,
      title: 'AI Biz Strategist',
      description: "Create business strategies so smart, your competition will think you hired MBA-wielding psychics.",
      icon: '🧠',
      color: '#0097A7',
      path: '/challenge/bizstrategist',
      skillLevel: 'advanced',
      modality: 'business'
    },
    {
      id: 'challenge-7',
      challengeNumber: 5,
      title: 'Facial Recognition System',
      description: "Experience facial biometric authentication and learn how facial recognition technology works.",
      icon: '👤',
      color: '#607D8B',
      path: '/challenge/face-id-manager',
      skillLevel: 'intermediate',
      modality: 'biometrics'
    },
    {
      id: 'challenge-9',
      challengeNumber: 6,
      title: 'AI Voice Generator Pro',
      description: "Create professional voiceovers, consistent brand voices, and accessibility features through AI-powered text-to-speech.",
      icon: '🔊',
      color: '#FF5722',
      path: '/challenge/voice-generator',
      skillLevel: 'beginner',
      modality: 'voice'
    },
    {
      id: 'challenge-ocr',
      challengeNumber: 7,
      title: 'AI OCR Assistant',
      description: "Convert printed or handwritten text from images into editable digital text.",
      icon: '📝',
      color: '#00796B',
      path: '/challenge/ocr-assistant',
      skillLevel: 'beginner',
      modality: 'text'
    },
    {
      id: 'challenge-5',
      challengeNumber: 8,
      title: 'AI Global Communicator',
      description: "Break language barriers and navigate cross-cultural communication with AI that understands cultural nuances.",
      icon: '🌐',
      color: '#3F51B5',
      path: '/challenge/global-communicator',
      skillLevel: 'intermediate',
      modality: 'language'
    },
    {
      id: 'challenge-object-detection',
      challengeNumber: 9,
      title: 'AI Object Detection',
      description: "Detect and locate multiple objects in images with bounding boxes and confidence scores.",
      icon: '🔍',
      color: '#673AB7',
      path: '/challenge/object-detection',
      skillLevel: 'intermediate',
      modality: 'visual'
    },
    {
      id: 'challenge-2',
      challengeNumber: 10,
      title: 'AI Smart Select',
      description: "Compare AI models to determine the optimal choice for different business scenarios based on response quality and cost.",
      icon: '🤖',
      color: '#0097A7',
      path: '/challenge/smartselect',
      skillLevel: 'advanced',
      modality: 'model'
    },
    {
      id: 'challenge-8',
      challengeNumber: 11,
      title: 'AI Emotional Insight',
      description: "Analyze emotions in content and learn how emotion recognition can transform business interactions.",
      icon: '😊',
      color: '#4CAF50',
      path: '/challenge/emotional-insight',
      skillLevel: 'intermediate',
      modality: 'sentiment'
    },
    {
      id: 'challenge-4',
      challengeNumber: 12,
      title: 'AI Social Media Strategist',
      description: "Build a comprehensive social media strategy with AI assistance that would make marketing agencies jealous.",
      icon: '📱',
      color: '#E91E63',
      path: '/challenge/social-media-strategist',
      skillLevel: 'advanced',
      modality: 'marketing'
    },
    {
      id: 'challenge-privacy-guardian',
      challengeNumber: 13,
      title: 'AI Privacy Guardian',
      description: "Protect privacy by automatically detecting and blurring faces in images with intelligent face recognition.",
      icon: '🔒',
      color: '#E91E63',
      path: '/challenge/privacy-guardian',
      skillLevel: 'intermediate',
      modality: 'security'
    },
    {
      id: 'challenge-6',
      challengeNumber: 14,
      title: 'AI Slide Master',
      description: "Create presentations that make people forget they're watching slides, not a blockbuster movie.",
      icon: '🎬',
      color: '#5CB2CC',
      path: '/challenge/slidemaster',
      skillLevel: 'intermediate',
      modality: 'presentation'
    },
    {
      id: 'challenge-3',
      challengeNumber: 15,
      title: 'AI Data Analyst',
      description: "Turn mountains of data into gold mines of insights—no statistician required!",
      icon: '📈',
      color: '#6200EA',
      path: '/challenge/dataanalyst',
      skillLevel: 'advanced',
      modality: 'analytics'
    },
    {
      id: 'challenge-agent-magic',
      challengeNumber: 16,
      title: 'Agent Magic',
      description: "Harness the power of specialized AI agents in business workflows to deliver exceptional value through collaborative intelligence.",
      icon: '✨',
      color: '#6366F1',
      path: '/challenge/agent-magic',
      skillLevel: 'advanced',
      modality: 'agent'
    }
  ]
  
  // Additional challenges section
  const additionalChallenges = [
    {
      id: 'additional-challenge-1',
      challengeNumber: 1,
      title: 'AI Trend Spotter',
      description: "Discover tomorrow's trends today—before your competitors' crystal ball starts working!",
      icon: '🔮',
      color: '#5CB2CC',
      path: '/challenge/trendspotter'
    },
    {
      id: 'additional-challenge-2',
      challengeNumber: 2,
      title: 'AI Service Pro',
      description: "Turn IT headaches into high-fives with AI that actually understands your tech support woes.",
      icon: '🦸',
      color: '#FF7F50',
      path: '/challenge/servicepro'
    },
    {
      id: 'additional-challenge-3',
      challengeNumber: 3,
      title: 'AI Meeting Genius',
      description: "Make meetings so efficient, you'll actually look forward to them. (Yes, seriously!)",
      icon: '⏱️',
      color: '#5CB2CC',
      path: '/challenge/meetinggenius'
    },
    {
      id: 'additional-challenge-4',
      challengeNumber: 4,
      title: 'AI Brainstorm Buddy',
      description: "Generate brilliantly creative solutions to your toughest business challenges—faster than a room full of consultants!",
      icon: '💡',
      color: '#FF9800',
      path: '/challenge/brainstormbuddy'
    },
    {
      id: 'additional-challenge-5',
      challengeNumber: 5,
      title: 'AI Communication Coach',
      description: "Write emails so good they'll think you have a tiny Shakespeare in your keyboard.",
      icon: '✉️',
      color: '#FF7F50',
      path: '/challenge/communicationcoach'
    },
    {
      id: 'additional-challenge-6',
      challengeNumber: 6,
      title: 'AI Policy Decoder',
      description: "Turn corporate jargon into actual human language—no legal degree required!",
      icon: '🔍',
      color: '#0097A7',
      path: '/challenge/policydecoder'
    },
    {
      id: 'additional-challenge-7',
      challengeNumber: 7,
      title: 'AI Ad Creative Wizard',
      description: "Craft ads so engaging, people will voluntarily turn off their ad blockers. Magic!",
      icon: '✨',
      color: '#FF7F50',
      path: '/challenge/adcreative'
    },
    {
      id: 'additional-challenge-8',
      challengeNumber: 8,
      title: 'AI Content Transformer',
      description: "Transform plain content into engaging, interactive experiences that captivate your audience and leave a lasting impression.",
      icon: '✏️',
      color: '#8E44AD',
      path: '/challenge/content-transformer'
    },
    {
      id: 'additional-challenge-9',
      challengeNumber: 9,
      title: 'AI Visual Search Explorer',
      description: "Upload images and discover relevant search queries, information, and visual insights powered by Google's Gemini 2.0 Flash.",
      icon: '🔎',
      color: '#1E88E5',
      path: '/challenge/image-search'
    },
    {
      id: 'additional-challenge-10',
      challengeNumber: 10,
      title: 'AI Detective League',
      description: "Experience how AI agents collaborate, use specialized tools, and solve complex problems as a team.",
      icon: '🕵️‍♂️',
      color: '#5E35B1',
      path: '/challenge/detective-league'
    }
  ]

  // HP Challenges - unchanged
  const hpChallenges = [
    {
      id: 'challenge-hp-powerbi',
      challengeNumber: 1,
      title: 'HP Challenge 1: Power BI Challenge – AI Data Detective',
      description: "Use Power BI's AI features to discover meaningful business insights without needing advanced analytics knowledge.",
      icon: '📊',
      color: '#0096D6',
      path: '/challenge/hp-powerbi',
      skillLevel: 'intermediate',
      modality: 'analytics'
    },
    {
      id: 'challenge-hp-companion',
      challengeNumber: 2,
      title: 'HP Challenge 2: HP AI Companion – Instant Summarizer',
      description: "Use HP AI Companion to quickly extract key points and action items from lengthy documents and emails.",
      icon: '🤖',
      color: '#0096D6',
      path: '/challenge/hp-companion',
      skillLevel: 'beginner',
      modality: 'text'
    },
    {
      id: 'challenge-hp-amuze',
      challengeNumber: 3,
      title: 'HP Challenge 3: HP Amuze – Creative AI Artist',
      description: "Create stunning visuals and compelling copy in seconds using HP Amuze's AI-powered creative tools.",
      icon: '🎨',
      color: '#0096D6',
      path: '/challenge/hp-amuze',
      skillLevel: 'intermediate',
      modality: 'generation'
    }
  ]

  // Check if a challenge is implemented
  const isImplemented = (challengeId: string) => {
    return [
      // Standard Challenges
      'challenge-1', 'challenge-2', 'challenge-3', 'challenge-4', 'challenge-5',
      'challenge-6', 'challenge-7', 'challenge-8', 'challenge-9', 'challenge-10', 'challenge-11',
      'challenge-ocr', 'challenge-object-detection', 'challenge-privacy-guardian',
      'challenge-creative-vision', 'challenge-agent-magic',
      
      // Additional Challenges
      'additional-challenge-1', 'additional-challenge-2', 'additional-challenge-4',
      'additional-challenge-8', 'additional-challenge-9', 'additional-challenge-10',
      
      // HP Challenges
      'challenge-hp-powerbi', 'challenge-hp-companion', 'challenge-hp-amuze'
    ].includes(challengeId)
  }
  
  // Check if a challenge is completed
  const isCompleted = (challengeId: string) => {
    return userProgress.completedChallenges.includes(challengeId)
  }

  // Update completed count when userProgress changes
  useEffect(() => {
    setCompletedCount(userProgress.completedChallenges.length);
  }, [userProgress]);

  // Handle manual challenge completion
  const handleMarkAsCompleted = (challengeId: string, challengeName: string) => {
    // Skip the markChallengeAsCompleted function's return value check
    // This allows us to mark challenges as completed even if they were previously completed
    markChallengeAsCompleted(challengeId);
    
    // Force a refresh of user progress state
    setUserProgress({
      ...userProgress,
      completedChallenges: [...userProgress.completedChallenges.filter((id: string) => id !== challengeId), challengeId]
    });
    
    // Show success message
    setCompletionMessage({
      challengeId,
      message: `${challengeName} marked as completed!`,
      isCompleted: true
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setCompletionMessage(null);
    }, 3000);
  };

  // Handle unchecking a challenge
  const handleUncheckChallenge = (challengeId: string, challengeName: string) => {
    // Remove the challenge from completedChallenges
    const updatedChallenges = userProgress.completedChallenges.filter((id: string) => id !== challengeId);
    
    // Update userProgress in localStorage
    setUserProgress({
      ...userProgress,
      completedChallenges: updatedChallenges
    });
    
    // Show success message
    setCompletionMessage({
      challengeId,
      message: `${challengeName} marked as incomplete!`,
      isCompleted: false
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setCompletionMessage(null);
    }, 3000);
  };

  // Helper functions to identify challenge types
  const isVoiceChallenge = (challenge: any) => {
    return challenge.id.includes('voice') || 
           challenge.id.includes('dictation') || 
           challenge.title.includes('Voice') ||
           challenge.icon === '🔊' || 
           challenge.icon === '🎙️';
  };

  const isVideoChallenge = (challenge: any) => {
    return challenge.id.includes('video') || 
           challenge.id.includes('tracking') || 
           challenge.id.includes('detection') ||
           challenge.title.includes('Object') ||
           challenge.icon === '📹' || 
           challenge.icon === '🎬';
  };

  // Get unique modality types from challenges
  const getUniqueModalityTypes = () => {
    const modalitySet = new Set<string>();
    challenges.forEach(challenge => {
      if (challenge.modality) {
        modalitySet.add(challenge.modality);
      }
    });
    return Array.from(modalitySet);
  };

  // Filter challenges by modality
  const getFilteredChallenges = () => {
    if (!activeFilter) return challenges;
    return challenges.filter(challenge => challenge.modality === activeFilter);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Apply the custom CSS styles */}
      <style dangerouslySetInnerHTML={{ __html: scrollStyles }} />
      
      <div className="relative mb-16 text-center p-10 rounded-2xl overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 ai-pattern"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-blue-300 opacity-20 blur-xl"></div>
          <div className="absolute top-1/4 -right-12 w-40 h-40 rounded-full bg-purple-400 opacity-20 blur-xl"></div>
          <div className="absolute -bottom-8 left-1/3 w-32 h-32 rounded-full bg-cyan-300 opacity-20 blur-xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-white">
            Level Up Your <span className="text-cyan-300">AI Superpowers</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Welcome to your AI training dojo! Complete challenges, earn bragging rights, 
            and become the colleague everyone secretly asks for help. No cape required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <a 
              href="#challenges" 
              className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-medium hover:bg-blue-50 transition-all hover:scale-105 shadow-lg flex items-center justify-center w-full sm:w-auto"
            >
              Start Your Adventure
            </a>
            <div className="flex items-center justify-center gap-3 bg-blue-900/40 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-inner w-full sm:w-auto">
              <div className="bg-blue-500/20 w-10 h-10 rounded-full flex items-center justify-center">
                <span className="font-bold text-xl">{completedCount}</span>
              </div>
              <span className="text-lg">Challenges Completed</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-16">
        {/* Main Challenges Section with updated heading style */}
        <section id="challenges" className="scroll-mt-24">
          <div className="flex items-center justify-center mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-grow"></div>
            <h2 className="mx-6 text-3xl font-bold text-center relative px-4">
              <span className="text-gray-900">Core </span> 
              <span className="text-[#FF7F50]">AI Challenges</span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#FF7F50] opacity-30 rounded-full"></div>
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-grow"></div>
          </div>
          
          {/* Modality filter pills */}
          <div className="mb-8">
            {/* All Challenges button */}
            <div className="flex justify-center mb-2">
              <button 
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center filter-pill ${!activeFilter ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setActiveFilter(null)}
              >
                <RotateCcw size={14} className="mr-1.5" /> All Challenges
              </button>
            </div>
            
            {/* Two rows of filter pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 px-4">
              {getUniqueModalityTypes().map((modality, index) => (
                <button 
                  key={modality}
                  className={`px-2 py-1.5 rounded-full text-sm font-medium transition-all flex items-center justify-center filter-pill ${
                    activeFilter === modality 
                      ? 'text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ 
                    backgroundColor: activeFilter === modality 
                      ? modalityTypes[modality as keyof typeof modalityTypes].color 
                      : undefined 
                  }}
                  onClick={() => setActiveFilter(modality)}
                >
                  <span className="mr-1">{modalityTypes[modality as keyof typeof modalityTypes].icon}</span>
                  <span className="text-xs sm:text-sm">{modalityTypes[modality as keyof typeof modalityTypes].name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFilteredChallenges().map((challenge) => (
              <div 
                key={challenge.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-soft hover:translate-y-[-4px] border border-gray-100 flex flex-col group relative"
                style={{ borderLeft: `4px solid ${challenge.color}` }}
              >
                {/* Skill Level Tag */}
                <div className="absolute top-3 right-3 z-10">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm skill-level-pill"
                    style={{ backgroundColor: skillLevels[challenge.skillLevel as keyof typeof skillLevels].color }}
                  >
                    {skillLevels[challenge.skillLevel as keyof typeof skillLevels].name}
                  </span>
                </div>
                
                {/* Completed badge overlay - now below skill level */}
                {isCompleted(challenge.id) && (
                  <div className="absolute top-10 right-3 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                      <CheckCircle size={12} className="mr-1" /> Completed
                    </span>
                  </div>
                )}
                
                <div className="p-6 flex-grow">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm group-hover:shadow text-2xl font-bold transition-transform group-hover:scale-110 bg-gradient-to-br from-white to-gray-100"
                        style={{ color: challenge.color, border: `2px solid ${challenge.color}` }}
                      >
                        {challenge.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Challenge #{challenge.challengeNumber}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#5CB2CC] transition-colors line-clamp-2">
                        {challenge.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{challenge.description}</p>
                    </div>
                  </div>
                  
                  {/* Challenge message */}
                  {completionMessage && completionMessage.challengeId === challenge.id && (
                    <div className={`text-sm font-medium mt-2 py-1 px-3 rounded-md animate-pulse ${
                      completionMessage.isCompleted 
                        ? 'text-green-700 bg-green-50' 
                        : 'text-yellow-700 bg-yellow-50'
                    }`}>
                      {completionMessage.message}
                    </div>
                  )}
                </div>
                
                {/* Challenge action area - redesigned for better visual hierarchy */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto transition-colors group-hover:bg-gray-100">
                  {/* Modality type pill */}
                  <div className="flex justify-center mb-3">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm flex items-center modality-pill"
                      style={{ backgroundColor: modalityTypes[challenge.modality as keyof typeof modalityTypes].color }}
                    >
                      <span className="mr-1">{modalityTypes[challenge.modality as keyof typeof modalityTypes].icon}</span>
                      {modalityTypes[challenge.modality as keyof typeof modalityTypes].name}
                    </span>
                  </div>
                  
                  {/* Challenge type indicators */}
                  {isImplemented(challenge.id) && (
                    <div className="flex justify-center mb-3">
                      {isVoiceChallenge(challenge) && (
                        <div className="bg-blue-100 text-blue-800 p-2 rounded-full shadow-sm" title="Voice/Audio Challenge">
                          <Mic size={16} />
                        </div>
                      )}
                      {isVideoChallenge(challenge) && (
                        <div className="bg-purple-100 text-purple-800 p-2 rounded-full ml-2 shadow-sm" title="Video Challenge">
                          <Video size={16} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Challenge action button */}
                  <div className="flex justify-center mb-3">
                    {isImplemented(challenge.id) ? (
                      <Link 
                        to={challenge.path}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-[#5CB2CC] to-[#4A90E2] text-white rounded-lg text-sm font-medium hover:from-[#4A90E2] hover:to-[#3A80D2] transition-all shadow-sm text-center flex items-center justify-center group-hover:shadow"
                      >
                        <span className="relative">
                          {isCompleted(challenge.id) ? "Play Again" : "Accept Challenge"}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                        </span>
                      </Link>
                    ) : (
                      <span className="w-full py-2.5 bg-gray-100 text-gray-500 rounded-lg text-sm italic flex items-center justify-center shadow-inner">
                        <span className="mr-1">🔜</span> Coming Soon
                      </span>
                    )}
                  </div>
                  
                  {/* Challenge Completion Controls - redesigned */}
                  {isImplemented(challenge.id) && (
                    <div className="flex gap-2">
                      {!isCompleted(challenge.id) ? (
                        <button
                          onClick={() => handleMarkAsCompleted(challenge.id, challenge.title)}
                          className="w-full px-4 py-2 border border-green-300 text-green-700 bg-green-50 rounded-lg text-xs font-medium hover:bg-green-100 transition-all flex items-center justify-center"
                        >
                          <Award size={14} className="mr-1.5" /> Mark as Completed
                        </button>
                      ) : (
                        <>
                          <div className="text-center text-xs text-green-800 flex-1 flex items-center justify-center px-2 py-2 bg-green-50 rounded-lg">
                            <Award size={14} className="mr-1.5" /> Challenge completed
                          </div>
                          <button
                            onClick={() => handleUncheckChallenge(challenge.id, challenge.title)}
                            className="px-3 py-2 border border-yellow-300 text-yellow-700 bg-yellow-50 rounded-lg text-xs hover:bg-yellow-100 transition-all flex items-center justify-center"
                            title="Uncheck this challenge"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Challenges Section - REMOVED AS REQUESTED */}
        {/* This section has been removed as per user request */}

        {/* HP Challenges Section - apply same pattern */}
        <section id="hp-challenges" className="flex-grow mb-12">
          <h2 className="mb-8 text-3xl font-bold text-center">
            <span className="text-[#0096D6]">HP AI Laptop </span> 
            <span className="text-gray-900">Challenges</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {hpChallenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-soft hover:translate-y-[-4px] border border-gray-100 flex flex-col group relative"
                style={{ borderLeft: `4px solid ${challenge.color}` }}
              >
                {/* Skill Level Tag */}
                <div className="absolute top-3 right-3 z-10">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm skill-level-pill"
                    style={{ backgroundColor: skillLevels[challenge.skillLevel as keyof typeof skillLevels].color }}
                  >
                    {skillLevels[challenge.skillLevel as keyof typeof skillLevels].name}
                  </span>
                </div>
                
                {/* Completed badge overlay - now below skill level */}
                {isCompleted(challenge.id) && (
                  <div className="absolute top-10 right-3 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                      <CheckCircle size={12} className="mr-1" /> Completed
                    </span>
                  </div>
                )}
                
                <div className="p-6 flex-grow">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm group-hover:shadow text-2xl font-bold transition-transform group-hover:scale-110 bg-gradient-to-br from-white to-gray-100"
                        style={{ color: challenge.color, border: `2px solid ${challenge.color}` }}
                      >
                        {challenge.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        HP Challenge #{challenge.challengeNumber}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#0096D6] transition-colors line-clamp-2">
                        {challenge.title.replace('HP Challenge ' + challenge.challengeNumber + ': ', '')}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{challenge.description}</p>
                    </div>
                  </div>
                  
                  {/* Challenge message */}
                  {completionMessage && completionMessage.challengeId === challenge.id && (
                    <div className={`text-sm font-medium mt-2 py-1 px-3 rounded-md animate-pulse ${
                      completionMessage.isCompleted 
                        ? 'text-green-700 bg-green-50' 
                        : 'text-yellow-700 bg-yellow-50'
                    }`}>
                      {completionMessage.message}
                    </div>
                  )}
                </div>
                
                {/* Challenge action area - redesigned for better visual hierarchy */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto transition-colors group-hover:bg-gray-100">
                  {/* Modality type pill */}
                  <div className="flex justify-center mb-3">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm flex items-center modality-pill"
                      style={{ backgroundColor: modalityTypes[challenge.modality as keyof typeof modalityTypes].color }}
                    >
                      <span className="mr-1">{modalityTypes[challenge.modality as keyof typeof modalityTypes].icon}</span>
                      {modalityTypes[challenge.modality as keyof typeof modalityTypes].name}
                    </span>
                  </div>
                  
                  {/* Challenge type indicators */}
                  {isImplemented(challenge.id) && (
                    <div className="flex justify-center mb-3">
                      {isVoiceChallenge(challenge) && (
                        <div className="bg-blue-100 text-blue-800 p-2 rounded-full shadow-sm" title="Voice/Audio Challenge">
                          <Mic size={16} />
                        </div>
                      )}
                      {isVideoChallenge(challenge) && (
                        <div className="bg-purple-100 text-purple-800 p-2 rounded-full ml-2 shadow-sm" title="Video Challenge">
                          <Video size={16} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Challenge action button */}
                  <div className="flex justify-center mb-3">
                    {isImplemented(challenge.id) ? (
                      <Link 
                        to={challenge.path}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0096D6] to-[#0083BE] text-white rounded-lg text-sm font-medium hover:from-[#0083BE] hover:to-[#0073AE] transition-all shadow-sm text-center flex items-center justify-center group-hover:shadow"
                      >
                        <span className="relative">
                          {isCompleted(challenge.id) ? "Play Again" : "Accept Challenge"}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                        </span>
                      </Link>
                    ) : (
                      <span className="w-full py-2.5 bg-gray-100 text-gray-500 rounded-lg text-sm italic flex items-center justify-center shadow-inner">
                        <span className="mr-1">🔜</span> Coming Soon
                      </span>
                    )}
                  </div>
                  
                  {/* Challenge Completion Controls - redesigned */}
                  {isImplemented(challenge.id) && (
                    <div className="flex gap-2">
                      {!isCompleted(challenge.id) ? (
                        <button
                          onClick={() => handleMarkAsCompleted(challenge.id, challenge.title)}
                          className="w-full px-4 py-2 border border-green-300 text-green-700 bg-green-50 rounded-lg text-xs font-medium hover:bg-green-100 transition-all flex items-center justify-center"
                        >
                          <Award size={14} className="mr-1.5" /> Mark as Completed
                        </button>
                      ) : (
                        <>
                          <div className="text-center text-xs text-green-800 flex-1 flex items-center justify-center px-2 py-2 bg-green-50 rounded-lg">
                            <Award size={14} className="mr-1.5" /> Challenge completed
                          </div>
                          <button
                            onClick={() => handleUncheckChallenge(challenge.id, challenge.title)}
                            className="px-3 py-2 border border-yellow-300 text-yellow-700 bg-yellow-50 rounded-lg text-xs hover:bg-yellow-100 transition-all flex items-center justify-center"
                            title="Uncheck this challenge"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom CTA section with improved styling */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-10 rounded-2xl text-center mb-16 mt-10 shadow-sm relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200 opacity-30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-200 opacity-30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">Ready to become an AI wizard?</h2>
          <p className="text-gray-700 mb-8 max-w-xl mx-auto">New challenges added regularly. Come back often or risk your colleagues becoming more AI-savvy than you!</p>
          <a 
            href="#challenges" 
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white bg-gradient-to-r from-[#0097A7] to-[#00838F] hover:from-[#00838F] hover:to-[#006064] transition-all shadow-md hover:shadow-lg"
          >
            Start with Challenge #1
          </a>
        </div>
      </div>
    </div>
  )
}

export default ChallengeHub 