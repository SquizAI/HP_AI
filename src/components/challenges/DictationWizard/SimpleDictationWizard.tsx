import React, { useState, useEffect, useRef } from 'react';
import RecordButton from './components/RecordButton';
import AudioVisualizer from './components/AudioVisualizer';
import TranscriptionComparison from './components/TranscriptionComparison';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { ChevronDown, ChevronUp, ClipboardList, ShoppingCart, FileText, Lightbulb, Check, PenLine, Loader2, Search, Share2, Download, Save, Trash2, Edit3, Star, Calendar, Globe, Mic, ListChecks, Layers, X, Plus, AlertCircle } from 'lucide-react';

// List types available for processing
type ListType = 'tasks' | 'grocery' | 'notes';

// Define our own props interface
interface DictationWizardProps {
  isActive: boolean;
  onComplete: () => void;
  onChallengePrevious: () => void;
  challengeState: any;
}

// Define structured output interfaces
interface TaskItem {
  task: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  text?: string; // Original text from the dictation
}

interface GroceryItem {
  item: string;
  quantity?: string;
  unit?: string;
  category?: string;
  text?: string; // Original text from the dictation
}

interface NoteItem {
  content: string;
  heading?: string;
  tags?: string[];
  text?: string; // Original text from the dictation
}

interface ListOutput {
  type: ListType;
  confidence?: number;
  items: (TaskItem | GroceryItem | NoteItem)[];
}

// Web search result interface
interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  imageUrl?: string;
  imageAlt?: string;
}

// Define new interfaces for multi-list functionality
interface SavedList {
  id: string;
  name: string;
  type: ListType;
  items: string[];
  completedItems: number[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  color?: string;
  webSearchResults?: WebSearchResult[];
}

// Features explanation content
const featuresExplanation = [
  {
    icon: <Mic className="w-4 h-4 text-purple-500" />,
    title: "Voice Dictation",
    description: "Convert speech to text instantly",
    howTo: "Click the mic button to start dictation"
  },
  {
    icon: <ListChecks className="w-4 h-4 text-purple-500" />,
    title: "Smart List Organization",
    description: "Auto-categorizes as tasks, grocery, or notes",
    howTo: "Just speak naturally - we detect the list type"
  },
  {
    icon: <Layers className="w-4 h-4 text-purple-500" />,
    title: "Multi-List Management",
    description: "Create and manage multiple lists",
    howTo: "Save lists to access them later"
  },
  {
    icon: <Search className="w-4 h-4 text-purple-500" />,
    title: "Web Research",
    description: "Find information related to your lists",
    howTo: "Say \"search for [topic]\" while recording"
  },
  {
    icon: <Share2 className="w-4 h-4 text-purple-500" />,
    title: "Export & Share",
    description: "Save as text or share with others",
    howTo: "Use the Export or Share buttons"
  }
];

// Common grocery items to help with detection
const GROCERY_KEYWORDS = [
  'milk', 'bread', 'eggs', 'cheese', 'chicken', 'beef', 'pork', 'fish', 'apple', 'banana',
  'orange', 'grapes', 'strawberry', 'blueberry', 'carrot', 'potato', 'onion', 'tomato',
  'lettuce', 'spinach', 'rice', 'pasta', 'cereal', 'flour', 'sugar', 'salt', 'pepper',
  'oil', 'vinegar', 'juice', 'water', 'soda', 'coffee', 'tea', 'yogurt', 'butter',
  'ice cream', 'chocolate', 'cookie', 'cracker', 'chips', 'nuts', 'frozen', 'canned',
  'bottle', 'jar', 'package', 'pounds', 'ounces', 'dozen', 'gallon', 'quart', 'pint'
];

// Task-related keywords
const TASK_KEYWORDS = [
  'call', 'email', 'send', 'write', 'create', 'make', 'finish', 'complete', 'submit',
  'review', 'check', 'buy', 'purchase', 'get', 'pick up', 'deliver', 'schedule', 'plan',
  'organize', 'clean', 'fix', 'repair', 'update', 'install', 'configure', 'set up',
  'prepare', 'arrange', 'attend', 'meet', 'discuss', 'contact', 'follow up', 'research',
  'investigate', 'analyze', 'evaluate', 'tomorrow', 'next week', 'monday', 'tuesday',
  'remind', 'remember', 'don\'t forget', 'important', 'urgent', 'priority', 'deadline'
];

// Notes keywords
const NOTES_KEYWORDS = [
  'note', 'remember', 'idea', 'thought', 'concept', 'theory', 'observation', 'reflection',
  'summary', 'overview', 'key points', 'important', 'interesting', 'consider', 'perhaps',
  'maybe', 'possibly', 'alternatively', 'also', 'additionally', 'furthermore', 'however',
  'nevertheless', 'although', 'despite', 'in spite of', 'regardless', 'therefore', 'thus',
  'consequently', 'hence', 'as a result', 'because', 'since', 'due to', 'for this reason'
];

// Add voice command keywords for search
const SEARCH_COMMAND_KEYWORDS = [
  'search for', 'search about', 'search', 'look up', 'look for', 'find', 'research',
  'web search for', 'web search', 'do a search for', 'do a search',
  'do a web search for', 'do a web search'
];

// Using simple status handling without the StatusBarContext
const SimpleDictationWizard: React.FC<DictationWizardProps> = ({
  isActive,
  onComplete,
  onChallengePrevious,
  challengeState
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [transcript, setTranscript] = useState<string>('');
  const [transcriptionActive, setTranscriptionActive] = useState<boolean>(false);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [processingText, setProcessingText] = useState<boolean>(false);
  const [listType, setListType] = useState<ListType>('tasks');
  const [autoDetectedType, setAutoDetectedType] = useState<ListType | null>(null);
  const [processedList, setProcessedList] = useState<string[]>([]);
  const [structuredList, setStructuredList] = useState<ListOutput | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showEducation, setShowEducation] = useState<boolean>(false);
  const [showFeatures, setShowFeatures] = useState<boolean>(true);
  
  // New state to prevent multiple clicks from firing multiple actions
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // New states for multi-list functionality
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [showSavedLists, setShowSavedLists] = useState<boolean>(true);
  const [newListName, setNewListName] = useState<string>('');
  const [editingListName, setEditingListName] = useState<boolean>(false);
  
  // State for web search
  const [isResearching, setIsResearching] = useState<boolean>(false);
  const [researchQuery, setResearchQuery] = useState<string>('');
  const [webSearchResults, setWebSearchResults] = useState<WebSearchResult[]>([]);
  const [showWebResults, setShowWebResults] = useState<boolean>(false);
  const [forceUpdate, setForceUpdate] = useState<number>(0); // Add state for forcing re-renders
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasMadeInitialPermissionRequestRef = useRef<boolean>(false);
  const isIncognitoRef = useRef<boolean | null>(null);

  // Web Speech API setup
  const { 
    transcript: webSpeechTranscript, 
    listening: webSpeechListening,
    resetTranscript: resetWebSpeechTranscript,
    browserSupportsSpeechRecognition 
  } = useSpeechRecognition();

  // New state for handling voice search commands
  const [voiceSearchActive, setVoiceSearchActive] = useState<boolean>(false);

  // Update transcript when Web Speech API updates
  useEffect(() => {
    if (webSpeechTranscript && transcriptionActive) {
      setTranscript(webSpeechTranscript);
      
      // Check for search commands in transcript
      if (voiceSearchActive) {
        const lowerTranscript = webSpeechTranscript.toLowerCase();
        for (const keyword of SEARCH_COMMAND_KEYWORDS) {
          if (lowerTranscript.includes(keyword)) {
            const searchQuery = lowerTranscript.substring(lowerTranscript.indexOf(keyword) + keyword.length).trim();
            if (searchQuery && searchQuery.length > 3) {
              console.log("Voice search detected:", searchQuery);
              setResearchQuery(searchQuery);
              // Stop listening when a search command is detected
              setVoiceSearchActive(false);
              // Will handle search after stopping recognition
            }
          }
        }
      }
    }
  }, [webSpeechTranscript, transcriptionActive, voiceSearchActive]);

  // Check if challenge is completed
  useEffect(() => {
    if (processedList.length >= 3 && !isListening) {
      // Mark challenge as potentially complete
      if (currentStep >= 3) {
        // Delay to allow user to see their list
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }
  }, [processedList, isListening, currentStep, onComplete]);

  // Check browser type for different handling
  const isChromeRef = useRef<boolean>(
    typeof window !== 'undefined' && 
    (navigator.userAgent.indexOf("Chrome") > -1 || navigator.userAgent.indexOf("Chromium") > -1)
  );

  // Detect if we're in incognito mode
  useEffect(() => {
    const detectIncognito = async () => {
      if (!isChromeRef.current) {
        isIncognitoRef.current = false;
        return;
      }

      try {
        // A simple way to detect incognito in Chrome: try to use indexedDB
        // In incognito, this will either fail or have very limited storage
        const fs = (window as any).RequestFileSystem || (window as any).webkitRequestFileSystem;
        if (!fs) {
          console.log("FileSystem API not available, can't detect incognito");
          return;
        }

        try {
          fs((window as any).TEMPORARY, 100, 
            () => { isIncognitoRef.current = false; }, 
            () => { isIncognitoRef.current = true; }
          );
        } catch (e) {
          console.log("Error detecting incognito mode:", e);
          isIncognitoRef.current = false;
        }
      } catch (err) {
        console.error("Error during incognito detection:", err);
      }
    };

    detectIncognito();
  }, []);

  // We'll only check devices after permission is granted, not on mount
  // This avoids the Chrome issue where devices aren't found until after permission
  const checkMicrophoneDevices = async () => {
    try {
      console.log("Checking for available audio devices...");
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn('Media Devices API not supported in this browser');
        return [];
      }

      // Enumerate devices after permission should be granted
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      console.log('Available audio input devices:', audioDevices);
      setAvailableDevices(audioDevices);
      
      // In Chrome, we might still get empty labels if permission isn't fully granted
      const hasLabels = audioDevices.some(device => device.label);
      if (audioDevices.length > 0 && !hasLabels && isChromeRef.current) {
        console.log("Devices found but no labels. This usually means permission isn't fully granted.");
      }

      return audioDevices;
    } catch (err) {
      console.error('Error checking microphone devices:', err);
      return [];
    }
  };

  useEffect(() => {
    if (!isActive) {
      // Clean up when component becomes inactive
      stopRecording();
      // Also clear processing state when component becomes inactive
      setIsProcessing(false);
      setIsResearching(false);
    }

    // Listen for device changes - this works better after permission is granted
    navigator.mediaDevices.addEventListener('devicechange', checkMicrophoneDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', checkMicrophoneDevices);
    };
  }, [isActive]);

  const showError = (message: string) => {
    setError(message);
    console.error(message);
    setTimeout(() => setError(null), 5000);
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setRecording(null);
      setError(null);
      setTranscript('');
      
      // Reset Web Speech API if available
      if (browserSupportsSpeechRecognition) {
        resetWebSpeechTranscript();
      }

      console.log("Requesting microphone access...");
      console.log("Is incognito mode:", isIncognitoRef.current);

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording');
      }

      // If we're in Chrome incognito mode, we need a different approach
      const inIncognito = isChromeRef.current && isIncognitoRef.current === true;

      // Basic audio constraints - we won't use deviceId on first attempt in Chrome
      // since it might be rejecting our request if we try to be too specific before permission
      const constraints: MediaStreamConstraints = {
        audio: {
          // In incognito mode, we need to be more specific about what we want
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true }
        }
      };

      console.log("Using audio constraints:", constraints);
      
      // Request the stream - this will trigger the permission prompt if needed
      // We'll use a timeout in incognito mode to detect if the permission dialog is hanging
      let stream: MediaStream;
      
      if (inIncognito) {
        // In incognito mode, we'll use a timeout to detect if the permission dialog is hanging
        const timeoutPromise = new Promise<MediaStream>((_, reject) => {
          setTimeout(() => reject(new Error('Permission request timed out. Please ensure microphone permissions are not blocked.')), 5000);
        });
        
        try {
          stream = await Promise.race([
            navigator.mediaDevices.getUserMedia(constraints),
            timeoutPromise
          ]) as MediaStream;
        } catch (e) {
          if (e instanceof Error && e.message.includes('timed out')) {
            throw e; // Rethrow our timeout error
          }
          throw e; // Rethrow other errors
        }
      } else {
        // Normal mode - just request the stream
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      console.log("Stream obtained:", stream.getAudioTracks().map(t => t.label));

      // Special handling for Chrome - if we got a stream but no track labels in Chrome,
      // it might mean we're in incognito or permission was granted but not remembered
      if (isChromeRef.current && stream.getAudioTracks().every(t => !t.label)) {
        console.log("Warning: Obtained stream but no track labels. This usually happens in incognito mode.");
      }

      // Now that we have permission, check available devices
      if (!hasMadeInitialPermissionRequestRef.current) {
        hasMadeInitialPermissionRequestRef.current = true;
        const devices = await checkMicrophoneDevices();
        console.log("Devices after permission:", devices);
        setPermissionStatus('granted');
      }

      // Create MediaRecorder
      console.log("Creating MediaRecorder...");
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        // Also stop web speech recognition if active
        if (browserSupportsSpeechRecognition && webSpeechListening) {
          SpeechRecognition.stopListening();
        }
        setTranscriptionActive(false);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        showError('Error recording audio. Please try again.');
      };

      // Start recording
      mediaRecorder.start();
      setIsListening(true);
      
      // Start Web Speech API if supported
      if (browserSupportsSpeechRecognition) {
        try {
          console.log("Starting Web Speech API for real-time transcription");
          await SpeechRecognition.startListening({ continuous: true });
          setTranscriptionActive(true);
        } catch (err) {
          console.error("Error starting speech recognition:", err);
          // Continue with recording even if speech recognition fails
        }
      }
      
      console.log("Recording started successfully");

    } catch (err) {
      console.error('Error starting recording:', err);
      
      // Special handling for Chrome incognito
      if (isChromeRef.current && isIncognitoRef.current === true) {
        // In incognito mode, we need to provide more specific guidance
        setPermissionStatus('denied');
        showError('Microphone access not available in incognito mode. Please try in a regular browser window or enable microphone access in your browser settings.');
        setIsListening(false);
        return;
      }
      
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionStatus('denied');
          showError('Microphone access denied. Please grant permission and try again.');
        } else if (err.name === 'NotFoundError') {
          showError('No microphone found. Please verify your microphone is connected and not being used by another application.');
        } else if (err.name === 'NotReadableError' || err.name === 'OverconstrainedError') {
          showError('Cannot access microphone. It may be in use by another application.');
        } else {
          showError(`Microphone error: ${err.message}`);
        }
      } else if (err instanceof Error && err.message.includes('timed out')) {
        showError('Permission request timed out. Please ensure microphone permissions are not blocked.');
      } else {
        showError(`Error accessing microphone: ${err instanceof Error ? err.message : String(err)}`);
      }
      
      setIsListening(false);
      setTranscriptionActive(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
    }
    
    // Ensure speech recognition is stopped
    if (browserSupportsSpeechRecognition && webSpeechListening) {
      SpeechRecognition.stopListening();
    }
    
    setIsListening(false);
    setTranscriptionActive(false);
  };

  const toggleRecording = () => {
    // Prevent multiple clicks from triggering multiple actions
    if (isProcessing) {
      console.log("Already processing, ignoring additional clicks");
      return;
    }

    if (isListening) {
      setIsProcessing(true); // Set processing flag to prevent additional clicks
      stopRecording();
      // Process the transcript to list after stopping recording
      setTimeout(() => {
        processTranscriptToList();
        // Reset processing flag after the operation completes
        setTimeout(() => {
          setIsProcessing(false);
        }, 1000); // Add extra buffer time
      }, 500);
    } else {
      setCurrentStep(1); // Reset to step 1 when starting new recording
      startRecording();
    }
  };

  const handleError = (err: Error) => {
    console.error('AudioVisualizer error:', err);
    showError(err.message);
  };

  // Only show the no devices warning if we've been granted permission but still don't find devices
  const shouldShowNoDevicesWarning = 
    permissionStatus === 'granted' && 
    availableDevices.length === 0 && 
    hasMadeInitialPermissionRequestRef.current;

  // Check if we're in incognito mode
  const isInIncognito = isChromeRef.current && isIncognitoRef.current === true;

  // Auto-detect the list type from transcript content
  const detectListType = (text: string): ListType => {
    if (!text.trim()) return 'tasks'; // Default
    
    text = text.toLowerCase();
    
    // Count keywords for each type
    let groceryScore = 0;
    let taskScore = 0;
    let notesScore = 0;
    
    // Check for grocery-specific patterns
    GROCERY_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) groceryScore += matches.length;
    });
    
    // Check for quantity patterns like "2 lbs", "3 cans", etc.
    const quantityMatches = text.match(/\b\d+\s*(oz|ounce|lb|pound|can|box|bag|jar|bottle|gallon|quart|pint)\b/gi);
    if (quantityMatches) groceryScore += quantityMatches.length * 2;
    
    // Check for task-specific patterns
    TASK_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) taskScore += matches.length;
    });
    
    // Check for task-like structures
    const taskPatterns = text.match(/\b(need to|have to|should|must|don't forget to|remember to)\b/gi);
    if (taskPatterns) taskScore += taskPatterns.length * 2;
    
    // Check for notes-specific patterns
    NOTES_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) notesScore += matches.length;
    });
    
    // Check for long sentences (typical in notes)
    const sentences = text.split(/[.!?]+/);
    const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 8);
    notesScore += longSentences.length * 2;
    
    // Normalize scores based on text length
    const words = text.split(/\s+/).length;
    groceryScore = groceryScore / words * 100;
    taskScore = taskScore / words * 100;
    notesScore = notesScore / words * 100;
    
    console.log(`List type detection scores - Grocery: ${groceryScore}, Task: ${taskScore}, Notes: ${notesScore}`);
    
    // Determine the type with the highest score
    if (groceryScore > taskScore && groceryScore > notesScore) {
      return 'grocery';
    } else if (taskScore > groceryScore && taskScore > notesScore) {
      return 'tasks';
    } else {
      return 'notes';
    }
  };

  // Process the transcript using OpenAI structured output
  const processWithOpenAI = async (text: string): Promise<ListOutput | null> => {
    if (!text.trim()) return null;

    try {
      // Check if we have the OpenAI API key
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        console.warn("OpenAI API key is missing. Using fallback local processing.");
        return null;
      }

      console.log("Processing transcript with OpenAI structured output...");
      
      // Define the schema for structured output using the tools format
      const tools = [
        {
          type: "function",
          function: {
            name: "process_dictation",
            description: "Process dictated text into a structured list",
            parameters: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["tasks", "grocery", "notes"],
                  description: "The type of list that best matches the content"
                },
                confidence: {
                  type: "number",
                  description: "Confidence score from 0-1 for the detected list type"
                },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      // Common properties
                      text: {
                        type: "string",
                        description: "The original text of the item"
                      },
                      // Task-specific properties
                      task: {
                        type: "string",
                        description: "The task description if this is a task item"
                      },
                      completed: {
                        type: "boolean",
                        description: "Whether the task is completed"
                      },
                      priority: {
                        type: "string",
                        enum: ["high", "medium", "low"],
                        description: "Priority level of the task"
                      },
                      // Grocery-specific properties
                      item: {
                        type: "string",
                        description: "The grocery item name"
                      },
                      quantity: {
                        type: "string",
                        description: "Quantity of the grocery item"
                      },
                      unit: {
                        type: "string",
                        description: "Unit of measurement"
                      },
                      // Note-specific properties
                      content: {
                        type: "string",
                        description: "The note content"
                      },
                      heading: {
                        type: "string",
                        description: "Optional heading for the note"
                      }
                    },
                    required: ["text"]
                  }
                }
              },
              required: ["type", "items"]
            }
          }
        }
      ];

      // Make API call to OpenAI using the newer tools format
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that processes dictated text into structured lists. Based on the content, determine if it\'s a task list, grocery list, or notes, and format accordingly. For grocery lists, be sure to identify quantities, units, and item names correctly.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          tools: tools,
          tool_choice: { type: "function", function: { name: "process_dictation" } }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`OpenAI API error: ${JSON.stringify(errorData)}`);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("OpenAI API response:", data);
      
      // Extract the structured output from tool_calls
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function && toolCall.function.name === "process_dictation") {
        try {
          const result = JSON.parse(toolCall.function.arguments) as ListOutput;
          console.log("OpenAI processed result:", result);
          
          // Ensure we have some items
          if (!result.items || result.items.length === 0) {
            console.warn("OpenAI returned empty items array");
            // Create at least one item from the transcript
            result.items = [{
              text: text.substring(0, 100),
              [result.type === 'tasks' ? 'task' : result.type === 'grocery' ? 'item' : 'content']: 
                text.substring(0, 100)
            }] as any[];
          }
          
          return result;
        } catch (parseError) {
          console.error("Error parsing tool_call arguments:", parseError);
          return null;
        }
      } else {
        console.error("Unexpected response format from OpenAI:", data);
        return null;
      }
    } catch (err) {
      console.error("Error processing with OpenAI:", err);
      return null;
    }
  };

  // Process the transcript text into a list based on the selected list type
  const processTranscriptToList = async () => {
    console.log("Starting transcript processing...");
    
    if (!transcript) {
      return;
    }
    
    // Check if the transcript contains search commands before processing as a list item
    const lowerTranscript = transcript.toLowerCase();
    let isSearchCommand = false;
    let searchQuery = '';
    
    // Check for search commands anywhere in the transcript
    for (const keyword of SEARCH_COMMAND_KEYWORDS) {
      const keywordIndex = lowerTranscript.indexOf(keyword);
      if (keywordIndex >= 0) {
        isSearchCommand = true;
        searchQuery = transcript.substring(keywordIndex + keyword.length).trim();
        if (searchQuery) {
          console.log(`Detected search command: "${keyword}" with query: "${searchQuery}"`);
          break;
        }
      }
    }
    
    if (isSearchCommand && searchQuery) {
      // Handle as a web search instead of a list item
      console.log("Processing as web search...");
      setProcessingText(false);
      setResearchQuery(searchQuery);
      performWebSearch(searchQuery);
      return;
    }
    
    // Use correct types for these state setters
    setProcessingText(true);
    setAutoDetectedType(null);
    
    // Rest of the original function remains the same
    try {
      // Try to use OpenAI API first
      console.log("Calling OpenAI API with transcript:", transcript);
      const openAIResult = await processWithOpenAI(transcript);
      
      if (openAIResult) {
        console.log("Successfully processed with OpenAI structured output:", openAIResult);
        // Use OpenAI's result
        setAutoDetectedType(openAIResult.type);
        setListType(openAIResult.type);
        setStructuredList(openAIResult);
        
        // Convert structured items to simple strings for display
        const simpleItems = openAIResult.items.map(item => {
          if ('task' in item) {
            return item.task || item.text || '';
          } else if ('item' in item) {
            // Format grocery items properly with quantity and unit
            const quantity = item.quantity || '';
            const unit = item.unit || '';
            const itemName = item.item || item.text || '';
            
            if (quantity) {
              return `${quantity} ${unit} ${itemName}`.trim().replace(/\s+/g, ' ');
            } else {
              return itemName;
            }
          } else if ('content' in item) {
            return item.heading ? `${item.heading}: ${item.content || ''}` : (item.content || item.text || '');
          }
          // Fallback if none of the specific properties are found
          return (item as any).text || '';
        }).filter(item => item.length > 0);
        
        console.log("Processed list items:", simpleItems);
        
        // Ensure we always have at least one item
        if (simpleItems.length === 0 && transcript.trim()) {
          console.warn("No items were generated from OpenAI result, using transcript as fallback");
          simpleItems.push(transcript.substring(0, 100));
        }
        
        setProcessedList(simpleItems);
        
        // Set completed items for tasks
        const newCompletedItems = new Set<number>();
        openAIResult.items.forEach((item, index) => {
          if ('task' in item && item.completed) {
            newCompletedItems.add(index);
          }
        });
        setCompletedItems(newCompletedItems);
      } else {
        console.warn("OpenAI structured output failed, falling back to local processing");
        // Fall back to local processing as before
        const detectedType = detectListType(transcript);
        console.log("Detected list type:", detectedType);
        setAutoDetectedType(detectedType);
        setListType(detectedType);
        
        // Improved local processing logic
        let items: string[] = [];
        
        // Better splitting for all list types - first try to split by clear delimiters
        const lines = transcript
          .split(/[.,\n]/)
          .map(line => line.trim())
          .filter(line => line.length > 0);
          
        if (detectedType === 'tasks') {
          // Improved task list processing
          items = lines.map(line => {
            // Remove bullet points or numbering if present
            line = line.replace(/^(- |\* |• |[\d]+\. )/, '');
            
            // Capitalize first letter
            line = line.charAt(0).toUpperCase() + line.slice(1);
            
            // Handle special "parking" task type commonly found in task lists
            if (line.toLowerCase().includes('park') || line.toLowerCase().includes('parking')) {
              // Make sure parking-related tasks are properly formatted
              if (!line.toLowerCase().includes('park the') && !line.toLowerCase().includes('find parking')) {
                line = line.replace(/parking|park/i, match => 'Park the car' + (match.toLowerCase() === 'parking' ? ' in the parking lot' : ''));
              }
            }
            
            return line;
          });
        } else if (detectedType === 'grocery') {
          // Improved grocery list processing
          items = lines.map(line => {
            // Try to identify quantity patterns
            const quantityMatch = line.match(/^(\d+\s*[\w]+\s+)/i);
            if (quantityMatch) {
              const quantity = quantityMatch[0];
              const rest = line.slice(quantity.length);
              return `${quantity}${rest.charAt(0).toUpperCase() + rest.slice(1)}`;
            }
            
            // Check for grocery keywords and capitalize them
            for (const keyword of GROCERY_KEYWORDS) {
              if (line.toLowerCase().includes(keyword.toLowerCase())) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                line = line.replace(regex, match => match.charAt(0).toUpperCase() + match.slice(1));
              }
            }
            
            return line.charAt(0).toUpperCase() + line.slice(1);
          });
        } else {
          // Process as notes 
          // First try to use natural line breaks
          if (transcript.includes('\n')) {
            items = transcript
              .split(/\n/)
              .map(item => item.trim())
              .filter(item => item.length > 0);
          } else {
            // Otherwise split by sentences
            items = transcript
              .split(/\./)
              .map(item => item.trim())
              .filter(item => item.length > 0)
              .map(item => item + '.');
          }
        }
        
        console.log("Processed list items from local processing:", items);
        setProcessedList(items);
      }
      
      advanceStep(); // Advance to the next step after successful processing
    } catch (err) {
      console.error('Error processing transcript to list:', err);
      // Fallback - just split by newlines
      const items = transcript
        .split(/\n/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      console.log("Fallback processed items:", items);
      setProcessedList(items);
    } finally {
      console.log("Processing complete, setting processingText to false");
      setProcessingText(false);
    }
  };

  // Handle item editing
  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(processedList[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      const newList = [...processedList];
      newList[editingIndex] = editValue;
      setProcessedList(newList);
      setEditingIndex(null);
      setEditValue('');
      
      // Auto-save if this is a saved list
      if (currentListId) {
        setSavedLists(prev => 
          prev.map(list => 
            list.id === currentListId 
              ? {
                  ...list,
                  items: newList,
                  completedItems: Array.from(completedItems),
                  updatedAt: new Date().toISOString()
                }
              : list
          )
        );
      }
    }
  };

  const deleteItem = (index: number) => {
    const newList = [...processedList];
    newList.splice(index, 1);
    setProcessedList(newList);
    
    // Update completed items
    const newCompletedItems = new Set<number>();
    completedItems.forEach(i => {
      if (i < index) newCompletedItems.add(i);
      else if (i > index) newCompletedItems.add(i - 1);
    });
    setCompletedItems(newCompletedItems);
    
    // Auto-save if this is a saved list
    if (currentListId) {
      setSavedLists(prev => 
        prev.map(list => 
          list.id === currentListId 
            ? {
                ...list,
                items: newList,
                completedItems: Array.from(newCompletedItems),
                updatedAt: new Date().toISOString()
              }
            : list
        )
      );
    }
  };

  const addNewItem = () => {
    const newList = [...processedList, ''];
    setProcessedList(newList);
    startEditing(newList.length - 1);
    
    // Auto-save if this is a saved list
    if (currentListId) {
      setSavedLists(prev => 
        prev.map(list => 
          list.id === currentListId 
            ? {
                ...list,
                items: newList,
                completedItems: Array.from(completedItems),
                updatedAt: new Date().toISOString()
              }
            : list
        )
      );
    }
  };

  // Toggle item completion for task lists
  const toggleItemCompletion = (index: number) => {
    const newCompletedItems = new Set(completedItems);
    if (completedItems.has(index)) {
      newCompletedItems.delete(index);
    } else {
      newCompletedItems.add(index);
    }
    setCompletedItems(newCompletedItems);
    
    // Auto-save if this is a saved list
    if (currentListId) {
      setSavedLists(prev => 
        prev.map(list => 
          list.id === currentListId 
            ? {
                ...list,
                completedItems: Array.from(newCompletedItems),
                updatedAt: new Date().toISOString()
              }
            : list
        )
      );
    }
  };

  // Handle list type change
  const handleListTypeChange = (type: ListType) => {
    setListType(type);
    if (transcript.trim()) {
      // Re-process the list with the new type
      processTranscriptToList();
    }
  };

  // Advance the step when actions are completed
  const advanceStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  // Educational content
  const educationalContent = [
    {
      title: "The Power of Speech Recognition",
      content: "Dictation can be up to three times faster than typing. By speaking your thoughts, you can capture ideas more naturally and efficiently."
    },
    {
      title: "Smart Organization",
      content: "The Dictation Wizard automatically categorizes your speech into the most appropriate format - tasks, shopping lists, or general notes."
    },
    {
      title: "Tips for Effective Dictation",
      items: [
        "Speak clearly and at a moderate pace",
        "Pause briefly between thoughts",
        "Say 'period' or 'comma' for punctuation",
        "Review and edit for accuracy afterward"
      ]
    }
  ];

  // Load saved lists from localStorage on component mount
  useEffect(() => {
    try {
      const savedListsJSON = localStorage.getItem('dictationWizard_savedLists');
      if (savedListsJSON) {
        const parsed = JSON.parse(savedListsJSON) as SavedList[];
        setSavedLists(parsed);
      }
    } catch (error) {
      console.error('Error loading saved lists:', error);
    }
  }, []);

  // Save lists to localStorage when they change
  useEffect(() => {
    if (savedLists.length > 0) {
      try {
        localStorage.setItem('dictationWizard_savedLists', JSON.stringify(savedLists));
      } catch (error) {
        console.error('Error saving lists to localStorage:', error);
      }
    }
  }, [savedLists]);

  // Create a new list
  const createNewList = (name: string, type: ListType = 'tasks') => {
    const newList: SavedList = {
      id: Date.now().toString(),
      name: name || `New ${type} list`,
      type,
      items: [],
      completedItems: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSavedLists(prev => [...prev, newList]);
    setCurrentListId(newList.id);
    setProcessedList([]);
    setCompletedItems(new Set());
    setListType(type);
  };

  // Load a list
  const loadList = (listId: string) => {
    const list = savedLists.find(l => l.id === listId);
    if (list) {
      setCurrentListId(listId);
      setProcessedList(list.items);
      setCompletedItems(new Set(list.completedItems));
      setListType(list.type);
    }
  };

  // Delete a list
  const deleteList = (listId: string) => {
    setSavedLists(prev => prev.filter(l => l.id !== listId));
    if (currentListId === listId) {
      setCurrentListId(null);
      setProcessedList([]);
      setCompletedItems(new Set());
    }
  };

  // Save current list
  const saveCurrentList = () => {
    // If there's a current list ID, update it
    if (currentListId) {
      setSavedLists(prev => 
        prev.map(list => 
          list.id === currentListId 
            ? {
                ...list,
                items: processedList,
                completedItems: Array.from(completedItems),
                type: listType,
                updatedAt: new Date().toISOString()
              }
            : list
        )
      );
    } 
    // Otherwise create a new list
    else if (processedList.length > 0) {
      // Generate a name based on the first few items
      const suggestedName = getSuggestedListName();
      createNewList(suggestedName, listType);
    }
  };

  // Generate a suggested name based on list content
  const getSuggestedListName = (): string => {
    if (processedList.length === 0) return '';
    
    if (listType === 'tasks') {
      return `Tasks: ${processedList[0].substring(0, 20)}${processedList.length > 1 ? '...' : ''}`;
    } else if (listType === 'grocery') {
      return `Grocery List ${new Date().toLocaleDateString()}`;
    } else {
      return `Notes: ${processedList[0].substring(0, 20)}${processedList.length > 1 ? '...' : ''}`;
    }
  };

  // Export list as text
  const exportListAsText = () => {
    try {
      let content = `# ${currentListId ? savedLists.find(l => l.id === currentListId)?.name : listType.toUpperCase()}\n`;
      content += `# Created: ${new Date().toLocaleString()}\n\n`;
      
      processedList.forEach((item, index) => {
        if (listType === 'tasks') {
          content += `- [${completedItems.has(index) ? 'x' : ' '}] ${item}\n`;
        } else {
          content += `- ${item}\n`;
        }
      });
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentListId ? savedLists.find(l => l.id === currentListId)?.name : listType}_list.txt`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting list:', error);
      setError('Failed to export list. Please try again.');
    }
  };

  // Share list
  const shareList = async () => {
    try {
      if (!navigator.share) {
        setError('Web Share API is not supported in your browser');
        return;
      }
      
      let content = `${currentListId ? savedLists.find(l => l.id === currentListId)?.name : listType.toUpperCase()}\n\n`;
      
      processedList.forEach((item, index) => {
        if (listType === 'tasks') {
          content += `- [${completedItems.has(index) ? 'DONE' : 'TODO'}] ${item}\n`;
        } else {
          content += `- ${item}\n`;
        }
      });
      
      await navigator.share({
        title: `${listType.charAt(0).toUpperCase() + listType.slice(1)} List`,
        text: content
      });
    } catch (error) {
      console.error('Error sharing list:', error);
      setError('Failed to share list. Please try again.');
    }
  };

  // Web research functionality
  const performWebSearch = async (query: string) => {
    // Prevent duplicate searches - if already researching, don't start another search
    if (isResearching) {
      console.log("Already researching, ignoring additional search request");
      return;
    }
    
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }
    
    setIsResearching(true);
    setResearchQuery(query);
    setError(null);
    console.log(`Performing web search for: "${query}" using gpt-4o-search-preview model`);
    
    try {
      // Clear previous results to ensure UI updates
      setWebSearchResults([]);
      
      // Call OpenAI API with web search capability using the correct model and parameters
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-search-preview",
          web_search_options: {}, // This replaces the tools configuration for web search
          messages: [
            {
              role: "user",
              content: `Research this topic and provide information: ${query}. Format each result as a title, URL, and a brief snippet.`
            }
          ],
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Web search API error:`, errorData);
        throw new Error(`Web search API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log("Web search API response:", data);
      
      // Extract web search results from the response
      const results: WebSearchResult[] = [];
      
      // Parse the assistant's messages to extract search results
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        if (content) {
          console.log("Search results content:", content);
          
          // Simple extraction of web search results from the content
          // This is a simplified approach - in a real app you'd want to parse the structured data
          const lines = content.split('\n');
          let currentResult: Partial<WebSearchResult> = {};
          
          for (const line of lines) {
            if (line.startsWith('Source:') && line.includes('http') || 
                line.includes('http://') || line.includes('https://')) {
              // Extract URL
              const urlMatch = line.match(/https?:\/\/[^\s)]+/);
              if (urlMatch) {
                currentResult.url = urlMatch[0];
                
                // No dummy images - removing image URL generation entirely
                // If we have both title and URL, add to results
                if (currentResult.title && currentResult.url) {
                  results.push({
                    title: currentResult.title,
                    url: currentResult.url,
                    snippet: currentResult.snippet || '',
                  });
                  currentResult = {};
                }
              }
            } else if (line.trim() && !currentResult.title) {
              // Assume first non-empty line is title
              currentResult.title = line.trim();
            } else if (line.trim() && currentResult.title && !currentResult.snippet) {
              // Assume next non-empty line is snippet
              // Clean up snippet to remove markdown formatting
              const cleanSnippet = line.trim()
                .replace(/\*\*/g, '')  // Remove markdown bold
                .replace(/\[|\]|\(|\)/g, '') // Remove brackets
                .replace(/:/g, ''); // Remove colons
              
              currentResult.snippet = cleanSnippet;
            }
          }
          
          // Add the final result if there's any partial one left
          if (currentResult.title && currentResult.url) {
            results.push({
              title: currentResult.title,
              url: currentResult.url,
              snippet: currentResult.snippet || '',
              imageUrl: currentResult.imageUrl,
              imageAlt: currentResult.imageAlt
            });
          }
        }
      }
      
      setWebSearchResults(results);
      setShowWebResults(true);
      
      // Debug logging to see the results and especially the image URLs
      console.log("Web search results processed. Results:", results);
      console.log("Sample image URLs:", results.map(r => r.imageUrl).slice(0, 3));
      
      // Force a re-render to ensure UI updates
      setForceUpdate(prev => prev + 1);
      
      // Also save the results if this is a saved list
      if (currentListId) {
        setSavedLists(prev => 
          prev.map(list => 
            list.id === currentListId 
              ? {
                  ...list,
                  webSearchResults: results,
                  updatedAt: new Date().toISOString()
                }
              : list
          )
        );
      }
      
      console.log("Web search completed, displaying results:", results.length);
      
    } catch (error) {
      console.error("Error performing web search:", error);
      setError(`Web search failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsResearching(false);
    }
  };
  
  // Add items from web search results
  const addItemFromWebSearch = (content: string) => {
    setProcessedList(prev => [...prev, content]);
    
    // Auto-save if this is a saved list
    if (currentListId) {
      setSavedLists(prev => 
        prev.map(list => 
          list.id === currentListId 
            ? {
                ...list,
                items: [...list.items, content],
                updatedAt: new Date().toISOString()
              }
            : list
        )
      );
    }
  };

  // Start voice search function
  const startVoiceSearch = async () => {
    try {
      if (browserSupportsSpeechRecognition) {
        resetWebSpeechTranscript();
        await SpeechRecognition.startListening({ continuous: true });
        setVoiceSearchActive(true);
        setTranscriptionActive(true);
        setError(null);
        
        // Let user know voice search is active
        showError("Listening for search command. Just say 'search for...' followed by your topic");
      } else {
        showError("Speech recognition not supported in this browser");
      }
    } catch (err) {
      console.error("Error starting voice search:", err);
      showError("Could not start voice search. Please try again.");
    }
  };

  const stopVoiceSearch = () => {
    if (browserSupportsSpeechRecognition && webSpeechListening) {
      SpeechRecognition.stopListening();
    }
    setVoiceSearchActive(false);
    setTranscriptionActive(false);
    
    // Process search query if available
    if (researchQuery.trim()) {
      performWebSearch(researchQuery);
    }
  };

  // Toggle voice search
  const toggleVoiceSearch = () => {
    if (voiceSearchActive) {
      stopVoiceSearch();
    } else {
      startVoiceSearch();
    }
  };

  // Add a useEffect to ensure UI updates when search results change
  useEffect(() => {
    if (webSearchResults.length > 0) {
      console.log("Search results updated in state, total results:", webSearchResults.length);
      // Force UI to recognize that results are available
      setShowWebResults(true);
    }
  }, [webSearchResults, forceUpdate]);

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 bg-gradient-to-b from-purple-50 to-white min-h-[85vh] rounded-2xl shadow-sm">
      {/* Remove DEBUG panel */}
      
      <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-4 tracking-tight text-center">
        Dictation Wizard
      </h1>

      {/* Compressed features explanation */}
      {showFeatures && (
        <div className="relative bg-white rounded-xl shadow-sm border border-purple-100 p-3 mb-4 overflow-hidden">
          <button 
            onClick={() => setShowFeatures(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="text-base font-semibold text-purple-700 mb-2 flex items-center">
            <Star className="w-4 h-4 mr-1 text-purple-500" />
            Dictation Wizard Features
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {featuresExplanation.map((feature, index) => (
              <div key={index} className="bg-purple-50 rounded-lg p-2 hover:bg-purple-100 transition-colors">
                <div className="flex items-center mb-1">
                  {feature.icon}
                  <span className="ml-1 text-xs font-medium text-purple-700">{feature.title}</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{feature.description}</p>
                <p className="text-xs text-purple-600 italic">{feature.howTo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings and errors */}
      {error && (
        <div className="mb-4 bg-red-50 rounded-xl p-3 border border-red-100 shadow-sm">
          <div className="flex items-start">
            <div className="mr-2 text-red-500 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-first reorganized layout */}
      <div className="flex flex-col space-y-4">
        {/* Centered voice control for prominent positioning */}
        <div className="bg-white border border-purple-100 rounded-xl shadow-sm overflow-hidden">
          <h3 className="text-base font-semibold text-purple-700 p-3 border-b border-purple-50 flex items-center">
            <Mic className="h-4 w-4 mr-1 text-purple-500" />
            Voice Controls
          </h3>
          
          <div className="p-4">
            {/* Centered mic button above visualizer */}
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 transform hover:scale-105 transition-transform duration-200">
                <RecordButton 
                  isListening={isListening} 
                  onClick={toggleRecording} 
                  size="lg"
                />
              </div>
              <p className="text-sm text-center text-gray-500 mb-3">
                {isListening ? "Recording... Click to stop" : "Click to start dictating"}
              </p>
              
              {/* Visualizer directly below the dictation button - no action buttons */}
              <div className="w-full">
                <AudioVisualizer 
                  isListening={isListening || voiceSearchActive} 
                  onError={handleError} 
                />
              </div>
            </div>
            
            {/* Real-time transcript - always visible when listening */}
            {(isListening || voiceSearchActive) && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-purple-600 mb-1">
                  {voiceSearchActive ? "Say 'search for [topic]'" : "I'm listening..."}
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 min-h-[60px] border border-gray-100">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {transcript || "Waiting for speech..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Processing indicator */}
        {processingText && (
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex flex-col items-center justify-center">
            <div className="flex justify-center mb-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
            <p className="text-purple-700 text-center text-sm font-medium mb-1">{processingText}</p>
            <p className="text-purple-600 text-center text-xs">This may take a few moments...</p>
          </div>
        )}

        {/* Research in progress indicator */}
        {isResearching && (
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex flex-col items-center justify-center">
            <div className="flex justify-center mb-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
            <p className="text-purple-700 text-center text-sm font-medium mb-1">Researching: {researchQuery}</p>
            <p className="text-purple-600 text-center text-xs">Searching the web for relevant information...</p>
          </div>
        )}

        {/* Processed list display */}
        {!isListening && processedList.length > 0 && (
          <div className="bg-white border border-purple-100 rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-purple-700 flex items-center">
                {listType === 'tasks' ? 
                  <><ClipboardList className="w-4 h-4 mr-1 text-purple-500" /> Task List</> : 
                  listType === 'grocery' ? 
                  <><ShoppingCart className="w-4 h-4 mr-1 text-purple-500" /> Grocery List</> : 
                  <><FileText className="w-4 h-4 mr-1 text-purple-500" /> Notes</>
                }
                {autoDetectedType && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Auto-detected
                  </span>
                )}
              </h3>
              
              <div className="flex space-x-1">
                <button 
                  onClick={addNewItem}
                  className="px-2 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg border border-gray-100">
              <ul className="divide-y divide-gray-200">
                {processedList.map((item, index) => (
                  <li key={index} className="p-2 hover:bg-white rounded-lg transition-colors">
                    {editingIndex === index ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 bg-white text-sm"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <button 
                          onClick={saveEdit}
                          className="ml-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {listType === 'tasks' && (
                          <button 
                            onClick={() => toggleItemCompletion(index)}
                            className={`mr-2 w-5 h-5 flex-shrink-0 border rounded-md ${
                              completedItems.has(index) 
                                ? 'bg-purple-500 border-purple-600 text-white' 
                                : 'border-gray-300 hover:border-purple-300'
                            } transition-colors`}
                          >
                            {completedItems.has(index) && <Check className="w-3 h-3" />}
                          </button>
                        )}
                        <span 
                          className={`flex-1 text-gray-800 text-sm ${
                            listType === 'tasks' && completedItems.has(index) 
                              ? 'line-through text-gray-400' 
                              : ''
                          }`}
                        >
                          {item}
                        </span>
                        <div className="flex space-x-1 ml-1">
                          <button 
                            onClick={() => {
                              setResearchQuery(item);
                              performWebSearch(item);
                            }}
                            className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Research this item"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => startEditing(index)}
                            className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PenLine className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => deleteItem(index)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Quick actions footer */}
            <div className="flex justify-end mt-3 space-x-2">
              <button 
                onClick={shareList}
                className="p-1.5 text-xs bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                title="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={exportListAsText}
                className="p-1.5 text-xs bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                title="Export"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        
        {/* Stand-alone web search results section - moved outside the list section */}
        
        {!isResearching && webSearchResults.length > 0 && (
          <div className="bg-white border border-purple-100 rounded-xl shadow-sm p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-purple-700 flex items-center">
                <Globe className="w-4 h-4 mr-1 text-purple-500" />
                Web Search Results ({webSearchResults.length})
              </h3>
              <button
                onClick={() => {
                  console.log("Clearing search results");
                  setWebSearchResults([]);
                  setShowWebResults(false);
                  setResearchQuery('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg border border-gray-100">
              <div className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
                {webSearchResults.map((result, index) => (
                  <div key={`search-result-${index}`} className="p-3 hover:bg-white rounded-lg transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {result.title}
                        </a>
                        <div className="text-xs text-gray-500 mt-1">{result.url}</div>
                        <p className="text-sm text-gray-700 mt-2">{result.snippet}</p>
                        
                        {/* Add image display */}
                        {result.imageUrl && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-w-[300px]">
                            <img 
                              src={result.imageUrl} 
                              alt={result.imageAlt || result.title} 
                              className="w-full h-auto object-cover max-h-[150px]"
                              onError={(e) => {
                                // Display a colored placeholder instead of hiding the image
                                const target = e.currentTarget;
                                const parentElement = target.parentElement;
                                
                                // Make sure parent element exists before trying to modify it
                                if (parentElement) {
                                  const placeholderColor = `hsl(${Math.abs(result.title.charCodeAt(0) * 10) % 360}, 70%, 80%)`;
                                  parentElement.style.backgroundColor = placeholderColor;
                                  parentElement.style.minHeight = '120px';
                                  parentElement.style.display = 'flex';
                                  parentElement.style.alignItems = 'center';
                                  parentElement.style.justifyContent = 'center';
                                  
                                  // Add a text element showing the first letter of the title
                                  const textElement = document.createElement('span');
                                  textElement.textContent = result.title.charAt(0).toUpperCase();
                                  textElement.style.fontSize = '48px';
                                  textElement.style.fontWeight = 'bold';
                                  textElement.style.color = '#fff';
                                  
                                  // Replace the image with the text
                                  target.style.display = 'none';
                                  parentElement.appendChild(textElement);
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => addItemFromWebSearch(result.title)}
                        className="ml-2 p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Add to list"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Challenge complete message */}
        {currentStep >= 3 && processedList.length >= 3 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full text-green-600 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Challenge Completed!</h3>
            <p className="text-green-700 mb-4">You've successfully used dictation to create and manage a list. Well done!</p>
            <button 
              onClick={onComplete}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              Mark Challenge Complete
            </button>
          </div>
        )}
        
        {/* Mobile-only saved lists and other controls */}
        <div className="md:hidden">
          {/* Saved lists accordion for mobile */}
          <div className="bg-white border border-purple-100 rounded-xl shadow-sm overflow-hidden mb-4">
            <div 
              className="p-3 flex justify-between items-center cursor-pointer hover:bg-purple-50 transition-colors"
              onClick={() => setShowSavedLists(!showSavedLists)}
            >
              <h3 className="font-medium text-sm text-purple-700 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1 text-purple-500" />
                My Lists
              </h3>
              {showSavedLists ? <ChevronUp className="text-purple-500 w-3.5 h-3.5" /> : <ChevronDown className="text-purple-500 w-3.5 h-3.5" />}
            </div>
            
            {showSavedLists && (
              <div className="px-4 pb-4 border-t border-purple-50">
                {savedLists.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    <p>No saved lists yet.</p>
                    <p className="mt-1">Create your first list by dictating and saving!</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-purple-50">
                    {savedLists.map(list => (
                      <li 
                        key={list.id} 
                        className={`py-2 px-1 hover:bg-purple-50 rounded cursor-pointer transition-colors ${currentListId === list.id ? 'bg-purple-50' : ''}`}
                        onClick={() => loadList(list.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {list.type === 'tasks' ? 
                              <ClipboardList className="w-4 h-4 text-purple-500 mr-2" /> : 
                              list.type === 'grocery' ? 
                              <ShoppingCart className="w-4 h-4 text-purple-500 mr-2" /> : 
                              <FileText className="w-4 h-4 text-purple-500 mr-2" />
                            }
                            <span className="truncate text-sm font-medium text-gray-700" title={list.name}>
                              {list.name}
                            </span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-full"
                            title="Delete list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                          <span>{list.items.length} items</span>
                          <span>{new Date(list.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="mt-3 flex items-center">
                  <button 
                    onClick={() => {
                      setEditingListName(true);
                      setNewListName('');
                    }}
                    className="text-xs flex items-center text-purple-600 hover:text-purple-700 px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New List
                  </button>
                </div>
                
                {editingListName && (
                  <div className="mt-3 p-2 bg-purple-50 rounded">
                    <input 
                      type="text"
                      placeholder="Enter list name"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="w-full p-2 text-sm border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-300"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          createNewList(newListName);
                          setEditingListName(false);
                        } else if (e.key === 'Escape') {
                          setEditingListName(false);
                        }
                      }}
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <button 
                        onClick={() => setEditingListName(false)}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          createNewList(newListName);
                          setEditingListName(false);
                        }}
                        className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main grid for larger layouts - only appears on tablet and above */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-6">
          {/* Left sidebar for tablet and desktop */}
          <div className="md:col-span-4 lg:col-span-3">
            {/* Saved lists section */}
            <div className="bg-white border border-purple-100 rounded-xl shadow-sm overflow-hidden mb-4">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-purple-50 transition-colors"
                onClick={() => setShowSavedLists(!showSavedLists)}
              >
                <h3 className="font-semibold text-purple-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0h10a2 2 0 010 4H7a2 2 0 010-4z" />
                  </svg>
                  My Lists
                </h3>
                {showSavedLists ? <ChevronUp className="text-purple-500 w-4 h-4" /> : <ChevronDown className="text-purple-500 w-4 h-4" />}
              </div>
              
              {showSavedLists && (
                <div className="px-4 pb-4 border-t border-purple-50">
                  {savedLists.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>No saved lists yet.</p>
                      <p className="mt-1">Create your first list by dictating and saving!</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-purple-50">
                      {savedLists.map(list => (
                        <li 
                          key={list.id} 
                          className={`py-2 px-1 hover:bg-purple-50 rounded cursor-pointer transition-colors ${currentListId === list.id ? 'bg-purple-50' : ''}`}
                          onClick={() => loadList(list.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {list.type === 'tasks' ? 
                                <ClipboardList className="w-4 h-4 text-purple-500 mr-2" /> : 
                                list.type === 'grocery' ? 
                                <ShoppingCart className="w-4 h-4 text-purple-500 mr-2" /> : 
                                <FileText className="w-4 h-4 text-purple-500 mr-2" />
                              }
                              <span className="truncate text-sm font-medium text-gray-700" title={list.name}>
                                {list.name}
                              </span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                              className="p-1 text-gray-400 hover:text-red-500 rounded-full"
                              title="Delete list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                            <span>{list.items.length} items</span>
                            <span>{new Date(list.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <div className="mt-3 flex items-center">
                    <button 
                      onClick={() => {
                        setEditingListName(true);
                        setNewListName('');
                      }}
                      className="text-xs flex items-center text-purple-600 hover:text-purple-700 px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New List
                    </button>
                  </div>
                  
                  {editingListName && (
                    <div className="mt-3 p-2 bg-purple-50 rounded">
                      <input 
                        type="text"
                        placeholder="Enter list name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        className="w-full p-2 text-sm border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-300"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            createNewList(newListName);
                            setEditingListName(false);
                          } else if (e.key === 'Escape') {
                            setEditingListName(false);
                          }
                        }}
                      />
                      <div className="flex justify-end mt-2 space-x-2">
                        <button 
                          onClick={() => setEditingListName(false)}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            createNewList(newListName);
                            setEditingListName(false);
                          }}
                          className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Challenge progress panel */}
            <div className="bg-white border border-purple-100 rounded-xl shadow-sm p-4 mb-4">
              <h3 className="text-lg font-semibold text-purple-700 mb-4 flex items-center">
                <svg className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <div className={`absolute left-2 top-0 bottom-0 w-0.5 bg-purple-100 ${currentStep > 1 ? 'bg-purple-400' : ''}`}></div>
                  <div className="relative flex items-start">
                    <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center flex-shrink-0 ${currentStep >= 1 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>
                      {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
                    </div>
                    <div className="mt-0.5">
                      <p className={`font-medium ${currentStep >= 1 ? 'text-purple-800' : 'text-gray-500'}`}>
                        Start Dictating
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Click the microphone button to begin</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className={`absolute left-2 top-0 bottom-0 w-0.5 bg-purple-100 ${currentStep > 2 ? 'bg-purple-400' : ''}`}></div>
                  <div className="relative flex items-start">
                    <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center flex-shrink-0 ${currentStep >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>
                      {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
                    </div>
                    <div className="mt-0.5">
                      <p className={`font-medium ${currentStep >= 2 ? 'text-purple-800' : 'text-gray-500'}`}>
                        Process Content
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Stop recording to see your organized list</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="relative flex items-start">
                    <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center flex-shrink-0 ${currentStep >= 3 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>
                      {currentStep > 3 ? <Check className="w-4 h-4" /> : "3"}
                    </div>
                    <div className="mt-0.5">
                      <p className={`font-medium ${currentStep >= 3 ? 'text-purple-800' : 'text-gray-500'}`}>
                        Manage Your List
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Edit, organize and save your content</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips collapsible panel */}
            <div className="bg-white border border-purple-100 rounded-xl shadow-sm overflow-hidden">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-purple-50 transition-colors"
                onClick={() => setShowEducation(!showEducation)}
              >
                <h3 className="font-semibold text-purple-700 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-purple-500" /> Tips & Benefits
                </h3>
                {showEducation ? <ChevronUp className="text-purple-500 w-4 h-4" /> : <ChevronDown className="text-purple-500 w-4 h-4" />}
              </div>
              
              {showEducation && (
                <div className="px-4 pb-4">
                  <div className="text-sm text-gray-700 space-y-2">
                    <div>
                      <p className="font-medium text-purple-700">{educationalContent[0].title}</p>
                      <p className="mt-1">{educationalContent[0].content}</p>
                    </div>
                    
                    <div className="pt-2">
                      <p className="font-medium text-purple-700">{educationalContent[2].title}</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {educationalContent[2]?.items?.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right content area - empty on tablet and desktop since we've moved content to mobile flow */}
          <div className="md:col-span-8 lg:col-span-9">
            {/* This area is intentionally left empty for desktop as we've moved the content up */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDictationWizard; 