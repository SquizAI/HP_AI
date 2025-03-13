import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ChallengeHub from './components/hub/ChallengeHub'
import Resources from './components/resources/Resources'
import ServiceProChallenge from './components/challenges/ServicePro/ServicePro'
import TrendSpotterChallenge from './components/challenges/TrendSpotter/TrendSpotterMain'
import BizStrategistChallenge from './components/challenges/BizStrategist/BizStrategistMain'
import DataAnalystChallenge from './components/challenges/DataAnalyst/DataAnalystMain'
import BrainstormBuddyChallenge from './components/challenges/BrainstormBuddy/BrainstormBuddyMain'
import SocialMediaStrategistChallenge from './components/challenges/SocialMediaStrategist/SocialMediaStrategistMain'
import SlideMasterWrapper from './components/challenges/SlideMaster/SlideMasterWrapper'
import ContentTransformerChallenge from './components/challenges/ContentTransformer/ContentTransformerMain'
import GlobalCommunicatorWrapper from './components/challenges/GlobalCommunicator/GlobalCommunicatorWrapper'
import ImageGeneratorTest from './components/challenges/SlideMaster/ImageGeneratorTest'
import AIModelComparison from './components/challenges/SmartSelect'
import EmotionalInsightMain from './components/challenges/EmotionalInsight/EmotionalInsightMain'
import VoiceGeneratorMain from './components/challenges/VoiceGenerator/VoiceGeneratorMain'
import DictationWizardMain from './components/challenges/DictationWizard'
import ImageClassifierMain from './components/challenges/ImageClassifier'
import ImageSearchMain from './components/challenges/ImageSearch/ImageSearchMain'
import OCRAssistantMain from './components/challenges/OCRAssistant/OCRAssistantMain'
import ObjectDetectionMain from './components/challenges/ObjectDetection'
import ObjectTrackingMain from './components/challenges/ObjectTracking'
import PrivacyGuardianMain from './components/challenges/PrivacyGuardian'
import DetectiveLeagueMain from './components/challenges/DetectiveLeague/DetectiveLeagueMain'
import AgentMagicMain from './components/challenges/AgentMagic/AgentMagicMain'
// Import HP Challenge Components
import HPPowerBIMain from './components/challenges/HPPowerBI'
import HPAICompanionMain from './components/challenges/HPAICompanion'
import HPAmuzeMain from './components/challenges/HPAmuze'
// Import for the Face ID Manager challenge
import FaceIdManagerMain from './components/challenges/FaceIdManager/FaceIdManagerMain'

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<ChallengeHub />} />
          <Route path="/challenges" element={<ChallengeHub />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/challenge/servicepro" element={<ServiceProChallenge />} />
          <Route path="/challenge/trendspotter" element={<TrendSpotterChallenge />} />
          <Route path="/challenge/bizstrategist" element={<BizStrategistChallenge />} />
          <Route path="/challenge/dataanalyst" element={<DataAnalystChallenge />} />
          <Route path="/challenge/brainstormbuddy" element={<BrainstormBuddyChallenge />} />
          <Route path="/challenge/social-media-strategist" element={<SocialMediaStrategistChallenge />} />
          <Route path="/challenge/slidemaster/*" element={<SlideMasterWrapper />} />
          <Route path="/challenge/slidemaster/image-test" element={<ImageGeneratorTest />} />
          <Route path="/challenge/content-transformer" element={<ContentTransformerChallenge />} />
          <Route path="/challenge/global-communicator/*" element={<GlobalCommunicatorWrapper />} />
          <Route path="/challenge/smartselect" element={<AIModelComparison />} />
          <Route path="/challenge/emotional-insight" element={<EmotionalInsightMain />} />
          <Route path="/challenge/voice-generator" element={<VoiceGeneratorMain />} />
          <Route path="/challenge/dictation-wizard" element={<DictationWizardMain />} />
          <Route path="/challenge/image-classifier" element={<ImageClassifierMain />} />
          <Route path="/challenge/image-search" element={<ImageSearchMain />} />
          <Route path="/challenge/ocr-assistant" element={<OCRAssistantMain />} />
          <Route path="/challenge/object-detection" element={<ObjectDetectionMain />} />
          <Route path="/challenge/object-tracking" element={<ObjectTrackingMain />} />
          <Route path="/challenge/privacy-guardian" element={<PrivacyGuardianMain />} />
          <Route path="/challenge/detective-league" element={<DetectiveLeagueMain />} />
          <Route path="/challenge/agent-magic" element={<AgentMagicMain />} />
          <Route path="/challenge/face-id-manager" element={<FaceIdManagerMain />} />
          {/* HP Challenge Routes */}
          <Route path="/challenge/hp-powerbi" element={<HPPowerBIMain />} />
          <Route path="/challenge/hp-companion" element={<HPAICompanionMain />} />
          <Route path="/challenge/hp-amuze" element={<HPAmuzeMain />} />
          {/* Placeholder routes for challenges under development */}
          <Route 
            path="/challenge/*" 
            element={
              <div className="p-8 text-center">
                <div className="bg-yellow-50 p-6 rounded-lg text-yellow-800 mb-4">
                  <h2 className="text-xl font-bold mb-2">Challenge Under Development</h2>
                  <p>This challenge is currently being built and will be available soon.</p>
                </div>
                <a href="/" className="btn btn-primary">Return to Challenge Hub</a>
              </div>
            } 
          />
          <Route 
            path="*" 
            element={
              <div className="p-8 text-center">
                <div className="bg-red-50 p-6 rounded-lg text-red-800 mb-4">
                  <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
                  <p>The page you are looking for does not exist.</p>
                </div>
                <a href="/" className="btn btn-primary">Return to Challenge Hub</a>
              </div>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App 