import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiKey } from '../../../services/openai';
import { useNavigate } from 'react-router-dom';
import './presentation-toast.css';

// Extend Window interface to add our toast functions
declare global {
  interface Window {
    createToastContainer: () => HTMLDivElement;
    showToast: (options: ToastOptions) => void;
    getToastIcon: (status: string) => string;
  }
}

// Toast notification system
interface ToastOptions {
  title: string;
  description: string;
  status: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
  isClosable: boolean;
}

// Theme types
interface PresentationTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  previewImage: string;
}

// Slide types
interface Slide {
  id: string;
  title: string;
  content: string[];
  imagePrompt?: string;
  imageUrl?: string;
  notes?: string;
}

interface Presentation {
  title: string;
  subtitle?: string;
  theme: PresentationTheme;
  slides: Slide[];
}

// Sample themes
const SAMPLE_THEMES: PresentationTheme[] = [
  {
    id: 'modern',
    name: 'Modern',
    primaryColor: '#2563eb',
    secondaryColor: '#dbeafe',
    accentColor: '#60a5fa',
    fontFamily: 'Inter, sans-serif',
    previewImage: '/themes/modern.jpg',
  },
  {
    id: 'gradient',
    name: 'Gradient',
    primaryColor: '#6366f1',
    secondaryColor: '#e0e7ff',
    accentColor: '#818cf8',
    fontFamily: 'Montserrat, sans-serif',
    previewImage: '/themes/gradient.jpg',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    primaryColor: '#18181b',
    secondaryColor: '#f4f4f5',
    accentColor: '#71717a',
    fontFamily: 'DM Sans, sans-serif',
    previewImage: '/themes/minimal.jpg',
  },
  {
    id: 'nature',
    name: 'Nature',
    primaryColor: '#16a34a',
    secondaryColor: '#dcfce7',
    accentColor: '#4ade80',
    fontFamily: 'Poppins, sans-serif',
    previewImage: '/themes/nature.jpg',
  },
  {
    id: 'tech',
    name: 'Tech',
    primaryColor: '#9333ea',
    secondaryColor: '#f3e8ff',
    accentColor: '#c084fc',
    fontFamily: 'Space Grotesk, sans-serif',
    previewImage: '/themes/tech.jpg',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    primaryColor: '#0284c7',
    secondaryColor: '#e0f2fe',
    accentColor: '#38bdf8',
    fontFamily: 'Roboto, sans-serif',
    previewImage: '/themes/corporate.jpg',
  },
];

// Initialize global toast functions
const initializeToastFunctions = () => {
  // Global toast container reference
  let globalToastContainer: HTMLDivElement | null = null;

  // Toast icon utility
  window.getToastIcon = (status: string): string => {
    switch (status) {
      case 'success':
        return '<svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
      case 'error':
        return '<svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
      case 'warning':
        return '<svg class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
      default:
        return '<svg class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }
  };

  // Create a toast container if it doesn't exist
  window.createToastContainer = (): HTMLDivElement => {
    if (globalToastContainer) return globalToastContainer;
    
    let container = document.getElementById('toast-container') as HTMLDivElement;
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-3';
      document.body.appendChild(container);
    }
    
    globalToastContainer = container;
    return container;
  };

  // Show a toast notification
  window.showToast = (options: ToastOptions): void => {
    // Ensure container exists
    const toastContainer = window.createToastContainer();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${options.status} max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden`;
    
    // Add content
    toast.innerHTML = `
      <div class="px-4 py-3 flex items-start">
        <div class="flex-shrink-0 mr-3">
          ${window.getToastIcon(options.status)}
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-gray-900 dark:text-white">${options.title}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">${options.description}</p>
        </div>
        ${options.isClosable ? '<button class="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500">&times;</button>' : ''}
      </div>
    `;
    
    // Add animation classes
    toast.classList.add('transform', 'transition-all', 'duration-300', 'toast-enter');
    
    // Add close button functionality
    if (options.isClosable) {
      const closeButton = toast.querySelector('button');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          toast.classList.add('toast-exit');
          setTimeout(() => toast.remove(), 300);
        });
      }
    }
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto dismiss
    if (options.duration) {
      setTimeout(() => {
        if (toast.parentElement) {
          toast.classList.add('toast-exit');
          setTimeout(() => toast.remove(), 300);
        }
      }, options.duration);
    }
  };
};

// Initialize toast functions immediately
initializeToastFunctions();

const SimpleAIPresentationGenerator: React.FC = () => {
  // State for user inputs
  const [topic, setTopic] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [numberOfSlides, setNumberOfSlides] = useState<number>(6);
  const [selectedTheme, setSelectedTheme] = useState<PresentationTheme>(SAMPLE_THEMES[0]);
  
  // State for presentation
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  
  // State for editor
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Navigation
  const navigate = useNavigate();

  // Initialize toast container on mount
  useEffect(() => {
    // Ensure container is created and CSS is applied
    window.createToastContainer();
    
    return () => {
      const container = document.getElementById('toast-container');
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  /**
   * Generate the presentation content using AI
   */
  const generatePresentation = async () => {
    if (!topic.trim()) {
      window.showToast({
        title: 'Input Required',
        description: 'Please enter a presentation topic.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Show loading toast
      window.showToast({
        title: 'Generating Presentation',
        description: 'Creating your presentation content with AI...',
        status: 'info',
        duration: undefined,
        isClosable: true,
      });
      
      // Update progress
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = Math.min(prev + 5, 95);
          return newProgress;
        });
      }, 300);
      
      // Simple sample presentation for demo purposes
      const sampleSlides = [
        {
          id: 'slide-1',
          title: topic,
          content: ['Welcome to this presentation', 'Created with AI assistance', 'Let\'s explore this topic together']
        },
        {
          id: 'slide-2',
          title: 'Overview',
          content: ['Key point 1', 'Key point 2', 'Key point 3']
        },
        {
          id: 'slide-3',
          title: 'Main Content',
          content: ['Detailed information about the topic', 'Supporting evidence', 'Expert opinions']
        },
        {
          id: 'slide-4',
          title: 'Analysis',
          content: ['Data interpretation', 'Trends and patterns', 'Implications']
        },
        {
          id: 'slide-5',
          title: 'Applications',
          content: ['Practical uses', 'Implementation strategies', 'Success stories']
        },
        {
          id: 'slide-6',
          title: 'Conclusion',
          content: ['Summary of key points', 'Final thoughts', 'Call to action']
        }
      ];
      
      // Wait a moment to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
        
      // Create new presentation
      const newPresentation: Presentation = {
        title: topic,
        theme: selectedTheme,
        slides: sampleSlides.slice(0, numberOfSlides)
      };
      
      // Update state
      setPresentation(newPresentation);
      setCurrentStep(2);
      setGenerationProgress(100);
      
      // Show success toast
      window.showToast({
        title: 'Presentation Generated',
        description: 'Your presentation is ready to customize!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      clearInterval(interval);
    } catch (error) {
      console.error('Error generating presentation:', error);
      
      // Show error toast
      window.showToast({
        title: 'Generation Failed',
        description: 'There was an error generating your presentation. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  // Rest of component implementation...
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">AI Presentation Generator</h1>
        <button 
          onClick={generatePresentation}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Generate Test Presentation
        </button>
      </div>
    </div>
  );
};

export default SimpleAIPresentationGenerator; 