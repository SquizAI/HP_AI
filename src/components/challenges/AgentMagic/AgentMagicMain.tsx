import React, { useState, useEffect, useRef } from 'react';
import { useUserProgress, markChallengeAsCompleted } from '../../../utils/userDataManager';
import {
  Sparkles,
  Zap,
  Award,
  Check,
  Briefcase,
  FileSpreadsheet,
  FileText,
  Mail,
  Search,
  Image as ImageIcon,
  Globe,
  MessageSquare,
  PieChart,
  BarChart,
  LineChart,
  Mic,
  Volume,
  Book,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Users,
  User,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Info
} from 'lucide-react';

// Import sub-components
import AgentHub from './components/AgentHub';
import WorkflowDesigner from './components/WorkflowDesigner';
import AgentChat from './components/AgentChat';
import ProjectGallery from './components/ProjectGallery';
import WorkflowEducation from './components/WorkflowEducation';
import ChallengeHeader from '../../shared/ChallengeHeader';

// Types
interface AgentConfig {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  systemPrompt: string;
  capabilities: string[];
  icon: React.ReactNode;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  agentId: string;
  tools: string[];
  inputRequired?: boolean;
  outputFormat?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  industry: string;
  workflow: WorkflowStep[];
  preview: string;
  status: 'available' | 'premium' | 'coming-soon';
  estimatedValue: string;
  deliverables: string[];
}

// Main component
const AgentMagicMain: React.FC = () => {
  const [currentView, setCurrentView] = useState<'hub' | 'workflow' | 'chat' | 'gallery' | 'education'>('hub');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [userProgress, setUserProgress] = useUserProgress();
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress.completedChallenges.includes('challenge-agent-magic')
  );
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Check if challenge is already completed on mount
  useEffect(() => {
    if (userProgress.completedChallenges.includes('challenge-agent-magic')) {
      setIsCompleted(true);
    }
  }, [userProgress]);
  
  // Handle completing the challenge
  const handleCompleteChallenge = () => {
    // Check if user has interacted with at least one agent
    if (currentView === 'hub' && !selectedAgent) {
      alert('Please interact with at least one agent before completing the challenge.');
      return;
    }
    
    markChallengeAsCompleted('challenge-agent-magic');
    setIsCompleted(true);
    
    // Show confetti
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };
  
  // Navigate to different views
  const navigateTo = (view: 'hub' | 'workflow' | 'chat' | 'gallery' | 'education') => {
    setCurrentView(view);
  };
  
  // Select a project
  const selectProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('workflow');
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <ChallengeHeader
        title="Agent Magic Challenge"
        icon={<Sparkles className="h-6 w-6 text-yellow-600" />}
        challengeId="challenge-agent-magic"
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        onCompleteChallenge={handleCompleteChallenge}
        isHPChallenge={true}
      />
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            className={`px-4 py-2 ${currentView === 'hub' ? 'border-b-2 border-yellow-600 text-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => navigateTo('hub')}
          >
            <div className="flex items-center">
              <Users size={18} className="mr-2" />
              <span>Agent Hub</span>
            </div>
          </button>
          <button 
            className={`px-4 py-2 ${currentView === 'workflow' ? 'border-b-2 border-yellow-600 text-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => navigateTo('workflow')}
          >
            <div className="flex items-center">
              <GitBranch size={18} className="mr-2" />
              <span>Workflow Designer</span>
            </div>
          </button>
          <button 
            className={`px-4 py-2 ${currentView === 'chat' ? 'border-b-2 border-yellow-600 text-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => navigateTo('chat')}
          >
            <div className="flex items-center">
              <MessageSquare size={18} className="mr-2" />
              <span>Agent Chat</span>
            </div>
          </button>
          <button 
            className={`px-4 py-2 ${currentView === 'gallery' ? 'border-b-2 border-yellow-600 text-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => navigateTo('gallery')}
          >
            <div className="flex items-center">
              <Briefcase size={18} className="mr-2" />
              <span>Project Gallery</span>
            </div>
          </button>
          <button 
            className={`px-4 py-2 ${currentView === 'education' ? 'border-b-2 border-yellow-600 text-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => navigateTo('education')}
          >
            <div className="flex items-center">
              <BookOpen size={18} className="mr-2" />
              <span>Learn</span>
            </div>
          </button>
        </div>
        
        {/* Current View Content */}
        {currentView === 'hub' && <AgentHub onSelectAgent={setSelectedAgent} />}
        {currentView === 'workflow' && <WorkflowDesigner />}
        {currentView === 'chat' && <AgentChat selectedAgent={selectedAgent} />}
        {currentView === 'gallery' && <ProjectGallery onSelectProject={selectProject} />}
        {currentView === 'education' && <WorkflowEducation />}
      </div>
    </div>
  );
};

export default AgentMagicMain; 