'use client';

import React, { useState, useEffect } from 'react';
import { Search, Settings, Brain, Zap, ChevronRight, Play, RotateCcw, CheckCircle, GraduationCap, Clock, Target, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// =====================================
// DUMMY DATA DEFINITIONS
// =====================================

// Mock problem data structure
interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  completed: boolean;
  inProgress?: boolean;
  lastAttempt?: string;
  topic: string;
  timeEstimate?: string;
  companies?: string[];
}

// Mock topic data structure
interface Topic {
  id: string;
  name: string;
  count: number;
  completed: number;
  icon: string;
  active?: boolean;
  color: string;
  description: string;
}

// Mock user progress data
interface UserProgress {
  overall: {
    problemsSolved: number;
    totalProblems: number;
    currentStreak: number;
  };
  lastWorkedOn: {
    title: string;
    topic: string;
    timeAgo: string;
  };
  weeklyGoal: {
    target: number;
    completed: number;
  };
}

// Enhanced dummy data for problems
const mockProblems: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    description: "Find two numbers that add to target",
    completed: true,
    lastAttempt: "2 days ago",
    topic: "arrays",
    timeEstimate: "15 min",
    companies: ["Google", "Facebook"]
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium", 
    description: "Combine overlapping intervals",
    completed: false,
    inProgress: true,
    topic: "arrays",
    timeEstimate: "25 min",
    companies: ["Microsoft", "Amazon"]
  },
  {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Hard",
    description: "Find contiguous subarray with max sum",
    completed: false,
    topic: "arrays",
    timeEstimate: "35 min",
    companies: ["Netflix", "Apple"]
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Determine if parentheses are valid",
    completed: false,
    topic: "strings",
    timeEstimate: "20 min",
    companies: ["Uber", "Airbnb"]
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Find the longest substring without repeating characters",
    completed: false,
    topic: "strings",
    timeEstimate: "30 min",
    companies: ["LinkedIn", "Tesla"]
  },
  {
    id: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    description: "Group strings that are anagrams",
    completed: false,
    topic: "hashmaps",
    timeEstimate: "25 min",
    companies: ["Spotify", "Dropbox"]
  }
];

// Enhanced dummy data for topics
const mockTopics: Topic[] = [
  { 
    id: "arrays", 
    name: "Arrays", 
    count: 15, 
    completed: 2, 
    icon: "📊", 
    active: true, 
    color: "from-blue-400 to-blue-600",
    description: "Linear data structures with indexed elements"
  },
  { 
    id: "strings", 
    name: "Strings", 
    count: 12, 
    completed: 0, 
    icon: "📝", 
    color: "from-green-400 to-green-600",
    description: "Text manipulation and pattern matching"
  },
  { 
    id: "hashmaps", 
    name: "Hash Maps", 
    count: 10, 
    completed: 0, 
    icon: "🗃️", 
    color: "from-purple-400 to-purple-600",
    description: "Key-value data structures for fast lookup"
  },
  { 
    id: "recursion", 
    name: "Recursion", 
    count: 6, 
    completed: 0, 
    icon: "🔄", 
    color: "from-orange-400 to-orange-600",
    description: "Self-calling functions and divide-conquer"
  },
  { 
    id: "algorithms", 
    name: "Algorithms", 
    count: 8, 
    completed: 0, 
    icon: "⚡", 
    color: "from-red-400 to-red-600",
    description: "Step-by-step problem solving techniques"
  }
];

// Enhanced user progress data
const mockUserProgress: UserProgress = {
  overall: {
    problemsSolved: 12,
    totalProblems: 50,
    currentStreak: 3
  },
  lastWorkedOn: {
    title: "Two Sum",
    topic: "Arrays",
    timeAgo: "2 days ago"
  },
  weeklyGoal: {
    target: 5,
    completed: 3
  }
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

// Get difficulty color styling
const getDifficultyVariant = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'secondary';
    case 'Medium': return 'default';
    case 'Hard': return 'destructive';
    default: return 'outline';
  }
};

// Get difficulty emoji
const getDifficultyEmoji = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy': return '🟢';
    case 'Medium': return '🟡';
    case 'Hard': return '🔴';
    default: return '⚪';
  }
};

// =====================================
// CHILD COMPONENTS
// =====================================

