import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate that we have the required data
    if (!body.messages || !body.model) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: messages and model' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Forward the request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': request.headers.get('origin') || '',
        'X-Title': 'DSA AI Tutor',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        } 
      }
    );
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const runtime = 'edge';