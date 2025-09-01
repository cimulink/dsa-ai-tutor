# DSA AI Tutor - Product Requirements Document

## 1. Vision & Objectives

### Mission Statement
Create a simple, frontend-only AI-powered learning platform that helps students understand data structures and algorithms through personalized tutoring and guided JavaScript problem-solving.

### Primary Objective
Build a minimal yet highly impactful learning tool that addresses the core challenges in DSA education:
- Personalized AI tutoring guidance
- Interactive JavaScript problem-solving
- Browser-based execution and testing
- Simple, intuitive user experience

### Success Definition
Students demonstrate improved problem-solving abilities and deeper conceptual understanding through AI-guided practice with immediate feedback on JavaScript implementations.

## 2. Target Users

### Primary Users
- **CS Students**: University students taking data structures and algorithms courses
- **Bootcamp Learners**: Career changers learning programming fundamentals
- **Interview Prep Students**: Professionals preparing for technical interviews

### User Pain Points
- Difficulty visualizing abstract algorithms and data structures
- Overwhelmed by the breadth of DSA topics
- Getting stuck on problems without proper guidance
- Lack of personalized learning paths
- Memorizing solutions without understanding concepts

## 3. Core Features (MVP)

### 3.1 AI-Powered Concept Tutor 🎯 **HIGH IMPACT**
**Description**: Interactive chat-based AI tutor using OpenRouter's free models that explains DSA concepts and guides JavaScript problem-solving.

**Key Capabilities**:
- Direct OpenRouter API integration (user provides API key and model name)
- Personalized explanations for JavaScript-specific DSA implementations
- Real-time concept clarification and coding guidance
- Context-aware responses based on current problem and user progress

**User Flow**:
1. User configures OpenRouter API key and selects free model
2. Student asks questions about DSA concepts or gets stuck on problems
3. AI provides guided explanations with JavaScript examples
4. AI offers coding hints and reviews student's JavaScript solutions
5. Progress and conversation history stored in localStorage

### 3.2 JavaScript Problem Solver 🎯 **HIGH IMPACT**
**Description**: Browser-based JavaScript problem-solving environment with AI guidance.

**Key Features**:
- Built-in JavaScript code editor with syntax highlighting
- Immediate code execution and testing in browser
- AI-powered hints and solution review
- Automatic test case validation
- Solution optimization suggestions

**Problem Categories (MVP)**:
- Array manipulation (two pointers, sliding window)
- String processing (parsing, pattern matching)
- Hash maps and sets
- Basic recursion and iteration
- Simple algorithm implementations

### 3.3 S3-Based Content Management 🎯 **HIGH IMPACT**
**Description**: Cloud-based problem and test case storage without backend infrastructure.

**Features**:
- Questions stored in S3 buckets organized by topic
- Test cases in separate S3 bucket with structured format
- Direct browser-to-S3 fetching (CORS-enabled)
- Offline-capable with localStorage caching
- JSON-based question and test case format

## 4. User Experience Design

### 4.1 Main Interface Layout
```
┌─────────────────────────────────────────┐
│ [Logo] DSA AI Tutor      [Settings]     │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │   Problem   │  │   AI Tutor      │   │
│  │   Browser   │  │   Chat          │   │
│  │             │  │                 │   │
│  └─────────────┘  └─────────────────┘   │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │      JavaScript Code Editor        │ │
│  │                                     │ │
│  │  [Run Tests] [Get Hint] [Submit]    │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  Progress: ████████░░ 80% (Arrays)      │
└─────────────────────────────────────────┘
```

### 4.2 Core User Journeys

#### Journey 1: Learning a New Concept
1. **Discovery**: Student selects "Binary Search" topic
2. **Explanation**: AI provides interactive explanation with examples
4. **Practice**: AI suggests relevant practice problems
5. **Assessment**: Student demonstrates understanding through guided questions

#### Journey 2: Solving a Problem
1. **Problem Selection**: Student browses S3-stored problems by topic
2. **Code Implementation**: Student writes JavaScript solution in browser editor
3. **Testing**: Automatic validation against S3-stored test cases
4. **AI Assistance**: When stuck, AI provides progressive hints about JavaScript implementation
5. **Solution Review**: AI analyzes code and suggests optimizations

#### Journey 3: Learning Through AI Chat
1. **Question**: Student asks "How do I implement a hash map solution in JavaScript?"
2. **AI Guidance**: AI provides JavaScript-specific explanations and examples
3. **Code Examples**: AI shows practical JavaScript implementations
4. **Practice Application**: Student applies concepts to current problem
5. **Feedback Loop**: AI reviews student's code and provides specific improvements

## 5. Technical Specifications

### 5.1 Architecture Overview
```
Next.js Frontend (Client-Side Only)
├── AI Chat Interface (OpenRouter Integration)
├── JavaScript Code Editor (Monaco Editor)
├── Problem Browser (S3 Integration)
├── Test Runner (Browser-based)
└── Local Storage Management

External Services
├── OpenRouter API (User-configured)
├── AWS S3 (Questions & Test Cases)
└── No Backend Required

Local Storage
├── User Settings (API Key, Model)
├── Problem Progress
├── Conversation History
└── Cached S3 Content
```

