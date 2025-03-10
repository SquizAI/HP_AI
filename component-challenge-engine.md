# Challenge Engine Implementation Guide

## Overview

The Challenge Engine is the core component of our AI learning platform, responsible for managing the flow, state, and interactions within each challenge. It orchestrates the step-by-step progression, AI interactions, and completion tracking for all 15 learning challenges.

## Core Responsibilities

- Managing the step-by-step flow of each challenge
- Handling user inputs and state updates
- Coordinating AI prompt generation and response parsing
- Tracking challenge completion and awarding points/badges
- Supporting "Take It Further" extension activities

## Component Architecture

### ChallengeEngine Component

```jsx
const ChallengeEngine = ({ 
  challengeId, 
  onComplete,
  onTakeItFurther
}) => {
  // Get challenge configuration from store
  const challenge = useSelector(state => 
    state.challenges.items.find(c => c.id === challengeId)
  );
  
  const dispatch = useDispatch();
  
  // Local state for challenge flow
  const [currentStep, setCurrentStep] = useState(0);
  const [challengeState, setChallengeState] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExtension, setShowExtension] = useState(false);
  const [extensionType, setExtensionType] = useState(null);
  const [extensionResult, setExtensionResult] = useState(null);
  
  // State update handler
  const updateState = (newState) => {
    setChallengeState(prevState => ({
      ...prevState,
      ...newState
    }));
  };
  
  // Navigation handlers
  const handleNextStep = () => {
    if (currentStep < challenge.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete challenge
      dispatch(completeChallenge({
        challengeId,
        points: challenge.points
      }));
      
      // Award badges if applicable
      if (challenge.badges) {
        challenge.badges.forEach(badge => {
          dispatch(awardBadge({ badgeId: badge }));
        });
      }
      
      // Notify parent component
      onComplete();
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Extension handling
  const handleStartExtension = (type) => {
    setExtensionType(type);
    setShowExtension(true);
  };
  
  const handleCompleteExtension = (result) => {
    setExtensionResult(result);
    
    // Award extension points
    const extension = challenge.extensions.find(e => e.id === extensionType);
    if (extension) {
      dispatch(completeChallenge({
        challengeId: `${challengeId}-${extensionType}`,
        points: extension.points
      }));
    }
  };
  
  // Current step component
  const CurrentStepComponent = challenge.steps[currentStep].component;
  
  // Main render
  return (
    <div className="challenge-container">
      {/* Challenge header */}
      <ChallengeHeader 
        title={showExtension ? "Take It Further" : challenge.steps[currentStep].title}
        description={showExtension 
          ? "Expand your learning with an additional challenge" 
          : challenge.steps[currentStep].description}
        currentStep={showExtension ? challenge.steps.length + 1 : currentStep + 1}
        totalSteps={showExtension ? challenge.steps.length + 1 : challenge.steps.length}
        points={showExtension ? challenge.extensions.find(e => e.id === extensionType)?.points : challenge.points}
        difficulty={challenge.difficulty}
      />
      
      {/* Challenge content */}
      <div className="challenge-content">
        {showExtension ? (
          <ExtensionActivity
            extension={challenge.extensions.find(e => e.id === extensionType)}
            challengeState={challengeState}
            onComplete={handleCompleteExtension}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />
        ) : (
          <CurrentStepComponent
            state={challengeState}
            updateState={updateState}
            onComplete={handleNextStep}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />
        )}
      </div>
      
      {/* Navigation */}
      {!showExtension && (
        <ChallengeNavigation
          currentStep={currentStep}
          totalSteps={challenge.steps.length}
          canProgress={challenge.steps[currentStep].canProgress(challengeState)}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === challenge.steps.length - 1}
          isLoading={isLoading}
        />
      )}
      
      {/* Extension completion */}
      {showExtension && extensionResult && (
        <div className="extension-completion">
          <Button onClick={() => onTakeItFurther()}>
            Return to Challenges
          </Button>
        </div>
      )}
    </div>
  );
};
```

## Challenge Configuration Structure

Each challenge follows a standardized configuration format:

```javascript
// Example challenge configuration
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
  
  // Define each step in the challenge
  steps: [
    {
      id: 'industry-selection',
      title: 'Select an Industry',
      description: 'Choose an industry to analyze for emerging trends',
      component: IndustrySelector, // React component for this step
      canProgress: (state) => !!state.selectedIndustry // Function to determine if user can proceed
    },
    {
      id: 'prompt-construction',
      title: 'Craft Your AI Prompt',
      description: 'Review the AI prompt we\'ve built for you',
      component: TrendSpotterPrompt,
      canProgress: (state) => !!state.prompt
    },
    // Additional steps...
  ],
  
  // Extension activities
  extensions: [
    {
      id: 'industry-deep-dive',
      title: 'Industry Deep Dive',
      description: 'Ask AI to identify real companies leveraging the trend you selected',
      points: 5,
    },
    // Additional extensions...
  ],
  
  // Optional badges awarded on completion
  badges: ['trend-spotter-badge']
};
```

## Step Components

Each step within a challenge is represented by its own React component. These components follow a consistent interface:

```jsx
// Example step component
const IndustrySelector = ({ 
  state,            // Current challenge state
  updateState,      // Function to update state
  onComplete,       // Function to move to next step
  isLoading,        // Loading state
  setIsLoading,     // Function to set loading state
  error,            // Error state
  setError          // Function to set error state
}) => {
  // Component implementation
  
  return (
    <div className="step-container">
      {/* Step content */}
    </div>
  );
};
```

## AI Prompt Creation & Response Handling

The Challenge Engine integrates with the AI Service to handle prompt creation and response parsing:

