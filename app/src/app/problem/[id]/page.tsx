'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
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
  ChevronUp,
  Save,
  Download,
  Upload,
  Zap,
  BarChart3,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Editor from '@monaco-editor/react';
import { ChatMessage } from '@/types/chat';
import { sendOpenRouterMessage, getOpenRouterConfig } from '@/lib/openrouter-client';
import { S3ClientService } from '@/lib/s3-client';
import { Problem, TestCase } from '@/types/problem';
import { executeJavaScriptCode, validateJavaScriptSyntax, analyzePerformance } from '@/lib/code-execution';
import { markProblemAsCompleted } from '@/lib/progress-tracking';
import { saveSolution, getSavedSolution, clearSolution } from '@/lib/solution-storage';
import { TestCaseLogsModal } from '@/components/ui/test-case-logs-modal';
import { ResizablePanel, VerticalResizablePanel } from '@/components/ui/resizable-panel';

// =====================================
// DUMMY DATA DEFINITIONS (for fallback)
// =====================================

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

// Format the problem context for AI
const formatProblemContext = (problem: Problem, code: string) => {
  return `Problem: ${problem.title}
Description: ${problem.description}
Current Code:
${code}

Important Instructions:
1. Always use single backticks (\`) for inline code highlights
2. Always use triple backticks (\`\`\`) for code blocks
3. Return all responses in proper format
4. Be precise and concise in your explanations`;
};

// Generate a unique key for localStorage based on problem ID
const getStorageKey = (problemId: string, type: 'code' | 'chat') => {
  return `dsa-ai-tutor-${problemId}-${type}`;
};

// Save code to localStorage
const saveCodeToStorage = (problemId: string, code: string) => {
  try {
    localStorage.setItem(getStorageKey(problemId, 'code'), code);
  } catch (error) {
    console.error('Failed to save code to localStorage:', error);
  }
};

// Load code from localStorage
const loadCodeFromStorage = (problemId: string): string | null => {
  try {
    return localStorage.getItem(getStorageKey(problemId, 'code'));
  } catch (error) {
    console.error('Failed to load code from localStorage:', error);
    return null;
  }
};

