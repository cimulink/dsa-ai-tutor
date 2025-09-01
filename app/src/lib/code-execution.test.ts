const { executeJavaScriptCode } = require('./code-execution');

// Test the code execution with a simple function
async function testCodeExecution() {
  const code = `function add(a, b) {
    console.log('Adding', a, 'and', b);
    return a + b;
  }
  add`;
  
  const testCases = [
    {
      input: { a: 2, b: 3 },
      expected: 5,
      description: 'Simple addition'
    }
  ];
  
  try {
    const results = await executeJavaScriptCode(code, testCases);
    console.log('Test Results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error during test execution:', error);
  }
}

testCodeExecution();