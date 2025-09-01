'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Settings, 
  HelpCircle, 
  Play, 
  RotateCcw, 
  CheckCircle2,
  Send,
  Lightbulb,
  MessageCircle,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Code2,
  Terminal,
  FileText,
  Bot,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Editor from '@monaco-editor/react';
import { ChatMessage } from '@/types/chat';
import { sendOpenRouterMessage, getOpenRouterConfig } from '@/lib/openrouter-client';

// =====================================
// DUMMY DATA DEFINITIONS
// =====================================

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: string;
  solution: string;
  hints: string[];
  timeEstimate: string;
  companies: string[];
  topic: string;
}

interface TestCase {
  input: any;
  expected: any;
  description: string;
}

// Mock Problems Database
const mockProblems: Record<string, Problem> = {
  'two-sum': {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      '-10⁹ ≤ target ≤ 10⁹',
      'Only one valid answer exists.'
    ],
    starterCode: `function twoSum(nums, target) {
    // Your code here
    
}`,
    solution: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`,
    hints: [
      'Think about what data structure can help you look up values quickly.',
      'Consider using a hash map to store numbers you\'ve seen and their indices.',
      'For each number, check if (target - current number) exists in your hash map.'
    ],
    timeEstimate: '15 min',
    companies: ['Google', 'Facebook', 'Amazon', 'Microsoft'],
    topic: 'arrays'
  },
  'merge-intervals': {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].'
      }
    ],
    constraints: [
      '1 ≤ intervals.length ≤ 10⁴',
      'intervals[i].length == 2',
      '0 ≤ starti ≤ endi ≤ 10⁴'
    ],
    starterCode: `function merge(intervals) {
    // Your code here
    
}`,
    solution: `function merge(intervals) {
    if (intervals.length <= 1) return intervals;
    
    intervals.sort((a, b) => a[0] - b[0]);
    
    const result = [intervals[0]];
    
    for (let i = 1; i < intervals.length; i++) {
        const current = intervals[i];
        const last = result[result.length - 1];
        
        if (current[0] <= last[1]) {
            last[1] = Math.max(last[1], current[1]);
        } else {
            result.push(current);
        }
    }
    
    return result;
}`,
    hints: [
      'Consider sorting the intervals first by their start time.',
      'Think about when two intervals overlap - when does the start of one interval fall within another?',
      'You can merge intervals by updating the end time of the previous interval.'
    ],
    timeEstimate: '25 min',
    companies: ['Microsoft', 'Amazon', 'Google'],
    topic: 'arrays'
  }
};

// Mock Test Cases
const mockTestCases: Record<string, TestCase[]> = {
  'two-sum': [
    {
      input: { nums: [2, 7, 11, 15], target: 9 },
      expected: [0, 1],
      description: 'Basic case with solution at beginning'
    },
    {
      input: { nums: [3, 2, 4], target: 6 },
      expected: [1, 2],
      description: 'Solution not at beginning'
    },
    {
      input: { nums: [3, 3], target: 6 },
      expected: [0, 1],
      description: 'Duplicate numbers'
    }
  ],
  'merge-intervals': [
    {
      input: { intervals: [[1,3],[2,6],[8,10],[15,18]] },
      expected: [[1,6],[8,10],[15,18]],
      description: 'Multiple overlapping intervals'
    },
    {
      input: { intervals: [[1,4],[4,5]] },
      expected: [[1,5]],
      description: 'Adjacent intervals'
    }
  ]
};

// Mock AI Responses - will be replaced with real AI
const mockAIResponses = [
  "Hi! I'm here to help you solve this problem. What would you like to know?",
  "Great question! Let's think about this step by step...",
  "This is a classic problem that can be solved efficiently using a hash map approach.",
  "The key insight is to think about what information you need to store as you iterate through the array.",
  "Consider the time and space complexity of your current approach. Can we optimize it?"
];

// =====================================
// UTILITY FUNCTIONS
// =====================================

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
    case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Hard': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const executeCode = (code: string, testCases: TestCase[]): any[] => {
  // Mock code execution - in reality, this would run in a sandboxed environment
  try {
    // Simple mock execution for demo
    const results = testCases.map((testCase, index) => {
      // Simulate test execution
      const passed = Math.random() > 0.3; // 70% pass rate for demo
      return {
        testCase: index + 1,
        passed,
        input: JSON.stringify(testCase.input),
        expected: JSON.stringify(testCase.expected),
        actual: passed ? JSON.stringify(testCase.expected) : '[]',
        description: testCase.description,
        executionTime: `${Math.floor(Math.random() * 50) + 10}ms`
      };
    });
    return results;
  } catch (error) {
    return testCases.map((_, index) => ({
      testCase: index + 1,
      passed: false,
      error: 'Runtime Error',
      input: '',
      expected: '',
      actual: '',
      description: 'Code execution failed',
      executionTime: '0ms'
    }));
  }
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

// Format the problem context for AI
const formatProblemContext = (problem: Problem, code: string) => {
  return `Problem: ${problem.title}
Description: ${problem.description}
Current Code:
${code}`;
};

// =====================================
// CHILD COMPONENTS
// =====================================

// Header Component
const ProblemWorkspaceHeader: React.FC<{
  problem: Problem;
  onBackClick: () => void;
  onSettingsClick: () => void;
  onHelpClick: () => void;
}> = ({ problem, onBackClick, onSettingsClick, onHelpClick }) => {
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={onBackClick} className="h-8 w-8">
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{problem.title}</h1>
              <div className="flex items-center space-x-2 mt-0.5">
                <Badge className={`${getDifficultyColor(problem.difficulty)} text-xs py-0.5`}>
                  {problem.difficulty}
                </Badge>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock size={12} className="mr-1" />
                  {problem.timeEstimate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={onHelpClick} className="h-8 w-8">
              <HelpCircle size={16} />
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

// Problem Description Component (Left Column - Compact)
const ProblemDescription: React.FC<{ problem: Problem }> = ({ problem }) => {
  return (
    <Card className="h-full border-0 shadow-lg bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <FileText className="mr-2 text-blue-600" size={16} />
          Problem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
        {/* Title and Difficulty */}
        <div className="border-b pb-2">
          <h2 className="text-base font-bold text-gray-900 mb-1">{problem.title}</h2>
          <div className="flex items-center space-x-2">
            <Badge className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
            <span className="text-xs text-gray-500 flex items-center">
              <Clock size={10} className="mr-1" />
              {problem.timeEstimate}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
            {problem.description}
          </p>
        </div>

        {/* Examples */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 text-xs">Examples:</h3>
          <div className="space-y-2">
            {problem.examples.map((example, index) => (
              <div key={index} className="bg-gray-50 rounded p-2">
                <div className="font-medium text-xs text-gray-600 mb-1">Example {index + 1}:</div>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="font-medium">Input:</span> 
                    <code className="bg-gray-200 px-1 py-0.5 rounded ml-1">{example.input}</code>
                  </div>
                  <div>
                    <span className="font-medium">Output:</span> 
                    <code className="bg-gray-200 px-1 py-0.5 rounded ml-1">{example.output}</code>
                  </div>
                  {example.explanation && (
                    <div className="text-gray-600">
                      <span className="font-medium">Explanation:</span> {example.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 text-xs">Constraints:</h3>
          <ul className="space-y-1">
            {problem.constraints.map((constraint, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-start">
                <span className="text-blue-500 mr-1 text-xs">•</span>
                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{constraint}</code>
              </li>
            ))}
          </ul>
        </div>

        {/* Companies */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 text-xs">Asked by:</h3>
          <div className="flex flex-wrap gap-1">
            {problem.companies.slice(0, 3).map((company, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1.5 py-0 bg-white">
                {company}
              </Badge>
            ))}
            {problem.companies.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 bg-white">
                +{problem.companies.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// AI Chat Component
const AIChat: React.FC<{
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onGetHint: () => void;
  isLoading: boolean;
}> = ({ messages, onSendMessage, onGetHint, isLoading }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full border-0 shadow-lg flex flex-col bg-white">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center text-base">
          <Bot className="mr-2 text-purple-600" size={18} />
          AI Tutor Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[300px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-xs">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t bg-gray-50 flex-shrink-0">
          <div className="flex space-x-2 mb-2">
            <Button
              variant="outline"
              size="lg"
              onClick={onGetHint}
              className="flex items-center h-7"
            >
              <Lightbulb size={14} className="mr-1" />
              Hint
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onSendMessage("Can you explain this problem?")}
              className="flex items-center h-7"
            >
              <MessageCircle size={14} className="mr-1" />
              Explain
            </Button>
          </div>
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              className="flex-1 text-xs"
            />
            <Button size="sm" onClick={handleSend} disabled={!newMessage.trim()} className="h-8">
              <Send size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Code Editor Component
const CodeEditor: React.FC<{
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  onSubmit: () => void;
  isRunning: boolean;
}> = ({ code, onChange, onRun, onReset, onSubmit, isRunning }) => {
  return (
    <Card className="border-0 shadow-lg h-full bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base font-medium">
            <Code2 className="mr-2 text-green-600" size={18} />
            Code Editor
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onReset} className="h-8 text-xs">
              <RotateCcw size={14} className="mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={onRun} disabled={isRunning} className="h-8 text-xs">
              <Play size={14} className="mr-1" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
            <Button size="sm" onClick={onSubmit} className="h-8 text-xs">
              <CheckCircle2 size={14} className="mr-1" />
              Submit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t">
          <Editor
            height="calc(100vh - 250px)"
            defaultLanguage="javascript"
            value={code}
            onChange={(value) => onChange(value || '')}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              glyphMargin: false,
              folding: false,
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              autoIndent: 'full'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Console Output Component (Terminal View)
const ConsoleOutput: React.FC<{
  logs: string[];
  isVisible: boolean;
  onClose: () => void;
}> = ({ logs, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Terminal Output</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900 text-green-400 font-mono text-sm">
          <div className="space-y-1">
            {logs.length === 0 ? (
              <div className="text-gray-500">Console output will appear here...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Test Results Component (Compact View)
const TestResults: React.FC<{
  results: any[];
  isVisible: boolean;
  onShowTerminal: () => void;
}> = ({ results, isVisible, onShowTerminal }) => {
  if (!isVisible) return null;

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base">
            <Terminal className="mr-2 text-blue-600" size={18} />
            Test Results
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onShowTerminal} className="h-8 text-xs">
            View Terminal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <Badge variant={passedTests === totalTests ? "default" : "destructive"}>
            {passedTests}/{totalTests} Passed
          </Badge>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className={`border rounded p-2 ${
                result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {result.passed ? '✓' : '✗'} Test {result.testCase}
                </span>
                <span className="text-xs text-gray-500">{result.executionTime}</span>
              </div>
              <div className="text-xs mt-1 truncate">
                {result.description}
              </div>
            </div>
          ))}
        </div>
        
        {passedTests === totalTests && (
          <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded">
            <div className="flex items-center text-green-800">
              <CheckCircle2 className="mr-1" size={16} />
              <span className="text-sm font-medium">All tests passed! 🎉</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// =====================================
// MAIN PROBLEM WORKSPACE COMPONENT
// =====================================

export default function ProblemWorkspace() {
  const params = useParams();
  const router = useRouter();
  const problemId = params.id as string;

  // Get problem data
  const problem = mockProblems[problemId];
  const testCases = mockTestCases[problemId] || [];

  // State management
  const [code, setCode] = useState(problem?.starterCode || '');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [showTerminalView, setShowTerminalView] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm here to help you solve this problem. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [isAILoading, setIsAILoading] = useState(false);

  // If problem not found, redirect
  useEffect(() => {
    if (!problem) {
      router.push('/');
    }
  }, [problem, router]);

  if (!problem) {
    return <div>Problem not found</div>;
  }

  // Event handlers
  const handleBackClick = () => {
    router.push('/');
  };

  const handleSettingsClick = () => {
    // For now, we'll show an alert, but this should open a settings modal
    alert('Settings would open here. You can configure your OpenRouter API key in the settings.');
  };

  const handleHelpClick = () => {
    alert('Help documentation would open here');
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setShowResults(false);
    setShowConsole(true);
    setConsoleLogs(['> Running tests...', '> Compiling JavaScript code...']);
    
    // Simulate test execution delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = executeCode(code, testCases);
    setTestResults(results);
    setShowResults(true);
    
    // Add console logs
    const passedTests = results.filter(r => r.passed).length;
    const newLogs = [
      '> Tests completed!',
      `> ${passedTests}/${results.length} tests passed`,
      `> Execution time: ${results.reduce((acc, r) => acc + parseInt(r.executionTime), 0)}ms`,
      passedTests === results.length ? '> All tests passed! 🎉' : '> Some tests failed. Check the results below.'
    ];
    setConsoleLogs(prev => [...prev, ...newLogs]);
    
    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(problem.starterCode);
    setShowResults(false);
    setTestResults([]);
    setShowConsole(false);
    setConsoleLogs([]);
  };

  const handleSubmit = () => {
    alert('Solution submitted! In a real app, this would save your progress.');
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsAILoading(true);

    try {
      // Check if OpenRouter is configured
      const config = getOpenRouterConfig();
      
      if (config) {
        // Use real OpenRouter API
        const aiMessages = [
          { role: 'user', content: formatProblemContext(problem, code) },
          ...messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: message }
        ];
      
        const aiResponse = await sendOpenRouterMessage(aiMessages, config);
      
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
      
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Fallback to mock responses if no API key is configured
        // Simulate AI response delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `💡 Please configure your OpenRouter API key in Settings to get real AI assistance. 
        In the meantime, I can provide general guidance: ${mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)]}`,
          timestamp: new Date()
        };
      
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your OpenRouter configuration in Settings.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleGetHint = async () => {
    const randomHint = problem.hints[Math.floor(Math.random() * problem.hints.length)];
    await handleSendMessage("Can you give me a hint?");
    
    setTimeout(async () => {
      const hintMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: `💡 Hint: ${randomHint}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, hintMessage]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ProblemWorkspaceHeader
        problem={problem}
        onBackClick={handleBackClick}
        onSettingsClick={handleSettingsClick}
        onHelpClick={handleHelpClick}
      />

      {/* Main Content - Full Width 3-Column Layout */}
      <div className="p-3 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-120px)]">
          {/* Left Column - Problem Description */}
          <div className="lg:col-span-3 h-full">
            <ProblemDescription problem={problem} />
          </div>

          {/* Middle Column - Code Editor */}
          <div className="lg:col-span-6 h-full">
            <CodeEditor
              code={code}
              onChange={setCode}
              onRun={handleRunTests}
              onReset={handleReset}
              onSubmit={handleSubmit}
              isRunning={isRunning}
            />
          </div>

          {/* Right Column - AI Chat */}
          <div className="lg:col-span-3 h-full">
            <AIChat
              messages={messages}
              onSendMessage={handleSendMessage}
              onGetHint={handleGetHint}
              isLoading={isAILoading}
            />
          </div>
        </div>

        {/* Bottom Section - Test Results */}
        <div className="mt-3">
          <TestResults
            results={testResults}
            isVisible={showResults}
            onShowTerminal={() => setShowTerminalView(true)}
          />
        </div>
      </div>

      {/* Terminal View Modal */}
      <ConsoleOutput
        logs={consoleLogs}
        isVisible={showTerminalView}
        onClose={() => setShowTerminalView(false)}
      />

      {/* Progress Footer */}
      <div className="mt-3 px-3 pb-3">
        <Card className="border shadow-sm bg-white">
          <CardContent className="p-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <ChevronLeft size={12} className="mr-1" />
                  Previous
                </Button>
                <span className="text-xs text-gray-600">
                  Problem 1 of 15 • Arrays
                </span>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Next
                  <ChevronRight size={12} className="ml-1" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Progress:</span>
                <div className="w-20 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '13%' }}></div>
                </div>
                <span className="text-xs font-medium">2/15</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}