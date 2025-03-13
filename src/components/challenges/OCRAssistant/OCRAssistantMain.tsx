import React, { useState, useEffect } from 'react';
import { FileText, ScanText, BookOpen, AlertTriangle, Upload, Camera, Edit3, RefreshCw, AlertCircle, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import OCRProcessing from './components/OCRProcessing';
import OCRResults from './components/OCRResults';
import heic2any from 'heic2any';
import SampleImages from './components/SampleImages';
import ChallengeHeader from '../../shared/ChallengeHeader';

const OCRAssistantMain: React.FC = () => {
  // User progress tracking
  const [userProgress, setUserProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // State for managing the challenge flow
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [originalText, setOriginalText] = useState<string>('');
  const [editedText, setEditedText] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrCount, setOcrCount] = useState<number>(0);
  const [handwritingTested, setHandwritingTested] = useState<boolean>(false);
  const [fileUploadKey, setFileUploadKey] = useState<number>(0);
  const [isHighQuality, setIsHighQuality] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  
  // Check if challenge is already completed
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-ocr')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  // Handle image selection from sample images
  const handleImageSelect = async (imageUrl: string, isHandwriting: boolean) => {
    setError(null);
    setCurrentImage(null);
    setActiveTab('upload');
    
    try {
      await handleProcessImage(imageUrl, isHandwriting);
    } catch (err) {
      console.error('Error processing sample image:', err);
      setError('Failed to process sample image. Please try again or upload your own image.');
      setIsProcessing(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Please upload an image less than 10MB.');
      setFileUploadKey(prev => prev + 1); // Reset input
      return;
    }
    
    // Process the uploaded file
    processUploadedFile(file);
  };
  
  // Process the uploaded file
  const processUploadedFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setLoadingProgress(10);
      
      // Create object URL for image preview
      const fileUrl = URL.createObjectURL(file);
      setCurrentImage(fileUrl);
      
      // Check if the file is a HEIC format
      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        setLoadingProgress(20);
        // Convert HEIC to JPEG
        const blob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });
        
        setLoadingProgress(50);
        // Create a new file from the converted blob
        const jpegFile = new File(
          [blob as Blob], 
          file.name.replace(/\.heic$/i, '.jpg'), 
          { type: 'image/jpeg' }
        );
        
        // Update the file URL
        URL.revokeObjectURL(fileUrl);
        const jpegUrl = URL.createObjectURL(jpegFile);
        setCurrentImage(jpegUrl);
        
        // Determine if the image might contain handwriting
        // This is a simple guess; for real apps, use ML to detect
        const isHandwriting = file.name.toLowerCase().includes('handwritten') || 
                           file.name.toLowerCase().includes('handwriting') ||
                           file.name.toLowerCase().includes('note');
        
        await handleProcessImage(jpegUrl, isHandwriting);
      } else {
        // Determine if the image might contain handwriting
        const isHandwriting = file.name.toLowerCase().includes('handwritten') || 
                           file.name.toLowerCase().includes('handwriting') ||
                           file.name.toLowerCase().includes('note');
        
        await handleProcessImage(fileUrl, isHandwriting);
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process the image. Please try a different image.');
      setIsProcessing(false);
      setLoadingProgress(0);
      
      // Clean up object URL if needed
      if (currentImage) {
        URL.revokeObjectURL(currentImage);
      }
    }
  };
  
  // Handle text edit
  const handleTextEdit = (newText: string) => {
    setEditedText(newText);
  };
  
  // Handle completing the challenge
  const handleCompleteChallenge = () => {
    // Check if user has processed at least one OCR image
    if (ocrCount < 1) {
      alert('Please process at least one image with OCR before completing the challenge.');
      return;
    }
    
    markChallengeAsCompleted('challenge-ocr');
    setIsCompleted(true);
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };
  
  // Handle camera capture
  const handleCameraCapture = async () => {
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create a video element to display the camera stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Wait for the video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
      
      // Create a canvas to capture the image
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      // Stop all video tracks
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else throw new Error('Failed to capture image from camera');
        }, 'image/jpeg', 0.9);
      });
      
      // Create a file from the blob
      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Process the captured image
      processUploadedFile(file);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please check your permissions and try again.');
    }
  };
  
  // Reset OCR process
  const resetOCR = () => {
    if (currentImage) {
      URL.revokeObjectURL(currentImage);
    }
    
    setCurrentImage(null);
    setOriginalText('');
    setEditedText('');
    setActiveTab('upload');
    setError(null);
    setFileUploadKey(prev => prev + 1); // Reset file input
  };
  
  // Process the selected or uploaded image for OCR
  const handleProcessImage = async (imageUrl: string, isHandwriting: boolean) => {
    setIsProcessing(true);
    setLoadingProgress(0);
    
    try {
      // If handwriting test hasn't been done yet, mark as tested if this is handwriting
      if (!handwritingTested && isHandwriting) {
        setHandwritingTested(true);
      }
      
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const imageBlob = await response.blob();
      setLoadingProgress(50);
      
      // Convert blob to base64
      const base64Image = await blobToBase64(imageBlob);
      setLoadingProgress(60);
      
      // For API call, we only need the base64 data part, not the prefix
      const base64Data = base64Image.split(',')[1];
      
      // Prepare the API request data
      const requestData = {
        model: isHandwriting ? 'handwritten' : 'printed',
        imageBase64: base64Data,
        highQuality: isHighQuality
      };
      
      // Simulate API response based on the type of image
      let extractedText = '';
      
      // If it's a handwritten image, simulate handwriting OCR
      if (isHandwriting) {
        // Simulate longer processing for handwriting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Determine text based on image description
        if (imageUrl.includes('handwriting-samples') || imageUrl.includes('journal')) {
          extractedText = "Dear John,\n\nI hope this letter finds you well. I wanted to thank you for your hospitality last weekend. The dinner was delicious and the conversation was enjoyable.\n\nI look forward to seeing you again soon.\n\nBest wishes,\nSarah";
        } else {
          extractedText = "Meeting notes:\n- Project deadline: June 15th\n- Budget review next week\n- Contact client about requirements\n- Schedule team meeting for Thursday\n\nReminders:\n1. Send proposal draft\n2. Update project timeline\n3. Prepare presentation";
        }
      } else {
        // Simulate printed text OCR
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Determine text based on image description
        if (imageUrl.includes('letter') || imageUrl.includes('business-letter')) {
          extractedText = "John Smith\n123 Main Street\nAnytown, USA 12345\n\nJanuary 15, 2023\n\nDear Sir or Madam,\n\nI am writing to inquire about the position advertised in the Daily News.\n\nI have five years of experience in this field and would be pleased to discuss my qualifications with you.\n\nThank you for your consideration.\n\nSincerely,\nJohn Smith";
        } else if (imageUrl.includes('receipt')) {
          extractedText = "SALES RECEIPT\n\nABC Store\n456 Commerce Ave\nAnytown, USA 12345\n\nDate: 01/15/2023\nTime: 14:30\n\nItem 1................$15.99\nItem 2................$24.50\nItem 3..................$9.99\n\nSubtotal: $50.48\nTax (8.25%): $4.16\nTotal: $54.64\n\nThank you for shopping with us!";
        } else if (imageUrl.includes('menu')) {
          extractedText = "DELICIOUS RESTAURANT\n\nAppetizers\nGarlic Bread...........$5.99\nMozzarella Sticks......$7.99\nBuffalo Wings..........$9.99\n\nMain Courses\nChicken Parmesan......$16.99\nSirloin Steak..........$22.99\nGrilled Salmon.........$18.99\n\nDesserts\nCheesecake.............$6.99\nIce Cream...............$4.99\n\nBeverages\nSoft Drinks.............$2.49\nCoffee..................$2.99";
        } else {
          extractedText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        }
      }
      
      // Clear the progress interval
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // Set the extracted text
      setOriginalText(extractedText);
      setEditedText(extractedText);
      
      // Switch to results tab
      setActiveTab('results');
      
      // Increment OCR count for challenge completion tracking
      setOcrCount(prev => prev + 1);
    } catch (err) {
      console.error('Error in OCR processing:', err);
      setError('Failed to extract text from the image. Please try a different image or check your connection.');
    } finally {
      setIsProcessing(false);
      setLoadingProgress(0);
    }
  };
  
  // Convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  // Render the component
  return (
    <div className="max-w-6xl mx-auto p-4">
      <ChallengeHeader
        title="OCR Assistant Challenge"
        icon={<ScanText className="h-6 w-6 text-indigo-600" />}
        challengeId="challenge-ocr"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
        isHPChallenge={true}
      />
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Challenge Progress Tracker */}
        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Challenge Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg flex items-center ${ocrCount >= 2 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${ocrCount >= 2 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                {ocrCount >= 2 ? <CheckCircle2 size={14} /> : '1'}
              </div>
              <span>Extract text from 2 different images</span>
            </div>
            <div className={`p-3 rounded-lg flex items-center ${handwritingTested ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${handwritingTested ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                {handwritingTested ? <CheckCircle2 size={14} /> : '2'}
              </div>
              <span>Process handwritten text</span>
            </div>
          </div>
      </div>
      
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Main Content Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 ${activeTab === 'upload' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('upload')}
          >
            <div className="flex items-center">
              <Upload size={18} className="mr-2" />
            <span>Upload Image</span>
            </div>
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'samples' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('samples')}
          >
            <div className="flex items-center">
              <BookOpen size={18} className="mr-2" />
            <span>Sample Images</span>
            </div>
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="mt-6">
        {activeTab === 'upload' && (
            <div>
              {/* Text Type Toggle */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setIsHighQuality(true)}
                    className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${
                      isHighQuality
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Printed Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHighQuality(false)}
                    className={`px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-lg ${
                      !isHighQuality
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Edit3 className="h-4 w-4 inline mr-2" />
                    Handwritten
                  </button>
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
                {currentImage ? (
                  <div className="mb-4">
                    <img
                      src={currentImage}
                      alt="Uploaded"
                      className="max-h-64 max-w-full mx-auto rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="flex justify-center">
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md inline-flex items-center transition duration-150 ease-in-out"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        <span>Upload Image</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileUpload}
                          key={fileUploadKey}
                        />
                      </label>
                      
                      <button
                        onClick={handleCameraCapture}
                        className="ml-4 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md inline-flex items-center transition duration-150 ease-in-out"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        <span>Use Camera</span>
                      </button>
                    </div>
                    
                    <p className="mt-3 text-sm text-gray-500">
                      Drag and drop your image here, or click to upload
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Support for JPEG, PNG, HEIC, etc. Max size 5MB.
                    </p>
                  </div>
                )}
                
                {currentImage && !isProcessing && (
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        resetOCR();
                      }}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Remove Image
                    </button>
                <button
                      onClick={() => {
                        handleProcessImage(currentImage, !isHighQuality);
                      }}
                      className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md inline-flex items-center"
                    >
                      <ScanText className="h-4 w-4 mr-2" />
                      Extract Text
                </button>
              </div>
            )}
              </div>
              
              {/* Sample Images */}
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-800 mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-indigo-600" />
                  Sample Images 
                  <span className="ml-2 text-xs text-gray-500">(Click an image to process it)</span>
                </h3>
              <SampleImages onSelectImage={handleImageSelect} />
            </div>
              
              {/* Processing Tips */}
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="text-amber-600 mr-2 mt-0.5 h-5 w-5" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">OCR Processing Tips</h4>
                    <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                      <li>For best results, use images with clear text and good lighting</li>
                      <li>Handwritten text recognition is more challenging and may require higher quality images</li>
                      <li>Images with simple backgrounds work better than complex ones</li>
                      <li>Text should be well-aligned and not heavily skewed</li>
                      <li>Adjust the text type setting to match your image for optimal results</li>
                </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'samples' && (
            <SampleImages onSelectImage={handleImageSelect} />
          )}
          
          {activeTab === 'results' && originalText && (
            <OCRResults
              originalText={originalText}
              editedText={editedText}
              onTextEdit={handleTextEdit}
              imagePreview={currentImage}
              isHandwriting={!isHighQuality}
            />
          )}
          
          {isProcessing && (
            <OCRProcessing progress={loadingProgress} isHandwriting={!isHighQuality} />
          )}
          </div>
      </div>
    </div>
  );
};

export default OCRAssistantMain; 