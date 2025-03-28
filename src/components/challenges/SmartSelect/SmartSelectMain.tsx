import React, { useState } from 'react';
import { ScenarioSelection } from './components/ScenarioSelection';
import { ModelComparison } from './components/ModelComparison';
import { ComparisonAnalysis } from './components/ComparisonAnalysis';
import { FollowupQuestions } from './components/FollowupQuestions';

// Define the steps in the AI Smart Select challenge
enum STEPS {
  SCENARIO_SELECTION = 0,
  MODEL_COMPARISON = 1,
  ANALYSIS = 2,
  FOLLOWUP = 3
}

// Define model types
export type ModelType = 'basic' | 'advanced' | 'expert';

// Define business scenario interface
export interface BusinessScenario {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  complexity: 'low' | 'medium' | 'high';
}

// Define model response interface
export interface ModelResponse {
  modelType: ModelType;
  modelName: string;
  response: string;
  responseTime: number; // in seconds
  confidence: number; // 0-100
  timestamp: string;
}

// Define user analysis interface
export interface UserAnalysis {
  selectedModel: ModelType;
  reasonForSelection: string;
  keyDifferences: string[];
  notedStrengths: string[];
  notedWeaknesses: string[];
}

// Define application state
export interface SmartSelectState {
  currentStep: STEPS;
  selectedScenario: BusinessScenario | null;
  modelResponses: Record<ModelType, ModelResponse | null>;
  userAnalysis: UserAnalysis | null;
  followupResponses: Record<ModelType, string | null>;
  isLoading: boolean;
  error: string | null;
}

// Sample business scenarios
export const SAMPLE_SCENARIOS: BusinessScenario[] = [
  {
    id: 'market-expansion',
    title: 'Market Expansion Strategy',
    description: 'Analyze potential markets for a tech product expansion',
    prompt: 'Our technology company is considering expanding our cloud-based project management software into new markets. We currently serve small to medium businesses in North America. Which three markets should we consider next, and what key factors should inform our decision?',
    category: 'Strategy',
    complexity: 'medium'
  },
  {
    id: 'customer-churn',
    title: 'Customer Churn Reduction',
    description: 'Identify strategies to reduce customer churn',
    prompt: 'Our subscription-based service has seen an increase in customer churn over the past quarter. The churn rate has risen from 5% to 8%. What are the most likely causes of this increase, and what three strategies would you recommend to address this issue?',
    category: 'Customer Success',
    complexity: 'medium'
  },
  {
    id: 'pricing-strategy',
    title: 'Pricing Strategy Optimization',
    description: 'Determine optimal pricing for a new service',
    prompt: 'We are launching a new premium tier of our existing software service. The current basic plan is $10/month and has 100,000 users. The premium tier will include advanced analytics, priority support, and custom integrations. How should we price this premium tier, and what factors should we consider in making this decision?',
    category: 'Marketing',
    complexity: 'high'
  },
  {
    id: 'supply-chain',
    title: 'Supply Chain Risk Assessment',
    description: 'Evaluate and mitigate supply chain risks',
    prompt: 'Our manufacturing business relies on components from suppliers in five different countries. We\'ve experienced delays and quality issues in recent months. How should we assess the risks in our supply chain, and what specific steps can we take to improve reliability while managing costs?',
    category: 'Operations',
    complexity: 'high'
  },
  {
    id: 'talent-acquisition',
    title: 'Talent Acquisition Strategy',
    description: 'Develop strategy for attracting key talent',
    prompt: 'Our tech startup is growing rapidly and needs to hire 20 engineers within the next six months. We\'re competing against larger tech companies with bigger budgets in a competitive job market. What strategies should we implement to attract and retain top engineering talent?',
    category: 'Human Resources',
    complexity: 'medium'
  }
];

// Initial state for the component
const createInitialState = (): SmartSelectState => {
  return {
    currentStep: STEPS.SCENARIO_SELECTION,
    selectedScenario: null,
    modelResponses: {
      basic: null,
      advanced: null,
      expert: null
    },
    userAnalysis: null,
    followupResponses: {
      basic: null,
      advanced: null,
      expert: null
    },
    isLoading: false,
    error: null
  };
};

