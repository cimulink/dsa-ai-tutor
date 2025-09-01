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
    
    // Run each test case sequentially to avoid console.log conflicts
    const results = [];
    for (let index = 0; index < testCases.length; index++) {
      const testCase = testCases[index];
      const testCaseNumber = index + 1; // Store the test case number for use in the catch block
      
      // Capture console output during execution
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        const logEntry = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        logs.push(logEntry);
      };
      
      try {
        // Add a log to indicate test case start
        console.log(`--- Starting Test Case ${testCaseNumber} ---`);
        
        // Start timing
        const startTime = performance.now();
        
        // Execute the user function with test case input
        // Fix: Extract the actual parameters from the input object
        let result;
        try {
          // Convert the input object to individual parameters
          const inputParams = testCase.input;
          console.log(`Input parameters: ${JSON.stringify(inputParams)}`);
          
          if (typeof inputParams === 'object' && inputParams !== null) {
            // Get the keys and values from the input object
            const paramKeys = Object.keys(inputParams);
            const paramValues = Object.values(inputParams);
            console.log(`Calling function with parameters: ${paramKeys.join(', ')} = ${paramValues.map(v => JSON.stringify(v)).join(', ')}`);
            
            // Get the values from the input object and pass them as separate arguments
            result = await Promise.resolve(userFunction(...paramValues));
          } else {
            // For backward compatibility, pass the input directly if it's not an object
            console.log(`Calling function with direct input: ${JSON.stringify(inputParams)}`);
            result = await Promise.resolve(userFunction(inputParams));
          }
          
          console.log(`Function returned: ${JSON.stringify(result)}`);
        } catch (executionError) {
          // Restore console
          console.log = originalLog;
          
          results.push({
            testCase: testCaseNumber,
            passed: false,
            error: executionError instanceof Error ? executionError.message : 'Execution error',
            input: JSON.stringify(testCase.input),
            expected: JSON.stringify(testCase.expected),
            actual: null,
            description: testCase.description,
            executionTime: '0ms',
            logs
          });
          continue; // Continue to the next test case
        }
        
        // End timing
        const endTime = performance.now();
        const executionTime = `${Math.round(endTime - startTime)}ms`;
        
        // Check if result matches expected output
        const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
        
        results.push({
          testCase: testCaseNumber,
          passed,
          input: JSON.stringify(testCase.input),
          expected: JSON.stringify(testCase.expected),
          actual: JSON.stringify(result),
          description: testCase.description,
          executionTime,
          logs
        });
      } catch (error) {
        // Make sure console is restored even in case of errors
        if (console.log !== originalLog) {
          console.log = originalLog;
        }
        
        results.push({
          testCase: testCaseNumber,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          input: JSON.stringify(testCase.input),
          expected: JSON.stringify(testCase.expected),
          actual: null,
          description: testCase.description,
          executionTime: '0ms',
          logs: []
        });
      } finally {
        // Always restore console
        if (console.log !== originalLog) {
          console.log = originalLog;
        }
      }
    }
    
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