### 5.2 Technology Stack
- **Frontend**: Next.js 15.5.2, React, TypeScript
- **UI Components**: shadcn/ui components
- **Code Editor**: Monaco Editor (VS Code engine)
- **AI Integration**: OpenRouter API (user-configured)
- **Storage**: localStorage, sessionStorage
- **Content**: AWS S3 (CORS-enabled)
- **Deployment**: Vercel (static deployment)

### 5.3 AI Integration Strategy
- **OpenRouter Integration**: Direct API calls to user-selected free models
- **Model Configuration**: User enters API key and model name in settings
- **Context Management**: Conversation history stored in localStorage
- **Prompt Engineering**: JavaScript-focused prompts for DSA problem-solving
- **Cost Control**: User manages their own API usage and costs

### 5.4 Content Architecture
**S3 Bucket Structure:**
```
questions/
├── arrays/
│   ├── two-sum.json
│   └── merge-intervals.json
├── strings/
│   └── valid-parentheses.json
└── index.json

test-cases/
├── two-sum-tests.json
├── merge-intervals-tests.json
└── valid-parentheses-tests.json
```

**Question Format:**
```json
{
  "id": "two-sum",
  "title": "Two Sum",
  "difficulty": "Easy",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  "constraints": [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9"
  ],
  "starterCode": "function twoSum(nums, target) {\n    // Your code here\n}"
}
```

**Test Case Format:**
```json
{
  "questionId": "two-sum",
  "testCases": [
    {
      "input": {
        "nums": [2, 7, 11, 15],
        "target": 9
      },
      "expected": [0, 1]
    },
    {
      "input": {
        "nums": [3, 2, 4],
        "target": 6
      },
      "expected": [1, 2]
    },
    {
      "input": {
        "nums": [3, 3],
        "target": 6
      },
      "expected": [0, 1]
    }
  ]
}
```

## 6. Success Metrics

### 6.1 Learning Effectiveness Metrics
- **Concept Mastery**: Students can explain concepts in their own words
- **Problem-Solving Improvement**: Reduced time to solve similar problems
- **Knowledge Retention**: Performance on follow-up questions after time delay
- **Transfer Learning**: Ability to apply concepts to new problem types

### 6.2 Engagement Metrics
- **Session Duration**: Average time spent in meaningful learning activities
- **Return Rate**: Students coming back for continued learning
- **Feature Usage**: Balance between AI tutor, visualizer, and problem solver
- **Question Quality**: Depth and thoughtfulness of student questions

### 6.3 Platform Metrics
- **Response Accuracy**: AI tutor response quality (manual review)
- **System Performance**: Visualization loading times, API response times
- **User Satisfaction**: Qualitative feedback on learning experience

## 7. Development Roadmap

### Phase 1: Core MVP (4-6 weeks)
**Week 1**: Next.js setup, shadcn/ui components, basic layout
**Week 2**: S3 integration, problem browser, JSON content structure
**Week 3**: Monaco code editor, JavaScript test runner, local execution
**Week 4**: OpenRouter integration, AI chat interface
**Week 5**: Settings management, localStorage integration
**Week 6**: Testing, refinements, deployment to Vercel

### Phase 2: Content & Polish (2-3 weeks)
- Curated problem set in S3
- Improved AI prompts for JavaScript DSA
- Enhanced user experience
- Progressive hint system

### Phase 3: Advanced Features (Future)
- More sophisticated test case formats
- Performance analysis tools
- Advanced AI tutoring strategies
- Problem recommendation engine

## 8. Success Criteria for MVP

### Must-Have Outcomes
1. Students can successfully solve JavaScript DSA problems with AI guidance
2. S3 content loads quickly and reliably in browser
3. Code editor provides smooth development experience
4. AI integration works seamlessly with user-provided OpenRouter credentials
5. All functionality works without backend dependencies

### Nice-to-Have Outcomes
1. Students prefer the simplicity over complex platforms
2. Strong adoption among JavaScript/web development learners
3. Community contributions to S3 problem sets
4. Sustainable through user-controlled AI costs

## 9. Next Steps

1. **Next.js Setup**: Initialize Next.js 15.5.2 project with app directory structure
2. **UI Framework**: Install and configure shadcn/ui components
3. **S3 Integration**: Set up S3 buckets and implement browser-based content fetching
4. **Code Editor**: Integrate Monaco Editor for JavaScript development
5. **OpenRouter Integration**: Implement user-configurable AI chat interface
6. **Local Storage**: Design client-side state management and persistence
7. **Testing**: Validate browser-based JavaScript execution and S3 connectivity
8. **Deployment**: Deploy to Vercel as static site

---

*This PRD focuses on creating a simple, powerful, frontend-only learning platform. Success will be measured by how effectively students can learn DSA concepts through JavaScript practice with AI guidance, all running entirely in their browser.*