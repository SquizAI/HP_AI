import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOpenAIHeaders, getOpenAIConfig } from '../../../services/apiConfig';
import { Image as ImageIcon, RefreshCw, Check, Info, Search, Zap, Eye, Brain, Box, Home } from 'lucide-react';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import ClassificationResults from './components/ClassificationResults';
import SampleImages from './components/SampleImages';
import BusinessApplications from './components/BusinessApplications';

import ChallengeHeader from '../../shared/ChallengeHeader';

// Analysis Overlay Component
const AnalysisOverlay: React.FC<{ stage: string; message: string; isVisible: boolean }> = ({ 
  stage, 
  message, 
  isVisible 
}) => {
  const stages = [
    { id: 'preparing', icon: <Eye size={24} />, label: 'Analyzing Image' },
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
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <div className="animate-pulse text-purple-600">
              {stages.find(s => s.id === stage)?.icon || <Search size={24} />}
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-800">AI Vision Analysis</h3>
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
                    ${isActive ? 'bg-purple-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {isCompleted ? <Check size={16} /> : (index + 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={`mr-2 ${isActive ? 'text-purple-600' : 'text-gray-700'}`}>
                        {s.icon}
                      </span>
                      <h4 className={`font-medium ${isActive ? 'text-purple-700' : 'text-gray-800'}`}>{s.label}</h4>
                    </div>
                    {isActive && (
                      <div className="mt-1 pl-6">
                        <div className="h-1 bg-gray-200 rounded overflow-hidden">
                          <div className="h-1 bg-purple-600 animate-progress"></div>
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

// Interface for detection results
interface DetectionResult {
  label: string;
  category: string;
  description?: string;
  attributes?: string[];
  relationships?: string[];
  significance?: string;
  confidence: number;
  bbox?: number[]; // [x, y, width, height]
}

// Define a type for the OpenAI analyzed object
interface OpenAIAnalyzedObject {
  name: string;
  category: string;
  description: string;
  attributes?: string[];
  relationships?: string[];
  significance?: string;
  confidence?: number;
}

interface OpenAIResponse {
  objects: OpenAIAnalyzedObject[];
  scene_description?: string;
  background_elements?: string[];
  overall_mood?: string;
}

// Main component
const ImageClassifierMain: React.FC = () => {
  // Initialize navigation
  const navigate = useNavigate();
  
  // User progress tracking
  const [userProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // State for managing the challenge flow
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [classificationResults, setClassificationResults] = useState<DetectionResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Object detection with TensorFlow
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const confidenceThreshold = 0.5;
  
  // Canvas and image references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Analysis overlay state
  const [analysisStage, setAnalysisStage] = useState<string>('preparing');
  const [analysisMessage, setAnalysisMessage] = useState<string>('Preparing image for analysis...');
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState<boolean>(false);
  
  // Load TensorFlow model on component mount
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
    if (userProgress.completedChallenges.includes('challenge-2')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  // Handle image upload
  const handleImageChange = (file: File) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setClassificationResults(null);
    setError(null);
    
    // Clear canvas if it exists
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  

  
  // Handle sample image selection
  const handleSampleImageSelect = (imageUrl: string) => {
    // Fetch the image from URL and convert to File
    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `sample-${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleImageChange(file);
      })
      .catch(err => {
        console.error('Error loading sample image:', err);
        setError('Failed to load sample image. Please try uploading your own image.');
      });
  };
  
  // Helper function to set stage with explanatory message
  const updateAnalysisStage = (stage: string, message: string) => {
    setAnalysisStage(stage);
    setAnalysisMessage(message);
  };
  
  // Draw bounding boxes on canvas
  const drawBoundingBoxes = (detections: DetectionResult[]) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !detections.length) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match image
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image first
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Draw each detection that has a bounding box
    detections
      .filter(detection => detection.bbox && detection.confidence >= confidenceThreshold)
      .forEach(detection => {
        if (!detection.bbox) return;
        
        const [x, y, width, height] = detection.bbox;
        
        // Choose color based on category
        let color;
        const category = detection.category.toLowerCase();
        if (category.includes('person') || category.includes('people')) color = '#FF5733'; // Red-orange
        else if (category.includes('animal')) color = '#33FF57'; // Green
        else if (category.includes('vehicle')) color = '#33A1FF'; // Blue
        else if (category.includes('food')) color = '#FFFF33'; // Yellow
        else color = '#9933FF'; // Purple
        
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
          `${detection.label} ${Math.round(detection.confidence * 100)}%`, 
          x + 5, 
          y - 10
        );
      });
  };
  
  // Classify the image using both TensorFlow and OpenAI for enhanced results
  const classifyImage = async () => {
    if (!imageFile) {
      setError('Please upload or take a photo first.');
      return;
    }
    
    setIsClassifying(true);
    setError(null);
    setShowAnalysisOverlay(true);
    updateAnalysisStage('preparing', 'Preparing image for AI analysis...');
    
    try {
      // Convert the image to base64
      const base64Image = await toBase64(imageFile);
      
      // Add a small delay to show the preparing stage
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateAnalysisStage('detecting', 'Detecting objects and analyzing scene content...');
      
      // Initialize results array
      let detectionResults: DetectionResult[] = [];
      
      // Step 1: Use TensorFlow for fast bounding box detection
      if (model && imageRef.current) {
        try {
          const predictions = await model.detect(imageRef.current);
          
          // Convert TensorFlow predictions to our format
          const tfResults = predictions.map(pred => ({
            label: pred.class,
            category: getCategoryFromLabel(pred.class),
            confidence: pred.score,
            bbox: pred.bbox,
            attributes: [],
            relationships: []
          }));
          
          // Add TensorFlow results to our detection results
          detectionResults = tfResults;
          
          // Draw bounding boxes immediately after TensorFlow detection
          drawBoundingBoxes(detectionResults);
          
          updateAnalysisStage('processing', 'Objects detected. Enhancing analysis with AI...');
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (tfError) {
          console.error('TensorFlow detection failed:', tfError);
          // Continue with OpenAI if TensorFlow fails
        }
      }
      
      // Step 2: Use OpenAI for more detailed semantic analysis
      try {
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
                    text: `Analyze this image and enhance these detected objects: ${JSON.stringify(detectionResults.map(d => d.label))}.
                    Return a JSON object with this structure: {\"objects\": [{\"name\": string, \"category\": string, \"description\": string, \"attributes\": [string], \"relationships\": [string], \"significance\": string, \"confidence\": number}], \"scene_description\": string, \"background_elements\": [string], \"overall_mood\": string}` 
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
            max_tokens: 800, // Reduced tokens for faster response
            temperature: 0.1
          },
          {
            headers: getOpenAIHeaders()
          }
        );
        
        // Update status for processing stage
        await new Promise(resolve => setTimeout(resolve, 500));
        updateAnalysisStage('finalizing', 'Finalizing object detection results...');
        
        // Parse the structured JSON response
        const responseContent = openaiResponse.data.choices[0].message.content;
        let structuredResponse: OpenAIResponse;
        try {
          structuredResponse = JSON.parse(responseContent);
        } catch (parseError) {
          console.error("Error parsing OpenAI response:", parseError);
          throw new Error("Failed to parse OpenAI response");
        }
        
        // Ensure we have a valid response with objects
        if (!structuredResponse || !structuredResponse.objects || !Array.isArray(structuredResponse.objects)) {
          throw new Error("Invalid response format from OpenAI");
        }
        
        // Merge TensorFlow bounding boxes with OpenAI detailed analysis
        const mergedResults: DetectionResult[] = [];
        
        // First, add all OpenAI results and try to match with existing bounding boxes
        structuredResponse.objects.forEach((obj: OpenAIAnalyzedObject) => {
          // Try to find a matching TensorFlow detection
          const matchingTf = detectionResults.find(
            tf => tf.label.toLowerCase() === obj.name.toLowerCase() || 
                 tf.label.toLowerCase().includes(obj.name.toLowerCase()) || 
                 obj.name.toLowerCase().includes(tf.label.toLowerCase())
          );
          
          // Create merged object
          mergedResults.push({
            label: obj.name,
            category: obj.category,
            description: obj.description,
            attributes: obj.attributes || [],
            relationships: obj.relationships || [],
            significance: obj.significance || "Detected object",
            confidence: obj.confidence || (matchingTf ? matchingTf.confidence : 0.8),
            bbox: matchingTf ? matchingTf.bbox : undefined
          });
        });
        
        // Add any remaining TensorFlow detections not matched by OpenAI
        detectionResults.forEach(tf => {
          const alreadyIncluded = mergedResults.some(
            mr => mr.label.toLowerCase() === tf.label.toLowerCase() ||
                 mr.label.toLowerCase().includes(tf.label.toLowerCase()) ||
                 tf.label.toLowerCase().includes(mr.label.toLowerCase())
          );
          
          if (!alreadyIncluded) {
            mergedResults.push({
              ...tf,
              description: `A ${tf.label} detected in the image.`,
              significance: "Detected by object recognition model"
            });
          }
        });
        
        // Add overall scene analysis if available
        if (structuredResponse.scene_description) {
          mergedResults.push({
            label: "Overall Scene",
            category: "Scene Analysis",
            description: structuredResponse.scene_description,
            attributes: structuredResponse.background_elements || [],
            relationships: [],
            significance: "Complete scene context",
            confidence: 0.95
          });
        }
        
        // Set the final results
        setClassificationResults(mergedResults);
        
        // Draw bounding boxes again with final results
        drawBoundingBoxes(mergedResults);
        
      } catch (openaiError) {
        console.error("OpenAI analysis failed:", openaiError);
        
        // If OpenAI fails but we have TensorFlow results, use those
        if (detectionResults.length > 0) {
          setClassificationResults(detectionResults);
        } else {
          throw new Error("Image analysis failed");
        }
      }
      
      // Successfully completed analysis
      
      // Auto-complete the challenge after successful detection
      if (!isCompleted) {
        // Trigger confetti directly here rather than through handleCompleteChallenge
        setTimeout(() => {
          // Mark as completed - this uses the correct challenge ID
          markChallengeAsCompleted('challenge-2');
          setIsCompleted(true);
          
          // Show confetti
          setShowConfetti(true);
          
          // Hide confetti and navigate to challenge hub after 3 seconds
          setTimeout(() => {
            setShowConfetti(false);
            navigate('/');
          }, 3000);
        }, 1000); // Small delay to allow results to display first
      }
      
    } catch (err) {
      console.error('Error in image classification process:', err);
      setError('An unexpected error occurred. Please try again or refresh the page.');
    } finally {
      setShowAnalysisOverlay(false);
      setIsClassifying(false);
    }
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
  
  // Handle completing the challenge
  const handleCompleteChallenge = (fromHeader = false) => {
    // If triggered from header button, skip the validation
    if (!fromHeader && (!classificationResults || classificationResults.length === 0)) {
      updateAnalysisStage('error', 'Please analyze at least one image to complete the challenge.');
      setShowAnalysisOverlay(true);
      setTimeout(() => setShowAnalysisOverlay(false), 3000);
      return;
    }
    
    // Requirements met, mark challenge as completed
    markChallengeAsCompleted('challenge-2');
    setIsCompleted(true);
    
    // Trigger confetti
    setShowConfetti(true);
    
    // Reset confetti and navigate to challenge hub after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
      navigate('/');
    }, 3000);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Confetti effect is now handled by the ChallengeHeader component */}
      
      {/* Replace back button with ChallengeHeader */}
      <ChallengeHeader
        title="AI Image Classifier - Identify, Interpret, Innovate!"
        icon={<ImageIcon size={24} />}
        challengeId="challenge-2"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={() => handleCompleteChallenge(true)}
      />
      
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold flex items-center text-gray-800">
            <ImageIcon className="w-6 h-6 mr-2 text-blue-600" />
            AI Image Classifier
          </h1>
          <p className="text-gray-600">
            Analyze images to identify objects, scenes, and patterns using computer vision.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto p-4">
          {/* Analysis Overlay */}
          <AnalysisOverlay 
            stage={analysisStage}
            message={analysisMessage}
            isVisible={showAnalysisOverlay}
          />
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-500 p-6 text-white">
              <div className="flex items-center mb-2">
                <Box size={36} className="mr-3" />
                <h1 className="text-3xl font-bold">AI Object Detection</h1>
              </div>
              <p className="text-lg opacity-90">
                Detect and locate multiple objects in images with bounding boxes and confidence scores
              </p>
            </div>
            
            <div className="p-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {/* Model Loading Message */}
              {isModelLoading && (
                <div className="bg-blue-50 text-blue-700 p-3 rounded-md mb-4 flex items-center">
                  <RefreshCw size={20} className="mr-2 animate-spin" />
                  Loading object detection model. This may take a moment...
                </div>
              )}
              
              {/* How AI Works for You section */}
              <div className="bg-gradient-to-r from-white to-purple-50 rounded-xl shadow-sm border border-purple-100 p-4 mb-4">
                <h2 className="text-lg font-semibold text-purple-700 mb-3 flex items-center">
                  <Zap size={20} className="mr-2 text-purple-500" />
                  How AI Works for You:
                </h2>
                <p className="text-gray-700 mb-4 border-l-4 border-purple-300 pl-4">
                  Discover hidden insights by analyzing images to detect objects, recognize scenes, and uncover patterns with cutting-edge computer vision. AI processes visual data to interpret shapes, colors, and textures, making sense of the world with supercharged precision!
                </p>
              </div>
              
              {/* Challenge Steps Quick View */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-sm border border-purple-100 p-4 mb-6">
                <h2 className="text-lg font-semibold text-purple-700 mb-3 flex items-center">
                  <Check size={20} className="mr-2 text-purple-500" />
                  Challenge Steps Quick View:
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <span className="text-green-500 mr-2 font-bold text-xl">✔</span>
                    <span>
                      <span className="text-purple-600 font-medium">Step 1:</span> Choose a sample image below and click Detect Objects to analyze it.
                    </span>
                  </li>
                  <li className="flex items-start bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <span className="text-green-500 mr-2 font-bold text-xl">✔</span>
                    <span>
                      <span className="text-purple-600 font-medium">Step 2:</span> Review the AI-generated object detection results and suggested use cases.
                    </span>
                  </li>
                  <li className="flex items-start bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <span className="text-green-500 mr-2 font-bold text-xl">✔</span>
                    <span>
                      <span className="text-purple-600 font-medium">Step 3:</span> Challenge Completed! Click Complete & Return!
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Object Detection Challenge</h2>
                <p className="text-gray-600 mb-6">
                  Upload or take a photo, and see how AI can instantly detect objects with bounding boxes and detailed analysis.
                </p>
                
                {/* Image selection area */}
                <div className="rounded-lg border border-dashed border-gray-300 p-6 mb-6 bg-white">
                  {!imagePreview && (
                    <div className="text-center py-6">
                      <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-purple-100">
                        <ImageIcon size={24} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Choose from a Sample Image Below</h3>
                    </div>
                  )}
                </div>
                
                {/* Image display with canvas overlay for bounding boxes */}
                {imagePreview && (
                  <div className="relative mb-6 flex justify-center">
                    <div className="relative inline-block">
                      <img 
                        ref={imageRef}
                        src={imagePreview}
                        alt="Uploaded image"
                        className="max-w-full max-h-[400px] rounded-lg shadow-sm"
                        style={{ display: 'block' }}
                        onLoad={() => {
                          if (classificationResults && classificationResults.length > 0) {
                            drawBoundingBoxes(classificationResults);
                          }
                        }}
                      />
                      <canvas 
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      />
                    </div>
                  </div>
                )}
                
                {/* Classification button */}
                {imagePreview && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={classifyImage}
                      disabled={isClassifying || !imagePreview || isModelLoading}
                      className={`px-6 py-3 rounded-md text-white font-medium flex items-center ${
                        isClassifying || !imagePreview || isModelLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {isClassifying ? (
                        <>
                          <RefreshCw size={20} className="mr-2 animate-spin" />
                          Analyzing Image...
                        </>
                      ) : (
                        <>
                          <Box size={20} className="mr-2" />
                          Detect Objects
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {/* Classification results with bounding boxes */}
                {classificationResults && (
                  <ClassificationResults results={classificationResults} />
                )}
              </div>
              
              {/* Sample images section */}
              <div className="mb-8 mt-12">
                <h3 className="text-xl font-bold mb-3 text-gray-800">Try Object Detection</h3>
                <p className="text-gray-600 mb-3">
                  Select a sample image below, then click "Detect Objects" to see AI vision in action.
                </p>
              </div>
              
              {/* Sample images */}
              <div className="mb-8">
                <SampleImages onSelectImage={handleSampleImageSelect} />
                <p className="text-gray-600 mt-4 italic">
                  AI on the Job: These examples show how AI can detect common objects with high accuracy.
                </p>
              </div>
              
              {/* Business applications */}
              <div className="mb-8 mt-12">
                <h3 className="text-xl font-bold mb-3 text-gray-800">AI Object Detection at Work</h3>
                <p className="text-gray-600 mb-4">
                  Discover how object detection can transform your business operations:
                </p>
                <BusinessApplications />
              </div>
              
              {/* Challenge completion section */}
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mt-12 mb-8">
                <h3 className="text-xl font-bold mb-3 text-purple-800">Challenge Status</h3>
                <p className="text-purple-700 mb-4">
                  {isCompleted 
                    ? "Congratulations! You've successfully completed the AI Image Classifier challenge. The challenge will automatically be marked as completed when you detect objects in an image."
                    : "The challenge will automatically be marked as completed when you detect objects in an image."}
                </p>
                
                {/* Challenge status indicator and Return to Hub button */}
                <div className="flex flex-col md:flex-row justify-center items-center mt-6 gap-4">
                  <div className={`px-6 py-3 rounded-md text-white font-bold text-lg ${
                    isCompleted ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {isCompleted ? "Challenge Completed!" : "Waiting for Object Detection..."}
                  </div>
                  
                  {isCompleted && (
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 rounded-md text-white font-bold text-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                    >
                      Return to Hub
                    </button>
                  )}
                </div>
              </div>
              
              {/* Challenge tips */}
              <div className="mt-8 bg-blue-50 p-4 rounded-md">
                <div className="flex items-start">
                  <Info size={20} className="text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Object Detection Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li>Clear, well-lit images produce the best detection results</li>
                      <li>The detector works best when objects are clearly visible and not obscured</li>
                      <li>Try with different types of objects to see the varying confidence levels</li>
                      <li>Check how bounding boxes precisely locate each object in the image</li>
                      <li>Notice how confidence scores indicate the AI's certainty about each detection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                This application uses TensorFlow.js, an open-source machine learning library that allows models to run directly in the browser. 
                TensorFlow.js uses WebGL acceleration to perform computations on the GPU, making it possible to run complex neural networks with reasonable performance on client devices.
              </p>
              
              <h5 className="font-medium mt-4 mb-2">MobileNet Model</h5>
              <p className="text-gray-700 mb-3">
                For image classification, we use a pre-trained MobileNet model, which is a convolutional neural network designed for efficient inference on mobile and embedded devices. 
                MobileNet uses depthwise separable convolutions to reduce the model size and computational requirements while maintaining high accuracy. 
                The model was trained on the ImageNet dataset, which contains over 14 million images across 1,000 categories.
              </p>
              
              <h5 className="font-medium mt-4 mb-2">COCO-SSD Model</h5>
              <p className="text-gray-700 mb-3">
                For object detection capabilities, we use the COCO-SSD (Common Objects in Context - Single Shot MultiBox Detector) model. 
                This model can identify and locate multiple objects within an image by predicting bounding boxes and class probabilities in a single forward pass. 
                The SSD architecture is optimized for speed and accuracy balance, making it suitable for real-time applications.
              </p>
              
              <h5 className="font-medium mt-4 mb-2">Image Processing Pipeline</h5>
              <p className="text-gray-700 mb-3">
                When you upload or select an image, the following process occurs:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-4">
                <li>The image is loaded and resized to match the input dimensions required by the neural network (typically 224×224 pixels for MobileNet)</li>
                <li>Pixel values are normalized to the range expected by the model (typically -1 to 1 or 0 to 1)</li>
                <li>The preprocessed image is passed through the neural network</li>
                <li>The model outputs probability scores for each class</li>
                <li>Results are filtered and sorted by confidence score</li>
                <li>The top predictions are displayed with their confidence percentages</li>
              </ol>
              
              <h5 className="font-medium mt-4 mb-2">OpenAI Integration</h5>
              <p className="text-gray-700 mb-3">
                For enhanced analysis of classified images, we use OpenAI's GPT models to generate insights and explanations about the detected objects. 
                The API receives the classification results and generates contextual information about the objects, potential business applications, and other relevant insights.
              </p>
              
              <h5 className="font-medium mt-4 mb-2">Performance Optimizations</h5>
              <p className="text-gray-700">
                Several techniques are used to optimize performance:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
                <li>Model quantization to reduce memory footprint and inference time</li>
                <li>Lazy loading of models to improve initial page load time</li>
                <li>Caching of model weights to prevent redundant downloads</li>
                <li>Progressive image loading and processing to improve perceived performance</li>
                <li>Batch prediction for multiple images when applicable</li>
              </ul>
              
              <h5 className="font-medium mt-4 mb-2">React and State Management</h5>
              <p className="text-gray-700">
                The UI is built with React using functional components and hooks for state management. The application uses useState and useEffect hooks to manage the classification process and results display. 
                Canvas manipulations for image processing are handled through useRef hooks to directly access and modify the DOM elements when needed.
              </p>
            </div>
          </div>
        </details>
      </div>
      
      {/* Back to Challenge Hub Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Challenge Hub
        </button>
      </div>
    </div>
  );
};

export default ImageClassifierMain; 