import React, { useState, useEffect } from 'react';
import ProblemDefinition from './ProblemDefinition';
import IdeaGeneration from './IdeaGeneration';
import ImplementationPlan from './ImplementationPlan';
import CompletionScreen from './CompletionScreen';
import { saveChallengeBrainstorm } from '../../../utils/userDataManager';

// Interface for managing the challenge state
export interface BrainstormState {
  problemStatement: string;
  ideaCategory: string;
  ideas: Idea[];
  selectedIdea: Idea | null;
  implementation: string;
  isComplete: boolean;
}

// Interface for idea objects
export interface Idea {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  isSelected: boolean;
  implementation?: string;
}

// Initial state with empty values
const INITIAL_STATE: BrainstormState = {
  problemStatement: '',
  ideaCategory: '',
  ideas: [],
  selectedIdea: null,
  implementation: '',
  isComplete: false
};

// Challenge steps
enum STEPS {
  PROBLEM_DEFINITION = 0,
  IDEA_GENERATION = 1,
  IDEA_SELECTION = 2,
  IMPLEMENTATION_PLAN = 3,
  COMPLETION = 4
}

// Sample problem categories
const PROBLEM_CATEGORIES = [
  {
    id: 'team-engagement',
    title: 'Team Engagement',
    description: 'Boost team morale, collaboration, and productivity',
    icon: '👥'
  },
  {
    id: 'process-optimization',
    title: 'Process Optimization',
    description: 'Streamline workflows and improve efficiency',
    icon: '⚙️'
  },
  {
    id: 'customer-experience',
    title: 'Customer Experience',
    description: 'Enhance customer satisfaction and loyalty',
    icon: '🤝'
  },
  {
    id: 'innovation',
    title: 'Innovation',
    description: 'Generate new product or service ideas',
    icon: '💡'
  },
  {
    id: 'resource-allocation',
    title: 'Resource Allocation',
    description: 'Optimize use of time, budget, or personnel',
    icon: '📊'
  },
  {
    id: 'custom',
    title: 'Custom Challenge',
    description: 'Define your own business challenge',
    icon: '🎯'
  }
];

// Fun creativity facts to display during the challenge
const CREATIVITY_FACTS = [
  "The average person has about 60,000 thoughts per day, but only 1% are truly creative ideas.",
  "Studies show that people are 60% more creative when walking versus sitting at a desk.",
  "The 'incubation effect' means that stepping away from a problem often leads to breakthrough ideas.",
  "Diverse teams generate 19% more revenue due to increased innovation.",
  "Research shows that our best ideas often come in the shower because the relaxed state activates our default mode network.",
  "The phrase 'thinking outside the box' comes from the nine-dot puzzle, which requires drawing outside the implied square.",
  "Creativity is contagious—Google's '20% time' policy has resulted in Gmail, Google News, and many other innovations.",
  "Nobel Prize-winning ideas are most likely to occur between 10 PM and 4 AM, when conventional thinking diminishes.",
  "Blue environments have been shown to boost creative output by up to 33%.",
  "Businesses with formalized innovation processes are 65% more successful at launching new products."
];

// Utility function to save challenge data to localStorage (would be replaced with actual API integration)
const saveBrainstormData = (data: BrainstormState): void => {
  try {
    const userProgress = JSON.parse(localStorage.getItem('ai_hub_user_progress') || '{"completedChallenges":[],"challengeData":{},"lastActive":""}');
    
    const challengeId = 'challenge-11';
    
    if (!userProgress.challengeData[challengeId]) {
      userProgress.challengeData[challengeId] = {};
    }
    
    userProgress.challengeData[challengeId].brainstorm = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // If the challenge is complete, add it to completed challenges
    if (data.isComplete && !userProgress.completedChallenges.includes(challengeId)) {
      userProgress.completedChallenges.push(challengeId);
    }
    
    userProgress.lastActive = new Date().toISOString();
    localStorage.setItem('ai_hub_user_progress', JSON.stringify(userProgress));
  } catch (error) {
    console.error('Error saving brainstorm challenge data:', error);
  }
};

