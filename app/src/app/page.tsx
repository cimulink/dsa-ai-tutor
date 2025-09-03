'use client';

import React, { useState, useEffect } from 'react';
import { Search, Settings, Brain, Zap, ChevronRight, Play, RotateCcw, CheckCircle, GraduationCap, Clock, Target, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { S3ClientService } from '@/lib/s3-client';
import { Problem, Topic, UserProgress } from '@/types/problem';
import { isProblemCompleted, getTopicProgressPercentage } from '@/lib/progress-tracking';

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
    <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={18} />
            </div>
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DSA AI Tutor
              </div>
              <div className="text-xs text-muted-foreground -mt-0.5">Master Data Structures & Algorithms</div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" onClick={onLearnModeClick} className="hidden sm:flex h-8 px-2 text-sm">
              <Brain size={16} className="mr-1" />
              Learn
            </Button>
            <Link href="/settings">
              <Button variant="outline" className="h-8 text-sm">
                Add OpenRouter API Key
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
              Last worked on: <span className="font-medium ml-1">Two Sum</span> 
              <span className="text-muted-foreground mx-1">in</span> 
              <span className="font-medium">Arrays</span> 
              <span className="text-muted-foreground ml-1">• 2 days ago</span>
            </p>
          </div>
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userProgress.overall.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">3/5</div>
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
  topicProgress: Record<string, number>;
}> = ({ topics, activeTopic, onTopicSelect, topicProgress }) => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target size={20} className="mr-2 text-blue-600" />
          Choose Your Focus Area
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {topics.map((topic) => {
            const progressPercentage = topicProgress[topic.id] || 0;
            const completedCount = Math.round((progressPercentage / 100) * topic.count);
            
            return (
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
                      <span>{completedCount} solved</span>
                    </div>
                    {completedCount > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full bg-gradient-to-r ${topic.color}`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
  const isCompleted = isProblemCompleted(problem.id);
  
  return (
    <Card className="hover:shadow-xl transition-all duration-300 group border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {isCompleted && (
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            )}
            {!isCompleted && (
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
              
              {problem.companies && problem.companies.length > 0 && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-2">🏢</span>
                  <span className="font-medium">Asked by:</span>
                  <span className="ml-2">{problem.companies.slice(0, 3).join(", ")}</span>
                  {problem.companies.length > 3 && <span className="text-blue-600 ml-1">+{problem.companies.length - 3} more</span>}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {isCompleted ? (
            <Button variant="outline" onClick={() => onStartFresh(problem.id)} className="flex-1 h-12">
              <RotateCcw size={18} className="mr-2" />
              Solve Again
            </Button>
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

// =====================================
// MAIN PROBLEM BROWSER COMPONENT
// =====================================

export default function ProblemBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTopic, setActiveTopic] = useState('arrays');
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    overall: {
      problemsSolved: 0,
      totalProblems: 0,
      currentStreak: 0,
      longestStreak: 0
    },
    topics: {},
    recentActivity: []
  });
  const [topicProgress, setTopicProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Fetch topics and user progress on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from S3 first
        try {
          const [fetchedTopics, fetchedUserProgress] = await Promise.all([
            S3ClientService.getAllTopics(),
            S3ClientService.getUserProgress()
          ]);
          
          setTopics(fetchedTopics);
          setUserProgress(fetchedUserProgress);
          
          // Calculate topic progress percentages
          const progress: Record<string, number> = {};
          fetchedTopics.forEach(topic => {
            progress[topic.id] = getTopicProgressPercentage(topic.id);
          });
          setTopicProgress(progress);
        } catch (s3Error) {
          console.error('Failed to fetch from S3:', s3Error);
          setError(s3Error instanceof Error ? s3Error.message : 'Failed to load data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter problems based on search term and active topic
  useEffect(() => {
    const filterProblems = async () => {
      try {
        // Try to fetch problems for the active topic from S3
        try {
          const fetchedProblems = await S3ClientService.getProblemsByTopic(activeTopic);
          const filtered = fetchedProblems.filter(problem => 
            problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            problem.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredProblems(filtered);
        } catch (s3Error) {
          console.error('Failed to fetch problems from S3:', s3Error);
          setError(s3Error instanceof Error ? s3Error.message : 'Failed to load problems');
          setFilteredProblems([]);
        }
      } catch (error) {
        console.error('Error filtering problems:', error);
        setError(error instanceof Error ? error.message : 'Failed to filter problems');
        setFilteredProblems([]);
      }
    };

    if (!loading) {
      filterProblems();
    }
  }, [searchTerm, activeTopic, loading]);

  const handleTopicSelect = (topicId: string) => {
    setActiveTopic(topicId);
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleLearnModeClick = () => {
    console.log('Learn mode clicked');
  };

  const handleStartProblem = (problemId: string) => {
    router.push(`/problem/${problemId}`);
  };

  const handleContinueProblem = (problemId: string) => {
    router.push(`/problem/${problemId}`);
  };

  const handleStartFresh = (problemId: string) => {
    router.push(`/problem/${problemId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="default">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        onSettingsClick={handleSettingsClick} 
        onLearnModeClick={handleLearnModeClick} 
      />
      <WelcomeMessage userProgress={userProgress} />
      <TopicNavigation 
        topics={topics} 
        activeTopic={activeTopic} 
        onTopicSelect={handleTopicSelect} 
        topicProgress={topicProgress}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {topics.find(t => t.id === activeTopic)?.name} Problems
          </h2>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search problems..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredProblems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No problems found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}
      </main>
    </div>
  );
}