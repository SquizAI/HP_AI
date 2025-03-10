# AI Training Platform Implementation Plan

## Technical Architecture

This document outlines the technical architecture, component structure, and implementation approach for our Duolingo-style AI learning platform.

## Technology Stack

- **Frontend**: React + Tailwind CSS
- **State Management**: Redux + Redux Toolkit
- **Routing**: React Router v6
- **API Integration**: Axios with custom hooks
- **AI Integration**: OpenAI API, Google Gemini API
- **UI Components**: Headless UI + custom components
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel or Netlify

## Folder Structure

```
src/
├── api/                  # API integration
│   ├── aiService.js      # AI API integration
│   ├── userService.js    # User data management
│   └── progressService.js # Progress tracking
│
├── assets/               # Static assets
│   ├── icons/            # Challenge and UI icons
│   ├── images/           # Illustrations and images
│   └── sounds/           # Audio feedback
│
├── components/           # Reusable UI components
│   ├── common/           # Shared UI elements
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ProgressBar.jsx
│   │   └── ...
│   │
│   ├── challenges/       # Challenge-specific components
│   │   ├── ChallengeTile.jsx
│   │   ├── ChallengeHeader.jsx
│   │   ├── PromptBuilder.jsx
│   │   └── ...
│   │
│   └── layout/           # Layout components
│       ├── Dashboard.jsx
│       ├── Navigation.jsx
│       ├── Footer.jsx
│       └── ...
│
├── features/             # Feature modules
│   ├── challenges/       # Challenge implementations
│   │   ├── trendSpotter/
│   │   ├── servicePro/
│   │   ├── communicationCoach/
│   │   └── ...
│   │
│   ├── dashboard/        # Dashboard feature
│   ├── achievements/     # Achievements and points
│   └── profile/          # User profile management
│
├── hooks/                # Custom React hooks
│   ├── useAI.js
│   ├── useProgress.js
│   ├── useChallenge.js
│   └── ...
│
├── store/                # Redux store configuration
│   ├── index.js
│   ├── challengesSlice.js
│   ├── userSlice.js
│   ├── progressSlice.js
│   └── ...
│
├── styles/               # Global styles
│   ├── tailwind.css
│   └── animations.css
│
├── utils/                # Utility functions
│   ├── formatters.js
│   ├── validators.js
│   └── aiPrompts.js
│
├── App.jsx               # Main application component
├── index.jsx             # Entry point
└── routes.jsx            # Application routes
```

## Component Architecture

### Core Components

#### 1. Challenge Engine

The Challenge Engine is responsible for managing the flow of each challenge, including tracking steps, handling user inputs, and interfacing with the AI APIs.

```jsx
// Simplified Challenge Engine
const ChallengeEngine = ({ 
  challengeId, 
  steps, 
  initialState 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [challengeState, setChallengeState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeChallenge();
    }
  };
  
  const handleUpdateState = (newState) => {
    setChallengeState({...challengeState, ...newState});
  };
  
  const CurrentStepComponent = steps[currentStep].component;
  
  return (
    <div className="challenge-container">
      <ChallengeHeader 
        title={steps[currentStep].title} 
        currentStep={currentStep + 1} 
        totalSteps={steps.length} 
      />
      
      <CurrentStepComponent 
        state={challengeState}
        updateState={handleUpdateState}
        onComplete={handleNextStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      
      <ChallengeNavigation 
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={handleNextStep}
        canProgress={steps[currentStep].canProgress(challengeState)}
      />
    </div>
  );
};
```

#### 2. AI Interaction Component

This component handles communication with AI services, including sending prompts, handling responses, and displaying results.

