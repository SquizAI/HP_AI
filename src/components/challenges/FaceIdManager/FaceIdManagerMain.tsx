import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Upload, Camera, CheckCircle, XCircle, User, Shield, AlertTriangle, Sun, Image, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import ChallengeHeader from '../../shared/ChallengeHeader'
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager'
import { Scan } from 'lucide-react'

// Sample data for simulating face recognition
const registeredFaces = [
  { id: 1, name: 'Alex Johnson', role: 'Marketing Director', confidence: 0.97, authorized: true, lastSeen: '2 days ago' },
  { id: 2, name: 'Taylor Rodriguez', role: 'Software Engineer', confidence: 0.98, authorized: true, lastSeen: '1 hour ago' },
  { id: 3, name: 'Morgan Chen', role: 'Product Manager', confidence: 0.95, authorized: true, lastSeen: 'Today' },
  { id: 4, name: 'Jamie Smith', role: 'UX Designer', confidence: 0.94, authorized: false, lastSeen: '3 days ago' },
  { id: 5, name: 'Casey Williams', role: 'Data Scientist', confidence: 0.96, authorized: true, lastSeen: 'Today' },
]

// Sample factors that can affect recognition accuracy
const environmentalFactors = [
  { name: 'Lighting', icon: <Sun size={20} />, description: 'Poor lighting can reduce accuracy by up to 30%.' },
  { name: 'Angle', icon: <Image size={20} />, description: 'Face angles exceeding 15° from center can decrease recognition rates.' },
  { name: 'Changes in Appearance', icon: <User size={20} />, description: 'Glasses, masks, or hairstyle changes may require system retraining.' },
]

// Sample business use cases
const businessUses = [
  { name: 'Event Check-in', description: 'Streamline registration at conferences and corporate events.' },
  { name: 'Office Access', description: 'Secure entry to buildings and sensitive areas without physical badges.' },
  { name: 'Time Tracking', description: 'Automate employee attendance and time recording.' },
  { name: 'VIP Recognition', description: 'Identify and provide personalized service to important customers.' },
]

// Sample privacy considerations
const privacyConsiderations = [
  { name: 'Data Storage', description: 'Store only facial vectors rather than actual images when possible.' },
  { name: 'Consent', description: 'Always obtain explicit consent before collecting facial data.' },
  { name: 'Opt-out Options', description: 'Provide alternative methods for those who decline facial recognition.' },
  { name: 'Transparency', description: 'Clearly communicate how and why facial data is being collected and used.' },
]

