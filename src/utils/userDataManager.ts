import { useLocalStorage } from '../hooks/useLocalStorage';

// Types for user data
export interface UserProgress {
  completedChallenges: string[];
  challengeData: Record<string, any>;
  lastActive: string;
}

export interface UserPreferences {
  showLeaderboard: boolean;
  darkMode: boolean;
  username: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  completedChallenges: number;
  lastActive: string;
}

// Default values
const DEFAULT_USER_PROGRESS: UserProgress = {
  completedChallenges: [],
  challengeData: {},
  lastActive: new Date().toISOString()
};

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  showLeaderboard: true,
  darkMode: false,
  username: `User_${Math.floor(Math.random() * 10000)}`
};

// Generate a persistent user ID if none exists
export const getUserId = (): string => {
  const storedId = localStorage.getItem('ai_hub_user_id');
  if (storedId) return storedId;
  
  const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  localStorage.setItem('ai_hub_user_id', newId);
  return newId;
};

// Hooks for accessing user data
export const useUserProgress = () => {
  return useLocalStorage<UserProgress>('ai_hub_user_progress', DEFAULT_USER_PROGRESS);
};

export const useUserPreferences = () => {
  return useLocalStorage<UserPreferences>('ai_hub_user_preferences', DEFAULT_USER_PREFERENCES);
};

export const useLeaderboard = () => {
  return useLocalStorage<LeaderboardEntry[]>('ai_hub_leaderboard', []);
};

// Utility functions for managing challenge data
export const saveChallengeTrend = (
  challengeId: string,
  industryName: string,
  trendName: string,
  analysis: string
): void => {
  const userProgress = JSON.parse(localStorage.getItem('ai_hub_user_progress') || JSON.stringify(DEFAULT_USER_PROGRESS)) as UserProgress;
  
  if (!userProgress.challengeData[challengeId]) {
    userProgress.challengeData[challengeId] = {};
  }
  
  userProgress.challengeData[challengeId].trendSpotter = {
    industry: industryName,
    trend: trendName,
    analysis: analysis,
    completedAt: new Date().toISOString()
  };
  
  userProgress.lastActive = new Date().toISOString();
  localStorage.setItem('ai_hub_user_progress', JSON.stringify(userProgress));
};

export const saveChallengeBizStrategy = (
  challengeId: string,
  businessGoal: string,
  businessType: string,
  industryContext: string,
  strategyElements: string[],
  assessment: string
): void => {
  const userProgress = JSON.parse(localStorage.getItem('ai_hub_user_progress') || JSON.stringify(DEFAULT_USER_PROGRESS)) as UserProgress;
  
  if (!userProgress.challengeData[challengeId]) {
    userProgress.challengeData[challengeId] = {};
  }
  
  userProgress.challengeData[challengeId].bizStrategy = {
    businessGoal,
    businessType,
    industryContext,
    strategyElements,
    assessment,
    completedAt: new Date().toISOString()
  };
  
  userProgress.lastActive = new Date().toISOString();
  localStorage.setItem('ai_hub_user_progress', JSON.stringify(userProgress));
};

export const saveChallengeBrainstorm = (
  challengeId: string,
  problemStatement: string,
  ideaCategory: string,
  selectedIdea: {
    title: string;
    description: string;
  },
  implementation: string
): void => {
  const userProgress = JSON.parse(localStorage.getItem('ai_hub_user_progress') || JSON.stringify(DEFAULT_USER_PROGRESS)) as UserProgress;
  
  if (!userProgress.challengeData[challengeId]) {
    userProgress.challengeData[challengeId] = {};
  }
  
  userProgress.challengeData[challengeId].brainstorm = {
    problemStatement,
    ideaCategory,
    selectedIdea,
    implementation,
    completedAt: new Date().toISOString()
  };
  
  // Mark the challenge as completed
  if (!userProgress.completedChallenges.includes(challengeId)) {
    userProgress.completedChallenges.push(challengeId);
  }
  
  userProgress.lastActive = new Date().toISOString();
  localStorage.setItem('ai_hub_user_progress', JSON.stringify(userProgress));
  
  // Update the leaderboard
  updateLeaderboard(calculateUserScore());
};

export const updateLeaderboard = (score: number): void => {
  const userId = getUserId();
  const username = (JSON.parse(localStorage.getItem('ai_hub_user_preferences') || JSON.stringify(DEFAULT_USER_PREFERENCES)) as UserPreferences).username;
  const userProgress = JSON.parse(localStorage.getItem('ai_hub_user_progress') || JSON.stringify(DEFAULT_USER_PROGRESS)) as UserProgress;
  
  const leaderboard = JSON.parse(localStorage.getItem('ai_hub_leaderboard') || '[]') as LeaderboardEntry[];
  
  // Find if user is already on leaderboard
  const existingEntryIndex = leaderboard.findIndex(entry => entry.id === userId);
  
  const newEntry: LeaderboardEntry = {
    id: userId,
    username,
    score,
    completedChallenges: userProgress.completedChallenges.length,
    lastActive: new Date().toISOString()
  };
  
  if (existingEntryIndex >= 0) {
    // Update existing entry if score is higher
    if (leaderboard[existingEntryIndex].score < score) {
      leaderboard[existingEntryIndex] = newEntry;
    }
  } else {
    // Add new entry
    leaderboard.push(newEntry);
  }
  
  // Sort leaderboard by score (descending)
  leaderboard.sort((a, b) => b.score - a.score);
  
  // Keep only top 100
  const topLeaderboard = leaderboard.slice(0, 100);
  
  localStorage.setItem('ai_hub_leaderboard', JSON.stringify(topLeaderboard));
};

// Function to clear user data (useful for testing or user-initiated resets)
export const clearUserData = (): void => {
  localStorage.removeItem('ai_hub_user_progress');
  localStorage.removeItem('ai_hub_user_preferences');
  
  // Don't clear the user ID or leaderboard by default
  // localStorage.removeItem('ai_hub_user_id');
  // localStorage.removeItem('ai_hub_leaderboard');
};

// Calculate a score based on user progress
export const calculateUserScore = (): number => {
  const userProgress = JSON.parse(localStorage.getItem('ai_hub_user_progress') || JSON.stringify(DEFAULT_USER_PROGRESS)) as UserProgress;
  
  // Basic scoring: 100 points per completed challenge
  const challengePoints = userProgress.completedChallenges.length * 100;
  
  // Bonus points for variety (completed different types of challenges)
  const uniqueChallengeTypes = new Set(userProgress.completedChallenges).size;
  const varietyBonus = uniqueChallengeTypes * 50;
  
  return challengePoints + varietyBonus;
}; 