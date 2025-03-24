import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import { getOpenAIKey, shouldUseMockData } from '../../../utils/envConfig';
import ChallengeHeader from '../../shared/ChallengeHeader';
import { Globe, Mic, Check, ArrowRight, Languages, MessageSquare, List, Home, Sparkles, Lightbulb, Brain } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Type declarations for recording interval
declare global {
  interface Window {
    recordingInterval?: ReturnType<typeof setInterval>;
  }
}



// Main component for the AI Global Communicator challenge
const SimplifiedGlobalCommunicator: React.FC<{ mode?: 'create' | 'view' }> = () => {
  const navigate = useNavigate();
  const [userProgress] = useUserProgress();
  
  // Challenge state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Current step (4 steps as per challenge description)
  const [currentStep, setCurrentStep] = useState<string>('input');
  const steps = ['input', 'translation', 'completion'];
  const stepTitles = ['Select Languages', 'Enter Text', 'Translate', 'Complete'];
  
  // Translation state
  const [message, setMessage] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('Japanese');
  const [formalityLevel, setFormalityLevel] = useState<string>('Formal');
  const [businessRegion, setBusinessRegion] = useState<string>('Asia');
  const [context, setContext] = useState<string>('business email');
  const [preserveIdioms, setPreserveIdioms] = useState<boolean>(false);
  const [culturalNotes] = useState<string>('');
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string>('');
  const [adaptations, setAdaptations] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [, setTranscribedText] = useState<string>('');
  const [, setIsTranscribing] = useState<boolean>(false);
  const [animateTranslation, setAnimateTranslation] = useState<boolean>(false);
  
  // Language options
  const languageOptions = [
    { value: 'Japanese', label: 'Japanese', region: 'Asia' },
    { value: 'Korean', label: 'Korean', region: 'Asia' },
    { value: 'Mandarin', label: 'Mandarin Chinese', region: 'Asia' },
    { value: 'French', label: 'French', region: 'Europe' },
    { value: 'German', label: 'German', region: 'Europe' },
    { value: 'Italian', label: 'Italian', region: 'Europe' },
    { value: 'Spanish', label: 'Spanish', region: 'Europe/Latin America' },
    { value: 'Arabic', label: 'Arabic', region: 'Middle East' },
    { value: 'Hindi', label: 'Hindi', region: 'South Asia' },
    { value: 'Portuguese', label: 'Portuguese', region: 'Europe/Latin America' },
    { value: 'Russian', label: 'Russian', region: 'Eastern Europe' },
  ];
  
  // Suggested message prompts
  const suggestedPrompts = [
    "I'm excited to discuss potential business opportunities with your company. Could we schedule a meeting next week?",
    "Thank you for your hospitality during my visit. I appreciate the warm welcome and look forward to our continued partnership.",
    "We're pleased to invite you to our annual conference on sustainable innovation next month.",
    "I apologize for the delay in our product delivery. We're working to resolve the issues as quickly as possible.",
    "Congratulations on your recent achievement! Your team's work has been truly impressive."
  ];
  
  // Check if challenge is already completed on mount
  useEffect(() => {
    if (userProgress && userProgress.completedChallenges && userProgress.completedChallenges.includes('challenge-5')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  // Setup speech recognition using react-speech-recognition library
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  
  // Update message when transcript changes
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
      setTranscribedText(transcript);
    }
  }, [transcript]);
  
  // Update isRecording state based on listening state
  useEffect(() => {
    setIsRecording(listening);
    
    // Start/stop recording time counter
    if (listening) {
      setRecordingTime(0);
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      window.recordingInterval = interval;
    } else {
      if (window.recordingInterval) {
        clearInterval(window.recordingInterval);
      }
    }
    
    return () => {
      if (window.recordingInterval) {
        clearInterval(window.recordingInterval);
      }
    };
  }, [listening]);
  
  // Handle speech-to-text conversion
  const handleRecording = () => {
    if (!isRecording) {
      // Request microphone permission first
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          // Stop the stream immediately - we just needed the permission
          stream.getTracks().forEach(track => track.stop());
          
          // Reset transcript and start listening
          resetTranscript();
          setTranscribedText('');
          SpeechRecognition.startListening({ continuous: true });
        })
        .catch(err => {
          console.error("Microphone permission error:", err);
          setError("Please allow microphone access to use the dictation feature.");
        });
    } else {
      // Stop listening
      SpeechRecognition.stopListening();
      setIsTranscribing(false);
    }
  };
  
  // Process translation with cultural adaptation
  const handleTranslation = async () => {
    if (!message.trim()) {
      setError('Please enter a message to translate');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Reset animation state
      setAnimateTranslation(false);
      
      // Check if we should use mock data
      if (shouldUseMockData()) {
        // Mock translation responses based on selected language
        if (targetLanguage === 'Japanese') {
          setTranslation('新プロジェクトのスケジュールについて話し合うため、来週会議を設定したいと思います。できるだけ早くご都合を教えていただければ幸いです。');
          setAdaptations([
            'Changed "as soon as possible" to a more polite Japanese expression',
            'Added honorific language appropriate for business context',
            'Removed direct request and used a more indirect approach',
            'Used formal grammatical structures common in Japanese business communication'
          ]);
        } else if (targetLanguage === 'French') {
          setTranslation('Nous aimerions organiser une réunion la semaine prochaine pour discuter du nouveau calendrier du projet. Je vous prie de bien vouloir me faire part de vos disponibilités dans les meilleurs délais.');
          setAdaptations([
            'Used more formal "vous" form instead of "tu"',
            'Added politeness phrases typical in French business context',
            'Adjusted tone to be more formal',
            'Changed direct request to a more elegant expression'
          ]);
        } else {
          // Default mock translation
          setTranslation(`This is a mock translation to ${targetLanguage} with cultural adaptations applied.`);
          setAdaptations([
            'Adjusted formality level to match target culture',
            'Modified direct speech patterns to suit cultural expectations',
            'Adapted time-sensitivity language to cultural norms',
            'Incorporated appropriate business etiquette phrases'
          ]);
        }
      } else {
        // Use real OpenAI API
        const apiKey = getOpenAIKey();
        
        if (!apiKey) {
          throw new Error('OpenAI API key not found. Please check your environment settings.');
        }
        
        // Prepare the prompt
        const prompt = `
Please translate the following ${context} from English to ${targetLanguage}.
Business region: ${businessRegion}
Formality level: ${formalityLevel}
Preserve idioms: ${preserveIdioms ? 'Yes' : 'No'}
Cultural notes: ${culturalNotes || 'None provided'}

Original text:
"${message}"

Please provide the translation and a list of cultural adaptations made.
`;
        
        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-2024-08-06', // Or use gpt-3.5-turbo for lower cost
            messages: [
              {
                role: 'system',
                content: `You are an expert translator specializing in business communications. You understand the cultural nuances and business etiquette of different regions.`
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse the response to extract translation and adaptations
        const translationMatch = content.match(/Translation:(.*?)(?=Cultural adaptations:|$)/s);
        const adaptationsMatch = content.match(/Cultural adaptations:(.*?)$/s);
        
        if (translationMatch && translationMatch[1]) {
          setTranslation(translationMatch[1].trim());
        } else {
          setTranslation(content.trim());
        }
        
        if (adaptationsMatch && adaptationsMatch[1]) {
          // Extract bullet points or numbered list items
          const adaptList = adaptationsMatch[1]
            .trim()
            .split(/\n/)
            .map((item: string) => item.replace(/^[-*\d.)\s]+/, '').trim())
            .filter((item: string) => item.length > 0);
          
          setAdaptations(adaptList);
        } else {
          setAdaptations(['Cultural adaptations not specifically outlined in the response']);
        }
      }
      
      // Show animation effect
      setTimeout(() => {
        setAnimateTranslation(true);
      }, 300);
      
      // Move to the next step
      setCurrentStep('translation');
      
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during translation');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle completing the challenge
  const handleCompleteChallenge = () => {
    if (!translation || translation.length < 10) {
      setError('Please complete a translation before finishing the challenge.');
      return;
    }
    
    markChallengeAsCompleted('challenge-8');
    setIsCompleted(true);
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    // Move to completion step
    setCurrentStep('completion');
  };
  
  // Render input message UI
  const renderInput = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Input Your Message</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Target Language</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex flex-col space-y-2 flex-1 min-w-[250px]">
              <label className="text-sm font-medium text-blue-700">Business Region</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={businessRegion}
                onChange={(e) => setBusinessRegion(e.target.value)}
              >
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="North America">North America</option>
                <option value="Middle East">Middle East</option>
                <option value="Latin America">Latin America</option>
              </select>
            </div>
            
            <div className="flex flex-col space-y-2 flex-1 min-w-[250px]">
              <label className="text-sm font-medium text-blue-700">Formality Level</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={formalityLevel}
                onChange={(e) => setFormalityLevel(e.target.value)}
              >
                <option value="Formal">Formal</option>
                <option value="Semi-formal">Semi-formal</option>
                <option value="Casual">Casual</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Message Context</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            >
              <option value="business email">Business Email</option>
              <option value="meeting invitation">Meeting Invitation</option>
              <option value="product announcement">Product Announcement</option>
              <option value="customer support message">Customer Support Message</option>
              <option value="sales pitch">Sales Pitch</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={preserveIdioms} 
                onChange={() => setPreserveIdioms(!preserveIdioms)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Preserve idioms when possible</span>
            </label>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-blue-700">Enter your message</label>
              <div className="flex items-center">
                <button
                  className={`p-2 rounded-full ${isRecording ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-700'} hover:bg-opacity-80 transition-all duration-200 ml-2 shadow-sm`}
                  onClick={handleRecording}
                  data-tooltip-id="mic-tooltip"
                  data-tooltip-content={isRecording ? 'Stop recording' : 'Start voice input'}
                  disabled={!browserSupportsSpeechRecognition}
                >
                  <Mic className="h-5 w-5" />
                </button>
                <Tooltip id="mic-tooltip" />
                {!browserSupportsSpeechRecognition && (
                  <span className="text-xs text-red-500 ml-2">Speech recognition not supported in this browser</span>
                )}
                {isRecording && <span className="ml-2 text-sm text-red-500 animate-pulse">Recording: {recordingTime}s</span>}
              </div>
            </div>
            <textarea
              className="border border-gray-300 rounded-lg px-3 py-2 min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
              placeholder={`Type your message here or use voice input...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            
            {/* Suggested prompts */}
            <div className="mt-3">
              <label className="text-sm font-medium text-blue-700 block mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-1 text-blue-500" />
                Suggested messages:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(prompt)}
                    className="text-left p-3 border border-blue-100 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm truncate shadow-sm hover:shadow-md"
                    title={prompt}
                  >
                    {prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {error && <div className="text-red-500">{error}</div>}
          
          <div className="flex justify-end pt-4">
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center transform hover:scale-105"
              onClick={handleTranslation}
              disabled={loading || !message.trim()}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Translating...
                </>
              ) : (
                <>
                  Translate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render translation results UI
  const renderTranslation = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center">
          <Languages className="h-6 w-6 mr-2 text-blue-500" />
          Translation Results
        </h2>
        
        <div className="space-y-6">
          <div className={`transition-all duration-500 ${animateTranslation ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}>
            <div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden transition-all duration-500 hover:shadow-xl">
              {/* Original message section */}
              <div className="p-5 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center mb-2">
                  <MessageSquare className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-700">Original Message</h3>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 break-words leading-relaxed">{message}</p>
                </div>
              </div>
              
              {/* Translation section with gradient border */}
              <div className="p-5 relative bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center mb-2">
                  <Languages className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Translation to {targetLanguage}
                  </h3>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-gradient-to-r from-blue-300 to-indigo-300 shadow-sm transform transition-all duration-300 hover:shadow-md">
                  <p className="text-gray-800 break-words leading-relaxed font-medium">{translation}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`transition-all duration-500 delay-300 ${animateTranslation ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-xl p-5 shadow-md">
              <div className="flex items-center mb-3">
                <List className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Cultural Adaptations</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <ul className="space-y-3">
                  {adaptations.map((item, index) => (
                    <li key={index} className="flex items-start bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg mb-2 shadow-sm transition-all duration-200 hover:shadow">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              className="px-6 py-3 bg-white border border-blue-200 text-blue-700 rounded-lg shadow-sm hover:bg-blue-50 transition-all duration-200 flex items-center"
              onClick={() => setCurrentStep('input')}
            >
              Edit Message
            </button>
            
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center transform hover:scale-105"
              onClick={handleCompleteChallenge}
            >
              Complete Challenge
              <Check className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render completion screen UI
  const renderCompletion = () => {
    return (
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <Check className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Challenge Completed!</h2>
          
          <p className="text-gray-700 max-w-md mx-auto leading-relaxed">
            <span className="font-semibold text-blue-600">Congratulations!</span> You've successfully completed the AI Global Communicator Challenge.
            You can now communicate effectively across cultures and languages using AI-driven translation tools.
          </p>
        </div>
        
        <div className="py-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Translation</h3>
          <div className="max-w-xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-left shadow-md">
            <p className="text-gray-800">{translation}</p>
          </div>
        </div>
        
        <button
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center mx-auto transform hover:scale-105"
          onClick={() => navigate('/')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Try Other AI Challenges
        </button>
      </div>
    );
  };
  
  // Render step navigation UI
  const renderStepNavigation = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center ${index + 1 <= steps.indexOf(currentStep) + 1 ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                step === currentStep 
                  ? 'bg-blue-600 text-white' 
                  : index <= steps.indexOf(currentStep) 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-200 text-gray-400'
              }`}
            >
              {index < steps.indexOf(currentStep) ? '✓' : index + 1}
            </div>
            <span className="text-sm hidden md:block">{stepTitles[index]}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-2">
        <div className="absolute top-0 left-4 right-4 h-1 bg-gray-200"></div>
        <div 
          className="absolute top-0 left-4 h-1 bg-blue-600" 
          style={{ width: `${(steps.indexOf(currentStep) / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 pb-16 max-w-5xl">
      <ChallengeHeader
        title="AI Global Communicator"
        icon={<Globe className="h-6 w-6 text-blue-600" />}
        challengeId="challenge-8"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
        isHPChallenge={true}
      />
      
      {/* Challenge Description */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-xl p-6 border border-blue-100">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-lg shadow-md mr-4">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">How AI Works for You</h2>
        </div>
        
        <div className="pl-2 border-l-4 border-blue-400 mb-6">
          <p className="text-gray-700 mb-4 leading-relaxed">
            AI-driven language translation tools enable seamless communication across different languages and cultures. By leveraging advanced natural language processing (NLP) and machine learning models, AI can instantly translate text and speech while preserving context, tone, and accuracy.
          </p>
          <p className="text-gray-700 leading-relaxed">
            In this challenge, you'll experience how AI transforms multilingual interactions by translating text and spoken language in real time. Whether for business meetings, global collaboration, or social engagement, AI-powered translation makes cross-language communication effortless and precise.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
            Challenge Steps Quick View
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start bg-blue-50 p-3 rounded-lg">
              <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                <span className="text-sm">1</span>
              </div>
              <span className="text-gray-800">Select Source and Target Languages – Choose the languages, region and formality you want to translate between.</span>
            </li>
            <li className="flex items-start bg-blue-50 p-3 rounded-lg">
              <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                <span className="text-sm">2</span>
              </div>
              <span className="text-gray-800">Enter Text or Speak – Provide the input text or use voice for translation, or select from a pre-selected message to input the prompt.</span>
            </li>
            <li className="flex items-start bg-blue-50 p-3 rounded-lg">
              <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                <span className="text-sm">3</span>
              </div>
              <span className="text-gray-800">Click Translate – Watch as AI processes the input and delivers the translated content.</span>
            </li>
            <li className="flex items-start bg-blue-50 p-3 rounded-lg">
              <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                <span className="text-sm">4</span>
              </div>
              <span className="text-gray-800">Challenge Completed! Click Complete & Return!</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        {currentStep === 'input' && renderInput()}
        {currentStep === 'translation' && renderTranslation()}
        {currentStep === 'completion' && renderCompletion()}
        
        {/* Step Navigation - only show if not in completion step */}
        {currentStep !== 'completion' && renderStepNavigation()}
      </div>
      
      {/* Back to Challenge Hub Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Challenge Hub
        </button>
      </div>

      {/* For the Nerds - Technical Details */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <details className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <summary className="flex items-center justify-between cursor-pointer p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-700" />
              <h3 className="text-lg font-semibold text-blue-800">For the Nerds - Technical Details</h3>
            </div>
            <div className="bg-white rounded-full p-1 shadow-sm">
              <svg className="h-5 w-5 text-blue-600 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          
          <div className="p-5 border-t border-gray-200 bg-white">
            <div className="prose max-w-none text-gray-600 text-sm space-y-4">
              <div>
                <h4 className="text-blue-700 font-medium">Translation Technology</h4>
                <p>This global communication system leverages advanced language AI technologies:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Neural Machine Translation (NMT)</strong> - Deep learning models that translate entire sentences rather than individual words</li>
                  <li><strong>Transformer Architecture</strong> - Attention-based neural networks that excel at understanding context in language</li>
                  <li><strong>GPT-based Models</strong> - Large language models trained on diverse multilingual datasets</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Speech Recognition Pipeline</h4>
                <p>The voice input system processes speech through these technical steps:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li><strong>Audio Capture</strong> - Browser's Web Audio API to capture microphone input</li>
                  <li><strong>Speech-to-Text Conversion</strong> - Using the Web Speech API for real-time transcription</li>
                  <li><strong>Language Detection</strong> - Automatic identification of source language</li>
                  <li><strong>Text Normalization</strong> - Preprocessing text to handle punctuation and special cases</li>
                  <li><strong>Translation Processing</strong> - Sending normalized text to translation models</li>
                </ol>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Cultural Context Adaptation</h4>
                <p>The system goes beyond literal translation with these advanced features:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Idiomatic Expression Handling</strong> - Recognition and appropriate translation of idioms</li>
                  <li><strong>Cultural Nuance Detection</strong> - Identifying culturally-specific references</li>
                  <li><strong>Formality Level Adjustment</strong> - Adapting language based on cultural context</li>
                  <li><strong>Contextual Disambiguation</strong> - Resolving ambiguous terms based on surrounding context</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Technical Implementation</h4>
                <p>The application architecture includes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>React Hooks</strong> - For state management and component lifecycle</li>
                  <li><strong>React Speech Recognition</strong> - JavaScript library for voice input processing</li>
                  <li><strong>OpenAI API Integration</strong> - For advanced language translation capabilities</li>
                  <li><strong>Responsive Design</strong> - Tailwind CSS for adaptive UI across devices</li>
                  <li><strong>Asynchronous Processing</strong> - Non-blocking API calls for smooth user experience</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default SimplifiedGlobalCommunicator;
