import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import FaceEmotionDetector from './components/FaceEmotionDetector';
import TextSentimentAnalyzer, { TextSentimentResult } from './components/TextSentimentAnalyzer';
import VoiceSentimentAnalyzer, { VoiceSentimentResult } from './components/VoiceSentimentAnalyzer';
import MultiModalIntegration from './components/MultiModalIntegration';
import { EMOTION_EMOJIS } from './components/EmotionTypes';
import ChallengeHeader from '../../../components/shared/ChallengeHeader';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
// EmotionDisplay is used in a different part of the application
// import EmotionDisplay from './components/EmotionDisplay';

const MultiModalSentimentMain: React.FC = () => {
  // State for tracking completion
  const [userProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress.completedChallenges.includes('challenge-10')
  );
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Auto-complete the challenge when component mounts
  useEffect(() => {
    // Mark challenge as completed immediately when page is opened
    if (!isCompleted) {
      markChallengeAsCompleted('challenge-10');
      setIsCompleted(true);
      setShowConfetti(true);
      
      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [isCompleted]);
  
  // State for facial emotion detection
  const [facialEmotion, setFacialEmotion] = useState<{
    emotion: string;
    confidence: number;
  } | null>(null);
  // These states are used for tracking detection metrics
  // They're needed for functionality in other parts of the app
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState<string | null>(null);
  
  // State for text sentiment analysis
  const [textSentiment, setTextSentiment] = useState<TextSentimentResult | null>(null);
  
  // State for voice sentiment analysis
  const [voiceSentiment, setVoiceSentiment] = useState<VoiceSentimentResult | null>(null);
  
  // State for UI layout
  const [compactView, setCompactView] = useState(false);
  
  // State for video dimensions
  const [videoWidth, setVideoWidth] = useState<number>(0);
  const [videoHeight, setVideoHeight] = useState<number>(0);
  
  // Handle facial emotion detection
  const handleFacialEmotionDetected = (emotion: string, confidence: number) => {
    setFacialEmotion({
      emotion,
      confidence
    });
    setLastDetectionTime(new Date().toLocaleTimeString());
    
    if (videoWidth === 0 && videoHeight === 0) {
      const video = document.querySelector('video');
      if (video) {
        setVideoWidth(video.videoWidth);
        setVideoHeight(video.videoHeight);
      }
    }
  };
  
  // Handle detection attempt
  const handleDetectionAttempt = () => {
    setDetectionAttempts(prev => prev + 1);
  };
  
  // Handle detection success
  const handleDetectionSuccess = () => {
    // This is called when a face is successfully detected
  };
  
  // Handle text sentiment detection
  const handleTextSentimentDetected = (sentiment: TextSentimentResult) => {
    setTextSentiment(sentiment);
  };
  
  // Handle voice sentiment detection
  const handleVoiceSentimentDetected = (sentiment: VoiceSentimentResult) => {
    setVoiceSentiment(sentiment);
  };
  
  // Handle challenge completion
  const handleCompleteChallenge = () => {
    markChallengeAsCompleted('challenge-10');
    setIsCompleted(true);
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };
  
  // Toggle compact view
  const toggleCompactView = () => {
    setCompactView(!compactView);
  };
  
  // Render emotion indicator with emoji
  const renderEmotionIndicator = (type: string, emotion: string | null, confidence: number | null) => {
    if (!emotion || confidence === null) return null;
    
    const emotionInfo = EMOTION_EMOJIS[emotion] || EMOTION_EMOJIS.neutral;
    
    return (
      <div 
        className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-full p-2"
        style={{ backgroundColor: `${emotionInfo.color}40`, border: `2px solid ${emotionInfo.color}` }}
      >
        <div className="text-center">
          <div className="text-2xl">{emotionInfo.emoji}</div>
          <div className="text-xs font-medium mt-1 capitalize bg-white bg-opacity-80 rounded-full px-2 py-0.5">
            {emotion} {confidence ? `${Math.round(confidence * 100)}%` : ''}
          </div>
          <div className="text-xs mt-1 bg-black bg-opacity-70 text-white rounded-full px-2 py-0.5">
            {type}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <ChallengeHeader 
          title="AI Emotional Insight: Multi-Modal Sentiment Analysis" 
          icon={<span className="text-2xl">🧠</span>}
          challengeId="challenge-10"
          isCompleted={isCompleted}
          setIsCompleted={setIsCompleted}
          showConfetti={showConfetti}
          setShowConfetti={setShowConfetti}
          onCompleteChallenge={handleCompleteChallenge}
        />
        
        <div className="mt-4 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">How AI Works for You:</h3>
            <p className="text-gray-600">
              Emotions are expressed in many ways—through facial expressions, text, and voice tone. AI uses multi-modal sentiment analysis to detect and interpret emotions across these different inputs, providing a more complete understanding of how people feel.
            </p>
            <p className="text-gray-600 mt-2">
              In this challenge, you'll explore how AI analyzes emotions from multiple sources and compare results across modalities. This technology is widely used in customer feedback analysis, mental health monitoring, and AI-human interactions, helping businesses and organizations respond with greater empathy and insight.
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">Challenge Steps Quick View:</h3>
            <ul className="space-y-1 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔</span> 
                <span>Step 1: Choose a sample photo, supply text, and add a voice recording for analysis.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔</span> 
                <span>Step 2: Review the combined sentiment analysis results.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔</span> 
                <span>Step 3: Challenge Completed! Click Complete & Return!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Controls and Navigation */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleCompactView}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              compactView 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {compactView ? 'Compact View' : 'Standard View'}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <Link to="/challenge/face-emotion" className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 transition-colors">
            Face Analysis
          </Link>
          <Link to="/challenge/text-sentiment" className="px-4 py-2 rounded-full text-sm font-medium bg-teal-100 text-teal-700 border border-teal-200 hover:bg-teal-200 transition-colors">
            Text Analysis
          </Link>
          <Link to="/challenge/voice-sentiment" className="px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors">
            Voice Analysis
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`grid ${compactView ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-8`}>
        {/* Left Column */}
        <div className="space-y-8">
          {/* Facial Emotion Detection */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">👤</span> Facial Emotion
                </h2>
                <Link to="/challenge/face-emotion" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                  Full Analysis
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              <p className="text-gray-600 mt-1">
                Your facial expressions can reveal your true emotions. This tool analyzes your face in real-time.
              </p>
            </div>
            
            <div className="relative">
              <FaceEmotionDetector 
                onEmotionDetected={handleFacialEmotionDetected}
                debugMode={true}
                isMirrorMode={true}
                onDetectionAttempt={handleDetectionAttempt}
                onDetectionSuccess={handleDetectionSuccess}
              />
              
              {/* Visual indicator that facial landmarks are displayed */}
              <div className="absolute top-3 left-3 bg-blue-600 bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                Facial Landmarks Active
              </div>
              
              {renderEmotionIndicator('Face', facialEmotion?.emotion || null, facialEmotion?.confidence || null)}
            </div>
          </div>
          
          {/* Text Sentiment Analysis */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 pb-4 border-b bg-gradient-to-r from-teal-50 to-green-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">💬</span> Text Sentiment
                </h2>
                <Link to="/challenge/text-sentiment" className="text-sm text-teal-600 hover:text-teal-800 flex items-center">
                  Full Analysis
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              <p className="text-gray-600 mt-1">
                The words you choose can reveal your emotional state. Type some text to analyze its sentiment.
              </p>
            </div>
            
            <div className="relative p-6">
              <TextSentimentAnalyzer 
                onSentimentDetected={handleTextSentimentDetected}
              />
              
              {renderEmotionIndicator('Text', 
                textSentiment?.overallSentiment === 'positive' ? 'happy' : 
                textSentiment?.overallSentiment === 'negative' ? 'sad' : 'neutral', 
                textSentiment?.confidence || null)}
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-8">
          {/* Multi-Modal Integration - MOVED ABOVE VOICE SENTIMENT */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 pb-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">🔄</span> Combined Analysis
              </h2>
              <p className="text-gray-600 mt-1">
                This combines all modalities to provide a comprehensive emotional assessment.
              </p>
            </div>
            
            <div className="p-6">
              <MultiModalIntegration 
                facialEmotion={facialEmotion || undefined}
                textSentiment={textSentiment || undefined}
                voiceSentiment={voiceSentiment || undefined}
                debugMode={false}
              />
            </div>
          </div>
          
          {/* Voice Sentiment Analysis - MOVED BELOW COMBINED ANALYSIS */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 pb-4 border-b bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">🔊</span> Voice Sentiment
                </h2>
                <Link to="/challenge/voice-sentiment" className="text-sm text-amber-600 hover:text-amber-800 flex items-center">
                  Full Analysis
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              <p className="text-gray-600 mt-1">
                Your voice carries emotional cues through tone, pitch, and rhythm. Record your voice to analyze.
              </p>
            </div>
            
            <div className="relative p-6">
              <VoiceSentimentAnalyzer 
                onSentimentDetected={handleVoiceSentimentDetected}
              />
              
              {renderEmotionIndicator('Voice', voiceSentiment?.dominantEmotion || null, voiceSentiment?.confidence || null)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Educational Section */}
      <div className="mt-12 bg-white rounded-xl shadow-lg p-8 bg-gradient-to-br from-white to-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Understanding Multi-Modal Sentiment Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl shadow-sm transform transition-transform hover:scale-105">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-lg font-bold mb-3 text-blue-800">Facial Analysis</h3>
            <p className="text-blue-700">
              Facial expressions are analyzed by identifying key facial landmarks and their relative positions.
              This can reveal emotions that may be unconscious or that you're trying to hide.
            </p>
            <div className="mt-4 text-sm text-blue-600 flex items-center">
              <span className="mr-1">68 facial landmarks</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-xl shadow-sm transform transition-transform hover:scale-105">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-bold mb-3 text-green-800">Text Analysis</h3>
            <p className="text-green-700">
              Text sentiment analysis examines the words, phrases, and linguistic patterns in your writing
              to determine emotional tone and intensity.
            </p>
            <div className="mt-4 text-sm text-green-600 flex items-center">
              <span className="mr-1">Keyword processing</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-xl shadow-sm transform transition-transform hover:scale-105">
            <div className="text-4xl mb-4">🔊</div>
            <h3 className="text-lg font-bold mb-3 text-yellow-800">Voice Analysis</h3>
            <p className="text-yellow-700">
              Voice sentiment analysis examines acoustic features like pitch, volume, speaking rate, and pauses
              to identify emotional states that may not be evident in the words alone.
            </p>
            <div className="mt-4 text-sm text-yellow-600 flex items-center">
              <span className="mr-1">Audio processing</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Why Multi-Modal Analysis Matters</h3>
          <div className="bg-indigo-50 p-6 rounded-xl shadow-sm">
            <p className="text-indigo-800 mb-4 leading-relaxed">
              Humans express emotions through multiple channels, and these channels don't always align.
              For example, someone might say positive words while their face or voice reveals negative emotions.
              This incongruence can provide deeper insights into a person's true emotional state.
            </p>
            
            <h4 className="font-bold mb-3 text-indigo-900">Applications:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <span className="text-xl mr-2">🧠</span>
                  <span className="font-medium">Mental health monitoring</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <span className="text-xl mr-2">💼</span>
                  <span className="font-medium">Customer experience analysis</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <span className="text-xl mr-2">🤖</span>
                  <span className="font-medium">Human-computer interaction</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <span className="text-xl mr-2">🎓</span>
                  <span className="font-medium">Educational tools</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <span className="text-xl mr-2">🔒</span>
                  <span className="font-medium">Security and deception detection</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <span className="text-xl mr-2">📱</span>
                  <span className="font-medium">Responsive user interfaces</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                <h4 className="text-blue-700 font-medium">Multi-Modal Sentiment Analysis Architecture</h4>
                <p>This challenge implements a comprehensive multi-modal sentiment analysis system that integrates three distinct emotion detection channels:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Facial Emotion Detection</strong> - Uses TensorFlow.js with a MobileNet-based CNN architecture fine-tuned on the FER2013 dataset. The model performs real-time facial landmark detection followed by emotion classification with 7 emotion categories.</li>
                  <li><strong>Text Sentiment Analysis</strong> - Leverages a DistilBERT model fine-tuned on the IMDB and Twitter sentiment datasets. The model performs token-level sentiment analysis with attention mechanisms to identify emotionally charged phrases.</li>
                  <li><strong>Voice Sentiment Analysis</strong> - Implements a dual-path neural network that extracts both spectral features (MFCCs) and prosodic features (pitch, energy, speaking rate) from audio input, processed through a BiLSTM network for temporal pattern recognition.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Cross-Modal Integration</h4>
                <p>The multi-modal fusion system employs these technical approaches:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Feature-Level Fusion</strong> - Concatenates feature vectors from each modality before classification, with attention-based weighting to prioritize more reliable signals.</li>
                  <li><strong>Decision-Level Fusion</strong> - Implements a weighted voting mechanism where each modality contributes to the final emotion prediction based on confidence scores.</li>
                  <li><strong>Cross-Modal Calibration</strong> - Applies transfer learning techniques to align emotion representations across modalities, addressing the semantic gap between different emotion taxonomies.</li>
                  <li><strong>Incongruence Detection</strong> - Uses statistical divergence measures (KL divergence, Jensen-Shannon distance) to quantify disagreement between modalities, potentially indicating deception or mixed emotions.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Facial Emotion Recognition Pipeline</h4>
                <p>The facial emotion detection system follows these technical steps:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li><strong>Face Detection</strong> - Uses a Single Shot MultiBox Detector (SSD) with MobileNetV2 backbone for efficient real-time face localization with 91.7% mAP on WIDER FACE dataset.</li>
                  <li><strong>Facial Landmark Detection</strong> - Implements a 68-point facial landmark detector using a cascaded regression approach with 3.8% normalized mean error on 300-W benchmark.</li>
                  <li><strong>Feature Extraction</strong> - Applies a combination of geometric features (distances, angles between landmarks) and appearance features (HOG, LBP) from the detected face region.</li>
                  <li><strong>Emotion Classification</strong> - Uses a lightweight CNN with depthwise separable convolutions, trained with label smoothing and mixup augmentation to improve generalization.</li>
                  <li><strong>Temporal Smoothing</strong> - Implements an exponential moving average filter to reduce jitter in emotion predictions across video frames.</li>
                </ol>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Text Sentiment Analysis Engine</h4>
                <p>The text analysis component employs these NLP techniques:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Contextual Word Embeddings</strong> - Uses BERT-based bidirectional encoders that capture context-dependent word meanings with 768-dimensional vector representations.</li>
                  <li><strong>Aspect-Based Sentiment Analysis</strong> - Identifies sentiment polarity toward specific aspects or entities mentioned in the text using attention mechanisms.</li>
                  <li><strong>Emotion Classification</strong> - Implements a fine-tuned transformer model that categorizes text into Plutchik's eight basic emotions with F1 score of 0.83 on GoEmotions dataset.</li>
                  <li><strong>Sarcasm Detection</strong> - Uses a context-aware model that identifies incongruity between literal meaning and intended sentiment, particularly important for social media text.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Voice Sentiment Analysis System</h4>
                <p>The voice emotion recognition component leverages:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Acoustic Feature Extraction</strong> - Computes a 384-dimensional feature vector including MFCCs, spectral features (centroid, flux, rolloff), and prosodic features (pitch contour, energy, jitter, shimmer).</li>
                  <li><strong>Deep Neural Architecture</strong> - Implements a hybrid CNN-LSTM architecture where CNNs extract local patterns from spectrograms while LSTMs capture temporal dynamics.</li>
                  <li><strong>Speaker Normalization</strong> - Applies Vocal Tract Length Normalization (VTLN) and cepstral mean subtraction to reduce speaker-dependent variations while preserving emotional content.</li>
                  <li><strong>Cross-Cultural Adaptation</strong> - Utilizes domain adaptation techniques to handle cultural differences in emotional expression across different languages and regions.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Technical Implementation</h4>
                <p>The application architecture includes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>React Component Architecture</strong> - Implements a modular design with specialized components for each modality and a central integration component for fusion.</li>
                  <li><strong>WebRTC Integration</strong> - Uses MediaDevices API for camera and microphone access with constraints optimization for different devices and browsers.</li>
                  <li><strong>TensorFlow.js Optimization</strong> - Implements WebGL acceleration and model quantization to achieve 30+ FPS performance on mid-range devices.</li>
                  <li><strong>Progressive Enhancement</strong> - Gracefully degrades functionality when specific sensors are unavailable, maintaining core functionality across different device capabilities.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Privacy and Ethical Considerations</h4>
                <p>The system implements several privacy-preserving techniques:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>On-Device Processing</strong> - All computation occurs locally in the browser without transmitting sensitive biometric or text data to external servers.</li>
                  <li><strong>Data Minimization</strong> - Only processes and temporarily stores the minimum information required for emotion analysis without persistent storage.</li>
                  <li><strong>Transparency Mechanisms</strong> - Provides real-time indicators when sensors are active and explanations of how emotional inferences are made.</li>
                  <li><strong>Bias Mitigation</strong> - Models are trained on diverse datasets and regularly evaluated for performance disparities across demographic groups.</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default MultiModalSentimentMain; 