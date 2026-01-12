'use client';

import { useState } from 'react';
import IntakeForm from '@/components/IntakeForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import { VeteranProfile, AnalysisResult } from '@/types';

export default function Home() {
  const [stage, setStage] = useState<'intake' | 'loading' | 'results'>('intake');
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleFormComplete = async (profile: VeteranProfile) => {
    setStage('loading');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze profile');
      }

      const result: AnalysisResult = await response.json();
      setResults(result);
      setStage('results');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate career pathways. Please try again.');
      setStage('intake');
    }
  };

  const handleStartOver = () => {
    setStage('intake');
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold">Veteran Transition Intelligence Navigator</h1>
          <p className="text-blue-100 mt-1">Your personalized career pathway analysis</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {stage === 'intake' && <IntakeForm onComplete={handleFormComplete} />}

        {stage === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-xl font-semibold text-gray-700">Analyzing your profile...</p>
            <p className="mt-2 text-gray-600">Generating personalized career pathways</p>
          </div>
        )}

        {stage === 'results' && results && (
          <ResultsDisplay result={results} onStartOver={handleStartOver} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            Built with Next.js and Claude AI to support veteran transitions
          </p>
        </div>
      </footer>
    </div>
  );
}
