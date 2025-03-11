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
  aiPersonality: AIPersonality;
  customNotes: string;
  lastUpdated: string;
}

// AI Personality types to make brainstorming more engaging
export type AIPersonality = 'creative' | 'analytical' | 'optimistic' | 'critical' | 'balanced';

// Interface for idea objects
export interface Idea {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  isSelected: boolean;
  implementation?: string;
  aiRating?: number;
  tags?: string[];
  inspirationSource?: string;
}

// Update the ProblemCategory interface to match what's used in the component
export interface ProblemCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  examples: string[];
  promptTemplates: string[];
}

// Initial state with empty values
const INITIAL_STATE: BrainstormState = {
  problemStatement: '',
  ideaCategory: '',
  ideas: [],
  selectedIdea: null,
  implementation: '',
  isComplete: false,
  aiPersonality: 'balanced',
  customNotes: '',
  lastUpdated: new Date().toISOString()
};

// Challenge steps
enum STEPS {
  PROBLEM_DEFINITION = 0,
  IDEA_GENERATION = 1,
  IDEA_SELECTION = 2,
  IMPLEMENTATION_PLAN = 3,
  COMPLETION = 4
}

// Update the PROBLEM_CATEGORIES array type annotation
const PROBLEM_CATEGORIES: ProblemCategory[] = [
  {
    id: 'business-growth',
    label: 'Business Growth',
    icon: '📈',
    description: 'Challenges related to scaling your business, entering new markets, or increasing revenue',
    examples: [
      'How can we increase our market share in a saturated industry?',
      'What strategies could help us expand to international markets?',
      'How might we develop new revenue streams for our existing customer base?'
    ],
    promptTemplates: [
      "Our [business type] needs to increase [growth metric] by [target percentage]. How might we achieve this while maintaining [core value]?",
      "We're struggling to expand beyond [current market]. What innovative approaches could help us reach [target market] successfully?"
    ]
  },
  {
    id: 'customer-experience',
    label: 'Customer Experience',
    icon: '🤝',
    description: 'Issues related to improving customer satisfaction, loyalty, and overall experience',
    examples: [
      'How can we reduce customer churn rate?',
      'What can we do to improve our Net Promoter Score?',
      'How might we create a more personalized customer journey?'
    ],
    promptTemplates: [
      "Our customers are experiencing friction when they try to [specific action]. How might we streamline this process?",
      "We've received feedback that our [product/service] feels [negative descriptor]. What solutions could make it more [positive descriptor]?"
    ]
  },
  {
    id: 'innovation',
    label: 'Innovation & Product Development',
    icon: '💡',
    description: 'Challenges around developing new products, features, or business models',
    examples: [
      'How might we incorporate AI into our existing product line?',
      'What new features would add the most value to our core offering?',
      'How can we develop a more sustainable version of our product?'
    ],
    promptTemplates: [
      "Our industry is being disrupted by [new technology/trend]. How might we leverage this to create something innovative?",
      "We need to reinvent our [product/service] to meet changing customer needs around [specific trend]. What approaches should we consider?"
    ]
  },
  {
    id: 'operational-efficiency',
    label: 'Operational Efficiency',
    icon: '⚙️',
    description: 'Problems related to streamlining processes, reducing costs, or improving productivity',
    examples: [
      'How can we reduce our production costs without sacrificing quality?',
      'What processes could be automated to improve efficiency?',
      'How might we optimize our supply chain to reduce delays?'
    ],
    promptTemplates: [
      "Our [specific process] is taking too long and costing us [resource cost]. How might we make it more efficient?",
      "We're experiencing bottlenecks in our [department/process]. What solutions could help us increase throughput by [target percentage]?"
    ]
  },
  {
    id: 'team-collaboration',
    label: 'Team Collaboration',
    icon: '👥',
    description: 'Challenges related to improving teamwork, communication, or company culture',
    examples: [
      'How can we improve communication between remote and in-office teams?',
      'What strategies would help us build a more inclusive workplace?',
      'How might we foster more cross-departmental collaboration?'
    ],
    promptTemplates: [
      "Our [team/department] is struggling with [specific challenge] when trying to collaborate. How might we solve this?",
      "We need to improve [aspect of company culture] while accommodating our [specific work arrangement]. What approaches could work?"
    ]
  },
  {
    id: 'marketing-outreach',
    label: 'Marketing & Outreach',
    icon: '📣',
    description: 'Problems related to reaching new customers, improving brand awareness, or marketing effectiveness',
    examples: [
      'How can we cut through the noise in our highly competitive market?',
      'What channels would be most effective for reaching our target demographic?',
      'How might we create more engaging content for our audience?'
    ],
    promptTemplates: [
      "Our marketing efforts in [channel] aren't resonating with [target audience]. How might we create more compelling messaging?",
      "We need to increase brand awareness among [demographic] without increasing our budget. What creative approaches could work?"
    ]
  },
  {
    id: 'sustainability',
    label: 'Sustainability & Social Impact',
    icon: '🌿',
    description: 'Challenges around environmental sustainability, social responsibility, or ethical business practices',
    examples: [
      'How can we reduce our carbon footprint across operations?',
      'What initiatives would create meaningful social impact aligned with our brand?',
      'How might we redesign our packaging to be more sustainable?'
    ],
    promptTemplates: [
      "We want to reduce [environmental impact] in our [business area] while maintaining [business requirement]. What approaches should we consider?",
      "Our customers increasingly care about [sustainability issue]. How might we address this while still [business objective]?"
    ]
  },
  {
    id: 'custom',
    label: 'Custom Problem',
    icon: '✏️',
    description: 'Define your own unique challenge or problem statement',
    examples: [],
    promptTemplates: []
  }
];

