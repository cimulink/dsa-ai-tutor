/**
 * Solution storage utility for saving and retrieving user solutions
 */

// Local storage key prefix for solutions
const SOLUTION_STORAGE_PREFIX = 'dsa_ai_tutor_solution_';

/**
 * Save a user's solution for a specific problem
 * @param problemId The ID of the problem
 * @param solutionCode The user's solution code
 */
export function saveSolution(problemId: string, solutionCode: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    const key = `${SOLUTION_STORAGE_PREFIX}${problemId}`;
    localStorage.setItem(key, solutionCode);
  } catch (error) {
    console.error(`Error saving solution for problem ${problemId}:`, error);
  }
}

/**
 * Retrieve a user's saved solution for a specific problem
 * @param problemId The ID of the problem
 * @returns The saved solution code or null if not found
 */
export function getSavedSolution(problemId: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const key = `${SOLUTION_STORAGE_PREFIX}${problemId}`;
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error retrieving solution for problem ${problemId}:`, error);
    return null;
  }
}

/**
 * Clear a user's saved solution for a specific problem
 * @param problemId The ID of the problem
 */
export function clearSolution(problemId: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    const key = `${SOLUTION_STORAGE_PREFIX}${problemId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing solution for problem ${problemId}:`, error);
  }
}

/**
 * Clear all saved solutions
 */
export function clearAllSolutions(): void {
  try {
    if (typeof window === 'undefined') return;
    
    // Get all keys in localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SOLUTION_STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all solution keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing all solutions:', error);
  }
}

/**
 * Get a list of all problem IDs with saved solutions
 * @returns Array of problem IDs
 */
export function getSavedSolutionIds(): string[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const solutionIds: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SOLUTION_STORAGE_PREFIX)) {
        const problemId = key.replace(SOLUTION_STORAGE_PREFIX, '');
        solutionIds.push(problemId);
      }
    }
    
    return solutionIds;
  } catch (error) {
    console.error('Error getting saved solution IDs:', error);
    return [];
  }
}