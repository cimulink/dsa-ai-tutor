'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { OpenRouterSettings } from '@/components/settings/openrouter-settings';

export default function SettingsPage() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleSettingsSaved = () => {
    // Optionally show a success message or redirect
    console.log('Settings saved successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/95 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={handleBackClick}>
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DSA AI Tutor Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure your AI tutor settings to get personalized help with DSA problems.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">How to get an OpenRouter API key</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                  <li>Visit <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                    OpenRouter Keys <ExternalLink size={14} className="ml-1" />
                  </a></li>
                  <li>Sign up for a free account</li>
                  <li>Create a new API key</li>
                  <li>Copy the key and paste it below</li>
                </ol>
                <p className="mt-2 text-sm text-blue-700">
                  <strong>Tip:</strong> Start with free models like Mistral 7B or Gemma 7B for cost-effective learning.
                </p>
              </div>
            </CardContent>
          </Card>

          <OpenRouterSettings onSettingsSaved={handleSettingsSaved} />
        </div>
      </main>
    </div>
  );
}