// Enhanced creative techniques for idea generation
const CREATIVITY_TECHNIQUES = [
  {
    id: 'reverse-thinking',
    name: 'Reverse Thinking',
    description: 'Approach the problem from the opposite direction. Instead of asking "How do we solve X?", ask "How could we make X worse?" Then reverse those ideas.',
    example: 'For customer retention, first list ways to lose customers, then reverse each point to find solutions.'
  },
  {
    id: 'analogical-thinking',
    name: 'Analogical Thinking',
    description: 'Borrow solutions from unrelated fields or industries and apply them to your problem.',
    example: 'How might healthcare appointment systems be applied to improve restaurant reservations?'
  },
  {
    id: 'scamper',
    name: 'SCAMPER Method',
    description: 'Systematically modify aspects of your problem using prompts: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse.',
    example: 'For a product redesign: What materials could we substitute? What features could we combine?'
  },
  {
    id: 'future-backward',
    name: 'Future Backward',
    description: 'Imagine the perfect solution already exists in the future. Work backward to determine what steps would lead there.',
    example: 'Envision your problem solved perfectly 5 years from now, then map what happened each year to reach that point.'
  },
  {
    id: 'provocation',
    name: 'Provocation Technique',
    description: 'Make deliberately unreasonable or impossible statements about your problem, then explore the consequences.',
    example: 'What if customers paid us to view our advertisements? What insights does this impossible scenario reveal?'
  }
];

// Function to save brainstorming data with enhanced error handling
const saveBrainstormData = (data: BrainstormState): void => {
  try {
    // Update the timestamp before saving
    const updatedData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Call the user data manager to save the data
    saveChallengeBrainstorm(
      'brainstorm-buddy',
      updatedData.problemStatement,
      updatedData.ideaCategory,
      updatedData.selectedIdea ? {
        title: updatedData.selectedIdea.title,
        description: updatedData.selectedIdea.description
      } : { title: '', description: '' },
      updatedData.implementation
    );
    
    // Also save to localStorage as a backup
    localStorage.setItem('brainstorm_backup_data', JSON.stringify(updatedData));
    
    console.log('Brainstorm data saved successfully');
  } catch (error) {
    console.error('Error saving brainstorm data:', error);
    // Attempt recovery from backup if primary save fails
    localStorage.setItem('brainstorm_backup_data', JSON.stringify(data));
  }
};

