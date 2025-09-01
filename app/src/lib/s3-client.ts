import { Problem, TestCase, Topic, UserProgress } from '@/types/problem';
import { getUserProgress, saveUserProgress, initializeUserProgress } from '@/lib/progress-tracking';

// S3 bucket configuration
const S3_BUCKET_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:8000' 
  : 'https://dsa-ai-tutor-content.s3.amazonaws.com';
const S3_REGION = 'us-east-1';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// In-memory cache for S3 content
const cache: Record<string, { data: any; timestamp: number }> = {};

/**
 * Fetch data from S3 with caching
 */
async function fetchFromS3<T>(path: string): Promise<T> {
  const cacheKey = path;
  const now = Date.now();
  
  // Check if we have valid cached data
  if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_DURATION) {
    return cache[cacheKey].data as T;
  }
  
  try {
    const response = await fetch(`${S3_BUCKET_URL}${path}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from S3: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the data
    cache[cacheKey] = {
      data,
      timestamp: now
    };
    
    return data as T;
  } catch (error) {
    console.error(`Error fetching from S3 ${path}:`, error);
    throw new Error(`Failed to fetch data from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a specific problem by ID
 */
export async function getProblemById(id: string): Promise<Problem> {
  try {
    return await fetchFromS3<Problem>(`/problems/${id}.json`);
  } catch (error) {
    console.error(`Error fetching problem ${id}:`, error);
    throw error;
  }
}

/**
 * Get all problems for a specific topic
 */
export async function getProblemsByTopic(topic: string): Promise<Problem[]> {
  try {
    return await fetchFromS3<Problem[]>(`/topics/${topic}/problems.json`);
  } catch (error) {
    console.error(`Error fetching problems for topic ${topic}:`, error);
    throw error;
  }
}

/**
 * Get test cases for a specific problem
 */
export async function getTestCasesByProblemId(problemId: string): Promise<TestCase[]> {
  try {
    return await fetchFromS3<TestCase[]>(`/testcases/${problemId}.json`);
  } catch (error) {
    console.error(`Error fetching test cases for problem ${problemId}:`, error);
    throw error;
  }
}

/**
 * Get all topics
 */
export async function getAllTopics(): Promise<Topic[]> {
  try {
    return await fetchFromS3<Topic[]>('/topics.json');
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
}

/**
 * Get user progress
 */
export async function getUserProgressFromS3(): Promise<UserProgress> {
  try {
    // Try to get progress from localStorage first
    const localProgress = getUserProgress();
    if (localProgress) {
      return localProgress;
    }
    
    // If no local progress, initialize with default values
    const initialProgress = initializeUserProgress();
    saveUserProgress(initialProgress);
    return initialProgress;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
}

/**
 * Save user progress
 */
export async function saveUserProgressToS3(progress: UserProgress): Promise<void> {
  try {
    // Save to localStorage
    saveUserProgress(progress);
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
}

/**
 * Clear the S3 cache
 */
export function clearS3Cache(): void {
  Object.keys(cache).forEach(key => delete cache[key]);
}

// Export the S3 client functions
export const S3ClientService = {
  getProblemById,
  getProblemsByTopic,
  getTestCasesByProblemId,
  getAllTopics,
  getUserProgress: getUserProgressFromS3,
  saveUserProgress: saveUserProgressToS3,
  clearS3Cache
};