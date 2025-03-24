import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, Camera, RefreshCw, Info, Check, Sliders, Zap, Eye, Brain, Map, Video, X, Image as ImageIcon } from 'lucide-react';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import { getOpenAIHeaders, getOpenAIConfig } from '../../../services/apiConfig';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import axios from 'axios';
import ImageUploader from './components/ImageUploader';
import SampleImages from './components/SampleImages';
import DetectionSettings from './components/DetectionSettings';
import BusinessApplications from './components/BusinessApplications';
import ChallengeHeader from '../../shared/ChallengeHeader';
import Confetti from '../../shared/Confetti';

// Analysis Overlay Component
const AnalysisOverlay: React.FC<{ stage: string; message: string; isVisible: boolean }> = ({ 
  stage, 
  message, 
  isVisible 
}) => {
  const stages = [
    { id: 'preparing', icon: <Eye size={24} />, label: 'Preparing Image' },
    { id: 'detecting', icon: <Search size={24} />, label: 'Detecting Objects' },
    { id: 'processing', icon: <Brain size={24} />, label: 'Processing Details' },
    { id: 'finalizing', icon: <Zap size={24} />, label: 'Finalizing Results' },
  ];
  
  const currentStageIndex = stages.findIndex(s => s.id === stage);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <div className="animate-pulse text-indigo-600">
              {stages.find(s => s.id === stage)?.icon || <Search size={24} />}
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-800">AI Object Detection</h3>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>
        
        <div className="mb-6">
          <ul className="relative">
            {stages.map((s, index) => {
              const isActive = index === currentStageIndex;
              const isCompleted = index < currentStageIndex;
              
              return (
                <li key={s.id} className={`flex items-start mb-3 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3
                    ${isActive ? 'bg-indigo-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {isCompleted ? <Check size={16} /> : (index + 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={`mr-2 ${isActive ? 'text-indigo-600' : 'text-gray-700'}`}>
                        {s.icon}
                      </span>
                      <h4 className={`font-medium ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>{s.label}</h4>
                    </div>
                    {isActive && (
                      <div className="mt-1 pl-6">
                        <div className="h-1 bg-gray-200 rounded overflow-hidden">
                          <div className="h-1 bg-indigo-600 animate-progress"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="text-xs text-gray-500 italic text-center">
          Using advanced computer vision AI to analyze your image with precision...
        </div>
      </div>
    </div>
  );
};

// Add the new animation style to a new <style> tag right after the imports
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes progress {
    0% { width: 5%; }
    100% { width: 90%; }
  }
  
  .animate-progress {
    animation: progress 2.5s ease-in-out infinite;
  }
`;
document.head.appendChild(styleSheet);

// Enhanced detection object interface
interface EnhancedDetection extends cocossd.DetectedObject {
  category?: string;
  description?: string;
  attributes?: string[];
  relationships?: string[];
  significance?: string;
}

// OpenAI response interface
interface OpenAIAnalyzedObject {
  name: string;
  category: string;
  description: string;
  attributes?: string[];
  relationships?: string[];
  significance?: string;
}

interface OpenAIResponse {
  objects: OpenAIAnalyzedObject[];
  scene_description?: string;
  background_elements?: string[];
  overall_mood?: string;
}

const ObjectDetectionMain: React.FC = () => {
  // User progress tracking
  const [userProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress.completedChallenges.includes('challenge-9')
  );
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Detection state
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [detections, setDetections] = useState<EnhancedDetection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoCompleteTriggered, setAutoCompleteTriggered] = useState<boolean>(false);
  const [detectionCount, setDetectionCount] = useState<number>(0);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Analysis overlay state
  const [analysisStage, setAnalysisStage] = useState<string>('preparing');
  const [analysisMessage, setAnalysisMessage] = useState<string>('Preparing image for analysis...');
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState<boolean>(false);
  
  // Webcam state
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [realTimeDetection, setRealTimeDetection] = useState<boolean>(false);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Load COCO-SSD model on component mount
  useEffect(() => {
    async function loadModel() {
      try {
        // Ensure TensorFlow.js is initialized
        await tf.ready();
        
        // Load COCO-SSD model
        const loadedModel = await cocossd.load({
          base: 'mobilenet_v2'  // Faster but slightly less accurate than 'lite_mobilenet_v2'
        });
        
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (err) {
        console.error('Failed to load TensorFlow model:', err);
        setError('Failed to initialize object detection model. Please try refreshing the page.');
        setIsModelLoading(false);
      }
    }
    
    loadModel();
    
    // Check if challenge is already completed
    if (userProgress.completedChallenges.includes('challenge-9')) {
      setIsCompleted(true);
    }
    
    // Cleanup function to handle component unmount
    return () => {
      // Stop any ongoing real-time detection
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Stop webcam if active
      stopWebcam();
    };
  }, [userProgress]);
  
  // Handle switching between webcam and image upload
  useEffect(() => {
    if (useWebcam) {
      // Clear any existing image
      clearImage();
      // Start webcam
      startWebcam();
    } else {
      // Stop webcam
      stopWebcam();
    }
  }, [useWebcam]);
  
  // Start webcam
  const startWebcam = async () => {
    setWebcamError(null);
    
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment'
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setWebcamActive(true);
          
          // Set up canvas for drawing
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = videoRef.current?.videoWidth || 640;
            canvas.height = videoRef.current?.videoHeight || 480;
          }
          
          // Start real-time detection
          if (realTimeDetection) {
            startRealTimeDetection();
          }
        };
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setWebcamError('Could not access webcam. Please check your camera permissions.');
      setUseWebcam(false);
    }
  };
  
  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setWebcamActive(false);
    
    // Stop real-time detection
    stopRealTimeDetection();
  };
  
  // Toggle real-time detection
  const toggleRealTimeDetection = () => {
    const newValue = !realTimeDetection;
    setRealTimeDetection(newValue);
    
    if (newValue && webcamActive) {
      startRealTimeDetection();
    } else {
      stopRealTimeDetection();
    }
  };
  
  // Start real-time detection
  const startRealTimeDetection = () => {
    if (!model || !webcamActive || !videoRef.current) {
      return;
    }
    
    // Clear any previous detection loop
    stopRealTimeDetection();
    
    // Start detection loop
    const detectFrame = async () => {
      if (videoRef.current && model && webcamActive) {
        try {
          // Run detection on the current video frame
          const predictions = await model.detect(videoRef.current);
          
          // Filter predictions based on confidence threshold
          const filteredPredictions = predictions.filter(
            pred => pred.score >= confidenceThreshold
          );
          
          // Update state with new detections
          const enhancedDetections: EnhancedDetection[] = filteredPredictions.map(pred => ({
            ...pred,
            category: getCategoryFromLabel(pred.class),
            description: `A ${pred.class} detected in real-time.`,
          }));
          
          setDetections(enhancedDetections);
          
          // Draw bounding boxes on canvas
          drawRealTimeDetections(enhancedDetections);
          
          // Continue the detection loop
          animationRef.current = requestAnimationFrame(detectFrame);
        } catch (err) {
          console.error('Error in real-time detection:', err);
          stopRealTimeDetection();
          setError('Error performing real-time detection. Please try again.');
        }
      }
    };
    
    // Start the detection loop
    detectFrame();
  };
  
  // Stop real-time detection
  const stopRealTimeDetection = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  // Draw bounding boxes for real-time detection
  const drawRealTimeDetections = (detections: EnhancedDetection[]) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw detections
    detections.forEach(detection => {
      const [x, y, width, height] = detection.bbox;
      
      // Choose color based on class or category
      let color;
      const category = detection.category?.toLowerCase() || detection.class.toLowerCase();
      
      if (category.includes('person') || category.includes('people')) 
        color = '#FF5733'; // Red-orange
      else if (category.includes('animal') || category.includes('dog') || category.includes('cat') || category.includes('bird'))
        color = '#33FF57'; // Green
      else if (category.includes('vehicle') || category.includes('car') || category.includes('truck') || category.includes('bus'))
        color = '#33A1FF'; // Blue
      else if (category.includes('food'))
        color = '#FFFF33'; // Yellow
      else 
        color = '#9933FF'; // Purple
      
      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw background for text
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x, y - 30, width, 30);
      ctx.globalAlpha = 1.0;
      
      // Draw text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${detection.class} ${Math.round(detection.score * 100)}%`, 
        x + 5, 
        y - 10
      );
    });
  };
  
  // Capture still image from webcam
  const captureWebcamImage = async () => {
    if (!videoRef.current || !webcamActive) {
      setError('Webcam is not active. Please enable the webcam first.');
      return;
    }
    
    try {
      // Create a canvas to capture the current video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw the current video frame on the canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a File object from the blob
            const file = new File([blob], `webcam-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            // Update state with the captured image
            handleImageChange(file);
            
            // Switch to image mode
            setUseWebcam(false);
          }
        }, 'image/jpeg', 0.9);
      }
    } catch (err) {
      console.error('Error capturing webcam image:', err);
      setError('Failed to capture image from webcam. Please try again.');
    }
  };
  
  // Handle image change
  const handleImageChange = (file: File) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setDetections([]);
    setError(null);
  };
  
  // Clear the current image
  const clearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setDetections([]);
    setError(null);
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  // Handle sample image selection
  const handleSampleImageSelect = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `sample-${Date.now()}.jpg`, { type: 'image/jpeg' });
      handleImageChange(file);
    } catch (err) {
      console.error('Error loading sample image:', err);
      setError('Failed to load sample image. Please try uploading your own image.');
    }
  };
  
  // Helper function to set stage with explanatory message
  const updateAnalysisStage = (stage: string, message: string) => {
    setAnalysisStage(stage);
    setAnalysisMessage(message);
  };
  
  // Update confidence threshold
  const handleConfidenceChange = (value: number) => {
    setConfidenceThreshold(value);
    // If we already have detections, re-filter them based on new threshold
    if (detections.length > 0) {
      drawDetections();
    }
  };
  
  // Helper function to determine category from object label
  const getCategoryFromLabel = (label: string): string => {
    const lowerLabel = label.toLowerCase();
    
    if (lowerLabel.includes('person') || lowerLabel === 'man' || lowerLabel === 'woman' || lowerLabel === 'child') 
      return 'Person';
    if (lowerLabel.includes('cat') || lowerLabel.includes('dog') || lowerLabel.includes('bird') || lowerLabel.includes('horse'))
      return 'Animal';
    if (lowerLabel.includes('car') || lowerLabel.includes('truck') || lowerLabel.includes('bus') || lowerLabel.includes('bicycle'))
      return 'Vehicle';
    if (lowerLabel.includes('chair') || lowerLabel.includes('table') || lowerLabel.includes('sofa') || lowerLabel.includes('bed'))
      return 'Furniture';
    if (lowerLabel.includes('tv') || lowerLabel.includes('laptop') || lowerLabel.includes('phone') || lowerLabel.includes('computer'))
      return 'Technology';
    if (lowerLabel.includes('apple') || lowerLabel.includes('banana') || lowerLabel.includes('pizza') || lowerLabel.includes('food'))
      return 'Food';
    
    return 'Object';
  };
  
  // Draw bounding boxes on canvas
  const drawDetections = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    
    if (!image || !canvas || detections.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match image
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image on canvas
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Draw bounding boxes for detections above threshold
    detections
      .filter(detection => detection.score >= confidenceThreshold)
      .forEach(detection => {
        const [x, y, width, height] = detection.bbox;
        
        // Choose color based on class or category
        let color;
        const category = detection.category?.toLowerCase() || detection.class.toLowerCase();
        
        if (category.includes('person') || category.includes('people')) 
          color = '#FF5733'; // Red-orange
        else if (category.includes('animal') || category.includes('dog') || category.includes('cat') || category.includes('bird'))
          color = '#33FF57'; // Green
        else if (category.includes('vehicle') || category.includes('car') || category.includes('truck') || category.includes('bus'))
          color = '#33A1FF'; // Blue
        else if (category.includes('food'))
          color = '#FFFF33'; // Yellow
        else 
          color = '#9933FF'; // Purple
        
        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Draw background for text
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x, y - 30, width, 30);
        ctx.globalAlpha = 1.0;
        
        // Draw text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.fillText(
          `${detection.class} ${Math.round(detection.score * 100)}%`, 
          x + 5, 
          y - 10
        );
      });
  };
  
  // Helper function to convert file to base64
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // Run object detection
  const detectObjects = async () => {
    if (!model) {
      setError('Object detection model is not loaded yet. Please wait or refresh the page.');
      return;
    }
    
    if (!imageRef.current || !imageFile) {
      setError('Please upload an image first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setShowAnalysisOverlay(true);
    updateAnalysisStage('preparing', 'Preparing image for analysis...');
    
    try {
      // Convert the image to base64 for OpenAI API
      const base64Image = await toBase64(imageFile);
      
      // Step 1: Run initial TensorFlow detection
      updateAnalysisStage('detecting', 'Detecting objects with neural network...');
      
      const predictions = await model.detect(imageRef.current);
      
      // Sort predictions by confidence score (highest first)
      const sortedPredictions = [...predictions].sort((a, b) => b.score - a.score);
      
      // Convert TensorFlow predictions to enhanced format
      const enhancedDetections: EnhancedDetection[] = sortedPredictions.map(pred => ({
        ...pred,
        category: getCategoryFromLabel(pred.class),
        description: `A ${pred.class} detected in the image.`,
      }));
      
      // Set the detections immediately for quick feedback
      setDetections(enhancedDetections);
      
      // Draw bounding boxes right away
      setTimeout(() => {
        drawDetections();
      }, 100);
      
      // Step 2: Use OpenAI for enhanced descriptions
      if (enhancedDetections.length > 0) {
        try {
          updateAnalysisStage('processing', 'Enhancing detection with AI analysis...');
          
          const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: getOpenAIConfig().defaultModel || "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: "You are an expert AI image analyst. Enhance the existing object detection with detailed descriptions and additional insights."
                },
                {
                  role: "user",
                  content: [
                    { 
                      type: "text", 
                      text: `Analyze this image and enhance these detected objects: ${JSON.stringify(enhancedDetections.map(d => d.class))}.
                      Return a JSON object with this structure: {\"objects\": [{\"name\": string, \"category\": string, \"description\": string, \"attributes\": [string], \"relationships\": [string], \"significance\": string}], \"scene_description\": string, \"background_elements\": [string], \"overall_mood\": string}` 
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:${imageFile.type};base64,${base64Image.split(',')[1]}`
                      }
                    }
                  ]
                }
              ],
              response_format: { 
                type: "json_object" 
              },
              max_tokens: 800,
              temperature: 0.1
            },
            {
              headers: getOpenAIHeaders()
            }
          );
          
          updateAnalysisStage('finalizing', 'Finalizing detection results...');
          
          // Parse the structured JSON response
          const responseContent = openaiResponse.data.choices[0].message.content;
          let structuredResponse: OpenAIResponse;
          try {
            structuredResponse = JSON.parse(responseContent);
          } catch (parseError) {
            console.error("Error parsing OpenAI response:", parseError);
            throw new Error("Failed to parse OpenAI response");
          }
          
          // Enhance the existing detections with OpenAI details
          if (structuredResponse.objects && Array.isArray(structuredResponse.objects)) {
            const enhancedResults: EnhancedDetection[] = [];
            
            // First, add all OpenAI results and try to match with existing bounding boxes
            structuredResponse.objects.forEach((obj: OpenAIAnalyzedObject) => {
              // Try to find a matching TensorFlow detection
              const matchingTf = enhancedDetections.find(
                d => d.class.toLowerCase() === obj.name.toLowerCase() || 
                     d.class.toLowerCase().includes(obj.name.toLowerCase()) || 
                     obj.name.toLowerCase().includes(d.class.toLowerCase())
              );
              
              if (matchingTf) {
                // Enhance existing detection
                enhancedResults.push({
                  ...matchingTf,
                  category: obj.category,
                  description: obj.description,
                  attributes: obj.attributes || [],
                  relationships: obj.relationships || [],
                  significance: obj.significance
                });
              }
            });
            
            // Add any remaining TensorFlow detections not matched by OpenAI
            enhancedDetections.forEach(detection => {
              const alreadyIncluded = enhancedResults.some(
                r => r.class === detection.class && r.score === detection.score
              );
              
              if (!alreadyIncluded) {
                enhancedResults.push(detection);
              }
            });
            
            // Add scene description if available
            if (structuredResponse.scene_description) {
              enhancedResults.push({
                class: "Overall Scene",
                score: 0.99,
                bbox: [0, 0, 0, 0], // Empty bbox for scene
                category: "Scene Analysis",
                description: structuredResponse.scene_description,
                attributes: structuredResponse.background_elements,
                significance: "Overall scene context"
              });
            }
            
            // Update detections with enhanced results
            setDetections(enhancedResults);
          }
        } catch (openaiError) {
          console.error("OpenAI enhancement failed:", openaiError);
          // Continue with basic detections if OpenAI fails
        }
      }
      
      setDetectionCount(prev => prev + 1);
      
      // Auto-complete the challenge when objects are detected
      if (!isCompleted && !autoCompleteTriggered) {
        setAutoCompleteTriggered(true);
        handleCompleteChallenge();
      }
    } catch (err) {
      console.error('Error detecting objects:', err);
      setError('Failed to detect objects in the image. Please try a different image.');
    } finally {
      setIsLoading(false);
      setShowAnalysisOverlay(false);
    }
  };
  
  // Effect to redraw detections when confidence threshold changes
  useEffect(() => {
    if (detections.length > 0 && imageRef.current) {
      drawDetections();
    }
  }, [confidenceThreshold]);
  
  // Handle completing the challenge
  const handleCompleteChallenge = () => {
    const wasCompleted = markChallengeAsCompleted('challenge-object-detection');
    
    if (wasCompleted) {
      setIsCompleted(true);
      setShowConfetti(true);
      
      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Show confetti animation when challenge is completed */}
      {showConfetti && <Confetti active={showConfetti} />}
      
      <ChallengeHeader
        title="AI Object Detection"
        icon={<Search className="h-6 w-6 text-blue-600" />}
        challengeId="challenge-9" // Using the correct challenge ID from ChallengeHubNew
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
        isHPChallenge={true}
      />
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-10 rounded-full -ml-10 -mb-10"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <Search size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold">AI Object Detection</h1>
            </div>
            <p className="text-lg opacity-90 ml-1 max-w-2xl">
              Detect and locate multiple objects in images with bounding boxes and confidence scores
            </p>
          </div>
        </div>
        
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {/* Webcam Error Message */}
          {webcamError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {webcamError}
            </div>
          )}
          
          {/* Model Loading State */}
          {isModelLoading && (
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-md mb-4 flex items-center">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              <span>Loading object detection model... This may take a moment.</span>
            </div>
          )}
          
          <div className="px-2 py-6 md:p-8">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 flex items-center">
              <span className="bg-blue-100 text-blue-700 p-2 rounded-lg mr-3">
                <Eye size={20} />
              </span>
              Identify and Locate Objects with Precision
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p className="text-base md:text-lg">
                AI-powered object detection tools analyze images to identify and locate multiple objects, drawing bounding boxes around detected items while providing confidence scores for each. This technology leverages advanced computer vision algorithms to accurately classify and track objects, even in complex scenes.
              </p>
              <p className="text-base md:text-lg">
                In this challenge, you'll see how AI processes visual data to detect objects, categorize them, and present confidence levels—all in real time. Whether for surveillance, automated inventory tracking, or visual data analysis, object detection makes it easy to gain insights from images.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl my-8 border border-blue-100 shadow-sm">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Map size={18} className="mr-2" />
                Challenge Steps Quick View:
              </h3>
              <ul className="space-y-3 text-sm md:text-base text-blue-700">
                <li className="flex items-start p-2 hover:bg-blue-100 hover:bg-opacity-50 rounded-lg transition-colors">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <Check size={14} className="text-green-600" />
                  </div>
                  <span><strong>Step 1:</strong> Upload or Choose an Image – Select an image to analyze for object detection.</span>
                </li>
                <li className="flex items-start p-2 hover:bg-blue-100 hover:bg-opacity-50 rounded-lg transition-colors">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <Check size={14} className="text-green-600" />
                  </div>
                  <span><strong>Step 2:</strong> Run Object Detection – Let AI analyze the image and identify objects.</span>
                </li>
                <li className="flex items-start p-2 hover:bg-blue-100 hover:bg-opacity-50 rounded-lg transition-colors">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <Check size={14} className="text-green-600" />
                  </div>
                  <span><strong>Step 3:</strong> Review Detection Results – Observe bounding boxes and confidence scores for each detected object.</span>
                </li>
                <li className="flex items-start p-2 hover:bg-blue-100 hover:bg-opacity-50 rounded-lg transition-colors">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <Check size={14} className="text-green-600" />
                  </div>
                  <span><strong>Step 4:</strong> Challenge Completed! Click Complete & Return!</span>
                </li>
              </ul>
            </div>
            
            {/* Toggle between image upload and webcam */}
            <div className="flex justify-center mb-8">
              <div className="bg-blue-50 p-2 rounded-xl shadow-sm border border-blue-100" role="group">
                <button
                  type="button"
                  onClick={() => setUseWebcam(false)}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center ${
                    !useWebcam
                      ? 'bg-white text-blue-600 shadow border border-blue-200'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <div className={`p-1.5 rounded-full mr-2 ${!useWebcam ? 'bg-blue-100' : ''}`}>
                    <Upload className="h-4 w-4" />
                  </div>
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => setUseWebcam(true)}
                  className={`px-6 py-3 text-sm font-medium rounded-lg ml-2 transition-all duration-200 flex items-center ${
                    useWebcam
                      ? 'bg-white text-blue-600 shadow border border-blue-200'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <div className={`p-1.5 rounded-full mr-2 ${useWebcam ? 'bg-blue-100' : ''}`}>
                    <Camera className="h-4 w-4" />
                  </div>
                  Use Webcam
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Image Upload / Webcam & Controls */}
              <div>
                {!useWebcam ? (
                  /* Image upload section */
                  <div className="border border-blue-100 rounded-xl p-6 mb-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                    <ImageUploader 
                      onImageChange={handleImageChange}
                      imagePreview={imagePreview}
                      clearImage={clearImage}
                    />
                  </div>
                ) : (
                  /* Webcam section */
                  <div className="border border-blue-100 rounded-xl p-6 mb-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative">
                      <div className="rounded-xl overflow-hidden bg-gray-900 aspect-video flex justify-center items-center shadow-inner">
                        <video
                          ref={videoRef}
                          className="max-w-full max-h-[300px] object-contain"
                          playsInline
                          muted
                        />
                        <canvas
                          ref={canvasRef}
                          className="absolute top-0 left-0 w-full h-full"
                          style={{ objectFit: 'contain' }}
                        />
                        
                        {!webcamActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 text-white backdrop-blur-sm rounded-xl">
                            <div className="text-center bg-gray-900 bg-opacity-70 p-6 rounded-xl border border-gray-700 shadow-lg">
                              <div className="bg-blue-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Camera className="h-8 w-8" />
                              </div>
                              <p className="text-lg font-medium mb-2">Camera access required</p>
                              <p className="text-sm text-gray-300 mb-4">Enable your camera to use object detection</p>
                              <button
                                onClick={startWebcam}
                                className="mt-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors duration-200 shadow-lg flex items-center justify-center mx-auto"
                              >
                                <Camera className="mr-2 h-4 w-4" />
                                Enable Camera
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {webcamActive && (
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <button
                            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors duration-200"
                            onClick={() => setUseWebcam(false)}
                            title="Close webcam"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {webcamActive && (
                      <div className="mt-5 flex justify-between">
                        <button
                          onClick={toggleRealTimeDetection}
                          className={`px-5 py-3 rounded-lg text-white font-medium flex items-center shadow-md transition-all duration-200 ${
                            realTimeDetection ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          {realTimeDetection ? 'Real-Time ON' : 'Start Real-Time Detection'}
                        </button>
                        
                        <button
                          onClick={captureWebcamImage}
                          className="px-5 py-3 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-medium flex items-center shadow-md transition-all duration-200"
                        >
                          <div className="bg-white bg-opacity-20 rounded-full p-1.5 mr-2">
                            <Camera className="h-4 w-4" />
                          </div>
                          Capture Image
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Detection button - only show for image upload mode */}
                {imagePreview && !useWebcam && (
                  <div className="flex justify-center mb-8">
                    <button
                      onClick={detectObjects}
                      disabled={isLoading || isModelLoading}
                      className={`px-10 py-4 rounded-xl text-white font-medium flex items-center shadow-lg transform transition-all duration-300 ${
                        isLoading || isModelLoading
                          ? 'bg-gray-400 cursor-not-allowed opacity-70'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                          </div>
                          <span className="text-base font-semibold">Detecting objects...</span>
                        </>
                      ) : (
                        <>
                          <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                            <Search className="h-5 w-5" />
                          </div>
                          <span className="text-base font-semibold">Detect Objects</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {/* Settings panel */}
                <div>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full mb-6 text-blue-600 bg-blue-50 hover:bg-blue-100 px-5 py-3 rounded-lg flex items-center justify-center font-medium text-sm border border-blue-100 transition-all duration-200 shadow-sm"
                  >
                    <Sliders className="mr-2 h-4 w-4" />
                    {showSettings ? 'Hide Settings' : 'Show Detection Settings'}
                  </button>
                  
                  {showSettings && (
                    <DetectionSettings
                      confidenceThreshold={confidenceThreshold}
                      onConfidenceChange={handleConfidenceChange}
                    />
                  )}
                </div>
                
                {/* Sample Images - only show for image upload mode */}
                {!useWebcam && (
                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-3 text-blue-800 flex items-center">
                      <ImageIcon size={18} className="mr-2" />
                      Sample Images
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Don't have an image? Try one of these examples with multiple objects:
                    </p>
                    <SampleImages onSelectImage={handleSampleImageSelect} />
                  </div>
                )}
              </div>
              
              {/* Right Column: Detection Results */}
              <div>
                {/* Image with detections - only show for image mode */}
                {imagePreview && !useWebcam && (
                  <div className="mb-6">
                    <div className="rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 flex justify-center items-center p-4 border border-gray-200 shadow-md">
                      <div className="relative inline-block">
                        <img
                          ref={imageRef}
                          src={imagePreview}
                          alt="Uploaded image"
                          className="max-w-full max-h-[400px] rounded-lg shadow"
                          style={{ display: 'block' }}
                        />
                        <canvas
                          ref={canvasRef}
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Detection results */}
                {detections.length > 0 && (
                  <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800 flex items-center text-lg">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Search size={18} className="text-blue-700" />
                        </div>
                        Detection Results
                      </h3>
                      <span className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                        {detections.filter(d => d.score >= confidenceThreshold).length} objects
                      </span>
                    </div>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {detections
                        .filter(detection => detection.score >= confidenceThreshold)
                        .map((detection, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-semibold text-gray-800 text-base">{detection.class}</h4>
                                  {detection.category && (
                                    <span className="ml-2 text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                      {detection.category}
                                    </span>
                                  )}
                                </div>
                                {detection.description && (
                                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                    {detection.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                <div className="font-bold text-blue-700 text-lg">
                                  {Math.round(detection.score * 100)}%
                                </div>
                                <div className="text-xs text-gray-500 font-medium">confidence</div>
                              </div>
                            </div>
                            
                            {/* Additional attributes if available */}
                            {detection.attributes && detection.attributes.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-blue-100">
                                <div className="text-xs text-blue-700 mb-2 font-medium flex items-center">
                                  <Info size={12} className="mr-1" /> Attributes:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {detection.attributes.map((attr, idx) => (
                                    <span key={idx} className="text-xs bg-white text-blue-700 px-3 py-1 rounded-full shadow-sm border border-blue-100 hover:bg-blue-50 transition-colors">
                                      {attr}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                    
                    {/* Confidence threshold reminder */}
                    <div className="mt-5 pt-4 border-t border-blue-100 flex items-center justify-between">
                      <span className="text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg font-medium flex items-center">
                        <Sliders size={14} className="mr-2" />
                        Showing objects with confidence ≥ {Math.round(confidenceThreshold * 100)}%
                      </span>
                      <button
                        onClick={() => setShowSettings(true)}
                        className="text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm hover:shadow transition-all duration-200 text-sm font-medium flex items-center"
                      >
                        <Sliders size={14} className="mr-2" />
                        Adjust threshold
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Instructions for webcam mode if no detections yet */}
                {useWebcam && webcamActive && detections.length === 0 && !realTimeDetection && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                      <Info className="mr-2 h-5 w-5" />
                      Getting Started with Real-Time Detection
                    </h3>
                    <p className="text-blue-700 mb-3">
                      Click the "Start Real-Time Detection" button to begin detecting objects in your webcam feed.
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li>Make sure you have good lighting</li>
                      <li>Position objects clearly in the camera view</li>
                      <li>Try different angles if objects aren't detected</li>
                      <li>You can adjust detection sensitivity in Settings</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Business Applications */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Business Applications</h3>
            <p className="text-gray-600 mb-4">
              Object detection technology can transform various industries:
            </p>
            <BusinessApplications />
            

          </div>
          
          {/* Complete challenge button */}
          {detectionCount > 0 && (
            <div className="flex justify-between">
              <button
                onClick={() => {
                  clearImage();
                  setDetections([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Try Another Image
              </button>
              
              <button
                onClick={handleCompleteChallenge}
                disabled={isCompleted}
                className={`px-6 py-2 rounded-md text-white ${
                  isCompleted
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isCompleted ? "Challenge Completed!" : "Complete & Return"}
              </button>
            </div>
          )}
          
          {/* Tips & best practices */}
          <div className="mt-8 bg-blue-50 p-4 rounded-md">
            <div className="flex items-start">
              <Info className="text-blue-600 mr-2 mt-0.5 h-5 w-5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Tips for Better Detection</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Use well-lit images with clear visibility of objects</li>
                  <li>Avoid excessive blur or motion artifacts</li>
                  <li>Make sure objects aren't too small in the frame</li>
                  <li>Adjust the confidence threshold to tune sensitivity</li>
                  <li>Try different angles if certain objects aren't detected</li>
                  <li>Real-time detection works best with good lighting and minimal motion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analysis Overlay */}
      <AnalysisOverlay 
        stage={analysisStage}
        message={analysisMessage}
        isVisible={showAnalysisOverlay}
      />
      
      {/* For the Nerds section */}
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
          
          <div className="p-5 bg-white">
            <div className="prose max-w-none">
              <h4 className="text-blue-700 font-medium mb-3">Technologies Used</h4>
              
              <h5 className="font-medium mt-4 mb-2">TensorFlow.js</h5>
              <p className="text-gray-700 mb-3">
                This application uses TensorFlow.js, an open-source library developed by Google that allows machine learning models to run directly in the browser. 
                The models execute on the client-side using WebGL acceleration, eliminating the need for server-side processing and reducing latency.
              </p>
              
              <h5 className="font-medium mt-4 mb-2">COCO-SSD Model</h5>
              <p className="text-gray-700 mb-3">
                We're using the COCO-SSD (Common Objects in Context - Single Shot MultiBox Detector) pre-trained model, which can identify 80 different common object categories. 
                The model was trained on the COCO dataset, which contains over 200,000 labeled images. SSD is an object detection architecture that predicts bounding boxes and class probabilities in a single forward pass of the network.
              </p>
              
              <h5 className="font-medium mt-4 mb-2">Image Processing Pipeline</h5>
              <p className="text-gray-700 mb-3">
                When you upload an image or capture from webcam, the following process occurs:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-4">
                <li>The image is loaded into a canvas element and normalized to fit the input requirements of the model</li>
                <li>The normalized image data is passed through the COCO-SSD model</li>
                <li>The model returns predictions containing bounding box coordinates, class labels, and confidence scores</li>
                <li>Predictions are filtered based on the confidence threshold you set</li>
                <li>Bounding boxes are drawn on a canvas overlay positioned above the original image</li>
              </ol>
              
              <h5 className="font-medium mt-4 mb-2">Real-time Detection</h5>
              <p className="text-gray-700 mb-3">
                For webcam mode, we use the MediaDevices API to access the camera stream. The detection runs on each frame using requestAnimationFrame for smooth performance. 
                This creates a continuous detection loop that analyzes approximately 5-15 frames per second depending on your device's capabilities.
              </p>
              
              <h5 className="font-medium mt-4 mb-2">Performance Optimizations</h5>
              <p className="text-gray-700">
                Several optimizations are implemented to ensure smooth performance:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
                <li>Throttling of detection frequency in real-time mode to balance accuracy and performance</li>
                <li>Image resizing to reduce computational load while maintaining detection accuracy</li>
                <li>Confidence threshold adjustment to filter out low-confidence predictions</li>
                <li>Asynchronous model loading to prevent UI blocking during initialization</li>
              </ul>
              
              <h5 className="font-medium mt-4 mb-2">React and State Management</h5>
              <p className="text-gray-700">
                The UI is built with React using functional components and hooks for state management. The detection results and UI state are managed through React's useState and useEffect hooks, 
                allowing for reactive updates to the interface as detections occur. Canvas manipulations are handled through useRef hooks to directly access and modify the DOM elements.
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ObjectDetectionMain; 