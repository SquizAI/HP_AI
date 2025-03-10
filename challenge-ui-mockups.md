# AI Training Platform UI Mockups

This document provides visual mockups for our Duolingo-style AI learning platform, focusing on key screens and user interactions for each challenge.

## Main Dashboard UI

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  AI WORKPLACE SKILLS                          🏆 30 │
│  ─────────────────────────────────────────────     │
│                                                     │
│  👋 Welcome back, Sarah!                            │
│                                                     │
│  DAILY GOAL: 10 points                              │
│  [████████░░] 8/10 points today                     │
│                                                     │
│  CHALLENGES                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │   🔍   │ │   💬   │ │   📊   │ │   📝   │       │
│  │        │ │        │ │        │ │        │       │
│  │Trend   │ │Service │ │Biz     │ │Meeting │       │
│  │Spotter │ │Pro     │ │Strategy│ │Genius  │       │
│  │        │ │        │ │        │ │        │       │
│  │✅ Done │ │✅ Done │ │ START  │ │ LOCKED │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                     │
│  YOUR PROGRESS                                      │
│  Level 1: [███████░░░] 7/10 challenges             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Challenge Common Elements

Each challenge follows a consistent format with these UI elements:

### Challenge Header
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [ICON] CHALLENGE TITLE                      🏆 10  │
│  ─────────────────────────────────────────────     │
│  Difficulty: Easy | Time: ~3-5 minutes             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Challenge Introduction
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  WHAT YOU'LL LEARN                                  │
│  • Key business skill point #1                      │
│  • Key business skill point #2                      │
│  • Key business skill point #3                      │
│                                                     │
│  REQUIRED                                           │
│  • Access to [AI tool]                              │
│                                                     │
│  [START CHALLENGE]                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Progress Indicator
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 2 OF 5                                        │
│  [░░████░░░]                                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Challenge Completion
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🎉 CHALLENGE COMPLETE!                      🏆 +10 │
│  ─────────────────────────────────────────────     │
│                                                     │
│  You've learned how to:                             │
│  ✓ [Skill acquired #1]                              │
│  ✓ [Skill acquired #2]                              │
│                                                     │
│  [ TAKE IT FURTHER ]    [ NEXT CHALLENGE ]          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Challenge 1: AI Trend Spotter

### Industry Selection Screen
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 1: SELECT AN INDUSTRY                         │
│  [░████░░░]                                         │
│                                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐                  │
│  │   🏥   │ │   🛍️   │ │   💰   │                  │
│  │        │ │        │ │        │                  │
│  │Health  │ │Retail  │ │Finance │                  │
│  │care    │ │        │ │        │                  │
│  └────────┘ └────────┘ └────────┘                  │
│                                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐                  │
│  │   💻   │ │   🎓   │ │   🏭   │                  │
│  │        │ │        │ │        │                  │
│  │Tech    │ │Educa-  │ │Manufac-│                  │
│  │        │ │tion    │ │turing  │                  │
│  └────────┘ └────────┘ └────────┘                  │
│                                                     │
│          [ CONTINUE ]                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### AI Prompt Construction
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 2: CRAFT YOUR AI PROMPT                       │
│  [░░████░░]                                         │
│                                                     │
│  We've built a prompt for you:                      │
│  ┌───────────────────────────────────────────┐     │
│  │ "What are three emerging trends in         │     │
│  │ healthcare that businesses should be aware │     │
│  │ of in the next 1-2 years?"                │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  [ SEND TO AI ]                                     │
│                                                     │
│  💡 This prompt asks for specific, timebound        │
│     trends to ensure actionable results             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Results Display
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 3: REVIEW AI-GENERATED TRENDS                 │
│  [░░░████░]                                         │
│                                                     │
│  TREND #1: AI-Powered Diagnostic Tools              │
│  ──────────────────────────────────────────         │
│  • Advanced imaging analysis reducing diagnosis time│
│  • Potential to detect conditions earlier           │
│  • Opportunity: Integration with existing systems   │
│                                                     │
│  TREND #2: Virtual Care Expansion                   │
│  ──────────────────────────────────────────         │
│  • Beyond video calls to full remote monitoring     │
│  • Serving rural and mobility-limited populations   │
│  • Opportunity: Specialized virtual care platforms  │
│                                                     │
│  TREND #3: Preventative Health Tech                 │
│  ──────────────────────────────────────────         │
│  • Wearables evolving to track more vital signs     │
│  • Data-driven preventative health recommendations  │
│  • Opportunity: Subscription prevention programs    │
│                                                     │
│  [ CONTINUE ]                                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Analysis Input
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 4: SELECT MOST PROMISING TREND                │
│  [░░░░████]                                         │
│                                                     │
│  Which trend has the biggest potential impact?      │
│                                                     │
│  (•) AI-Powered Diagnostic Tools                    │
│  ( ) Virtual Care Expansion                         │
│  ( ) Preventative Health Tech                       │
│                                                     │
│  Why did you select this trend?                     │
│  ┌───────────────────────────────────────────┐     │
│  │                                           │     │
│  │ [Text input area]                         │     │
│  │                                           │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  [ SUBMIT ANALYSIS ]                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Challenge 2: AI Service Pro

### Complaint Selection
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 1: SELECT A CUSTOMER COMPLAINT                │
│  [░████░░░]                                         │
│                                                     │
│  COMPLAINT A: Product Malfunction                   │
│  "I purchased your product last week and it stopped │
│  working after two days. This is ridiculous and I   │
│  want a refund immediately!"                        │
│                                                     │
│  COMPLAINT B: Shipping Delay                        │
│  "My order was supposed to arrive yesterday for my  │
│  daughter's birthday and it's still not here. I'm   │
│  extremely disappointed in your service."           │
│                                                     │
│  COMPLAINT C: Billing Error                         │
│  "I was charged twice for my subscription and       │
│  customer service keeps transferring me around      │
│  without fixing it. Fix this now!"                  │
│                                                     │
│  [ CONTINUE ]                                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Response Generation
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 2: GENERATE AI RESPONSE                       │
│  [░░████░░]                                         │
│                                                     │
│  We've built a prompt for you:                      │
│  ┌───────────────────────────────────────────┐     │
│  │ "Draft a professional, empathetic response │     │
│  │ to this customer complaint about a billing │     │
│  │ error. Include an apology, a solution, and │     │
│  │ next steps."                               │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  [ SEND TO AI ]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tone Adjustment
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 3: ADJUST RESPONSE TONE                       │
│  [░░░████░]                                         │
│                                                     │
│  ORIGINAL RESPONSE:                                 │
│  "Dear Customer, We apologize for the inconvenience │
│  with your billing. We've issued a refund for the   │
│  duplicate charge, which will appear in 3-5 business│
│  days. We've also added a $10 credit to your        │
│  account for the trouble."                          │
│                                                     │
│  ADJUST TONE TO BE:                                 │
│  ( ) More formal and professional                   │
│  (•) More warm and personable                       │
│  ( ) More concise and direct                        │
│                                                     │
│  [ GENERATE VARIATION ]                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Response Comparison
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 4: COMPARE RESPONSES                          │
│  [░░░░████]                                         │
│                                                     │
│  ORIGINAL:                                          │
│  "Dear Customer, We apologize for the inconvenience │
│  with your billing. We've issued a refund for the   │
│  duplicate charge, which will appear in 3-5 business│
│  days. We've also added a $10 credit to your        │
│  account for the trouble."                          │
│                                                     │
│  WARMER TONE:                                       │
│  "Hi there, I'm so sorry about the frustrating      │
│  double-charge situation! I completely understand   │
│  how annoying this must be. Good news - I've        │
│  personally processed your refund, which you'll see │
│  in 3-5 days. I've also added a $10 credit as a     │
│  small thank you for your patience."                │
│                                                     │
│  Which version would you send?                      │
│  ( ) Original  (•) Warmer Tone                      │
│                                                     │
│  [ SUBMIT SELECTION ]                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Challenge 10: AI Data Analyst

### Data Review
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 1: REVIEW SALES DATA                          │
│  [░████░░░]                                         │
│                                                     │
│  QUARTERLY SALES BY REGION (IN THOUSANDS)           │
│                                                     │
│  REGION    | Q1    | Q2    | Q3    | Q4            │
│  ----------|-------|-------|-------|-------        │
│  North     | $245  | $267  | $290  | $305          │
│  South     | $310  | $298  | $271  | $262          │
│  East      | $189  | $201  | $245  | $263          │
│  West      | $276  | $271  | $219  | $182          │
│  Central   | $158  | $172  | $188  | $225          │
│                                                     │
│  PRODUCT LINE PERFORMANCE                           │
│  • Product A: 32% of sales, 12% growth             │
│  • Product B: 41% of sales, -3% growth             │
│  • Product C: 27% of sales, 18% growth             │
│                                                     │
│  [ CONTINUE ]                                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### AI Analysis Prompt
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 2: GENERATE DATA INSIGHTS                     │
│  [░░████░░]                                         │
│                                                     │
│  We've built a prompt for you:                      │
│  ┌───────────────────────────────────────────┐     │
│  │ "Analyze this sales data and identify:     │     │
│  │ 1. The top 3 trends or patterns            │     │
│  │ 2. Any concerning issues or outliers       │     │
│  │ 3. One specific business recommendation    │     │
│  │    based on this analysis"                 │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  [ SEND TO AI ]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### AI Insights Review
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 3: REVIEW AI INSIGHTS                         │
│  [░░░████░]                                         │
│                                                     │
│  KEY TRENDS:                                        │
│  1️⃣ Steady growth in North and East regions         │
│     (24% and 39% annual increases)                  │
│                                                     │
│  2️⃣ Significant decline in West region              │
│     (34% drop from Q1 to Q4)                        │
│                                                     │
│  3️⃣ Product C showing strongest growth momentum     │
│     despite smallest market share                   │
│                                                     │
│  CONCERNS:                                          │
│  ⚠️ Product B showing negative growth despite        │
│     being largest revenue contributor               │
│                                                     │
│  RECOMMENDATION:                                    │
│  Shift marketing resources from West region to      │
│  promote Product C in North and East regions where  │
│  growth trends align with product performance.      │
│                                                     │
│  [ CONTINUE ]                                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### User Analysis Input
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 4: YOUR BUSINESS RECOMMENDATION               │
│  [░░░░████]                                         │
│                                                     │
│  Do you agree with the AI's recommendation?         │
│  ( ) Yes - I would implement this                   │
│  (•) Partially - but with modifications             │
│  ( ) No - I have a different recommendation         │
│                                                     │
│  Your recommendation or modifications:              │
│  ┌───────────────────────────────────────────┐     │
│  │ While I agree with promoting Product C in │     │
│  │ the growing regions, we should also       │     │
│  │ investigate why Product B is declining    │     │
│  │ since it's our largest revenue source.    │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  [ SUBMIT ANALYSIS ]                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Challenge 6: AI Communication Coach

### Email Bullet Points
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 1: CREATE EMAIL BULLET POINTS                 │
│  [░████░░░]                                         │
│                                                     │
│  SCENARIO: Project Status Update                    │
│                                                     │
│  Enter 3-5 key points for your email:               │
│  ┌───────────────────────────────────────────┐     │
│  │ • Project is 2 weeks behind schedule      │     │
│  │ • Budget is currently 5% over projection  │     │
│  │ • Need additional developer resources     │     │
│  │ • Quality testing shows good results      │     │
│  │ • Launch date will need to be adjusted    │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  [ CONTINUE ]                                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Email Generation
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 2: GENERATE EMAIL DRAFT                       │
│  [░░████░░]                                         │
│                                                     │
│  We've built a prompt for you:                      │
│  ┌───────────────────────────────────────────┐     │
│  │ "Transform these bullet points into a      │     │
│  │ well-structured professional email about   │     │
│  │ a project status update. Include a clear   │     │
│  │ subject line, appropriate greeting, and    │     │
│  │ professional closing."                     │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  [ SEND TO AI ]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tone Variations
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 3: EXPLORE TONE VARIATIONS                    │
│  [░░░████░]                                         │
│                                                     │
│  ORIGINAL (NEUTRAL PROFESSIONAL):                   │
│  Subject: Project Status Update: Timeline and       │
│           Budget Adjustments Required               │
│                                                     │
│  Dear Team,                                         │
│                                                     │
│  I'm writing to provide an update on our current    │
│  project status. We are currently experiencing a    │
│  two-week delay against our original timeline, and  │
│  our budget is approximately 5% over projections.   │
│                                                     │
│  Select a tone variation to generate:               │
│  (•) More direct and urgent                         │
│  ( ) More optimistic and solution-focused           │
│  ( ) More detailed and analytical                   │
│                                                     │
│  [ GENERATE VARIATION ]                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Email Comparison
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STEP 4: COMPARE EMAIL VERSIONS                     │
│  [░░░░████]                                         │
│                                                     │
│  ORIGINAL (NEUTRAL PROFESSIONAL):                   │
│  "I'm writing to provide an update on our current   │
│  project status. We are currently experiencing a    │
│  two-week delay against our original timeline..."   │
│                                                     │
│  DIRECT AND URGENT VERSION:                         │
│  "URGENT: We must address critical project delays.  │
│  Our timeline is now 2 weeks behind schedule and    │
│  we're 5% over budget. We need immediate action     │
│  to secure additional developer resources..."       │
│                                                     │
│  Which version better addresses the situation?      │
│  ( ) Original version                               │
│  (•) Direct and urgent version                      │
│                                                     │
│  [ SUBMIT SELECTION ]                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## "Take It Further" UI

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  TAKE IT FURTHER                             🏆 +5  │
│  ─────────────────────────────────────────────     │
│                                                     │
│  Select an extension challenge:                     │
│                                                     │
│  (•) 1. Industry Deep Dive                          │
│     Ask AI to identify real companies leveraging    │
│     the trend you selected                          │
│                                                     │
│  ( ) 2. Trend Timeline                              │
│     Ask AI to forecast how this trend will develop  │
│     over the next 5 years                           │
│                                                     │
│  ( ) 3. Implementation Strategy                     │
│     Ask AI how a business could implement this      │
│     trend within 90 days                            │
│                                                     │
│  [ START EXTENSION ]                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Points and Achievements UI

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  YOUR ACHIEVEMENTS                                  │
│  ─────────────────────────────────────────────     │
│                                                     │
│  TOTAL POINTS: 85                                   │
│                                                     │
│  LEVEL:                                             │
│  [████░░░░░░] Level 2 (85/150 points to Level 3)    │
│                                                     │
│  BADGES EARNED:                                     │
│  🔍 Trend Spotter     - Completed                   │
│  💬 Service Pro       - Completed                   │
│  📝 Communication Pro - Completed                   │
│  🌟 First Extension   - Completed                   │
│  🔥 3-Day Streak      - Completed                   │
│                                                     │
│  CHALLENGES COMPLETED: 7/15                         │
│  ┌────────────────────────────────────┐            │
│  │ ● ● ● ● ● ● ● ○ ○ ○ ○ ○ ○ ○ ○      │            │
│  └────────────────────────────────────┘            │
│                                                     │
│  [ BACK TO DASHBOARD ]                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Module Completion UI

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🏆 BEGINNER TRACK COMPLETE!                        │
│  ─────────────────────────────────────────────     │
│                                                     │
│  Congratulations! You've mastered the               │
│  fundamentals of AI in business.                    │
│                                                     │
│  SKILLS ACQUIRED:                                   │
│  ✓ Trend identification and analysis                │
│  ✓ AI-assisted customer service                     │
│  ✓ Professional communications                      │
│  ✓ Creative ad generation                           │
│  ✓ Brainstorming and ideation                       │
│  ✓ HR and recruitment assistance                    │
│                                                     │
│  You've unlocked:                                   │
│  🔓 INTERMEDIATE TRACK                              │
│  🎖️ "AI FUNDAMENTALS" CERTIFICATE                   │
│                                                     │
│  [ VIEW CERTIFICATE ]  [ START INTERMEDIATE TRACK ] │
│                                                     │
└─────────────────────────────────────────────────────┘
``` 