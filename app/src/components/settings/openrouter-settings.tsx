'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  saveOpenRouterConfig, 
  getOpenRouterConfig, 
  testOpenRouterConnection 
} from '@/lib/openrouter-client';
import { OpenRouterConfig } from '@/types/chat';

interface OpenRouterSettingsProps {
  onSettingsSaved?: () => void;
}

export function OpenRouterSettings({ onSettingsSaved }: OpenRouterSettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('mistralai/mistral-7b-instruct');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Load existing settings on component mount
  useEffect(() => {
    const config = getOpenRouterConfig();
    if (config) {
      setApiKey(config.apiKey);
      setModel(config.model);
    }
  }, []);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionStatus('error');
      setStatusMessage('Please enter your OpenRouter API key');
      return;
    }

    setIsTesting(true);
    setConnectionStatus('idle');
    setStatusMessage('');

    try {
      const config: OpenRouterConfig = { apiKey, model };
      const isConnected = await testOpenRouterConnection(config);
      
      if (isConnected) {
        setConnectionStatus('success');
        setStatusMessage('Connection successful! API key is valid.');
      } else {
        setConnectionStatus('error');
        setStatusMessage('Connection failed. Please check your API key and try again.');
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = () => {
    if (!apiKey.trim()) {
      setConnectionStatus('error');
      setStatusMessage('Please enter your OpenRouter API key');
      return;
    }

    setIsSaving(true);
    setConnectionStatus('idle');
    setStatusMessage('');

    try {
      saveOpenRouterConfig(apiKey, model);
      setConnectionStatus('success');
      setStatusMessage('Settings saved successfully!');
      
      if (onSettingsSaved) {
        onSettingsSaved();
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenRouter API Configuration</CardTitle>
        <CardDescription>
          Configure your OpenRouter API key and model selection for AI tutoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your OpenRouter API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Get your free API key from{' '}
            <a 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenRouter
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <select
            id="model"
            className="w-full p-2 border rounded-md bg-background"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="mistralai/mistral-7b-instruct">Mistral 7B Instruct (Free)</option>
            <option value="google/gemma-7b-it">Google Gemma 7B IT (Free)</option>
            <option value="meta-llama/llama-3-8b-instruct">Llama 3 8B Instruct (Free)</option>
            <option value="openchat/openchat-7b">OpenChat 7B (Free)</option>
            <option value="mistralai/mixtral-8x7b-instruct">Mixtral 8x7B Instruct (Free)</option>
            <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Paid)</option>
            <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet (Paid)</option>
            <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo (Paid)</option>
            <option value="openai/gpt-4">GPT-4 (Paid)</option>
          </select>
          <p className="text-sm text-muted-foreground">
            Free models are available without cost. Paid models offer enhanced capabilities.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleTestConnection} 
            disabled={isTesting || !apiKey.trim()}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {connectionStatus !== 'idle' && (
          <Alert variant={connectionStatus === 'success' ? 'default' : 'destructive'}>
            <AlertDescription>
              {statusMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground pt-4 border-t">
          <h4 className="font-medium mb-2">Privacy & Security</h4>
          <p>
            Your API key is stored locally in your browser and never sent to any server other than OpenRouter.
            You can manage your API keys directly on the{' '}
            <a 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenRouter website
            </a>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}