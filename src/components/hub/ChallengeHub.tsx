import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useUserProgress, markChallengeAsCompleted } from '../../utils/userDataManager'
import { CheckCircle, Award, XCircle, Video, Mic, ChevronLeft, ChevronRight, Search, Filter, X as XIcon, VolumeX, Eye, Clock, BadgeCheck, Clock3, Trophy, BarChart2, Activity, Star, TrendingUp, Zap } from 'lucide-react'
import { useSwipeable } from 'react-swipeable'

// Challenge type definition
interface Challenge {
  id: string;
  challengeNumber: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  status: ChallengeStatus;
}

// Completion message type definition
interface CompletionMessage {
  challengeId: string;
  message: string; 
  isCompleted: boolean;
}

// Props interface for MobileSwipeCard
interface MobileSwipeCardProps {
  challenges: Challenge[];
  currentIndex: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isImplemented: (challengeId: string) => boolean;
  isCompleted: (challengeId: string) => boolean;
  isVoiceChallenge: (challenge: Challenge) => boolean;
  isVideoChallenge: (challenge: Challenge) => boolean;
  completionMessage: CompletionMessage | null;
  handleMarkAsCompleted: (challengeId: string, challengeName: string) => void;
  handleUncheckChallenge: (challengeId: string, challengeName: string) => void;
}

