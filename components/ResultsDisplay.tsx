'use client';

import { AnalysisResult, CareerPathway } from '@/types';

interface ResultsDisplayProps {
  result: AnalysisResult;
  onStartOver: () => void;
}

export default function ResultsDisplay({ result, onStartOver }: ResultsDisplayProps) {
  const getPathwayColor = (type: string) => {
    switch (type) {
      case 'fast-income':
        return 'border-green-500 bg-green-50';
      case 'balanced':
        return 'border-blue-500 bg-blue-50';
      case 'max-upside':
        return 'border-purple-500 bg-purple-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getPathwayBadgeColor = (type: string) => {
    switch (type) {
      case 'fast-income':
        return 'bg-green-600';
      case 'balanced':
        return 'bg-blue-600';
      case 'max-upside':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getPathwayLabel = (type: string) => {
    switch (type) {
      case 'fast-income':
        return 'Fast Income';
      case 'balanced':
        return 'Balanced Growth';
      case 'max-upside':
        return 'Maximum Upside';
      default:
        return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Your Career Pathways</h1>
          <button
            onClick={onStartOver}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Start Over
          </button>
        </div>
        <p className="text-lg text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
          {result.summary}
        </p>
      </div>

      {/* Pathways Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {result.pathways.map((pathway: CareerPathway, index: number) => (
          <div
            key={index}
            className={`border-4 rounded-xl p-6 ${getPathwayColor(pathway.type)} shadow-lg hover:shadow-xl transition-shadow`}
          >
            {/* Badge */}
            <div className="mb-4">
              <span className={`inline-block px-4 py-1 ${getPathwayBadgeColor(pathway.type)} text-white text-sm font-semibold rounded-full`}>
                {getPathwayLabel(pathway.type)}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{pathway.title}</h2>

            {/* Description */}
            <p className="text-gray-700 mb-6">{pathway.description}</p>

            {/* Income Trajectory */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Income Trajectory</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Year 1:</span>
                  <span className="font-semibold text-gray-900">{pathway.incomeTrajectory.year1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year 3:</span>
                  <span className="font-semibold text-gray-900">{pathway.incomeTrajectory.year3}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year 5:</span>
                  <span className="font-semibold text-green-600 text-lg">{pathway.incomeTrajectory.year5}</span>
                </div>
              </div>
            </div>

            {/* Roadmap */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Step-by-Step Roadmap</h3>
              <div className="space-y-4">
                {pathway.roadmap.map((phase, idx) => (
                  <div key={idx} className="border-l-4 border-gray-300 pl-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-gray-900">{phase.phase}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{phase.duration}</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {phase.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Credentials */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Required Credentials</h3>
              <div className="space-y-3">
                {pathway.requiredCredentials.map((cred, idx) => (
                  <div key={idx} className="border border-gray-200 p-3 rounded">
                    <div className="font-semibold text-sm text-gray-900 mb-1">{cred.name}</div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Timeline: {cred.timeline}</span>
                      <span>Cost: {cred.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Family Impact */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Family Impact</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Commitment:</span>
                  <span className="font-medium text-gray-900">{pathway.familyImpact.timeCommitment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Flexibility:</span>
                  <span className="font-medium text-gray-900">{pathway.familyImpact.flexibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stability:</span>
                  <span className="font-medium text-gray-900">{pathway.familyImpact.stability}</span>
                </div>
                <p className="text-gray-600 mt-2 pt-2 border-t border-gray-200">{pathway.familyImpact.notes}</p>
              </div>
            </div>

            {/* Why This Path */}
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-400">
              <h3 className="font-semibold text-gray-900 mb-2">Why This Path?</h3>
              <p className="text-sm text-gray-700">{pathway.whyThisPath}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-2">Ready to Take the Next Step?</h3>
        <p className="mb-4">Save these pathways and discuss them with a career counselor or mentor. Each path is designed specifically for your background and goals.</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            Print / Save as PDF
          </button>
          <button
            onClick={onStartOver}
            className="px-6 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900"
          >
            Generate New Pathways
          </button>
        </div>
      </div>
    </div>
  );
}