// Mock idea generation function (would be replaced with AI API call)
const generateIdeas = (problem: string, category: string): Promise<Idea[]> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const ideas: Idea[] = [
        {
          id: '1',
          title: 'Cross-functional Innovation Workshops',
          description: 'Organize monthly workshops where team members from different departments collaborate on specific challenges using design thinking methodologies.',
          pros: [
            'Breaks down silos between departments',
            'Introduces fresh perspectives to old problems',
            'Builds collaborative skills across the organization',
            'Can generate unexpected solutions by combining diverse expertise'
          ],
          cons: [
            'Requires time away from regular duties',
            'May need external facilitation initially',
            'Could create friction between different working styles',
            'Success depends on strong follow-up mechanisms'
          ],
          isSelected: false
        },
        {
          id: '2',
          title: 'Idea Banking System',
          description: 'Create a digital repository where employees can submit, build upon, and vote for innovative ideas year-round with quarterly innovation challenges.',
          pros: [
            'Captures ideas when inspiration strikes',
            'Creates a democratic approach to innovation',
            'Builds an innovation culture over time',
            'Provides metrics on employee engagement with innovation'
          ],
          cons: [
            'Requires a platform investment',
            'Needs consistent management attention',
            'May generate more ideas than can be implemented',
            'Risk of disappointing employees if ideas aren\'t acted upon'
          ],
          isSelected: false
        },
        {
          id: '3',
          title: 'Rapid Prototyping Lab',
          description: 'Establish a dedicated space with resources (time, tools, budget) for quickly testing promising ideas through minimum viable prototypes.',
          pros: [
            'Accelerates the path from concept to testing',
            'Reduces risk of large investments in unproven ideas',
            'Makes innovation tangible rather than theoretical',
            'Creates excitement around seeing ideas become reality'
          ],
          cons: [
            'Requires physical space allocation',
            'Needs dedicated budget',
            'May require specialized skills or training',
            'Could create bottlenecks if not properly staffed'
          ],
          isSelected: false
        },
        {
          id: '4',
          title: 'Customer Co-Creation Program',
          description: 'Invite key customers to participate in structured innovation sessions, providing direct input on challenges and potential solutions.',
          pros: [
            'Ensures solutions address real customer needs',
            'Strengthens customer relationships',
            'Reduces risk of market rejection',
            'Provides external perspective on internal challenges'
          ],
          cons: [
            'Requires careful selection of participating customers',
            'May expose internal challenges to external parties',
            'Scheduling complexity with external participants',
            'Need to manage expectations about implementation'
          ],
          isSelected: false
        },
        {
          id: '5',
          title: 'Innovation Time Allocation',
          description: 'Dedicate 10-15% of employee time specifically for exploring new ideas and approaches related to their work, with structured sharing of outcomes.',
          pros: [
            'Signals organizational commitment to innovation',
            'Provides mental space needed for creative thinking',
            'Can boost employee satisfaction and retention',
            'Distributes innovation efforts across the organization'
          ],
          cons: [
            'Impact on immediate productivity',
            'Difficult to measure direct ROI',
            'May be challenging to implement in some roles',
            'Requires trust in employee self-direction'
          ],
          isSelected: false
        }
      ];
      
      // Generate additional custom idea based on the problem statement
      const customIdeas: Idea[] = [
        {
          id: '6',
          title: `Specialized ${category} Task Force`,
          description: `Create a dedicated cross-functional team focusing exclusively on addressing "${problem}" for a limited 30-day sprint, with executive sponsorship.`,
          pros: [
            'Provides focused attention on a specific challenge',
            'Creates clear accountability for solutions',
            'Limits time commitment with sprint approach',
            'Executive sponsorship ensures implementation pathway'
          ],
          cons: [
            'Pulls team members from other responsibilities',
            'May create silos if not properly integrated',
            'Risk of solution myopia without diverse input',
            'Success depends on appropriate team selection'
          ],
          isSelected: false
        },
        {
          id: '7',
          title: `${category} Innovation Challenge`,
          description: `Launch a company-wide competition specifically focused on generating solutions for "${problem}" with recognition and resources for winning ideas.`,
          pros: [
            'Harnesses collective intelligence of the organization',
            'Creates excitement and engagement around the problem',
            'Can identify unexpected talent and ideas',
            'Positions the challenge as an opportunity'
          ],
          cons: [
            'May generate quantity over quality of ideas',
            'Requires significant coordination and communication',
            'Competition aspect might discourage collaboration',
            'Needs clear criteria for success to be effective'
          ],
          isSelected: false
        }
      ];
      
      resolve([...ideas, ...customIdeas]);
    }, 2000);
  });
};

