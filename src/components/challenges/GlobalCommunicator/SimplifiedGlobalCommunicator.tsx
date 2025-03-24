import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import { getOpenAIKey, shouldUseMockData } from '../../../utils/envConfig';
import ChallengeHeader from '../../shared/ChallengeHeader';
import { Globe, Mic, Check, ArrowRight, Languages } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
    recognitionInstance?: SpeechRecognition;
    recordingInterval?: ReturnType<typeof setInterval>;
  }
}

// SpeechRecognition interface
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start: () => void;
  stop: () => void;
}

// Speech recognition related interfaces
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Main component for the simplified Global Communicator challenge
const SimplifiedGlobalCommunicator: React.FC<{ mode?: 'create' | 'view' }> = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { userProgress } = useUserProgress();
  
  // Challenge state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Current step (reduced from 5 to 3 steps)
  const [currentStep, setCurrentStep] = useState<string>('input');
  const steps = ['input', 'translation', 'completion'];
  const stepTitles = ['Input Message', 'Translation', 'Complete'];
  
  // Translation state
  const [message, setMessage] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('Japanese');
  const [formalityLevel, setFormalityLevel] = useState<string>('Formal');
  const [businessRegion, setBusinessRegion] = useState<string>('Asia');
  const [context, setContext] = useState<string>('business email');
  const [preserveIdioms, setPreserveIdioms] = useState<boolean>(false);
  const [culturalNotes, setCulturalNotes] = useState<string>('');
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string>('');
  const [adaptations, setAdaptations] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
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
  
  // Check if challenge is already completed on mount
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-5')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  // Handle speech-to-text conversion
  const handleRecording = () => {
    // Toggle recording state
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      setRecordingTime(0);
      setTranscribedText('');
      
      // Use the browser's Speech Recognition API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Default to English
        
        recognition.onstart = () => {
          setIsRecording(true);
          // Start recording time counter
          const interval = setInterval(() => {
            setRecordingTime(prev => prev + 1);
          }, 1000);
          
          // Store interval ID for cleanup
          window.recordingInterval = interval;
        };
        
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update with both final and interim results
          setTranscribedText(finalTranscript + interimTranscript);
          
          // Also update the main message state with the final transcript
          if (finalTranscript) {
            setMessage(finalTranscript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech recognition failed: ${event.error}`);
          stopRecording(recognition);
        };
        
        recognition.onend = () => {
          stopRecording(recognition);
        };
        
        // Start recognition
        try {
          recognition.start();
          // Store the recognition instance for stopping later
          window.recognitionInstance = recognition;
        } catch (err) {
          console.error('Failed to start speech recognition:', err);
          setError('Failed to start speech recognition. Please try again or use text input.');
          setIsRecording(false);
        }
      } else {
        // Fallback for browsers without speech recognition support
        setError('Speech recognition is not supported in your browser. Please use text input instead.');
        setIsRecording(false);
      }
    } else {
      // Stop recording if it's already active
      if (window.recognitionInstance) {
        stopRecording(window.recognitionInstance);
      }
    }
  };
  
  // Helper function to stop recording
  const stopRecording = (recognition: SpeechRecognition | undefined) => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    
    // Clear the interval tracking recording time
    if (window.recordingInterval) {
      clearInterval(window.recordingInterval);
    }
    
    setIsRecording(false);
    setIsTranscribing(false);
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
            .map(item => item.replace(/^[-*\d.)\s]+/, '').trim())
            .filter(item => item.length > 0);
          
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
    
    markChallengeAsCompleted('challenge-5');
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
        <h2 className="text-2xl font-bold text-gray-800">Input Your Message</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Target Language</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col space-y-2 flex-1 min-w-[250px]">
              <label className="text-sm font-medium text-gray-700">Business Region</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2"
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
              <label className="text-sm font-medium text-gray-700">Formality Level</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2"
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
              className="border border-gray-300 rounded-md px-3 py-2"
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
              <label className="text-sm font-medium text-gray-700">Enter your message</label>
              <div className="flex items-center">
                <button
                  className={`p-2 rounded-full ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-opacity-80 transition-colors ml-2`}
                  onClick={handleRecording}
                  data-tooltip-id="mic-tooltip"
                  data-tooltip-content={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  <Mic className="h-5 w-5" />
                </button>
                <Tooltip id="mic-tooltip" />
                {isRecording && <span className="ml-2 text-sm text-red-500 animate-pulse">Recording: {recordingTime}s</span>}
              </div>
            </div>
            <textarea
              className="border border-gray-300 rounded-md px-3 py-2 min-h-[150px] focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Type your message here or use voice input...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          
          {error && <div className="text-red-500">{error}</div>}
          
          <div className="flex justify-end pt-4">
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center"
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
        <h2 className="text-2xl font-bold text-gray-800">Translation Results</h2>
        
        <div className="space-y-6">
          <div className={`transition-opacity duration-500 ${animateTranslation ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Original Message</h3>
                <p className="mt-1 text-gray-600 break-words">{message}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-700">Translation to {targetLanguage}</h3>
                  <Languages className="ml-2 h-5 w-5 text-blue-500" />
                </div>
                <p className="mt-1 text-gray-800 break-words font-medium">{translation}</p>
              </div>
            </div>
          </div>
          
          <div className={`transition-opacity duration-500 delay-300 ${animateTranslation ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Cultural Adaptations</h3>
              <ul className="space-y-2">
                {adaptations.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-colors flex items-center"
              onClick={() => setCurrentStep('input')}
            >
              Edit Message
            </button>
            
            <button
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow-md hover:from-green-600 hover:to-teal-600 transition-colors flex items-center"
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
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800">Challenge Completed!</h2>
          
          <p className="text-gray-600 max-w-md mx-auto">
            Congratulations! You've successfully completed the Global Communicator Challenge.
            You can now communicate effectively across cultures and languages.
          </p>
        </div>
        
        <div className="py-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Translation</h3>
          <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-lg p-4 text-left">
            <p className="text-gray-800">{translation}</p>
          </div>
        </div>
        
        <button
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 transition-colors flex items-center mx-auto"
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
        title="Global Communicator Challenge"
        icon={<Globe className="h-6 w-6 text-blue-600" />}
        challengeId="challenge-8"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
        isHPChallenge={true}
      />
      
      {/* Main content */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {currentStep === 'input' && renderInput()}
        {currentStep === 'translation' && renderTranslation()}
        {currentStep === 'completion' && renderCompletion()}
        
        {/* Step Navigation - only show if not in completion step */}
        {currentStep !== 'completion' && renderStepNavigation()}
      </div>
    </div>
  );
};

export default SimplifiedGlobalCommunicator;
