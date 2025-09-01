# dsa-ai-tutor
DSA AI Tutor

## Overview
The DSA AI Tutor is an interactive learning platform designed to help students and developers master Data Structures and Algorithms (DSA) through guided problem-solving with AI assistance.

## Features
- Interactive problem-solving environment with Monaco code editor
- AI-powered tutoring with OpenRouter integration
- Real-time test case execution and validation
- Performance analysis with time/space complexity estimation
- Progress tracking with localStorage persistence
- Solution saving and loading capabilities

## Technology Stack
- Next.js 15.5.2 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui component library
- Monaco Editor for code editing
- OpenRouter API for AI capabilities
- AWS S3 for content delivery

## S3 Data Structure
The application fetches problem data from an S3 bucket. See [S3_DATA_STRUCTURE.md](./S3_DATA_STRUCTURE.md) for details on the data format and organization.

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development data server: `npm run dev:data` (in a separate terminal)
4. Start the Next.js development server: `npm run dev`
5. Access the application at http://localhost:3000

## Development
- Main application code is in the `app` directory
- Components are in `src/components`
- Utility functions are in `src/lib`
- Type definitions are in `src/types`

## Development Server
The application requires two servers to run in development:
1. Next.js development server (port 3000) - Main application
2. S3 data server (port 8000) - Serves local data files with proper CORS headers

The S3 data server is implemented in `scripts/dev-server.js` and can be started with `npm run dev:data`.

## Contributing
Contributions are welcome! Please read our contributing guidelines before submitting pull requests.