const FaceIdManagerMain: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [demoStage, setDemoStage] = useState<'upload' | 'processing' | 'result'>('upload')
  const [recognitionResult, setRecognitionResult] = useState<typeof registeredFaces[0] | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.9)
  const [isAuthorizedOnly, setIsAuthorizedOnly] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Add state for challenge completion and confetti
  const [userProgress, setUserProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress.completedChallenges.includes('challenge-7')
  );
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Check if challenge is already completed on mount
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-7')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  // Handle file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setDemoStage('upload')
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Handle sample image selection
  const handleSampleImage = (sampleNumber: number) => {
    setUploadedImage(`/samples/face-${sampleNumber}.jpg`)
    setDemoStage('upload')
  }
  
  // Simulate processing the image
  const processImage = () => {
    if (!uploadedImage) return
    
    setDemoStage('processing')
    
    // Simulate processing delay
    setTimeout(() => {
      // Randomly select a face from our registered faces to simulate recognition
      const randomIndex = Math.floor(Math.random() * registeredFaces.length)
      const result = registeredFaces[randomIndex]
      
      // Only show as recognized if it meets our confidence threshold and authorization requirements
      if (result.confidence >= confidenceThreshold && (!isAuthorizedOnly || result.authorized)) {
        setRecognitionResult(result)
      } else {
        setRecognitionResult(null)
      }
      
      setDemoStage('result')
    }, 2000)
  }
  
  // Reset the demo
  const resetDemo = () => {
    setUploadedImage(null)
    setDemoStage('upload')
    setRecognitionResult(null)
  }
  
  // Handle completing the challenge
  const handleCompleteChallenge = () => {
    // Check if user has completed a full demo cycle to mark as complete
    if (!recognitionResult && demoStage !== 'result') {
      alert('Please complete the facial recognition demo before finishing the challenge.');
      return;
    }
    
    markChallengeAsCompleted('challenge-7');
    setIsCompleted(true);
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <ChallengeHeader
        title="Face ID Manager Challenge"
        icon={<Scan className="h-6 w-6 text-blue-600" />}
        challengeId="challenge-7"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
        isHPChallenge={true}
      />
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Upload Section */}
        <div className="mb-8">
          {!uploadedImage ? (
            <div className="w-full max-w-md">
              {/* Upload Interface */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              >
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Upload a Face Image</h3>
                <p className="text-gray-500 mb-4">Click to upload an image or drag and drop</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Select Image
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </div>
              
              {/* Sample Images */}
              <div className="mt-6">
                <h3 className="text-md font-medium mb-3">Or use a sample image:</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button 
                      key={num}
                      onClick={() => handleSampleImage(num)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-center transition-colors"
                    >
                      Sample {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md">
              {/* Image Preview */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Image Preview</h3>
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={uploadedImage} 
                    alt="Face to recognize" 
                    className="w-full h-auto max-h-64 object-contain" 
                  />
                </div>
              </div>
              
              {/* Advanced Options */}
              <div className="mb-6">
                <button 
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-blue-600 hover:text-blue-800 text-sm mb-2 flex items-center"
                >
                  {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                </button>
                
                {showAdvancedOptions && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confidence Threshold: {confidenceThreshold.toFixed(2)}
                      </label>
                      <input 
                        type="range" 
                        min="0.7" 
                        max="0.99" 
                        step="0.01"
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher threshold = fewer false positives, more false negatives</p>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={isAuthorizedOnly} 
                          onChange={() => setIsAuthorizedOnly(!isAuthorizedOnly)}
                          className="mr-2" 
                        />
                        <span className="text-sm font-medium text-gray-700">Only allow authorized personnel</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={processImage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Recognize Face
                </button>
                <button 
                  onClick={resetDemo}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Processing Section */}
        {demoStage === 'processing' && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium">Processing Image...</h3>
            <p className="text-gray-500">Detecting and analyzing faces</p>
          </div>
        )}
        
        {/* Results Section */}
        {demoStage === 'result' && (
          <div className="w-full max-w-md">
            <div className="mb-6">
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={uploadedImage!} 
                  alt="Face to recognize" 
                  className="w-full h-auto max-h-64 object-contain" 
                />
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Recognition Result</h3>
              
              {recognitionResult ? (
                <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <div className="flex items-center mb-4">
                    <CheckCircle size={24} className="text-green-600 mr-2" />
                    <span className="text-lg font-medium text-green-800">Face Recognized!</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{recognitionResult.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium">{recognitionResult.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Confidence</p>
                      <p className="font-medium">{(recognitionResult.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`font-medium ${recognitionResult.authorized ? 'text-green-600' : 'text-red-600'}`}>
                        {recognitionResult.authorized ? 'Authorized' : 'Unauthorized'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Last Seen</p>
                      <p className="font-medium">{recognitionResult.lastSeen}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <div className="flex items-center mb-4">
                    <XCircle size={24} className="text-red-600 mr-2" />
                    <span className="text-lg font-medium text-red-800">No Match Found</span>
                  </div>
                  <p className="text-gray-700">
                    The face could not be recognized or does not meet the confidence threshold ({confidenceThreshold.toFixed(2)}).
                    {isAuthorizedOnly && " Additionally, we're only showing authorized personnel."}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setDemoStage('upload')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={resetDemo}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
        
        {/* Environmental Factors Section */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-4">Environmental Factors</h2>
          <p className="text-gray-600 mb-6">
            Various environmental factors can affect face recognition accuracy. Here's what to consider:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {environmentalFactors.map((factor, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
                    {factor.icon}
                  </div>
                  <h3 className="font-medium">{factor.name}</h3>
                </div>
                <p className="text-gray-600 text-sm">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Business Applications */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-4">Business Applications</h2>
          <ul className="space-y-4">
            {businessUses.map((use, index) => (
              <li key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <h3 className="font-medium text-blue-800">{use.name}</h3>
                <p className="text-gray-600 text-sm">{use.description}</p>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Privacy & Security */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-4">Privacy & Security</h2>
          <div className="mb-4">
            <h3 className="font-medium text-red-800 mb-2">Important Considerations</h3>
            <p className="text-gray-600 text-sm mb-4">
              Facial recognition raises significant privacy concerns. When implementing such systems:
            </p>
            
            <ul className="space-y-3">
              {privacyConsiderations.map((item, index) => (
                <li key={index} className="flex">
                  <Shield size={18} className="mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium block">{item.name}</span>
                    <span className="text-gray-600 text-sm">{item.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Vulnerabilities */}
          <div>
            <h3 className="font-medium text-yellow-800 mb-2">Potential Vulnerabilities</h3>
            <div className="bg-yellow-50 p-4 rounded-md">
              <div className="flex">
                <AlertTriangle size={18} className="mr-2 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Face recognition systems can be vulnerable to spoofing attempts using photos, masks, or deepfakes. 
                  Consider implementing liveness detection and multiple authentication factors for high-security applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FaceIdManagerMain 