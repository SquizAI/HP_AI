import React, { useState, useRef, useEffect } from 'react';
import { Shield, Image as ImageIcon, RefreshCw, Check, AlertTriangle, Award, Sliders, Info, Lightbulb, Brain } from 'lucide-react';
import { useChallengeStatus } from '../../../utils/userDataManager';
import Confetti from '../../shared/Confetti';
import ChallengeHeader from '../../shared/ChallengeHeader';
import RealtimeFaceBlur from './components/RealtimeFaceBlur';

// Sample images for demonstration
const SAMPLE_IMAGES = [
  {
    id: 'sample-1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    title: 'Business Meeting',
    description: 'Group of people in a business meeting'
  },
  {
    id: 'sample-2',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop',
    title: 'Conference Speaker',
    description: 'Speaker presenting at a conference'
  },
  {
    id: 'sample-3',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop',
    title: 'Office Team',
    description: 'Team meeting in an office setting'
  },
  {
    id: 'sample-4',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1887&auto=format&fit=crop',
    title: 'Corporate Event',
    description: 'People at a corporate event'
  }
];

interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
  blurred: boolean;
}

// Face detection box types are handled in the RealtimeFaceBlur component

const PrivacyGuardianMain: React.FC = () => {
  // Use the standardized hook for challenge status management
  const { 
    isCompleted, 
    setIsCompleted, 
    showConfetti, 
    setShowConfetti,
    handleCompleteChallenge,
    challengeId 
  } = useChallengeStatus('challenge-6'); // Use standard ID from ChallengeHubNew.tsx
  
    // Face detection state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detectionProgress, setDetectionProgress] = useState<number>(0);
  const [detectionMessage, setDetectionMessage] = useState<string>('');
  const [faceCount, setFaceCount] = useState<number>(0);
  
  // We'll use the standard showConfetti state from useChallengeStatus hook
  
  // State for the image and face detection
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);

  
  // Settings for the RealtimeFaceBlur component
  const [blurIntensity, setBlurIntensity] = useState<number>(20);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [isFaceApiLoaded, setIsFaceApiLoaded] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // No longer need to manually check completion status - handled by useChallengeStatus hook
  
  // Load face-api.js for facial recognition
  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        setIsLoading(true);
        setDetectionProgress(10);
        setDetectionMessage('Loading face detection...');
        
        // Check if Face-API script already exists
        const scriptExists = document.getElementById('face-api-script');
        
        if (!scriptExists) {
          const script = document.createElement('script');
          script.id = 'face-api-script';
          script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.9/dist/face-api.js';
          script.async = true;
          
          script.onload = async () => {
            await loadFaceDetectionModels();
          };
          
          document.body.appendChild(script);
        } else if (window.faceapi) {
          await loadFaceDetectionModels();
        }
      } catch (err) {
        console.error('Error loading face-api.js:', err);
        setError('Failed to load face detection library. Please try again later.');
        setIsLoading(false);
      }
    };
    
    loadFaceApi();
  }, []);
  
  const loadFaceDetectionModels = async () => {
    try {
      setDetectionProgress(30);
      setDetectionMessage('Loading detection models...');
      
      // @ts-ignore - faceapi is loaded from CDN
      if (!window.faceapi) {
        throw new Error('Face API not loaded');
      }
      
      // Try different model paths
      const modelPaths = [
        '/models/face-api',
        'https://justadudewhohacks.github.io/face-api.js/models',
        'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'
      ];
      
      let modelsLoaded = false;
      
      for (const modelPath of modelPaths) {
        try {
          // @ts-ignore - faceapi is loaded from CDN
          await window.faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
          console.log('Face detection models loaded successfully from', modelPath);
          modelsLoaded = true;
          break;
        } catch (err) {
          console.warn(`Failed to load models from ${modelPath}, trying next source...`);
        }
      }
      
      if (!modelsLoaded) {
        throw new Error('Could not load face detection models from any source');
      }
      
      setIsFaceApiLoaded(true);
      setDetectionProgress(100);
      setDetectionMessage('Face detection ready!');
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading face detection models:', err);
      setError(`Failed to load face detection models: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        setSelectedImage(e.target.result as string);
        setProcessedImage(null);
        setDetectedFaces([]);
        setError(null);
        // Turn off live mode when an image is uploaded
        setIsLiveMode(false);
        
        // Automatically process the image after a short delay to allow the image to load
        setTimeout(() => {
          processStaticImage();
        }, 100);
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleSampleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setProcessedImage(null);
    setDetectedFaces([]);
    setError(null);
    // Turn off live mode when a sample image is selected
    setIsLiveMode(false);
    
    // Automatically process the image after a short delay to allow the image to load
    setTimeout(() => {
      processStaticImage();
    }, 100);
  };
  
  const handleFacesDetected = (count: number) => {
    setFaceCount(count);
  };
  
  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode);
    if (!isLiveMode) {
      // Clear the static image processing when switching to live mode
      setSelectedImage(null);
      setProcessedImage(null);
      setDetectedFaces([]);
    }
  };
  
  // Using the standardized handleCompleteChallenge from useChallengeStatus hook
  
  // Process static image to detect and blur faces
  const processStaticImage = async () => {
    if (!selectedImage || !isFaceApiLoaded) {
      setError(isFaceApiLoaded ? 'Please select an image first' : 'Face detection is not ready yet');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setProgressMessage('Processing image...');
    
    try {
      const img = new Image();
      // Add crossOrigin attribute to handle CORS issues
      img.crossOrigin = 'anonymous';
      img.src = selectedImage;
      
      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      
      // Create canvas with image dimensions
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Draw original image to canvas
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Detect faces in the image
      setProgressMessage('Detecting faces...');
      
      try {
        // Optimize detection parameters for faster processing
        // @ts-ignore - faceapi is loaded from CDN
        const options = new window.faceapi.TinyFaceDetectorOptions({ 
          scoreThreshold: 0.3,
          inputSize: 320  // Use smaller input size for faster detection
        });
        
        // @ts-ignore - faceapi is loaded from CDN
        const detections = await window.faceapi.detectAllFaces(img, options);
        console.log('Detected faces:', detections.length, detections);
        
        // Apply blur to each detected face
        setProgressMessage(`${detections.length} face(s) detected. Applying privacy protection...`);
        const faces: DetectedFace[] = [];
        
        // Simple and fast pixelation algorithm
        if (detections.length > 0) {
          for (const detection of detections) {
            const box = detection.box;
            faces.push({
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              blurred: false
            });
            
            // Apply padding around face for better privacy
            const padding = Math.min(box.width, box.height) * 0.2;
            const x = Math.max(0, box.x - padding);
            const y = Math.max(0, box.y - padding);
            const width = box.width + (padding * 2);
            const height = box.height + (padding * 2);
            
            // Get the face region
            const faceData = ctx.getImageData(x, y, width, height);
            
            // Calculate pixelation size - this is crucial for performance
            // Larger blocks = faster processing and more obvious privacy protection
            const pixelSize = Math.max(10, Math.floor(Math.min(width, height) / 10));
            
            // Simplified pixelation algorithm (much faster)
            for (let blockY = 0; blockY < height; blockY += pixelSize) {
              for (let blockX = 0; blockX < width; blockX += pixelSize) {
                // Get the color of the first pixel in the block
                const blockWidth = Math.min(pixelSize, width - blockX);
                const blockHeight = Math.min(pixelSize, height - blockY);
                
                if (blockWidth <= 0 || blockHeight <= 0) continue;
                
                // Get the color of the first pixel in this block (faster than averaging)
                const pixelIndex = (blockY * width + blockX) * 4;
                const r = faceData.data[pixelIndex];
                const g = faceData.data[pixelIndex + 1];
                const b = faceData.data[pixelIndex + 2];
                
                // Fill the block with this color
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x + blockX, y + blockY, blockWidth, blockHeight);
              }
            }
            
            // Draw bounding box if enabled
            if (showBoundingBoxes) {
              ctx.strokeStyle = 'rgba(46, 204, 113, 0.7)';
              ctx.lineWidth = 3;
              ctx.strokeRect(x, y, width, height);
              
              // Add privacy icon indicator
              ctx.fillStyle = 'rgba(46, 204, 113, 0.7)';
              ctx.fillRect(x, y - 25, 20, 20);
              ctx.fillStyle = 'white';
              ctx.font = '14px Arial';
              ctx.fillText('🔒', x + 2, y - 10);
            }
          }
        }
        
        // Update state with the processed image and face data
        setDetectedFaces(faces);
        setFaceCount(faces.length);
        setProcessedImage(canvas.toDataURL('image/jpeg', 0.95));
        setProgressMessage(`Privacy protection applied to ${faces.length} face(s).`);
        
        // Auto-complete the challenge after successful detection
        if (faces.length > 0 && !isCompleted) {
          // Wait a moment to let the user see the results first
          setTimeout(() => {
            const completeButton = document.getElementById('complete-challenge-button');
            if (completeButton) {
              completeButton.click();
            } else {
              // Fallback if button not found
              handleCompleteChallenge();
            }
          }, 2000); // Wait 2 seconds before auto-completing
        }
      } catch (detectErr) {
        console.error('Face detection error:', detectErr);
        setError(`Face detection failed. This may be due to CORS restrictions with the image source. Try using local images instead of external URLs.`);
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(`Failed to process image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Download the processed image
  const handleDownloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'privacy-protected.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleReset = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    setError(null);
    setDetectedFaces([]);
    setProgressMessage('');
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Add a new function for handling failed sample image loading
  const handleSampleImageError = (imageId: string) => {
    console.warn(`Sample image ${imageId} failed to load`);
    setError(`The sample image failed to load. This may be due to missing files in the /public/images/privacy/ directory. Please use the file upload option instead.`);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Confetti animation when challenge is completed */}
      <Confetti active={showConfetti} />
      
      {/* Header with Challenge Information */}
      <ChallengeHeader
        title="AI Image Protector: Safeguard Privacy with Smart Blurring"
        icon={<Shield className="h-6 w-6 text-emerald-600" />}
        challengeId={challengeId}
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
      />
      
      {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <Shield className="mr-2 text-emerald-600" />
            Challenge # 6: AI Privacy Guardian: Safeguard Privacy with Smart Blurring
          </h1>
          <p className="text-gray-600">
            Identify and blur faces in images and video to protect privacy and ensure compliance with data protection regulations.
          </p>
          {isCompleted && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Check size={16} className="mr-1" /> Challenge completed!
            </div>
          )}
        </div>
      
      {/* How AI Works for You section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-xl"></div>
        
        <h2 className="text-xl font-bold mb-4 flex items-center relative z-10">
          <Info className="mr-2 h-5 w-5 text-emerald-500" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">How AI Works for You</span>
        </h2>
        
        <div className="text-gray-700 space-y-4 relative z-10">
          <p className="leading-relaxed">
            AI-powered privacy tools help detect and blur faces in images and videos, ensuring compliance with data protection laws and safeguarding personal information.
          </p>
          
          <p className="leading-relaxed">
            In this challenge, AI will automatically scan an image, identify faces, and apply smart blurring to protect identities. This technology is widely used in security, media, and compliance-driven industries, helping businesses handle sensitive visuals responsibly.
          </p>
        </div>
      </div>
      
      {/* Challenge Steps Quick View */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 relative overflow-hidden mt-6">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-teal-200/20 to-emerald-200/20 rounded-full blur-xl"></div>
        
        <h2 className="text-xl font-bold mb-4 flex items-center relative z-10">
          <Lightbulb className="mr-2 h-5 w-5 text-emerald-500" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Challenge Steps Quick View</span>
        </h2>
        
        <div className="space-y-3 relative z-10">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-semibold text-sm mr-3">1</div>
            <div className="text-gray-700 flex items-center">
              <span className="text-emerald-500 mr-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Toggle to "Live Camera" mode to see real-time face detection, or select from sample images.</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-semibold text-sm mr-3">2</div>
            <div className="text-gray-700 flex items-center">
              <span className="text-emerald-500 mr-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Watch AI automatically blur faces for privacy protection.</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-semibold text-sm mr-3">3</div>
            <div className="text-gray-700 flex items-center">
              <span className="text-emerald-500 mr-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Adjust the blur intensity and explore different settings.</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-semibold text-sm mr-3">4</div>
            <div className="text-gray-700 flex items-center">
              <span className="text-emerald-500 mr-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Challenge Completed! Click Complete & Return!</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Take the Challenge */}
      <div className="mb-8 mt-2">
        <h2 className="text-3xl font-extrabold flex items-center transform">
          <Shield className="mr-3 h-7 w-7 text-emerald-500" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 drop-shadow-[0.05em_0.05em_0px_rgba(5,150,105,0.3)] transform hover:scale-[1.01] transition-transform">
            Take the Challenge!
          </span>
        </h2>
      </div>
        
      {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Privacy Protection</h2>
                
                {/* Toggle between static and live modes */}
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${!isLiveMode ? 'font-medium text-emerald-600' : 'text-gray-500'}`}>
                    Image Mode
                  </span>
                  <button
                    onClick={toggleLiveMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      isLiveMode ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isLiveMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${isLiveMode ? 'font-medium text-emerald-600' : 'text-gray-500'}`}>
                    Live Camera <span className="text-xs text-gray-500">(OPTIONAL)</span>
                  </span>
                </div>
                </div>
                
              {/* Live mode - real-time face blurring */}
              {isLiveMode ? (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Live Privacy Protection</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Faces detected: {faceCount}</span>
                      </div>
                    </div>
                    <div className="p-2 max-h-[500px] flex justify-center bg-black">
                      <div className="relative w-full max-w-full">
                        <RealtimeFaceBlur 
                          blurIntensity={blurIntensity}
                          showBoundingBoxes={showBoundingBoxes}
                          onFacesDetected={handleFacesDetected}
                        />
                  </div>
                    </div>
                  </div>
                  
                  {/* Settings for live mode */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <Sliders className="w-4 h-4 mr-1" /> 
                        Privacy Settings
                        </span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Protection Intensity: {blurIntensity}%
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          value={blurIntensity}
                          onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="show-boxes"
                          type="checkbox"
                          checked={showBoundingBoxes}
                          onChange={() => setShowBoundingBoxes(!showBoundingBoxes)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="show-boxes" className="ml-2 block text-sm text-gray-700">
                          Show privacy protection areas
                        </label>
                      </div>
                    </div>
                    </div>
                  </div>
                ) : (
                /* Image mode - static image processing */
                <div>
                  {!selectedImage ? (
                    <div className="space-y-6">
                      {/* Upload controls - file selector removed */}
                      <div>
                        <div className="border-2 border-gray-300 rounded-lg p-6 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4 text-center text-sm">
                            <p className="text-gray-500">
                              Select a sample image below or toggle Live Camera above
                            </p>
                          </div>
                        </div>
                      </div>
            
                      {/* Sample images */}
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-3">Or select a sample image:</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {SAMPLE_IMAGES.map((image) => (
                            <div 
                              key={image.id}
                              className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handleSampleImageSelect(image.url)}
                            >
                              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                <img 
                                  src={image.url} 
                                  alt={image.title}
                                  className="object-cover w-full h-40"
                                  onError={() => handleSampleImageError(image.id)}
                                />
                              </div>
                              <div className="p-2">
                                <h4 className="text-sm font-medium text-gray-800">{image.title}</h4>
                                <p className="text-xs text-gray-500 truncate">{image.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Show the selected image with apply blur button */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            {processedImage ? 'Privacy Protected Results' : 'Selected Image'}
                          </span>
                          <button
                            onClick={() => setSelectedImage(null)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Choose different image
                          </button>
                        </div>
                        <div className="p-2">
                          {processedImage ? (
                            <div className="flex flex-col lg:flex-row gap-4">
                              <div className="flex-1 border rounded overflow-hidden">
                                <div className="p-2 bg-gray-50 border-b">
                                  <span className="text-sm font-medium text-gray-700">Original</span>
                                </div>
                                <div className="p-2 flex justify-center">
                                  <img
                                    src={selectedImage}
                                    alt="Original"
                                    className="max-w-full h-auto max-h-[300px]"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 border rounded overflow-hidden">
                                <div className="p-2 bg-gray-50 border-b">
                                  <span className="text-sm font-medium text-gray-700">Privacy Protected</span>
                                </div>
                                <div className="p-2 flex justify-center">
                                  <img
                                    src={processedImage}
                                    alt="Privacy Protected"
                                    className="max-w-full h-auto max-h-[300px]"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              ref={imageRef}
                              src={selectedImage}
                              alt="Selected"
                              className="max-w-full h-auto max-h-[400px] mx-auto"
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Settings for static image mode */}
                      {!processedImage && (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="p-3 bg-gray-50 border-b">
                            <span className="text-sm font-medium text-gray-700 flex items-center">
                              <Sliders className="w-4 h-4 mr-1" /> 
                              Privacy Settings
                            </span>
                          </div>
                          <div className="p-4 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Protection Intensity: {blurIntensity}%
                              </label>
                              <input
                                type="range"
                                min="5"
                                max="30"
                                value={blurIntensity}
                                onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                id="show-boxes"
                                type="checkbox"
                                checked={showBoundingBoxes}
                                onChange={() => setShowBoundingBoxes(!showBoundingBoxes)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor="show-boxes" className="ml-2 block text-sm text-gray-700">
                                Show privacy protection areas
                              </label>
                            </div>
                            
                            <div className="flex justify-between pt-2">
                              <button
                                onClick={processStaticImage}
                                disabled={isProcessing || !isFaceApiLoaded}
                                className={`px-4 py-2 rounded-md ${
                                  isProcessing || !isFaceApiLoaded
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {isProcessing ? (
                                  <span className="flex items-center">
                                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                                    Processing...
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Detect & Blur Faces
                                  </span>
                                )}
                              </button>
                              
                              <button
                                onClick={handleReset}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Processing status */}
                      {isProcessing && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <RefreshCw className="animate-spin h-5 w-5 text-blue-500 mr-2" />
                            <span className="text-blue-700 font-medium">{progressMessage || 'Processing image...'}</span>
                          </div>
                          <div className="h-2 w-full bg-blue-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Error message */}
                      {error && (
                        <div className="bg-red-50 p-3 rounded-lg flex items-start">
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-red-700">{error}</span>
                        </div>
                      )}
                      
                      {/* Results and download button */}
                      {processedImage && (
                        <div className="space-y-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-green-700 font-medium">Privacy protection applied successfully!</p>
                                <p className="text-green-600 text-sm mt-1">
                                  {faceCount > 0
                                    ? `${faceCount} face${faceCount !== 1 ? 's' : ''} detected and blurred.`
                                    : 'No faces were detected in this image.'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={handleDownloadImage}
                              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
                            >
                              <ImageIcon className="h-5 w-5 mr-2" />
                              Download Protected Image
                            </button>
                            
                            <button
                              onClick={handleReset}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                            >
                              <RefreshCw className="h-5 w-5 mr-2" />
                              Process Another Image
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
          
        {/* Right column with Business Impact and Complete Challenge */}
          <div className="lg:col-span-1">
            {/* Business impact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Business Impact</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Ensures GDPR compliance by protecting identifiable information</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Saves hours of manual editing in marketing & social media content</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Protects privacy in surveillance, research, and documentary footage</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Can be applied to video streams for real-time privacy protection</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Challenge completion */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <Award size={18} className="mr-2 text-amber-500" />
                  Complete the Challenge
                </h3>
                
                <div className="space-y-4">
                  <button
                    id="complete-challenge-button"
                    onClick={() => {
                      handleCompleteChallenge();
                      setShowConfetti(true);
                      // Hide confetti after 3 seconds
                      setTimeout(() => {
                        setShowConfetti(false);
                      }, 3000);
                    }}
                    disabled={isCompleted}
                    className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isCompleted
                        ? 'bg-green-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isCompleted ? 'Challenge Completed!' : 'Complete Challenge'}
                  </button>
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
                    <h4 className="text-blue-700 font-medium">Face Detection Technology</h4>
                    <p>This privacy guardian uses advanced computer vision technologies:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>TensorFlow.js</strong> - A JavaScript library for machine learning that enables client-side face detection</li>
                      <li><strong>face-api.js</strong> - A specialized face detection library built on TensorFlow.js</li>
                      <li><strong>SSD MobileNet</strong> - Single Shot MultiBox Detector with MobileNet architecture for efficient face detection</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-blue-700 font-medium">Face Anonymization Pipeline</h4>
                    <p>The privacy protection process follows these technical steps:</p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li><strong>Face Detection</strong> - Locating faces in images using neural networks</li>
                      <li><strong>Bounding Box Generation</strong> - Creating precise coordinates for each detected face</li>
                      <li><strong>Gaussian Blur Application</strong> - Applying a configurable blur effect to the detected region</li>
                      <li><strong>Canvas Composition</strong> - Merging the blurred regions with the original image</li>
                      <li><strong>Real-time Processing</strong> - Optimizing the pipeline for video streams with frame skipping</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="text-blue-700 font-medium">Performance Optimizations</h4>
                    <p>Several techniques ensure efficient real-time processing:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Model quantization</strong> - Using 8-bit quantized models to reduce memory footprint</li>
                      <li><strong>Temporal redundancy</strong> - Processing every nth frame to reduce computational load</li>
                      <li><strong>WebGL acceleration</strong> - Leveraging GPU for tensor operations when available</li>
                      <li><strong>Tiny face detector</strong> - Optional lightweight model for performance-constrained environments</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-blue-700 font-medium">Privacy-Preserving Design</h4>
                    <p>The system is designed with privacy as a priority:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Client-side processing</strong> - All face detection happens locally without sending images to servers</li>
                      <li><strong>No face recognition</strong> - The system only detects faces but does not identify individuals</li>
                      <li><strong>No data persistence</strong> - Processed images are not stored unless explicitly saved by the user</li>
                      <li><strong>Configurable blur radius</strong> - Adjustable anonymization strength based on privacy requirements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </details>
          </div>
      </div>
    </div>
  );
};

export default PrivacyGuardianMain; 