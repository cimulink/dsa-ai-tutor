import { UserProgress } from '@/types/problem';

// Local storage key for user progress
const PROGRESS_STORAGE_KEY = 'dsa_ai_tutor_user_progress';

/**
 * Get user progress from localStorage
 * @returns UserProgress object or null if not found
 */
export function getUserProgress(): UserProgress | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const progressData = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!progressData) return null;
    
    const progress: UserProgress = JSON.parse(progressData);
    return progress;
  } catch (error) {
    console.error('Error retrieving user progress:', error);
    return null;
  }
}

/**
 * Save user progress to localStorage
 * @param progress UserProgress object to save
 */
export function saveUserProgress(progress: UserProgress): void {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
}

/**
 * Update user progress with a completed problem
 * @param problemId The ID of the completed problem
 * @param topicId The ID of the topic the problem belongs to
 */
export function markProblemAsCompleted(problemId: string, topicId: string): void {
  try {
    let progress = getUserProgress();
    
    // If no progress exists, create a new one
    if (!progress) {
      progress = {
        overall: {
          problemsSolved: 0,
          totalProblems: 50, // This would come from S3 in a real implementation
          currentStreak: 0,
          longestStreak: 0
        },
        topics: {},
        recentActivity: []
      };
    }
    
    // Increment overall problems solved
    progress.overall.problemsSolved += 1;
    
    // Update topic progress
    if (!progress.topics[topicId]) {
      progress.topics[topicId] = {
        completed: 0,
        total: 15, // This would come from S3 in a real implementation
        percentage: 0
      };
    }
    
    progress.topics[topicId].completed += 1;
    progress.topics[topicId].percentage = Math.round(
      (progress.topics[topicId].completed / progress.topics[topicId].total) * 100
    );
    
    // Add to recent activity
    const today = new Date().toISOString().split('T')[0];
    progress.recentActivity.unshift({
      problemId,
      date: today,
      status: 'completed'
    });
    
    // Keep only the last 10 activities
    if (progress.recentActivity.length > 10) {
      progress.recentActivity = progress.recentActivity.slice(0, 10);
    }
    
    // Update streak (simplified logic)
    progress.overall.currentStreak += 1;
    if (progress.overall.currentStreak > progress.overall.longestStreak) {
      progress.overall.longestStreak = progress.overall.currentStreak;
    }
    
    // Save updated progress
    saveUserProgress(progress);
  } catch (error) {
    console.error('Error updating user progress:', error);
  }
}

/**
 * Initialize user progress with default values
 * @returns Initialized UserProgress object
 */
export function initializeUserProgress(): UserProgress {
  return {
    overall: {
      problemsSolved: 0,
      totalProblems: 50,
      currentStreak: 0,
      longestStreak: 0
    },
    topics: {},
    recentActivity: []
  };
}

/**
 * Get the completion status of a specific problem
 * @param problemId The ID of the problem to check
 * @returns Boolean indicating if the problem is completed
 */
export function isProblemCompleted(problemId: string): boolean {
  try {
    const progress = getUserProgress();
    if (!progress) return false;
    
    return progress.recentActivity.some(
      activity => activity.problemId === problemId && activity.status === 'completed'
    );
  } catch (error) {
    console.error('Error checking problem completion status:', error);
    return false;
  }
}

/**
 * Get progress percentage for a specific topic
 * @param topicId The ID of the topic
 * @returns Progress percentage (0-100)
 */
export function getTopicProgressPercentage(topicId: string): number {
  try {
    const progress = getUserProgress();
    if (!progress || !progress.topics[topicId]) return 0;
    
    return progress.topics[topicId].percentage;
  } catch (error) {
    console.error('Error getting topic progress:', error);
    return 0;
  }
}