# API Routes

This directory contains API routes for the DSA AI Tutor application.

## OpenRouter Proxy Route

**Route:** `/api/openrouter`

A proxy route that forwards requests to the OpenRouter API. This helps avoid CORS issues when making requests from the browser.

### Usage

```javascript
const response = await fetch('/api/openrouter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'mistralai/mistral-7b-instruct',
    messages: [
      { role: 'user', content: 'Hello!' }
    ]
  })
});
```

### Environment Variables

To use this route, you need to set the following environment variable:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Note: This is only needed if you want to use the server-side proxy. The client can also make direct requests to OpenRouter.