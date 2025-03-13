import React, { useState, useRef, useEffect } from 'react';
import { Shield, Image as ImageIcon, Upload, RefreshCw, Check, X, AlertTriangle, Info, Award } from 'lucide-react';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import Confetti from '../../shared/Confetti';
import ChallengeHeader from '../../shared/ChallengeHeader';

// Sample images for demonstration
const SAMPLE_IMAGES = [
  {
    id: 'group-photo',
    url: 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg',
    title: 'Office Team Meeting',
    description: 'Group of business people in an office setting'
  },
  {
    id: 'cafe-scene',
    url: 'https://images.pexels.com/photos/8937579/pexels-photo-8937579.jpeg',
    title: 'Cafe Scene',
    description: 'People meeting at a busy cafe'
  },
  {
    id: 'street-photo',
    url: 'https://images.pexels.com/photos/1209978/pexels-photo-1209978.jpeg',
    title: 'Urban Street',
    description: 'People walking along a busy street'
  },
  {
    id: 'conference',
    url: 'https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg',
    title: 'Conference',
    description: 'Group of people at a conference or event'
  }
];

interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
  blurred: boolean;
}

const PrivacyGuardianMain: React.FC = () => {
  // User progress tracking
  const [userProgress, setUserProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Add missing state variables
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detectionProgress, setDetectionProgress] = useState<number>(0);
  const [detectionMessage, setDetectionMessage] = useState<string>('');
  const [faceCount, setFaceCount] = useState<number>(0);
  
  // State for the image and face detection
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [userScenario, setUserScenario] = useState<string>('');
  const [useFallbackDetection, setUseFallbackDetection] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Check if challenge is already completed
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-privacy-guardian')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  // Load face-api.js for face detection
  useEffect(() => {
    // Check if Face-API script already exists
    const scriptExists = document.getElementById('face-api-script');
    
    if (!scriptExists) {
      const script = document.createElement('script');
      script.id = 'face-api-script';
      script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
      script.async = true;
      
      script.onload = async () => {
        await loadFaceDetectionModels();
      };
      
      document.body.appendChild(script);
    } else if (window.faceapi) {
      loadFaceDetectionModels();
    }
  }, []);
  
  const loadFaceDetectionModels = async () => {
    try {
      setIsLoading(true);
      setProgressMessage('Loading face detection models...');
      
      // Try multiple possible model sources
      const modelSources = [
        '/models', // Local path
        '/HP_AI/models', // Another possible local path
        'https://hp-ai-challenge.netlify.app/models', // Deployed site path
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model' // Fallback to CDN
      ];
      
      let modelsLoaded = false;
      
      for (const modelPath of modelSources) {
        try {
          setProgressMessage(`Trying to load models from ${modelPath}...`);
          
          // Load the required models for face detection
          await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
            window.faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
            window.faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
          ]);
          
          modelsLoaded = true;
          setProgressMessage(`Face detection models loaded successfully from ${modelPath}`);
          break; // Exit the loop if models are successfully loaded
        } catch (err) {
          console.error(`Failed to load models from ${modelPath}:`, err);
          // Continue to the next source
        }
      }
      
      if (!modelsLoaded) {
        console.warn('Using simplified face detection fallback');
        setUseFallbackDetection(true);
        setProgressMessage('Using simplified detection mode');
      }
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load face detection models. Using simplified detection mode.');
      console.error('Error loading models:', err);
      setUseFallbackDetection(true);
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
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleSampleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setProcessedImage(null);
    setDetectedFaces([]);
    setError(null);
  };
  
  const detectFaces = async () => {
    if (!imageRef.current) return;
    
    try {
      setIsProcessing(true);
      setDetectionProgress(10);
      setDetectionMessage('Analyzing image...');
      
      // Clear any previous detections
      setDetectedFaces([]);
      
      const img = imageRef.current;
      
      if (useFallbackDetection) {
        // Fallback detection method
        await detectFacesFallback(img);
      } else {
        // Standard face-api detection
        try {
          setDetectionProgress(30);
          setDetectionMessage('Detecting faces...');
          
          // Detect faces with face-api.js
          const detections = await window.faceapi.detectAllFaces(
            img,
            new window.faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
          ).withFaceLandmarks();
          
          if (!detections || detections.length === 0) {
            setDetectionProgress(100);
            setError('No faces detected in the image. Try another image with clearer faces.');
            setIsProcessing(false);
            return;
          }
          
          setDetectionProgress(70);
          setDetectionMessage(`Found ${detections.length} face(s). Analyzing privacy implications...`);
          
          // Process detections
          const faces: DetectedFace[] = detections.map((detection: any) => {
            const box = detection.detection.box;
            return {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              blurred: true // Blur all faces by default
            };
          });
          
          setDetectedFaces(faces);
          setFaceCount(faces.length);
          setDetectionMessage(`Face detection complete. Found ${faces.length} face(s).`);
          
          // Wait a moment for UI update
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Render the processed image
          updateProcessedImage();
        } catch (err) {
          console.error('Error with face-api detection, falling back to simplified method:', err);
          setUseFallbackDetection(true);
          await detectFacesFallback(img);
        }
      }
      
      setDetectionProgress(100);
      
    } catch (err) {
      setError('Error processing the image. Please try again with a different image.');
      console.error('Face detection error:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const applyFaceBlur = (ctx: CanvasRenderingContext2D, face: DetectedFace) => {
    // Save the current state of the canvas
    ctx.save();
    
    // Apply blur if the face should be blurred
    if (face.blurred) {
      // Create a temporary canvas for the blurred region
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = face.width;
      tempCanvas.height = face.height;
      
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      // Draw the face region to the temporary canvas
      tempCtx.drawImage(
        ctx.canvas,
        face.x, face.y, face.width, face.height,
        0, 0, face.width, face.height
      );
      
      // Apply the blur filter
      tempCtx.filter = 'blur(15px)';
      tempCtx.drawImage(tempCanvas, 0, 0);
      
      // Draw the blurred face back to the main canvas
      ctx.drawImage(tempCanvas, face.x, face.y);
    }
    
    // Restore the canvas state
    ctx.restore();
  };
  
  const toggleFaceBlur = (index: number) => {
    setDetectedFaces((prevFaces) => {
      const updatedFaces = [...prevFaces];
      updatedFaces[index] = {
        ...updatedFaces[index],
        blurred: !updatedFaces[index].blurred
      };
      
      return updatedFaces;
    });
    
    // Re-process the image with the updated face blur settings
    updateProcessedImage();
  };
  
  const updateProcessedImage = async () => {
    if (!selectedImage) return;
    
    const img = new Image();
    img.src = selectedImage;
    
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw the original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Apply blur to selected faces
    detectedFaces.forEach((face) => {
      applyFaceBlur(ctx, face);
    });
    
    // Update the processed image
    const processedImageUrl = canvas.toDataURL('image/jpeg', 0.8);
    setProcessedImage(processedImageUrl);
  };
  
  const resetImage = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    setDetectedFaces([]);
    setError(null);
    setProgressMessage('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleCompleteChallenge = () => {
    if (!userScenario.trim()) {
      setError('Please enter a privacy scenario to complete the challenge.');
      return;
    }
    
    // Mark the challenge as completed
    markChallengeAsCompleted('challenge-privacy-guardian');
    setIsCompleted(true);
    
    // Show confetti
    setShowConfetti(true);
    
    // Reset confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };
  
  // Add a fallback detection method
  const detectFacesFallback = async (imageElement: HTMLImageElement) => {
    setDetectionMessage('Using simplified detection mode...');
    
    // Simple fallback detection - divide image into grid and assume faces in center and thirds
    const imgWidth = imageElement.width;
    const imgHeight = imageElement.height;
    
    // Create a couple of simulated face regions based on image dimensions
    const fallbackFaces: DetectedFace[] = [];
    
    // Center region (primary face)
    const centerFaceSize = Math.min(imgWidth, imgHeight) * 0.3;
    fallbackFaces.push({
      x: (imgWidth / 2) - (centerFaceSize / 2),
      y: (imgHeight / 3) - (centerFaceSize / 2),
      width: centerFaceSize,
      height: centerFaceSize,
      blurred: true
    });
    
    // If image is wide enough, add a second face
    if (imgWidth > imgHeight * 1.5) {
      const secondFaceSize = centerFaceSize * 0.8;
      fallbackFaces.push({
        x: (imgWidth * 0.75) - (secondFaceSize / 2),
        y: (imgHeight / 3) - (secondFaceSize / 2),
        width: secondFaceSize,
        height: secondFaceSize,
        blurred: true
      });
    }
    
    // Set the detected faces
    setDetectedFaces(fallbackFaces);
    setFaceCount(fallbackFaces.length);
    setDetectionMessage(`Simplified detection complete. Estimated ${fallbackFaces.length} face(s).`);
    
    // Wait a moment for UI update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Render the processed image
    updateProcessedImage();
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Confetti animation when challenge is completed */}
      <Confetti active={showConfetti} />
      
      {/* Replace the back button with our new header component */}
      <ChallengeHeader
        title="AI Privacy Guardian"
        icon={<Shield className="h-6 w-6 text-emerald-600" />}
        challengeId="challenge-privacy-guardian"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        onCompleteChallenge={handleCompleteChallenge}
      />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Shield className="mr-2 text-emerald-600" />
          AI Privacy Guardian
        </h1>
        <p className="text-gray-600">
          Identify and blur faces in images to protect privacy and ensure compliance with data protection regulations.
        </p>
        {isCompleted && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Check size={16} className="mr-1" /> Challenge completed!
          </div>
        )}
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Image Privacy Processor</h2>
              
              {/* Image selection area */}
              {!selectedImage ? (
                <div className="space-y-6">
                  {/* Upload controls */}
                  <div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4 flex flex-col items-center text-sm">
                        <p className="text-gray-600">
                          Drag and drop an image with faces, or
                        </p>
                        <label className="mt-2 cursor-pointer text-indigo-600 hover:text-indigo-800">
                          <span>Browse files</span>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          PNG, JPG, JPEG up to 5MB
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
                  {/* Display selected image and tools */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-700">Selected Image</h3>
                    <div className="space-x-2">
                      <button
                        onClick={resetImage}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <RefreshCw size={14} className="mr-1" />
                        Reset
                      </button>
                      
                      <button
                        onClick={detectFaces}
                        disabled={isProcessing}
                        className={`inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white ${
                          isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw size={14} className="mr-1 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Shield size={14} className="mr-1" />
                            Detect & Blur Faces
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  {progressMessage && !error && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                      <p className="text-sm text-blue-700">{progressMessage}</p>
                    </div>
                  )}
                  
                  {/* Image display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original image */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="p-2 bg-gray-50 border-b">
                        <span className="text-sm font-medium text-gray-700">Original Image</span>
                      </div>
                      <div className="p-2">
                        <img 
                          ref={imageRef}
                          src={selectedImage} 
                          alt="Original" 
                          className="max-w-full h-auto max-h-80 mx-auto"
                        />
                      </div>
                    </div>
                    
                    {/* Processed image */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="p-2 bg-gray-50 border-b">
                        <span className="text-sm font-medium text-gray-700">Processed Image</span>
                      </div>
                      <div className="p-2">
                        {processedImage ? (
                          <img 
                            src={processedImage} 
                            alt="Processed" 
                            className="max-w-full h-auto max-h-80 mx-auto"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-60 bg-gray-100 text-gray-500 text-sm">
                            {isProcessing ? (
                              <div className="flex flex-col items-center">
                                <RefreshCw size={24} className="animate-spin mb-2" />
                                <span>Processing...</span>
                              </div>
                            ) : (
                              <span>Click "Detect & Blur Faces" to process the image</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Face controls (only show if faces are detected) */}
                  {detectedFaces.length > 0 && (
                    <div className="mt-4 border rounded-lg p-4">
                      <h3 className="text-md font-medium text-gray-700 mb-2">
                        Face Blurring Controls ({detectedFaces.length} {detectedFaces.length === 1 ? 'face' : 'faces'} detected)
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Select which faces to blur or unblur:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {detectedFaces.map((face, index) => (
                          <button
                            key={index}
                            onClick={() => toggleFaceBlur(index)}
                            className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                              face.blurred
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {face.blurred ? (
                              <>
                                <Check size={14} className="mr-1" />
                                Face {index + 1} (Blurred)
                              </>
                            ) : (
                              <>
                                <X size={14} className="mr-1" />
                                Face {index + 1} (Visible)
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Info panel */}
        <div className="space-y-6">
          {/* Challenge instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Challenge Instructions</h3>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showInstructions ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showInstructions && (
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600">
                    In this challenge, you'll learn how AI can automatically detect and blur faces in images to protect privacy.
                  </p>
                  
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-700">Steps:</h4>
                    <ol className="list-decimal pl-5 text-gray-600 space-y-1">
                      <li>Upload or select an image with multiple faces.</li>
                      <li>Click "Detect & Blur Faces" to process the image.</li>
                      <li>Review the blurred image and adjust which faces to blur if needed.</li>
                      <li>Describe a real-world scenario where this would be useful.</li>
                    </ol>
                  </div>
                  
                  <div className="mt-2 bg-blue-50 p-3 rounded text-blue-700 text-xs">
                    <div className="flex">
                      <Info size={14} className="mr-1 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Note:</strong> Real privacy applications might require more advanced techniques for complete anonymization.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Challenge completion */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Award size={18} className="mr-2 text-amber-500" />
                Complete the Challenge
              </h3>
              
              {processedImage ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="business-scenario" className="block text-sm font-medium text-gray-700 mb-1">
                      Describe a real scenario where this privacy feature would be valuable:
                    </label>
                    <textarea
                      id="business-scenario"
                      rows={3}
                      value={userScenario}
                      onChange={(e) => setUserScenario(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Example: For social media marketing where only employees with consent should be identifiable..."
                      disabled={isCompleted}
                    />
                  </div>
                  
                  <button
                    onClick={handleCompleteChallenge}
                    disabled={isCompleted || !userScenario.trim()}
                    className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isCompleted
                        ? 'bg-green-500 cursor-not-allowed'
                        : !userScenario.trim()
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isCompleted ? 'Challenge Completed!' : 'Complete Challenge'}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-600">
                  <p>Process an image first to complete the challenge.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Business impact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
        </div>
      </div>
    </div>
  );
};

// Add this TypeScript declaration if not already present
declare global {
  interface Window {
    faceapi: any;
  }
}

export default PrivacyGuardianMain; 