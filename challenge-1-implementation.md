# Challenge 1: AI Trend Spotter - Implementation Plan

## Challenge Overview

**Difficulty:** Easy (10 points)  
**Focus:** Using AI to identify emerging trends and business opportunities

## UI Components

### 1. Challenge Introduction Screen
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🔍 AI TREND SPOTTER                               │
│  ─────────────────────────────────────────────     │
│                                                     │
│  Learn to use AI to identify emerging trends        │
│  and business opportunities                         │
│                                                     │
│  🏆 10 points  |  ⏱️ 4 minutes  |  🔰 Beginner     │
│                                                     │
│  [START CHALLENGE]                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. Industry Selection Screen
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Choose an industry to analyze:                     │
│  ─────────────────────────────────────────────     │
│                                                     │
│  [ ] Healthcare                                     │
│  [ ] Retail                                         │
│  [ ] Finance                                        │
│  [ ] Technology                                     │
│  [ ] Education                                      │
│  [ ] Manufacturing                                  │
│  [ ] Other: ______________________                  │
│                                                     │
│  [CONTINUE]                                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3. AI Query Builder Screen
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Creating your AI prompt:                           │
│  ─────────────────────────────────────────────     │
│                                                     │
│  ✅ "What are three emerging trends in              │
│     [INDUSTRY]?"                                    │
│                                                     │
│  ✅ "What businesses or industries are likely       │
│     to be impacted by these trends?"                │
│                                                     │
│  [GENERATE INSIGHTS]                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4. AI Results Display Screen
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  AI-Generated Trends for [INDUSTRY]:                │
│  ─────────────────────────────────────────────     │
│                                                     │
│  Trend #1: [Trend title]                            │
│  • [Description]                                    │
│  • Impact: [Business impact]                        │
│  • [Opportunity details]                            │
│                                                     │
│  Trend #2: [Trend title]                            │
│  • [Description]                                    │
│  • Impact: [Business impact]                        │
│  • [Opportunity details]                            │
│                                                     │
│  Trend #3: [Trend title]                            │
│  • [Description]                                    │
│  • Impact: [Business impact]                        │
│  • [Opportunity details]                            │
│                                                     │
│  [SELECT A TREND]                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5. Trend Selection & Analysis Screen
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Select the most promising trend:                   │
│  ─────────────────────────────────────────────     │
│                                                     │
│  ( ) Trend #1: [Trend title]                        │
│  ( ) Trend #2: [Trend title]                        │
│  ( ) Trend #3: [Trend title]                        │
│                                                     │
│  Why is this trend significant?                     │
│  ┌───────────────────────────────────────────┐     │
│  │                                           │     │
│  │ [Text input area]                         │     │
│  │                                           │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  [SUBMIT ANALYSIS]                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 6. Challenge Completion Screen
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🎉 Challenge Complete!                             │
│  ─────────────────────────────────────────────     │
│                                                     │
│  You've earned: 10 points                           │
│                                                     │
│  Your analysis:                                     │
│  • Selected trend: [Trend title]                    │
│  • Your insight: [User's analysis]                  │
│                                                     │
│  [TAKE IT FURTHER] or [NEXT CHALLENGE]              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Component Structure

```
TrendSpotterChallenge/
├── IntroScreen.jsx
├── IndustrySelector.jsx
├── QueryBuilder.jsx
├── TrendResults.jsx
├── TrendSelector.jsx
├── CompletionScreen.jsx
├── TakeItFurtherScreen.jsx
└── TrendSpotterChallenge.jsx (main component)
```

## State Management

```javascript
// Main component state
const [step, setStep] = useState('intro');
const [selectedIndustry, setSelectedIndustry] = useState(null);
const [generatedTrends, setGeneratedTrends] = useState([]);
const [selectedTrend, setSelectedTrend] = useState(null);
const [userAnalysis, setUserAnalysis] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [points, setPoints] = useState(0);
```

## API Integration

### 1. Trend Generation API Call

```javascript
const generateTrends = async (industry) => {
  setIsLoading(true);
  
  try {
    // API call to OpenAI or Google Gemini
    const prompt1 = `What are three emerging trends in ${industry}?`;
    const prompt2 = `What businesses or industries are likely to be impacted by these trends?`;
    
    const response1 = await callAI(prompt1);
    const response2 = await callAI(prompt2);
    
    // Parse and structure the responses
    const structuredTrends = parseTrends(response1, response2);
    setGeneratedTrends(structuredTrends);
    setStep('results');
  } catch (error) {
    console.error("Error generating trends:", error);
    // Show error message to user
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Helper Functions

```javascript
// Parse AI responses into structured trend data
const parseTrends = (trendsResponse, impactResponse) => {
  // Logic to extract trends and their impacts
  // Return structured array of trend objects
};

// Validate user's analysis
const validateAnalysis = (analysis) => {
  return analysis.length >= 50; // Minimum length requirement
};
```

## Implementation Steps

1. **Set Up Project Structure**
   - [ ] Create folder structure for the challenge
   - [ ] Set up React components for each screen
   - [ ] Create placeholder screens with basic UI

2. **Implement UI Components**
   - [ ] Create intro screen with challenge description
   - [ ] Build industry selection with dropdown/buttons
   - [ ] Develop query builder interface
   - [ ] Create results display for AI-generated trends
   - [ ] Build trend selection and analysis screen
   - [ ] Design completion screen with points and feedback

3. **Implement Logic & State Management**
   - [ ] Set up state variables and transitions
   - [ ] Create navigation between screens
   - [ ] Add validation for user inputs
   - [ ] Implement loading states for AI responses

4. **AI Integration**
   - [ ] Set up API calls to ChatGPT/Gemini
   - [ ] Create prompt templates for trend generation
   - [ ] Build response parsing logic
   - [ ] Implement error handling for API failures

5. **Gamification & Progress**
   - [ ] Add points system integration
   - [ ] Create progress tracking
   - [ ] Implement completion status saving
   - [ ] Add "Take It Further" extension options

6. **Testing & Refinement**
   - [ ] Test user flow from start to finish
   - [ ] Verify API responses are properly displayed
   - [ ] Ensure error states are handled gracefully
   - [ ] Test on different devices and screen sizes

## AI Prompt Engineering

To ensure consistent and high-quality AI responses, we'll use carefully crafted prompts:

### Trend Generation Prompt Template

```
Generate exactly three emerging trends in the {industry} industry. For each trend:
1. Provide a clear, concise title (5-7 words)
2. Write a 1-2 sentence description of the trend
3. Explain its business impact in 1-2 sentences
4. Suggest one specific opportunity for businesses to capitalize on this trend

Format each trend as:
- Title: [trend title]
- Description: [trend description]
- Impact: [business impact]
- Opportunity: [specific opportunity]

Keep your response factual, current, and business-focused.
```

## Resources Needed

1. **API Access**
   - OpenAI API key or Google Gemini API access
   - Rate limit considerations for multiple users

2. **Icons & Graphics**
   - Trend analysis icons
   - Industry-specific icons
   - Loading animations

3. **Sample Data**
   - Pre-generated example trends (as fallbacks)
   - Industry descriptions and categories

## Next Steps

- [ ] Create wireframes in Figma for each screen
- [ ] Set up React project structure
- [ ] Design component interfaces and props
- [ ] Test API integration with sample prompts 