// MobileSwipeCard component for handling swipe gestures on mobile
const MobileSwipeCard: React.FC<MobileSwipeCardProps> = ({ 
  challenges, 
  currentIndex, 
  onSwipeLeft, 
  onSwipeRight, 
  isImplemented, 
  isCompleted, 
  isVoiceChallenge, 
  isVideoChallenge, 
  completionMessage, 
  handleMarkAsCompleted, 
  handleUncheckChallenge 
}) => {
  const challenge = challenges[currentIndex];
  
  // Setup swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft(),
    onSwipedRight: () => onSwipeRight(),
    preventScrollOnSwipe: true,
    trackMouse: false,
    trackTouch: true,
  });
  
  if (!challenge) return null;

  return (
    <div {...swipeHandlers} className="w-full max-w-md mx-auto relative mb-8 touch-manipulation">
      {/* Swipe indicators */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1.5 shadow-md">
        <ChevronLeft size={20} className="text-gray-400" />
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1.5 shadow-md">
        <ChevronRight size={20} className="text-gray-400" />
      </div>
      
      {/* Card slides counter */}
      <div className="absolute top-2 left-0 right-0 flex justify-center">
        <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium shadow-sm">
          {currentIndex + 1} / {challenges.length}
        </div>
      </div>
      
      {/* Challenge card */}
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 border border-gray-100 flex flex-col relative"
        style={{ borderLeft: `4px solid ${challenge.color}` }}
      >
        {/* Completed badge overlay */}
        {isCompleted(challenge.id) && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
              <CheckCircle size={14} className="mr-1" /> Completed
            </span>
          </div>
        )}
        
        <div className="p-6 flex-grow">
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex-shrink-0">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm text-2xl font-bold bg-gradient-to-br from-white to-gray-100"
                style={{ color: challenge.color, border: `2px solid ${challenge.color}` }}
              >
                {challenge.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Challenge #{challenge.challengeNumber}
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                {challenge.title}
              </h3>
              <p className="text-gray-600 text-sm">{challenge.description}</p>
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
        
        {/* Challenge action area */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
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
                className="w-full py-3 px-4 bg-gradient-to-r from-[#5CB2CC] to-[#4A90E2] text-white rounded-lg text-sm font-medium hover:from-[#4A90E2] hover:to-[#3A80D2] transition-all shadow-sm text-center flex items-center justify-center"
              >
                <span className="relative">
                  {isCompleted(challenge.id) ? "Play Again" : "Accept Challenge"}
                </span>
              </Link>
            ) : (
              <span className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg text-sm italic flex items-center justify-center shadow-inner">
                <span className="mr-1">🔜</span> Coming Soon
              </span>
            )}
          </div>
          
          {/* Challenge Completion Controls */}
          {isImplemented(challenge.id) && (
            <div className="flex gap-2">
              {!isCompleted(challenge.id) ? (
                <button
                  onClick={() => handleMarkAsCompleted(challenge.id, challenge.title)}
                  className="w-full px-4 py-3 border border-green-300 text-green-700 bg-green-50 rounded-lg text-sm font-medium hover:bg-green-100 transition-all flex items-center justify-center"
                >
                  <Award size={16} className="mr-1.5" /> Mark as Completed
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
    </div>
  );
};

// Filter types
type FilterType = 'all' | 'voice' | 'video' | 'completed' | 'incomplete';

// Define challenge status type
type ChallengeStatus = 'new' | 'popular' | 'trending' | null;

const ChallengeHub: React.FC = () => {
  // Get user progress from localStorage
  const [userProgress, setUserProgress] = useUserProgress();
  const [completionMessage, setCompletionMessage] = useState<{challengeId: string, message: string, isCompleted: boolean} | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState<number>(0);
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['all']);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showProgressDashboard, setShowProgressDashboard] = useState<boolean>(true);
  
  // Refs for scroll behavior
  const challengesRef = useRef<HTMLDivElement>(null);
  
  // Setup swipe handlers for the page
  const pageSwipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (challengesRef.current) {
        challengesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },
    preventScrollOnSwipe: false,
  });
  
  // Standard challenges with new ordering and numbering
  const challenges = [
    {
      id: 'challenge-1',
      challengeNumber: 1,
      title: 'AI Biz Strategist',
      description: "Create business strategies so smart, your competition will think you hired MBA-wielding psychics.",
      icon: '🧠',
      color: '#0097A7',
      path: '/challenge/bizstrategist',
      status: 'popular' as ChallengeStatus
    },
    {
      id: 'challenge-2',
      challengeNumber: 2,
      title: 'AI Smart Select',
      description: "Compare AI models to determine the optimal choice for different business scenarios based on response quality and cost.",
      icon: '🤖',
      color: '#0097A7',
      path: '/challenge/smartselect',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-3',
      challengeNumber: 3,
      title: 'AI Data Analyst',
      description: "Turn mountains of data into gold mines of insights—no statistician required!",
      icon: '📈',
      color: '#6200EA',
      path: '/challenge/dataanalyst',
      status: 'trending' as ChallengeStatus
    },
    {
      id: 'challenge-4',
      challengeNumber: 4,
      title: 'AI Social Media Strategist',
      description: "Build a comprehensive social media strategy with AI assistance that would make marketing agencies jealous.",
      icon: '📱',
      color: '#E91E63',
      path: '/challenge/social-media-strategist',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-5',
      challengeNumber: 5,
      title: 'AI Global Communicator',
      description: "Break language barriers and navigate cross-cultural communication with AI that understands cultural nuances.",
      icon: '🌐',
      color: '#3F51B5',
      path: '/challenge/global-communicator',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-6',
      challengeNumber: 6,
      title: 'AI Slide Master',
      description: "Create presentations that make people forget they're watching slides, not a blockbuster movie.",
      icon: '🎬',
      color: '#5CB2CC',
      path: '/challenge/slidemaster',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-7',
      challengeNumber: 7,
      title: 'AI Face ID Manager',
      description: "Demonstrate how to use face recognition technology for event check-ins or secure access.",
      icon: '👤',
      color: '#607D8B',
      path: '/challenge/face-id-manager',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-8',
      challengeNumber: 8,
      title: 'AI Emotional Insight',
      description: "Analyze emotions in content and learn how emotion recognition can transform business interactions.",
      icon: '😊',
      color: '#4CAF50',
      path: '/challenge/emotional-insight',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-9',
      challengeNumber: 9,
      title: 'AI Voice Generator Pro',
      description: "Create professional voiceovers, consistent brand voices, and accessibility features through AI-powered text-to-speech.",
      icon: '🔊',
      color: '#FF5722',
      path: '/challenge/voice-generator',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-10',
      challengeNumber: 10,
      title: 'AI Dictation Wizard',
      description: "Transform speech to text, translate to any language, and convert back to voice—all with powerful AI.",
      icon: '🎙️',
      color: '#2E7D32',
      path: '/challenge/dictation-wizard',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-11',
      challengeNumber: 11,
      title: 'AI Image Classifier',
      description: "Instantly classify images, detect objects, and extract visual insights using AI vision technologies.",
      icon: '🔍',
      color: '#5E35B1',
      path: '/challenge/image-classifier',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-ocr',
      challengeNumber: 12,
      title: 'AI OCR Assistant',
      description: "Convert printed or handwritten text from images into editable digital text.",
      icon: '📝',
      color: '#00796B',
      path: '/challenge/ocr-assistant',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-object-detection',
      challengeNumber: 13,
      title: 'AI Object Detection',
      description: "Detect and locate multiple objects in images with bounding boxes and confidence scores.",
      icon: '🔍',
      color: '#673AB7',
      path: '/challenge/object-detection',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-privacy-guardian',
      challengeNumber: 14,
      title: 'AI Privacy Guardian',
      description: "Identify and blur faces in images to protect privacy and ensure compliance with data protection regulations.",
      icon: '🛡️',
      color: '#4CAF50',
      path: '/challenge/privacy-guardian',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-object-tracking',
      challengeNumber: 15,
      title: 'AI Object Tracking in Video',
      description: "Track and follow objects across multiple video frames for movement analysis.",
      icon: '📹',
      color: '#E91E63',
      path: '/challenge/object-tracking',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-agent-magic',
      challengeNumber: 16,
      title: 'Agent Magic',
      description: "Harness the power of specialized AI agents in business workflows to deliver exceptional value through collaborative intelligence.",
      icon: '✨',
      color: '#6366F1',
      path: '/challenge/agent-magic',
      status: 'new' as ChallengeStatus
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
      path: '/challenge/trendspotter',
      status: null as ChallengeStatus
    },
    {
      id: 'additional-challenge-2',
      challengeNumber: 2,
      title: 'AI Service Pro',
      description: "Turn IT headaches into high-fives with AI that actually understands your tech support woes.",
      icon: '🦸',
      color: '#FF7F50',
      path: '/challenge/servicepro',
      status: null as ChallengeStatus
    },
    {
      id: 'additional-challenge-3',
      challengeNumber: 3,
      title: 'AI Meeting Genius',
      description: "Make meetings so efficient, you'll actually look forward to them. (Yes, seriously!)",
      icon: '⏱️',
      color: '#5CB2CC',
      path: '/challenge/meetinggenius',
      status: null as ChallengeStatus
    },
    {
      id: 'additional-challenge-4',
      challengeNumber: 4,
      title: 'AI Brainstorm Buddy',
      description: "Generate brilliantly creative solutions to your toughest business challenges—faster than a room full of consultants!",
      icon: '💡',
      color: '#FF9800',
      path: '/challenge/brainstormbuddy',
      status: null as ChallengeStatus
    },
    {
      id: 'additional-challenge-5',
      challengeNumber: 5,
      title: 'AI Communication Coach',
      description: "Write emails so good they'll think you have a tiny Shakespeare in your keyboard.",
      icon: '✉️',
      color: '#FF7F50',
      path: '/challenge/communicationcoach',
      status: null as ChallengeStatus
    },
    {
      id: 'additional-challenge-6',
      challengeNumber: 6,
      title: 'AI Policy Decoder',
      description: "Turn corporate jargon into actual human language—no legal degree required!",
      icon: '🔍',
      color: '#0097A7',
      path: '/challenge/policydecoder',
      status: null as ChallengeStatus
    },
    {
      id: 'additional-challenge-7',
      challengeNumber: 7,
      title: 'AI Ad Creative Wizard',
      description: "Craft ads so engaging, people will voluntarily turn off their ad blockers. Magic!",
      icon: '✨',
      color: '#FF7F50',
      path: '/challenge/adcreative',
      status: null as ChallengeStatus
    },
    {
      id: 'additional-challenge-8',
      challengeNumber: 8,
      title: 'AI Content Transformer',
      description: "Transform plain content into engaging, interactive experiences that captivate your audience and leave a lasting impression.",
      icon: '✏️',
      color: '#8E44AD',
      path: '/challenge/content-transformer',
      status: null as ChallengeStatus
    },
    {
      id: 'additional-challenge-9',
      challengeNumber: 9,
      title: 'AI Visual Search Explorer',
      description: "Upload images and discover relevant search queries, information, and visual insights powered by Google's Gemini 2.0 Flash.",
      icon: '🔎',
      color: '#1E88E5',
      path: '/challenge/image-search',
      status: null as ChallengeStatus
    },
    {
      id: 'additional-challenge-10',
      challengeNumber: 10,
      title: 'AI Detective League',
      description: "Experience how AI agents collaborate, use specialized tools, and solve complex problems as a team.",
      icon: '🕵️‍♂️',
      color: '#5E35B1',
      path: '/challenge/detective-league',
      status: null as ChallengeStatus
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
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-hp-companion',
      challengeNumber: 2,
      title: 'HP Challenge 2: HP AI Companion – Instant Summarizer',
      description: "Use HP AI Companion to quickly extract key points and action items from lengthy documents and emails.",
      icon: '🤖',
      color: '#0096D6',
      path: '/challenge/hp-companion',
      status: null as ChallengeStatus
    },
    {
      id: 'challenge-hp-amuze',
      challengeNumber: 3,
      title: 'HP Challenge 3: HP Amuze – Creative AI Artist',
      description: "Create stunning visuals and compelling copy in seconds using HP Amuze's AI-powered creative tools.",
      icon: '🎨',
      color: '#0096D6',
      path: '/challenge/hp-amuze',
      status: null as ChallengeStatus
    }
  ]

  // Check if a challenge is implemented
  const isImplemented = (challengeId: string) => {
    return [
      // Standard Challenges
      'challenge-1', 'challenge-2', 'challenge-3', 'challenge-4', 'challenge-5',
      'challenge-6', 'challenge-7', 'challenge-8', 'challenge-9', 'challenge-10', 'challenge-11',
      'challenge-ocr', 'challenge-object-detection', 'challenge-privacy-guardian',
      'challenge-object-tracking', 'challenge-agent-magic',
      
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

  // Filter challenges based on search query and active filters
  const applyFilters = (challenges: Challenge[]) => {
    // First filter by search query
    let filtered = challenges.filter(challenge => 
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // If 'all' is selected, skip additional filtering
    if (activeFilters.includes('all')) {
      return filtered;
    }
    
    // Then apply type filters
    if (activeFilters.includes('voice')) {
      filtered = filtered.filter(challenge => isVoiceChallenge(challenge));
    }
    
    if (activeFilters.includes('video')) {
      filtered = filtered.filter(challenge => isVideoChallenge(challenge));
    }
    
    // Apply completion status filters
    if (activeFilters.includes('completed')) {
      filtered = filtered.filter(challenge => isCompleted(challenge.id));
    }
    
    if (activeFilters.includes('incomplete')) {
      filtered = filtered.filter(challenge => !isCompleted(challenge.id));
    }
    
    return filtered;
  };

  // Apply filters to challenges
  const filteredChallenges = applyFilters(challenges);
  
  // Same for HP challenges
  const filteredHPChallenges = applyFilters(hpChallenges);

  // Handle filter button click
  const handleFilterClick = (filter: FilterType) => {
    if (filter === 'all') {
      setActiveFilters(['all']);
      return;
    }
    
    // Remove 'all' filter when selecting others
    const newFilters = activeFilters.filter(f => f !== 'all');
    
    // Toggle the selected filter
    if (newFilters.includes(filter)) {
      setActiveFilters(newFilters.filter(f => f !== filter));
      // If no filters left, set back to 'all'
      if (newFilters.length === 1) {
        setActiveFilters(['all']);
      }
    } else {
      setActiveFilters([...newFilters, filter]);
    }
    
    // Reset mobile index when filters change
    setMobileCurrentIndex(0);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters(['all']);
    setSearchQuery('');
  };

  // Handle mobile swipe navigation
  const handleSwipeLeft = () => {
    setMobileCurrentIndex(prevIndex => 
      prevIndex < filteredChallenges.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handleSwipeRight = () => {
    setMobileCurrentIndex(prevIndex => 
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

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

  // Get random recently completed challenges for the dashboard
  const getRecentActivity = () => {
    const completedChallenges = challenges.filter(challenge => 
      isCompleted(challenge.id)
    );
    
    // Shuffle and take up to 3 challenges
    return completedChallenges
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(completedChallenges.length, 3));
  };
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const implementedChallenges = challenges.filter(challenge => isImplemented(challenge.id));
    if (implementedChallenges.length === 0) return 0;
    
    return Math.round((completedCount / implementedChallenges.length) * 100);
  };
  
  // Status badge component
  const StatusBadge: React.FC<{status: ChallengeStatus}> = ({ status }) => {
    if (!status) return null;
    
    const badgeStyles: Record<string, { bg: string, text: string, icon: JSX.Element }> = {
      'new': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        icon: <Zap size={12} className="mr-1" />
      },
      'popular': { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800',
        icon: <Star size={12} className="mr-1" />
      },
      'trending': { 
        bg: 'bg-orange-100', 
        text: 'text-orange-800',
        icon: <TrendingUp size={12} className="mr-1" />
      }
    };
    
    const { bg, text, icon } = badgeStyles[status];

  return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm ${bg} ${text}`}>
        {icon} {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto" {...pageSwipeHandlers}>
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
      
      {/* Personal Progress Dashboard */}
      {showProgressDashboard && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-12 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Trophy size={18} className="mr-2 text-amber-500" /> Your AI Challenge Progress
            </h2>
            <button 
              onClick={() => setShowProgressDashboard(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close progress dashboard"
            >
              <XIcon size={18} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                  <BarChart2 size={16} className="mr-1.5 text-blue-500" /> Challenge Stats
                </h3>
                <div className="flex flex-col space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Completion rate</span>
                      <span className="font-medium text-gray-900">{getCompletionPercentage()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{width: `${getCompletionPercentage()}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Challenges completed</span>
                    <span className="font-medium text-lg text-gray-900">{completedCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Challenges remaining</span>
                    <span className="font-medium text-lg text-gray-900">
                      {challenges.filter(c => isImplemented(c.id)).length - completedCount}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Recent activity */}
              <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                  <Activity size={16} className="mr-1.5 text-blue-500" /> Recent Activity
                </h3>
                
                {getRecentActivity().length > 0 ? (
                  <div className="space-y-3">
                    {getRecentActivity().map(challenge => (
                      <div key={challenge.id} className="flex items-center bg-white p-2 rounded-lg border border-gray-100">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3"
                          style={{ backgroundColor: `${challenge.color}20`, color: challenge.color }}
                        >
                          {challenge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{challenge.title}</p>
                          <p className="text-xs text-gray-500">Completed</p>
                        </div>
                        <CheckCircle size={16} className="text-green-500 ml-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No challenges completed yet</p>
                    <p className="text-sm mt-1">Start your AI adventure by completing a challenge!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile search toggle */}
      <div className="md:hidden sticky top-16 z-30 bg-white shadow-sm rounded-full mx-4 mb-6">
        <div className="flex items-center">
          {showMobileSearch ? (
            <div className="flex items-center w-full p-2">
              <input
                type="text"
                placeholder="Search challenges..."
                className="flex-1 px-3 py-2 bg-gray-50 border-0 focus:ring-0 rounded-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button 
                onClick={() => setShowMobileSearch(false)}
                className="p-2 text-gray-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowMobileSearch(true)}
              className="flex items-center justify-between w-full p-3 text-gray-500"
            >
              <div className="flex items-center">
                <Search size={18} className="text-gray-400 mr-2" />
                <span className="text-gray-400">Search challenges...</span>
              </div>
            </button>
          )}
        </div>
      </div>
      
      {/* Filter toggle button for mobile */}
      <div className="md:hidden flex justify-center mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center px-4 py-2 bg-white rounded-full shadow-sm text-gray-700 border border-gray-200"
        >
          <Filter size={16} className="mr-2" />
          Filter Challenges
          {activeFilters.length > 0 && activeFilters[0] !== 'all' && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Filter panel for mobile - slides down when activated */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 px-4 mb-6 ${
        showFilters ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-800">Filter Challenges</h3>
            <button 
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleFilterClick('all')}
              className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center ${
                activeFilters.includes('all') 
                  ? 'bg-blue-100 text-blue-800 border-blue-200 border' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              All Challenges
            </button>
            <button
              onClick={() => handleFilterClick('voice')}
              className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center ${
                activeFilters.includes('voice') 
                  ? 'bg-blue-100 text-blue-800 border-blue-200 border' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <Mic size={12} className="mr-1" /> Voice
            </button>
            <button
              onClick={() => handleFilterClick('video')}
              className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center ${
                activeFilters.includes('video') 
                  ? 'bg-blue-100 text-blue-800 border-blue-200 border' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <Video size={12} className="mr-1" /> Video
            </button>
            <button
              onClick={() => handleFilterClick('completed')}
              className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center ${
                activeFilters.includes('completed') 
                  ? 'bg-green-100 text-green-800 border-green-200 border' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <CheckCircle size={12} className="mr-1" /> Completed
            </button>
            <button
              onClick={() => handleFilterClick('incomplete')}
              className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center ${
                activeFilters.includes('incomplete') 
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200 border' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <XIcon size={12} className="mr-1" /> Incomplete
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile swipe view - only shown on small screens */}
      <div className="md:hidden mb-12">
        <MobileSwipeCard
          challenges={filteredChallenges}
          currentIndex={mobileCurrentIndex}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          isImplemented={isImplemented}
          isCompleted={isCompleted}
          isVoiceChallenge={isVoiceChallenge}
          isVideoChallenge={isVideoChallenge}
          completionMessage={completionMessage}
          handleMarkAsCompleted={handleMarkAsCompleted}
          handleUncheckChallenge={handleUncheckChallenge}
        />
      </div>
      
      <div className="flex flex-col space-y-16">
        {/* Main Challenges Section with updated heading style */}
        <section id="challenges" className="scroll-mt-24" ref={challengesRef}>
          <div className="flex items-center justify-center mb-10">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-grow"></div>
            <h2 className="mx-6 text-3xl font-bold text-center relative px-4">
            <span className="text-gray-900">Core </span> 
            <span className="text-[#FF7F50]">AI Challenges</span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#FF7F50] opacity-30 rounded-full"></div>
          </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-grow"></div>
          </div>
          
          {/* Desktop search and filters */}
          <div className="hidden md:block mb-8">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              {/* Search input */}
              <div className="relative w-full lg:max-w-md">
                <div className="relative flex items-center">
                  <Search size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search challenges..."
                    className="w-full px-4 py-2 pl-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 text-gray-400 hover:text-gray-600"
                    >
                      <XIcon size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filter buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-wrap">
                <button
                  onClick={() => handleFilterClick('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap ${
                    activeFilters.includes('all') 
                      ? 'bg-blue-100 text-blue-800 border-blue-200 border shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterClick('voice')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap ${
                    activeFilters.includes('voice') 
                      ? 'bg-blue-100 text-blue-800 border-blue-200 border shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <Mic size={16} className="mr-1.5" /> Voice Challenges
                </button>
                <button
                  onClick={() => handleFilterClick('video')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap ${
                    activeFilters.includes('video') 
                      ? 'bg-blue-100 text-blue-800 border-blue-200 border shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <Video size={16} className="mr-1.5" /> Video Challenges
                </button>
                <button
                  onClick={() => handleFilterClick('completed')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap ${
                    activeFilters.includes('completed') 
                      ? 'bg-green-100 text-green-800 border-green-200 border shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <CheckCircle size={16} className="mr-1.5" /> Completed
                </button>
                <button
                  onClick={() => handleFilterClick('incomplete')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap ${
                    activeFilters.includes('incomplete') 
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200 border shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <XIcon size={16} className="mr-1.5" /> Not Completed
                </button>
                
                {/* Clear filters button - only show when filters are active */}
                {!activeFilters.includes('all') && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-800 flex items-center"
                  >
                    <XIcon size={16} className="mr-1.5" /> Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Showing results count */}
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredChallenges.length} {filteredChallenges.length === 1 ? 'challenge' : 'challenges'}
              {!activeFilters.includes('all') && (
                <span> with selected filters</span>
              )}
              {searchQuery && (
                <span> matching "{searchQuery}"</span>
              )}
            </div>
          </div>
          
          {/* Challenge cards grid - only shown on larger screens */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredChallenges.length > 0 ? (
              filteredChallenges.map((challenge) => (
              <div 
                key={challenge.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-soft hover:translate-y-[-4px] border border-gray-100 flex flex-col group relative"
                  style={{ borderLeft: `4px solid ${challenge.color}` }}
                >
                  {/* Status badges - positioned at the top left */}
                  {challenge.status && (
                    <div className="absolute top-3 left-3 z-10">
                      <StatusBadge status={challenge.status} />
                    </div>
                  )}
                  
                  {/* Completed badge overlay - repositioned to top corner */}
                  {isCompleted(challenge.id) && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
                        <CheckCircle size={14} className="mr-1" /> Completed
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
                          >
                              <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No challenges match your filters</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search terms or clearing some filters</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Additional Challenges Section - REMOVED AS REQUESTED */}
        {/* This section has been removed as per user request */}

        {/* HP Challenges Section - apply same pattern */}
        <section id="hp-challenges" className="flex-grow mb-12 hidden md:block">
          <h2 className="mb-8 text-3xl font-bold text-center">
            <span className="text-[#0096D6]">HP AI Laptop </span> 
            <span className="text-gray-900">Challenges</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHPChallenges.length > 0 ? (
              filteredHPChallenges.map((challenge) => (
              <div 
                key={challenge.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-soft hover:translate-y-[-4px] border border-gray-100 flex flex-col group relative"
                  style={{ borderLeft: `4px solid ${challenge.color}` }}
                >
                  {/* Completed badge overlay - repositioned to top corner */}
                  {isCompleted(challenge.id) && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
                        <CheckCircle size={14} className="mr-1" /> Completed
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
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0096D6] to-[#0074A6] text-white rounded-lg text-sm font-medium hover:from-[#0074A6] hover:to-[#005676] transition-all shadow-sm text-center flex items-center justify-center group-hover:shadow"
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
              ))
            ) : (
              <div className="col-span-full py-10 text-center">
                <p className="text-gray-500">No HP challenges match your filters</p>
              </div>
            )}
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
      
      {/* Mobile challenge navigation dots */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center md:hidden z-30">
        <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md flex space-x-1">
          {filteredChallenges.slice(0, 10).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === mobileCurrentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setMobileCurrentIndex(index)}
            />
          ))}
          {filteredChallenges.length > 10 && (
            <span className="text-xs text-gray-500 ml-1">+{filteredChallenges.length - 10}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChallengeHub 