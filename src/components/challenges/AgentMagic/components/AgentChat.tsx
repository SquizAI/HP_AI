import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Zap,
  CheckCircle2,
  User,
  Search,
  FileText,
  BarChart,
  Image as ImageIcon,
  Briefcase,
  Clock,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Globe,
  Database,
  Mic,
  Volume
} from 'lucide-react';

// Types
interface Message {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
  attachments?: {
    type: 'image' | 'chart' | 'document' | 'link';
    url: string;
    caption?: string;
  }[];
  isLoading?: boolean;
  toolsUsed?: string[];
}

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  systemPrompt: string;
  capabilities: string[];
  icon: React.ReactNode;
}

interface Project {
  id: string;
  title: string;
  description: string;
  industry: string;
  workflow: any[];
  preview: string;
  status: 'available' | 'premium' | 'coming-soon';
  estimatedValue: string;
  deliverables: string[];
}

interface AgentChatProps {
  project: Project | null;
  isWorkflowRunning: boolean;
  onWorkflowComplete: () => void;
}

// Available agents in our system
const AVAILABLE_AGENTS: Agent[] = [
  {
    id: 'research-analyst',
    name: 'Research Analyst',
    role: 'Research',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    color: '#6366f1',
    systemPrompt: 'You are a top-tier research analyst who excels at gathering and analyzing information from various sources.',
    capabilities: [
      'Web research',
      'Data collection',
      'Competitive analysis',
      'Market insights'
    ],
    icon: <Search size={18} />
  },
  {
    id: 'content-strategist',
    name: 'Content Strategist',
    role: 'Content',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    color: '#8b5cf6',
    systemPrompt: 'You are an expert content strategist who develops high-quality content plans and written materials.',
    capabilities: [
      'Content planning',
      'Copywriting',
      'SEO optimization',
      'Brand voice development'
    ],
    icon: <FileText size={18} />
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    role: 'Analysis',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    color: '#ec4899',
    systemPrompt: 'You are a skilled data scientist who analyzes complex data sets and derives meaningful insights.',
    capabilities: [
      'Data analysis',
      'Visualization',
      'Statistical modeling',
      'Insight generation'
    ],
    icon: <BarChart size={18} />
  },
  {
    id: 'creative-director',
    name: 'Creative Director',
    role: 'Design',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    color: '#f97316',
    systemPrompt: 'You are a visionary creative director who guides visual and design strategies.',
    capabilities: [
      'Visual design',
      'Brand identity',
      'Creative direction',
      'Asset creation'
    ],
    icon: <ImageIcon size={18} />
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    role: 'Strategy',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    color: '#0ea5e9',
    systemPrompt: 'You are a sharp business analyst who identifies opportunities and provides strategic recommendations.',
    capabilities: [
      'SWOT analysis',
      'Business planning',
      'Process optimization',
      'Risk assessment'
    ],
    icon: <Briefcase size={18} />
  }
];

// Sample predefined messages for demo purposes
const PREDEFINED_MESSAGES: {[key: string]: Message[]} = {
  'market-analysis': [
    {
      id: 'msg-1',
      agentId: 'project-manager',
      content: "Welcome! I'm your Project Manager for this Market Analysis workflow. I'll be coordinating our team of specialized agents to deliver your comprehensive market analysis. What industry or market segment would you like us to analyze?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      toolsUsed: []
    }
  ],
  'content-campaign': [
    {
      id: 'msg-1',
      agentId: 'project-manager',
      content: "Welcome to your Content Campaign workflow! I'm your Project Manager and I'll be orchestrating our team to create a multi-channel content campaign for you. What product, service, or topic should this campaign focus on?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      toolsUsed: []
    }
  ],
  'product-launch': [
    {
      id: 'msg-1',
      agentId: 'project-manager',
      content: "I'm your Product Launch Project Manager, and I'll be guiding our team through creating a comprehensive launch strategy for your product. To get started, could you tell me about the product you're planning to launch?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      toolsUsed: []
    }
  ]
};

// Marketing analysis specific responses for demo
const MARKETING_RESPONSES = [
  {
    agentId: 'research-analyst',
    content: "I've analyzed the HP laptop market and gathered competitive intelligence. The premium laptop segment is growing at 8.2% annually, with key competitors being Apple, Dell, and Lenovo. HP currently holds ~20% market share in this segment. I'm identifying several positioning opportunities around sustainability, AI integration, and creative professional workflows.",
    attachments: [
      {
        type: 'chart' as const,
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Market share analysis of premium laptop segment'
      }
    ],
    toolsUsed: ['web_search', 'data_scraping', 'trend_analysis']
  },
  {
    agentId: 'data-scientist',
    content: "Based on the research data, I've identified three key market segments with growth potential: creative professionals (18% growth), remote workers (22% growth), and eco-conscious consumers (15% growth). Our sustainability initiatives resonate particularly well with demographics 25-40. I've prepared visualizations of the opportunity sizing and target audience analysis.",
    attachments: [
      {
        type: 'chart' as const,
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Growth potential by market segment'
      }
    ],
    toolsUsed: ['data_analysis', 'chart_generation']
  },
  {
    agentId: 'business-analyst',
    content: "I've completed a SWOT analysis for our sustainable laptop line positioning. Key strengths include our established brand reputation and manufacturing capabilities. Opportunities lie in the growing eco-conscious market and potential for premium pricing. Threats include Apple's strong position in the premium segment and perception challenges around Windows performance. I recommend focusing on our unique sustainability story while emphasizing performance capabilities.",
    toolsUsed: ['data_analysis']
  },
  {
    agentId: 'content-strategist',
    content: "I've drafted the comprehensive market analysis report integrating all our findings. The report highlights market trends, competitive positioning, target audience analysis, and strategic recommendations. I've organized it with an executive summary, detailed analysis sections, and actionable next steps. Would you like me to highlight any particular aspect of the report?",
    attachments: [
      {
        type: 'document' as const,
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Market Analysis Report - Complete Draft'
      }
    ],
    toolsUsed: ['text_generation', 'content_optimizer']
  },
  {
    agentId: 'business-analyst',
    content: "Based on our comprehensive analysis, here are my strategic recommendations: 1) Position the new laptop line as 'Sustainable Performance' to address both eco-conscious and performance needs, 2) Target creative professionals with sustainability values as our primary audience, 3) Develop a certification program with environmental organizations, 4) Create bundle offers with sustainable accessories, 5) Launch with a carbon-neutral pledge and tree-planting initiative. These recommendations align with our strengths and the identified market opportunities.",
    toolsUsed: ['data_analysis']
  }
];

// Available tools with descriptions
const TOOLS_INFO: {[key: string]: { name: string; description: string }} = {
  'web_search': { name: 'Web Search', description: 'Search the web for real-time information' },
  'data_scraping': { name: 'Data Scraping', description: 'Extract structured data from websites' },
  'trend_analysis': { name: 'Trend Analysis', description: 'Identify and analyze emerging trends' },
  'text_generation': { name: 'Text Generation', description: 'Create high-quality written content' },
  'content_optimizer': { name: 'Content Optimizer', description: 'Improve content for SEO and readability' },
  'text_to_speech': { name: 'Text to Speech', description: 'Convert text to natural-sounding speech' },
  'data_analysis': { name: 'Data Analysis', description: 'Analyze datasets to extract insights' },
  'chart_generation': { name: 'Chart Generation', description: 'Create data visualizations and charts' },
  'sentiment_analysis': { name: 'Sentiment Analysis', description: 'Analyze emotional tone of content' },
  'image_generation': { name: 'Image Generation', description: 'Create AI-generated images' },
  'image_editing': { name: 'Image Editing', description: 'Edit and enhance images' },
  'style_transfer': { name: 'Style Transfer', description: 'Apply artistic styles to images' },
  'project_tracking': { name: 'Project Tracking', description: 'Monitor project progress and timeline' },
  'quality_checker': { name: 'Quality Checker', description: 'Verify content quality and consistency' },
  'email_composer': { name: 'Email Composer', description: 'Create effective email communications' },
  'translation': { name: 'Translation', description: 'Translate content between languages' },
  'slide_creator': { name: 'Slide Creator', description: 'Generate presentation slides' }
};

const AgentChat: React.FC<AgentChatProps> = ({ 
  project, 
  isWorkflowRunning,
  onWorkflowComplete
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [showTools, setShowTools] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize with project-specific predefined messages
  useEffect(() => {
    if (project?.id && PREDEFINED_MESSAGES[project.id]) {
      setMessages(PREDEFINED_MESSAGES[project.id]);
    } else {
      // Fallback welcome message if no specific ones exist
      setMessages([{
        id: 'msg-default',
        agentId: 'project-manager',
        content: "Welcome to the Agent Workflow! How can our team help you today?",
        timestamp: new Date(),
        toolsUsed: []
      }]);
    }
  }, [project?.id]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle workflow running state
  useEffect(() => {
    if (isWorkflowRunning && project?.id === 'market-analysis') {
      simulateMarketingWorkflow();
    }
  }, [isWorkflowRunning]);
  
  // Simulate the marketing workflow with timed responses
  const simulateMarketingWorkflow = () => {
    // Add a loading message first
    const loadingMessage: Message = {
      id: `msg-loading-${Date.now()}`,
      agentId: MARKETING_RESPONSES[0].agentId,
      content: "Working on market research and analysis...",
      timestamp: new Date(),
      isLoading: true,
      toolsUsed: MARKETING_RESPONSES[0].toolsUsed
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    // Process each response with delays
    MARKETING_RESPONSES.forEach((response, index) => {
      setTimeout(() => {
        // Remove the loading message if there was one
        setMessages(prev => prev.filter(msg => !msg.isLoading));
        
        // Add the real message
        const newMessage: Message = {
          id: `msg-${Date.now()}-${index}`,
          agentId: response.agentId,
          content: response.content,
          timestamp: new Date(),
          attachments: response.attachments,
          toolsUsed: response.toolsUsed
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // If last message, mark workflow as complete
        if (index === MARKETING_RESPONSES.length - 1) {
          setTimeout(() => {
            setIsCompleted(true);
            onWorkflowComplete();
          }, 2000);
        } else if (index < MARKETING_RESPONSES.length - 1) {
          // Add loading message for next agent
          const nextLoadingMessage: Message = {
            id: `msg-loading-${Date.now()}-${index + 1}`,
            agentId: MARKETING_RESPONSES[index + 1].agentId,
            content: "Processing information and preparing response...",
            timestamp: new Date(),
            isLoading: true,
            toolsUsed: MARKETING_RESPONSES[index + 1].toolsUsed
          };
          
          setTimeout(() => {
            setMessages(prev => [...prev, nextLoadingMessage]);
          }, 1000);
        }
        
        // Update current step
        setCurrentStep(index + 1);
      }, (index + 1) * 5000); // 5 second delay between messages
    });
  };
  
  // Get agent by ID
  const getAgentById = (agentId: string): Agent => {
    return AVAILABLE_AGENTS.find(agent => agent.id === agentId) || {
      id: agentId,
      name: 'Project Manager',
      role: 'Management',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      color: '#22c55e',
      systemPrompt: 'You are a project manager who coordinates the workflow.',
      capabilities: ['Project coordination', 'Task assignment', 'Quality assurance'],
      icon: <Briefcase size={18} />
    };
  };
  
  // Send a new message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-msg-${Date.now()}`,
      agentId: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Simulate agent response (in a real app, this would send to backend)
    const loadingMessage: Message = {
      id: `msg-loading-${Date.now()}`,
      agentId: 'project-manager',
      content: "Processing your request...",
      timestamp: new Date(),
      isLoading: true
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, loadingMessage]);
      
      // Remove loading and add real response after delay
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
        
        const responseMessage: Message = {
          id: `agent-msg-${Date.now()}`,
          agentId: 'project-manager',
          content: `Thank you for your input! I've noted "${inputMessage}". Our team will incorporate this into our analysis. Is there anything else you'd like to add about your requirements?`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
    }, 500);
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-300px)] min-h-[600px] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <MessageSquare className="mr-2" />
          <div>
            <h3 className="font-semibold">Agent Workflow Chat</h3>
            <div className="text-xs text-indigo-200">
              {project ? project.title : "Interactive Agent Experience"}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="flex">
            {AVAILABLE_AGENTS.slice(0, 3).map((agent, index) => (
              <div 
                key={agent.id}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-white -ml-2 first:ml-0"
                style={{ zIndex: 10 - index }}
              >
                <img src={agent.avatar} alt={agent.name} />
              </div>
            ))}
          </div>
          
          <div className="bg-white bg-opacity-20 text-xs font-medium px-2 py-1 rounded-full ml-1">
            {isCompleted ? (
              <span className="flex items-center text-green-100">
                <CheckCircle2 size={12} className="mr-1" /> Completed
              </span>
            ) : (
              <span className="flex items-center">
                <Clock size={12} className="mr-1" /> 
                Step {currentStep}/{MARKETING_RESPONSES.length}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const agent = message.agentId === 'user' 
              ? { name: 'You', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg', color: '#64748b' }
              : getAgentById(message.agentId);
            
            return (
              <div key={message.id} className="flex items-start group">
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-3"
                >
                  {message.agentId === 'user' ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                  ) : (
                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-baseline">
                    <span 
                      className="font-semibold mr-2"
                      style={{ color: message.agentId === 'user' ? '#64748b' : agent.color }}
                    >
                      {agent.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className="mt-1">
                    {message.isLoading ? (
                      <div className="flex items-center text-gray-500">
                        <RefreshCw size={14} className="mr-2 animate-spin" />
                        <span>{message.content}</span>
                      </div>
                    ) : (
                      <div className="text-gray-700 whitespace-pre-line">
                        {message.content}
                      </div>
                    )}
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div 
                            key={index}
                            className="border border-gray-200 rounded-lg overflow-hidden max-w-md"
                          >
                            <img 
                              src={attachment.url} 
                              alt={attachment.caption || 'Attachment'} 
                              className="w-full h-48 object-cover"
                            />
                            {attachment.caption && (
                              <div className="p-2 bg-gray-50 text-xs text-gray-500">
                                {attachment.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Tools used */}
                    {message.toolsUsed && message.toolsUsed.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.toolsUsed.map(toolId => {
                          const toolInfo = TOOLS_INFO[toolId];
                          return (
                            <span 
                              key={toolId} 
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100"
                              title={toolInfo?.description || toolId}
                            >
                              <Zap size={10} className="mr-1" />
                              {toolInfo?.name || toolId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Tools sidebar toggle */}
        <div 
          className={`border-l border-gray-200 ${showTools ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}
        >
          {showTools && (
            <div className="p-4 h-full overflow-y-auto">
              <h3 className="font-medium text-gray-800 mb-3">Available Tools</h3>
              
              <div className="space-y-2">
                {Object.entries(TOOLS_INFO).map(([toolId, info]) => (
                  <div key={toolId} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <div className="font-medium text-sm text-gray-700">{info.name}</div>
                    <div className="text-xs text-gray-500">{info.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center">
          <button 
            onClick={() => setShowTools(!showTools)}
            className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 mr-2"
            title="Toggle tools sidebar"
          >
            {showTools ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
            <button className="p-2 text-gray-400 hover:text-indigo-600">
              <Mic size={20} />
            </button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 py-2 px-3 focus:outline-none"
            />
            
            <button className="p-2 text-gray-400 hover:text-indigo-600">
              <Volume size={20} />
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className={`ml-2 p-2 rounded-full ${
              inputMessage.trim() 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        
        {isCompleted && (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3 text-green-800 flex items-start">
            <CheckCircle2 size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Workflow Completed!</div>
              <p className="text-sm mt-1">
                The agent team has completed all steps in the workflow. All deliverables have been prepared according to your requirements.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentChat; 