# S3 Data Structure for DSA AI Tutor

This document describes the structure of data stored in the S3 bucket for the DSA AI Tutor application.

## Bucket Structure

```
dsa-ai-tutor-content/
├── topics.json
├── topics/
│   ├── arrays/
│   │   └── problems.json
│   ├── strings/
│   │   └── problems.json
│   ├── hashmaps/
│   │   └── problems.json
│   ├── recursion/
│   │   └── problems.json
│   └── algorithms/
│       └── problems.json
├── problems/
│   ├── two-sum.json
│   ├── merge-intervals.json
│   └── ...
└── testcases/
    ├── two-sum.json
    ├── merge-intervals.json
    └── ...
```

## File Formats

### topics.json
Contains an array of all available topics in the application.

```json
[
  {
    "id": "arrays",
    "name": "Arrays",
    "count": 15,
    "completed": 0,
    "icon": "📊",
    "color": "from-blue-400 to-blue-600",
    "description": "Linear data structures with indexed elements"
  }
]
```

### topics/{topicId}/problems.json
Contains an array of all problems for a specific topic.

```json
[
  {
    "id": "two-sum",
    "title": "Two Sum",
    "difficulty": "Easy",
    "description": "Problem description...",
    "completed": false,
    "topic": "arrays",
    "timeEstimate": "15 min",
    "companies": ["Google", "Facebook"],
    "examples": [...],
    "constraints": [...],
    "starterCode": "function twoSum(nums, target) {\n    // Your code here\n}",
    "hints": [...]
  }
]
```

### problems/{problemId}.json
Contains detailed information about a specific problem.

```json
{
  "id": "two-sum",
  "title": "Two Sum",
  "difficulty": "Easy",
  "description": "Problem description...",
  "completed": false,
  "topic": "arrays",
  "timeEstimate": "15 min",
  "companies": ["Google", "Facebook"],
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  "constraints": [
    "2 ≤ nums.length ≤ 10⁴"
  ],
  "starterCode": "function twoSum(nums, target) {\n    // Your code here\n}",
  "hints": [
    "Think about what data structure can help you look up values quickly."
  ]
}
```

### testcases/{problemId}.json
Contains an array of test cases for a specific problem.

```json
[
  {
    "input": {
      "nums": [2, 7, 11, 15],
      "target": 9
    },
    "expected": [0, 1],
    "description": "Basic case with solution at beginning"
  }
]
```

## Access Patterns

The application uses the S3 client to fetch data with the following patterns:

1. `getAllTopics()` - Fetches `topics.json`
2. `getProblemsByTopic(topicId)` - Fetches `topics/{topicId}/problems.json`
3. `getProblemById(problemId)` - Fetches `problems/{problemId}.json`
4. `getTestCasesByProblemId(problemId)` - Fetches `testcases/{problemId}.json`

## Caching

The S3 client implements caching with a 5-minute expiration to reduce unnecessary network requests.