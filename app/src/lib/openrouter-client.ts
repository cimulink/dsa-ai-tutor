import { OpenRouterConfig, OpenRouterMessage } from '@/types/chat';

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

// Default system prompt for DSA tutoring
const DEFAULT_SYSTEM_PROMPT = `You are an expert Data Structures and Algorithms tutor specializing in JavaScript. 
Your role is to help students understand DSA concepts and solve coding problems through guided discovery rather than direct instruction.
Follow these key principles:
1. Avoid answering direct questions whenever possible - instead, guide students to discover answers themselves
2. Never provide complete solution steps upfront - encourage students to think through problems first
3. When offering hints, encourage students to discuss their approach with you and figure things out independently
4. Only provide direct solutions when explicitly asked for them
5. Always be encouraging and supportive while maintaining technical accuracy
6. Focus on asking leading questions that help students think through problems
7. Provide feedback on student attempts and guide them toward better approaches
8. Focus on JavaScript implementations and best practices.`;

// Get OpenRouter configuration from localStorage
export const getOpenRouterConfig = (): OpenRouterConfig | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const apiKey = localStorage.getItem('openrouter_api_key');
    const model = localStorage.getItem('openrouter_model') || 'mistralai/mistral-7b-instruct';
    
    if (!apiKey) return null;
    
    return { apiKey, model };
  } catch (error) {
    console.error('Error retrieving OpenRouter config:', error);
    return null;
  }
};

// Save OpenRouter configuration to localStorage
export const saveOpenRouterConfig = (apiKey: string, model: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('openrouter_api_key', apiKey);
    localStorage.setItem('openrouter_model', model);
  } catch (error) {
    console.error('Error saving OpenRouter config:', error);
  }
};

// Send a message to OpenRouter API through our proxy
export const sendOpenRouterMessage = async (
  messages: OpenRouterMessage[],
  config: OpenRouterConfig
): Promise<string> => {
  try {
    // Add system prompt if not present
    const messagesWithSystem = messages[0]?.role === 'system' 
      ? messages 
      : [{ role: 'system', content: DEFAULT_SYSTEM_PROMPT }, ...messages];
    
    // Use our proxy API route to avoid CORS issues
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }
    
    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I couldn\'t process that request.';
  } catch (error) {
    console.error('Error sending message to OpenRouter:', error);
    throw new Error(`Failed to get response from AI tutor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Test OpenRouter connection
export const testOpenRouterConnection = async (config: OpenRouterConfig): Promise<boolean> => {
  try {
    const testMessage: OpenRouterMessage = {
      role: 'user',
      content: 'Hello, this is a test message to verify the connection.'
    };
    
    await sendOpenRouterMessage([testMessage], config);
    return true;
  } catch (error) {
    console.error('OpenRouter connection test failed:', error);
    return false;
  }
};