```jsx
// Example AI interaction within a step component
const TrendSpotterPrompt = ({ 
  state, 
  updateState, 
  onComplete,
  isLoading,
  setIsLoading,
  error,
  setError
}) => {
  // Generate prompt based on previous steps
  const prompt = `What are three emerging trends in ${state.selectedIndustry.name} that businesses should be aware of in the next 1-2 years?`;
  
  // Send prompt to AI
  const handleSendPrompt = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call AI service
      const response = await aiService.sendPrompt(prompt);
      
      // Parse response
      const trends = parseAIResponse(response);
      
      // Update state with parsed results
      updateState({ 
        prompt,
        trends
      });
      
      // Move to next step
      onComplete();
    } catch (error) {
      console.error("Error sending prompt to AI:", error);
      setError("There was an error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render component
  return (
    <div className="prompt-builder">
      <h2>Your AI Prompt</h2>
      <div className="prompt-preview">
        {prompt}
      </div>
      <Button 
        onClick={handleSendPrompt}
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send to AI'}
      </Button>
      {error && <ErrorMessage message={error} />}
    </div>
  );
};
```

## Challenge Completion Handling

When a user completes a challenge, the Challenge Engine dispatches Redux actions to update the user's progress:

```javascript
// Progress slice (Redux)
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
      
      // Don't award points if already completed
      if (!state.completedChallenges.includes(challengeId)) {
        state.completedChallenges.push(challengeId);
        state.points += points;
        
        // Check for level up
        if (state.points >= getLevelThreshold(state.level)) {
          state.level += 1;
        }
      }
      
      // Update streak
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

## "Take It Further" Extensions

Extensions provide additional learning opportunities after the main challenge is completed:

```jsx
// Extension handling component
const ExtensionActivity = ({
  extension,
  challengeState,
  onComplete,
  isLoading,
  setIsLoading,
  error,
  setError
}) => {
  const [result, setResult] = useState(null);
  
  // Generate extension prompt
  const generateExtensionPrompt = () => {
    switch (extension.id) {
      case 'industry-deep-dive':
        return `Identify 3-5 real companies currently leveraging the "${challengeState.selectedTrend.title}" trend in the ${challengeState.selectedIndustry.name} industry. For each company, provide a brief description of how they're using this trend.`;
      // Add cases for other extension types
      default:
        return '';
    }
  };
  
  // Send prompt to AI
  const handleSendPrompt = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = generateExtensionPrompt();
      const response = await aiService.sendPrompt(prompt);
      setResult(response);
      onComplete(response);
    } catch (error) {
      console.error("Error with extension prompt:", error);
      setError("There was an error processing your extension. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="extension-activity">
      <h2>{extension.title}</h2>
      <p>{extension.description}</p>
      
      {!result ? (
        <Button 
          onClick={handleSendPrompt}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Start Extension'}
        </Button>
      ) : (
        <div className="extension-result">
          <h3>AI Results</h3>
          <div className="result-content">{result}</div>
        </div>
      )}
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
};
```

## State Management

The Challenge Engine manages state at multiple levels:

1. **Local Component State**: Each step manages transient state
2. **Challenge-Level State**: Shared data between steps is maintained in the ChallengeEngine component
3. **Global Progress State**: Completion status, points, and badges are stored in Redux

## Integration with the Dashboard

The ChallengeEngine component should be integrated into the main application flow:

```jsx
// Example usage in a challenge page
const ChallengePage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  
  const handleComplete = () => {
    // Show completion modal or navigate
    navigate('/challenge-complete');
  };
  
  const handleTakeItFurther = () => {
    // Return to dashboard
    navigate('/dashboard');
  };
  
  return (
    <div className="challenge-page">
      <ChallengeEngine 
        challengeId={challengeId}
        onComplete={handleComplete}
        onTakeItFurther={handleTakeItFurther}
      />
    </div>
  );
};
```

## Component Requirements

### Must-Have Features

- Step-by-step navigation through challenges
- State management between steps
- AI prompt generation and response handling
- Progress tracking and points awarding
- Error handling for AI responses

### Should-Have Features

- "Take It Further" extension activities
- Previous step navigation
- Loading states and indicators
- Error recovery mechanisms
- Badge awarding

### Nice-to-Have Features

- Animation between steps
- Progress persistence (save progress and return later)
- Custom AI model selection per challenge
- Response quality validation
- Fallback content for offline use

## Implementation Steps

1. Create the basic ChallengeEngine component structure
2. Implement step navigation logic
3. Add state management within the challenge
4. Integrate with AI service for prompts and responses
5. Connect to Redux for progress tracking
6. Implement "Take It Further" extensions
7. Add loading and error states
8. Create the challenge configuration structure
9. Build individual step components for the first challenge
10. Test the full challenge flow

## Technical Considerations

### Performance

- Minimize re-renders by using React.memo for step components
- Implement caching for AI responses to prevent duplicate API calls
- Use lazy loading for step components that aren't immediately needed

### Accessibility

- Ensure keyboard navigation works through all steps
- Provide appropriate ARIA labels for all interactive elements
- Implement focus management between steps

### Error Handling

- Graceful recovery from API failures
- Fallback content when AI service is unavailable
- Clear error messages for users

## Testing Strategy

### Unit Tests

- Test step navigation logic
- Test state update mechanisms
- Test progress tracking calculations

### Integration Tests

- Test complete challenge flow
- Test AI prompt generation and response parsing
- Test Redux integration for challenge completion

### E2E Tests

- Complete a full challenge from start to finish
- Verify points are awarded correctly
- Test error handling scenarios

## Dependencies

- React for UI components
- Redux for global state management
- Axios for API calls
- TailwindCSS for styling
- React Router for navigation 