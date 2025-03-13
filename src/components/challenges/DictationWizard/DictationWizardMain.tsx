import React, { useState, useEffect } from 'react';
import { Mic, FileText, Globe, Volume2, CheckCircle } from 'lucide-react';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import AudioRecorder from './components/AudioRecorder';
import Transcription from './components/Transcription';
import TranslationComponent from './components/TranslationComponent';
import TextToSpeech from './components/TextToSpeech';
import ChallengeHeader from '../../shared/ChallengeHeader';
import axios from 'axios';

// Step enum to track user progress through the challenge
enum STEPS {
  RECORD = 'RECORD',
  TRANSCRIBE = 'TRANSCRIBE',
  TRANSLATE = 'TRANSLATE',
  VOICE = 'VOICE',
  COMPLETE = 'COMPLETE'
}

// Supported languages for translation
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' }
];

// Main component
const DictationWizardMain: React.FC = () => {
  // User progress tracking
  const [userProgress, setUserProgress] = useUserProgress();
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress.completedChallenges.includes('challenge-voice-dictation')
  );
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // State for managing the challenge flow
  const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.RECORD);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [editedTranscription, setEditedTranscription] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es'); // Default to Spanish
  const [translatedText, setTranslatedText] = useState<string>('');
  const [generatedVoiceUrl, setGeneratedVoiceUrl] = useState<string | null>(null);
  const [workflowImprovement, setWorkflowImprovement] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if challenge is already completed
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-17')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  // Handle audio recording or upload completion
  const handleAudioReady = (blob: Blob) => {
    setAudioBlob(blob);
    setAudioUrl(URL.createObjectURL(blob));
    setCurrentStep(STEPS.TRANSCRIBE);
  };
  
  // Handle transcription of the audio
  const handleTranscribe = async () => {
    if (!audioBlob) {
      setError("No audio recording found. Please record or upload audio first.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use OpenAI Whisper API for transcription
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const result = response.data.text;
      setTranscription(result);
      setEditedTranscription(result);
      setCurrentStep(STEPS.TRANSLATE);
    } catch (err) {
      console.error('Error transcribing audio:', err);
      setError("Failed to transcribe audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle translation of the text
  const handleTranslate = async () => {
    if (!editedTranscription.trim()) {
      setError("No text to translate. Please complete the transcription first.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use GPT-4-turbo for translation
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text to ${LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || 'Spanish'}.`
            },
            {
              role: 'user',
              content: editedTranscription
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
          }
        }
      );
      
      const translatedText = response.data.choices[0].message.content.trim();
      setTranslatedText(translatedText);
      setCurrentStep(STEPS.VOICE);
    } catch (err) {
      console.error('Error translating text:', err);
      setError("Failed to translate text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate voice from translated text
  const handleGenerateVoice = async () => {
    if (!translatedText.trim()) {
      setError("No translated text available. Please translate the text first.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Using Eleven Labs API to generate voice
      const voiceId = 'K4mIm9HZLpIcJUypZOl1'; // Default voice ID (Jaime)
      
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: translatedText,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': 'sk_7601838def063efaf8a5f0e72dcb8c41b54f359446e7cc89'
          },
          responseType: 'blob'
        }
      );
      
      // Create URL from blob
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedVoiceUrl(audioUrl);
      setCurrentStep(STEPS.COMPLETE);
    } catch (err) {
      console.error('Error generating voice:', err);
      setError("Failed to generate voice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle completing the challenge
  const handleCompleteChallenge = () => {
    // Check if the translation and voice parts are done
    if (!translatedText || !editedTranscription) {
      setError('Please complete the transcription and translation steps before finishing the challenge.');
      return;
    }
    
    markChallengeAsCompleted('challenge-voice-dictation');
    setIsCompleted(true);
    setCompletionMessage('Challenge completed! Great job using AI for multilingual communication!');
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };
  
  // Restart the challenge
  const handleRestart = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    setEditedTranscription('');
    setSelectedLanguage('es');
    setTranslatedText('');
    setGeneratedVoiceUrl(null);
    setWorkflowImprovement('');
    setError(null);
    setCurrentStep(STEPS.RECORD);
  };
  
  // Render progress steps
  const renderProgressSteps = () => {
    const steps = [
      { key: STEPS.RECORD, icon: <Mic size={20} />, name: 'Record Audio' },
      { key: STEPS.TRANSCRIBE, icon: <FileText size={20} />, name: 'Transcribe' },
      { key: STEPS.TRANSLATE, icon: <Globe size={20} />, name: 'Translate' },
      { key: STEPS.VOICE, icon: <Volume2 size={20} />, name: 'Generate Voice' },
      { key: STEPS.COMPLETE, icon: <CheckCircle size={20} />, name: 'Complete' }
    ];
    
    return (
      <div className="flex justify-between mb-8 w-full">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === step.key 
                  ? 'bg-green-600 text-white' 
                  : Object.values(STEPS).indexOf(currentStep) > Object.values(STEPS).indexOf(step.key) 
                    ? 'bg-green-100 text-green-600 border-2 border-green-600' 
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step.icon}
            </div>
            <span className={`mt-2 text-xs text-center ${currentStep === step.key ? 'font-bold text-green-600' : 'text-gray-500'}`}>
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div className={`hidden sm:block h-0.5 w-full absolute left-0 top-5 -z-10 ${
                Object.values(STEPS).indexOf(currentStep) > index 
                  ? 'bg-green-600' 
                  : 'bg-gray-200'
              }`} style={{ width: '100%', left: `${index * 25}%`, transform: 'translateX(50%)' }} />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render the current step content
  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.RECORD:
        return (
          <AudioRecorder 
            onAudioReady={handleAudioReady} 
          />
        );
      
      case STEPS.TRANSCRIBE:
        return (
          <Transcription 
            audioUrl={audioUrl} 
            transcription={transcription}
            editedTranscription={editedTranscription}
            setEditedTranscription={setEditedTranscription}
            onTranscribe={handleTranscribe}
            isLoading={isLoading}
          />
        );
      
      case STEPS.TRANSLATE:
        return (
          <TranslationComponent 
            text={editedTranscription}
            translatedText={translatedText}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            languages={LANGUAGES}
            onTranslate={handleTranslate}
            isLoading={isLoading}
          />
        );
      
      case STEPS.VOICE:
        return (
          <TextToSpeech 
            translatedText={translatedText}
            generatedVoiceUrl={generatedVoiceUrl}
            selectedLanguage={LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || 'Spanish'}
            onGenerateVoice={handleGenerateVoice}
            isLoading={isLoading}
          />
        );
      
      case STEPS.COMPLETE:
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Challenge Completed!</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-700">Your Transformation Journey</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-800 mb-2">Original Audio</h4>
                  {audioUrl && (
                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/webm" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
                
                <div className="bg-green-50 p-4 rounded-md">
                  <h4 className="font-medium text-green-800 mb-2">Transcribed & Edited Text</h4>
                  <p className="text-green-800">{editedTranscription}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-md">
                  <h4 className="font-medium text-purple-800 mb-2">
                    {LANGUAGES.find(lang => lang.code === selectedLanguage)?.flag} Translated Speech
                  </h4>
                  <p className="text-purple-800 mb-2">{translatedText}</p>
                  {generatedVoiceUrl && (
                    <audio controls className="w-full">
                      <source src={generatedVoiceUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How could this transcription technology speed up your workflow? (required)
              </label>
              <textarea
                value={workflowImprovement}
                onChange={(e) => setWorkflowImprovement(e.target.value)}
                placeholder="e.g., This would help me quickly document client meetings and share summaries in multiple languages..."
                className="w-full border border-gray-300 rounded-md p-3 h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleRestart}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Start Over
              </button>
              
              <button
                onClick={handleCompleteChallenge}
                disabled={!workflowImprovement.trim() || isCompleted}
                className={`px-6 py-2 rounded-md text-white ${
                  !workflowImprovement.trim() || isCompleted 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isCompleted ? "Challenge Completed!" : "Complete Challenge"}
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <ChallengeHeader
        title="AI Dictation Wizard"
        icon={<Mic className="h-6 w-6 text-green-600" />}
        challengeId="challenge-voice-dictation"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
      />
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          {/* Progress Steps */}
          <div className="relative mb-8">
            {renderProgressSteps()}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {/* Completion Message */}
          {completionMessage && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
              {completionMessage}
            </div>
          )}
          
          {/* Current Step Content */}
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default DictationWizardMain; 