// Save chat messages to localStorage
const saveChatToStorage = (problemId: string, messages: ChatMessage[]) => {
  try {
    localStorage.setItem(getStorageKey(problemId, 'chat'), JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save chat to localStorage:', error);
  }
};

// Load chat messages from localStorage
const loadChatFromStorage = (problemId: string): ChatMessage[] | null => {
  try {
    const stored = localStorage.getItem(getStorageKey(problemId, 'chat'));
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load chat from localStorage:', error);
    return null;
  }
};

// Clear chat from localStorage
const clearChatFromStorage = (problemId: string) => {
  try {
    localStorage.removeItem(getStorageKey(problemId, 'chat'));
  } catch (error) {
    console.error('Failed to clear chat from localStorage:', error);
  }
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
      <div className="px-3 py-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onBackClick} className="h-7 w-7">
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{problem.title}</h1>
              <div className="flex items-center space-x-2 mt-0">
                <Badge className={`${getDifficultyColor(problem.difficulty)} text-xs py-0.5 px-1.5`}>
                  {problem.difficulty}
                </Badge>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock size={10} className="mr-1" />
                  {problem.timeEstimate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-0.5">
            <Button variant="ghost" size="icon" onClick={onHelpClick} className="h-7 w-7">
              <HelpCircle size={14} />
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings size={14} />
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

// Markdown Renderer Component
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ node, ...props }) => <p className="text-xs mb-2 last:mb-0" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-base font-bold mt-2 mb-1" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-sm font-bold mt-2 mb-1" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xs font-bold mt-2 mb-1" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside text-xs mb-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-xs mb-2" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        code: ({ node, className, children, ...props }: any) => {
          // Check if it's an inline code element
          // In react-markdown, code blocks are wrapped in a <pre> parent, inline code is not
          const isInline = !(node?.parent?.tagName === 'pre');
          
          if (isInline) {
            return (
              <code className="bg-gray-200 px-1 py-0.5 rounded text-xs" {...props}>
                {children}
              </code>
            );
          }
          
          // For block code, render pre directly without wrapping in p
          return (
            <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto my-2">
              <code {...props}>{children}</code>
            </pre>
          );
        },
        pre: ({ node, children, ...props }: any) => <pre {...props}>{children}</pre>,
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-2 border-gray-300 pl-2 text-gray-600 italic" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// AI Chat Component
const AIChat: React.FC<{
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onGetHint: () => void;
  isLoading: boolean;
  onClearChat: () => void;
}> = ({ messages, onSendMessage, onGetHint, isLoading, onClearChat }) => {
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
                <MarkdownRenderer content={message.content} />
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
            <Button
              variant="outline"
              size="lg"
              onClick={onClearChat}
              className="flex items-center h-7"
            >
              <X size={14} className="mr-1" />
              Clear Chat
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
  onSave: () => void;
  onLoad: () => void;
  isRunning: boolean;
}> = ({ code, onChange, onRun, onReset, onSubmit, onSave, onLoad, isRunning }) => {
  return (
    <Card className="border-0 shadow-lg h-full bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base font-medium">
            <Code2 className="mr-2 text-green-600" size={18} />
            Code Editor
          </CardTitle>
          <div className="flex space-x-2">
            {/* <Button variant="outline" size="sm" onClick={onLoad} className="h-8 text-xs">
              <Upload size={14} className="mr-1" />
              Load
            </Button> */}
            {/* <Button variant="outline" size="sm" onClick={onSave} className="h-8 text-xs">
              <Save size={14} className="mr-1" />
              Save
            </Button> */}
            <Button variant="outline" size="sm" onClick={onReset} className="h-8 text-xs">
              <RotateCcw size={14} className="mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={onRun} disabled={isRunning} className="h-8 text-xs">
              <Play size={14} className="mr-1" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
            {/* <Button size="sm" onClick={onSubmit} className="h-8 text-xs">
              <CheckCircle2 size={14} className="mr-1" />
              Submit
            </Button> */}
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
  onViewTestCaseLogs: (testCase: any) => void;
  allTestsPassed: boolean;
  performanceAnalysis?: {
    timeComplexity: string;
    spaceComplexity: string;
    averageExecutionTime: string;
    totalTime: string;
    performanceTips: string[];
  };
}> = ({ results, isVisible, onShowTerminal, onViewTestCaseLogs, allTestsPassed, performanceAnalysis }) => {
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
          <Badge variant={allTestsPassed ? "default" : "destructive"}>
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
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => onViewTestCaseLogs(result)}
                  >
                    View Logs
                  </Button>
                  <span className="text-xs text-gray-500">{result.executionTime}</span>
                  {result.memoryUsed && result.memoryUsed !== 'N/A' && (
                    <span className="text-xs text-gray-500">{result.memoryUsed}</span>
                  )}
                </div>
              </div>
              <div className="text-xs mt-1 truncate">
                {result.description}
              </div>
              {!result.passed && result.error && (
                <div className="text-xs mt-1 text-red-600">
                  Error: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Performance Analysis Section */}
        {performanceAnalysis && allTestsPassed && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center text-blue-800 mb-2">
              <BarChart3 className="mr-2" size={16} />
              <span className="text-sm font-medium">Performance Analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              
              <div>
                <span className="font-medium">Avg. Execution:</span> {performanceAnalysis.averageExecutionTime}
              </div>
              <div>
                <span className="font-medium">Total Time:</span> {performanceAnalysis.totalTime}
              </div>
            </div>
            {performanceAnalysis.performanceTips.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-xs">Optimization Tips:</span>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  {performanceAnalysis.performanceTips.map((tip, index) => (
                    <li key={index} className="text-blue-700">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {allTestsPassed && (
          <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded">
            <div className="flex items-center text-green-800">
              <CheckCircle2 className="mr-1" size={16} />
              <span className="text-sm font-medium">All tests passed! 🎉</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Congratulations! You've successfully solved this problem.
            </p>
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

  // State management
  const [problem, setProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [showTerminalView, setShowTerminalView] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Initialize as empty array
  const [isAILoading, setIsAILoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<any | null>(null);

  // Fetch problem data
  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from S3 first
        try {
          const [fetchedProblem, fetchedTestCases] = await Promise.all([
            S3ClientService.getProblemById(problemId),
            S3ClientService.getTestCasesByProblemId(problemId)
          ]);
          
          setProblem(fetchedProblem);
          setTestCases(fetchedTestCases);
          
          // Check if there's a saved solution
          const savedSolution = getSavedSolution(problemId) || loadCodeFromStorage(problemId);
          if (savedSolution) {
            setCode(savedSolution);
          } else {
            setCode(fetchedProblem.starterCode);
          }
          
          // Load chat messages from storage
          const savedChat = loadChatFromStorage(problemId);
          if (savedChat && savedChat.length > 0) {
            setMessages(savedChat);
          } else {
            // Set default welcome message only if no saved chat exists
            setMessages([{
              id: '1',
              type: 'ai',
              content: "Hi! I'm here to help you solve this problem. What would you like to know?",
              timestamp: new Date()
            }]);
          }
        } catch (s3Error) {
          // Fallback to mock data if S3 fails
          console.warn('Failed to fetch from S3, using mock data:', s3Error);
          
          const mockProblem = mockProblems[problemId];
          const mockTests = mockTestCases[problemId] || [];
          
          if (mockProblem) {
            setProblem(mockProblem);
            setTestCases(mockTests);
            
            // Check if there's a saved solution
            const savedSolution = getSavedSolution(problemId) || loadCodeFromStorage(problemId);
            if (savedSolution) {
              setCode(savedSolution);
            } else {
              setCode(mockProblem.starterCode);
            }
            
            // Load chat messages from storage
            const savedChat = loadChatFromStorage(problemId);
            if (savedChat && savedChat.length > 0) {
              setMessages(savedChat);
            } else {
              // Set default welcome message only if no saved chat exists
              setMessages([{
                id: '1',
                type: 'ai',
                content: "Hi! I'm here to help you solve this problem. What would you like to know?",
                timestamp: new Date()
              }]);
            }
          } else {
            throw new Error('Problem not found');
          }
        }
      } catch (error) {
        console.error('Error fetching problem data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblemData();
    }
  }, [problemId]);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    if (problemId && code) {
      saveCodeToStorage(problemId, code);
    }
  }, [code, problemId]);

  // Save chat messages to localStorage whenever they change
  useEffect(() => {
    if (problemId && messages.length > 0) {
      saveChatToStorage(problemId, messages);
    }
  }, [messages, problemId]);

  // If problem not found, redirect
  useEffect(() => {
    if (!loading && !problem && !error) {
      router.push('/');
    }
  }, [problem, router, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Problem</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} variant="default">
            Back to Problems
          </Button>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Problem Not Found</h2>
          <p className="text-gray-600 mb-6">The requested problem could not be found.</p>
          <Button onClick={() => router.push('/')} variant="default">
            Back to Problems
          </Button>
        </div>
      </div>
    );
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
    setAllTestsPassed(false);
    setPerformanceAnalysis(null);
    
    // Validate syntax first
    const syntaxValidation = validateJavaScriptSyntax(code);
    if (!syntaxValidation.valid) {
      setConsoleLogs([`> Syntax Error: ${syntaxValidation.error}`]);
      setIsRunning(false);
      setShowResults(true);
      setTestResults([{
        testCase: 0,
        passed: false,
        error: syntaxValidation.error,
        input: '',
        expected: '',
        actual: '',
        description: 'Syntax Validation',
        executionTime: '0ms',
        logs: []
      }]);
      return;
    }
    
    setConsoleLogs(['> Running tests...', '> Compiling JavaScript code...']);
    
    try {
      // Execute the code with test cases
      const results = await executeJavaScriptCode(code, testCases);
      setTestResults(results);
      setShowResults(true);
      
      // Check if all tests passed
      const allPassed = results.every(r => r.passed);
      setAllTestsPassed(allPassed);
      
      // If all tests passed, perform performance analysis
      if (allPassed) {
        // Mark problem as completed
        markProblemAsCompleted(problemId, problem.topic);
        
        // Perform performance analysis
        try {
          const analysis = await analyzePerformance(code, testCases);
          setPerformanceAnalysis(analysis);
          
          // Add performance analysis to console logs
          const analysisLogs = [
            '> Performance Analysis Complete',
            `> Time Complexity: ${analysis.timeComplexity}`,
            `> Space Complexity: ${analysis.spaceComplexity}`,
            `> Average Execution Time: ${analysis.averageExecutionTime}`,
            `> Total Time: ${analysis.totalTime}`
          ];
          
          if (analysis.performanceTips.length > 0) {
            analysisLogs.push('> Optimization Tips:');
            analysis.performanceTips.forEach(tip => analysisLogs.push(`  • ${tip}`));
          }
          
          setConsoleLogs(prev => [...prev, ...analysisLogs]);
        } catch (analysisError) {
          console.error('Performance analysis failed:', analysisError);
          setConsoleLogs(prev => [...prev, '> Performance analysis failed']);
        }
      }
      
      // Collect all console logs
      const allLogs: string[] = [];
      results.forEach(result => {
        allLogs.push(`--- Test ${result.testCase} ${result.passed ? 'PASSED' : 'FAILED'} ---`);
        if (result.logs && result.logs.length > 0) {
          allLogs.push(...result.logs);
        }
        // Add summary information
        allLogs.push(`Expected: ${result.expected}`);
        allLogs.push(`Actual: ${result.actual || 'null'}`);
        allLogs.push(`Execution Time: ${result.executionTime}`);
        if (!result.passed && result.error) {
          allLogs.push(`Error: ${result.error}`);
        }
      });
      
      // Add console logs
      const passedTests = results.filter(r => r.passed).length;
      const newLogs = [
        '> Tests completed!',
        `> ${passedTests}/${results.length} tests passed`,
        ...allLogs,
        allPassed ? '> All tests passed! 🎉' : '> Some tests failed. Check the results below.'
      ];
      setConsoleLogs(prev => [...prev, ...newLogs]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during test execution';
      setConsoleLogs(prev => [...prev, `> Error: ${errorMessage}`]);
      setTestResults([{
        testCase: 0,
        passed: false,
        error: errorMessage,
        input: '',
        expected: '',
        actual: '',
        description: 'Test Execution',
        executionTime: '0ms',
        logs: []
      }]);
      setShowResults(true);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(problem.starterCode);
    setShowResults(false);
    setTestResults([]);
    setShowConsole(false);
    setConsoleLogs([]);
    setAllTestsPassed(false);
  };

  const handleSubmit = () => {
    // Run tests when submitting
    handleRunTests();
  };

  const handleSaveSolution = () => {
    saveSolution(problemId, code);
    // Add a temporary message to the console
    setConsoleLogs(prev => [...prev, '> Solution saved successfully!']);
  };

  const handleLoadSolution = () => {
    const savedSolution = getSavedSolution(problemId);
    if (savedSolution) {
      setCode(savedSolution);
      setConsoleLogs(prev => [...prev, '> Solution loaded successfully!']);
    } else {
      setConsoleLogs(prev => [...prev, '> No saved solution found.']);
    }
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
          { role: 'user' as const, content: formatProblemContext(problem, code) },
          ...messages.map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
          { role: 'user' as const, content: `${message}\n\nPlease ensure your response follows these guidelines:\n1. Use single backticks (\`) for inline code highlights\n2. Use triple backticks (\`\`\`) for code blocks\n3. Return all responses in proper format\n4. Be precise and concise in your explanations` }
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

  // Add clear chat functionality
  const handleClearChat = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: "Hi! I'm here to help you solve this problem. What would you like to know?",
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    clearChatFromStorage(problemId);
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

      {/* Main Content - Full Width 3-Column Layout with Resizable Panels */}
      <div className="p-2 w-full">
        <div className="h-[calc(100vh-100px)]">
          <ResizablePanel
            leftPanel={
              <ResizablePanel
                leftPanel={<ProblemDescription problem={problem} />}
                rightPanel={
                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    onRun={handleRunTests}
                    onReset={handleReset}
                    onSubmit={handleSubmit}
                    onSave={handleSaveSolution}
                    onLoad={handleLoadSolution}
                    isRunning={isRunning}
                  />
                }
                initialLeftWidth={400}
                minLeftWidth={300}
                maxLeftWidth={800}
              />
            }
            rightPanel={
              <AIChat
                messages={messages}
                onSendMessage={handleSendMessage}
                onGetHint={handleGetHint}
                isLoading={isAILoading}
                onClearChat={handleClearChat}
              />
            }
            initialLeftWidth={800}
            minLeftWidth={600}
            maxLeftWidth={1200}
          />
        </div>

        {/* Bottom Section - Test Results */}
        <div className="mt-2">
          <TestResults
            results={testResults}
            isVisible={showResults}
            onShowTerminal={() => setShowTerminalView(true)}
            onViewTestCaseLogs={setSelectedTestCase}
            allTestsPassed={allTestsPassed}
            performanceAnalysis={performanceAnalysis}
          />
        </div>
      </div>

      {/* Terminal View Modal */}
      <ConsoleOutput
        logs={consoleLogs}
        isVisible={showTerminalView}
        onClose={() => setShowTerminalView(false)}
      />

      {/* Test Case Logs Modal */}
      <TestCaseLogsModal
        testCase={selectedTestCase}
        onClose={() => setSelectedTestCase(null)}
      />
    </div>
  );
}