// Enhanced idea generation with more creative parameters
const generateIdeas = (problem: string, category: string, personality: AIPersonality = 'balanced'): Promise<Idea[]> => {
  return new Promise((resolve) => {
    // Simulating API delay
    setTimeout(() => {
      // Personality adjustments to shape idea generation
      const getPersonalityAdjustment = (personality: AIPersonality) => {
        switch (personality) {
          case 'creative':
            return {
              divergence: 'highly diverse and unconventional ideas',
              tone: 'enthusiastic and imaginative',
              emphasis: 'novel approaches that break conventional thinking'
            };
          case 'analytical':
            return {
              divergence: 'methodical and research-backed ideas',
              tone: 'data-driven and logical',
              emphasis: 'proven frameworks and systematic solutions'
            };
          case 'optimistic':
            return {
              divergence: 'opportunity-focused ideas with high potential',
              tone: 'positive and growth-oriented',
              emphasis: 'possibilities and upside scenarios'
            };
          case 'critical':
            return {
              divergence: 'robust ideas that anticipate challenges',
              tone: 'cautious and thorough',
              emphasis: 'risk mitigation and pragmatic solutions'
            };
          default:
            return {
              divergence: 'balanced mix of creative and practical ideas',
              tone: 'objective and constructive',
              emphasis: 'both innovative and implementable solutions'
            };
        }
      };
      
      const personalityStyle = getPersonalityAdjustment(personality);

      // Generate sample ideas with personality influence
      const dummyIdeas: Idea[] = [
        {
          id: `idea-${Date.now()}-1`,
          title: `Enhanced Digital Integration Solution for ${category}`,
          description: `A comprehensive approach that leverages emerging technologies to address the core issues in "${problem}". This solution utilizes ${personalityStyle.emphasis} to create measurable impact with minimal disruption.`,
          pros: [
            'Leverages existing infrastructure with minimal new investment',
            'Provides immediate value while scaling for future needs',
            'Addresses both short-term and long-term objectives'
          ],
          cons: [
            'Requires initial technical training for team members',
            'May need periodic refinement as requirements evolve',
            'Best results come after 2-3 iteration cycles'
          ],
          isSelected: false,
          aiRating: 87,
          tags: ['technology', 'scalable', 'integration'],
          inspirationSource: 'Similar implementation in adjacent industry'
        },
        {
          id: `idea-${Date.now()}-2`,
          title: `Stakeholder-Centric Redesign Model`,
          description: `A radical reimagining of the approach to "${problem}" that puts key stakeholders at the center of the solution design process. This ${personalityStyle.tone} methodology ensures alignment while driving innovation.`,
          pros: [
            'Creates strong buy-in from all participants',
            'Surfaces hidden requirements early in the process',
            'Results in solutions with higher adoption rates'
          ],
          cons: [
            'Requires more initial coordination',
            'Process may take longer in the planning phase',
            'Needs skilled facilitation for best results'
          ],
          isSelected: false,
          aiRating: 91,
          tags: ['collaborative', 'human-centered', 'stakeholder'],
          inspirationSource: 'Design thinking framework with enhancements'
        },
        {
          id: `idea-${Date.now()}-3`,
          title: `Phased Implementation Framework`,
          description: `A structured, incremental approach to solving "${problem}" through clearly defined phases with measurable milestones. This ${personalityStyle.divergence} ensures controlled progress with opportunities for adjustment.`,
          pros: [
            'Reduces risk through smaller, manageable components',
            'Provides early wins and momentum',
            'Allows for course correction between phases'
          ],
          cons: [
            'Requires detailed planning upfront',
            'May extend overall timeline compared to all-at-once approaches',
            'Needs clear handoffs between phases'
          ],
          isSelected: false,
          aiRating: 84,
          tags: ['structured', 'milestone-based', 'phased'],
          inspirationSource: 'Agile methodology adapted to this context'
        },
        {
          id: `idea-${Date.now()}-4`,
          title: `Cross-Functional Innovation Team`,
          description: `Establish a dedicated team with diverse expertise specifically focused on solving "${problem}". This approach brings ${personalityStyle.emphasis} through interdisciplinary collaboration.`,
          pros: [
            'Brings diverse perspectives to complex challenges',
            'Creates ownership of the solution across departments',
            'Develops organizational capabilities for future challenges'
          ],
          cons: [
            'Requires resource allocation from multiple departments',
            'Needs clear leadership and direction',
            'May face initial alignment challenges'
          ],
          isSelected: false,
          aiRating: 89,
          tags: ['team-based', 'collaborative', 'interdisciplinary'],
          inspirationSource: 'Successful innovation labs in leading organizations'
        },
        {
          id: `idea-${Date.now()}-5`,
          title: `Adaptive Community Engagement Platform`,
          description: `A dynamic system that continuously gathers and responds to input related to "${problem}". This ${personalityStyle.tone} solution ensures relevance through ongoing adaptation.`,
          pros: [
            'Creates continuous improvement feedback loop',
            'Builds stronger relationships with key stakeholders',
            'Identifies emerging issues before they become problems'
          ],
          cons: [
            'Requires consistent attention and management',
            'Needs clear processes for incorporating feedback',
            'Benefits may take time to fully realize'
          ],
          isSelected: false,
          aiRating: 82,
          tags: ['engagement', 'feedback-driven', 'adaptive'],
          inspirationSource: 'Community-based innovation platforms'
        }
      ];
      
      resolve(dummyIdeas);
    }, 2000);
  });
};