```jsx
// Simplified AI Interaction Component
const AIPromptSender = ({
  prompt,
  onResult,
  isLoading,
  setIsLoading
}) => {
  const sendPrompt = async () => {
    setIsLoading(true);
    try {
      const result = await aiService.sendPrompt(prompt);
      onResult(result);
    } catch (error) {
      console.error("Error sending prompt:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="ai-prompt-container">
      <div className="prompt-preview">
        <h3>We've built a prompt for you:</h3>
        <div className="prompt-box">
          {prompt}
        </div>
      </div>
      
      <Button 
        onClick={sendPrompt} 
        disabled={isLoading}
        className="primary-button"
      >
        {isLoading ? 'Sending...' : 'Send to AI'}
      </Button>
      
      {isLoading && <LoadingIndicator message="AI is working on your request..." />}
    </div>
  );
};
```

#### 3. Progress Tracking

This component manages user progress, points, and achievements.

```jsx
// Progress Tracker (Redux Slice)
const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    completedChallenges: [],
    points: 0,
    level: 1,
    badges: [],
    streak: 0,
    lastActivity: null
  },
  reducers: {
    completeChallenge: (state, action) => {
      const { challengeId, points } = action.payload;
      
      if (!state.completedChallenges.includes(challengeId)) {
        state.completedChallenges.push(challengeId);
        state.points += points;
        
        // Check for level up
        if (state.points >= getLevelThreshold(state.level)) {
          state.level += 1;
        }
      }
      
      // Update activity streak
      const today = new Date().toISOString().split('T')[0];
      if (state.lastActivity !== today) {
        state.streak = state.lastActivity ? state.streak + 1 : 1;
        state.lastActivity = today;
      }
    },
    
    awardBadge: (state, action) => {
      const { badgeId } = action.payload;
      if (!state.badges.includes(badgeId)) {
        state.badges.push(badgeId);
      }
    }
  }
});
```

## Challenge Implementation (Specific Example)

Here's a detailed implementation for the "AI Trend Spotter" challenge:

```jsx
// Challenge configuration
const trendSpotterConfig = {
  id: 'trend-spotter',
  title: 'AI Trend Spotter',
  icon: '🔍',
  difficulty: 'Easy',
  points: 10,
  description: 'Learn to use AI to identify emerging trends and business opportunities',
  learningOutcomes: [
    'Identify future trends in any industry',
    'Evaluate trend impact on businesses',
    'Develop strategic thinking skills'
  ],
  
  steps: [
    {
      id: 'industry-selection',
      title: 'Select an Industry',
      component: IndustrySelector,
      canProgress: (state) => !!state.selectedIndustry
    },
    {
      id: 'prompt-construction',
      title: 'Craft Your AI Prompt',
      component: TrendSpotterPrompt,
      canProgress: (state) => !!state.prompt
    },
    {
      id: 'trend-results',
      title: 'Review AI-Generated Trends',
      component: TrendResults,
      canProgress: (state) => !!state.trends
    },
    {
      id: 'trend-analysis',
      title: 'Select Most Promising Trend',
      component: TrendAnalysis,
      canProgress: (state) => !!state.selectedTrend && !!state.justification
    }
  ],
  
  extensions: [
    {
      id: 'industry-deep-dive',
      title: 'Industry Deep Dive',
      points: 5,
      description: 'Ask AI to identify real companies leveraging the trend you selected'
    },
    {
      id: 'trend-timeline',
      title: 'Trend Timeline',
      points: 5,
      description: 'Ask AI to forecast how this trend will develop over the next 5 years'
    },
    {
      id: 'implementation-strategy',
      title: 'Implementation Strategy',
      points: 5,
      description: 'Ask AI how a business could implement this trend within 90 days'
    }
  ]
};
```

### Industry Selector Component

```jsx
const IndustrySelector = ({ state, updateState, onComplete }) => {
  const industries = [
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'retail', name: 'Retail', icon: '🛍️' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'manufacturing', name: 'Manufacturing', icon: '🏭' }
  ];
  
  const handleSelectIndustry = (industry) => {
    updateState({ selectedIndustry: industry });
  };
  
  return (
    <div className="industry-selector">
      <h2 className="step-title">SELECT AN INDUSTRY</h2>
      
      <div className="industry-grid">
        {industries.map(industry => (
          <IndustryCard
            key={industry.id}
            industry={industry}
            isSelected={state.selectedIndustry?.id === industry.id}
            onSelect={() => handleSelectIndustry(industry)}
          />
        ))}
      </div>
      
      <Button
        onClick={onComplete}
        disabled={!state.selectedIndustry}
        className="continue-button"
      >
        Continue
      </Button>
    </div>
  );
};
```

