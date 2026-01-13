'use client';

import { useState } from 'react';
import IntakeForm from '@/components/IntakeForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import ResultsSkeleton from '@/components/ResultsSkeleton';
import { VeteranProfile, AnalysisResult } from '@/types';

export default function Home() {
  const [stage, setStage] = useState<'intake' | 'loading' | 'results' | 'error'>('intake');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage(null);
      setStage('results');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('We were unable to generate pathways. Please try again.');
      setStage('error');
    }
  };

  const handleStartOver = () => {
    setStage('intake');
    setResults(null);
    setErrorMessage(null);
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
          <ResultsSkeleton />
        )}

        {stage === 'results' && results && (
          <ResultsDisplay result={results} onStartOver={handleStartOver} />
        )}

        {stage === 'error' && (
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Something went wrong</h2>
              <p className="mt-3 text-sm text-slate-600">
                {errorMessage ?? 'Please try again. If the issue persists, refresh the page.'}
              </p>
              <button
                onClick={handleStartOver}
                className="mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Back to Intake
              </button>
            </div>
          </div>
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
