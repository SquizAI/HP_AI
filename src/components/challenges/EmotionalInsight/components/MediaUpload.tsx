import React, { useState, useRef, useEffect } from 'react';

interface MediaUploadProps {
  onUpload: (type: 'video' | 'audio' | 'text', url: string | null, content: string | null) => void;
  onApiKeyUpdate: (apiKey: string) => void;
  apiKey: string;
  isLoading: boolean;
}

// Map of emotions to emojis
const EMOTION_EMOJIS: Record<string, { emoji: string, color: string }> = {
  'neutral': { emoji: '😐', color: '#A0AEC0' },
  'happy': { emoji: '😀', color: '#48BB78' },
  'sad': { emoji: '😥', color: '#4299E1' },
  'angry': { emoji: '😠', color: '#F56565' },
  'fearful': { emoji: '😨', color: '#ED8936' },
  'disgusted': { emoji: '🤢', color: '#9AE6B4' },
  'surprised': { emoji: '😲', color: '#9F7AEA' }
};

// Face Emotion Detector Component
const FaceEmotionDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load face-api.js models
  useEffect(() => {
    // Check if Face-API script already exists
    const scriptExists = document.getElementById('face-api-script');
    
    if (!scriptExists) {
      const script = document.createElement('script');
      script.id = 'face-api-script';
      script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
      script.async = true;
      
      script.onload = async () => {
        // Wait for the window.faceapi to be defined
        const checkFaceApi = setInterval(() => {
          if (window.faceapi) {
            clearInterval(checkFaceApi);
            loadModels();
          }
        }, 100);
      };
      
      script.onerror = () => {
        setError('Failed to load face-api.js library');
      };
      
      document.body.appendChild(script);
    } else if (window.faceapi) {
      loadModels();
    }
    
    return () => {
      // Cleanup video stream when component unmounts
      stopVideo();
    };
  }, []);
  
  const loadModels = async () => {
    try {
      // Try different model sources in order of preference
      const modelSources = [
        '/models', // Use local models in public/models folder
        'https://vladmandic.github.io/face-api/model', // Alternate CDN
        'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights' // GitHub directly
      ];
      
      let modelsLoaded = false;
      
      for (const modelPath of modelSources) {
        try {
          console.log(`Trying to load models from ${modelPath}...`);
          
          await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
            window.faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
            window.faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
            window.faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
          ]);
          
          modelsLoaded = true;
          console.log(`Face detection models loaded successfully from ${modelPath}`);
          break; // Exit the loop if models are successfully loaded
        } catch (err) {
          console.error(`Failed to load models from ${modelPath}:`, err);
          // Continue to the next source
        }
      }
      
      if (modelsLoaded) {
        setFaceApiLoaded(true);
      } else {
        setError('Failed to load face detection models. Please try again later.');
      }
    } catch (err) {
      setError('Failed to load face detection models');
      console.error('Error loading models:', err);
    }
  };
  
  const startVideo = async () => {
    setError(null);
    
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          } 
        });
        
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Error accessing camera:', err);
    }
  };
  
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };
  
  const detectExpressions = async () => {
    if (!isActive || !videoRef.current || !canvasRef.current || !window.faceapi) return;
    
    try {
      const detections = await window.faceapi.detectAllFaces(
        videoRef.current, 
        new window.faceapi.TinyFaceDetectorOptions()
      )
        .withFaceLandmarks()
        .withFaceExpressions();
      
      if (detections && detections.length > 0) {
        // Get the detection with highest confidence
        const detection = detections[0];
        const expressions = detection.expressions;
        
        // Find the emotion with highest confidence
        let highestEmotion = 'neutral';
        let highestConfidence = 0;
        
        for (const [emotion, confidence] of Object.entries(expressions)) {
          if ((confidence as number) > highestConfidence) {
            highestConfidence = confidence as number;
            highestEmotion = emotion;
          }
        }
        
        setCurrentEmotion(highestEmotion);
        
        // Draw the results on canvas
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        };
        
        window.faceapi.matchDimensions(canvas, displaySize);
        
        const resizedDetections = window.faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          window.faceapi.draw.drawDetections(canvas, resizedDetections);
          window.faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }
      }
    } catch (err) {
      console.error('Error in face detection:', err);
    }
    
    // Continue detecting
    requestAnimationFrame(detectExpressions);
  };
  
  // Start detection when video loads
  const handleVideoPlay = () => {
    if (faceApiLoaded) {
      detectExpressions();
    }
  };
  
  return (
    <div className="mt-4 relative">
      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ width: '100%', maxWidth: '640px' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onPlay={handleVideoPlay}
            className="w-full"
          />
          <canvas 
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full z-10"
          />
          
          {/* Emotion display */}
          {isActive && (
            <div 
              className="absolute bottom-4 right-4 rounded-full p-3 z-20 flex items-center justify-center"
              style={{ 
                backgroundColor: EMOTION_EMOJIS[currentEmotion]?.color || EMOTION_EMOJIS.neutral.color,
                width: '80px',
                height: '80px',
                transition: 'all 0.3s ease'
              }}
            >
              <span className="text-4xl" role="img" aria-label={currentEmotion}>
                {EMOTION_EMOJIS[currentEmotion]?.emoji || EMOTION_EMOJIS.neutral.emoji}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex space-x-2">
          {!isActive ? (
            <button
              onClick={startVideo}
              disabled={!faceApiLoaded}
              className={`px-4 py-2 rounded-md ${
                faceApiLoaded 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {faceApiLoaded ? 'Start Camera' : 'Loading Models...'}
            </button>
          ) : (
            <button
              onClick={stopVideo}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Stop Camera
            </button>
          )}
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <p>The AI will detect your facial expressions in real-time and display the corresponding emoji.</p>
        </div>
      </div>
    </div>
  );
};

const MediaUpload: React.FC<MediaUploadProps> = ({ 
  onUpload, 
  onApiKeyUpdate,
  apiKey, 
  isLoading 
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'text'>('video');
  const [textContent, setTextContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showFaceEmotionDetector, setShowFaceEmotionDetector] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Demo content examples
  const demoText = "I'm really excited about the potential of AI to transform how businesses understand customer emotions. This technology could revolutionize how we create personalized experiences.";
  const demoVideoUrl = "https://example.com/demo-video.mp4";
  const demoAudioUrl = "https://example.com/demo-audio.mp3";
  
  const handleTabChange = (tab: 'video' | 'audio' | 'text') => {
    setActiveTab(tab);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // In a real implementation, we would upload the file to a server
    // and get a URL back. For now, we'll create a temporary object URL.
    const url = URL.createObjectURL(file);
    
    if (activeTab === 'video') {
      setVideoUrl(url);
    } else if (activeTab === 'audio') {
      setAudioUrl(url);
    }
  };
  
  const handleSubmit = () => {
    if (activeTab === 'video' && videoUrl) {
      onUpload('video', videoUrl, null);
    } else if (activeTab === 'audio' && audioUrl) {
      onUpload('audio', audioUrl, null);
    } else if (activeTab === 'text' && textContent.trim()) {
      onUpload('text', null, textContent);
    }
  };
  
  const loadDemoContent = () => {
    if (activeTab === 'video') {
      setVideoUrl(demoVideoUrl);
    } else if (activeTab === 'audio') {
      setAudioUrl(demoAudioUrl);
    } else if (activeTab === 'text') {
      setTextContent(demoText);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload Content for Emotion Analysis</h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Upload or input content that contains emotional expressions. 
          AI will analyze the emotions displayed and provide insights.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-blue-800 text-sm font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Challenge Instructions
          </h3>
          <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Upload a short clip with one clear emotion</li>
            <li>The AI will analyze what emotion is being expressed</li>
            <li>Reflect on accuracy and potential business applications</li>
          </ul>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'video'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabChange('video')}
          >
            Video
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'audio'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabChange('audio')}
          >
            Audio
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'text'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabChange('text')}
          >
            Text
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="py-6">
        {activeTab === 'video' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <label htmlFor="video-upload" className="block text-sm font-medium text-gray-700">
                Upload a video file showing facial expressions
              </label>
              
              <button
                type="button"
                onClick={() => setShowFaceEmotionDetector(!showFaceEmotionDetector)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showFaceEmotionDetector ? 'Hide' : 'Try'} Real-time Analysis
              </button>
            </div>
            
            {showFaceEmotionDetector ? (
              <FaceEmotionDetector />
            ) : (
              <>
                <div className="flex items-center">
                  <input
                    type="file"
                    id="video-upload"
                    ref={fileInputRef}
                    accept="video/*"
                    className="sr-only"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Browse files
                  </button>
                  <span className="ml-3 text-sm text-gray-500">
                    {videoUrl ? 'Video selected' : 'No video selected'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                    Or enter a video URL
                  </label>
                  <input
                    type="url"
                    id="video-url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    disabled={isLoading}
                  />
                </div>
                
                {videoUrl && (
                  <div className="mt-4 border border-gray-200 rounded-md overflow-hidden">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-auto"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'audio' && (
          <div>
            <div className="mb-4">
              <label htmlFor="audio-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload an audio file with vocal expressions
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  id="audio-upload"
                  ref={fileInputRef}
                  accept="audio/*"
                  className="sr-only"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Browse files
                </button>
                <span className="ml-3 text-sm text-gray-500">
                  {audioUrl ? 'Audio selected' : 'No audio selected'}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="audio-url" className="block text-sm font-medium text-gray-700 mb-2">
                Or enter an audio URL
              </label>
              <input
                type="url"
                id="audio-url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://example.com/audio.mp3"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                disabled={isLoading}
              />
            </div>
            
            {audioUrl && (
              <div className="mt-4">
                <audio
                  src={audioUrl}
                  controls
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'text' && (
          <div>
            <div className="mb-4">
              <label htmlFor="text-content" className="block text-sm font-medium text-gray-700 mb-2">
                Enter text content with emotional expression
              </label>
              <textarea
                id="text-content"
                rows={6}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter text that expresses emotions, such as customer feedback, social media posts, or email communications..."
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-500">
                {textContent.length} characters
              </p>
            </div>
          </div>
        )}
        
        {/* API Settings */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className={`h-5 w-5 mr-1 transform ${showApiSettings ? 'rotate-180' : ''} transition-transform`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              API Settings
            </button>
            
            <button
              type="button"
              onClick={loadDemoContent}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              Load Demo Content
            </button>
          </div>
          
          {showApiSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="mb-4">
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                  Hume AI API Key
                </label>
                <input
                  type="text"
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => onApiKeyUpdate(e.target.value)}
                  placeholder="Enter your Hume AI API key"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The default API key is provided for demonstration purposes only.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Submit button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || (!videoUrl && !audioUrl && !textContent.trim())}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isLoading || (!videoUrl && !audioUrl && !textContent.trim())
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                Analyze Emotions
                <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add this TypeScript declaration
declare global {
  interface Window {
    faceapi: any;
  }
}

export default MediaUpload; 