// Generate implementation plan for a selected idea
const generateImplementation = (idea: Idea, problem: string): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const implementation = `
# Implementation Plan: ${idea.title}

## Challenge Addressed
${problem}

## 30-Day Implementation Roadmap

### Week 1: Foundation
- Assign executive sponsor and core implementation team
- Define specific success metrics and KPIs
- Conduct stakeholder mapping and initial communication
- Identify required resources and secure initial budget

### Week 2: Design
- Develop detailed implementation blueprint
- Create communication and training materials
- Identify potential obstacles and mitigation strategies
- Set up tracking mechanisms for progress

### Week 3: Initial Implementation
- Roll out pilot program with selected team/department
- Conduct daily stand-ups to address emerging issues
- Begin collecting initial feedback and metrics
- Make rapid adjustments based on early learnings

### Week 4: Expansion & Evaluation
- Expand implementation based on pilot results
- Conduct mid-point evaluation against success metrics
- Document lessons learned and best practices
- Prepare recommendations for full-scale rollout

## Key Success Factors
- Clear executive sponsorship and visible support
- Regular communication of progress and wins
- Quick resolution of roadblocks
- Celebration of early adopters and champions

## Long-term Sustainability Plan
- Integrate into regular business processes
- Establish ongoing measurement and refinement
- Create community of practice to share learning
- Schedule quarterly review and optimization sessions
      `;
      
      resolve(implementation);
    }, 1500);
  });
};

