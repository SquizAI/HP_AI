import React, { useState, useEffect, useRef } from 'react';
import { Wand2, Sparkles, Image as ImageIcon, RefreshCw, Info, Zap, Lightbulb, Brain } from 'lucide-react';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import Confetti from '../../shared/Confetti';
import ChallengeHeader from '../../shared/ChallengeHeader';
import { generateImage, FluxImageGenerationOptions } from '../../../utils/fluxImageGenerator';

// Example style options for image generation
const STYLE_OPTIONS = [
  { id: 'vivid', name: 'Vivid', description: 'Bright, vibrant colors with heightened contrast' },
  { id: 'natural', name: 'Natural', description: 'True-to-life colors and realistic lighting' },
  { id: 'artistic', name: 'Artistic', description: 'Creative interpretation with painterly qualities' },
  { id: 'professional', name: 'Professional', description: 'Clean, corporate-friendly aesthetics' },
  { id: 'cinematic', name: 'Cinematic', description: 'Dramatic lighting with movie-like framing' },
  { id: 'vintage', name: 'Vintage', description: 'Retro aesthetics with nostalgic qualities' }
];

// Image ratio options
const RATIO_OPTIONS = [
  { id: 'square', name: 'Square', description: '1:1 ratio - ideal for social media posts' },
  { id: 'landscape', name: 'Landscape', description: '16:9 ratio - great for presentations and banners' },
  { id: 'portrait', name: 'Portrait', description: '9:16 ratio - perfect for mobile and stories' }
];

// Sample prompts to inspire users
const SAMPLE_PROMPTS = [
  {
    id: 'business1',
    category: 'Business',
    prompt: 'A diverse team of professionals collaborating on a digital project in a modern workspace with holographic displays',
    description: 'Team Collaboration',
    recommendedModel: 'Ideogram' // Visual scene
  },
  {
    id: 'business2',
    category: 'Business',
    prompt: 'Futuristic office space with sustainable design elements, plants integrated with technology, and natural lighting',
    description: 'Modern Workspace',
    recommendedModel: 'Ideogram' // Visual scene
  },
  {
    id: 'marketing1',
    category: 'Marketing',
    prompt: 'Eye-catching product showcase of an innovative smartphone with holographic display in a minimalist setting',
    description: 'Product Showcase',
    recommendedModel: 'Ideogram' // Visual scene
  },
  {
    id: 'typography1',
    category: 'Typography',
    prompt: 'Modern minimalist logo with the text "FLUX CREATIVE" in a clean sans-serif font with subtle gradients',
    description: 'Logo Design',
    recommendedModel: 'Recraft' // Text-focused
  }
];

// Example generation tips
const GENERATION_TIPS = [
  { id: 'specificity', title: 'Be Specific', description: 'Include details about subjects, setting, lighting, perspective, and style' },
  { id: 'atmosphere', title: 'Set the Atmosphere', description: 'Use descriptive words for mood, time of day, and environment' },
  { id: 'technical', title: 'Add Technical Details', description: 'Terms like "8K resolution", "photorealistic", "depth of field" improve quality' },
  { id: 'composition', title: 'Guide Composition', description: 'Mention foreground, background, framing, and focal points' },
  { id: 'revise', title: 'Revise & Refine', description: "If results aren't ideal, try adjusting your prompt with more specificity" }
];

