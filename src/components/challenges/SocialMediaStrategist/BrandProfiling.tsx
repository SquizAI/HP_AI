import React, { useState } from 'react';
import { SocialMediaStrategy } from './SocialMediaStrategistMain';

interface BrandProfilingProps {
  state: SocialMediaStrategy;
  updateState: (newState: Partial<SocialMediaStrategy>) => void;
  onNext: () => void;
}

// Industry options for dropdown
const INDUSTRIES = [
  'Technology',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Food & Beverage',
  'Fashion',
  'Entertainment',
  'Travel',
  'Fitness',
  'Beauty',
  'Real Estate',
  'Non-profit',
  'B2B Services',
  'Manufacturing',
  'Other'
];

// Personas and their traits for the brand personality quiz
const BRAND_PERSONAS = [
  {
    id: 'innovator',
    name: 'The Innovator',
    traits: ['Forward-thinking', 'Tech-savvy', 'Disruptive', 'Pioneering'],
    icon: '🚀',
    description: 'You lead with groundbreaking ideas and cutting-edge solutions.'
  },
  {
    id: 'authority',
    name: 'The Authority',
    traits: ['Knowledgeable', 'Established', 'Reliable', 'Expert'],
    icon: '📊',
    description: 'You build trust through expertise and proven reliability.'
  },
  {
    id: 'nurturer',
    name: 'The Nurturer',
    traits: ['Supportive', 'Community-focused', 'Empathetic', 'Service-oriented'],
    icon: '🤝',
    description: 'You prioritize relationships and helping others succeed.'
  },
  {
    id: 'rebel',
    name: 'The Rebel',
    traits: ['Bold', 'Unconventional', 'Authentic', 'Challenger'],
    icon: '🔥',
    description: 'You stand out by challenging norms and being refreshingly different.'
  },
  {
    id: 'optimist',
    name: 'The Optimist',
    traits: ['Uplifting', 'Inspiring', 'Energetic', 'Positive'],
    icon: '✨',
    description: 'You motivate and energize your audience with positivity and possibility.'
  }
];

// Social media goals for selection
const SOCIAL_MEDIA_GOALS = [
  { id: 'awareness', label: 'Brand Awareness', icon: '👁️' },
  { id: 'engagement', label: 'Community Engagement', icon: '💬' },
  { id: 'traffic', label: 'Website Traffic', icon: '🌐' },
  { id: 'leads', label: 'Lead Generation', icon: '📋' },
  { id: 'sales', label: 'Sales Conversion', icon: '💰' },
  { id: 'retention', label: 'Customer Retention', icon: '🔄' },
  { id: 'authority', label: 'Thought Leadership', icon: '🧠' },
  { id: 'service', label: 'Customer Service', icon: '🛎️' }
];

const BrandProfiling: React.FC<BrandProfilingProps> = ({ state, updateState, onNext }) => {
  const [step, setStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(state.goals || []);
  const [formValues, setFormValues] = useState({
    brandName: state.brandName || '',
    industry: state.industry || '',
    description: state.description || '',
    customPersona: state.brandPersonality || ''
  });
  
  // Toggle selection of goals
  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      // Limit to 3 goals
      if (selectedGoals.length < 3) {
        setSelectedGoals([...selectedGoals, goalId]);
      }
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value
    });
  };
  
  // Update state and move to next step
  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!formValues.brandName || !formValues.industry) {
        return; // Don't proceed if required fields are empty
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedPersona && !formValues.customPersona) {
        return; // Don't proceed if no persona selected
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedGoals.length === 0) {
        return; // Don't proceed if no goals selected
      }
      
      // Update the main state with all brand profiling info
      updateState({
        brandName: formValues.brandName,
        industry: formValues.industry,
        description: formValues.description,
        brandPersonality: selectedPersona 
          ? BRAND_PERSONAS.find(p => p.id === selectedPersona)?.name || ''
          : formValues.customPersona,
        brandPersonalityTraits: selectedPersona 
          ? BRAND_PERSONAS.find(p => p.id === selectedPersona)?.traits || []
          : [],
        goals: selectedGoals
      });
      
      // Move to next main component
      onNext();
    }
  };
  
  // Go back a step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Step 1: Basic Brand Information */}
      {step === 1 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Define Your Brand Identity
            </h2>
            <p className="text-gray-700">
              Let's start by understanding the basics about your brand. This information will help create a tailored social media strategy.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brandName"
                value={formValues.brandName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your brand name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry <span className="text-red-500">*</span>
              </label>
              <select
                name="industry"
                value={formValues.industry}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Description
              </label>
              <textarea
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Briefly describe what your brand does, your mission, and your values"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Step 2: Brand Personality */}
      {step === 2 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Define Your Brand Personality
            </h2>
            <p className="text-gray-700">
              Your brand's personality defines how you communicate with your audience. Select the persona that best represents your brand's voice and tone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {BRAND_PERSONAS.map((persona) => (
              <div
                key={persona.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPersona === persona.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-200'
                }`}
                onClick={() => setSelectedPersona(persona.id)}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{persona.icon}</span>
                  <h3 className="font-medium text-gray-800">{persona.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{persona.description}</p>
                <div className="flex flex-wrap gap-2">
                  {persona.traits.map((trait, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="custom-persona"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={!selectedPersona}
                onChange={() => setSelectedPersona('')}
              />
              <label htmlFor="custom-persona" className="ml-2 text-sm font-medium text-gray-700">
                None of these fit my brand - I'll describe my own
              </label>
            </div>
            
            {!selectedPersona && (
              <textarea
                name="customPersona"
                value={formValues.customPersona}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-24"
                placeholder="Describe your brand's personality and tone"
              />
            )}
          </div>
        </div>
      )}
      
      {/* Step 3: Social Media Goals */}
      {step === 3 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Set Your Social Media Goals
            </h2>
            <p className="text-gray-700">
              What do you want to achieve with your social media strategy? Select up to 3 primary goals.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {SOCIAL_MEDIA_GOALS.map((goal) => (
              <div
                key={goal.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedGoals.includes(goal.id) 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-200 hover:shadow-sm'
                }`}
                onClick={() => toggleGoal(goal.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <span className="text-2xl mb-2">{goal.icon}</span>
                  <h3 className="font-medium text-gray-800 text-sm">{goal.label}</h3>
                </div>
              </div>
            ))}
          </div>
          
          {selectedGoals.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Your selected goals:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedGoals.map((goalId) => {
                  const goal = SOCIAL_MEDIA_GOALS.find(g => g.id === goalId);
                  return (
                    <span key={goalId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                      <span className="mr-1">{goal?.icon}</span>
                      {goal?.label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGoal(goalId);
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
              {selectedGoals.length < 3 && (
                <p className="text-sm text-blue-600 mt-2">
                  You can select up to {3 - selectedGoals.length} more goal{3 - selectedGoals.length > 1 ? 's' : ''}.
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          disabled={step === 1}
        >
          {step > 1 ? 'Back' : ''}
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={(step === 1 && (!formValues.brandName || !formValues.industry)) ||
                  (step === 2 && !selectedPersona && !formValues.customPersona) ||
                  (step === 3 && selectedGoals.length === 0)}
        >
          {step < 3 ? 'Next' : 'Complete Brand Profile'}
        </button>
      </div>
    </div>
  );
};

export default BrandProfiling; 