// Sample AI model descriptions
export const MODEL_DESCRIPTIONS = {
  basic: {
    name: "QuickAnswer AI",
    description: "A fast, pattern-matching model that provides concise responses based on recognized patterns in data. Ideal for straightforward questions with clear answers.",
    strengths: ["Speed", "Conciseness", "Good for factual queries"],
    limitations: ["Limited reasoning", "May oversimplify complex problems", "Less contextual awareness"]
  },
  advanced: {
    name: "AnalystPro AI",
    description: "A balanced model with enhanced reasoning capabilities that can analyze scenarios and provide nuanced responses. Good for business analysis with moderate complexity.",
    strengths: ["Balance of speed and depth", "Better reasoning capabilities", "Good contextual understanding"],
    limitations: ["Not as fast as basic models", "May struggle with highly complex scenarios", "Occasional reasoning errors"]
  },
  expert: {
    name: "StrategistGPT",
    description: "A sophisticated model with advanced reasoning capabilities, designed for complex strategic analysis. Provides in-depth responses with multiple perspectives and considerations.",
    strengths: ["Advanced reasoning", "Nuanced multi-factor analysis", "Consideration of edge cases"],
    limitations: ["Slower response time", "More compute-intensive", "Sometimes provides excessive detail"]
  }
};

// Main component
const SmartSelectMain: React.FC = () => {
  // State management
  const [state, setState] = useState<SmartSelectState>(createInitialState());
  
  // Update state helper
  const updateState = (newState: Partial<SmartSelectState>) => {
    setState(prevState => ({
      ...prevState,
      ...newState
    }));
  };
  
  // Navigation methods
  const goToNextStep = () => {
    if (state.currentStep < STEPS.FOLLOWUP) {
      updateState({ currentStep: state.currentStep + 1 });
    }
  };
  
  const goToPreviousStep = () => {
    if (state.currentStep > STEPS.SCENARIO_SELECTION) {
      updateState({ currentStep: state.currentStep - 1 });
    }
  };
  
  const goToStep = (step: STEPS) => {
    updateState({ currentStep: step });
  };
  
  // Select a scenario
  const selectScenario = (scenario: BusinessScenario) => {
    updateState({ 
      selectedScenario: scenario,
      isLoading: true
    });
    
    // Simulate API calls to different models
    setTimeout(() => {
      const basicResponse: ModelResponse = {
        modelType: 'basic',
        modelName: MODEL_DESCRIPTIONS.basic.name,
        response: generateBasicResponse(scenario),
        responseTime: 1.2,
        confidence: 85,
        timestamp: new Date().toISOString()
      };
      
      updateState({
        modelResponses: {
          ...state.modelResponses,
          basic: basicResponse
        }
      });
      
      // Advanced model takes a bit longer
      setTimeout(() => {
        const advancedResponse: ModelResponse = {
          modelType: 'advanced',
          modelName: MODEL_DESCRIPTIONS.advanced.name,
          response: generateAdvancedResponse(scenario),
          responseTime: 3.5,
          confidence: 92,
          timestamp: new Date().toISOString()
        };
        
        updateState({
          modelResponses: {
            ...state.modelResponses,
            advanced: advancedResponse
          },
          isLoading: false
        });
        
        // Auto-advance to next step after both responses are loaded
        goToNextStep();
      }, 2300);
    }, 1000);
  };
  
  // Submit user analysis
  const submitAnalysis = (analysis: UserAnalysis) => {
    updateState({ userAnalysis: analysis });
    goToNextStep();
  };
  
  // Submit followup question
  const submitFollowupQuestion = (question: string) => {
    updateState({ isLoading: true });
    
    // Simulate API calls for followup
    setTimeout(() => {
      const followups = {
        basic: generateFollowupResponse('basic', question, state.selectedScenario),
        advanced: generateFollowupResponse('advanced', question, state.selectedScenario)
      };
      
      updateState({
        followupResponses: {
          ...state.followupResponses,
          ...followups
        },
        isLoading: false
      });
    }, 2000);
  };
  
  // Reset the challenge
  const handleRestart = () => {
    setState(createInitialState());
  };
  
  // Generate response for basic model (simplified pattern matching)
  const generateBasicResponse = (scenario: BusinessScenario): string => {
    switch (scenario.id) {
      case 'market-expansion':
        return `Based on current market trends, the three markets to consider expanding into are:

1. Western Europe
2. Australia
3. Japan

These markets have high technology adoption rates and similar business cultures to North America. Consider factors like market size, competition, and regulatory environment before making a final decision.`;
        
      case 'customer-churn':
        return `The likely causes of increased churn are:
        
1. Price increases
2. New competitors
3. Service quality issues

To address this, consider:
1. Offer loyalty discounts
2. Improve customer support
3. Add new features to stay competitive`;
        
      case 'pricing-strategy':
        return `For the premium tier pricing, I recommend $25/month.

This is 2.5x the basic tier which is standard for premium offerings. Factors to consider include:
- Competitive pricing
- Value of new features
- Customer willingness to pay
- Cost of providing premium features`;
        
      case 'supply-chain':
        return `To assess supply chain risks:
        
1. Identify critical components and suppliers
2. Evaluate on-time delivery and quality metrics
3. Check for geographic concentration

Steps to improve:
1. Find backup suppliers
2. Increase inventory of critical components
3. Implement quality control procedures
4. Consider local sourcing where possible`;
        
      case 'talent-acquisition':
        return `Strategies to attract engineering talent:
        
1. Offer competitive salaries and benefits
2. Provide equity options
3. Emphasize challenging work and growth opportunities
4. Create a positive company culture
5. Offer remote work flexibility
6. Use employee referral programs`;
        
      default:
        return "I've analyzed your scenario and have provided a straightforward answer based on common business patterns and best practices.";
    }
  };
  
  // Generate response for advanced model (more reasoning and nuance)
  const generateAdvancedResponse = (scenario: BusinessScenario): string => {
    switch (scenario.id) {
      case 'market-expansion':
        return `Based on a comprehensive analysis of global markets for cloud-based project management software, I recommend considering these three markets for expansion:

1. **United Kingdom & Ireland**: 
   - High cloud adoption rates (76% of businesses)
   - English language compatibility minimizes localization costs
   - Strong SMB sector with 5.9 million SMBs (99% of all businesses)
   - Post-Brexit regulatory environment may require separate compliance strategies

2. **Germany & DACH Region**:
   - Largest European economy with growing SaaS adoption (+21% YoY)
   - Strong manufacturing and engineering sectors that benefit from project management tools
   - Higher price tolerance for quality software solutions
   - Requires investment in localization and compliance with stricter data privacy laws

3. **Australia & New Zealand**:
   - Cultural and language similarities ease market entry
   - High technology adoption rates
   - Counter-cyclical business seasons to North America can smooth revenue
   - Growing SMB sector with government initiatives supporting digital transformation

Key decision factors to consider:
- **Market readiness**: Evaluate cloud adoption rates and digital transformation maturity
- **Competitive landscape**: Assess local alternatives and existing competitors' market share
- **Regulatory compliance**: Consider data sovereignty requirements and privacy regulations (esp. GDPR in Europe)
- **Localization needs**: Language, currency, payment methods, and cultural business practices
- **Customer acquisition costs**: Marketing channels effectiveness varies by region
- **Support infrastructure**: Time zone coverage and language support requirements

I would recommend a phased approach, starting with the UK market as it offers the lowest barriers to entry while providing a foothold in the European region.`;
        
      case 'customer-churn':
        return `The increase in churn rate from 5% to 8% represents a 60% relative increase, which requires immediate attention. Based on typical patterns in subscription businesses, here's my analysis:

**Most Likely Causes:**

1. **Product-Market Fit Degradation**:
   - Your value proposition may no longer align with evolving customer needs
   - Feature gaps compared to newer competitors
   - User experience issues or technical debt manifesting as friction

2. **Competitive Pressure**:
   - New market entrants with aggressive pricing or innovative features
   - Existing competitors improving their offerings
   - Promotional offers from competitors targeting your customer base

3. **Customer Success Gaps**:
   - Onboarding may not be effectively demonstrating full product value
   - Customers not achieving expected outcomes or ROI
   - Insufficient proactive engagement before renewal decisions

**Recommended Strategies:**

1. **Implement Predictive Churn Analysis**:
   - Develop a data model using product usage patterns, support interactions, and NPS scores
   - Create an early warning system to identify at-risk accounts 45-60 days before renewal
   - Enable targeted intervention for accounts showing warning signs
   - Measure: Improvement in retention rate for identified at-risk accounts

2. **Value Realization Program**:
   - Develop customer success playbooks tailored to different customer segments
   - Implement regular business reviews showing quantifiable ROI
   - Create automated usage insights reports highlighting value delivered
   - Create personalized feature adoption journeys based on customer use cases
   - Measure: Correlation between feature adoption depth and retention rates

3. **Voice of Customer & Rapid Response**:
   - Conduct exit interviews with all churned customers
   - Implement a "win-back" program with targeted offerings addressing specific departure reasons
   - Accelerate product roadmap items addressing common churn reasons
   - Create a cross-functional "churn task force" with authority to solve customer issues
   - Measure: Reduction in churn reasons related to product gaps or service issues

I recommend beginning with the predictive analysis to immediately identify at-risk accounts while simultaneously conducting deeper research into the specific causes affecting your business.`;
        
      case 'pricing-strategy':
        return `Determining optimal pricing for your new premium tier requires balancing value perception, market positioning, and financial objectives. Here's my strategic analysis:

**Recommended Pricing Structure:**
Based on market benchmarks and the value-added features you've described, I recommend a tiered premium approach:

- **Professional Tier: $24/month** (2.4x basic)
  - Includes advanced analytics and priority support
  - Target: Power users and small teams

- **Enterprise Tier: $39/month** (3.9x basic)
  - Includes everything in Professional plus custom integrations
  - Target: Businesses with complex workflows and integration needs

**Key Factors Influencing This Recommendation:**

1. **Value-Based Pricing Analysis**:
   - Advanced analytics typically commands a 100-150% premium over basic reporting
   - Priority support is valued at 50-75% premium over standard support
   - Custom integrations represent significant value, particularly for businesses with existing tech stacks

2. **Competitive Positioning**:
   - Industry benchmarks show premium tiers of similar products priced at 2-4x basic tiers
   - Two-tiered premium approach allows capturing different willingness-to-pay segments
   - Creates clear differentiation and upgrade path

3. **Psychological Pricing Considerations**:
   - The jump from $10 to $24 feels significant enough to justify premium features
   - Under-$25 price point maintains appeal to SMB segment
   - Enterprise tier at $39 signals premium value without crossing the mental $40 threshold

4. **Unit Economics**:
   - Custom integrations have higher support and maintenance costs
   - Higher tier justifies increased customer acquisition costs
   - Margins should increase with premium tiers despite higher service costs

5. **Growth Strategy**:
   - Consider a 14-day free trial of premium features for existing users
   - Implement a 10% annual discount for annual commitments to reduce churn
   - Create bundle pricing for teams to accelerate expansion revenue

**Implementation Recommendations:**
- Introduce pricing through a beta program offering 20% lifetime discount for early adopters
- Develop clear ROI calculators demonstrating the value of premium features
- Create a seamless upgrade path with preserved settings and data
- Implement cohort analysis to track conversion rates and optimize accordingly

I would suggest A/B testing slightly different price points (±10%) with small segments before full rollout to optimize conversion rates.`;
        
      case 'supply-chain':
        return `Addressing your supply chain challenges requires a systematic approach to risk assessment and strategic improvements. Here's my comprehensive analysis:

**Risk Assessment Framework:**

1. **Component Criticality Matrix**:
   - Map each component based on impact to final product functionality and sourcing difficulty
   - Identify single-source components as highest risk
   - Quantify lead time variability and minimum order quantities
   - Outcome: Prioritized list of components requiring risk mitigation strategies

2. **Supplier Vulnerability Analysis**:
   - Evaluate suppliers on financial stability, geopolitical risk, and disaster exposure
   - Assess quality consistency, communication responsiveness, and scaling capacity
   - Create supplier scorecards with weighted risk factors
   - Outcome: Risk rating for each supplier and identification of concentration risks

3. **Geographic Concentration Mapping**:
   - Visualize supply chain nodes to identify geographic clustering
   - Overlay with geopolitical risk indices, natural disaster probabilities, and logistics disruption data
   - Outcome: Identification of regions requiring diversification

**Specific Improvement Steps:**

1. **Strategic Supplier Diversification**:
   - For highest-risk components, develop at least one alternative supplier in a different geographic region
   - Implement 80/20 split for critical components (80% primary, 20% secondary supplier)
   - Consider nearshoring for components with high logistics complexity
   - Measure: Reduction in single-sourced components by 50% within 6 months

2. **Dynamic Inventory Optimization**:
   - Implement variable safety stock levels based on component risk score
   - Increase buffer inventory for critical, long-lead time items while reducing for stable components
   - Consider vendor-managed inventory programs for standard components
   - Develop consignment arrangements with key suppliers
   - Measure: Improved inventory turns while maintaining 98%+ production availability

3. **Quality Management Integration**:
   - Standardize incoming quality metrics across suppliers
   - Implement statistical process control at supplier manufacturing sites for critical components
   - Develop supplier quality development program with engineering resources
   - Consider supplier consolidation for non-critical components to improve leverage
   - Measure: 30% reduction in quality-related delays within two quarters

4. **Digital Supply Chain Visibility**:
   - Implement real-time tracking for in-transit critical components
   - Develop supplier portal for inventory visibility and production schedules
   - Create automated alert system for delivery exceptions and quality issues
   - Measure: 40% reduction in unexpected supply disruptions

5. **Collaborative Planning**:
   - Establish rolling 12-month forecasts shared with strategic suppliers
   - Develop joint capacity planning for seasonal variations
   - Create incentives for suppliers meeting quality and delivery targets
   - Measure: Improved forecast accuracy and on-time delivery performance

I recommend beginning with the risk assessment to properly prioritize your efforts, followed by implementing the dynamic inventory optimization to address immediate reliability concerns while longer-term strategies are developed.`;
        
      case 'talent-acquisition':
        return `Attracting and retaining 20 engineers in a competitive market against larger competitors requires a differentiated strategy that leverages your strengths as a fast-growing startup. Here's my comprehensive approach:

**Strategic Talent Acquisition Plan:**

1. **Differentiated Value Proposition Development**:
   - Conduct exit interviews with recent engineering hires to identify why they chose your company
   - Survey current engineers on what they value most about your organization
   - Define your "employer brand pillars" based on authentic strengths
   - Create role-specific EVPs highlighting growth trajectory, technology impact, and autonomy
   - Measure: Candidate conversion rates at each funnel stage

2. **Targeted Sourcing Strategy**:
   - Develop ideal candidate personas beyond technical skills, focusing on values and growth orientation
   - Implement a "small pond" strategy targeting engineers from adjacent technologies looking to transition
   - Create dedicated sourcing for underrepresented groups and non-traditional backgrounds
   - Leverage second-degree connections through current engineers (offer significant referral bonuses)
   - Develop relationships with coding bootcamps for junior positions (hire 70/30 experienced/junior)
   - Measure: Diversification of candidate sources and quality of pipeline

3. **Compelling Compensation Architecture**:
   - Structure base pay at 85-90% of big tech but with accelerated equity vesting schedules
   - Implement transparent leveling system with clear growth criteria
   - Create spot bonus program for exceptional project contributions
   - Consider retention equity grants at key milestones (1-year, 2-year)
   - Measure: Offer acceptance rates and compensation-related departures

4. **Engineer-Led Interview Process**:
   - Redesign technical assessment to reflect actual work (take-home over whiteboarding)
   - Train engineers in structured interviewing techniques
   - Implement "values fit" over "culture fit" assessments
   - Reduce time-to-offer to under 7 days from first interview
   - Have CEO meet final candidates to demonstrate organizational commitment
   - Measure: Candidate experience scores and process completion rates

5. **Early Career Engagement Program**:
   - Develop engineering apprenticeship program for promising junior candidates
   - Create formalized mentorship structure pairing new hires with experienced engineers
   - Implement 30-60-90 day onboarding plan focused on meaningful contributions
   - Schedule regular skip-level 1:1s with engineering leadership
   - Measure: Time to productivity and retention rates at 12 months

**Growth & Development Framework:**

- Allocate 20% time for innovation and learning projects
- Create dedicated learning budget for each engineer ($5K/year minimum)
- Develop technical advancement tracks parallel to management paths
- Showcase engineering work through blog posts and conference presentations
- Structure teams to maximize learning and technology exposure

I recommend prioritizing your differentiated value proposition and interview process improvements first, as these will yield the quickest results in your hiring pipeline.`;
        
      default:
        return "After carefully analyzing your scenario, I've considered multiple factors and potential approaches. My recommendation takes into account both the immediate context and broader business implications, providing a nuanced perspective on this complex situation.";
    }
  };
  
  // Generate followup response
  const generateFollowupResponse = (modelType: ModelType, question: string, scenario: BusinessScenario | null): string => {
    if (!scenario) return "";
    
    if (question.toLowerCase().includes('ethical') || question.toLowerCase().includes('risk') || question.toLowerCase().includes('bias')) {
      // Ethical considerations question
      if (modelType === 'basic') {
        return `There are some ethical considerations to using AI for business decisions. These include:

1. Data privacy concerns
2. Potential bias in recommendations
3. Over-reliance on AI without human oversight

Business leaders should always review AI recommendations carefully before implementing them.`;
      } else {
        return `Using AI in business decision-making for this scenario involves several important ethical considerations and risks:

1. **Algorithmic Bias Considerations**:
   - AI models may reflect biases present in the training data or algorithm design
   - Recommendations could inadvertently disadvantage certain groups or markets
   - Geographic or demographic blindspots could lead to missed opportunities
   - Mitigation requires diverse data sources and continuous bias monitoring

2. **Decision Transparency Challenges**:
   - Complex AI reasoning may not be readily explainable to stakeholders
   - Legal and regulatory requirements increasingly demand explainable decisions
   - Hidden assumptions in models may not align with organizational values
   - Important to maintain audit trails of decision inputs and methodology

3. **Data Privacy and Security Risks**:
   - Business analysis often involves sensitive customer and competitive data
   - AI systems may integrate data in ways that create unintended privacy implications
   - Cross-border data considerations add regulatory complexity
   - Robust data governance frameworks are essential

4. **Automation Dependency Risks**:
   - Over-reliance on AI can atrophy human decision-making capabilities
   - Critical thinking and contextual understanding remain essential human contributions
   - System failures or adversarial attacks could create significant disruption
   - Human oversight must be maintained, especially for strategic decisions

5. **Stakeholder Impact Assessment**:
   - AI recommendations may optimize for metrics that don't fully reflect stakeholder interests
   - Ethical frameworks should be explicitly incorporated into evaluation criteria
   - Consider implementing an ethics review process for AI-guided strategic decisions

Best practices include implementing a human-in-the-loop approach, regular algorithmic auditing, diverse perspectives in system design and evaluation, and maintaining clear accountability for decisions regardless of AI involvement.`;
      }
    } else {
      // Generic followup
      if (modelType === 'basic') {
        return `Here's my response to your followup question. I've provided a straightforward answer based on common business patterns and best practices in this area.`;
      } else {
        return `Thank you for your followup question. I've analyzed this additional aspect of your scenario and provided a comprehensive response that considers multiple factors, potential approaches, and implementation considerations. My analysis aims to give you both strategic perspective and practical next steps.`;
      }
    }
  };
  
  // Render the current step based on state
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case STEPS.SCENARIO_SELECTION:
        return (
          <ScenarioSelection
            scenarios={SAMPLE_SCENARIOS}
            onSelectScenario={selectScenario}
          />
        );
      
      case STEPS.MODEL_COMPARISON:
        return (
          <ModelComparison
            scenario={state.selectedScenario}
            responses={state.modelResponses}
            modelDescriptions={MODEL_DESCRIPTIONS}
            onContinue={() => goToNextStep()}
            isLoading={state.isLoading}
          />
        );
      
      case STEPS.ANALYSIS:
        return (
          <ComparisonAnalysis
            scenario={state.selectedScenario}
            responses={state.modelResponses}
            onSubmitAnalysis={submitAnalysis}
          />
        );
      
      case STEPS.FOLLOWUP:
        return (
          <FollowupQuestions
            scenario={state.selectedScenario}
            responses={state.modelResponses}
            followupResponses={state.followupResponses}
            userAnalysis={state.userAnalysis}
            onAskFollowup={submitFollowupQuestion}
            onRestart={handleRestart}
            isLoading={state.isLoading}
          />
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };
  
  // Render progress navigation
  const renderProgressSteps = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {Object.values(STEPS).filter(step => typeof step === 'number').map((step: number) => (
          <React.Fragment key={step}>
            {/* Step button */}
            <button
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${state.currentStep === step
                  ? 'bg-blue-600 text-white'
                  : state.currentStep > step
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-200 text-gray-600'
                }
                ${state.currentStep > step ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
              onClick={() => {
                if (state.currentStep > step) {
                  goToStep(step as STEPS);
                }
              }}
              disabled={state.currentStep <= step}
            >
              {step + 1}
            </button>
            
            {/* Step label */}
            <div className="hidden sm:block ml-2 mr-8 text-sm">
              <div className={state.currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                {Object.keys(STEPS).find(key => STEPS[key as keyof typeof STEPS] === step)?.split('_').join(' ')}
              </div>
            </div>
            
            {/* Connector line */}
            {step < STEPS.FOLLOWUP && (
              <div className={`flex-grow h-1 mx-2 ${state.currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  // Main component render
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AI Smart Select Challenge</h1>
        <p className="text-gray-600 mb-6">
          Compare how different AI models analyze and respond to the same business scenario. 
          Discover which model provides more valuable insights for your business needs.
        </p>
        
        {/* Progress steps */}
        {renderProgressSteps()}
        
        {/* Current step content */}
        <div className="mt-6">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default SmartSelectMain; 