const BrainstormBuddyMain: React.FC = () => {
  // State management
  const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.PROBLEM_DEFINITION);
  const [state, setState] = useState<BrainstormState>(INITIAL_STATE);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [funFact, setFunFact] = useState<string>('');
  
  // Load a random creativity fact when the component mounts
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * CREATIVITY_FACTS.length);
    setFunFact(CREATIVITY_FACTS[randomIndex]);
  }, []);
  
  // Update state and save to localStorage
  const updateState = (newState: Partial<BrainstormState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      saveBrainstormData(updatedState);
      return updatedState;
    });
  };
  
  // Handle problem statement changes
  const handleProblemChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateState({ problemStatement: e.target.value });
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    const category = PROBLEM_CATEGORIES.find(c => c.id === categoryId);
    if (category) {
      updateState({ ideaCategory: category.title });
    }
  };
  
  // Generate ideas based on problem statement and category
  const handleGenerateIdeas = async () => {
    if (!state.problemStatement || !state.ideaCategory) {
      setError('Please define your problem and select a category before generating ideas.');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    
    try {
      const ideas = await generateIdeas(state.problemStatement, state.ideaCategory);
      updateState({ ideas });
      setCurrentStep(STEPS.IDEA_GENERATION);
      // Load a new fun fact when moving to the next step
      const randomIndex = Math.floor(Math.random() * CREATIVITY_FACTS.length);
      setFunFact(CREATIVITY_FACTS[randomIndex]);
    } catch (err) {
      setError('Failed to generate ideas. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Select an idea for implementation
  const handleSelectIdea = (idea: Idea) => {
    const updatedIdeas = state.ideas.map(i => ({
      ...i,
      isSelected: i.id === idea.id
    }));
    
    updateState({
      ideas: updatedIdeas,
      selectedIdea: idea
    });
    
    setCurrentStep(STEPS.IDEA_SELECTION);
  };
  
  // Generate implementation plan for selected idea
  const handleGenerateImplementation = async () => {
    if (!state.selectedIdea) {
      setError('Please select an idea before generating an implementation plan.');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    
    try {
      const implementation = await generateImplementation(state.selectedIdea, state.problemStatement);
      updateState({ implementation });
      setCurrentStep(STEPS.IMPLEMENTATION_PLAN);
      // Load a new fun fact
      const randomIndex = Math.floor(Math.random() * CREATIVITY_FACTS.length);
      setFunFact(CREATIVITY_FACTS[randomIndex]);
    } catch (err) {
      setError('Failed to generate implementation plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Complete the challenge
  const handleComplete = () => {
    updateState({ isComplete: true });
    setCurrentStep(STEPS.COMPLETION);
    
    // Save completion data to the user progress
    if (state.selectedIdea) {
      saveChallengeBrainstorm(
        'challenge-11',
        state.problemStatement,
        state.ideaCategory,
        {
          title: state.selectedIdea.title,
          description: state.selectedIdea.description
        },
        state.implementation
      );
    }
  };
  
  // Restart the challenge
  const handleRestart = () => {
    setState(INITIAL_STATE);
    setCurrentStep(STEPS.PROBLEM_DEFINITION);
    const randomIndex = Math.floor(Math.random() * CREATIVITY_FACTS.length);
    setFunFact(CREATIVITY_FACTS[randomIndex]);
  };
  
  // Get step label based on current step
  const getStepLabel = (step: STEPS): string => {
    switch (step) {
      case STEPS.PROBLEM_DEFINITION: return 'Define Challenge';
      case STEPS.IDEA_GENERATION: return 'Generate Ideas';
      case STEPS.IDEA_SELECTION: return 'Select Ideas';
      case STEPS.IMPLEMENTATION_PLAN: return 'Implementation Plan';
      case STEPS.COMPLETION: return 'Challenge Complete';
    }
  };
  
  return (
    <div className="container mx-auto max-w-5xl">
      {/* Progress steps */}
      {currentStep < STEPS.COMPLETION && (
        <div className="px-6 py-4">
          <div className="mb-2 flex justify-between text-sm text-gray-500">
            <span>Start</span>
            <span>Complete</span>
          </div>
          <div className="flex mb-6">
            {Object.values(STEPS).filter(step => typeof step === 'number' && step < STEPS.COMPLETION).map((step) => (
              <div key={step} className="flex-1 relative">
                <div 
                  className={`h-2 ${
                    Number(step) < currentStep 
                      ? 'bg-orange-500' 
                      : Number(step) === currentStep 
                        ? 'bg-orange-300' 
                        : 'bg-gray-200'
                  }`}
                />
                <div 
                  className={`w-6 h-6 rounded-full absolute top-[-8px] ${
                    Number(step) <= currentStep ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  } flex items-center justify-center text-xs font-medium`}
                  style={{ left: step === 0 ? 0 : '50%', transform: step === 0 ? 'none' : 'translateX(-50%)' }}
                >
                  {Number(step) + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-gray-800">{getStepLabel(currentStep)}</h2>
            <p className="text-sm text-gray-500">Step {currentStep + 1} of {STEPS.COMPLETION}</p>
          </div>
        </div>
      )}
      
      {/* Fun fact box */}
      {currentStep < STEPS.COMPLETION && (
        <div className="px-6 mb-8">
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="text-orange-500 text-xl mr-3">💡</div>
              <div>
                <h3 className="font-medium text-orange-800 mb-1">Creativity Fact</h3>
                <p className="text-orange-700 text-sm">{funFact}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="px-6 mb-4">
          <div className="bg-red-50 p-4 rounded-lg text-red-800">
            {error}
          </div>
        </div>
      )}
      
      {/* Step content */}
      <div className="px-6">
        {/* Step 1: Problem Definition */}
        {currentStep === STEPS.PROBLEM_DEFINITION && (
          <ProblemDefinition 
            state={state}
            categories={PROBLEM_CATEGORIES}
            onProblemChange={handleProblemChange}
            onCategorySelect={handleCategorySelect}
            onGenerateIdeas={handleGenerateIdeas}
            isGenerating={isGenerating}
            error={error}
          />
        )}
        
        {/* Step 2: Idea Generation */}
        {currentStep === STEPS.IDEA_GENERATION && (
          <IdeaGeneration
            state={state}
            onSelectIdea={handleSelectIdea}
            onGenerateImplementation={handleGenerateImplementation}
            onBack={() => setCurrentStep(STEPS.PROBLEM_DEFINITION)}
            isGenerating={isGenerating}
            error={error}
          />
        )}
        
        {/* Step 3: Implementation Plan */}
        {currentStep === STEPS.IMPLEMENTATION_PLAN && (
          <ImplementationPlan
            state={state}
            onComplete={handleComplete}
            onBack={() => setCurrentStep(STEPS.IDEA_GENERATION)}
          />
        )}
        
        {/* Step 4: Completion */}
        {currentStep === STEPS.COMPLETION && (
          <CompletionScreen
            state={state}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
};

export default BrainstormBuddyMain; 