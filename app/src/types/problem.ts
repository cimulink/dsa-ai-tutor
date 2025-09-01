export interface Problem {
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
  solution?: string;
  hints: string[];
  timeEstimate: string;
  companies: string[];
  topic: string;
}

export interface TestCase {
  input: any;
  expected: any;
  description: string;
}

export interface Topic {
  id: string;
  name: string;
  count: number;
  completed: number;
  icon: string;
  color: string;
  description: string;
}

export interface UserProgress {
  overall: {
    problemsSolved: number;
    totalProblems: number;
    currentStreak: number;
    longestStreak: number;
  };
  topics: Record<string, {
    completed: number;
    total: number;
    percentage: number;
  }>;
  recentActivity: {
    problemId: string;
    date: string;
    status: 'completed' | 'attempted';
  }[];
}