// Enhanced implementation plan generation
const generateImplementation = (idea: Idea, problem: string, personality: AIPersonality = 'balanced'): Promise<string> => {
  return new Promise((resolve) => {
    // Simulating API delay
    setTimeout(() => {
      // Personality adjustments for implementation plans
      const getToneByPersonality = (personality: AIPersonality) => {
        switch (personality) {
          case 'creative':
            return 'innovative and forward-thinking';
          case 'analytical':
            return 'methodical and evidence-based';
          case 'optimistic':
            return 'opportunity-focused and growth-oriented';
          case 'critical':
            return 'thorough and risk-aware';
          default:
            return 'balanced and practical';
        }
      };
      
      const tone = getToneByPersonality(personality);
      
      // Create implementation plan based on idea and problem
      const implementation = `
# Implementation Plan: ${idea.title}

## Executive Summary
This ${tone} implementation plan addresses "${problem}" through a structured approach based on "${idea.description}". 

## Phase 1: Foundation (Weeks 1-4)
- **Week 1-2:** Conduct stakeholder analysis and form a cross-functional implementation team
- **Week 3:** Develop detailed requirements and success metrics
- **Week 4:** Create resource allocation plan and secure necessary approvals

## Phase 2: Development (Weeks 5-12)
- **Weeks 5-6:** Design detailed solution architecture
- **Weeks 7-9:** Develop core components through iterative sprints
- **Weeks 10-12:** Integrate components and conduct initial testing

## Phase 3: Implementation (Weeks 13-16)
- **Week 13:** Conduct user training and prepare support materials
- **Week 14:** Implement pilot with selected users/departments
- **Weeks 15-16:** Gather feedback and make necessary adjustments

## Phase 4: Scaling & Optimization (Weeks 17-24)
- **Weeks 17-18:** Roll out to all users/departments
- **Weeks 19-20:** Monitor performance and address emerging issues
- **Weeks 21-24:** Optimize based on usage data and stakeholder feedback

## Resource Requirements
- **Team:** Project manager, subject matter experts from key departments, technical implementation specialists
- **Budget:** Estimated $XX,XXX (detailed breakdown available in appendix)
- **Tools:** Project management software, collaboration platform, specialized tools for implementation

## Risk Management
| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|------------|---------------------|
| Stakeholder resistance | High | Medium | Early involvement, clear communication of benefits |
| Resource constraints | Medium | Medium | Phased implementation, prioritization of components |
| Technical challenges | Medium | Low | Proof of concept testing, expert consultation |

## Success Metrics
- **Short-term:** Successful completion of all phases within timeline
- **Medium-term:** [Specific metrics related to problem]
- **Long-term:** [Broader organizational benefits]

## Conclusion
This implementation plan provides a structured, ${tone} approach to addressing "${problem}" that balances thoroughness with practicality. The phased approach allows for adjustments as necessary while maintaining momentum toward the solution.
`;
      
      resolve(implementation);
    }, 2000);
  });
};

