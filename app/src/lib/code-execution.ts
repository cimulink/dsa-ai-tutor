/**
 * Safely executes JavaScript code in a sandboxed environment
 * @param code The JavaScript code to execute
 * @param testCases The test cases to run against the code
 * @returns Array of test results
 */
export async function executeJavaScriptCode(code: string, testCases: any[]): Promise<any[]> {
  try {
    // Create a new function from the user code
    // This is a simplified approach - in a production environment, 
    // you would want to use a more secure sandboxing mechanism
    const userFunction = new Function('return ' + code)();
    
    // Run each test case
    const results = await Promise.all(testCases.map(async (testCase, index) => {
      try {
        // Capture console output during execution
        const originalLog = console.log;
        const logs: string[] = [];
        console.log = (...args) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '));
        };
        
        // Start timing
        const startTime = performance.now();
        
        // Execute the user function with test case input
        let result;
        try {
          result = await Promise.resolve(userFunction(testCase.input));
        } catch (executionError) {
          // Restore console
          console.log = originalLog;
          
          return {
            testCase: index + 1,
            passed: false,
            error: executionError instanceof Error ? executionError.message : 'Execution error',
            input: JSON.stringify(testCase.input),
            expected: JSON.stringify(testCase.expected),
            actual: null,
            description: testCase.description,
            executionTime: '0ms',
            logs
          };
        }
        
        // End timing
        const endTime = performance.now();
        const executionTime = `${Math.round(endTime - startTime)}ms`;
        
        // Restore console
        console.log = originalLog;
        
        // Check if result matches expected output
        const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
        
        return {
          testCase: index + 1,
          passed,
          input: JSON.stringify(testCase.input),
          expected: JSON.stringify(testCase.expected),
          actual: JSON.stringify(result),
          description: testCase.description,
          executionTime,
          logs
        };
      } catch (error) {
        return {
          testCase: index + 1,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          input: JSON.stringify(testCase.input),
          expected: JSON.stringify(testCase.expected),
          actual: null,
          description: testCase.description,
          executionTime: '0ms',
          logs: []
        };
      }
    }));
    
    return results;
  } catch (error) {
    // If we can't create the function, return a general error
    return testCases.map((testCase, index) => ({
      testCase: index + 1,
      passed: false,
      error: error instanceof Error ? error.message : 'Failed to compile code',
      input: JSON.stringify(testCase.input),
      expected: JSON.stringify(testCase.expected),
      actual: null,
      description: testCase.description,
      executionTime: '0ms',
      logs: []
    }));
  }
}

/**
 * Validates that the code is syntactically correct
 * @param code The JavaScript code to validate
 * @returns True if valid, false otherwise
 */
export function validateJavaScriptSyntax(code: string): { valid: boolean; error?: string } {
  try {
    new Function(code);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Syntax error' 
    };
  }
}

/**
 * Analyze the performance characteristics of a solution
 * @param code The JavaScript code to analyze
 * @param testCases The test cases to run analysis on
 * @returns Performance analysis results
 */
export async function analyzePerformance(code: string, testCases: any[]): Promise<{
  timeComplexity: string;
  spaceComplexity: string;
  averageExecutionTime: string;
  totalTime: string;
  performanceTips: string[];
}> {
  try {
    // Execute the code to get timing data
    const results = await executeJavaScriptCode(code, testCases);
    
    // Calculate performance metrics
    const totalExecutionTime = results.reduce((sum, result) => {
      const time = parseInt(result.executionTime) || 0;
      return sum + time;
    }, 0);
    
    const averageExecutionTime = results.length > 0 ? Math.round(totalExecutionTime / results.length) : 0;
    
    // Simple heuristic for complexity analysis based on execution time growth
    // In a real implementation, this would be much more sophisticated
    let timeComplexity = 'Unknown';
    let spaceComplexity = 'Unknown';
    
    if (results.length > 0) {
      // For now, we'll use a simple heuristic based on the number of test cases and execution times
      // This is a very basic approximation and would need to be improved in a real application
      timeComplexity = averageExecutionTime < 10 ? 'O(1) or O(log n)' : 
                      averageExecutionTime < 100 ? 'O(n) or O(n log n)' : 
                      'O(n²) or higher';
      
      spaceComplexity = 'Depends on implementation';
    }
    
    // Performance tips based on execution time
    const performanceTips: string[] = [];
    if (averageExecutionTime > 100) {
      performanceTips.push('Consider optimizing your algorithm for better time complexity');
    }
    
    return {
      timeComplexity,
      spaceComplexity,
      averageExecutionTime: `${averageExecutionTime}ms`,
      totalTime: `${totalExecutionTime}ms`,
      performanceTips
    };
  } catch (error) {
    return {
      timeComplexity: 'Analysis failed',
      spaceComplexity: 'Analysis failed',
      averageExecutionTime: '0ms',
      totalTime: '0ms',
      performanceTips: [`Error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}