## State Management

We'll use Redux for global state management with the following main slices:

1. **User Slice**: Manages user authentication and profile
2. **Progress Slice**: Tracks challenge completion, points, and achievements
3. **Challenge Slice**: Manages the current challenge state and history
4. **UI Slice**: Handles UI state like modals, notifications, and theme

Local component state will be used for form inputs and transient UI states.

## API Integration

### AI Service

```javascript
// src/api/aiService.js
import axios from 'axios';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

const aiService = {
  sendPrompt: async (prompt, options = {}) => {
    const { model = 'gpt-3.5-turbo' } = options;
    
    try {
      const response = await axios.post(
        API_URL,
        {
          model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant for business professionals.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
};

export default aiService;
```

## Development Approach

### Phase 1: Foundation (Weeks 1-2)

1. **Project Setup**
   - Create React project with necessary dependencies
   - Set up Tailwind CSS and base styling
   - Configure Redux store and slices
   - Implement routing structure

2. **Core Components**
   - Build reusable UI components (buttons, cards, etc.)
   - Implement Challenge Engine architecture
   - Create AI service integration
   - Build progress tracking system

3. **Dashboard**
   - Implement main dashboard layout
   - Create challenge tile grid
   - Build progress visualization
   - Add streak and achievements display

### Phase 2: First Challenges (Weeks 3-4)

1. **Easy Challenges**
   - Implement Trend Spotter challenge
   - Implement Service Pro challenge
   - Implement Communication Coach challenge
   - Create common UI patterns for challenges

2. **Challenge Navigation**
   - Build step-by-step navigation
   - Add progress indicators
   - Implement completion flow
   - Add "Take It Further" extensions

3. **AI Integration**
   - Fine-tune AI prompts for each challenge
   - Implement response parsing and formatting
   - Add error handling and retry logic
   - Create fallback content for API failures

### Phase 3: Advanced Features (Weeks 5-6)

1. **Medium/Hard Challenges**
   - Implement Data Analyst challenge
   - Implement Biz Strategy challenge
   - Implement Meeting Genius challenge
   - Create advanced challenge interactions

2. **Gamification**
   - Implement points system
   - Add level progression
   - Create badges and achievements
   - Add rewards and unlocks

3. **User Experience**
   - Add animations and transitions
   - Implement sound effects and feedback
   - Create onboarding tutorial
   - Add help and guidance features

### Phase 4: Polishing (Weeks 7-8)

1. **Testing & Bug Fixes**
   - Comprehensive testing across all challenges
   - Fix bugs and edge cases
   - Optimize performance
   - Ensure cross-browser compatibility

2. **Refinement**
   - User testing feedback implementation
   - UX improvements
   - Content and prompt refinement
   - Accessibility enhancements

3. **Deployment**
   - Prepare production build
   - Set up CI/CD pipeline
   - Configure analytics
   - Deploy to production environment

## Testing Strategy

1. **Unit Tests**
   - Test individual components and functions
   - Verify state management logic
   - Test utility functions

2. **Integration Tests**
   - Test challenge flows
   - Verify API integrations
   - Test user progression

3. **E2E Tests**
   - Complete user journeys
   - Challenge completion scenarios
   - Error handling and recovery

## Monitoring and Analytics

1. **User Analytics**
   - Track challenge completion rates
   - Measure time spent on challenges
   - Identify drop-off points
   - Monitor user progression

2. **AI Performance**
   - Track API response times
   - Monitor token usage
   - Measure AI response quality
   - Identify problematic prompts

## Next Steps

1. **Kickoff implementation with UI component library**
2. **Begin building challenge engine foundation**
3. **Set up API integration with OpenAI**
4. **Create first challenge (Trend Spotter) as proof of concept** 