// Enhanced Header component with modern design
const Header: React.FC<{ onSettingsClick: () => void; onLearnModeClick: () => void }> = ({ 
  onSettingsClick, 
  onLearnModeClick 
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DSA AI Tutor
              </div>
              <div className="text-xs text-muted-foreground -mt-1">Master Data Structures & Algorithms</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={onLearnModeClick} className="hidden sm:flex">
              <Brain size={18} className="mr-2" />
              Learn Mode
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

// Enhanced Welcome message component
const WelcomeMessage: React.FC<{ userProgress: UserProgress }> = ({ userProgress }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! Ready to level up? 🚀
            </h1>
            <p className="text-gray-600 flex items-center">
              <Clock size={16} className="mr-2" />
              Last worked on: <span className="font-medium ml-1">{userProgress.lastWorkedOn.title}</span> 
              <span className="text-muted-foreground mx-1">in</span> 
              <span className="font-medium">{userProgress.lastWorkedOn.topic}</span> 
              <span className="text-muted-foreground ml-1">• {userProgress.lastWorkedOn.timeAgo}</span>
            </p>
          </div>
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userProgress.overall.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userProgress.weeklyGoal.completed}/{userProgress.weeklyGoal.target}</div>
              <div className="text-sm text-muted-foreground">Weekly Goal 🎯</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userProgress.overall.problemsSolved}</div>
              <div className="text-sm text-muted-foreground">Problems Solved ✨</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Topic navigation component
const TopicNavigation: React.FC<{ 
  topics: Topic[];
  activeTopic: string;
  onTopicSelect: (topicId: string) => void;
}> = ({ topics, activeTopic, onTopicSelect }) => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target size={20} className="mr-2 text-blue-600" />
          Choose Your Focus Area
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                activeTopic === topic.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onTopicSelect(topic.id)}
            >
              <CardContent className="p-4">
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${topic.color} mb-3`} />
                <div className="text-center">
                  <div className="text-3xl mb-2">{topic.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{topic.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{topic.description}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{topic.count} problems</span>
                    <span>{topic.completed} solved</span>
                  </div>
                  {topic.completed > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full bg-gradient-to-r ${topic.color}`}
                          style={{ width: `${(topic.completed / topic.count) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Problem card component
const ProblemCard: React.FC<{ 
  problem: Problem;
  onStartProblem: (problemId: string) => void;
  onContinueProblem: (problemId: string) => void;
  onStartFresh: (problemId: string) => void;
}> = ({ problem, onStartProblem, onContinueProblem, onStartFresh }) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 group border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {problem.completed && (
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            )}
            {problem.inProgress && !problem.completed && (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
            {!problem.completed && !problem.inProgress && (
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mt-1 group-hover:bg-blue-100 transition-colors">
                <Play className="text-gray-500 group-hover:text-blue-600" size={20} />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {problem.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{problem.description}</p>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant={getDifficultyVariant(problem.difficulty)} className="text-sm px-3 py-1">
                  {getDifficultyEmoji(problem.difficulty)} {problem.difficulty}
                </Badge>
                {problem.timeEstimate && (
                  <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <Clock size={14} className="mr-1" />
                    {problem.timeEstimate}
                  </div>
                )}
              </div>
              
              {problem.companies && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-2">🏢</span>
                  <span className="font-medium">Asked by:</span>
                  <span className="ml-2">{problem.companies.slice(0, 3).join(", ")}</span>
                  {problem.companies.length > 3 && <span className="text-blue-600 ml-1">+{problem.companies.length - 3} more</span>}
                </div>
              )}
              
              {problem.lastAttempt && (
                <p className="text-sm text-gray-500 mb-4 flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <Clock size={14} className="mr-2" />
                  Last attempt: {problem.lastAttempt}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {problem.completed ? (
            <Button variant="outline" onClick={() => onStartFresh(problem.id)} className="flex-1 h-12">
              <RotateCcw size={18} className="mr-2" />
              Solve Again
            </Button>
          ) : problem.inProgress ? (
            <>
              <Button onClick={() => onContinueProblem(problem.id)} className="flex-1 h-12">
                <ChevronRight size={18} className="mr-2" />
                Continue
              </Button>
              <Button variant="outline" onClick={() => onStartFresh(problem.id)} className="h-12">
                Start Fresh
              </Button>
            </>
          ) : (
            <Button onClick={() => onStartProblem(problem.id)} className="flex-1 h-12">
              <Play size={18} className="mr-2" />
              Start Problem
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Progress bar component
const ProgressBar: React.FC<{ 
  label: string;
  current: number;
  total: number;
  className?: string;
  color?: string;
}> = ({ label, current, total, className = "", color = "bg-blue-600" }) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{current}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{percentage}% Complete</span>
        <span>{total - current} remaining</span>
      </div>
    </div>
  );
};

// Enhanced Quick access component
const QuickAccess: React.FC<{ 
  onLearnConcepts: () => void;
  onRandomChallenge: () => void;
}> = ({ onLearnConcepts, onRandomChallenge }) => {
  return (
    <div className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Zap size={24} className="mr-3 text-orange-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md" onClick={onLearnConcepts}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Learn Concepts</h4>
              <p className="text-gray-600 mb-4">Master the fundamentals with AI-powered explanations</p>
              <Button variant="outline" className="w-full">
                Start Learning
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md" onClick={onRandomChallenge}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Random Challenge</h4>
              <p className="text-gray-600 mb-4">Test your skills with a surprise problem</p>
              <Button variant="outline" className="w-full">
                Take Challenge
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// =====================================
// MAIN PROBLEM BROWSER COMPONENT
// =====================================

export default function ProblemBrowser() {
  // State management for active topic selection
  const [activeTopic, setActiveTopic] = useState<string>('arrays');
  
  // State for search functionality (dummy implementation)
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for tracking user interactions (for demo purposes)
  const [lastAction, setLastAction] = useState<string>('');

  // Filter problems based on active topic
  const filteredProblems = mockProblems.filter(problem => problem.topic === activeTopic);
  
  // Get current topic data for progress calculation
  const currentTopic = mockTopics.find(topic => topic.id === activeTopic);
  
  // Calculate topic progress
  const topicProgress = currentTopic ? {
    completed: filteredProblems.filter(p => p.completed).length,
    total: filteredProblems.length
  } : { completed: 0, total: 0 };

  // Event handlers for user interactions
  const handleTopicSelect = (topicId: string) => {
    setActiveTopic(topicId);
    setLastAction(`Selected topic: ${mockTopics.find(t => t.id === topicId)?.name}`);
  };

  const handleStartProblem = (problemId: string) => {
    const problem = mockProblems.find(p => p.id === problemId);
    setLastAction(`Started problem: ${problem?.title}`);
    // Navigate to the problem workspace
    window.location.href = `/problem/${problemId}`;
  };

  const handleContinueProblem = (problemId: string) => {
    const problem = mockProblems.find(p => p.id === problemId);
    setLastAction(`Continuing problem: ${problem?.title}`);
    // Navigate to the problem workspace with saved progress
    window.location.href = `/problem/${problemId}`;
  };

  const handleStartFresh = (problemId: string) => {
    const problem = mockProblems.find(p => p.id === problemId);
    setLastAction(`Starting fresh: ${problem?.title}`);
    // Navigate to the problem workspace and reset progress
    window.location.href = `/problem/${problemId}`;
  };

  const handleSettingsClick = () => {
    setLastAction('Opened settings');
    alert('This would navigate to the Settings page.');
  };

  const handleLearnModeClick = () => {
    setLastAction('Opened learn mode');
    alert('This would navigate to the Learn Mode page.');
  };

  const handleLearnConcepts = () => {
    setLastAction('Opened concept learning');
    alert('This would navigate to the Learn Mode with concept explorer.');
  };

  const handleRandomChallenge = () => {
    const randomProblem = mockProblems[Math.floor(Math.random() * mockProblems.length)];
    setLastAction(`Random challenge: ${randomProblem.title}`);
    alert(`Random challenge selected: ${randomProblem.title}\n\nThis would navigate directly to this problem.`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLastAction(`Searched for: ${query}`);
    // In a real app, this would filter problems by the search query
  };

  // Effect to demonstrate state changes (for demo purposes)
  useEffect(() => {
    if (lastAction) {
      console.log('Last action:', lastAction);
    }
  }, [lastAction]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onSettingsClick={handleSettingsClick}
        onLearnModeClick={handleLearnModeClick}
      />

      {/* Welcome Message */}
      <WelcomeMessage userProgress={mockUserProgress} />

      {/* Topic Navigation */}
      <TopicNavigation 
        topics={mockTopics}
        activeTopic={activeTopic}
        onTopicSelect={handleTopicSelect}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Problem List Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="text-3xl mr-2">{currentTopic?.icon}</span>
            {currentTopic?.name} Problems
          </h2>
          <p className="text-gray-600">
            {filteredProblems.length} problems available • {topicProgress.completed} completed
          </p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing results for "{searchQuery}" (Search functionality is demo only)
            </p>
          )}
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredProblems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onStartProblem={handleStartProblem}
              onContinueProblem={handleContinueProblem}
              onStartFresh={handleStartFresh}
            />
          ))}
        </div>

        {/* Progress Section */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="mr-2 text-green-600" size={24} />
              Your Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Progress */}
            <ProgressBar
              label={`${currentTopic?.name} Progress`}
              current={topicProgress.completed}
              total={topicProgress.total}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            
            {/* Overall Progress */}
            <ProgressBar
              label="Overall Progress"
              current={mockUserProgress.overall.problemsSolved}
              total={mockUserProgress.overall.totalProblems}
              color="bg-gradient-to-r from-green-500 to-green-600"
            />
            
            {/* Achievement Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  🔥 {mockUserProgress.overall.currentStreak}
                </div>
                <p className="text-sm text-orange-700 font-medium">Day Streak</p>
                <p className="text-xs text-orange-600">Keep it going!</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  🎯 {mockUserProgress.weeklyGoal.completed}/{mockUserProgress.weeklyGoal.target}
                </div>
                <p className="text-sm text-green-700 font-medium">Weekly Goal</p>
                <p className="text-xs text-green-600">Almost there!</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  ✨ {mockUserProgress.overall.problemsSolved}
                </div>
                <p className="text-sm text-purple-700 font-medium">Total Solved</p>
                <p className="text-xs text-purple-600">Great progress!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <QuickAccess 
        onLearnConcepts={handleLearnConcepts}
        onRandomChallenge={handleRandomChallenge}
      />

      {/* Demo Action Logger */}
      {lastAction && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">Action: {lastAction}</p>
        </div>
      )}
    </div>
  );
}