// Function to save generated images (mock implementation)
const saveImage = async (imageUrl: string) => {
  try {
    // In a real app, this would save to a server or download the file
    // For now, we'll just simulate by opening in a new tab
    window.open(imageUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error saving image:', error);
    return false;
  }
};

const CreativeVisionMain: React.FC = () => {
  // User progress tracking
  const [userProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Image generation state
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Generation options
  const [selectedStyle, setSelectedStyle] = useState<string>('vivid');
  const [selectedRatio, setSelectedRatio] = useState<string>('square');
  const [useIdeogram, setUseIdeogram] = useState<boolean>(true);
  const [creativeMode, setCreativeMode] = useState<boolean>(false);
  
  // Gallery of generated images
  const [generatedGallery, setGeneratedGallery] = useState<Array<{id: string, prompt: string, imageUrl: string, style: string, ratio: string}>>([]);
  
  // Refs
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Check if challenge is already completed
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-creative-vision')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  /* Function to suggest the best model based on prompt content - keeping for future implementation
  const suggestBestModel = (promptText: string): 'Ideogram' | 'Recraft' => {
    const textLower = promptText.toLowerCase();
    
    // Keywords that suggest text-focused content (better for Recraft)
    const textKeywords = [
      'text', 'typography', 'font', 'logo', 'lettering', 'title', 'heading',
      'quote', 'slogan', 'word', 'letter', 'typeface', 'caption', 'serif'
    ];
    
    // Check if any text keywords are present
    const hasTextKeywords = textKeywords.some(keyword => textLower.includes(keyword));
    
    // If text keywords are present or the prompt is short (likely text-focused), suggest Recraft
    if (hasTextKeywords || promptText.length < 40) {
      return 'Recraft';
    }
    
    // Default to Ideogram for most visual content
    return 'Ideogram';
  };
  */
  
  // Handle using sample prompts
  const handleUseSamplePrompt = (samplePrompt: string, recommendedModel: string) => {
    setPrompt(samplePrompt);
    setUseIdeogram(recommendedModel === 'Ideogram');
    // Scroll to prompt input
    promptInputRef.current?.focus();
  };
  
  // Generate image based on prompt
  const handleGenerateImage = async () => {
    // Validate prompt
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image');
      promptInputRef.current?.focus();
      return;
    }
    
    // Clear previous states
    setError(null);
    setIsGenerating(true);
    setGeneratedImage(null);
    
    try {
      // Prepare generation options
      const options: FluxImageGenerationOptions = {
        useIdeogram: useIdeogram,
        style: selectedStyle,
        size: selectedRatio === '1:1' ? 'square' : 
              selectedRatio === '16:9' ? 'landscape' : 
              selectedRatio === '9:16' ? 'portrait' : 'square'
      };
      
      // Generate image
      const imageUrl = await generateImage(prompt, options);
      
      // Handle success
      if (imageUrl) {
        setGeneratedImage(imageUrl);
        
        // Add to gallery
        const newImageItem = {
          id: Date.now().toString(),
          prompt,
          imageUrl,
          style: selectedStyle,
          ratio: selectedRatio
        };
        
        setGeneratedGallery(prev => [newImageItem, ...prev]);
        
        // Mark challenge as completed if first generation
        if (!isCompleted && generatedGallery.length === 0) {
          const success = await markChallengeAsCompleted('challenge-5');
          if (success) {
            setIsCompleted(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        }
      } else {
        setError('Failed to generate image. Please try again with a different prompt.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setError('An error occurred while generating the image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
    // Function to check if an image is already in the gallery
  const galleryContainsImage = (imageUrl: string): boolean => {
    return generatedGallery.some(item => item.imageUrl === imageUrl);
  };

  // Function to open image in a new tab (used in UI buttons)
  const handleOpenImage = async () => {
    if (!generatedImage) return;
    
    const success = await saveImage(generatedImage);
    if (success) {
      setSuccessMessage('Image opened in a new tab');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError('Failed to save the image');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Handle saving an image to gallery
  const handleSaveToGallery = () => {
    if (!generatedImage) return;
    
    if (!galleryContainsImage(generatedImage)) {
      const newImageItem = {
        id: Date.now().toString(),
        prompt,
        imageUrl: generatedImage,
        style: selectedStyle,
        ratio: selectedRatio
      };
      
      setGeneratedGallery(prev => [newImageItem, ...prev]);
      setSuccessMessage('Image saved to your gallery');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError('This image is already in your gallery');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 min-h-screen rounded-xl">
      {/* Challenge Header */}
      <ChallengeHeader 
        title="Creative Vision Challenge" 
        icon={<span className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-1 flex items-center justify-center w-10 h-10 text-white">🎨</span>}
        challengeId="challenge-5"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
      />
      
      {/* Show confetti when challenge is completed */}
      {showConfetti && <Confetti active={showConfetti} />}
      
      {/* How AI Works for You section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"></div>
        
        <h2 className="text-xl font-bold mb-4 flex items-center relative z-10">
          <Info className="mr-2 h-5 w-5 text-indigo-500" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">How AI Works for You</span>
        </h2>
        
        <div className="text-gray-700 space-y-4 relative z-10">
          <p className="leading-relaxed">
            Transform your ideas into stunning visuals with AI-powered image generation. Bring your words to life with AI-generated visuals—perfect for marketing, presentations, and social media.
          </p>
          
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2 mt-0.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span><span className="font-medium">Instant Marketing Visuals</span> – Generate eye-catching designs without a design team.</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2 mt-0.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span><span className="font-medium">Fast Concept Visualization</span> – Bring product ideas to life for quick validation.</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2 mt-0.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span><span className="font-medium">Custom Presentation Graphics</span> – Enhance slides with AI-crafted visuals.</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2 mt-0.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span><span className="font-medium">Consistent Branding</span> – Maintain a unified look across all channels.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Challenge Steps Quick View */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 relative overflow-hidden mt-6">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-xl"></div>
        
        <h2 className="text-xl font-bold mb-4 flex items-center relative z-10">
          <Lightbulb className="mr-2 h-5 w-5 text-indigo-500" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Challenge Steps Quick View</span>
        </h2>
        
        <div className="space-y-3 relative z-10">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold text-sm mr-3">1</div>
            <div className="text-gray-700 flex items-center">
              <span className="text-indigo-500 mr-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Complete all the steps in the Image Generator box.</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold text-sm mr-3">2</div>
            <div className="text-gray-700 flex items-center">
              <span className="text-indigo-500 mr-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Click Generate Image to create your AI-powered visual.</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold text-sm mr-3">3</div>
            <div className="text-gray-700 flex items-center">
              <span className="text-indigo-500 mr-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Challenge Completed! Click Complete & Return!</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Input area */}
        <div className="space-y-5 bg-white rounded-2xl p-6 shadow-lg border border-purple-100 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full blur-xl"></div>
          {/* Prompt input */}
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 inline-block">Create Your Vision</h2>
            <div className="mb-4">
              <label htmlFor="prompt" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Sparkles size={16} className="mr-2 text-purple-500" />
                What would you like to create?
              </label>
              <textarea
                id="prompt"
                ref={promptInputRef}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[120px] bg-white/80 backdrop-blur-sm font-medium"
                placeholder="Describe your dream image in detail..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
          </div>
          
          {/* Model selection */}
          <div className="mb-5 relative z-10">
            <h3 className="text-md font-semibold mb-3 flex items-center">
              <Zap size={16} className="mr-2 text-indigo-500" />
              Choose Your Engine
            </h3>
            <div className="flex gap-3">
              <button 
                className={`px-4 py-3 rounded-xl flex-1 flex items-center justify-center gap-2 font-medium transition-all duration-200 ${useIdeogram ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200' : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'}`}
                onClick={() => setUseIdeogram(true)}
              >
                <Wand2 size={18} className={useIdeogram ? 'text-white' : 'text-purple-500'} />
                <span>Ideogram</span>
              </button>
              <button 
                className={`px-4 py-3 rounded-xl flex-1 flex items-center justify-center gap-2 font-medium transition-all duration-200 ${!useIdeogram ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-indigo-200 text-gray-700 hover:bg-indigo-50'}`}
                onClick={() => setUseIdeogram(false)}
              >
                <ImageIcon size={18} className={!useIdeogram ? 'text-white' : 'text-indigo-500'} />
                <span>Recraft</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 bg-indigo-50 rounded-lg p-2 border border-indigo-100">
              <Info size={14} className="inline mr-1 text-indigo-500" />
              {useIdeogram 
                ? 'Ideogram excels at creative, artistic, and abstract imagery with unique styles.' 
                : 'Recraft specializes in photorealistic images and designs with text elements.'}
            </p>
          </div>
          
          {/* Style selection */}
          <div className="mb-5 relative z-10">
            <h3 className="text-md font-semibold mb-3 flex items-center">
              <Sparkles size={16} className="mr-2 text-pink-500" />
              Select Visual Style
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  className={`px-3 py-2 rounded-xl text-sm relative overflow-hidden transition-all duration-200 ${selectedStyle === style.id 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-md shadow-pink-200 scale-105 border-2 border-white'
                    : 'bg-white text-gray-700 border border-purple-100 hover:bg-purple-50'}`}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <div className="relative z-10">{style.name}</div>
                  {selectedStyle === style.id && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.15)_0%,_transparent_70%)] animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            {/* Style description tooltip */}
            <div className="mt-2 text-xs text-gray-600 italic">
              {STYLE_OPTIONS.find(s => s.id === selectedStyle)?.description}
            </div>
          </div>
          
          {/* Aspect ratio selection */}
          <div className="mb-5 relative z-10">
            <h3 className="text-md font-semibold mb-3 flex items-center">
              <ImageIcon size={16} className="mr-2 text-cyan-500" />
              Choose Dimensions
            </h3>
            <div className="flex gap-3">
              {RATIO_OPTIONS.map((ratio) => (
                <button
                  key={ratio.id}
                  className={`relative flex-1 px-4 py-3 rounded-xl transition-all duration-200 ${selectedRatio === ratio.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-blue-100' 
                    : 'bg-white border border-blue-100 text-gray-700 hover:bg-blue-50'}`}
                  onClick={() => setSelectedRatio(ratio.id)}
                >
                  <div className="text-center">
                    <div className={`text-sm font-medium ${selectedRatio === ratio.id ? 'text-white' : 'text-gray-800'}`}>{ratio.name}</div>
                    
                    {/* Visual representation of aspect ratio */}
                    <div className="mx-auto my-1 bg-white/20 rounded-sm border border-white/40" 
                      style={{
                        width: ratio.id === 'square' ? '24px' : ratio.id === 'landscape' ? '32px' : '18px',
                        height: ratio.id === 'square' ? '24px' : ratio.id === 'landscape' ? '18px' : '32px'
                      }}>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {/* Ratio description tooltip */}
            <div className="mt-2 text-xs text-gray-600 italic">
              {RATIO_OPTIONS.find(r => r.id === selectedRatio)?.description}
            </div>
          </div>
          
          {/* Creative mode toggle */}
          <div className="mb-5 relative z-10">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100">
              <label className="flex items-center cursor-pointer justify-between">
                <div>
                  <div className="flex items-center">
                    <Lightbulb size={16} className="mr-2 text-amber-500" />
                    <span className="text-sm font-semibold text-gray-800">Creative Mode</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 ml-6">Enables more surreal and unexpected artistic interpretations</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={creativeMode}
                    onChange={(e) => setCreativeMode(e.target.checked)}
                  />
                  <div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r from-purple-500 to-indigo-500">
                    {creativeMode && <Sparkles size={14} className="absolute top-1.5 right-1.5 text-white" />}
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          {/* Generate button */}
          <button
            className="w-full relative mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 animate-gradient-slow text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-1 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            onClick={handleGenerateImage}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin mr-3 h-5 w-5 text-white" />
                <span className="text-base">Creating Your Vision...</span>
              </>
            ) : (
              <>
                <Wand2 className="mr-3 h-5 w-5 text-white" />
                <span className="text-base">Generate Masterpiece</span>
              </>
            )}
            {!isGenerating && !prompt.trim() && (
              <div className="absolute -top-6 right-0 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                Enter a prompt first
              </div>
            )}
          </button>
          
          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm" role="alert">
              <p className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">{error}</span>
              </p>
            </div>
          )}
          
          {/* Success message */}
          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm" role="alert">
              <p className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">{successMessage}</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Right column: Generated image and sample prompts */}
        <div className="space-y-6">
          {/* Generated image */}
          {generatedImage ? (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 overflow-hidden">
              <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 inline-block">Your Masterpiece</h2>
              
              <div className="aspect-square overflow-hidden rounded-xl relative group">
                <img 
                  src={generatedImage} 
                  alt={prompt} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-purple-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="text-white font-medium truncate max-w-[70%] text-shadow-sm">{prompt}</div>
                  <button 
                    onClick={handleSaveToGallery}
                    disabled={galleryContainsImage(generatedImage)}
                    className={`text-white p-2.5 rounded-full transition-all duration-200 ${galleryContainsImage(generatedImage) 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-110'}`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  {useIdeogram ? 'Ideogram' : 'Recraft'} • {selectedStyle} • {selectedRatio}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    className="px-3 py-2 text-sm bg-white border border-indigo-200 text-indigo-700 rounded-lg flex items-center hover:bg-indigo-50 transition-colors"
                    onClick={() => {
                      setPrompt('');
                      setGeneratedImage(null);
                    }}
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    New Image
                  </button>
                  
                  <button
                    className="px-3 py-2 text-sm bg-white border border-indigo-200 text-indigo-700 rounded-lg flex items-center hover:bg-indigo-50 transition-colors"
                    onClick={handleOpenImage}
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in Tab
                  </button>
                  
                  <button
                    className="px-3 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg flex items-center hover:shadow-md transition-all"
                    onClick={handleSaveToGallery}
                    disabled={galleryContainsImage(generatedImage)}
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add to Gallery
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"></div>
              
              <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 inline-block relative z-10">Inspiration Gallery</h2>
              
              <div className="space-y-3 relative z-10">
                {SAMPLE_PROMPTS.map((sample, index) => (
                  <div 
                    key={index} 
                    className="border border-indigo-100 rounded-xl p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all hover:shadow-md group"
                    onClick={() => handleUseSamplePrompt(sample.prompt, sample.recommendedModel)}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium group-hover:text-indigo-700 transition-colors pr-3">{sample.prompt}</p>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 whitespace-nowrap">{sample.category}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">Recommended: {sample.recommendedModel}</p>
                      <span className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Try this
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Generation tips */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"></div>
            
            <h2 className="text-xl font-bold mb-4 flex items-center relative z-10">
              <svg className="mr-2 h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Creative Tips</span>
            </h2>
            
            <ul className="space-y-3 text-sm relative z-10">
              {GENERATION_TIPS.map((tip, index) => (
                <li key={index} className="flex items-start p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                  <span className="text-indigo-500 mr-2 mt-0.5 flex-shrink-0">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  <span>
                    <span className="font-semibold text-indigo-700">{tip.title}</span>
                    <span className="text-gray-600">: {tip.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      

      
      {/* Gallery of generated images */}
      {generatedGallery.length > 0 && (
        <div className="mt-12 relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-indigo-200/30 rounded-full blur-2xl"></div>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center relative z-10">
            <svg className="mr-3 h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Your Creative Gallery</span>
            <span className="ml-3 text-sm bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-normal">{generatedGallery.length} creations</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
            {generatedGallery.map((item) => (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-purple-100 transition-all duration-300 hover:shadow-xl hover:shadow-purple-200/30 hover:-translate-y-1 group">
                <div className="aspect-square overflow-hidden relative">
                  <img 
                    src={item.imageUrl} 
                    alt={item.prompt} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-indigo-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-indigo-700 transition-colors">{item.prompt}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {item.style} • {item.ratio}
                    </div>
                    <div className="text-xs text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View details
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <h4 className="text-blue-700 font-medium">Text-to-Image Generation Technology</h4>
                <p>This challenge uses state-of-the-art generative AI technologies:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Stable Diffusion</strong> - A latent text-to-image diffusion model capable of generating photo-realistic images from text descriptions</li>
                  <li><strong>DALL-E API</strong> - OpenAI's advanced text-to-image generation system with enhanced understanding of prompts</li>
                  <li><strong>Midjourney-style algorithms</strong> - Techniques inspired by Midjourney's artistic rendering capabilities</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Image Generation Pipeline</h4>
                <p>The image creation process follows these technical steps:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li><strong>Prompt Analysis</strong> - Natural language processing to extract key visual elements and style cues</li>
                  <li><strong>Latent Space Sampling</strong> - Creating a random noise tensor in the latent space</li>
                  <li><strong>Diffusion Process</strong> - Iterative denoising guided by the text embeddings</li>
                  <li><strong>Upscaling and Refinement</strong> - Enhancing resolution and details of the generated image</li>
                  <li><strong>Style Application</strong> - Applying selected artistic styles through adaptive instance normalization</li>
                </ol>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Neural Network Architecture</h4>
                <p>The image generation models use several sophisticated neural components:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>U-Net backbone</strong> with attention mechanisms for image structure</li>
                  <li><strong>CLIP text encoder</strong> for converting text prompts into embeddings</li>
                  <li><strong>Variational autoencoder (VAE)</strong> for encoding/decoding between pixel and latent space</li>
                  <li><strong>Transformer architecture</strong> for understanding complex relationships in prompts</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-700 font-medium">Performance Optimizations</h4>
                <p>Several techniques ensure efficient image generation:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Progressive generation</strong> - Creating low-resolution previews before full-resolution images</li>
                  <li><strong>Classifier-free guidance</strong> - Controlling adherence to the prompt without classifier models</li>
                  <li><strong>Negative prompting</strong> - Specifying what to avoid in generated images</li>
                  <li><strong>Caching of text embeddings</strong> - Reusing computed embeddings for similar prompts</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default CreativeVisionMain;