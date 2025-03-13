import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Play, Download, RefreshCw, Check, Globe, Volume2, Wand2, Mic } from 'lucide-react';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import axios from 'axios';
import Confetti from '../../shared/Confetti';
import ChallengeHeader from '../../shared/ChallengeHeader';

// Eleven Labs voices - these are some popular voices from their library
const ELEVEN_LABS_VOICES = [
  { id: 'K4mIm9HZLpIcJUypZOl1', name: 'Jaime', description: 'Conversational, friendly professional tone', gender: 'male' },
  { id: '2gPFXx8pN3Avh27Dw5Ma', name: 'Oxley', description: 'Dramatic, villainous character voice', gender: 'male' },
  { id: 'cla3YFxFwdDazSiKsv9U', name: 'Alexander', description: 'Clean, confident, deep masculine voice', gender: 'male' },
  { id: '5Q0t7uMcjvnagumLfvZi', name: 'Paul', description: 'Warm, natural-sounding male voice', gender: 'male' }
];

// Language options
const LANGUAGES = [
  { id: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { id: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { id: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { id: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { id: 'de-DE', name: 'German', flag: '🇩🇪' },
  { id: 'ja-JP', name: 'Japanese', flag: '🇯🇵' }
];

// Voice Generator component
const VoiceGeneratorMain: React.FC = () => {
  // Get user progress
  const [userProgress, setUserProgress] = useUserProgress();
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  
  // Main state
  const [script, setScript] = useState<string>("");
  const [scriptPrompt, setScriptPrompt] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>(ELEVEN_LABS_VOICES[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState<boolean>(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedAudioUrlAlt, setGeneratedAudioUrlAlt] = useState<string | null>(null);
  const [isVoicesOpen, setIsVoicesOpen] = useState<boolean>(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState<boolean>(false);
  const [businessUseCase, setBusinessUseCase] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Check if challenge is already completed
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-16')) {
      setIsCompleted(true);
    }
  }, [userProgress]);

  // Effect to handle language changes
  useEffect(() => {
    // Update UI elements but don't clear script automatically
    // This will refresh placeholders that use the language
    const languageName = LANGUAGES.find(lang => lang.id === selectedLanguage)?.name || 'English';
    
    // If there's already a generated script, show a note about language mismatch
    if (generatedAudioUrl && script) {
      setError(`Note: You've changed the language. You may want to generate a new script in ${languageName}.`);
      
      // Clear the error after 5 seconds
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedLanguage]);

  // Audio refs for playback
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRefAlt = useRef<HTMLAudioElement>(null);

  // Generate script with GPT-4o-mini
  const generateScript = async () => {
    if (!scriptPrompt.trim()) {
      setError("Please enter a prompt for script generation");
      return;
    }
    
    setIsGeneratingScript(true);
    setError(null);
    
    // Get the language name for the system prompt
    const language = LANGUAGES.find(lang => lang.id === selectedLanguage);
    const languageName = language ? language.name.replace(/\(.+\)/, '').trim() : 'English';
    
    try {
      // Call OpenAI API with GPT-4o-mini model
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that creates short, engaging scripts in ${languageName}. Limit your response to 2-3 sentences that would sound good when read aloud. Respond ONLY in ${languageName}.`
          },
          {
            role: 'user',
            content: scriptPrompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        }
      });
      
      const generatedScript = response.data.choices[0].message.content.trim();
      setScript(generatedScript);
    } catch (err) {
      console.error('Error generating script:', err);
      setError("Failed to generate script. Please try again.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Generate voice with Eleven Labs
  const generateVoice = async () => {
    if (!script.trim()) {
      setError("Please generate or enter a script first");
      return;
    }
    
    setIsGeneratingVoice(true);
    setError(null);
    
    try {
      // Call Eleven Labs API to generate voice
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
        {
          text: script,
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
      
      // Create a blob URL for the audio
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudioUrl(audioUrl);
    } catch (err) {
      console.error('Error generating voice:', err);
      setError("Failed to generate voice. Please try again.");
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Generate alternative voice
  const generateAlternativeVoice = async () => {
    if (!script.trim()) {
      setError("Please generate or enter a script first");
      return;
    }
    
    setIsGeneratingVoice(true);
    setError(null);
    
    // Select a different voice for the alternative
    const currentVoice = ELEVEN_LABS_VOICES.find(voice => voice.id === selectedVoice);
    const alternativeVoices = ELEVEN_LABS_VOICES.filter(voice => voice.id !== selectedVoice);
    const alternativeVoice = alternativeVoices[Math.floor(Math.random() * alternativeVoices.length)];
    
    try {
      // Call Eleven Labs API to generate voice with alternative voice
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${alternativeVoice.id}`,
        {
          text: script,
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
      
      // Create a blob URL for the audio
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudioUrlAlt(audioUrl);
    } catch (err) {
      console.error('Error generating alternative voice:', err);
      setError("Failed to generate alternative voice. Please try again.");
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Handle completion of the challenge
  const handleChallengeComplete = () => {
    if (!businessUseCase.trim()) {
      setError('Please enter a business use case for this technology first');
      return;
    }
    
    if (!generatedAudioUrl) {
      setError('Please generate at least one voice sample first');
      return;
    }
    
    const wasCompleted = markChallengeAsCompleted('challenge-16');
    setIsCompleted(true);
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    setCompletionMessage('Challenge completed! You have mastered AI voice generation!');
    
    // Hide completion message after a few seconds
    setTimeout(() => {
      setCompletionMessage(null);
    }, 5000);
  };

  // Reset the generation
  const handleReset = () => {
    setGeneratedAudioUrl(null);
    setGeneratedAudioUrlAlt(null);
    setBusinessUseCase('');
    setScript('');
    setScriptPrompt('');
    setError(null);
  };

  // Play the generated audio
  const playAudio = (ref: React.RefObject<HTMLAudioElement>) => {
    if (ref.current) {
      ref.current.play();
    }
  };

  // Helper function to get language name from ID
  const getLanguageName = (id: string) => {
    const language = LANGUAGES.find(lang => lang.id === id);
    return language ? `${language.flag} ${language.name}` : id;
  };

  // Helper function to get voice name from ID
  const getVoiceName = (id: string) => {
    const voice = ELEVEN_LABS_VOICES.find(voice => voice.id === id);
    return voice ? voice.name : id;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Add the standardized challenge header */}
      <ChallengeHeader
        title="AI Voice Generator Pro"
        icon={<Mic className="h-6 w-6 text-orange-600" />}
        challengeId="challenge-16"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleChallengeComplete}
      />
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
          <div className="flex items-center mb-2">
            <Mic size={36} className="mr-3" /> {/* Bigger logo icon */}
            <h1 className="text-3xl font-bold">AI Voice Generator Pro</h1>
          </div>
          <p className="text-lg opacity-90">
            Create professional voiceovers, brand voices, and accessibility features with AI-powered text-to-speech
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Create Your Script</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter a prompt to generate a script with AI
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={scriptPrompt}
                  onChange={(e) => setScriptPrompt(e.target.value)}
                  placeholder={`e.g., Create a welcome message for a tech company website (in ${getLanguageName(selectedLanguage)})`}
                  className="flex-1 border border-gray-300 rounded-l-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={generateScript}
                  disabled={isGeneratingScript || !scriptPrompt.trim()}
                  className={`px-4 rounded-r-md text-white font-medium flex items-center transition-colors ${isGeneratingScript || !scriptPrompt.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {isGeneratingScript ? (
                    <RefreshCw size={20} className="animate-spin" />
                  ) : (
                    <Wand2 size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Powered by GPT-4o-mini | Script will be generated in {getLanguageName(selectedLanguage)}
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your script
              </label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder={`Your script will appear here, or type your own in ${getLanguageName(selectedLanguage)} (2-3 sentences recommended)`}
                className="w-full border border-gray-300 rounded-md p-3 h-32 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Voice Selector */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Voice</label>
                <button
                  type="button"
                  className="bg-white border border-gray-300 rounded-md px-4 py-2 inline-flex justify-between items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onClick={() => setIsVoicesOpen(!isVoicesOpen)}
                >
                  <span>{getVoiceName(selectedVoice)}</span>
                  {isVoicesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {isVoicesOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto">
                    {ELEVEN_LABS_VOICES.map((voice) => (
                      <div
                        key={voice.id}
                        className={`cursor-pointer select-none relative px-4 py-2 ${selectedVoice === voice.id ? 'bg-orange-100 text-orange-900' : 'text-gray-900 hover:bg-orange-50'}`}
                        onClick={() => {
                          setSelectedVoice(voice.id);
                          setIsVoicesOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <span className="font-medium block truncate">{voice.name}</span>
                          {selectedVoice === voice.id && (
                            <span className="text-orange-600 absolute inset-y-0 right-0 flex items-center pr-4">
                              <Check size={18} />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{voice.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Language Selector */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Script & Voice Language</label>
                <button
                  type="button"
                  className="bg-white border border-gray-300 rounded-md px-4 py-2 inline-flex justify-between items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onClick={() => setIsLanguagesOpen(!isLanguagesOpen)}
                >
                  <span>{getLanguageName(selectedLanguage)}</span>
                  {isLanguagesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {isLanguagesOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto">
                    {LANGUAGES.map((language) => (
                      <div
                        key={language.id}
                        className={`cursor-pointer select-none relative px-4 py-2 ${selectedLanguage === language.id ? 'bg-orange-100 text-orange-900' : 'text-gray-900 hover:bg-orange-50'}`}
                        onClick={() => {
                          setSelectedLanguage(language.id);
                          setIsLanguagesOpen(false);
                        }}
                      >
                        <span className="font-medium block truncate">
                          {language.flag} {language.name}
                        </span>
                        {selectedLanguage === language.id && (
                          <span className="text-orange-600 absolute inset-y-0 right-0 flex items-center pr-4">
                            <Check size={18} />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {/* Generate Voice Button */}
            <div className="flex justify-center">
              <button
                onClick={generateVoice}
                disabled={isGeneratingVoice || !script.trim()}
                className={`px-6 py-3 rounded-md text-white font-medium flex items-center space-x-2 transition-colors ${isGeneratingVoice || !script.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
              >
                {isGeneratingVoice ? (
                  <>
                    <RefreshCw size={20} className="animate-spin mr-2" />
                    <span>Generating Voice...</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={20} className="mr-2" />
                    <span>Generate Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Results Section */}
          {generatedAudioUrl && (
            <div className="border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Your Generated Voices</h2>
              
              {/* First Voice */}
              <div className="mb-6 bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-800">
                    {getVoiceName(selectedVoice)} ({getLanguageName(selectedLanguage)})
                  </h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => playAudio(audioRef)}
                      className="p-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors"
                    >
                      <Play size={18} />
                    </button>
                    <a 
                      href={generatedAudioUrl}
                      download={`${getVoiceName(selectedVoice)}-voice.mp3`}
                      className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{script}</p>
                <audio ref={audioRef} src={generatedAudioUrl} className="hidden" />
              </div>
              
              {/* Generate Alternative Button */}
              {!generatedAudioUrlAlt && (
                <div className="mb-6 flex justify-center">
                  <button
                    onClick={generateAlternativeVoice}
                    disabled={isGeneratingVoice}
                    className={`px-5 py-2 rounded-md font-medium flex items-center space-x-2 transition-colors ${isGeneratingVoice ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {isGeneratingVoice ? (
                      <>
                        <RefreshCw size={16} className="animate-spin mr-2" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} className="mr-2" />
                        <span>Generate Alternative Voice</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Alternative Voice */}
              {generatedAudioUrlAlt && (
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">
                      Alternative Voice ({getLanguageName(selectedLanguage)})
                    </h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => playAudio(audioRefAlt)}
                        className="p-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors"
                      >
                        <Play size={18} />
                      </button>
                      <a 
                        href={generatedAudioUrlAlt}
                        download="alternative-voice.mp3"
                        className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{script}</p>
                  <audio ref={audioRefAlt} src={generatedAudioUrlAlt} className="hidden" />
                </div>
              )}
              
              {/* Business Use Case */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where might you use this voice? (e.g., marketing video, on-hold message)
                </label>
                <input
                  type="text"
                  value={businessUseCase}
                  onChange={(e) => setBusinessUseCase(e.target.value)}
                  placeholder="Enter your business use case"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <button
                  onClick={handleReset}
                  className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors flex-1 flex items-center justify-center"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Start Over
                </button>
                
                <button
                  onClick={handleChallengeComplete}
                  disabled={!businessUseCase.trim() || isCompleted || !generatedAudioUrlAlt}
                  className={`px-5 py-2 rounded-md text-white font-medium flex-1 flex items-center justify-center ${!businessUseCase.trim() || isCompleted || !generatedAudioUrlAlt ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  <Check size={18} className="mr-2" />
                  {isCompleted ? "Challenge Completed!" : "Complete Challenge"}
                </button>
              </div>
            </div>
          )}
          
          {/* Extra Challenge Section */}
          {generatedAudioUrl && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Extra Challenge</h2>
              <p className="mb-4 text-gray-600">Take it further with these advanced options:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-md border border-orange-100">
                  <div className="flex items-center mb-2">
                    <Globe size={20} className="text-orange-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Language Variation</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Generate your script in another language or accent to expand your global reach.
                  </p>
                  <button 
                    className="w-full px-4 py-2 bg-white border border-orange-200 text-orange-600 rounded-md hover:bg-orange-100 transition-colors text-sm font-medium"
                    onClick={() => setIsLanguagesOpen(true)}
                  >
                    Try Different Language
                  </button>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-md border border-orange-100">
                  <div className="flex items-center mb-2">
                    <Volume2 size={20} className="text-orange-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Brand Persona</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Experiment with different voices to find one that matches your brand's persona.
                  </p>
                  <button 
                    className="w-full px-4 py-2 bg-white border border-orange-200 text-orange-600 rounded-md hover:bg-orange-100 transition-colors text-sm font-medium"
                    onClick={() => setIsVoicesOpen(true)}
                  >
                    Try Different Voice
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Completion Message */}
      {completionMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md animate-fade-in">
          {completionMessage}
        </div>
      )}
    </div>
  );
};

export default VoiceGeneratorMain; 