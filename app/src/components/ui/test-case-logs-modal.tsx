import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface TestCaseLogsModalProps {
  testCase: {
    testCase: number;
    description: string;
    logs: string[];
    passed: boolean;
    error?: string;
    input: string;
    expected: string;
    actual: string;
    executionTime: string;
  } | null;
  onClose: () => void;
}

export const TestCaseLogsModal: React.FC<TestCaseLogsModalProps> = ({ testCase, onClose }) => {
  if (!testCase) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <CardTitle className="text-lg font-semibold">
            Test Case {testCase.testCase}: {testCase.description}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-medium text-sm mb-1">Input</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{testCase.input}</pre>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-medium text-sm mb-1">Expected Output</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{testCase.expected}</pre>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-medium text-sm mb-1">Actual Output</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{testCase.actual || 'N/A'}</pre>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-medium text-sm mb-1">Execution Time</h3>
              <p className="text-xs">{testCase.executionTime}</p>
              <h3 className="font-medium text-sm mt-2 mb-1">Status</h3>
              <p className={`text-xs font-medium ${testCase.passed ? 'text-green-600' : 'text-red-600'}`}>
                {testCase.passed ? 'PASSED' : 'FAILED'}
              </p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm mb-2">Console Logs</h3>
            {testCase.logs && testCase.logs.length > 0 ? (
              <div className="bg-gray-900 text-green-400 font-mono text-xs p-3 rounded overflow-y-auto max-h-40">
                {testCase.logs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap mb-1 last:mb-0">{log}</div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No console logs for this test case.</p>
            )}
          </div>
          
          {!testCase.passed && testCase.error && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-sm mb-2 text-red-600">Error</h3>
              <pre className="text-xs bg-red-50 p-3 rounded text-red-800 overflow-x-auto">{testCase.error}</pre>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
};