const BrainstormBuddyMain: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.PROBLEM_DEFINITION);
  const [state, setState] = useState<BrainstormState>(INITIAL_STATE);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [funFact, setFunFact] = useState<string>('');
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  
  // Enhanced brainstorming facts
  const BRAINSTORMING_FACTS = [
    "Studies show that 'brainwriting' (where ideas are written down before discussion) produces 42% more ideas than traditional brainstorming.",
    "The term 'brainstorming' was coined in 1953 by advertising executive Alex Osborn in his book 'Applied Imagination'.",
    "Research shows that taking breaks actually improves creative thinking. The 'incubation period' allows your brain to form new connections.",
    "The most innovative companies generate 6-10 ideas for every one they implement, recognizing that quantity often leads to quality.",
    "Studies from Stanford show that walking can increase creative output by up to 60% compared to sitting.",
    "The 'first-to-mind penalty' means our initial ideas are usually the most obvious and least innovative.",
    "Groups that encourage 'building on ideas' generate 25% more practical innovations than those focused on individual ideation.",
    "The brain's 'default mode network' activates during relaxation and is linked to creative insights and 'Aha!' moments.",
    "MIT research shows diverse teams produce more innovative solutions than homogeneous ones, even when individual expertise is equivalent.",
    "Companies using structured innovation processes are 30% more likely to disrupt their industries than those relying on spontaneous innovation."
  ];
  
  // Load a random brainstorming fact when the component mounts
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * BRAINSTORMING_FACTS.length);
    setFunFact(BRAINSTORMING_FACTS[randomIndex]);
    
    // Check for saved work in progress
    const savedData = localStorage.getItem('brainstorm_backup_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Only restore if work was saved less than 24 hours ago
        const lastUpdated = new Date(parsedData.lastUpdated || Date.now());
        const timeElapsed = Date.now() - lastUpdated.getTime();
        if (timeElapsed < 24 * 60 * 60 * 1000) {
          setState(parsedData);
          // Set the appropriate step based on saved data
          if (parsedData.isComplete) {
            setCurrentStep(STEPS.COMPLETION);
          } else if (parsedData.implementation) {
            setCurrentStep(STEPS.IMPLEMENTATION_PLAN);
          } else if (parsedData.selectedIdea) {
            setCurrentStep(STEPS.IDEA_SELECTION);
          } else if (parsedData.ideas && parsedData.ideas.length > 0) {
            setCurrentStep(STEPS.IDEA_GENERATION);
          } else if (parsedData.problemStatement) {
            setCurrentStep(STEPS.PROBLEM_DEFINITION);
          }
        }
      } catch (error) {
        console.error('Error restoring saved brainstorm session:', error);
      }
    }
  }, []);
  
  // Update state and save
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
    updateState({ 
      ideaCategory: categoryId,
      // Reset ideas if category changes
      ideas: categoryId !== state.ideaCategory ? [] : state.ideas
    });
  };
  
  // Handle AI personality selection
  const handlePersonalitySelect = (personality: AIPersonality) => {
    updateState({ aiPersonality: personality });
  };
  
  // Enhanced idea generation with AI personality
  const handleGenerateIdeas = async () => {
    if (!state.problemStatement || !state.ideaCategory) {
      setError('Please define your problem and select a category first.');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      const ideas = await generateIdeas(state.problemStatement, state.ideaCategory, state.aiPersonality);
      updateState({ ideas });
      
      // Show a new fact when generating ideas
      const randomIndex = Math.floor(Math.random() * BRAINSTORMING_FACTS.length);
      setFunFact(BRAINSTORMING_FACTS[randomIndex]);
      
      setCurrentStep(STEPS.IDEA_GENERATION);
    } catch (error) {
      console.error('Error generating ideas:', error);
      setError('Failed to generate ideas. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle idea selection
  const handleSelectIdea = (idea: Idea) => {
    // First reset all ideas to not selected
    const updatedIdeas = state.ideas.map(i => ({
      ...i,
      isSelected: i.id === idea.id
    }));
    
    // Then update state with the selected idea
    updateState({
      ideas: updatedIdeas,
      selectedIdea: idea
    });
    
    setCurrentStep(STEPS.IDEA_SELECTION);
  };
  
  // Enhanced implementation plan generation with AI personality
  const handleGenerateImplementation = async () => {
    if (!state.selectedIdea) {
      setError('Please select an idea first.');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      const implementation = await generateImplementation(
        state.selectedIdea, 
        state.problemStatement,
        state.aiPersonality
      );
      
      updateState({ implementation });
      
      // Show a new fact when generating implementation
      const randomIndex = Math.floor(Math.random() * BRAINSTORMING_FACTS.length);
      setFunFact(BRAINSTORMING_FACTS[randomIndex]);
      
      setCurrentStep(STEPS.IMPLEMENTATION_PLAN);
    } catch (error) {
      console.error('Error generating implementation plan:', error);
      setError('Failed to generate implementation plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle custom notes update
  const handleNotesChange = (notes: string) => {
    updateState({ customNotes: notes });
  };
  
  // Complete the challenge
  const handleComplete = () => {
    updateState({ 
      isComplete: true,
      lastUpdated: new Date().toISOString()
    });
    
    setCurrentStep(STEPS.COMPLETION);
  };
  
  // Navigate to the next step
  const handleNext = () => {
    if (currentStep < STEPS.COMPLETION) {
      setCurrentStep(currentStep + 1 as STEPS);
    }
  };
  
  // Navigate to the previous step
  const handleBack = () => {
    if (currentStep > STEPS.PROBLEM_DEFINITION) {
      setCurrentStep(currentStep - 1 as STEPS);
    }
  };
  
  // Restart the challenge
  const handleRestart = () => {
    setState(INITIAL_STATE);
    setCurrentStep(STEPS.PROBLEM_DEFINITION);
    setError('');
    
    // Show a new fact on restart
    const randomIndex = Math.floor(Math.random() * BRAINSTORMING_FACTS.length);
    setFunFact(BRAINSTORMING_FACTS[randomIndex]);
  };
  
  // Get step label based on current step
  const getStepLabel = (step: STEPS): string => {
    switch (step) {
      case STEPS.PROBLEM_DEFINITION: return 'Problem Definition';
      case STEPS.IDEA_GENERATION: return 'Idea Generation';
      case STEPS.IDEA_SELECTION: return 'Idea Selection';
      case STEPS.IMPLEMENTATION_PLAN: return 'Implementation Plan';
      case STEPS.COMPLETION: return 'Challenge Complete';
    }
  };
  
  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.PROBLEM_DEFINITION:
        return (
          <ProblemDefinition
            problemStatement={state.problemStatement}
            selectedCategory={state.ideaCategory}
            onProblemChange={handleProblemChange}
            onCategorySelect={handleCategorySelect}
            onPersonalitySelect={handlePersonalitySelect}
            selectedPersonality={state.aiPersonality}
            onGenerateIdeas={handleGenerateIdeas}
            isGenerating={isGenerating}
            categories={PROBLEM_CATEGORIES}
            error={error}
          />
        );
      case STEPS.IDEA_GENERATION:
      case STEPS.IDEA_SELECTION:
        return (
          <IdeaGeneration
            ideas={state.ideas}
            problemStatement={state.problemStatement}
            selectedCategory={state.ideaCategory}
            onSelectIdea={handleSelectIdea}
            onGenerateImplementation={handleGenerateImplementation}
            onBack={handleBack}
            selectedIdea={state.selectedIdea}
            isGenerating={isGenerating}
            creativityTechniques={CREATIVITY_TECHNIQUES}
            error={error}
          />
        );
      case STEPS.IMPLEMENTATION_PLAN:
        return (
          <ImplementationPlan
            selectedIdea={state.selectedIdea?.title || ''}
            implementationPlan={state.implementation}
            problemStatement={state.problemStatement}
            onComplete={handleComplete}
            onBack={handleBack}
            onUpdateNotes={handleNotesChange}
            customNotes={state.customNotes}
          />
        );
      case STEPS.COMPLETION:
        return (
          <CompletionScreen
            problemStatement={state.problemStatement}
            selectedCategory={
              PROBLEM_CATEGORIES.find(cat => cat.id === state.ideaCategory) || 
              { label: '', icon: '', description: '' }
            }
            selectedIdea={state.selectedIdea || 
              { title: '', description: '', pros: [], cons: [], tags: [] }
            }
            implementationPlan={state.implementation}
            customNotes={state.customNotes}
            selectedPersonality={state.aiPersonality}
            lastUpdated={state.lastUpdated ? new Date(state.lastUpdated) : null}
            onRestart={handleRestart}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };
  
  // Add useEffect to hide the feedback form elements
  useEffect(() => {
    if (currentStep === STEPS.COMPLETION) {
      // Hide the feedback elements after a small delay to ensure they're rendered
      const timeoutId = setTimeout(() => {
        // Targeting by text content
        const hideElementsByText = (text: string) => {
          const elements = Array.from(document.querySelectorAll('h3, h2, div, p, span'));
          elements.forEach(el => {
            if (el.textContent && el.textContent.includes(text)) {
              // Hide the element and its parent
              (el as HTMLElement).style.display = 'none';
              if (el.parentElement) (el.parentElement as HTMLElement).style.display = 'none';
              
              // If it's a header, hide the next elements too (likely the form fields)
              if (el.tagName === 'H2' || el.tagName === 'H3') {
                let nextSibling = el.nextElementSibling;
                while (nextSibling && (nextSibling.tagName === 'INPUT' || nextSibling.tagName === 'TEXTAREA' || nextSibling.tagName === 'BUTTON' || nextSibling.classList.contains('flex'))) {
                  (nextSibling as HTMLElement).style.display = 'none';
                  nextSibling = nextSibling.nextElementSibling;
                }
              }
            }
          });
        };
        
        // Hide elements containing these texts
        hideElementsByText('Share your achievement');
        hideElementsByText('Rate your experience');
        hideElementsByText('Submit feedback');
        
        // Hide star rating elements
        const starElements = document.querySelectorAll('button, span');
        starElements.forEach(el => {
          if (el.textContent && (el.textContent.includes('★') || el.textContent.includes('☆'))) {
            if (el.parentElement) (el.parentElement as HTMLElement).style.display = 'none';
          }
        });
        
        // Hide textareas with specific placeholders
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(el => {
          const textarea = el as HTMLTextAreaElement;
          if (textarea.placeholder && (
              textarea.placeholder.includes('challenge') || 
              textarea.placeholder.includes('achievement') ||
              textarea.placeholder.includes('experience') ||
              textarea.placeholder.includes('feedback')
          )) {
            textarea.style.display = 'none';
            if (textarea.parentElement) (textarea.parentElement as HTMLElement).style.display = 'none';
          }
        });
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentStep]);
  
  // Simplified CSS to hide elements that can be targeted with standard selectors
  const hideStyles = `
    /* Hide elements by common class names and IDs */
    [id*="share"], [class*="share"], 
    [id*="feedback"], [class*="feedback"], 
    [id*="rating"], [class*="rating"], 
    [id*="experience"], [class*="experience"] {
      display: none !important;
    }
  `;
  
  return (
    <div className="container mx-auto max-w-5xl">
      {/* Hide feedback forms */}
      <style dangerouslySetInnerHTML={{ __html: hideStyles }} />
      {/* Tutorial overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Use the Brainstorm Buddy</h2>
            <ol className="list-decimal pl-6 space-y-3 text-gray-700 mb-6">
              <li><strong>Define Your Problem:</strong> Start by clearly stating the problem or challenge you're trying to solve. Select a category that best fits your problem.</li>
              <li><strong>Choose an AI Personality:</strong> Different AI personalities will generate different types of ideas. Choose one that matches your needs.</li>
              <li><strong>Generate Ideas:</strong> Let the AI generate creative ideas based on your problem statement.</li>
              <li><strong>Select the Best Idea:</strong> Review the generated ideas and select the one you want to pursue.</li>
              <li><strong>Create an Implementation Plan:</strong> Get a detailed implementation plan for your chosen idea.</li>
              <li><strong>Add Your Notes:</strong> Customize the plan with your own insights and modifications.</li>
              <li><strong>Complete the Challenge:</strong> Review your solution and save your work.</li>
            </ol>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowTutorial(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header with tutorial button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-600">AI Brainstorm Buddy</h1>
        <button
          onClick={() => setShowTutorial(true)}
          className="px-4 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          How it works
        </button>
      </div>
      
      {/* Progress steps */}
      {currentStep < STEPS.COMPLETION && (
        <div className="mb-8">
          <div className="flex mb-2">
            {Object.values(STEPS).filter(step => typeof step === 'number' && step < STEPS.COMPLETION).map((step) => (
              <div key={step} className="flex-1 relative">
                <div 
                  className={`h-2 ${
                    Number(step) < currentStep 
                      ? 'bg-blue-500' 
                      : Number(step) === currentStep 
                        ? 'bg-blue-300' 
                        : 'bg-gray-200'
                  }`}
                />
                <div 
                  className={`w-8 h-8 rounded-full absolute top-[-12px] ${
                    Number(step) <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  } flex items-center justify-center text-sm font-medium`}
                  style={{ left: step === 0 ? 0 : '50%', transform: step === 0 ? 'none' : 'translateX(-50%)' }}
                >
                  {Number(step) + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 px-4">
            <span>Define</span>
            <span>Generate</span>
            <span>Select</span>
            <span>Implement</span>
          </div>
        </div>
      )}
      
      {/* Current step title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{getStepLabel(currentStep)}</h2>
        <p className="text-sm text-gray-500">Step {currentStep + 1} of {STEPS.COMPLETION}</p>
      </div>
      
      {/* Fun fact box */}
      {currentStep < STEPS.COMPLETION && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <div className="text-blue-500 text-xl mr-3">💡</div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Brainstorming Insight</h3>
              <p className="text-blue-700 text-sm">{funFact}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Current step content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default BrainstormBuddyMain; 